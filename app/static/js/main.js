/*
Variables
*/

const nav = document.querySelector('nav');
const dashboard = document.querySelector('#dashboard');
const showAddMonitor = document.querySelector('#show-add-monitor');
const showEventsBtn = document.querySelector('#show-events-btn');
const addMonitorModal = document.querySelector('#add-monitor-modal');
const showEventsModal = document.querySelector('#show-events-modal');
const closeAddMonitor = document.querySelector('#close-add-monitor');
const closeShowEvents = document.querySelector('#close-show-events');
const addMonitorForm = document.querySelector('#add-monitor-form');
const disconnectedModal = document.querySelector('#disconnected-modal');
const eventsTable = showEventsModal.querySelector('table').querySelector('tbody');
const eventsContainer = showEventsModal.querySelector('article');
const ctype = addMonitorForm.querySelector('#ctype');
const portDataField = addMonitorForm.querySelector('#port-data-field');
const port = portDataField.querySelector('#port');

const socket = io();
let visibleModal = null;

//scroll vars
let last_seen_id = null;
let limit = 30;
let canScroll = false;

/*
Functions
*/

function showError(message) {
    const errorBox = document.createElement('div');
    errorBox.className = "error-box";
    
    const errorText = document.createElement('p');
    errorText.className = "error-txt";
    errorText.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className = 'error-close-btn';
    closeButton.textContent = 'x';

    errorBox.appendChild(errorText);
    errorBox.appendChild(closeButton);

    nav.before(errorBox);

    closeButton.addEventListener('click', () => {
        errorBox.remove()
    })
}

function addMonitorBox(monitor) {
    const box = document.createElement('div');
    box.id = monitor.id;
    box.className = 'box';

    const fname = document.createElement('h5');
    fname.textContent = monitor.fname;

    const hostname = document.createElement('p');
    hostname.textContent = monitor.hostname;

    const ctype = document.createElement('p');
    if (monitor.ctype == 'tcp') {
        ctype.textContent = monitor.port + '/tcp';
    } else {
        ctype.textContent = 'ping';
    }
    
    const del = document.createElement('button')
    del.className = 'del-monitor-btn';
    del.textContent = '';

    box.appendChild(fname);
    box.appendChild(hostname);
    box.appendChild(ctype);
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

function getEvents() {
    socket.emit('client:send-events',limit,last_seen_id);
}

function showEvents(events) {
    events.forEach(event => {
        const row = eventsTable.insertRow();

        const datetime = row.insertCell(0);
        datetime.textContent = event.created;

        const fname = row.insertCell(1);
        fname.textContent = event.fname;

        const ctype = row.insertCell(2);
        if (event.ctype == 'tcp') {
            ctype.textContent = event.port + '/tcp';
        } else {
            ctype.textContent = event.ctype;
        }

        const status = row.insertCell(3);
        status.textContent = event.status;

        row.appendChild(datetime);
        row.appendChild(fname);
        row.appendChild(ctype);
        row.appendChild(status);
    });
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

showEventsBtn.addEventListener('click', () => {
    eventsTable.innerHTML = '';
    last_seen_id = null;
    getEvents()
    if (!visibleModal) {
        openModal(showEventsModal);
    }
});

closeShowEvents.addEventListener('click', () => {
    if (visibleModal) {
        closeModal(showEventsModal);
    }
});

eventsContainer.addEventListener('scroll', () => {
    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = eventsContainer;

    if (scrollTop + clientHeight >= scrollHeight - 5 && canScroll) {
        canScroll=false;
        getEvents()
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
        closeModal(visibleModal);
    }
    openModal(disconnectedModal);
});

socket.on('server:send-monitors', (response) => {
    if (response.status == 'success') {
        response.data.forEach(monitor => {
            addMonitorBox(monitor);
        });
    } else {
        showError(response.message);
    }
});

socket.on('server:add-monitor', (response) => {
    if (response.status == 'success') {
        closeModal(visibleModal);
        addMonitorForm.reset();
    }  else {
        closeModal(visibleModal);
        showError(response.message);
    }
});

socket.on('server:new-monitor-added', (response) => {
    if (response.status == 'success') {
       addMonitorBox(response.data);
    } else {
        showError(response.message);
    }
});

socket.on('server:monitor-status-update', (response) => {
    const box = document.getElementById(response.data.id);
    if (response.status == 'success') {

        if (response.data.exit_code == '0') {
            if (box.classList.contains('down')) {
                box.classList.remove('down');
                dashboard.append(box);
            }
            box.classList.add('up');
        } else {
            if (box.classList.contains('up') || (!box.classList.contains('down') && (!box.classList.contains('up'))) ) {
                box.classList.remove('up');
                dashboard.prepend(box);
            }
            box.classList.add('down');
        }
    } else {
        showError(response.message);
        box.classList.remove('up')
        box.classList.remove('down')
    }
});

socket.on('server:delete-monitor', (response) => {
    if (response.status == 'success') {
        const box = document.getElementById(response.data.id);
        box.remove();
    } else {
        showError(response.message);
    }
});

socket.on('server:send-events', (response) => {
    if (response.status == 'success') {
        if (response.data.length>0) {
            last_seen_id = response.data.at(-1).id
            showEvents(response.data)
        }
        canScroll=true;
    } else {
        closeModal(visibleModal);
        showError(response.message);
    }
});