const Jimp = require('jimp');
const fs = require('fs');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');


let albums = {};
// const r1 = readline.createInterface({ input, output });
// inputLoop();

function CreateNewAlbum(albumName)
{
  if (albums[albumName] == null) { 
    albums[albumName] = {}; 
    albums[albumName].processedImages = new Set();
    albums[albumName].images = [];
    console.log("album created");
    return "album created";
  }
  else { 
    console.log("[ERR] album already exists"); 
    return "[ERR] album already exists";
  }
}

async function AddImagesToAlbum(albumName, files)
{
    await processImages(albums[albumName], files).then(() => { console.log(albums[albumName].processedImages)});
}

function deleteImagesFromAlbum(albumName, imageList)
{
  if (albums[albumName] == null) { console.log("[ERR] album does not exist"); return "[ERR] album does not exist"; }
  for (let i = 0; i < imageList.length; i++) {
    albums[albumName].processedImages.delete(imageList[i]);
  }
  for (let i = 0; i < albums[albumName].images.length; i++) {
    if (imageList.includes(albums[albumName].images[i].pathOrigin))
    {
      albums[albumName].images.splice(i,1);
      i--;
    }
  }
}

async function processImages(album,folder) {
  for (let i = 0; i < folder.length; i++) {
    if (album.processedImages.has(folder[i])) 
    { 
      console.log("already processed" +  folder[i]); 
      continue; 
    }
    await Jimp.read(folder[i])
    .then((result) => {
      result.pathOrigin = folder[i];
      result.duplicates = new Set();
      result.isDuplicate = false;
      album.processedImages.add(result.pathOrigin);
      album.images.push(result
      .resize(512, 512))
    })
    .catch((err) => {
      console.error(err);
    });
  }
} 

function comparePhotosArray(images) {
  
for (var i = 0; i < images.length - 1; i++) {
   for (var j = i+1; j < images.length; j++) {
     if (images[i].isDuplicate || images[j].isDuplicate) continue;
     comparePhotos(images[i], images[j]);
   }
 }
}

async function comparePhotos(img1, img2)
{
  var distance = Jimp.distance(img1, img2); // perceived distance
  var diff = Jimp.diff(img1, img2); // pixel difference
  if ((distance < 0.15 && diff.percent < 0.4) || diff.percent < 0.05) {
    img1.duplicates.add(img2.pathOrigin);
    img2.isDuplicate = true;
  }
}

async function inputLoop(){
  r1.question("\nUse: \n  'create'  -> create new album \n  'add'     -> add images to album\n  'compare' -> find duplicates in album\n\n>> ", answer => { 
    if (answer == 'create'){
      r1.question("album Name: ", albumName => {
        CreateNewAlbum(albumName);
        inputLoop();
      });
    }
    else if (answer == 'add'){
        r1.question("album Name: >> ", albumName => {
            r1.question("Images folder: >> ", images => {
              AddImagesToAlbum(albumName, images).then(() => { inputLoop(); });
              
            });
        });
      }
      else if (answer == 'compare'){
        r1.question("album Name: >> ", albumName => {
          comparePhotosArray(albums[albumName].images);
          console.log("Duplicate groups: ");
          let duplicates = [];
          for (let i = 0; i < albums[albumName].images.length; i++) {
            if (albums[albumName].images[i].duplicates.size == 0) continue;
            console.log("\n");
            console.log(albums[albumName].images[i].pathOrigin);
            let dupes_group = [];
            dupes_group.push(albums[albumName].images[i].pathOrigin);
            for (const el of albums[albumName].images[i].duplicates) 
            {
              console.log(el);
              dupes_group.push(el);
            }
            return dupes_group;
          }
          inputLoop();
        });
      }
    else inputLoop();
    });
}



module.exports =  {albums, CreateNewAlbum, AddImagesToAlbum, comparePhotosArray, comparePhotos, deleteImagesFromAlbum};