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