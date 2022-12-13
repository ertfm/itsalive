
addHostBtn = document.querySelector('#add-host-btn');
addHostModal = document.querySelector('#add-host-modal');
addHostModalCloseBtn = document.querySelector('#add-host-modal-close-btn')

addHostBtn.addEventListener('click', () => {
    addHostModal.setAttribute('open', true);
});

addHostModalCloseBtn.addEventListener('click', () => {
    addHostModal.removeAttribute('open');
})