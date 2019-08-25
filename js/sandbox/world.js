class World {
    constructor(scene) {
        this.scene = scene;

        window.addEventListener("beforeunload", function(event) {
            this.save();
        }.bind(this));  

        this.initialize();
    }

    initialize() {
        this.height = 15;
        this.width = 20;
        this.layers = 10;

        for (let key in this.sprites) {
            this.sprites[key].destroy();
        }

        //loadGame here if available

        this.prototypes = {'BasicTile': new Prototype('BasicTile')};

        this.prototypes["BasicTile"].context.addProperty('spriteName', 'tree', 'enum'); //Kinda hacky
        this.prototypes["BasicTile"].context.addProperty('name', '', 'string'); 
        this.prototypes["BasicTile"].context.addProperty('solid', false, 'boolean');        
        
        this.prototypes["BasicTile"].context.addEvent("main");
        this.prototypes["BasicTile"].context.addEvent("collideEdge");
        this.prototypes["BasicTile"].context.addLocal("collideEdge", "evX", "","number");
        this.prototypes["BasicTile"].context.addLocal("collideEdge", "evY", "","number");


        this.prototypes["BasicTile"].context.addEvent("collideSolidTile");
        this.prototypes["BasicTile"].context.addLocal("collideSolidTile", "evX", "","number");
        this.prototypes["BasicTile"].context.addLocal("collideSolidTile", "evY", "","number");

        this.prototypes["BasicTile"].context.addEvent("whenOverlap");
        this.prototypes["BasicTile"].context.addLocal("whenOverlap", "evX", "","number");
        this.prototypes["BasicTile"].context.addLocal("whenOverlap", "evY", "","number");

        this.prototypes["BasicTile"].context.addEvent("keyPress_space");
        this.prototypes["BasicTile"].context.addEvent("keyPress_up");
        this.prototypes["BasicTile"].context.addEvent("keyPress_left");
        this.prototypes["BasicTile"].context.addEvent("keyPress_right");
        this.prototypes["BasicTile"].context.addEvent("keyPress_down");
        
       
        ui.prototypes = this.prototypes;

        this.sprites = [];
        this.nameSpace = {};
        this.grid = this.createGrid();

        var date = new Date();
        this.timeBetweenUpdate = 100; 

        this.prevTime = date.getTime()
        this.isTick = false;

        this.addTile(0, 0, this.getPrototype('BasicTile'));
    }

    createGrid() {
        let grid = [];
        for (var i = 0; i < this.width; i++) {
            grid[i] = new Array(this.height);
            
            for (var j = 0; j < this.height; j++) {
                grid[i][j] = new Set();
            }
        }
        return grid;
    }

    getGrid(x, y) {
        if (typeof this.grid[x] !== 'undefined' && typeof this.grid[x][y] !== 'undefined') {
            return Array.from(this.grid[x][y]);
        }
        return [];
    }

    update() {        
        // Update the ticks
        var date = new Date();
       
        if (this.prevTime + this.timeBetweenUpdate > date.getTime()) {
            this.isTick = false;
        }
        else {
            this.isTick = true;
            this.prevTime = date.getTime();
        }

        for (let sprite of this.sprites) { 
            if (this.getGrid(sprite.x,sprite.y).length >1){
                sprite.getContext().setLocal("whenOverlap", "evX",sprite.x);
                sprite.getContext().setLocal("whenOverlap","evY",sprite.y);
                sprite.event("whenOverlap");
            }

            // Bring the focused tile to the top.
            if (this.focusObject == sprite) {
                sprite.sprite.depth = this.layers + 1;
            }
            else {
                sprite.sprite.depth = sprite.layer;
            }

            sprite.update();
        }
    }

    event(eventName) {
        for (let sprite of this.sprites) {
            sprite.event(eventName);
        }
    }

    addTile(x, y, prototype) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }

        if (typeof prototype === "undefined") {
            return false;
        }

        let tile = new Tile(this, x, y, prototype);
        this.sprites.push(tile);
        this.grid[x][y].add(tile);
        //@@TODO, make the tile on create event start here.
        //@@TODO, all the events sans main should be started on creation.
        return tile;
    }

    deleteTile(tile) {
        if (tile) {
            let index = this.sprites.indexOf(tile);
            this.sprites.splice(index,1);

            this.grid[tile.x][tile.y].delete(tile);
            
            if (this.getTileByName(tile.getProperty('name')) === tile) {
                this.removeTileByName(tile.getProperty('name'));
            }
            
            // Delete the object
            tile.sprite.destroy();
            if (this.focusObject == tile) {
                this.focusObject = null;
                ui.currentTile = null;                
            }            
        }
    }  

    getTiles() {
        return this.sprites;
    }

    getTileByName(name) {
        if (name in this.nameSpace) {
            return this.nameSpace[name];
        }        
    }
    
    removeTileByName(name) {
        delete this.nameSpace[name];
    }

    setTileName(name, tile) {        
        if (!(name in this.nameSpace)) {
            this.nameSpace[name] = tile;
        }
    }

    getNameSpace() { 
        return this.nameSpace;
    }

    getPrototype(name) {
        return this.prototypes[name];
    }

    getPrototypeList() {
        return Object.values(this.prototypes);
    }

    getIsTick(){
        return this.isTick;
    }

    goAll() {
        for (let sprite of this.sprites) {
            for (let event of sprite.getContext().getEventList())  {
                sprite.getContext().start(event);
                if (event !== "main") {
                    sprite.getContext().stop(event); //simply stops the event running.
                }
                //Start the interpreter at root for event at the root but the event is not running. 
            }
        }
    }

    stopAll() {
        for (let sprite of this.sprites) {
            for (let event of sprite.getContext().getEventList()) {
                sprite.getContext().stop(event);
            }
        }
        this.save();
    }

    save() {
        var saveGameObject = {};
        //Save all the sprites in the world
        saveGameObject.sprites = this.sprites.map(sprite => sprite.serialize());

        //saveGameObject.prototypes = this.prototypes;
        var saveThing = JSON.stringify(saveGameObject);


        //@@TODO make loading sprites work
        var saveState = JSON.parse(saveThing);

        for (var i = 0; i< saveState.sprites.length;i++){
            var sprite = JSON.parse(saveState.sprites[i]);

            //gets position of all the sprites. 
            //but doesn't get prototype, make a Basic tile and manuall copy over all the data.
        }
        //localStorage.setItem("2DSandbox", JSON.stringify(saveGameObject));
    }

    load() {
        var state = localStorage.getItem("2DSandbox");

        if (state === null) {
            return;
        }

        var saveState = JSON.parse(state);
                
        for (var i = 0; i < saveState.sprites.length; i++) {
            var spriteData = JSON.parse(saveState.sprites[i]);
                        
            // Need to repopulate the worldGrid as well as the sprites array.
            // Keep loadgame this way to deal with prototype being deleted when existing sprites are out.
            this.sprites[i] = new Tile(this, spriteData.x,spriteData.y,spriteData.spriteName);
            this.sprites[i].type = spriteData.type;
            this.sprites[i].code = spriteData.code;

            for (var field in spriteData.exposed_fields) {
                this.sprites[i].exposed_fields[field] = spriteData.exposed_fields[field];
            }
        }

        for (var prototype in saveState.prototypes) {
            this.prototypes[prototype] = saveState.prototypes[prototype];
        }
    }
}