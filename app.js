const express = require('express');
const { v4:uuidv4 } = require('uuid');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(server, {
    cors:{
        origin: '*'
    }
});

const { ExpressPeerServer} = require('peer');
const opinions = {
    debug: true
}

app.set('view engine','ejs');
app.use('/peerjs',ExpressPeerServer(server, opinions));
app.use(express.static('public'));
app.set('views', path.join(__dirname,'views'));

app.get('/',(req, res)=>{
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room',(req, res)=>{
    res.render('room',{ roomId: req.params.room});
});

io.on('connection', (socket)=>{
    socket.on('join-room', (roomId, userId, userName)=>{
        socket.join(roomId);
        setTimeout(()=>{
            socket.to(roomId).emit('user-connected', userId);
        },1000);
        socket.on('message',(message)=>{
            io.to(roomId).emit('createMessage', message, userName);
        });
    });
});

server.listen(PORT);