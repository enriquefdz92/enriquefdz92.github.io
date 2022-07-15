var filteredClasses = [];
var ALL_CLASSES = [];
var AuthToken;
const urlParams = new URLSearchParams(window.location.search);
var coachid = urlParams.get('coachid');
const showAll = urlParams.get('show');
const AuthUrl = "https://enriquefdz92.github.io/js/key.txt";

function getClases(authKey) {
    ALL_CLASSES = [];
    $('#tdata').find('tr.classRow').remove();
    document.getElementById('accordion').innerHTML = "";
    var url = getApiURL();
    //url = "https://api.atomboxcrm.com/v1.9/classes/list?date=" + start;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("Authorization", authKey);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        $("#loader").hide();
        if (xhr.readyState === 4) {
            if (!(xhr.status === 200)) {
                document.getElementById('accordion').innerHTML = `
                <h3>El Token no ha sido actualizado</h3> 
                Intenta mas tarde </br></br>
                <button id="refresh-btn" type="button" class="btn btn-secondary">Reintentar</button>
                `;
                return;
            }
            var classes = JSON.parse(xhr.response.replace("\"lessons\":", "\"classes\":")).classes;
            if (classes.length == 0) return;
            classes.forEach(clas => {
                if (clas != undefined) ALL_CLASSES.push(clas);
            });
            loadData();
        }
        //    sort();
    };
    xhr.send();
}

function refreshClasses() {
    $("#loader").show();
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", AuthUrl);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                AuthToken = rawFile.responseText;
                getClases(AuthToken);
            }
        }
    }
    rawFile.send(null);
}


$(document).ready(function () {
    $(document).on('click','canvas',function(event){
        var data = JSON.parse(event.target.dataset.classData);
        var mainData = JSON.parse(event.target.parentNode.parentNode.dataset.classData);
        var i = 1;
        $('#modal-classDate').text(mainData.date.replace('<h5>',' ').replace('</h5>',''));
        $('#modal-coachName').text( mainData.coach);
        $('#bike-distribution > div * p').each(function() {
            this.innerHTML = '';
            data.forEach(e =>{
                if(e.id==i){
                    console.log(e);
                    this.innerHTML = capitalizeFirstLetter(e.user);
                }
            });
            i++;
        });
        $('#bike-distribution > div * img').each(function() {
            this.src = 'https://s3.amazonaws.com/atomboxcrm-images/members/defaultFace.png';
        });
        $("#modal-class-details").modal('show');
    });
    $(document).on('click', '.assistant-img', function (event) {
        document.getElementById('modal-assistant-name').innerHTML = event.target.dataset.name.split(' ')[0];
        document.getElementById('modal-assistant-img').src = event.target.src;
        $("#modal-assistant-detail").modal('show');
    });
    $('#inputState').on('change', function () {
        coachid = this.value;
        if (this.value == "Todos") coachid = null;
        loadData();
        sort();
    });
    $(document).on('click', '#refresh-btn', function (event) {
        document.getElementById('accordion').innerHTML = "";
        refreshClasses();
    });


    $(function () {
        $('input[name="daterange"]').daterangepicker({
            startDate: moment().startOf('week').add(1, 'day'),
            endDate: moment().endOf('week').add(1, 'day'),
            minDate: moment().subtract(1, 'month'),
            "locale": {
                "applyLabel": "Aplicar",
                "cancelLabel": "Cancelar",
                "firstDay": 1
            },
            opens: 'center'
        }, function (start, end, label) {

            console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
            refreshClasses();

        });
    });

    refreshClasses();
});

function resetWeek() {
    console.log(getApiURL());
    $('input[name="daterange"]').data('daterangepicker').setStartDate(moment().startOf('week').add(1, 'day'));
    $('input[name="daterange"]').data('daterangepicker').setEndDate(moment().endOf('week').add(1, 'day'));
    refreshClasses();
}

