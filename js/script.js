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
    return capitalizeFirstLetter(d[0].replace(",", "")) + ' ' + d[1] + ' <h5>' + to12format(d[6]) + '</h5>';

}

function getMonday() {
    d = new Date();
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return (new Date(d.setDate(diff))).toISOString().split('T')[0];
}

function getSunday() {
    const date = getMonday();
    var result = new Date(date);
    result.setDate(result.getDate() + 6);

    return (new Date(result)).toISOString().split('T')[0];
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
                if (showAll) {
                    console.log("showing all");
                    return true;
                }
                if (coachid) {
                    return (item.coach.id == coachid);
                } else {
                    var endDate = new Date(end);
                    endDate.setDate(endDate.getDate() +1);

                    var startDate = new Date(start);
                    startDate.setDate(startDate.getDate() +1);
console.log(dateFromServer(item.start_at));
console.log(end);
console.log(endDate);
                    if (dateFromServer(item.start_at) <= endDate ){ 
                        return true;
                    }else{
                        return false;
                    }

                    if (new Date() > dateFromServer(item.start_at)) {
                        return false;
                    }

                    return true;
                }
            });
            //console.log(wanted);
            if (wanted.length == 0) {
                $("#noelements").show();
            }
            wanted.forEach(x => {
                var activeClass = x.available_capacity < 15 ? ' active-class' : '';
                var classDate = dateFromServer(x.start_at);
                let attendees = '';
                //x.assistants.forEach((element) => { attendees = attendees + element.name + '\\n' });
                attendees = 'LISTA DE USUARIOS REGISTRADOS A LA CLASE ';
                attendees = 'onclick="alert(\'' + attendees + '\')"';

                var trclass = today.setHours(0, 0, 0, 0) === classDate.setHours(0, 0, 0, 0) ? '<tr class="active-row classRow">' : '<tr  class="classRow">';
                let row = trclass +
                    '<td>' +
                    '<a href="?coachid=' + x.coach.id + '">' +
                    '<div>' +
                    '<img id="coach-img" src="img/coaches/' + x.coach.name.replace(" ", "") + '.jpg"/>' +
                    '</div>' +
                    '<div class="coachname">' +
                    x.coach.name +
                    '</div>' +
                    '</a>' +
                    '</td>' +
                    '<td id="date">' +
                    spanishDate(dateFromServer(x.start_at)) +
                    '</td>' +
                    '<td ' + attendees + '  class="disponibilidad ' + activeClass + '">' +
                    (15 - x.available_capacity) +
                    '</td>' +
                    '</tr>';

                document.getElementById('tdata').innerHTML = document.getElementById('tdata').innerHTML + row;

            });
        }
    };
    xhr.send();
}

getClases(getMonday(),getSunday(new Date()));