from app import socket
from app.services import add_host

@socket.on('client:add-host')
def add_host_handler(request):
    response = add_host(request)
    #print(response)
    socket.emit('server:add-host', response)