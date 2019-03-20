/* MODAL Usuarios */
var spanRules = document.getElementsByClassName("closeUsersModal")[0];
var UsersModal = document.getElementById('UsersModal');

var UserSelect = document.getElementById('UserSelect');
var UserAdd = document.getElementById('UserAdd');

var UserModalselect1 = document.getElementById('UserModal-selected1');
var UserModalselect2 = document.getElementById('UserModal-selected2');

var UserModalPic1 = document.getElementById('UsersModal_Pic1');
var UserModalPic2 = document.getElementById('UsersModal_Pic2');

resetUsersModal();

function resetUsersModal() {
    UserSelect.style.display = "block";
    UserAdd.style.display = "none";
    document.getElementById('newUserName').value="";
    document.getElementById('newUserName').focus();
    document.getElementById('newUserPicFile').value="";
    document.getElementById('NewUserPic').src="img/standarPlayer.png";
}
updateSelectedUsers();

function updateSelectedUsers() {
    UserModalselect1.innerHTML = setUsersModalValues(1);
    UserModalselect2.innerHTML = setUsersModalValues(2);
}

function showNewUserForm() {
    UserSelect.style.display = "none";
    UserAdd.style.display = "block";
}

window.onclick = function (event) {
    if (event.target == UsersModal) {
        UsersModal.style.display = "none";
        iniciarPartida();
    }
    if (event.target == creditosModal) {
        creditosModal.style.display = "none";
    }
    if (event.target == RulesModal) {
        RulesModal.style.display = "none";
    }
    if (event.target == winnerModal) {
        winnerModal.style.display = "none";
    }
}

function modalJugadores() {
    resetUsersModal();
    UsersModal.style.display = "block";
}
spanRules.onclick = function () {
    UsersModal.style.display = "none";
}


function setUsersModalValues(splayer) {
    var selectedPlayerID = splayer == 1 ? playerID1 : playerID2;
    var img = splayer == 1 ? UserModalPic1 : UserModalPic2;
    var html = "";
    var playersOrdenado = sortByKey(players,"nombre","desc");
    for (var i = 0; i < playersOrdenado.length; i++) {
        var player = playersOrdenado[i];
        if(splayer==1){
            if(player.id != playerID2){
                if (selectedPlayerID == player.id) {
                    html += '<option value="' + player.id + '" selected>' + player.nombre + '</option>';
                    img.setAttribute('src', player.foto);
                } else {
                    html += '<option value="' + player.id + '">' + player.nombre + '</option>';
                }
            }
        }
        if(splayer==2){
            if(player.id != playerID1){
                if (selectedPlayerID == player.id) {
                    html += '<option value="' + player.id + '" selected>' + player.nombre + '</option>';
                    img.setAttribute('src', player.foto);
                } else {
                    html += '<option value="' + player.id + '">' + player.nombre + '</option>';
                }
            }
        }

    }
    return html;
}
function select1() {
    var x = UserModalselect1.value;
    playerID1 = parseInt(x);
    updateSelectedUsers();
    
}
function select2() {
    var x = UserModalselect2.value;
    playerID2 = parseInt(x);
    updateSelectedUsers();
}
function onFileSelected(event) {
    var selectedFile = event.target.files[0];
    var reader = new FileReader();
    var imgtag = document.getElementById("NewUserPic");
    imgtag.title = selectedFile.name;
    reader.onload = function(event) {
      imgtag.src = event.target.result;
    };
    reader.readAsDataURL(selectedFile);
  }
  function saveNewUser(){
    var nombre= document.getElementById('newUserName').value;
    var foto =   document.getElementById("NewUserPic").src;
    if(nombre.trim() !=""){
        var usuarioNuevo={};
        usuarioNuevo.nombre = nombre;
        var l = sortByKey(players,"id","asc")[0].id + 1;
        usuarioNuevo.id=l;
        playerID2=l;
        usuarioNuevo.foto=foto;
        usuarioNuevo.wins=0;
        players.push(usuarioNuevo);
        updateSelectedUsers();
        resetUsersModal();
    }else{
        alert("Ingresa un nombre");
    }
}