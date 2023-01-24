from app import socketio
from app.services import add_monitor, get_monitors, delete_monitor, get_events
from flask import request

@socketio.on('connect')
def connection_handler():
    client_id = request.sid
    try:
        monitors = [ monitor.to_json() for monitor in get_monitors() ]
        if monitors:
            socketio.emit('server:send-monitors', { 'status':'success', 'data':monitors}, to=client_id)

    except Exception as e:
        socketio.emit('server:send-monitors', { 'status':'error', 'data': 'here goes a descriptive error'})

@socketio.on('client:add-monitor')
def add_monitor_handler(new_monitor):
    client_id = request.sid
    try:
        monitor = add_monitor(new_monitor)
        socketio.emit('server:add-monitor', {'status': 'success','data': '' , 'message': 'Monitor added successfuly'}, to=client_id)
        socketio.emit('server:new-monitor-added', {'status': 'success','data': monitor.to_json() , 'message': 'New monitor added'})

    except Exception as e:
        print(e)
        socketio.emit('server:add-monitor',{ 'status': 'error', 'data': '', 'message': 'Here goes a descriptive error'}, to=client_id)

@socketio.on('client:delete-monitor')
def delete_monitor_handler(monitor):
    try:
        monitor = delete_monitor(monitor)
        socketio.emit('server:delete-monitor', { 'status':'success','data': { 'id':monitor.id },'message':'Monitor delete successfuly' })
    
    except Exception as e:
        print(e)
        socketio.emit('server:delete-monitor',{ 'status': 'error', 'data': '', 'message': 'Here goes a descriptive error'})

@socketio.on('client:send-events')
def send_events_handler():
    try:
        events = [ event.to_json() for event in get_events() ]
        socketio.emit('server:send-events', {'status':'success','data': events, 'message':'Events sent succeessfuly'})
    
    except Exception as e:
        print(e)
        socketio.emit('server:send-events',{ 'status': 'error', 'data': '', 'message': 'Here goes a descriptive error'})
