class Tile {   
    constructor(world, x, y, prototype) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.prototype = prototype;
        
        var date = new Date();      
        this.waitTimer = date.getTime();

        this.initialize(prototype);
    }

    initialize(prototype) {
        if (this.sprite) {
            this.sprite.destroy();
        }

        this.sprite = this.world.scene.add.sprite(
            Utils.gridToTrue(this.x), 
            Utils.gridToTrue(this.y),
            'tiles',
            Utils.nameToIndex(prototype.spriteName)
        );

        this.layer = 1;
        this.sprite.depth = 1;

        this.context = new ExecutionContext();
        this.context.addProperty('solid', false, 'boolean');
        this.context.addProperty('name', 'test', 'string');
        this.context.addEvent('main');
    }

    update() {
        this.limitPosition(); 

        // Update the position of the sprite according to the tile x and y.
        if (Utils.gridToTrue(this.x) !== this.sprite.x || Utils.gridToTrue(this.y) !== this.sprite.y) {
            this.sprite.x = Utils.gridToTrue(this.x);
            this.sprite.y = Utils.gridToTrue(this.y);           
        }
    }

    destroy() {        
        this.sprite.destroy(); 
    }

    // General method to move a tile around
    move(newX, newY) {
        if (newX < 0 || newX >= this.world.width ||
            newY < 0 || newY >= this.world.height
        ) {
            return;
        }

        let currentX = this.x;
        let currentY = this.y;
        let validMove = true;

        // Do the move:
        if (validMove) {
            this.x = newX;
            this.y = newY;
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

    limitPosition() {
        this.x = Math.max(this.x, 0);
        this.x = Math.min(this.x, this.world.width - 1);
        this.y = Math.max(this.y, 0);
        this.y = Math.min(this.y, this.world.height - 1);
    }

    changeSprite(newSprite) {
        // if (this.spriteName == newSprite) {
        //     //lazy update
        //     return;
        // }

        // if (this.world.spriteDict[newSprite] != undefined) {
        //     this.spriteName = newSprite;
        //     var index = this.world.spriteDict[newSprite];

        //     this.sprite.destroy();            
        //     this.sprite = this.world.add.sprite(
        //         Utils.gridToTrue(this.x), 
        //         Utils.gridToTrue(this.y),
        //         'tiles',
        //         index
        //     );
        // }
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
    wait(duration) {
        var date = new Date();
        this.waitTimer = date.getTime() + duration;
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