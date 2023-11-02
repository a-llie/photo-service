let albumPhotoArray = [];
let selectedPhotos = [];
let albumName = document.getElementById("Title").innerText;

function handleGalleryPhotoSelection(element){
    element.classList.toggle("selected");
}

function addImagesRequest(){
    let photosToAdd=[];
    let gallery = document.getElementById("photogallery");
    for(var i = 0; i < gallery.querySelectorAll("div").length; i++){
        if(gallery.querySelectorAll("div")[i].classList.contains("selected")){
            let path = '../public/';
            path += gallery.querySelectorAll("div")[i].querySelectorAll("p")[0].innerText;
            photosToAdd.push(path)
        }
    }
    console.log(photosToAdd)

    let object = {};
    object.albumName = albumName;
    object.images = photosToAdd;

    let xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
  		if(this.readyState==4){
            if(this.status==200){
                alert("Added images successfully.");
                location.reload(); //reloads the page
            }
            else{
                alert("There was a problem with the server. Try again.");
                location.reload();
            }
  		}
  	};
  	xhttp.open("POST", "/album", true);
  	xhttp.setRequestHeader("Content-Type", "application/json");
  	xhttp.send(JSON.stringify(object));
}


function alertFeedback(element){
    if(element.id = "button-emailladdress"){
        alert("Invite sent successfully.")
    }
    else if(element.id = "button-copylink"){
        alert("Link copied successfully.")
    }
    else if(element.id = "button-download"){
        alert("Download started successfully.")
    }
    else{
        alert("Album purchased.")
    }
}

function sendReorderedArray(){
    albumPhotoArray = [];
    let photoDivs = [];
    photoDivs = document.getElementById("albumphotos").querySelectorAll("li");
    console.log(document.getElementById("albumphotos"));

    for(var i = 0; i < photoDivs.length; i++){
        albumPhotoArray.push(photoDivs[i].querySelectorAll("div")[0].querySelectorAll("p")[0].innerText);
    }
    
    console.log(albumPhotoArray);
}

function deleteImage(){
    let photoID = document.getElementById("expandedimagelabel");
    
    let object = {};
    object.albumName = albumName;
    object.images = [photoID];

    let xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
  		if(this.readyState==4){
            if(this.status==200){
                alert("Deleted image successfully.");
                location.reload(); //reloads the page
            }
            else{
                alert("There was a problem with the server. Try again.");
                location.reload();
            }
  		}
  	};
  	xhttp.open("DELETE", "/album", true);
  	xhttp.setRequestHeader("Content-Type", "application/json");
  	xhttp.send(JSON.stringify(object));
}

function expandImage(element){
    console.log("Image expanded.")
    document.getElementById("expandedimage").setAttribute("src", element.querySelectorAll("div")[0].querySelectorAll("img")[0].getAttribute("src"));
    document.getElementById("expandedimagelabel").textContent = element.querySelectorAll("div")[0].querySelectorAll("p")[0].textContent;
}

function sendFacesRequest(){
    //insert HTTP request

    //this shows the modal that needs the faces
    var element = document.getElementById("displayFaces");

    var modal = new bootstrap.Modal(element);
    modal.show();
}
