var filteredClasses = [];
var ALL_CLASSES;

function getClases(start, end, authKey, order) {
    $('#tdata').find('tr.classRow').remove();
    var url = "https://api.atomboxcrm.com/production/landing/lessons?key=moove_indoor";


    url = "https://api.atomboxcrm.com/v1.9/classes/list?date=" + start;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("Authorization", authKey);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        $("#loader").hide();
        if (xhr.readyState === 4) {
            if (!(xhr.status === 200)) {
                document.getElementById('accordion').innerHTML = '<h3>El Token no ha sido actualizado</h3> Intenta mas tarde';
                return;
            }
            ALL_CLASSES = JSON.parse(xhr.response.replace("\"lessons\":", "\"classes\":"));
            applyFilters();
            if (wanted.length == 0) {
                $("#noelements").show();
            }
            var tempDate = '';
            var card;
            var classes = [];
            wanted.forEach(x => {
                var sDate = spanishDate(dateFromServer(x.start_at)).split('<')[0];
                if (tempDate != sDate) {
                    tempDate = sDate;
                    if (tempDate != '') {
                        classes.push(sDate);
                    }
                }
            });
            classes.forEach(cardDate => {
                var clasesPorFecha = wanted.filter(x => spanishDate(dateFromServer(x.start_at)).startsWith(cardDate));
                let value3 = Math.floor(Math.random() * 100);
                var dataTable = createDataTable(clasesPorFecha);
                card = createNewCard(value3, cardDate, dataTable);
                card.id = "card" + order;
                document.getElementById('accordion').appendChild(card);
            });

        }
        sort();
    };
    xhr.send();
}

function dataRow(x) {
    var today = new Date();
    var classDate = dateFromServer(x.start_at);
    var tr = document.createElement('tr');
    tr.classList.add("classRow");
    tr.classList.add('accordion-toggle');
    tr.dataset.toggle = 'collapse';
    tr.dataset.target = '#lista' + x.id;
    if (today.setHours(0, 0, 0, 0) === classDate.setHours(0, 0, 0, 0)) {
        tr.classList.add("active-row");
    }

    var tdCoach = document.createElement('td');
    var a = document.createElement('a');
    a.href = "?coachid=" + x.coach.id;
    var foto = document.createElement('img');
    foto.id = "coach-img";
    foto.src = "img/coaches/" + x.coach.name.replace(" ", "") + ".jpg";
    var fotoDiv = document.createElement('div');
    fotoDiv.appendChild(foto);
    var nombre = document.createElement('div');
    nombre.classList.add('coachname');
    nombre.innerHTML = x.coach.name;

    tdCoach.appendChild(fotoDiv);
    a.appendChild(nombre);
    tdCoach.appendChild(a);

    var tdFecha = document.createElement('td');
    tdFecha.id = "date";
    tdFecha.innerHTML = spanishDate(dateFromServer(x.start_at));

    var tdRegistrados = document.createElement('td');
    tdRegistrados.classList.add("disponibilidad");
    if (x.available_capacity < 15) {
        tdRegistrados.classList.add("active-class");
    }
    tdRegistrados.innerHTML = "<h2>" + (15 - x.available_capacity) + "</h2>";
    tr.appendChild(tdCoach);
    tr.appendChild(tdFecha);
    tr.appendChild(tdRegistrados);
    return tr;
}

function createDataTable(data) {
    var table = document.createElement('table');
    table.classList.add("table");
    table.classList.add("table-responsive");
    table.classList.add("sortable");
    table.classList.add("styled-table");
    table.classList.add("centered-cell");
    var thead = document.createElement('thead');
    var Htr = document.createElement('tr');
    var Hth1 = document.createElement('th');
    var Hth2 = document.createElement('th');
    var Hth3 = document.createElement('th');
    Hth1.classList.add("centered-cell");
    Hth1.innerHTML = "<a href=\"?all\">Coach</a>";
    Htr.appendChild(Hth1);
    Hth2.classList.add("centered-cell");
    Hth2.innerHTML = "<a href=\"?show='all'\">Fecha</a>";
    Htr.appendChild(Hth2);
    Hth3.classList.add("centered-cell");
    Hth3.innerHTML = "<a href=\"#\">Registrados</a>";
    Htr.appendChild(Hth3);
    thead.appendChild(Htr);
    table.appendChild(thead)
    var tbody = document.createElement('tbody');

    data.forEach(x => {
        tbody.appendChild(dataRow(x));
        tbody.appendChild(getUsersList(x));

    });
    table.appendChild(tbody);


    return table;
}

