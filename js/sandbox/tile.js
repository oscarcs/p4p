class Tile {   
    constructor(world, x, y, prototype) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.prototype = prototype;

        this.prevName = '';
        this.invalidName = false;
        
        this.initialize(prototype);
        this.enableEvents();
        this.event("whenCreated");
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
        if (Utils.gridToTrue(this.x) !== this.sprite.x ||
            Utils.gridToTrue(this.y) !== this.sprite.y
        ) {
            this.move(this.x, this.y);
        }

        if (this.getProperty('spriteName') !== this.currentSpriteName) {
            this.changeSprite(this.getProperty('spriteName'));
        }

    }

    event(eventName) {
        this.context.event(eventName);
    }

    /**
     * General method to move a tile around
     *  */
    move(newX, newY) {
        if (newX < 0 || newX >= this.world.width ||
            newY < 0 || newY >= this.world.height
        ) {
            this.getContext().setLocal("collideEdge","evX",newX);
            this.getContext().setLocal("collideEdge","evY",newY);
            this.event("collideEdge");
            return;
        }

        let currentX = this.x;
        let currentY = this.y;
        let validMove = true;

        var gridPos = this.world.getGrid(newX, newY);

        for (var i = 0; i < gridPos.length; i++) {
            if (gridPos[i].getContext().lookup('undefined','solid')) {
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
        }else {
            this.getContext().setLocal("collideSolidTile","evX",newX);
            this.getContext().setLocal("collideSolidTile","evY",newY);
            this.event("collideSolidTile");
        }
    }  

    getContext() {
        if (this.context) {
            return this.context;
        }
        return null;
    }

    setPrototype(prototype) {
        this.prototype = prototype;
    }

    getType() {
        return this.prototype.type;
    }

    getSpriteName() {
        return this.currentSpriteName;
    }
    
    getProperty(property) {
        return this.getContext().getProperty(property);
    }

    limitPosition() {
        this.x = Math.max(this.x, 0);
        this.x = Math.min(this.x, this.world.width - 1);
        this.y = Math.max(this.y, 0);
        this.y = Math.min(this.y, this.world.height - 1);
    }

    /**
     * Enable the events of a tile to be triggered.  
     */
    enableEvents() {
        for (let event of this.getContext().getEventList()) {                     
            if (event !== "main") {
                this.getContext().start(event);
                this.getContext().stop(event);
            }
        }
    }

    /**
     * Maintain the name for the sake of the namespace
     */
    maintainName() {
        var name = this.getProperty("name");    
        if (name.length === 0) { 
            return;
        }

        //If the tile doesnt already exist in the namespace, claim the name
        if (!(name in this.world.getNameSpace())) {
            this.world.setTileName(name,this);
            //If the previously typed name refers to itself, remove it
            if (this.prevName.length > 0 && this.world.getTileByName(this.prevName) === this) {
                this.world.removeTileName(this.prevName);
            }            
            this.prevName = name;
        }

        //If the tile name refers to itself, the name is valid, if not then bad
        if (this.world.getTileByName(name) === this) {
            this.invalidName = false;
            return;
        }
        else {
            this.invalidName = true;
        }  
    }
    
    /*******************************************************************************
     * 
     * 
     *                     B U I L T - I N  F U N C T I O N S
     *                                     |
     *                                    \ /
     *                                     
     *******************************************************************************/

    print() {
        let str = Array.from(arguments).join(', ');
        //@@TODO: print to screen or something somehow
        console.log(str);
        return str;
    }

    alert() {
        let str = Array.from(arguments).join(', ');
        alert(str);
        return str;
    }

    changeSprite(newSprite) {
        if (typeof Utils.nameToMapping(newSprite) !== "undefined") {
            this.currentSpriteName = newSprite;
            this.context.setProperty('spriteName', newSprite);

            this.sprite.destroy();
            this.sprite = this.world.scene.add.sprite(
                Utils.gridToTrue(this.x), 
                Utils.gridToTrue(this.y),
                Utils.nameToMapping(this.getSpriteName()).sheet,
                Utils.nameToMapping(this.getSpriteName()).index
            );
            console.log(Utils.nameToMapping(this.getSpriteName()).sheet, this.currentSpriteName);

            return true;
        }
        return false;
    }

    //@@DESIGN: Limit depth to 10 layers?
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
    //@@TODO make this work.
    wait(event, duration) {
        this.getContext().wait(event, duration);
    }

    //movement primitives
    moveUp(distance) {
        var dist = 1
        if (distance){
            dist = distance;
        }
        this.move(this.x,this.y-dist);
    }

    moveDown(distance) {
        var dist = 1
        if (distance){
            dist = distance;
        }
        this.move(this.x,this.y+dist);
    }
    
    moveLeft(distance) {
        var dist = 1
        if (distance){
            dist = distance;
        }
        this.move(this.x-dist,this.y);
    }

    moveRight(distance) {
        var dist = 1
        if (distance){
            dist = distance;
        }
        this.move(this.x+dist,this.y);
    }

    //Check if a cell is empty
    checkEmpty(x,y) {
        if (this.world.getGrid(x,y).length === 0) {
            return true;
        }else {
            return false;
        }
    }

    checkContains(x,y,tileType) {
        var cell = this.world.getGrid(x,y);
        for (var i in cell) {
            if (cell[i].getType() === tileType) {
                return true;
            }
        }

        return false;
    }

    randomNum(max) {
        return Math.floor(Math.random()*max);
    }

    addTile(x,y,prototype) {
        this.world.addTile(x,y,this.world.getPrototype(prototype));
    }

    destroy() {        
        this.world.deleteTile(this); 
    }

    getTileProperty(tileName, property) {
        var tile = this.world.getTileByName(tileName);
        if (tile) {
            return tile.getProperty(property);
        }
    }



    // For saving state.
    serialize() {
        var saveSprite = {};      
        saveSprite.x = this.x;
        saveSprite.y = this.y;
        saveSprite.prototype = this.prototype;
        

        return JSON.stringify(saveSprite);
    }
}