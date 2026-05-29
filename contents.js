const main = document.getElementById('contents');

const pages = Array.from(document.getElementsByClassName('page')).map(page => page.id);

const title = document.createElement('h2');
title.textContent = 'Contents'
main.appendChild(title);

pages.forEach(page => {
    const chapter = document.createElement('a');
    chapter.textContent = page;
    chapter.href = "#";
    chapter.classList.add('chapter');
    main.appendChild(chapter);
})