function getApiURL() {
    var startDate = $('input[name="daterange"]').data('daterangepicker').startDate.format('YYYY-MM-DD');
    var endDate = $('input[name="daterange"]').data('daterangepicker').endDate.format('YYYY-MM-DD');
    var url = `https://api.atomboxcrm.com/production/admin/classes/list?start=${startDate}&end=${endDate}&branch_id=&category_id=`;
    return url;
}

function loadData() {
    applyFilters();
    document.getElementById('accordion').innerHTML = "";
    if (wanted.length == 0) {
        $("#noelements").show();
    }
    var tempDate = '';
    var card;
    var classes = [];
    wanted.forEach(x => {
        var sDate = spanishDate(dateFromServer(x.start)).split('<')[0];
        if (tempDate != sDate) {
            tempDate = sDate;
            if (tempDate != '') {
                classes.push(sDate);
            }
        }
    });
    classes.forEach(cardDate => {
        var id;
        var clasesPorFecha = wanted.filter(x => {
            return spanishDate(dateFromServer(x.start)).startsWith(cardDate);
        });
        let value3 = clasesPorFecha[0].start.split(" ")[0].replace("-", "");
        var today = new Date();
        var headerClass = 'nullClass';
        if (today.setHours(0, 0, 0, 0) === dateFromServer(clasesPorFecha[0].start).setHours(0, 0, 0, 0)) {
            headerClass = 'todayHeader';
        }
        console.log(headerClass);
        var dataTable = createDataTable(clasesPorFecha);
        card = createNewCard(value3, cardDate, dataTable,headerClass);
        card.id = "card" + value3;
        document.getElementById('accordion').appendChild(card);
    });
}

