function bootstrapUL(id, title, rows, theme){
    var ul = document.createElement('ul');
    ul.id = id;
    ul.classList.add('list-group','ul-list');
    var header = document.createElement('li');
    theme = 'list-group-item-' + theme;
    header.classList.add('list-group-item' ,'list-group-flush',  theme);
    header.innerHTML = title;
    ul.appendChild(header);
    rows.forEach(html => {
        var row = document.createElement('li');
        row.classList.add('list-group-item');
        row.innerHTML = html;
        ul.appendChild(row);
    });
    return ul;
}

