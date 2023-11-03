const express = require('express');
const { render } = require('pug');
const session = require('express-session');
const fs = require('fs');
const port = 3000;
var bodyParser = require('body-parser');
let app = express();
const spawn = require('child_process').spawn;
const {albums, CreateNewAlbum, AddImagesToAlbum, comparePhotosArray, comparePhotos, deleteImagesFromAlbum} = require('./imageCompare.js');

function User_FindFacesInPhoto(req,res,next)
{
    let image = req.query.image;
    if (image == null)
    {
        renderError(req,res,next, "No image provided", 404);
        console.log("No image provided");
        return;
    }
    var response;
    const python = spawn('python', ['imageCompare.py', 'faces_in_image', image]);
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        response = data.toString();
    });
    python.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    // send data to browser
    console.log(response);

    response = response.replace(/'/gm, '"');
    response = JSON.parse(response);
    res.send(response);
 });
}

function User_FindPhotosOfPerson(req,res,next)
{
    let image = req.query.image;
    let source_image = req.query.source_image;
    let folder = req.query.albumName;
    var response;

    console.log("image: " + image);
    console.log("source_image: " + source_image);
    console.log("folder: " + folder);

    if (image == null || source_image == null || folder == null)
    {
        res.status(404).send("Criteria not provided: image, source_image, album");
        return;
    }

    //let folder_images = Array.from(albums[folder].processedImages);
    const python = spawn('python', ['imageCompare.py', 'find_photos_of_person', image, source_image]);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        response = data.toString();
        console.log(response);
    });
    python.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        console.log(response);
        // send data to browser
        if (response === "[]" || response === undefined)
        {
            res.status(404).send("No photos found");
            return;
        }
        response = response.replace(/'/gm, '"');
        response = JSON.parse(response);
        AddImagesToAlbum(req.query.albumName, response);
        res.status(200).send("Images added to album.");
 });
}


server();

function server(){

    app.use(session({
        secret:  'some secret here', 
        cookie: {maxAge:500000},
        resave: true,
        saveUninitialized: true
    })); 
    
    app.set("view engine", "pug");
    app.use(express.static('public'));
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(express.urlencoded({ extended: true }));

    app.get("/", render_homepage);
    app.get("/login", render_login);
    app.get("/signup", render_signup);
    app.get("/dashboard",  render_dashboard);
    app.get("/album/:albumName",  render_album);
    app.get("/albumCreation",  render_albumCreation);
    app.post("/duplicates/:albumName", User_FindDuplicates);

    app.get("/faces", User_FindFacesInPhoto);
    app.get("/personPhotos", User_FindPhotosOfPerson);

    app.post("/login", User_Login, render_dashboard);
    app.post("/create", User_CreateNewAlbum, render_albumCreation);
    app.post("/album", User_AddImagesToAlbum);
    app.post("/album/:albumName", User_ChangeAlbumName);
    
    app.delete("/album", User_DeleteImages, images_delete_response);

    app.use(renderError);
    app.listen(port);

    console.log("Listening on port 3000");
}

function User_Login(req,res,next)
{
    if(req.body.username == null)
    {
        renderError(req,res,next, "No username provided", 404);
        return;
    }
    if(req.body.password == null)
    {
        renderError(req,res,next, "No password provided", 404);
        return;
    }

    if (req.session.loggedin) {
		next();
        return;
	}

    req.session.loggedin = true;
    next();
}

function User_CreateNewAlbum(req,res,next)
{
    // if (!req.session.loggedin) 
    // {
    //     res.redirect("/login");
    //     return;
    // }
    //options: "album created, album already exists"
    if (req.body.albumName == null) 
    { 
        renderError(req,res,next, "No album name provided", 404);
        return; 
    }

    result =  CreateNewAlbum(req.body.albumName);

    if (result == "[ERR] album already exists")
    {
        renderError(req,res,next, "album already exists", 404);
    }
    else
    {
        next();
    }
}

function User_ChangeAlbumName(req,res,next)
{
    if (decodeURIComponent(req.body.albumName) === decodeURIComponent(req.params.albumName))
    {
        res.status(200).redirect("/album/" + req.body.albumName);
        return;
    }

    let existing_keys = Object.keys(albums)
    for (key in existing_keys)
    {
        if (key.toLowerCase().localeCompare((decodeURIComponent(req.body.albumName)).toLowerCase()))
        {
            renderError(req,res,next, "album already exists", 404);
            return;
        }
    }

    albums[decodeURIComponent(req.body.albumName)] = {};
    albums[req.body.albumName] = albums[decodeURIComponent(req.params.albumName)];
    delete albums[decodeURIComponent(req.params.albumName)];
    res.status(200).redirect("/album/" + req.body.albumName);
}

async function User_AddImagesToAlbum(req,res,next)
{
    // if (!req.session.loggedin)
    // {
    //     res.redirect("/login");
    //     return;
    // }
    if (req.body.albumName == null) 
    { 
        renderError(req,res,next, "No album provided", 404);
        return; 
    }
    if (albums[req.body.albumName] == null) 
    {
        renderError(req,res,next, "No album with that name", 404);
        return; 
    }
    if (req.body.images == null) 
    { 
        renderError(req,res,next, "No images provided", 404);
        return; 
    }
    
    result =  await AddImagesToAlbum(req.body.albumName, req.body.images);
    res.status(200).send("Images Added");
    
}