function dataRow(x) {
    //ADDING COACH TO SELELECTOR
    var optionExists = ($('#inputState option[value="' + x.coach.id + '"]').length > 0);
    if (!optionExists) {
        $('#inputState').append("<option value='" + x.coach.id + "'>" + x.coach.name + "</option>");
    }
    var today = new Date();
    var classDate = dateFromServer(x.start);
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
    //a.href = "?coachid=" + x.coach.id;
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
    tdFecha.innerHTML = spanishDate(dateFromServer(x.start));

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
    Hth1.innerHTML = "<a>Coach</a>";
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
    var users = x.member_class;
    var colorsAssistencia = ['green','green','green','green','green','green','green','green','green','green','green','green','green','green','green'];
    var ul = document.createElement('ul');
    var li = document.createElement('li');
    ul.classList.add('list-group');
    ul.classList.add('ul-list');
    li.classList.add('list-group-item');
    li.classList.add('list-group-flush');
    if (users.length == 0 && x.capacity == 15) {
        li.classList.add('list-group-item-danger');
        li.innerHTML = "No hay asistentes";
    } else {
        li.classList.add('list-group-item-success');
        li.innerHTML = "Asistentes";
    }
    ul.appendChild(li);
    users.sort(function(a,b) {return a.ref - b.ref});
    var classObjectForCanvas = [];
    users.forEach(user => {
        if (user.status == 'canceled') return;

        var li = document.createElement('li');
        li.classList.add('list-group-item');

        var img = document.createElement('img');
        if (user.member_end == null) {
            user.member_end = {
                name: "",
                avatar_file_name: "undefined"
            };
        }
        if (user.member_end.avatar_file_name.includes("undefined") || user.member_end.avatar_file_name.includes("undefined")) {
            img.src = "https://s3.amazonaws.com/atomboxcrm-images/members/defaultFace.png"
        } else {
            img.src = "https://s3.amazonaws.com/atomboxcrm-images/members/" + user.member_end.avatar_file_name.replace("members/", "");
        }

        img.classList.add('assistant-img');
        img.dataset.name = user.name;
        var DivImg = document.createElement('div');
        DivImg.classList.add('thumbnail');
        DivImg.appendChild(img);
        var DivName = document.createElement('div');
        DivName.innerHTML = capitalizeFirstLetter(user.member_end.name);
        var DivBiciID = document.createElement('div');
        DivBiciID.innerHTML = `#` + user.ref;
        colorsAssistencia[user.ref -1] = 'red';
        classObjectForCanvas.push({"user":user.member_end.name,"id": user.ref,"img": img.src});
        var container = document.createElement('div');
        container.classList.add('container');
        var row = document.createElement('div');
        row.classList.add('row');
        var col2 = document.createElement('div');
        col2.classList.add('col-3');
        col2.appendChild(DivImg);
        var col10 = document.createElement('div');
        col10.classList.add('col-6');
        col10.classList.add('list-assistant');
        col10.appendChild(DivName);

        var col3 = document.createElement('div');
        col3.classList.add('col-3');
        col3.classList.add('list-assistant');
        col3.appendChild(DivBiciID);

        row.appendChild(col2);
        row.appendChild(col10);
        row.appendChild(col3);
        container.appendChild(row);
        li.appendChild(container);
        li.id = "assistant-li";
        ul.appendChild(li);
    });
    for (let i = 0; i < 15 - x.capacity; i++) {
        var empty_user = document.createElement('li');
        empty_user.classList.add('list-group-item');
        empty_user.classList.add('list-group-flush');
        empty_user.innerHTML = `<div class="container"><div class="row"><div class="col-3"><div class="thumbnail"><img src="https://s3.amazonaws.com/atomboxcrm-images/members/defaultFace.png" class="assistant-img" data-name="No Registrado"></div></div><div class="col-6 list-assistant"><div> No Registrado</div></div><div class="col-3 list-assistant"><div>?</div></div></div></div>`;
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

    var listAndChartContainer =  document.createElement('div');
    listAndChartContainer.classList.add('container');
    var row = document.createElement('div');
    row.classList.add('row');
    var chartCol = document.createElement('div');
    row.dataset.classData = `{"coach": "${x.coach.name}" , "date" : "${spanishDate(dateFromServer(x.start))}" }`;
    chartCol.classList.add('col-12');
    chartCol.classList.add('col-md-4');
    chartCol.appendChild(createNewCanvas(colorsAssistencia,classObjectForCanvas));
    var listCol = document.createElement('div');
    listCol.classList.add('col-12');
    listCol.classList.add('col-md-8');
    listCol.appendChild(ul);

    row.appendChild(chartCol);
    row.appendChild(listCol);
    listAndChartContainer.appendChild(row);

    accordianDiv.appendChild(listAndChartContainer);
    td.appendChild(accordianDiv);
    tr.appendChild(td);
    return tr;
}
function createNewCanvas(colors,classObjectForCanvas){
    var canvas = document.createElement('canvas');
    canvas.dataset.classData = JSON.stringify(classObjectForCanvas) ;
    canvas.width = 160;
    canvas.height = 160;
    var context = canvas.getContext('2d');
    var centerX = 30;
    var centerY = 10;
    var radius = 10;
    var XFactor = 4;
    var YFactor = 4;
    var asistencia = colors;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[0];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[1];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[2];
    context.fill();

    centerY = centerY + radius*YFactor;
    centerX = 10;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[3];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[4];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[5];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[6];
    context.fill();

    centerY = centerY + radius*YFactor;
    centerX = 10;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[7];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[8];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[9];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[10];
    context.fill();

    centerY = centerY + radius*YFactor;
    centerX = 10;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[11];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[12];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[13];
    context.fill();
    centerX = centerX + radius*XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[14];
    context.fill();
    return canvas;
}

function createNewCard(id, Htitle, bodyContent,todayHeader) {
    var card = document.createElement('div');
    card.classList.add('card');
    var cardHeader = document.createElement('div');
    cardHeader.id = 'heading' + id;
    cardHeader.classList.add('card-header');
    var title = document.createElement('h5');
    title.classList.add('mb-0');
    var button = document.createElement('button');
    button.classList.add(todayHeader);
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
