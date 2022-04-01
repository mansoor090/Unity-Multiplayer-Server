const Console = require("console");
module.exports = class Connection{
    player;
    socket;
    server;
    lobby;

    constructor() {

        this.socket;
        this.player;
        this.server;
        this.lobby;

    }

    // Handles all our io events and where we should route them to be handled.
    CreateEvents(){

        let connection = this;

        let socket = connection.socket;
        let server = connection.server;
        let player = connection.player;


        socket.on('disconnect', function (){
            server.OnDisconnected(connection);
        });


        socket.on('joinGame', function (){
            console.log("Attempted");
            server.OnAttemptToJoinGame(connection);
        });

        socket.on('fireBullet', function (data){
            connection.lobby.OnFireBullet(connection, data);

        });

        socket.on('collisionDestroy', function (data){
            connection.lobby.OnCollisionDestroy(connection, data);

        });


        socket.on('updatePosition', function (data ){

            // -> Updating Position On Server
            player.position.x = data.position.x;
            player.position.y = data.position.y;
            player.position.z = data.position.z;
            // -> Updating Rotation On server
            player.rotation.x = data.rotation.x;
            player.rotation.y = data.rotation.y;
            player.rotation.z = data.rotation.z;

            // Sharing Position With Others Thru Server
            socket.broadcast.to(connection.lobby.id).emit('updatePosition', player);

        });

/*        socket.on('disconnet', function (){



        });*/
    }
}