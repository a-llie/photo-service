const Jimp = require('jimp');
const fs = require('fs');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');


let albumns = {};

function CreateNewAlbum(albumnName)
{
  if (albumns[albumnName] == null) { 
    albumns[albumnName] = {}; 
    albumns[albumnName].processedImages = new Set();
    albumns[albumnName].images = [];
    console.log("Albumn created");
    return "Albumn created";
  }
  else { 
    console.log("[ERR] Albumn already exists"); 
    return "[ERR] Albumn already exists";
  }
}

async function AddImagesToAlbum(albumnName, imageList)
{
    var files = fs.readdirSync(imageList);
    await processImages(albumns[albumnName], files).then(() => { console.log(albumns[albumnName].processedImages)});
}

function deleteImagesFromAlbum(albumnName, imageList)
{
  if (albumns[albumnName] == null) { console.log("[ERR] Albumn does not exist"); return "[ERR] Albumn does not exist"; }
  for (let i = 0; i < imageList.length; i++) {
    albumns[albumnName].processedImages.delete(imageList[i]);
  }
  for (let i = 0; i < albumns[albumnName].images.length; i++) {
    if (imageList.includes(albumns[albumnName].images[i].pathOrigin))
    {
      albumns[albumnName].images.splice(i,1);
      i--;
    }
  }
}

async function processImages(albumn,folder) {
  for (let i = 0; i < folder.length; i++) {
    if (albumn.processedImages.has('./img/' + folder[i])) 
    { 
      console.log("already processed" + './img/' + folder[i]); 
      continue; 
    }
    await Jimp.read('./img/' + folder[i])
    .then((result) => {
      result.pathOrigin = './img/' + folder[i];
      result.duplicates = new Set();
      result.isDuplicate = false;
      albumn.processedImages.add(result.pathOrigin);
      albumn.images.push(result
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
      r1.question("Albumn Name: ", albumnName => {
        CreateNewAlbum(albumnName);
        inputLoop();
      });
    }
    else if (answer == 'add'){
        r1.question("Albumn Name: >> ", albumnName => {
            r1.question("Images folder: >> ", images => {
              AddImagesToAlbum(albumnName, images).then(() => { inputLoop(); });
              
            });
        });
      }
      else if (answer == 'compare'){
        r1.question("Albumn Name: >> ", albumnName => {
          comparePhotosArray(albumns[albumnName].images);
          console.log("Duplicate groups: ");
          let duplicates = [];
          for (let i = 0; i < albumns[albumnName].images.length; i++) {
            if (albumns[albumnName].images[i].duplicates.size == 0) continue;
            console.log("\n");
            console.log(albumns[albumnName].images[i].pathOrigin);
            let dupes_group = [];
            dupes_group.push(albumns[albumnName].images[i].pathOrigin);
            for (const el of albumns[albumnName].images[i].duplicates) 
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



module.exports =  {albumns, CreateNewAlbum, AddImagesToAlbum, comparePhotosArray, comparePhotos, deleteImagesFromAlbum};