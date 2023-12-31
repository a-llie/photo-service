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
    albums[albumName].lastIndex = 0;
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
      result.index = album.lastIndex;
      album.lastIndex = result.index + 1;
      album.processedImages.add(result.pathOrigin);
      album.images.push(result
      .resize(512, 512))
    })
    .catch((err) => {
      console.error(err);
    });
  }
} 

function comparePhotosArray(images, similarityThreshold = 0.15) {
  
for (var i = 0; i < images.length - 1; i++) {
   for (var j = i+1; j < images.length; j++) {
     if (images[i].isDuplicate || images[j].isDuplicate) continue;
     comparePhotos(images[i], images[j], similarityThreshold);
   }
 }
}

async function comparePhotos(img1, img2, similarityThreshold = 0.15)
{
  var distance = Jimp.distance(img1, img2); // perceived distance
  var diff = Jimp.diff(img1, img2); // pixel difference
  let orPercentDiff = 0.0499;
  let andPercentDiff = 0.399;
  if (similarityThreshold === 0.0 )
  {
    orPercentDiff = 0.0;
    andPercentDiff = 0.0;
  }
  if ((distance <= similarityThreshold && diff.percent <= andPercentDiff) || diff.percent <= orPercentDiff) {
    img1.duplicates.add(img2.pathOrigin);
    img2.isDuplicate = true;
  }
}


module.exports =  {albums, CreateNewAlbum, AddImagesToAlbum, comparePhotosArray, comparePhotos, deleteImagesFromAlbum};