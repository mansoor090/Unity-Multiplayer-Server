let LobbyBase = require("./LobbyBase");
let GameLobbySettings = require("./GameLobbySettings");
let Connection = require("../Connection");
let Bullet = require("../Bullet");

module.exports = class GameLobby extends LobbyBase {

    constructor(id, settings = GameLobbySettings) {
        super(id);
        this.settings = settings;
        this.bullets = [];
    }

    OnUpdate() {
        let lobby = this;
        lobby.updateBullets();
        lobby.updateDeadPlayers();
    }

    canEnterLobby(connection = Connection) {
        let lobby = this;
        let maxPlayersCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;
        if (currentPlayerCount + 1 > maxPlayersCount) {
            return false;
        }
        return true;

    }


    OnEnterLobby(connection = Connection) {
        let lobby = this;
        super.OnEnterLobby(connection);

        lobby.addPlayer(connection);

        // Handle Spawnning anyserver spawnned objects here;
        // example loot, weapon, collectables


    }

    OnLeaveLobby(connection = Connection) {
        let lobby = this;
        super.OnLeaveLobby(connection);
        lobby.removePlayer(connection);
    }

    updateBullets() {

        let lobby = this;
        let bullets = lobby.bullets;

        let connections = lobby.connections;

        bullets.forEach(bullet => {
            let isDestroyed = bullet.onUpdate();

            if (isDestroyed) {

                lobby.despawnBullet(bullet);

            } else {
                /*  var returnData = {
                       id: bullet.id,
                       position: {
                           x: bullet.position.x,
                           y: bullet.position.y,
                           z: bullet.position.z
                       },
                       rotation: {
                           x: bullet.direction.x,
                           y: bullet.direction.y,
                           z: bullet.direction.z
                       },
                      speed: bullet.speed
                   }

                   connections.forEach(connection => {
                       connection.socket.emit('updatePosition', returnData);
                   });*/

            }

        })

    }

    updateDeadPlayers() {
        let lobby = this;
        let connections = lobby.connections;

        connections.forEach(connection => {
            let player = connection.player;

            if (player.isDead) {
                let isRespawn = player.respawnCounter();
                if (isRespawn) {
                    let returnData = {
                        id: player.id,
                        position: player.position
                    }

                    let socket = connection.socket;

                    socket.emit('playerRespawn', returnData);
                    socket.broadcast.to(lobby.id).emit('playerRespawn', returnData);
                }
            }

        })
    }


    addPlayer(connection = Connection) {
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;

        var returnData = {
            id: connection.player.id
        }

        socket.emit('spawn', returnData); // tell myself
        socket.broadcast.to(lobby.id).emit('spawn', returnData); // tell others

        // tell myself about all players
        connections.forEach(c => {
            if (c.player.id !== connection.player.id) {
                socket.emit('spawn', {id: c.player.id});
            }
        })
    }

    removePlayer(connection = Connection) {
        let lobby = this;
        connection.socket.broadcast.to(lobby.id).emit('disconnected', {id: connection.player.id});
    }

    OnFireBullet(connection = Connection, data) {

        console.log("Player" + data.activator + " is requesting to spawn bullet");

        let lobby = this;

        let socket = connection.socket;
        let bullet = new Bullet();
        bullet.name = "Bullet";
        bullet.activator = data.activator;

        bullet.position.x = data.position.x;
        bullet.position.y = data.position.y;
        bullet.position.z = data.position.z;

        bullet.direction.x = data.direction.x;
        bullet.direction.y = data.direction.y;
        bullet.direction.z = data.direction.z;

        lobby.bullets.push(bullet);

        var returnData = {
            name: bullet.name,
            id: bullet.id,
            activator: bullet.activator,
            position: {
                x: bullet.position.x,
                y: bullet.position.y,
                z: bullet.position.z
            },
            direction: {
                x: bullet.direction.x,
                y: bullet.direction.y,
                z: bullet.direction.z
            },
            speed: bullet.speed
        }
        socket.emit('serverSpawn', returnData);
        socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
        console.log("Bullet Spawned By Server For Player " + data.activator);
    }

    OnCollisionDestroy(connection = Connection, data) {

        let lobby = this;


        let returnBullet = lobby.bullets.filter(bullet => {
            return bullet.id === (data.id);
        })

        returnBullet.forEach(bullet => {

            if (!bullet.destroyed) {

                console.log("Bullet ID: " + data.id + " , " + "Bullet Owner: " + data.sender + " , " + "Bullet Hit To: " + data.receiver);

                lobby.connections.forEach(c => {
                    let player = c.player;


                    if (player.id === data.receiver) {
                        let isDead = player.DealDamage(50);
                        if (isDead) {
                            let socket = c.socket;

                            console.log(player.id + " has died");
                            let returnData = {
                                id: player.id
                            };

                            socket.emit('playerDied', returnData);
                            socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                        } else {
                            console.log(player.id + " has health left -> " + player.health);
                        }
                    }
                });


                bullet.destroyed = true;
                lobby.despawnBullet(bullet);
            }


        })


    }


    despawnBullet(bullet = Bullet) {
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;

        var index = bullets.indexOf(bullet);
        if (index > -1) {
            bullets.splice(index, 1);
            var returnData = {
                id: bullet.id
            }

            connections.forEach(connection => {
                connection.socket.emit('serverUnspawn', returnData);
            });
        }

    }

}