function dateFromServer(s) {
    var year = s.split(" ")[0].split("-")[2];
    var month = s.split(" ")[0].split("-")[1];
    var day = s.split(" ")[0].split("-")[0];
    var hour = s.split(" ")[1].split(":")[0];
    var minutes = s.split(" ")[1].split(":")[1];
    var date = new Date(year, month - 1, day, hour, minutes);
    return date;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function to12format(t) {
    var hour = t.split(":")[0];
    if (hour > 12) {
        return (hour - 12) + ' pm';
    } else {
        return hour + ' am';
    }
}

function spanishDate(date) {
    var event = date;
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };
    var d = event.toLocaleDateString('es-ES', options).split(" ");
    return capitalizeFirstLetter(d[0].replace(",", "")) + ' ' + d[1] + '<h5>' + to12format(d[6]) + '</h5>';

}

function getWeek(currentdate) {
    var oneJan = new Date(currentdate.getFullYear(), 0, 1);
    var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
}

function getMonday() {
    d = new Date();
    var day = d.getDay(),
        diff = d.getDate() - day; //+ (day == 0 ? -6 : 1); // adjust when day is sunday
    return (new Date(d.setDate(diff))).toISOString().split("T")[0];
}

function getDate(i) {
    d = new Date();
    var day = d.getDay(),
        diff = d.getDate() - day + i; //+ (day == 0 ? -6 : 1); // adjust when day is sunday
    return (new Date(d.setDate(diff))).toISOString().split("T")[0];
}

function getSunday() {
    const date = getMonday();
    var result = new Date(date);
    result.setDate(result.getDate() + 6);

    return (new Date(result)).toISOString().split("T")[0];
}

function getUsersList(classID, users) {
    var ul = document.createElement('ul');
    var li = document.createElement('li');
    ul.classList.add('list-group');
    li.classList.add('list-group-item');
    li.classList.add('list-group-flush');
    if(users.length==0){
        li.classList.add('list-group-item-danger');  
        li.innerHTML = "No hay asistentes";  
    }else{
        li.classList.add('list-group-item-success');
        li.innerHTML = "Asistentes";
    }
    ul.appendChild(li);
    users.forEach(user => {
        var li = document.createElement('li');
        li.classList.add('list-group-item');


        var img = document.createElement('img');
        console.log(user);
        if(user.avatar_file_name.includes("undefined")||user.avatar_file_name.includes("undefined")){
            img.src = "https://s3.amazonaws.com/atomboxcrm-images/members/defaultFace.png"
        }else{
            img.src = "https://s3.amazonaws.com/atomboxcrm-images/members/"+user.avatar_file_name.replace("members/","");
        }
        img.classList.add('assistant-img');
        var DivImg = document.createElement('div');
        DivImg.classList.add('thumbnail');
        DivImg.appendChild(img);
        var DivName = document.createElement('div');
        DivName.innerHTML = user.name;

        var container = document.createElement('div');
        container.classList.add('container');
        var row = document.createElement('div');
        row.classList.add('row');
        var col2 = document.createElement('div');
        col2.classList.add('col-2');
        col2.appendChild(DivImg);
        var col10 = document.createElement('div');
        col10.classList.add('col-10');
        col10.classList.add('list-assistant');
        col10.appendChild(DivName);
        row.appendChild(col2);
        row.appendChild(col10);
        container.appendChild(row);
        li.appendChild(container);

        ul.appendChild(li);
    });



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

function getClases(start, end, authKey, order) {
    $('#tdata').find('tr.classRow').remove();
    var url = "https://api.atomboxcrm.com/production/landing/lessons?key=moove_indoor";
    const urlParams = new URLSearchParams(window.location.search);
    const coachid = urlParams.get('coachid');
    const showAll = urlParams.get('show');
    url = "https://api.atomboxcrm.com/production/admin/lessons?key=moove_indoor&start=" + start + "&end=" + end;
    url = "https://api.atomboxcrm.com/v1.9/classes/list?date=" + start;
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("Authorization", authKey);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        $("#loader").hide();
        if (xhr.readyState === 4) {
            if (xhr.status === 401) {
                document.getElementById('tdata').innerHTML = '<tr><td>TOKEN EXPIRED</td></tr>';
            }
            var today = new Date();
            //console.log(today.toLocaleString('en-US', { hour12: true}));
            const obj = JSON.parse(xhr.response.replace("\"lessons\":", "\"classes\":"));
            console.log(obj);
            var wanted = obj.classes.filter(function (item) {
                var currentweek = getWeek(new Date());
                var classweek = getWeek(dateFromServer(item.start_at));
                if (showAll) {
                    console.log("showing all");
                    return true;
                } else {
                    if (new Date() > dateFromServer(item.start_at)) {
                        return false;
                    }
                    /*    if (currentweek != classweek) {
                           console.log(currentweek + " > "+ classweek);
                           console.log(item);
                           
                           console.log(dateFromServer(item.start_at));
                           console.log('skipping');
                           return false;
                       } */
                }
                if (coachid) {
                    return (item.coach.id == coachid);
                } else {
                    return true;
                }
            });
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
        var mylist = $('#accordion');
        var listitems = mylist.children('div').get();
        listitems.sort(function (a, b) {
            var compA = $(a).attr('id').toUpperCase();
            var compB = $(b).attr('id').toUpperCase();
            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        })
        $.each(listitems, function (idx, itm) {
            mylist.append(itm);
        });
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

    a.appendChild(foto);
    a.appendChild(fotoDiv)
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
    tdRegistrados.innerHTML = 15 - x.available_capacity;
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
        tbody.appendChild(getUsersList(x.id, x.assistants));

    });
    table.appendChild(tbody);


    return table;
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