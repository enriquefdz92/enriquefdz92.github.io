var scorebtn = document.getElementById('scorebtn');
var scorebar =document.getElementById('scores');
scorebtn.addEventListener("click", function() {

    if (scorebar.style.display === "none") {
        scorebar.style.display = "block";
        hide();
      } else {
        scorebar.style.display = "none";
      }
    
});

function hide(){
    var size = scorebar.clientWidth;
    scorebar.clientWidth=0;
    var x=0;
    do {
        setTimeout(function(){ 
            scorebar.style.width = x+"px";
            console.log(x);
         }, 30);
        
            
            x++;
 
    } while (x<size);
  
   
}