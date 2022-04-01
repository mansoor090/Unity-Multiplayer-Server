// ws://192.168.18.10:52302/socket.io/?EIO=3&transport=websocket
// ws://my-first-unity-server.herokuapp.com:80/socket.io/?EIO=3&transport=websocket
//  https://my-first-unity-server.herokuapp.com/

let io = require("socket.io")(process.env.PORT || 52302);
let Server = require('./Classes/Server');

console.log("Server has started");

let server = new Server();

setInterval(() => {

    server.OnUpdate();

}, 100, 0);


io.on('connection', function (socket){

    console.log("Connected To Main Server")
    let connection = server.OnConnected(socket)
    connection.CreateEvents();
    connection.socket.emit('registerPlayer', {id: connection.player.id})
});