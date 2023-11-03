let albumPhotoArray = [];
let selectedPhotos = [];
let selectedFaces = {}
let albumName = document.getElementById("Title").innerText;
let imagePath = './public/img/';

function handleGalleryPhotoSelection(element){
    console.log("Photo selåected.");
    element.classList.toggle("selected");
}

function addImagesRequest(){
    let photosToAdd=[];
    let gallery = document.getElementById("photogallery");
    for(var i = 0; i < gallery.querySelectorAll("div").length; i++){
        if(gallery.querySelectorAll("div")[i].classList.contains("selected")){
            let path = './public/img/';
            path += gallery.querySelectorAll("div")[i].querySelectorAll("p")[0].innerText;
            photosToAdd.push(path)
        }
    }
    console.log(photosToAdd)

    let object = {};
    object.albumName = albumName;
    object.images = photosToAdd;
    let spinner = document.getElementById("add-images-spinner");
    let add_button = document.getElementById("add-images-button");
    let close_button = document.getElementById("add-images-close-button");
    spinner.hidden = false;
    add_button.disabled = true;
    close_button.disabled = true;
    let xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
  		if(this.readyState==4){
            if(this.status==200){
                spinner.hidden = true;
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


function inviteSent(){
    alert("Invite sent successfully.")
}

function linkCopied(){
    alert("Link copied successfully.")

}

function download(){
    alert("Download started successfully.")

}

function purchase(){
    alert("Album purchased.")

}

function sendReorderedArray(){
    let albumPhotoArray = [];
    let photoDivs = [];
    photoDivs = document.getElementById("albumphotos").querySelectorAll("li");
    console.log(document.getElementById("albumphotos"));

    for (let i = 0; i < photoDivs.length; i++)
    {
        console.log("./public" + (photoDivs[i].firstChild.firstChild.src).replace("http://127.0.0.1:3000",""));
        albumPhotoArray.push("./public" + (photoDivs[i].firstChild.firstChild.src).replace("http://127.0.0.1:3000",""));
    }

    let object = {};
    object.albumName = document.getElementById("Title");
    object.images = albumPhotoArray;

    // let xhttp = new XMLHttpRequest();
  	// xhttp.onreadystatechange = function() {
  	// 	if(this.readyState==4){
    //         if(this.status==200){
    //         }
    //         else{
    //             //alert("There was a problem with the server. Try again.");
    //             //location.reload();
    //         }
  	// 	}
  	// };
  	// xhttp.open("POST", "/reorder", true);
  	// xhttp.setRequestHeader("Content-Type", "application/json");
  	// xhttp.send(JSON.stringify(object));
}

function deleteImage(){
    let photoID = document.getElementById("expandedimagelabel").innerText;
    
    let object = {};
    object.albumName = albumName;
    let image = imagePath+photoID;
    object.images = [image];
    console.log(image);
    console.log(object);

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
    document.getElementById("expandedimage").setAttribute("src", element.querySelectorAll("div")[0].querySelectorAll("img")[0].getAttribute("src"));
    document.getElementById("expandedimagelabel").textContent = element.querySelectorAll("div")[0].querySelectorAll("p")[0].textContent;
}

function searchPhotoForFaces(){
    let photoID = document.getElementById("expandedimagelabel").innerText;
    
    let image = imagePath+photoID;
    let query = "image="+image;


    let spinner = document.getElementById("find-faces-spinner");
    let find_button = document.getElementById("find-faces-button");
    spinner.hidden = false;
    find_button.disabled = true;

    let xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
  		if(this.readyState==4){
            if(this.status==200){
                spinner.hidden = true;
                find_button.disabled = false;
                var element = document.getElementById("displayFaces");
                var toPopulate = document.getElementById("displayFacesSelection");
                while (toPopulate.firstChild) {
                    toPopulate.removeChild(toPopulate.lastChild);
                }
                let dict = JSON.parse(xhttp.responseText);
                let paths = Object.keys(JSON.parse(xhttp.responseText));
                for (let i = 0; i <  paths.length; i++)
                {
                    var img = document.createElement("img");
                    img.src = paths[i].replace("./public", "");
                    img.alt = dict[paths[i]];
                    img.classList.add("photo");
                    img.onclick = function(){handleFaceSelection(this)};
                    toPopulate.appendChild(img);
                }
                var modal = new bootstrap.Modal(element);
                modal.show();
            }
            else{
                alert(this.responseText);
                location.reload();
            }
  		}
  	};
  	xhttp.open("GET", "/faces?" + query, true);
  	xhttp.setRequestHeader("Content-Type", "application/json");
  	xhttp.send(null);
    
    
}



function sendFacesRequest(){

    let spinner = document.getElementById("find-person-spinner");
    let find_button = document.getElementById("find-person-button");
    let close_button = document.getElementById("find-person-close-button");
    let albumName = document.getElementById("Title").innerText;
    spinner.hidden = false;
    find_button.disabled = true;
    close_button.disabled = true;

    let image = Object.keys(selectedFaces)[0];
    let source_image = selectedFaces[image];
    let query = "image="+image+"&source_image="+source_image+"&albumName="+albumName;

    let xhttp = new XMLHttpRequest();
  	xhttp.onreadystatechange = function() {
  		if(this.readyState==4){
            if(this.status==200){
                spinner.hidden = true;
                
                alert("Added images successfully.");
                location.reload();
            }
            else{
                alert("There was a problem with the server. Try again.");
                location.reload();
            }
  		}
  	};
  	xhttp.open("GET", "/personPhotos?" + query, true);
  	xhttp.setRequestHeader("Content-Type", "application/json");
  	xhttp.send(null);
}

function handleFaceSelection(element){
    let gallery = document.getElementById("displayFacesSelection");
    let children = gallery.children;
    for(var i = 0; i < children.length; i++){
        if(children[i].classList.contains("selected")){
            children[i].classList.toggle("selected");
        }
    }
    console.log("Photo selected.");
    element.classList.add("selected");  
    selectedFaces = {};
    selectedFaces["./public/" + (element.src).replace("http://127.0.0.1:3000/", "")] = element.alt;
}

