let Connection = require('./Connection');
let Player = require('./player');


// lobbies
let LobbyBase = require("./Lobby/LobbyBase");
let GameLobby = require("./Lobby/GameLobby");
let GameLobbySettings = require("./Lobby/GameLobbySettings");


module.exports = class Server{

    constructor() {

        this.connections = [];
        this.lobbys = [];

        this.lobbys[0] = new LobbyBase(0);
         // this.physicsTickRate = 20 / 100; //50 hz
            this.physicsTickRate = 20; //60 hz
// this.physicsTickRate = 33.333333333333 / 100; //30 hz
    }

    OnUpdate(){
        let server = this;

        // update each lobby
        for (let id in server.lobbys){
            server.lobbys[id].OnUpdate();
        }
    }

    OnPhysicsUpdate(){
        let server = this;

        // update each lobby per physics update

        for (let id in server.lobbys){
            server.lobbys[id].OnPhysicsUpdate();
        }
    }

    OnConnected(socket){
        let  server = this;

        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.server = server;

        let player = connection.player;
        let lobbys = server.lobbys;

        console.log("Added Player" + connection.player.displayPlayerInformation() + "in server active players list");
        server.connections[player.id] = connection;

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.OnEnterLobby(connection);
        return connection;
        
    }

    OnDisconnected(connection = Connection){
        let server = this;
        let id = connection.player.id;

        delete server.connections[id];
        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {id: id});
        // perform lobby cleanup;
        server.lobbys[connection.player.lobby].OnLeaveLobby(connection);
        console.log('Player' + connection.player.displayPlayerInformation() + ' has disconnected from server');
    }

    OnAttemptToJoinGame(connection = Connection){

        // look through lobbies for a gamelobby;
        // check if joinable
        // if not make a new game

        let server = this;
        let lobbyFound = false;

        let gameLobbies = server.lobbys.filter(item => {
            return item instanceof GameLobby;
        })

        console.log('Total game lobbies running on server (' + gameLobbies.length + ")")

        gameLobbies.forEach(lobby => {
            if(!lobbyFound){
                let canJoin = lobby.canEnterLobby(connection);

                if(canJoin){
                    lobbyFound = true;
                    server.OnSwitchLobby(connection, lobby.id);
                }
            }
        });

        // All Games Lobbies Full or we have never created one;

        if(!lobbyFound){
            console.log('No Existing Lobby Found thus, Making a new game lobby');
            let  gameLobby = new GameLobby(gameLobbies.length + 1, new GameLobbySettings("FFA", 3));
            server.lobbys.push(gameLobby);
            server.OnSwitchLobby(connection, gameLobby.id);
        }

    }

    OnSwitchLobby(connection = Connection, lobbyID){

        let server = this;
        let lobbys = server.lobbys;
        connection.socket.join(lobbyID);
        connection.lobby = lobbyID[lobbyID];

        lobbys[connection.player.lobby].OnLeaveLobby(connection);
        lobbys[lobbyID].OnEnterLobby(connection);


    }

}
