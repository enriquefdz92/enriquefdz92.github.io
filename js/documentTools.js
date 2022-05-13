function newLiElement(id, classList) {
    var li = document.createElement("li");
    li.id = id;
    classList.forEach(c => {
        li.classList.add(c);
    });
    return li;
}