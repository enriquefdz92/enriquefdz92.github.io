function LSsave(key, str) {
    try {
        return localStorage.setItem(key, str);
    } catch (err) {
        return null;
    }

}

function LSget(key) {
    try {

        return localStorage.getItem(key);
    } catch (err) {
        return null;
    }

}

function LSclear() {
    try {
        localStorage.clear("players");
       location.reload();
        return true;
    } catch (err) {
        return false;
    }

}

function LSitemExist(key) {

    try {

        return localStorage.hasOwnProperty(key);
    } catch (err) {
        return false;
    }

}