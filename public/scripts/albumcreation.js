let albumPhotoArray = [];
let selectedPhotos = [];
let albumName = document.getElementsByClassName('titlebar')[0].getElementsByTagName('h1')[0].innerHTML;
let place = `${location.protocol}//${location.hostname}${(location.port)?`:${location.port}`:''}`;

function getSelectedPhotos() {
    const selectedPhotoElements = document.querySelectorAll('.photo');
    selectedPhotoElements.forEach(photoDiv => {
        photoDiv.addEventListener('click', () => {
            img = photoDiv.getElementsByTagName('img')[0];
            img.style.borderRadius = "30px";
            img.style.border = "green";
            
            imgSrc = img.src;
            console.log(imgSrc);
            if(!selectedPhotos.includes(imgSrc)) {
                selectedPhotos.push(imgSrc); 
            }
            console.log(selectedPhotos);
        }
    )
} )
}

document.getElementById('addPhotosButton').addEventListener('click', (e)=>{
    console.log("add button event listener triggered");
    console.log("album name: ", albumName);
    getSelectedPhotos();
}
)