class mainScene extends Phaser.Scene{         
    constructor ()
    {
        super("Game_Scene");
    }

    preload () {
        this.load.spritesheet('tiles', '../assets/tilesheet.png', {
            frameWidth: 16,
            frameHeight: 16
        });         

        this.utils = new Utils();
        this.UI = new userInterface(this);

        this.worldHeight = 15;
        this.worldWidth = 20;
        this.worldLayers = 10; 

        this.spriteDict = []; //dictionary mapping sprites to indexes, used for tilesheets

        this.sprites = []; //all sprites
        this.maxSprites = 100; //For now.

        this.spriteNamespace = {}; //Name dictionary to map exisiting tiles to names
        this.prototypes = {}; //map each prototype name to a new prototype. 
        
        this.spriteDict["deer"] = 1;
        this.spriteDict["snow"] = 12;
        this.spriteDict["tree"] = 0; 
    }    

    create () {
        this.map = this.make.tilemap({
            width: 100, 
            height: 100,
            tileWidth: 16,
            tileHeight: 16,
        });
        
        let tiles = this.map.addTilesetImage('tiles', null, 16, 16);
        let base = this.map.createBlankDynamicLayer('base', tiles);
        this.map.fill(2, 0, 0, this.map.width, this.map.height, 'base');

        this.worldGrid = this.initializeWorldGrid();

        //Marker for what the mouse is currently over.
        this.marker = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1,0xffffff);  
        this.marker.depth = 100; //magic numbered to always be on top.
        