function User_FindDuplicates(req,res,next)
{
    // if (!req.session.loggedin)
    // {
    //     res.redirect("/login");
    //     return;
    // }
    if (req.params.albumName == null) 
    { 
        renderError(req,res,next, "No album name provided", 404);
        return; 
    }
    req.body.similaritythresold = Number(req.body.similaritythresold);
    if (req.body.similaritythresold === null)
    {
        req.body.similaritythresold = 0.0;
    }
    if (req.body.similaritythresold === 100)
    {
        req.body.similaritythresold = 0.0;
    }
    if (req.body.similaritythresold > 85 && req.body.similaritythresold < 100)
    {
        req.body.similaritythresold = 0.15;
    }

    comparePhotosArray(albums[req.params.albumName].images, req.body.similaritythresold);

    console.log("Duplicate groups: ");
    let duplicates = [];
    let deletion = [];
    for (let i = 0; i < albums[req.params.albumName].images.length; i++) {
        if (albums[req.params.albumName].images[i].duplicates.size == 0) continue;
        console.log("\n");
        console.log(albums[req.params.albumName].images[i].pathOrigin);
        let dupes_group = [];
        dupes_group.push(albums[req.params.albumName].images[i].pathOrigin);
        for (const el of albums[req.params.albumName].images[i].duplicates) 
        {
            console.log(el);
            dupes_group.push(el);
            deletion.push(el);
        }
        duplicates.push(dupes_group);
    }
    deleteImagesFromAlbum(req.params.albumName, deletion);
    console.log(albums[req.params.albumName].processedImages);
    res.status(200).redirect("/album/" + req.params.albumName);
}

function User_DeleteImages(req,res,next)
{
    // if (!req.session.loggedin)
    // {
    //     res.redirect("/login");
    //     return;
    // }
    if (req.body.albumName == null) 
    { 
        renderError(req,res,next, "No album name provided", 404);
        return; 
    }
    if (req.body.images == null) 
    { 
        renderError(req,res,next, "No images provided", 404);
    }
    deleteImagesFromAlbum(req.body.albumName, req.body.images);
    console.log(albums[req.body.albumName].processedImages);
    next();
}


function images_delete_response(req,res,next)
{
    res.status(200).send("Images Deleted");
}

function render_login(req,res,next)
{
    res.status(200).render("login.pug");
    next();
}

function render_homepage(req,res,next)
{
    res.status(200).render("index.pug");
    next();
}

function render_dashboard(req,res,next)
{
    let albums_list = Object.keys(albums);
    let album_dict = [];
    for (let i = 0; i < albums_list.length; i++) {
        let album_entry = { name : albums_list[i], link : "/album/" + albums_list[i], cover : "emptyalbum.png"};
        if (albums[albums_list[i]].images.length > 0)
        {
            console.log(albums[albums_list[i]]);
            album_entry.cover = Array.from(albums[albums_list[i]].processedImages)[0].replace("./public", "");
        }
        
        album_dict.push(album_entry);
    }
    res.status(200).render("dashboard", {albums : album_dict});
}

function render_signup(req,res,next)
{
    res.status(200).render("signup");
}

function render_albumCreation(req,res,next)
{
    switch (req.headers.accept)
    {
           case "application/json":
            res.set('Content-Type', 'application/json').send("album created");
               break;
           default:
            res.status(200).redirect("/album/" + req.body.albumName);
               break;
    }
}


function render_album(req,res,next)
{
    // if (!req.session.loggedin) 
    // {
    //     res.redirect("/login");
    //     return;
    // }
    
    if (albums[req.params.albumName] == null)
    {
        renderError(req,res,next, "Album does not exist", 404);
        return;
    }
    let response = []; 
    let array = Array.from(albums[req.params.albumName].images);
    array = array.sort(( a, b) => {b.index - a.index}); 
    for (let i = 0; i < array.length; i++) {
        response.push(array[i].pathOrigin);
    }
    if (req.headers.accept === "application/json")
    {
        res.status(200).send(response);
        console.log(response);
        return;
    }
    for (let i = 0; i <response.length; i++) {
        response[i] = response[i].replace("./public", "");
    }
    let gallery_images = fs.readdirSync("./public/img");
    for (let i = 0; i <gallery_images.length; i++) {
        gallery_images[i] = "/img/" + gallery_images[i];
    }
    res.status(200).render("albumCreation", {album : response, albumName : req.params.albumName, gallery : gallery_images});
}

function renderError(req,res,next, errorMessage = "Invalid Request", errorCode = 404 ){ //return a page with error message
    switch (req.headers.accept)
    {
           case "application/json":
            res.set('Content-Type', 'application/json').status(errorCode).json({error: errorCode, message: errorMessage});
               break;
           default:
            res.status(errorCode).render("error", {error: errorCode, message: errorMessage});
               break;
    }
}