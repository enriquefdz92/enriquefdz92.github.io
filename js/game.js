var turno = true;
var gameActive = true;
var playerID1 = 0;
var playerID2 = 1;
var filas = ["A", "B", "C", "D", "E", "F"];
var defaultPlayers = [{
        "id": 0,
        "nombre": "Player 1",
        "foto": "img/standarPlayer1.jpg",
        "wins": 0
    },
    {
        "id": 1,
        "nombre": "Player 2",
        "foto": "img/standarPlayer2.jpg",
        "wins": 0
    }
];

var players = (LSitemExist("players")) ? JSON.parse(LSget("players")) : defaultPlayers;

updateScore();
var table = document.getElementById('c4Table');
setCurrentPlayer(true);
setPrevisualizaciondeFicha();

function setCurrentPlayer(turno) {
    var p1 = playerID1;
    var p2 = playerID2;
    var playerID = (turno) ? p1 : p2;
    var currentPlayer = players.find(user => user.id === playerID);
    document.getElementById("currentPlayerName").innerHTML = currentPlayer.nombre;
    document.getElementById("profilePicture").setAttribute("src", currentPlayer.foto);
    document.getElementById("modalWinnerPicture").setAttribute("src", currentPlayer.foto);
    document.getElementById("modalWinnerMessage").innerHTML = "Felicidades " + currentPlayer.nombre;
}
table.onclick = function (event) {
    if (gameActive) {
        var target = event.target.closest('td');
        asignarFicha(target);
        isGameFinished();
        if (document.getElementById("A" + target.id.substr(1, 1)).dataset.value == -1) {
            previsualizarNewFicha(target);
        }
    }
};

function previsualizarNewFicha(t) {
    if (gameActive) {
        t = document.getElementById("h," + t.id.substr(1, 1))
        t.classList = "";
        clase = (turno) ? "singlefichaRoja" : "singlefichaVerde";
        t.classList.add(clase);
    }
}

function asignarFicha(td) {
    var ClickedROW = td.id.substr(1, 1);
    var nextEmptySpace = getNextEmptySpace(ClickedROW);
    var clase = "";
    if (nextEmptySpace == "") {
        return;
    }
    clase = (turno) ? "fichaRoja" : "fichaVerde";
    document.getElementById(nextEmptySpace).classList.remove("gameRow");
    document.getElementById(nextEmptySpace).classList.add(clase);
    document.getElementById(nextEmptySpace).dataset.value = turno;
    turno = !turno;
    setCurrentPlayer(turno);
}


function setPrevisualizaciondeFicha() {
    var tds = document.getElementsByTagName('td');
    for (var index = 0; index < tds.length; index++) {
        var thID = tds[index].id;
        document.getElementById(thID).onmouseover = function (event) {
            var target = event.target.closest('td');
            previsualizarFicha(target, true);
        };
        document.getElementById(thID).onmouseout = function (event) {
            var target = event.target.closest('td');
            previsualizarFicha(target, false);
        };
    };
}

function getNextEmptySpace(ClickedROW) {
    if (document.getElementById("A" + ClickedROW).dataset.value != -1) {
        return "";
    }
    for (var fila = 0; fila < filas.length; fila++) {
        var pos = filas[fila] + ClickedROW;
        var cel = document.getElementById(pos);
        if (cel.dataset.value != -1) {
            return filas[fila - 1] + ClickedROW;
        }
    }
    return "F" + ClickedROW;
}

function previsualizarFicha(td, stat) {
    if (gameActive) {
        var id = "h," + td.id.substr(td.id.length - 1);
        var lugar = document.getElementById(id);
        var clase = turno ? "singlefichaRoja" : "singlefichaVerde";
        (stat) ? lugar.classList.add(clase): lugar.classList = "";
    }
}

function resetTopRow() {
    for (var x = 1; x < 7; x++) {
        document.getElementById("h," + x).classList = "";
    }
}

function cLinea(a, b, c, d) {
    return ((a != "-1") && (a != "") && (a == b) && (a == c) && (a == d));
}

function cGanador(tablero) {
    var empate = 0;
    for (r = 0; r < 6; r++)
        for (c = 0; c < 7; c++)
            if (tablero[r][c] != "-1") {
                empate++;
            }


    for (r = 0; r < 3; r++)
        for (c = 0; c < 7; c++)
            if (cLinea(tablero[r][c], tablero[r + 1][c], tablero[r + 2][c], tablero[r + 3][c])) {
                changeWinnerFichas(r, c, "Horizontal");
                return tablero[r][c];
            }
    for (r = 0; r < 6; r++)
        for (c = 0; c < 4; c++)
            if (cLinea(tablero[r][c], tablero[r][c + 1], tablero[r][c + 2], tablero[r][c + 3])) {
                changeWinnerFichas(r, c, "Vertical");
                return tablero[r][c];
            }
    for (r = 0; r < 3; r++)
        for (c = 0; c < 4; c++)
            if (cLinea(tablero[r][c], tablero[r + 1][c + 1], tablero[r + 2][c + 2], tablero[r + 3][c + 3])) {
                changeWinnerFichas(r, c, "Derecha");
                return tablero[r][c];
            }
    for (r = 3; r < 6; r++)
        for (c = 0; c < 4; c++)
            if (cLinea(tablero[r][c], tablero[r - 1][c + 1], tablero[r - 2][c + 2], tablero[r - 3][c + 3])) {
                changeWinnerFichas(r, c, "Izquierda");
                return tablero[r][c];
            }

    if (empate == 42) {
        return -1;
    } else {
        return 0;
    }
}

