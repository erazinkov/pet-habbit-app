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
    popup: {
        index: document.getElementById('add-habbit_popup'),
        iconField: document.querySelector('.popup__form input[name="icon"]'),
    }
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

function resetForm(form, fields) {
 for (const field of fields) {
    form[field].value = '';
 }
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error');
            return;
        }
        res[field] = fieldValue;
    }
    let isValid = true;
    for (const field of fields) {
        if (!res[field]) {
            isValid = false;
        }
    }
    if (!isValid) {
        return;
    }
    return res;
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
    document.querySelector('.habbit__form input').classList.remove('error');
    document.querySelector('.habbit__form input').value = '';

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
    document.location.replace(document.location.pathname + '#' + activeHabbitId);
    rerenderMenu(activeHabbit);
    renderHead(activeHabbit);
    renderContent(activeHabbit);
}

/* popup flow */

function togglePopup() {
    page.popup.index.classList.toggle('cover_hidden');
}

/* days flow */

function deleteDay(index) {
    habbits.find(habbit => habbit.id === globalActiveHabbitId)?.days.splice(index, 1);
    rerender(globalActiveHabbitId);
    saveData();
}

function addDays(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['comment']);
    if (!data) {
        return;
    }
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                    days: habbit.days.concat([ { comment: data.comment } ]),
            };
        }
        return habbit;
    });
    resetForm(event.target, ['comment']);
    rerender(globalActiveHabbitId);
    saveData();
}

/* habbit flow */
function setIcon(context, icon) {
    page.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icon.icon_active');
    activeIcon.classList.remove('icon_active');
    context.classList.add('icon_active');
}


function addHabbit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return;
    }
    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
    habbits.push({
        id: maxId + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: [],
    });
    resetForm(event.target, ['name', 'target']);
    togglePopup();
    saveData();
    rerender(maxId + 1);
}

/* init */ 
(() => {
    console.log("IIFE");
    loadData();
    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabbit = habbits.find(habbit  => habbit.id === hashId);
    if (urlHabbit) {
        rerender(urlHabbit.id);
    } else {
        rerender(habbits[0].id);
    }
})()
