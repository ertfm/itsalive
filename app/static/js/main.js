const dashboardDiv = document.querySelector('#dashboard');
const addHostBtn = document.querySelector('#add-host-btn');
const addHostModal = document.querySelector('#add-host-modal');
const addHostModalCloseBtn = document.querySelector('#add-host-modal-close-btn');
const addHostForm = document.querySelector('#add-host-form');
const friendlyNameText = addHostForm.querySelector('#friendly-name');
const hostnameText = addHostForm.querySelector('#hostname');

const socket = io();

function addHostBox(host) {
    console.log(host);
    const boxDiv = document.createElement('div');
    boxDiv.id = host.friendly_name;
    boxDiv.className = 'box';

    const friendlyNameHeader = document.createElement('h5');
    friendlyNameHeader.textContent = host.friendly_name;

    const hostnameSmall = document.createElement('small');
    hostnameSmall.textContent = host.hostname;

    const statusSpan = document.createElement('span');
    statusSpan.className = 'status';
    statusSpan.textContent = '-';

    boxDiv.appendChild(friendlyNameHeader);
    boxDiv.appendChild(hostnameSmall);
    boxDiv.appendChild(statusSpan);
    dashboardDiv.appendChild(boxDiv);
}

addHostBtn.addEventListener('click', () => {
    addHostModal.setAttribute('open', true);
});

addHostModalCloseBtn.addEventListener('click', () => {
    addHostModal.removeAttribute('open');
});

addHostForm.addEventListener('submit', (e) => {
    e.preventDefault();

    friendlyName = friendlyNameText.value;
    hostname = hostnameText.value;

    socket.emit('client:add-host', {
        'friendly-name':friendlyName,
        'hostname':hostname
    });
});

socket.on('server:send-hosts', (response) => {
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
        addHostModal.removeAttribute('open');
        addHostForm.reset();
    }
});