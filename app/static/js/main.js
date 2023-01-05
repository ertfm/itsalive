/*
Variables
*/

const dashboard = document.querySelector('#dashboard');
const showAddHost = document.querySelector('#show-add-host');
const showEvents = document.querySelector('#show-events');
const addHostModal = document.querySelector('#add-host-modal');
const showEventsModal = document.querySelector('#show-events-modal');
const closeAddHost = document.querySelector('#close-add-host');
const closeShowEvents = document.querySelector('#close-show-events');
const addHostForm = document.querySelector('#add-host-form');

const tableBody = showEventsModal.querySelector('table').querySelector('tbody');


const socket = io();
let visibleModal = null;

/*
Functions
*/

function addHostBox(host) {
    const box = document.createElement('div');
    box.id = host.id;
    box.className = 'box';

    const fname = document.createElement('h5');
    fname.textContent = host.fname;

    const hostname = document.createElement('small');
    hostname.textContent = host.hostname;

    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = '-';

    const del = document.createElement('button')
    del.className = 'del-box'
    del.textContent = 'Delete'

    box.appendChild(fname);
    box.appendChild(hostname);
    box.appendChild(status);
    box.appendChild(del);
    dashboard.appendChild(box);

    del.addEventListener('click', () => {
        socket.emit('client:delete-host', {
            'fname':host.fname
        });
    });
}

function openModal(modal, elFocus) {
    visibleModal = modal;
    visibleModal.setAttribute('open', true);
    if (elFocus) {
        elFocus.focus();
    }
}

function closeModal(modal) {
    modal.removeAttribute('open');
    visibleModal = null;
}

/*
Events Listeners
*/

showAddHost.addEventListener('click', () => {
    if (!visibleModal) {
        openModal(addHostModal, document.querySelector('#add-host-fname'));
    }
});

closeAddHost.addEventListener('click', () => {
    if (visibleModal) {
        closeModal(addHostModal);
    }
});

showEvents.addEventListener('click', () => {
    tableBody.innerHTML = '';

    socket.emit('client:send-events');
    if (!visibleModal) {
        openModal(showEventsModal);
    }
});

closeShowEvents.addEventListener('click', () => {
    if (visibleModal) {
        closeModal(showEventsModal);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key == 'Escape' && visibleModal) {
        closeModal(visibleModal);
    }
})

document.addEventListener('click', (e) => {
    if (e.target==visibleModal) {
        closeModal(visibleModal);
    }
})

addHostForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(addHostForm);
    socket.emit('client:add-host', Object.fromEntries(data));
});

/*
Socket handlers
*/

socket.on('server:send-hosts', (response) => {
    console.log(response);
    if (response.status == 'success') {
        response.data.forEach(host => {
            addHostBox(host);
        });
    }
});

socket.on('server:add-host', (response) => {
    console.log(response);
    if (response.status == 'success') {
        addHostBox(response.data);
        closeModal(visibleModal);
        addHostForm.reset();
    }
});

socket.on('server:host-status-update', (response) => {
    console.log(response)
    if (response.status == 'success') {
        const box = document.getElementById(response.data.id);
        const status = box.querySelector('.status');
        if (response.data.exit_code == '0') {
            box.classList.remove('down');
            box.classList.add('up');
            status.textContent = 'UP';
        } else {
            box.classList.remove('up');
            box.classList.add('down');
            status.textContent = 'DOWN';
        }
    }
});

socket.on('server:delete-host', (response) => {
    console.log(response);
    if (response.status == 'success') {
        const box = document.getElementById(response.data.id);
        box.remove();
    }
})

socket.on('server:send-events', (response) => {
    if (response.status == 'success') {
        response.data.forEach(event => {
            let row = tableBody.insertRow();

            let datetime = row.insertCell(0);
            datetime.textContent = event.created;

            let fname = row.insertCell(1);
            fname.textContent = event.fname;

            let status = row.insertCell(2);
            status.textContent = event.status;

            row.appendChild(datetime);
            row.appendChild(fname);
            row.appendChild(status);
        });
    }
})