const main = document.getElementById('contents');

const pages = Array.from(document.querySelectorAll('.page, .marker')).map(page => page);

const title = document.createElement('h2');
title.textContent = 'Contents'
title.classList.add('expand');
main.appendChild(title);

let inList = null;
pages.forEach(page => {
    const chapter = document.createElement('a');
    chapter.textContent = page.id;
    chapter.href = "#" + page.id;
    chapter.classList.add('chapter');
    if (page.classList.contains('project-page')) {
        if (!inList) {
            inList = document.createElement('ul');
            main.appendChild(inList);
        }
        const listElement = document.createElement('li');
        listElement.appendChild(chapter);
        inList.appendChild(listElement)
    } else {
        if (inList) {
            inList = null;
        }
        main.appendChild(chapter);
    }
});
if (inList) {
    inList = null;
}