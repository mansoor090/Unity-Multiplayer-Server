var shortID = require('shortid');
var Vector2 = require('./Vector2');
var Vector3 = require('./Vector3');

module.exports = class Player{
    
  
    constructor() {
        this.username = 'Default_PlayerName';
        this.id = shortID.generate();
        this.lobby = 0;
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.health = new Number(100);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
    }

    displayPlayerInformation(){
        let player = this;
        return '(' + player.username + ':' + player.id + ')';

    }
    
    respawnCounter(){
        this.respawnTicker = this.respawnTicker + 1;
        
        if(this.respawnTicker >= 10){
            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;
            
            if(this.respawnTime >= 3){
                this.isDead = false;
                this.respawnTicker = new Number(0);
                this.respawnTime = new Number(0);
                this.health = new Number(100);
                this.position = new Vector3(0,0,0);
                
                return true;
            }
        }
        return  false;
    } 
    
    DealDamage(amount = Number){
        // adjust health on getting hit. 
        
        this.health = this.health - amount;
        
        // check if we are dead.
        
        if(this.health <= 0 && !this.isDead){
            this.isDead = true;
            this.respawnTicker = new Number(0);
            this.respawnTime = new Number(0);
        }
        console.log(this.health)
        return this.isDead
    }
}