        //Indicator to which block is currently selected. Need to rework when we have to deal with more than one block.
        this.selectionIndicator = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1,0x008000); 
        this.selectionIndicator.visible=false;
        this.selectionIndicator.depth = 99; //selection indicator always on top.

        this.deleteKey = this.input.keyboard.addKey('DELETE'); //@TODO refactor for more generality, fix deletion to be an alternate input.

        this.loadGame(); //Game intergrate autoloading of the game
        //Some bugs, breaks down on really large scenes.

        this.queuedActions = [];
        var date = new Date();
        this.waitTimer = date.getTime();

        this.dummySpawn();

        //Save on exiting the window. 
        window.addEventListener("beforeunload", function(event){
            this.saveGame();
        }.bind(this));       
    }

    update () {                  
        //@TODO different pointers for different tools.
        this.updateSelf();
        this.updateSprites();
        this.updateMarker();   
        this.updateSelectionMarker(); 
        this.updateKeyboard();  

    }


    //UPDATE HELPERS
    updateSprites(){
        //UPDATING SPRITES
        for (var i = 0;i <this.sprites.length;i++){ 
            this.sprites[i].update();

            if (typeof this.sprites[i] !== "undefined"){
                if (this.worldGrid[this.sprites[i].x][this.sprites[i].y].size>1){
                    console.log("overlap");
                    //@TODO hook in the broadcasts of collision.
                }
                //Bring the focused Tile to the top.
                if (this.focusObject == this.sprites[i]){
                    this.sprites[i].sprite.depth = this.worldLayers+1;
                }else{
                    this.sprites[i].sprite.depth = this.sprites[i].layer;
                } 
            }                      
        }
    }

    //Used for programmed events.
    updateSelf(){
        var date = new Date();
        //For use with the wait primitive function.
        if (this.queuedActions.length>0 && date.getTime()>this.waitTimer){
            var action = this.queuedActions.shift();
            action();
        }    
    }

    //Used to handle the mouse marker.
    updateMarker(){
        var x = Math.round(this.input.mousePointer.x/16); 
        var y = Math.round(this.input.mousePointer.y/16);         

        var tool = this.UI.getTool(); //Which tool is currently in use.
        
        //MARKER HANDLING     
        if (y>=0 && x >=0 && x <this.worldWidth && y<this.worldHeight){ 
            this.marker.setPosition(this.utils.gridToTrue(x),this.utils.gridToTrue(y));           
            this.marker.visible=true;

            //Hover over in select mode.
            if (this.worldGrid[x][y].size ==1 && tool == "select"){
                this.marker.setStrokeStyle(1,0x00008b); //Set the color of the selector.
            }else if (this.worldGrid[x][y].size > 1 && tool == "select"){
                this.marker.setStrokeStyle(1,0x0000ff);
            }else{
                this.marker.setStrokeStyle(1,0xffffff);
            }          

            //On Click
            if (this.input.activePointer.primaryDown){                
                if (this.input.activePointer.justDown){ //If the click was just done.  
                    if (tool == "select"){
                        if (this.worldGrid[x][y].size == 0){ //If the hovered area has no object
                            this.focusObject = false;
                            this.UI.clearPropertyFields();
                        }else if (this.worldGrid[x][y].size == 1){ //If hovered area has more than 1 object, i.e. is a set
                            this.UI.multipleSelect = new Set(); //Empty the multiple select if not needed.
                            this.focusObject = this.worldGrid[x][y].values().next().value; 

                        }else if (this.worldGrid[x][y] > 1){                            
                            this.UI.handleMultipleTargets(this.worldGrid[x][y]); //Dirty way of notifying the UI that we have more than 1 potential select.                         
                            this.focusObject = this.worldGrid[x][y].values().next().value; 
                        } 

                    }else if (tool == "create"){
                        //tile placement on click 
                        if (this.UI.selectionPane.value){
                            //Should we be able to create on an solid tile?
                            var tileSprite = this.makeTile(x,y,this.UI.selectionPane.value);                       

                            if (tileSprite){
                                this.focusObject = tileSprite;     
                            }                         
                                           
                        }                    
                    }
                }
                //Moving and displaying should be done even if the key is being held down.
                this.moveObject(this.focusObject,this.utils.trueToGrid(this.marker.x),this.utils.trueToGrid(this.marker.y));
                this.UI.displayProperties(this.focusObject); //ouput the focused objects relevant fields
                }
        }else{
            this.marker.visible=false;             
        }
    }

    updateSelectionMarker(){
        //SELECTION MARKER
        //if there is a objecct being focused, the selection indicator goes to true.
        if (this.focusObject){
            this.selectionIndicator.visible = true;
            this.selectionIndicator.setPosition(this.utils.gridToTrue(this.focusObject.x),this.utils.gridToTrue(this.focusObject.y));
        }else{
            this.selectionIndicator.visible = false;
        } 
    }

    updateKeyboard(){
        //Deletion shouldn't work when on text areas and input. 
        var activeElementType = document.activeElement.type;
        if (activeElementType == "text"|| activeElementType == "textarea"|| activeElementType == "number"){
            this.deleteKey.enabled = false;  
            this.input.keyboard.removeCapture("DELETE"); 
        }else{           
            this.deleteKey.enabled = true;
            this.input.keyboard.addCapture("DELETE");
        }

        //Delete key polling.
        if (this.deleteKey.isDown){
            this.deleteTile(this.focusObject);
        } 

    }

    wait(duration){
        var date = new Date();
        this.waitTimer = date.getTime()+duration;
    }

    
    //Called to create the grid of Game Objects
    initializeWorldGrid(){
        let grid = [];
        for (var i =0;i<this.worldWidth;i++){
            grid[i] = new Array(this.worldHeight);
            for (var j = 0; j<this.worldHeight;j++){
                grid[i][j] = new Set();
            }
        }
        return grid;
    }



    //General method to move a tile around
    moveObject(focus_tile,new_x,new_y){
        //Check the new position is in bounds
        if(new_x < 0 || new_x >= this.worldWidth ||new_y < 0||new_y >= this.worldHeight){
            console.log("collided with world edge");
            focus_tile.onCollideEdge();
            return;
        }

        if (new_x.length == 0 || new_y.length == 0){
            console.log("No Input");
            return;
        }
        
        if (focus_tile){
            let currentX = focus_tile.x;
            let currentY = focus_tile.y;

            var validMove = true;

            //if the focus tile is solid, it should not be able to stack on anything.
            if (focus_tile.solid){
                if (this.worldGrid[new_x][new_y].size > 0){
                    validMove = false;
                }
            }
            //check if all the tiles in the landing zone are not solid
            for (var tile of this.worldGrid[new_x][new_y]){
                if (tile.solid && tile!=focus_tile){
                    console.log("blocked by an impassable tile")
                    validMove = false;
                    break;
                }
            }
            //do the move.
            if (validMove){
                focus_tile.x= new_x;
                focus_tile.y = new_y;
                this.worldGrid[currentX][currentY].delete(focus_tile);
                this.worldGrid[focus_tile.x][focus_tile.y].add(focus_tile);

                if (this.focusObject == focus_tile){
                    if (document.activeElement.parentElement.className != "propertyDiv"){
                        this.UI.displayProperties(focus_tile);
                    }
                    
                    if (this.worldGrid[focus_tile.x][focus_tile.y].size>1){
                        this.UI.handleMultipleTargets(this.worldGrid[focus_tile.x][focus_tile.y]);
                    }
                }

                
            }                                                  
        }
    }

    deleteTile(tile){
        if (tile){
            let index = this.sprites.indexOf(tile);
            this.sprites.splice(index,1);

            //remove the tile from namespace if it has a name
            if (tile.name){
                delete this.spriteNamespace[this.focusObject.name];
            }
            //Delete the object
            tile.destroy();
            if (this.focusObject == tile){
                this.focusObject = false;
                this.UI.clearPropertyFields();
            }            
        }
    }

    makeTile(x,y,prototype){
        if (x < 0 || x >=this.worldWidth){
            return false;
        }

        if (y <0 || y >= this.worldHeight){
            return false;
        }

        if (!prototype in this.prototypes && prototype != "BasicTile"){
            return false;
        }

        if  (this.sprites.length >= this.maxSprites){
            console.log("Hit the sprite limit");
            return false;
        }

        if (prototype == "BasicTile"){           
            var tileSprite =new BasicTile(this,x,y,"tree");

        }else if (prototype in this.prototypes){
            var tileSprite = new BasicTile(this,x,y,"tree");

            tileSprite.applyProtoType(this.prototypes[prototype]);
        }

        this.sprites.push(tileSprite);
        return tileSprite;
    }
    
    saveGame(){
        var saveGameObject = {};

        saveGameObject.prototypes = this.prototypes;

        saveGameObject.sprites = this.sprites.map(function(sprite){
            return sprite.serialize();
        });

        localStorage.setItem("2DSandbox",JSON.stringify(saveGameObject));
    }

    loadGame(){
        var state = localStorage.getItem("2DSandbox");

        if (state === null){
            return;
        }        
        this.resetGame();
        //flush the current map

        console.log("Loading state");
        var saveState = JSON.parse(state);  
        
                
        for (var i = 0; i<saveState.sprites.length;i++){
            var spriteData =  JSON.parse(saveState.sprites[i]);
                        
            //Need to repopulate the worldGrid as well as the sprites array.
            //Keep loadgame this way to deal with prototype being deleted when existing sprites are out.
            this.sprites[i] = new BasicTile(this, spriteData.x,spriteData.y,spriteData.spriteName);
            this.sprites[i].type = spriteData.type;
            this.UI.renameObject(this.sprites[i], spriteData.name);    

            for (var field in spriteData.exposed_fields){
                this.sprites[i].exposed_fields[field] = spriteData.exposed_fields[field];
            }       
        }
        for (var prototype in saveState.prototypes){
            this.prototypes[prototype] = saveState.prototypes[prototype];
            //@TODO prototype doesn't hold.
            this.UI.addPrototypeToList(prototype);
        }
    }

    resetGame(){
        for (var i =0;i<this.sprites.length;i++){
            this.sprites[i].destroy();
        }
        this.prototypes ={};
        this.sprites = [];     
        this.spriteNamespace = {};   
        this.worldGrid = this.initializeWorldGrid();
    }


    //Testing functions.
    dummySpawn(){
        this.resetGame();

        for (var i = 0; i <5; i++){
            this.queuedActions.push(function(){
                this.wait(100);
            }.bind(this));

            this.queuedActions.push(function(){
                var x = 0;
                var y = 5;

                var tile = this.makeTile(x,y,"BasicTile");
                if (tile){

                    //Can now set on trying to exit scene events.
                    tile.setWhenExitScene(function(){
                        console.log("Collide");
                        this.deleteTile(tile);
                    }.bind(this));
                    this.dummyMove(tile);
                }                
            }.bind(this));
        }
    }

    
    dummyMove(activeTile){
        for (var j = 0; j<20;j++){
            activeTile.queuedActions.push(function(){
                var x = activeTile.x + 1;
                var y = activeTile.y + 1 ;
                //this.makeTile(activeTile.x,activeTile.y,"BasicTile");
                activeTile.actions["moveObject"](x,y);                
            });

            activeTile.queuedActions.push(function(){
                activeTile.actions["wait"](1000);
            });
        }
    }
   
}

var config = {
    type: Phaser.AUTO,
    width: 320,
    height: 240,
    parent: 'sandbox',
    pixelArt: true,
    zoom: 2,
    scene: [mainScene]
}

let game = new Phaser.Game(config);