function sum(a, b) {
    return a + b;
}

function changeWinnerFichas(r, c, type) {

    resetTopRow();
    var addclase = "";
    var f1, f2, f3, f4;
    f1 = document.getElementById(filas[r] + c);
    addclase = (!turno) ? "WinnerfichaRoja" : "WinnerfichaVerde";

    switch (type) {
        case "Horizontal":
            f2 = document.getElementById(filas[r + 1] + c);
            f3 = document.getElementById(filas[r + 2] + c);
            f4 = document.getElementById(filas[r + 3] + c);
            break;
        case "Vertical":
            f2 = document.getElementById(filas[r] + sum(c, 1));
            f3 = document.getElementById(filas[r] + sum(c, 2));
            f4 = document.getElementById(filas[r] + sum(c, 3));
            break;
        case "Derecha":
            f2 = document.getElementById(filas[r + 1] + sum(c, 1));
            f3 = document.getElementById(filas[r + 2] + sum(c, 2));
            f4 = document.getElementById(filas[r + 3] + sum(c, 3));
            break;
        case "Izquierda":
            f2 = document.getElementById(filas[r - 1] + sum(c, 1));
            f3 = document.getElementById(filas[r - 2] + sum(c, 2));
            f4 = document.getElementById(filas[r - 3] + sum(c, 3));
            break;

        default:
            break;
    }
    f1.classList = addclase;
    f2.classList = addclase;
    f3.classList = addclase;
    f4.classList = addclase;
}

function isGameFinished() {
    var x = [
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""]
    ];
    for (var r = 0; r < filas.length; r++) {
        for (var col = 1; col < 7; col++) {
            var cel = document.getElementById(filas[r] + col).dataset.value;
            x[r][col] = cel;
        }
    }
    var winner = cGanador(x);

    if (winner != "") {
        if(winner == -1){
            // EMPATEs
            var empateModal = document.getElementById('empateModal');
            empateModal.style.display="block";
            iniciarPartida();
            return;
        }
        var p1 = playerID1;
        var p2 = playerID2;
        winnerID = (winner == "true") ? p1 : p2;
        setCurrentPlayer(!turno);
        resetTopRow();
        addWin(winnerID)
        updateScore();
        gameActive = false;
        winnerModal.style.display = "block";
    }
}
function empateModalDismiss(){
    var empateModal = document.getElementById('empateModal');
    empateModal.style.display="none"; 
}

function addWin(WinnerID) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].id == WinnerID) {
            players[i].wins = players[i].wins + 1;
            break;
        }
    }

}

function iniciarPartida() {
    gameActive = true;
    turno = true;
    setCurrentPlayer(turno);
    var tds = document.getElementsByTagName("td");
    for (var index = 0; index < tds.length; index++) {
        var thID = tds[index].id;
        currentTD = document.getElementById(thID);
        if (currentTD.dataset.value != 'r') {
            currentTD.dataset.value = -1;
            currentTD.classList = 'gameRow';
        }
    }
}




var creditosModal = document.getElementById('CreditosModal');


function showCreditos() {
    creditosModal.style.display = "block";
}



var spanRules = document.getElementsByClassName("closeRulesModal")[0];
var RulesModal = document.getElementById('RulesModal');


function showReglas() {
    RulesModal.style.display = "block";
}
spanRules.onclick = function () {
    RulesModal.style.display = "none";
}



var winnerModal = document.getElementById('winnerModal');
var span = document.getElementsByClassName("closewinnerModal")[0];
span.onclick = function () {
    winnerModal.style.display = "none";
}


function updateScore() {
    p = sortByKey(players, "wins", "asc");
    var scoreList = document.getElementById("scoreList");
    var html = "";
    for (var i = 0; i < p.length; i++) {
        var sp = p[i];
        if (sp.wins > 0) {
            html += '<li><img class="scoreImg" src="' + sp.foto + '"/><h4> ' + sp.nombre + '</h4><break></break>Partidas Ganadas <br> ' + sp.wins + ' </li>'

        }
    }
    var scoreAside = document.getElementById('scores');
    if (html == "") {
        scoreAside.style.display = "none";
    } else {
        scoreList.innerHTML = html;
        LSsave('players', JSON.stringify(players));
        scoreAside.style.display = "block";
    }

}

function sortByKey(array, key, order = "desc") {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        if (order == "asc") {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        } else {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
    });
}

function saveNewUser() {
    var nombre = document.getElementById('newUserName').value;
    var foto = document.getElementById("NewUserPic").src;
    if (nombre.trim() != "") {
        var usuarioNuevo = {};
        usuarioNuevo.nombre = nombre;
        var l = sortByKey(players, "id", "asc")[0].id + 1;
        usuarioNuevo.id = l;
        usuarioNuevo.foto = foto;
        usuarioNuevo.wins = 0;
    } else {
        alert("Ingresa un nombre");
    }
}

function borrarScore() {
    for (var index = 0; index < players.length; index++) {
        players[index].wins = 0;
    }
    LSsave('players', JSON.stringify(players));
    updateScore();
    location.reload();
}