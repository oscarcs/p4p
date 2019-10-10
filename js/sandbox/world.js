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
        this.initPrototypes();       
        ui.prototypes = this.prototypes;

        this.sprites = [];
        this.nameSpace = {};
        this.grid = this.createGrid();

        var date = new Date();
        this.timeBetweenUpdate = 75; 

        this.prevTime = date.getTime()
        this.isTick = false;

        this.addTile(0, 0, this.getPrototype('BasicTile'));
    }

    //Clears the prototype list and puts in the basic tile. 
    initPrototypes() {        
        this.prototypes = {};
        this.prototypes = {'BasicTile': new Prototype('BasicTile')};

        this.prototypes["BasicTile"].context.addProperty('image', 'base', 'enum'); //Kinda hacky 
        this.prototypes["BasicTile"].context.addProperty('name', '', 'string'); 
        this.prototypes["BasicTile"].context.addProperty('solid', false, 'boolean');      
        
        this.prototypes["BasicTile"].context.addEvent("main");

        this.prototypes["BasicTile"].context.addEvent("whenCreated");

        this.prototypes["BasicTile"].context.addEvent("collideEdge");
        this.prototypes["BasicTile"].context.addLocal("collideEdge", "evX", "","number");
        this.prototypes["BasicTile"].context.addLocal("collideEdge", "evY", "","number");

        //Not sure on the use of evX.
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

    }

    //Creates the co-ords for the world
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
       
        return tile;
    }

    deleteTile(tile) {
        if (tile) {
            let index = this.sprites.indexOf(tile);
            this.sprites.splice(index,1);

            this.grid[tile.x][tile.y].delete(tile);
            
            if (this.getTileByName(tile.getProperty('name')) === tile) {
                this.removeTileName(tile.getProperty('name'));
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
    
    removeTileName(name) {
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
        ui.running=true;
        for (let sprite of this.sprites) {
            sprite.getContext().start("main");
            sprite.enableEvents();
        }
    }

    stopAll() {
        ui.running=false;
        for (let sprite of this.sprites) {
            for (let event of sprite.getContext().getEventList()) {
                sprite.getContext().stop(event);
            }
        }       
    }


    //SAVING OPERATIONS     
    //Delete all sprites.
    clearAll() {
        for (var i=this.sprites.length-1;i>=0;i--) {
            this.sprites[i].destroy()
        }
        for (let prototype in this.prototypes) {
            //Hmmm
            Vue.delete(this.prototypes,prototype);

            this.initPrototypes();       
            ui.prototypes = this.prototypes;

        }
    }


    //@@TODO save on exit to local storate but also save to JSON
    saveGame() {
        var saveGameObject = {};
        //Save all the sprites in the world
        saveGameObject.sprites = this.sprites.map(sprite => sprite.serialize()); 
        
        //Check world for any tiles with undefine prototypes and add to prototypes        
        for (let sprite of this.sprites) {
            if (!(sprite.getType() in this.prototypes)){
                Vue.set(this.prototypes, 
                        sprite.getType(), 
                        new Prototype(sprite.getType(),sprite)
                        );
            }
        }

        saveGameObject.prototypes = this.prototypes;

        var saveFile = JSON.stringify(saveGameObject);
        
        return saveFile;
        //localStorage.setItem("2DSandbox", JSON.stringify(saveGameObject));
    }

    /**
     * Enables a Json file to be saved locally to a users computer.
     * @param  file to be saved 
     */
    download(file) {        
        var data = "text/json;charset=utf-8," + encodeURIComponent(file);
        
        var a = document.createElement('a');
        a.href = 'data:' + data;
        a.download = 'myGame.json';
        
        var container = document.getElementById('app');
        container.appendChild(a);
        a.click();
        container.removeChild(a);
    }


    /**
     * Loads a game from a JSON file
     */
    loadGame(saveFile) {
        //var state = localStorage.getItem("2DSandbox");

        //if (state === null) {
            //return;
        //}
        this.clearAll();

        var saveState = JSON.parse(saveFile);
        
        //Prototype loading 
        for (let key in saveState.prototypes) {
            var prototype = new Prototype(key);      
            var savedPrototype = saveState.prototypes[key];

            this.loadContextFromSave(prototype.context,savedPrototype.context);
            Vue.set(this.prototypes,key,prototype);
        }            
         
        //Sprite loading
        for (var i = 0; i< saveState.sprites.length;i++){
            var savedSprite = JSON.parse(saveState.sprites[i]);  

            //@@TODO, prototypes
            var tile = this.addTile(savedSprite.x,savedSprite.y,this.getPrototype(savedSprite.prototype.type)); 
            tile.layer = savedSprite.layer;
            
            tile.getContext().props = savedSprite.props;
            tile.getContext().actions = savedSprite.actions;

            for (let event in savedSprite.events) {
                tile.getContext().events[event].code = savedSprite.events[event].code;
                tile.getContext().events[event].locals = savedSprite.events[event].locals;
            }              
        }
    }

    //Bit ugly
    loadContextFromSave(newContext, savedContext) {
            //Copying saved properties from the JSON
            var savedProps = savedContext.props;
            for (let prop in savedProps) {
                newContext.addProperty(
                    prop,
                    savedProps[prop].value,
                    savedProps[prop].type);
            }
            //Copying events over
            var savedEvents = savedContext.events;
            for (let event in savedEvents) {
                newContext.addEvent(event);
                newContext.events[event].code = savedEvents[event].code;

                for (let local in savedEvents[event].locals) {                    
                    newContext.addLocal(
                        event,
                        local,
                        savedEvents[event].locals[local].value,
                        savedEvents[event].locals[local].type);
                }
            } 
    }

    toggleDevMode() {
        ui.devMode = ! ui.devMode;
    }
}