dashboardDiv = document.querySelector('#dashboard')
addHostBtn = document.querySelector('#add-host-btn');
addHostModal = document.querySelector('#add-host-modal');
addHostModalCloseBtn = document.querySelector('#add-host-modal-close-btn')
addHostForm = document.querySelector('#add-host-form')
friendlyNameText = addHostForm.querySelector('#friendly-name')
hostnameText = addHostForm.querySelector('#hostname')


const socket = io();

function addHostBox(host) {
    console.log(host)
    boxDiv = document.createElement('div')
    boxDiv.id = host.friendly_name
    boxDiv.className = 'box'

    friendlyNameHeader = document.createElement('h5')
    friendlyNameHeader.textContent = host.friendly_name

    hostnameSmall = document.createElement('small')
    hostnameSmall.textContent = host.hostname

    statusSpan = document.createElement('span')
    statusSpan.className = 'status'
    statusSpan.textContent = '-'

    boxDiv.appendChild(friendlyNameHeader);
    boxDiv.appendChild(hostnameSmall);
    boxDiv.appendChild(statusSpan)
    dashboardDiv.appendChild(boxDiv);
}

addHostBtn.addEventListener('click', () => {
    addHostModal.setAttribute('open', true);
});

addHostModalCloseBtn.addEventListener('click', () => {
    addHostModal.removeAttribute('open');
})

addHostForm.addEventListener('submit', (e) => {
    e.preventDefault();

    friendlyName = friendlyNameText.value
    hostname = hostnameText.value

    socket.emit('client:add-host', {
        'friendly-name':friendlyName,
        'hostname':hostname
    })
})


socket.on('server:add-host', (response) => {
    console.log(response)
    if (response.status == 'success') {
        addHostBox(response.data)
        addHostModal.removeAttribute('open')
        addHostForm.reset()
    }
})