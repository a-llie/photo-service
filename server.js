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
    let image = req.body.image;
    if (image == null)
    {
        res.status(404).send("No image provided");
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
    res.send(response)
 });
}

function User_FindPhotosOfPerson(req,res,next)
{
    let image = req.body.image;
    let source_image = req.body.source_image;
    let folder = req.body.album;
    var response;

    if (image == null || source_image == null || folder == null)
    {
        res.status(404).send("Criteria not provided: image, source_image, album");
        return;
    }

    let folder_images =Array.from(albums[folder].processedImages);
    const python = spawn('python', ['imageCompare.py', 'find_photos_of_person', image, source_image, folder_images]);
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        response = data.toString();
    });
    python.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    // send data to browser
    res.send(response)
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

    app.get("/", render_dashboard);
    app.get("/login", render_login);
    app.get("/signup", render_signup);
    app.get("/dashboard",  render_dashboard);
    app.get("/albumCreation",  render_albumCreation);
    app.get("/duplicates", User_FindDuplicates);

    app.get("/faces", User_FindFacesInPhoto);
    app.get("/personPhotos", User_FindPhotosOfPerson);

    app.post("/login", User_Login, render_dashboard);
    app.put("/album", User_CreateNewAlbum);
    app.post("/album", User_AddImagesToAlbum);
    
    app.delete("/album", User_DeleteImages, images_delete_response);

    app.listen(port);

    console.log("Listening on port 3000");
}

function User_Login(req,res,next)
{
    if(req.body.username == null)
    {
        res.status(404).send("No username provided");
        return;
    }
    if(req.body.password == null)
    {
        res.status(404).send("No password provided");
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
    if (!req.session.loggedin) 
    {
        res.redirect("/login");
        return;
    }
    //options: "album created, album already exists"
    if (req.body.albumName == null) 
    { 
        res.status(404).send("No album name provided"); 
        return; 
    }

    result =  CreateNewAlbum(req.body.albumName);

    if (result == "[ERR] album already exists")
    {
        res.status(404).send("album already exists");
    }
    else
    {
        res.status(200).send("album created");
    
    }
}

async function User_AddImagesToAlbum(req,res,next)
{
    if (req.body.albumName == null) 
    { 
        res.status(404).send("No album provided"); 
        return; 
    }

    if (req.body.images == null) 
    { 
        res.status(404).send("No images provided"); 
        return; 
    }
    
    result =  await AddImagesToAlbum(req.body.albumName, req.body.images);
    res.status(200).send("Images Added");
    
}

function User_FindDuplicates(req,res,next)
{
    if (req.body.albumName == null) 
    { 
        res.status(404).send("No album name provided"); 
        return; 
    }
    comparePhotosArray(albums[req.body.albumName].images);

    console.log("Duplicate groups: ");
    let duplicates = [];
    for (let i = 0; i < albums[req.body.albumName].images.length; i++) {
        if (albums[req.body.albumName].images[i].duplicates.size == 0) continue;
        console.log("\n");
        console.log(albums[req.body.albumName].images[i].pathOrigin);
        let dupes_group = [];
        dupes_group.push(albums[req.body.albumName].images[i].pathOrigin);
        for (const el of albums[req.body.albumName].images[i].duplicates) 
        {
            console.log(el);
            dupes_group.push(el);
        }
        duplicates.push(dupes_group);
    }
      res.send(duplicates);
}

function User_DeleteImages(req,res,next)
{
    if (req.body.albumName == null) 
    { 
        res.status(404).send("No album name provided"); 
        return; 
    }
    if (req.body.images == null) 
    { 
        res.status(404).send("No images provided");
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

function render_dashboard(req,res,next)
{
    res.status(200).render("dashboard");
}

function render_signup(req,res,next)
{
    res.status(200).render("signup");
}

function render_albumCreation(req,res,next)
{
    res.status(200).render("albumcreation");
}


function postData(req,res,next) {
    $.ajax({
        type: "POST",
        url: "./imageCompare.py",
        data: { param: input },
        success: callbackFunc
    });
}