function getUsersList(x) {
    var classID = x.id;
    var users = x.assistants;
    var ul = document.createElement('ul');
    var li = document.createElement('li');
    ul.classList.add('list-group');
    ul.classList.add('ul-list');
    li.classList.add('list-group-item');
    li.classList.add('list-group-flush');
    if (users.length == 0) {
        li.classList.add('list-group-item-danger');
        li.innerHTML = "No hay asistentes";
    } else {
        li.classList.add('list-group-item-success');
        li.innerHTML = "Asistentes";
    }
    ul.appendChild(li);
    users.forEach(user => {
        var li = document.createElement('li');
        li.classList.add('list-group-item');


        var img = document.createElement('img');
        if (user.avatar_file_name.includes("undefined") || user.avatar_file_name.includes("undefined")) {
            img.src = "https://s3.amazonaws.com/atomboxcrm-images/members/defaultFace.png"
        } else {
            img.src = "https://s3.amazonaws.com/atomboxcrm-images/members/" + user.avatar_file_name.replace("members/", "");
        }
        img.classList.add('assistant-img');
        img.dataset.name = user.name;
        var DivImg = document.createElement('div');
        DivImg.classList.add('thumbnail');
        DivImg.appendChild(img);
        var DivName = document.createElement('div');
        DivName.innerHTML = capitalizeFirstLetter(user.name);
        var container = document.createElement('div');
        container.classList.add('container');
        var row = document.createElement('div');
        row.classList.add('row');
        var col2 = document.createElement('div');
        col2.classList.add('col-4');
        col2.appendChild(DivImg);
        var col10 = document.createElement('div');
        col10.classList.add('col-8');
        col10.classList.add('list-assistant');
        col10.appendChild(DivName);
        row.appendChild(col2);
        row.appendChild(col10);
        container.appendChild(row);
        li.appendChild(container);
        li.id = "assistant-li";
        ul.appendChild(li);
    });
    for (let i = 0; i < 15 - x.capacity; i++) {
        var empty_user = document.createElement('li');
        empty_user.classList.add('list-group-item');
        empty_user.classList.add('list-group-flush');
        empty_user.innerHTML = "Usuario Reservador por internet";
        ul.appendChild(empty_user);
    }


    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan = 3;
    td.classList.add('hiddenRow');
    var accordianDiv = document.createElement('div');
    var accordianDiv = document.createElement('div');
    accordianDiv.classList.add('accordian-body');
    accordianDiv.classList.add('collapse');
    accordianDiv.id = "lista" + classID;
    accordianDiv.appendChild(ul);
    td.appendChild(accordianDiv);
    tr.appendChild(td);
    return tr;
}

function createNewCard(id, Htitle, bodyContent) {
    var card = document.createElement('div');
    card.classList.add('card');
    var cardHeader = document.createElement('div');
    cardHeader.id = 'heading' + id;
    cardHeader.classList.add('card-header');
    var title = document.createElement('h5');
    title.classList.add('mb-0');
    var button = document.createElement('button');
    button.classList.add('btn');
    button.dataset.toggle = 'collapse';
    button.dataset.target = '#collapse' + id;
    button.ariaExpanded = 'true';
    button.ariaControls = 'collapse' + id;
    button.innerHTML = Htitle;
    title.appendChild(button);
    cardHeader.appendChild(title);
    var cardColapse = document.createElement('div');
    cardColapse.id = 'collapse' + id;
    cardColapse.classList.add('collapse');
    cardColapse.classList.add('class-collapse');
    cardColapse.ariaLabeledby = 'heading' + id;
    cardColapse.dataset.parent = '#accordion';
    var cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.appendChild(bodyContent);
    cardColapse.appendChild(cardBody);
    card.appendChild(cardHeader);
    card.appendChild(cardColapse);
    return card;
}


function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var authKey = rawFile.responseText;
                for (let i = 0; i < 8; i++) {
                    getClases(getDate(i), getSunday(new Date()), authKey, i);
                }
            }
        }
    }
    rawFile.send(null);
}

readTextFile("https://enriquefdz92.github.io/js/key.txt");

$(document).ready(function () {
    $(document).on('click', '.assistant-img', function (event) {
        document.getElementById('modal-assistant-name').innerHTML = event.target.dataset.name;
        document.getElementById('modal-assistant-img').src = event.target.src;
        $("#modal-assistant-detail").modal('show');
    });

});