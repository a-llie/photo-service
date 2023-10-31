const express = require('express');
const { render } = require('pug');
const session = require('express-session');
const fs = require('fs');
const port = 3000;
var bodyParser = require('body-parser');
let app = express();
const {albumns, CreateNewAlbum, AddImagesToAlbum, comparePhotosArray, comparePhotos, deleteImagesFromAlbum} = require('./imageCompare.js');
let logged_in = false;


server();

function server(){

    app.use(session({
        secret:  'some secret here', 
        cookie: {maxAge:500000},  //the cookie will expire in 500 seconds
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
    app.get("/albumnCreation",  render_albumnCreation);

    app.post("/login", User_Login, render_dashboard);
    app.put("/albumn", User_CreateNewAlbum);
    app.post("/albumn", User_AddImagesToAlbum);
    app.delete("/duplicates", User_FindDuplicates);
    app.delete("/albumn", User_DeleteImages, images_delete_response);

    app.listen(port);

    console.log("Listening on port 3000");
}


function confirm_logged_in(req,res,next)
{
    if (req.session.loggedin) 
    {   
        next(); 
        return;
    } 
    res.redirect("/login");
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
    //options: "Albumn created, Albumn already exists"
    if (req.body.albumnName == null) 
    { 
        res.status(404).send("No albumn name provided"); 
        return; 
    }

    result =  CreateNewAlbum(req.body.albumnName);

    if (result == "[ERR] Albumn already exists")
    {
        res.status(404).send("Albumn already exists");
    }
    else
    {
        res.status(200).send("Albumn created");
    
    }
}

async function User_AddImagesToAlbum(req,res,next)
{
    if (req.body.albumnName == null) 
    { 
        res.status(404).send("No album provided"); 
        return; 
    }

    if (req.body.images == null) 
    { 
        res.status(404).send("No images provided"); 
        return; 
    }
    
    result =  await AddImagesToAlbum(req.body.albumnName, req.body.images);
    res.status(200).send("Images Added");
    
}

function User_FindDuplicates(req,res,next)
{
    if (req.body.albumnName == null) 
    { 
        res.status(404).send("No albumn name provided"); 
        return; 
    }
}

function User_DeleteImages(req,res,next)
{
    if (req.body.albumnName == null) 
    { 
        res.status(404).send("No albumn name provided"); 
        return; 
    }
    if (req.body.images == null) 
    { 
        res.status(404).send("No albumn name provided"); 
        return; 
    }
    //let delete_images = JSON.parse(req.body.images);
    console.log(req.body.albumnName);
    result = deleteImagesFromAlbum(req.body.albumnName, req.body.images);
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

function render_albumnCreation(req,res,next)
{
    res.status(200).render("albumncreation");
}

