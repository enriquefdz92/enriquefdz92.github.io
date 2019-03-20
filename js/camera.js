
var str;
function tomarFoto(){
// Grab elements, create settings, etc.
var video = document.getElementById('video');

// Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        //video.src = window.URL.createObjectURL(stream);
        str =stream;
        video.srcObject = stream;
        video.play();
    });
}

// Elements for taking the snapshot
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var video = document.getElementById('video');
var foto = document.getElementById('NewUserPic');
var modal =document.getElementById("CameraModal");
// Trigger photo take
document.getElementById("snap").addEventListener("click", function() {
    context.drawImage(video,  100, 20,   // Start at 70/20 pixels from the left and the top of the image (crop),
    400, 400,   // "Get" a `50 * 50` (w * h) area from the source image (crop),
    0, 0,     // Place the result at 0, 0 in the canvas,
    400, 400);
    foto.src= canvas.toDataURL();
vidOff() 
    modal.style.display="none";
});

document.getElementById("Camcancel").addEventListener("click", function() {
    modal.style.display="none";
    foto.src="img/standarPlayer.png";
    vidOff() 
});

modal.style.display="block"
 
}


function vidOff() {
    //clearInterval(theDrawLoop);
    //ExtensionData.vidStatus = 'off';
    video.pause();
    video.src = "";
    str.getTracks()[0].stop();
  }

