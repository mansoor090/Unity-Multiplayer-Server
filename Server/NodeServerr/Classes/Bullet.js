var ServerObject = require("./ServerObject");
var Vector3 = require("./Vector3")

module.exports = class Bullet extends ServerObject{

    constructor() {
        super();
        this.direction = new Vector3();
        this.speed = 0.5;
        this.destroyed = false;
        this.activator = '';
    }
    
    onUpdate(){
        
        this.position.x += this.direction.x * this.speed;
        this.position.y += this.direction.y * this.speed;
        this.position.z += this.direction.z * this.speed;
        
        return this.destroyed;
    }
    
}