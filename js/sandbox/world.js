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
        this.prototypes = {'BasicTile': new Prototype('BasicTile')};

        this.prototypes["BasicTile"].context.addProperty('spriteName', 'tree', 'enum'); //Kinda hacky
        this.prototypes["BasicTile"].context.addProperty('name', '', 'string'); 
        this.prototypes["BasicTile"].context.addProperty('solid', false, 'boolean');        
        
        this.prototypes["BasicTile"].context.addEvent("main");
       
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
        //Update the ticks
        var date = new Date();
        
        if (this.prevTime + this.timeBetweenUpdate > date.getTime()) {
            this.isTick = false;
        }else {
            this.isTick = true;
            this.prevTime = date.getTime();
        }

        //Update sprites
        for (let sprite of this.sprites) { 

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
        return tile;
    }

    deleteTile(tile) {
        if (tile) {
            let index = this.sprites.indexOf(tile);
            this.sprites.splice(index,1);
            
            if (this.getTileByName(tile.getProp("name")) === tile){
                this.removeTileName(tile.getProp("name"));
            }
            
            // Delete the object
            tile.destroy();
            if (this.focusObject == tile) {
                this.focusObject = null;
                ui.currentTile = null;                
            }            
        }
    }  

    getTiles() {
        return this.sprites;
    }

    //Namespacing
    getTileByName(name) {
        if (name in this.nameSpace) {
            return this.nameSpace[name];
        }        
    }

    setTileName(name, tile) {        
        if (!(name in this.nameSpace)) {
            this.nameSpace[name] = tile;
        }
    }

    removeTileName(name) {
        delete this.nameSpace[name];
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

    save() {
        var saveGameObject = {};
        saveGameObject.sprites = this.sprites.map(sprite => sprite.serialize());

        localStorage.setItem("2DSandbox", JSON.stringify(saveGameObject));
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