
addHostBtn = document.querySelector('#add-host-btn');
addHostModal = document.querySelector('#add-host-modal');
addHostModalCloseBtn = document.querySelector('#add-host-modal-close-btn')
addHostForm = document.querySelector('#add-host-form')
friendlyNameText = addHostForm.querySelector('#friendly-name')
hostnameText = addHostForm.querySelector('#hostname')


const socket = io();

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