//@TODO, need some dead zone to click so we can deselect.
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
        this.selectionIndicator.depth = 99;

        //this.loadGame(); Game intergrate autoloading of the game.

        
        this.deleteKey = this.input.keyboard.addKey('DELETE'); //@TODO refactor for more generality, fix deletion to be an alternate input.

    }

    update () {        
        var x = Math.round(this.input.mousePointer.x/16); 
        var y = Math.round(this.input.mousePointer.y/16);   
                        
        var selected = false; // is an tile selected?
        var tentativeSelect; //tentative selection       

        //update all the sprites
        for (var i = 0;i <this.sprites.length;i++){ 
            this.sprites[i].update();
            if (this.worldGrid[this.sprites[i].x][this.sprites[i].y].size>1){
                console.log("overlap");
                //@TODO hook in the broacasts of collision.
            }

            if (this.focusObject == this.sprites[i]){
                this.sprites[i].sprite.depth = this.worldLayers+1;
            }else{
                this.sprites[i].sprite.depth = this.sprites[i].depth;
            }
        }

        //if there is a objecct being focused, the selection indicator goes to true.
        if (this.focusObject){
            this.selectionIndicator.visible = true;
            this.selectionIndicator.setPosition(this.utils.gridToTrue(this.focusObject.x),this.utils.gridToTrue(this.focusObject.y));
        }else{
            this.selectionIndicator.visible = false;
        }

        //Marker handling        
        if (y>=0 && x >=0 && x <this.worldWidth && y<this.worldHeight){         

            if (this.worldGrid[x][y].size ==1){
                selected = true;
                tentativeSelect = this.worldGrid[x][y].values().next().value;
                //@TODO rework this to handle multiple select. Easier now we hav a set to iterate through.
            }else if (this.worldGrid[x][y].size >1){
                selected = true;
                tentativeSelect = this.worldGrid[x][y];
            }

            this.marker.setPosition(this.utils.gridToTrue(x),this.utils.gridToTrue(y));           
            this.marker.visible=true;

            //Marker color
            if (selected){
                this.marker.setStrokeStyle(1,0xfff000);                
            }else{              
                this.marker.setStrokeStyle(1,0xffffff);
            }  

            //On click
            if (this.input.activePointer.primaryDown) {                
                if (this.input.activePointer.justDown){ //If the click was just done.  
                    if (typeof tentativeSelect != "undefined"){
                        if  (tentativeSelect.size){
                            this.UI.handleMultipleTargets(tentativeSelect); //Dirty way of notifying the UI that we have more than 1 potential select.                            
                            this.focusObject = tentativeSelect.values().next().value;                    
                        }else{
                            this.UI.multipleSelect = new Set(); //Empty the multiple select if not needed.
                            this.focusObject = tentativeSelect; 
                                                        
                        }                                              
                        //On click, the object clicked on becomes focused. 
                        //@TODO Maybe rework to have a stamp tool and a edit tool. More intuitive? 
                    }else{
                        //tile placement on click 
                        if (this.UI.selectionPane.value){
                            var tileSprite = new BasicTile(this,x,y,"tree");
                            if (this.UI.selectionPane.value != "Basic tile"){
                                tileSprite.applyProtoType(this.prototypes[this.UI.selectionPane.value]);   
                            }                         
                            this.sprites.push(tileSprite);
                            this.focusObject = tileSprite;                 
                        }                    
                    }
                }

                this.moveObject(this.focusObject,this.utils.trueToGrid(this.marker.x),this.utils.trueToGrid(this.marker.y));
                this.UI.displayProperties(this.focusObject); //ouput the focused objects relevant fields
                }
        }else{
            this.marker.visible=false;             
        }

        //Somewhat detection of whether or not the canvas is focused
        if (document.activeElement.nodeName == "BODY"){
            this.deleteKey.enabled = true;
            this.input.keyboard.addCapture("DELETE");
        }else{
            this.deleteKey.enabled = false;  
            this.input.keyboard.removeCapture("DELETE");               
        }
        
        if (this.deleteKey.isDown){
            this.deleteFocusObject();
        }
        
    }

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

    //general method to move a tile around
    moveObject(focus_tile,new_x,new_y){
        //Check the new position is in bounds
        //@TODO, make a warning for the user depening on which bound is over
        if(new_x < 0 || new_x >= this.worldWidth ||new_y < 0||new_y>= this.worldHeight){
            console.log("collided with world edge");
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
                if (tile.solid){
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

                if (this.worldGrid[focus_tile.x][focus_tile.y].size>1){
                    this.UI.handleMultipleTargets(this.worldGrid[focus_tile.x][focus_tile.y]);
                }
            }                                                  
        }
    }

    deleteFocusObject(){
        if (this.focusObject){
            let index = this.sprites.indexOf(this.focusObject);
            this.sprites.splice(index,1);

            //remove the tile from namespace if it has a name
            if (this.focusObject.name){
                delete this.spriteNamespace[this.focusObject.name];
            }
            //Delete the object
            this.focusObject.destroy();
            this.focusObject = undefined;

            this.UI.clearPropertyFields();
        }
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
        this.resetGame();
        //flush the current map
        console.log("Loading state");
        var saveState = JSON.parse(state);              

        for (var i = 0; i<saveState.sprites.length;i++){
            var spriteData =  JSON.parse(saveState.sprites[i]) 
                        
            //Need to repopulate the worldGrid as well as the sprites array.
            this.sprites[i] = new BasicTile(this, spriteData.x,spriteData.y,spriteData.spriteName);
            
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
        this.prototypes ={};
        this.sprites = [];     
        this.spriteNamespace = {};   
        this.worldGrid = this.initializeWorldGrid();
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