class Tile {   
    constructor(world, x, y, prototype) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.prototype = prototype;

        this.prevName = "";
        this.invalidName = false;
        
        this.initialize(prototype);
    }

    initialize(prototype) {
        if (this.sprite) {
            this.sprite.destroy();
        }

        
        this.sprite = this.world.scene.add.sprite(
            Utils.gridToTrue(this.x), 
            Utils.gridToTrue(this.y),
            Utils.nameToMapping(prototype.getSpriteName()).sheet,
            Utils.nameToMapping(prototype.getSpriteName()).index
        );

        this.currentSpriteName = prototype.getSpriteName();

        this.layer = 1;
        this.sprite.depth = 1;
        
        //Use when queing the deletion of a tile.
        this.toDelete = false;

        this.context = new ExecutionContext(this);

        if (typeof prototype !== 'undefined') {
            prototype.context.copy(this.context);
        }
    }

    update() {
        if (this.world.getIsTick()) {
            this.context.update();
        }        

        this.maintainName();
        this.limitPosition(); 
        // Update the position of the sprite according to the tile x and y.
        
        if (Utils.gridToTrue(this.x) !== this.sprite.x || Utils.gridToTrue(this.y) !== this.sprite.y) {
            this.move(this.x,this.y);
        }

        //Handle queued deletion
        if (this.toDelete){
            this.world.deleteTile(this);
        }

        if(this.getProp("spriteName") !== this.currentSpriteName) {
            this.changeSprite(this.getProp("spriteName"));
        }

    }

    event(eventName) {
        this.context.event(eventName);
    }

    //Destroy purely the sprite, does not destroy the tile instance. 
    destroy() {        
        this.sprite.destroy(); 
    }

    /**
     * Use when deletion is done from code
     */
    queueDelete() {
        this.toDelete = true;
    }

    /**
     * General method to move a tile around
     *  */
    move(newX, newY) {
        if (newX < 0 || newX >= this.world.width ||
            newY < 0 || newY >= this.world.height
        ) {
            this.event("collideEdge");
            return;
        }

        let currentX = this.x;
        let currentY = this.y;
        let validMove = true;

        var gridPos = this.world.getGrid(newX,newY)

        for (var i = 0;i<gridPos.length;i++) {
            
            if (gridPos[i].getContext().props["solid"].value){
                validMove = false;                
                break;
            }            
        }

        // Do the move:
        if (validMove) {
            this.x = newX;
            this.y = newY;
            this.sprite.x = Utils.gridToTrue(this.x);
            this.sprite.y = Utils.gridToTrue(this.y);

            this.world.grid[currentX][currentY].delete(this);
            this.world.grid[this.x][this.y].add(this);
        }
    }  

    getContext() {
        if (this.context) {
            return this.context;
        }
        return null;
    }

    getType() {
        return this.prototype.type;
    }

    //Return the sprite that this tile currently is
    getSpriteName() {
        return this.currentSpriteName;
    }
    
    /**
     * Get a property from this tile
     *  */
    getProp(property) {
        return this.getContext().getProperty(property);
    }

    limitPosition() {
        this.x = Math.max(this.x, 0);
        this.x = Math.min(this.x, this.world.width - 1);
        this.y = Math.max(this.y, 0);
        this.y = Math.min(this.y, this.world.height - 1);
    }

    /**
     * Maintain the name for the sake of the namespace
     */
    maintainName() {
        var name = this.getProp("name");    
        if (name.length === 0) { 
            return;
        }

        //If the tile doesnt already exist in the namespace, claim the name
        if (!(name in this.world.getNameSpace())) {
            this.world.setTileName(name,this);
            //If the previously typed name refers to itself, remove it
            if (this.prevName.length > 0 && this.world.getTileByName(this.prevName)===this) {
                this.world.removeTileName(this.prevName);
            }            
            this.prevName = name;
        }

        //If the tile name refers to itself, the name is valid, if not then bad
        if (this.world.getTileByName(name) === this) {
            this.invalidName = false;
            return;
        }else{
            this.invalidName = true;
        }
  
    }
    
    /**
    *Sprite can only be changed by function or dropdown menu.
    **/
    changeSprite(newSprite) {

        if (typeof Utils.nameToMapping(newSprite) !== "undefined") {
            this.currentSpriteName = newSprite;
            this.destroy();

            this.sprite = this.world.scene.add.sprite(
                Utils.gridToTrue(this.x), 
                Utils.gridToTrue(this.y),
                Utils.nameToMapping(this.getSpriteName()).sheet,
                Utils.nameToMapping(this.getSpriteName()).index
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
    wait(event, duration) {
        this.getContext().wait(event,duration);
    }

    // For saving state.
    serialize() {
        // var saveSprite = {};
        // saveSprite.type = this.type;
        // saveSprite.name = this.name;
        // saveSprite.spriteName = this.spriteName;        
        // saveSprite.x = this.x;
        // saveSprite.y = this.y;
        // saveSprite.exposed_fields = this.exposed_fields;
        // saveSprite.solid = this.solid;
        // saveSprite.code = this.code;

        // return JSON.stringify(saveSprite);
    }
}