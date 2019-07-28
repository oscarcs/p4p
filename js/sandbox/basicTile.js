class BasicTile{   
    //TODO, need to include an immutable "type" property.
    constructor(world, x, y, spriteName, name = undefined) {
        this.world = world;
        this.type = "BasicTile";

        //@@RENAME
        // Array of exposed fields mapped to their values.
        this.exposed_fields = {};  

        // Array of functions mapped to the function name.
        this.actions = {}; 
        
        //@@TODO
        // Need to reserve some keywords for primitives
        this.populatePrimitives();
        
        //@@TODO
        //This needs to be in its own Array
        this.x = x;
        this.y = y;
        this.spriteName = spriteName;
        this.layer = 1; 
        this.solid = false;
        this.name = name;


        var index = world.spriteDict[spriteName];        
        this.sprite = this.world.add.sprite(
            world.utils.gridToTrue(x), 
            world.utils.gridToTrue(y),
            'tiles',
            index
        );

        this.sprite.depth = 1;  

        this.code = '';
        
        // Push tasks in, shift tasks out. Pushed actions need to use bind.
        this.queuedActions = []; 
        
        var date = new Date();      
        this.waitTimer = date.getTime();
    }
    
    // Takes a base tile and then applies the prototype, 
    // i.e. changing the internal elements as neccessary. 
    applyProtoType(prototype) {        
        this.solid = prototype.solid;
        this.type = prototype.type;
        this.changeSprite(prototype.spriteName);
        this.depth = prototype.depth;
        
        for (var key in prototype.fields) {
            this.exposed_fields[key] = prototype.fields[key];
        } 
    }


    //Populate the primitive functions of the tile
    populatePrimitives() {
        this.actions["wait"] = function(duration) {
            this.wait(duration);
        }.bind(this);

        //@@RENAME to moveTile for consistency 
        this.actions["moveObject"] = function(x, y) {
            this.world.moveObject(this, x, y);
        }.bind(this);

        this.actions["makeTile"] = function(prototype, x, y){
            this.world.makeTile(x,y,prototype);
        }.bind(this);

        this.actions["moveDown"] = function(distance){
            var newY;
            if(typeof distance !== "undefined"){
                newY = this.y + distance;
            }else{
                newY = this.y + 1;
            }
            this.world.moveObject(this, this.x, newY);
        }.bind(this);

        this.actions["moveUp"] = function(distance){
            var newY;
            if(typeof distance !== "undefined"){
                newY = this.y - distance;
            }else{
                newY = this.y - 1;
            }
            this.world.moveObject(this, this.x, newY);
        }.bind(this);

        this.actions["moveRight"] = function(distance){
            var newX;
            if(typeof distance !== "undefined"){
                newX = this.x + distance;
            }else{
                newX = this.x + 1;
            }
            this.world.moveObject(this, newX, this.y);
        }.bind(this);

        this.actions["moveLeft"] = function(distance){
            var newX;
            if(typeof distance !== "undefined"){
                newX = this.x - distance;
            }else{
                newX = this.x - 1;
            }
            this.world.moveObject(this, newX, this.y);
        }.bind(this);

        this.actions["destroy"] = function(){
            this.world.deleteTile(this);
        }.bind(this);
    }

    update() {     
        
        //@@TODO: use a more efficient and robust mechanism than Date().

        // For now, the update loop will take a function from the queue
        // and execute it at every tick
        var date = new Date();

        // For use with the wait primitive function.
        if (this.queuedActions.length > 0 &&
            date.getTime() > this.waitTimer &&
            this.world.isTick
        ) {
            this.advanceQueue();        
        }        

        this.limitPosition(); 

        if (this.world.utils.gridToTrue(this.x) !== this.sprite.x ||
            this.world.utils.gridToTrue(this.y) !== this.sprite.y
        ) {
            // Lazily update position
            this.sprite.x = this.world.utils.gridToTrue(this.x);
            this.sprite.y = this.world.utils.gridToTrue(this.y);           
        } 

        this.world.worldGrid[this.x][this.y].add(this);
    }
    
    advanceQueue(){
        var action = this.queuedActions.shift();
            if (typeof action === "function"){
                action();
            }
    }


    limitPosition() {
        this.x = Math.max(this.x, 0);
        this.x = Math.min(this.x, this.world.worldWidth - 1);

        this.y = Math.max(this.y, 0);
        this.y = Math.min(this.y, this.world.worldHeight - 1);
    }

    destroy() {        
        this.world.worldGrid[this.x][this.y].delete(this);        
        this.sprite.destroy(); 
    }


    addStringField(field) {
        this.exposed_fields[field] = " ";
    }

    addNumberField(field) {
        this.exposed_fields[field] = 0;
    }

    addBooleanField(field) {
        this.exposed_fields[field] = false;
    }

    changeSprite(newSprite) {
        if (this.spriteName == newSprite) {
            //lazy update
            return;
        }

        if (this.world.spriteDict[newSprite] != undefined) {
            this.spriteName = newSprite;
            var index = this.world.spriteDict[newSprite];

            this.sprite.destroy();            
            this.sprite = this.world.add.sprite(
                this.world.utils.gridToTrue(this.x), 
                this.world.utils.gridToTrue(this.y),
                'tiles',
                index
            );
        }
    }

    //@@DESIGN
    // Limit depth to 10 layers for the sake of simplicity.
    changeDepth(layer) {
        if (layer < 1) {
            this.depth = 1;
        }
        else if (layer > 10) {
            this.layer = 10;
        }
        else {
            this.layer = layer;
        }
    }
    
    // Primitive funciton to wait before the next action.
    //Duration in seconds
    wait(duration) {
        var date = new Date();
        this.waitTimer = date.getTime()+(1000*duration);
    }

    clearQueue(){
        this.queuedActions = [];
    }

    // Setting some hook actions.
    setWhenExitScene(exitAction) {
        if (typeof exitAction === "function") {
            this.actions["whenExitScene"] = exitAction
        }
    }

    onCollideEdge() {
        if ("whenExitScene" in this.actions && 
            typeof this.actions["whenExitScene"] == "function"
        ) {
            this.actions["whenExitScene"]();
        }
    }

    // For saving state.
    serialize() {
        var saveSprite = {};
        saveSprite.type = this.type;
        saveSprite.name = this.name;
        saveSprite.spriteName = this.spriteName;        
        saveSprite.x = this.x;
        saveSprite.y = this.y;
        saveSprite.exposed_fields = this.exposed_fields;
        saveSprite.solid = this.solid;
        saveSprite.code = this.code;

        return JSON.stringify(saveSprite);
    }
}