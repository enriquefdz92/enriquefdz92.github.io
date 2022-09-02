if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ?
                args[number] :
                match;
        });
    };
}

var filteredClasses = [];
var ALL_CLASSES = [];
var CHART_DATA = {};
var refreshChartData = false;
var AuthToken;
const defaultFace = "https://s3.amazonaws.com/atomboxcrm-images/members/defaultFace.png";
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
            refreshChartData = true;
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
    $("#inputState").prop("selectedIndex", 0);
    coachid = null;
    CHART_DATA = {};
    refreshChartData = true;
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
    $(document).on('click', '.headerCount', function () {
        $('.headerCount > i').toggle();
        $('.headerCount > p').toggle();
        $('#accordion .class-collapse').collapse('show');
    });
    $(document).on('click', '.canvasDistribution', function (event) {
        var data = JSON.parse(event.target.dataset.classData);
        var mainData = JSON.parse(event.target.parentNode.parentNode.dataset.classData);
        var i = 15;
        $('#modal-classDate').text(mainData.date.replace('<h5>', ', ').replace('</h5>', ''));
        $('#modal-coachName').text(capitalizeFirstLetter(mainData.coach.split(' ')[0]));
        $('.coach-img').attr('src', 'img/coaches/' + mainData.coach.replace(' ', '') + '.jpg');
        $('#bike-distribution > div * p').each(function () {
            this.innerHTML = '';
            data.forEach(e => {
                if (e.id == i) {
                    if (e.user == "No Registrado"){;
                        this.innerHTML = "No Registrado" 
                    }else{
                        this.innerHTML = capitalizeFirstLetter(e.user.split(' ')[0]);
                    }
                }
            });
            i--;
        });
        i = 15;
        $('#bike-distribution > div * img:not(.coach-img)').each(function () {
            this.src = "img/bikes/bike__" + i + ".png";
            var blur = 'bluredImg';
            this.classList.remove(blur);
            data.forEach(e => {
                if (e.id == i) {
                    blur = 'n';
                }
            });
            this.classList.add(blur);
            i--;
        });
        $("#modal-class-details").modal('show');
    });
    $(document).on('click', '.assistant-img', function (event) {
        document.getElementById('modal-assistant-name').innerHTML = event.target.dataset.name;
        $('#modal-assistant-img-lg').attr('src', event.target.src);
        $("#modal-assistant-detail").modal('show');
    });
    $('#inputState').on('change', function () {
        coachid = this.value;
        if (this.value == "Todos") {
            coachid = null;
            
        }
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
            minDate: moment().subtract(3, 'month'),
            "locale": {
                "applyLabel": "Aplicar",
                "cancelLabel": "Cancelar",
                "firstDay": 1
            },
            opens: 'center'
        }, function (start, end, label) {

            refreshClasses();

        });
    });


    refreshClasses();
});

