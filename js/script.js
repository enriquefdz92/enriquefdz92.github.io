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
        diff = d.getDate() - day ;//+ (day == 0 ? -6 : 1); // adjust when day is sunday
    return (new Date(d.setDate(diff))).toISOString().split('T')[0];
}

function getSunday() {
    const date = getMonday();
    var result = new Date(date);
    result.setDate(result.getDate() + 6);

    return (new Date(result)).toISOString().split('T')[0];
}

function gettr(classID) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan=3;
    td.classList.add('hiddenRow');
    var accordianDiv = document.createElement('div');
    accordianDiv.classList.add('accordian-body');
    accordianDiv.classList.add('collapse');
    accordianDiv.id="lista"+classID;
    accordianDiv.innerHTML="Lista de usuarios registrados";
    td.appendChild(accordianDiv);
    tr.appendChild(td);
    return tr;

}

function getClases(start, end) {
    $('#tdata').find('tr.classRow').remove();
    var url = "https://api.atomboxcrm.com/production/landing/lessons?key=moove_indoor";
    const urlParams = new URLSearchParams(window.location.search);
    const coachid = urlParams.get('coachid');
    const showAll = urlParams.get('show');
    url = "https://api.atomboxcrm.com/production/landing/lessons?key=moove_indoor&start=" + start + "&end=" + end;

    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("Authorization", "eyJraWQiOiJFOEtFU0UrV3Y5SUp2N24wU1RRRWE0d2pNZmh5QXFkbHo1N2krdjN3bTYwPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNTc5OTA5OS1kMmRhLTQyMjAtYWM1MS00YjVlNjgyZTZlOWMiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfOWczZ1p5VDVXIiwiY29nbml0bzp1c2VybmFtZSI6ImM1Nzk5MDk5LWQyZGEtNDIyMC1hYzUxLTRiNWU2ODJlNmU5YyIsImF1ZCI6IjJiZDhnMWt0a2cwN3E4Y3JnYWQ1a3ViODVyIiwiZXZlbnRfaWQiOiIxNWIxNGU3MS01MTY3LTRhZGQtOWJjOC1hN2M5NmQ5N2I5MmQiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY1MTA3MjgyNywibmFtZSI6IkRJQU5BIEdBUkNJQSIsImN1c3RvbTpzY2hlbWEiOiJtb292ZV9pbmRvb3IiLCJleHAiOjE2NTEwNzY0MjksImlhdCI6MTY1MTA3MjgyOSwiZW1haWwiOiJtb292ZWluZG9vcmN5Y2xpbmdAZ21haWwuY29tIn0.HNkilxgZa6INViLzi1cZBt4luQ9fBfwWY3ZacHQDzysQduQUU2R2MshxjU7Nhc2eOueqhAoZnFM3HbugVvJumldTmV2ylXdaSkCGRbrYsNThnKFcyyPD9ct66EwLncvWq89rmt7qPJsrLYHtFimR1TP6ctMNQWaWXOrjX3y_kJNBiY2_RcoJSMMPhRTPpnNFtPhdSkzsxMjQmAe5Jz0h20HrcQFofUVtrPt0ogfx1opUEtvkuuShTZPmdGc0II0YqRp-p4xNVeRjHWOIp7IN8GWZ7T8_YIoFgt50EeIB4IIroJsuLU1l46IXQk9bgenwe_AxI_ANJZrGuWE2e8RwsA");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        $("#loader").hide();
        if (xhr.readyState === 4) {
            if (xhr.status === 401) {
                document.getElementById('tdata').innerHTML = '<tr><td>TOKEN EXPIRED</td></tr>';
            }
            var today = new Date();
            console.log(today.toLocaleString('en-US', {
                hour12: true
            }));
            const obj = JSON.parse(xhr.response);
            var wanted = obj.lessons.filter(function (item) {
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
            wanted.forEach(x => {
                var classDate = dateFromServer(x.start_at);

                var tr = document.createElement('tr');
                tr.classList.add("classRow");
                tr.classList.add('accordion-toggle');
                tr.dataset.toggle = 'collapse';
                tr.dataset.target ='#lista'+x.id;
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
                nombre.innerHTML= x.coach.name;

                a.appendChild(foto);
                a.appendChild(fotoDiv)
                a.appendChild(nombre);
                tdCoach.appendChild(a);

                var tdFecha = document.createElement('td');
                tdFecha.id="date";
                tdFecha.innerHTML=  spanishDate(dateFromServer(x.start_at));

                var tdRegistrados = document.createElement('td');
                tdRegistrados.classList.add("disponibilidad");
                if(x.available_capacity < 15){
                    tdRegistrados.classList.add("active-class");
                }
                tdRegistrados.innerHTML= 15 - x.available_capacity;
                tr.appendChild(tdCoach);
                tr.appendChild(tdFecha);
                tr.appendChild(tdRegistrados);
                
                //console.log(tr);
                document.getElementById('tdata').appendChild(tr);
                document.getElementById('tdata').appendChild(gettr(x.id));


            });
        }
    };
    xhr.send();
}

getClases(getMonday(), getSunday(new Date()));