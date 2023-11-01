let albumPhotoArray = [];
let selectedPhotos = [];
// let albumName = document.getElementsByClassName('titlebar')[0].getElementsByTagName('h1')[0].innerHTML;
let place = `${location.protocol}//${location.hostname}${(location.port)?`:${location.port}`:''}`;

function handleGalleryPhotoSelection(element){
    element.classList.toggle("selected");
}

function addImagesRequest(){
    let photosToAdd=[];
    let gallery = document.getElementById("photogallery");
    for(var i = 0; i < gallery.querySelectorAll("div").length; i++){
        console.log("index, div", i);
        if(gallery.querySelectorAll("div")[i].classList.contains("selected")){
            let path = '../public/';
            path += gallery.querySelectorAll("div")[i].querySelectorAll("p")[0].innerText;
            photosToAdd.push(path)
        }
    }
    console.log(photosToAdd)
    //insert http request to send

    // let xhttp = new XMLHttpRequest();
  	// xhttp.onreadystatechange = function() {
  	// 	if(this.readyState==4){
    //     if(this.status==200){
    //       alert("Added images successfully.);
    //       location.reload(); //reloads the page
    //     }
    //     else{
    //       alert("There was a problem with the server. Try again.");
    //       location.reload();
    //     }
  	// 	}
  	// };
  	// xhttp.open("PUT", "/albumname/"+userID+"/", true);
  	// xhttp.setRequestHeader("Content-Type", "application/json");
  	// xhttp.send(JSON.stringify(photosToAdd));
}

// //let albumPhotoArray = [];
// let selectedPhotos = [];
// //let albumName = document.getElementsByClassName('titlebar')[0].getElementsByTagName('h1')[0].innerHTML;
// let place = `${location.protocol}//${location.hostname}${(location.port)?`:${location.port}`:''}`;

// function getSelectedPhotos() {
//     const selectedPhotoElements = document.querySelectorAll('.photo');
//     selectedPhotoElements.forEach(photoDiv => {
//         photoDiv.addEventListener('click', () => {
//             img = photoDiv.getElementsByTagName('img')[0];
//             img.style.borderRadius = "30px";
//             img.style.border = "green";
            
//             imgSrc = img.src;
//             console.log(imgSrc);
//             if(!selectedPhotos.includes(imgSrc)) {
//                 selectedPhotos.push(imgSrc); 
//             }
//             console.log(selectedPhotos);
//         }
//     )
// } )
// }

// document.getElementById('addPhotosButton').addEventListener('click', (e)=>{
//     console.log("add button event listener triggered");
//     console.log("album name: ", albumName);
//     getSelectedPhotos();
// }
// )