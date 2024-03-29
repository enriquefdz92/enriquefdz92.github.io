function dateFromServer(s) {
    var year = s.split(" ")[0].split("-")[0];
    var month = s.split(" ")[0].split("-")[1];
    var day = s.split(" ")[0].split("-")[2];
    var hour = s.split(" ")[1].split(":")[0];
    var minutes = s.split(" ")[1].split(":")[1];
    var date = new Date(year, month - 1, day, hour, minutes);
    return date;
}

function capitalizeFirstLetter(string) {
    var temp = '';
    string = string.toLowerCase();
    string.split(" ").forEach(str => {
        temp = temp +" "+ str.charAt(0).toUpperCase() + str.slice(1);
    });
    return temp;
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
    result.setDate(result.getDate() + 7);

    return (new Date(result)).toISOString().split("T")[0];
}

function applyFilters() {
    wanted = ALL_CLASSES.filter(function (item) {
        if (coachid && coachid !="Todos") {
            return (item.coach.id == coachid);
        } else {
            return true;
        }
    });
}


function sort() {
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
     if (coachid) $('#accordion .class-collapse').collapse('show');
}

