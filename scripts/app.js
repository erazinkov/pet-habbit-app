'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */
const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.h1'),
        progressCoverBar: document.querySelector('.progress__cover-bar'),
        progressPercent: document.querySelector('.progress__percent'),
    },
    content: {
        daysContainer: document.getElementById('days'),
        nextDay: document.querySelector('.habbit__day'),
    },
    cover: document.querySelector('.cover'),
};

/* utils */

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}
/* render */

function rerenderMenu(activeHabbit) {
    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            const element = document.createElement('button');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('menu__item');
            element.addEventListener('click', () => rerender(habbit.id));
            element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}"">`;
            if (activeHabbit.id === habbit.id) {
                element.classList.add('menu__item_active');
            }
            page.menu.appendChild(element);
            continue;
        }
        if (activeHabbit.id === habbit.id) {
            existed.classList.add('menu__item_active');
        } else {
            existed.classList.remove('menu__item_active');
        }
    }
    
}

function renderHead(activeHabbit) {
    page.header.h1.innerText = activeHabbit.name;
    const p = activeHabbit.days.length / activeHabbit.target > 1 ? 100 : activeHabbit.days.length / activeHabbit.target * 100;
    page.header.progressCoverBar.setAttribute('style', `width: ${p}%`);
    page.header.progressPercent.innerText = `${p.toFixed(0)}%`;
}

function renderContent(activeHabbit) {
    const input = document.querySelector('.input_icon').classList.remove('error');

    page.content.daysContainer.innerHTML = '';
    for (const index in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `
            <div class="habbit__day">День ${Number(index) + 1}</div>
            <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
            <button class="habbit__delete" onclick="deleteDay(${index})">
                <img src="./images/delete.svg" alt="Delete">
            </button>
            `;
        page.content.daysContainer.appendChild(element);
    }
    page.content.nextDay.innerHTML = `День ${Number(activeHabbit.days.length) + 1}`;
}

function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    if (!activeHabbit) {
        return;
    }
    
    rerenderMenu(activeHabbit);
    renderHead(activeHabbit);
    renderContent(activeHabbit);
}

/* popup flow */

function togglePopup() {
    if (page.cover.classList.contains('cover_hidden')) {
        page.cover.classList.remove('cover_hidden');
    } else {
        page.cover.classList.add('cover_hidden');
    }
}

/* days flow */

function deleteDay(index) {
    habbits.find(habbit => habbit.id === globalActiveHabbitId)?.days.splice(index, 1);
    rerender(globalActiveHabbitId);
    saveData();
}

function addDays(event) {
    const form = event.target;
    event.preventDefault();
    const data = new FormData(form);
    console.log(form);
    const comment = data.get('comment');
    form['comment'].classList.remove('error');
    if (!comment) {
        form['comment'].classList.add('error');
        return;
    }
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                    days: habbit.days.concat([ {comment} ]),
            };
        }
        return habbit;
    });
    rerender(globalActiveHabbitId);
    form['comment'].value = '';
    saveData();
}

/* init */ 
(() => {
    console.log("IIFE");
    loadData();
    rerender(habbits[0].id);
})()