function resetWeek() {
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
        count = 0;
        var clasesPorFecha = wanted.filter(x => {

            return spanishDate(dateFromServer(x.start)).startsWith(cardDate);
        });
        let value3 = clasesPorFecha[0].start.split(" ")[0].replace("-", "");
        var today = new Date();
        var headerClass = 'nullClass';
        if (today.setHours(0, 0, 0, 0) === dateFromServer(clasesPorFecha[0].start).setHours(0, 0, 0, 0)) {
            headerClass = 'todayHeader';
        }
        var dataTable = createDataTable(clasesPorFecha);
        card = createNewCard(value3, cardDate, dataTable, headerClass, count);
        card.id = "card" + value3;
        var topCoach = '-';
        passClass = 0;
        card.querySelectorAll('.disponibilidad').forEach(x => {
            count = count + parseInt(x.children[0].innerHTML);
            if (parseInt(x.children[0].innerHTML) > passClass) {
                topCoach = x.parentElement.querySelector('.coachname').innerHTML.split(" ")[0];
                passClass = x.children[0].innerHTML;
            }
        });
        card.querySelector('.headerCount').innerHTML = `<i class="bi bi-info-circle"></i> <p style="display: none;"> Clases: ${card.querySelectorAll('.disponibilidad').length}  <br> Registrados: ${count} <br> Promedio: ${Math.floor(count/card.querySelectorAll('.disponibilidad').length)} <br> Top Coach: ${capitalizeFirstLetter(topCoach)}</p>`;
        // card.querySelector('.headerCount').innerHTML = `<i class="bi bi-info-circle"></i>`;
        document.getElementById('accordion').appendChild(card);
    });
    refreshChartData = false;
    updateChart();

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
    tdFecha.innerHTML =x.title + "<h5>" + spanishDate(dateFromServer(x.start)).split('<h5>')[1];
    var tdRegistrados = document.createElement('td');
    tdRegistrados.classList.add("disponibilidad");
    if (x.available_capacity < 15) {
        tdRegistrados.classList.add("active-class");
    }
    tdRegistrados.innerHTML = "<h2>" + (15 - x.available_capacity) + "</h2>";
    tr.appendChild(tdCoach);
    tr.appendChild(tdFecha);
    tr.appendChild(tdRegistrados);
    if (refreshChartData) {
        var asistenciadeUsuarios = 15 - x.available_capacity;
        var charName = x.coach.name.split(" ")[0];
        var s = {};
        if (CHART_DATA.hasOwnProperty(charName)) {
            s = CHART_DATA[charName];
            x.member_class.forEach(m => {
                if (m.status == 'canceled') return;
                if (m.member_end == null) return;
                var name = capitalizeFirstLetter(m.member_end.name != null ? m.member_end.name : "Usuario");

                if (s.hasOwnProperty(name)) {
                    s[name] = s[name] + 1;
                } else {
                    s[name] = 1;
                }

            });
            if (s.hasOwnProperty("count")) {
                s["count"] = s["count"] + 1;
            } else {
                s["count"] = 1;
            }
            CHART_DATA[charName] = s;
        } else {
            x.member_class.forEach(m => {
                if (m.status == 'canceled') return;
                if (m.member_end == null) return;
                var name = capitalizeFirstLetter(m.member_end.name ? m.member_end.name : "Usuario");

                s[name] = 1;
            });
            if (s.hasOwnProperty("count")) {
                s["count"] = s["count"] + 1;
            } else {
                s["count"] = 1;
            }
            CHART_DATA[charName] = s;
        }
    }

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
    var colorsAssistencia = ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'];
    var classObjectForCanvas = [];
    var theme = 'success';
    var title = "Asistentes";
    var asistentesRows = [];
    if (users.length == 0 && x.capacity == 15) {
        theme = 'danger';
        title = "No hay asistentes";
    }
    users.sort(function (a, b) {
        return a.ref - b.ref
    });
    users.forEach(user => {
        if (user.status == 'canceled') return;
        var img = '';

        if (user.member_end == null) {
            user.member_end = {
                name: "",
                avatar_file_name: "undefined"
            };
        }
        if (user.member_end.avatar_file_name.includes("undefined") || user.member_end.avatar_file_name.includes("undefined")) {
            img = defaultFace;
        } else {
            img = "https://s3.amazonaws.com/atomboxcrm-images/members/" + user.member_end.avatar_file_name.replace("members/", "");
        }
        asistentesRows.push(String.format(asistenciaLITemplate, img, capitalizeFirstLetter(user.member_end.name), user.ref));

        colorsAssistencia[user.ref - 1] = 'red';
        classObjectForCanvas.push({
            "user": user.member_end.name,
            "id": user.ref,
            "img": img.src
        });

    });
    for (let i = 0; i < 15 - x.capacity; i++) {
        var bike = 14;
        while (bike > 0) {
            const element = colorsAssistencia[bike];
            if (element == 'green') {
                colorsAssistencia[bike] = 'red';
                classObjectForCanvas.push({
                    "user": "No Registrado",
                    "id": bike + 1,
                    "img": defaultFace
                });
                break;
            }
            bike--;
        }

        asistentesRows.push(String.format(asistenciaLITemplate, defaultFace, capitalizeFirstLetter("No Registrado"), bike + 1));
    }

    var Asistentesul = bootstrapUL('', title, asistentesRows, theme)

    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan = 3;
    td.classList.add('hiddenRow');
    var accordianDiv = document.createElement('div');
    var accordianDiv = document.createElement('div');
    accordianDiv.classList.add('accordian-body');
    accordianDiv.classList.add('collapse');
    accordianDiv.id = "lista" + classID;

    var listAndChartContainer = document.createElement('div');
    listAndChartContainer.classList.add('container');
    var row = document.createElement('div');
    row.classList.add('row');
    var chartCol = document.createElement('div');
    row.dataset.classData = `{"coach": "${x.coach.name}" , "date" : "${spanishDate(dateFromServer(x.start))}" }`;
    chartCol.classList.add('col-12');
    chartCol.classList.add('col-md-4');
    chartCol.appendChild(createNewCanvas(colorsAssistencia, classObjectForCanvas));
    var listCol = document.createElement('div');
    listCol.classList.add('col-12');
    listCol.classList.add('col-md-8');
    listCol.appendChild(Asistentesul);

    row.appendChild(chartCol);
    row.appendChild(listCol);
    listAndChartContainer.appendChild(row);

    accordianDiv.appendChild(listAndChartContainer);
    td.appendChild(accordianDiv);
    tr.appendChild(td);
    return tr;
}

function createNewCanvas(colors, classObjectForCanvas) {
    var canvas = document.createElement('canvas');
    canvas.classList.add('canvasDistribution');
    canvas.dataset.classData = JSON.stringify(classObjectForCanvas);
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
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[1];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[2];
    context.fill();

    centerY = centerY + radius * YFactor;
    centerX = 10;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[3];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[4];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[5];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[6];
    context.fill();

    centerY = centerY + radius * YFactor;
    centerX = 10;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[7];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[8];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[9];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[10];
    context.fill();

    centerY = centerY + radius * YFactor;
    centerX = 10;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[11];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[12];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[13];
    context.fill();
    centerX = centerX + radius * XFactor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = asistencia[14];
    context.fill();
    return canvas;
}

function createNewCard(id, Htitle, bodyContent, todayHeader, classCount) {
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

    var count = document.createElement('h5');
    count.classList.add('mb-0');
    count.classList.add('headerCount');
    title.appendChild(count);



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