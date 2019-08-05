class World {
    constructor(scene) {
        this.scene = scene;

        window.addEventListener("beforeunload", function(event) {
            this.saveGame();
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

        //@@UI
        ui.prototypes = this.prototypes;

        this.sprites = [];
        this.grid = this.createGrid();

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
        return Array.from(this.grid[x][y]);
    }

    update() {
        for (let sprite of this.sprites) { 
            
            sprite.update();

            // if (this.worldGrid[sprite.x][sprite.y].size > 1) {
                // console.log("overlap");
                // @TODO hook in the broadcasts of collision.
            // }
            
            // Bring the focused Tile to the top.

            if (this.scene.focusObject == sprite) {
                sprite.sprite.depth = this.layers + 1;
            }
            else {
                sprite.sprite.depth = sprite.layer;
            }
        }
    }

    addTile(x, y, prototype) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
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
            
            // Delete the object
            tile.destroy();
            if (this.focusObject == tile) {
                this.focusObject = null;
            }            
        }
    }  

    getPrototype(name) {
        return this.prototypes[name];
    }

    getPrototypeList() {
        return Object.values(this.prototypes);
    }

    saveGame() {
        // var saveGameObject = {};

        // saveGameObject.prototypes = this.prototypes;

        // saveGameObject.sprites = this.sprites.map(function(sprite) {
        //     return sprite.serialize();
        // });

        // localStorage.setItem("2DSandbox", JSON.stringify(saveGameObject));
    }

    loadGame() {
        // var state = localStorage.getItem("2DSandbox");

        // if (state === null) {
        //     return;
        // }

        // var saveState = JSON.parse(state);
                
        // for (var i = 0; i < saveState.sprites.length; i++) {
        //     var spriteData = JSON.parse(saveState.sprites[i]);
                        
        //     // Need to repopulate the worldGrid as well as the sprites array.
        //     // Keep loadgame this way to deal with prototype being deleted when existing sprites are out.
        //     this.sprites[i] = new Tile(this, spriteData.x,spriteData.y,spriteData.spriteName);
        //     this.sprites[i].type = spriteData.type;
        //     this.sprites[i].code = spriteData.code;

        //     for (var field in spriteData.exposed_fields) {
        //         this.sprites[i].exposed_fields[field] = spriteData.exposed_fields[field];
        //     }
        // }

        // for (var prototype in saveState.prototypes) {
        //     this.prototypes[prototype] = saveState.prototypes[prototype];
        // }
    }
}