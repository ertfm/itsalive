/*
Variables
*/

const dashboard = document.querySelector('#dashboard');
const showAddMonitor = document.querySelector('#show-add-monitor');
const showEvents = document.querySelector('#show-events');
const addMonitorModal = document.querySelector('#add-monitor-modal');
const showEventsModal = document.querySelector('#show-events-modal');
const closeAddMonitor = document.querySelector('#close-add-monitor');
const closeShowEvents = document.querySelector('#close-show-events');
const addMonitorForm = document.querySelector('#add-monitor-form');
const disconnectedModal = document.querySelector('#disconnected-modal');
const events = showEventsModal.querySelector('table').querySelector('tbody');
const ctype = addMonitorForm.querySelector('#ctype')
const portDataField = addMonitorForm.querySelector('#port-data-field')
const port = portDataField.querySelector('#port')

const socket = io();
let visibleModal = null;

/*
Functions
*/

function addMonitorBox(monitor) {
    const box = document.createElement('div');
    box.id = monitor.id;
    box.className = 'box';

    const fname = document.createElement('h5');
    fname.textContent = monitor.fname;

    const hostname = document.createElement('p');
    hostname.textContent = monitor.hostname;
    
    const del = document.createElement('button')
    del.className = 'del-monitor-btn'
    del.textContent = ''

    box.appendChild(fname);
    box.appendChild(hostname);
    box.appendChild(del);
    dashboard.appendChild(box);

    del.addEventListener('click', () => {
        socket.emit('client:delete-monitor', {
            'fname':monitor.fname
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

function togglePortDataField() {
    if (ctype.value == 'tcp') {
        portDataField.hidden = false;
        port.required = true;
    }
    if (ctype.value == 'ping') {
        portDataField.hidden = true;
        port.required = false;
    }
}

/*
Events Listeners
*/

showAddMonitor.addEventListener('click', () => {
    if (!visibleModal) {
        openModal(addMonitorModal, document.querySelector('#add-monitor-fname'));

        togglePortDataField();
    }
});

closeAddMonitor.addEventListener('click', () => {
    if (visibleModal) {
        closeModal(addMonitorModal);
    }
});

showEvents.addEventListener('click', () => {
    events.innerHTML = '';

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
    if (e.key == 'Escape' && visibleModal && visibleModal.id != 'disconnected-modal') {
        closeModal(visibleModal);
    }
});

document.addEventListener('click', (e) => {
    if (e.target==visibleModal && visibleModal.id != 'disconnected-modal') {
        closeModal(visibleModal);
    }
});

ctype.addEventListener('change', () => {
    togglePortDataField();
});

addMonitorForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(addMonitorForm);
    data.append('ctype', ctype.value);
    
    socket.emit('client:add-monitor', Object.fromEntries(data));
});

/*
Socket handlers
*/

socket.on('connect', () => {
    if (visibleModal) {
        if (visibleModal.id == 'disconnected-modal') {
            closeModal(visibleModal);
        }
    }
});

socket.on('disconnect', () => {
    dashboard.innerHTML = '';
    if (visibleModal) {
        console.log(visibleModal);
        closeModal(visibleModal);
    }
    openModal(disconnectedModal);
});

socket.on('server:send-monitors', (response) => {
    console.log(response);
    if (response.status == 'success') {
        response.data.forEach(monitor => {
            addMonitorBox(monitor);
        });
    }
});

socket.on('server:add-monitor', (response) => {
    console.log(response);
    if (response.status == 'success') {
        closeModal(visibleModal);
        addMonitorForm.reset();
    }
});

socket.on('server:new-monitor-added', (response) => {
    console.log(response)
    if (response.status == 'success') {
       addMonitorBox(response.data);
    }
});

socket.on('server:monitor-status-update', (response) => {
    console.log(response)
    if (response.status == 'success') {
        const box = document.getElementById(response.data.id);
        if (response.data.exit_code == '0') {
            box.classList.remove('down');
            box.classList.add('up');
        } else {
            box.classList.remove('up');
            box.classList.add('down');
        }
    }
});

socket.on('server:delete-monitor', (response) => {
    console.log(response);
    if (response.status == 'success') {
        const box = document.getElementById(response.data.id);
        box.remove();
    }
});

socket.on('server:send-events', (response) => {
    if (response.status == 'success') {
        response.data.forEach(event => {
            let row = events.insertRow();

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
});