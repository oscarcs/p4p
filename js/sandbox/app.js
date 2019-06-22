class Utils{
    //Helper class to manage grid location conversions.

    //get the true value postion on screen given the grid position
    gridXtoTrueX(x){
        return x*16+8;
    }

    gridYtoTrueY(y){
        return y*16+40;
    }

    TrueXtoGridX(grid_x){
        return (grid_x-8)/16;
    }
    
    TrueYtoGridY(grid_y){
        return(grid_y-40)/16;
    }

}

class BasicTile
{
    /*
    world;
    x; // x position in terms of the game grid
    y;
    sprite;   
    
    solid = false; //Should this block allow other blocks to "overlap"
    */

    constructor(world,x,y,index,name=undefined){
        this.world=world;
        
        this.exposed_fields = []; //array of exposed fields mapped to their values. 
        
        this.x = x;
        this.y = y;
        this.sprite = this.world.add.sprite(world.utils.gridXtoTrueX(x), world.utils.gridYtoTrueY(y), 'tiles',index);
        this.sprite.depth = 1;  
        this.solid = false;
        this.name; 

        if (index === 0){
            this.solid = true;
        }

        //Demo only, force deer to be on top.
        if (index === 1){
            this.sprite.depth = 2;
        }
    }
    
    update(){               
        //further instructions for each block type to be hooked into here
        //Parser.getnextInstruction for example        
        if (this.world.utils.gridXtoTrueX(this.x)!==this.sprite.x || this.world.utils.gridYtoTrueY(this.y)!==this.sprite.y){
            //lazy update position
            this.sprite.x = this.world.utils.gridXtoTrueX(this.x);
            this.sprite.y = this.world.utils.gridYtoTrueY(this.y);           
        }        
        
    }

    destroy(){
        if (this.solid){
            this.world.worldGrid[this.x][this.y] = 0;
        }
        this.sprite.destroy(); 
    }

    //Events should be in the update loop and will be exectured if the flag is set. (Ensures unison.)
    cursorAction(cursor, action){
        //Nothing as of now     
        
    }

    //@TODO need to make a some way to set an interval between actions without blocking.
    //Use getTime() and a variable. prevTime. i.e. if getTime() - prevTime> some threshhold,
    //sprite can do action. 
   
}

class mainScene extends Phaser.Scene
{   
      
    constructor ()
    {
        super("Game_Scene");
    }

    preload () {
        this.load.spritesheet('tiles', '../assets/tilesheet.png', {
            frameWidth: 16,
            frameHeight: 16
        });         

        this.worldHeight = 13;
        this.worldWidth = 20;

        this.spriteDict = []; //dictionary mapping sprites to indexes
        this.sprites = []; //all sprites
        this.spriteNamespace = []; //Name dictionary to map exisiting tiles to names
        
        this.spriteDict["deer"] = 1;
        this.spriteDict["snow"] = 12;
        this.spriteDict["tree"] = 0; 

        //treat blocks that span more than 1 block differrently.
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

        this.utils = new Utils();

        this.worldGrid = this.initializeWorldGrid();

        this.marker = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1,0xffffff);       
        
        this.deleteKey = this.input.keyboard.addKey('DELETE'); //@TODO refactor for more generality        
        this.cursorKeys = this.input.keyboard.createCursorKeys();//initial keyboard event for arrow keys.

        this.prevTime = 0;

        this.scene.launch("Block_Menu");  
    }

    update () {        
        var x = Math.round(this.input.mousePointer.x/16); 
        var y = Math.round(this.input.mousePointer.y/16)-2;   
                        
        var selected = false; // is an tile selected?
        var tentativeSelect; //tentative selection       

        //check if marker is over a sprite.
        for (var i = 0;i <this.sprites.length;i++){ 
            this.sprites[i].update();

            if (this.sprites[i].x == x && this.sprites[i].y == y){                
                selected = true;
                tentativeSelect = i;               
            }
        }

        //DEMO for moving object with keyboard. Currently can only move the object being focused. 
        if ((Date.now() - this.prevTime > 100)&&this.focusObject){            
            this.focusObject.cursorAction(this.cursorKeys);
            this.prevTime = Date.now();
            //New method of taking input, poll in the update loop and if a key is pressed, set a flag. 
            //update method in each sprite will then take care of the flag.
        }

        //Marker handling        
        if (y>=0 && x >=0 && x <this.worldWidth && y<this.worldHeight){
            this.marker.setPosition(this.utils.gridXtoTrueX(x),this.utils.gridYtoTrueY(y));            

            this.marker.depth = 100; //magic numbered to always be on top.
            this.marker.visible=true;

            if (selected){
                this.marker.setStrokeStyle(1,0xfff000);                
            }else{              
                this.marker.setStrokeStyle(1,0xffffff);
            }           

            if (this.input.activePointer.primaryDown) {                
                if (this.input.activePointer.justDown){ //If the click was just done.  

                    if (typeof tentativeSelect != "undefined"){
                        this.focusObject = this.sprites[tentativeSelect];                        
                        //On click, the object clicked on becomes focused.                    
                    }else{
                        //tile placement on click 
                        if (this.selected_tile){                                
                            let tileSprite = new BasicTile(this,x,y,this.spriteDict[this.selected_tile]);                             
                            this.sprites.push(tileSprite);
                            this.focusObject = tileSprite;                  
                        }                    
                    }
                }
                this.moveObject(this.focusObject,this.utils.TrueXtoGridX(this.marker.x),this.utils.TrueYtoGridY(this.marker.y))                   
                this.displayProperties(this.focusObject); //ouput the focused objects relevant fields
                }
        }else{
            this.marker.visible=false;
            this.movingTile=false;
        }

        //need a warn "Are you sure"
        if (this.deleteKey.isDown){
            this.deleteFocusObject();
        }
    }

    initializeWorldGrid(){
        let grid = [];
        for (var i =0;i<this.worldWidth;i++){
            grid[i] = new Array(this.worldHeight)
        }
        return grid;
    }

    //general method to move a tile around
    moveObject(focus_tile,new_x,new_y){
        //Check the new position is in bounds
        //@TODO, make a warning for the user depening on which bound is over
        if(new_x < 0 || new_x >= this.worldWidth ||new_y < 0||new_y>= this.worldHeight){
            return;
        }
        if (focus_tile){
            let currentX = focus_tile.x;
            let currentY = focus_tile.y;

            if (this.worldGrid[new_x][new_y] != 1){
                focus_tile.x= new_x;
                focus_tile.y = new_y;

                //if solid, occupy upon the world grid.
                if (focus_tile.solid){
                    this.worldGrid[currentX][currentY] = 0;
                    this.worldGrid[focus_tile.x][focus_tile.y] = 1;
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

            var propertyMenu = document.getElementById("properties");
            propertyMenu.innerHTML= "";
        }
    }

    displayProperties(activeObject){
        if (activeObject){
            var name_label = document.createTextNode("Name: ")
            var name_input = document.createElement("input");
            if (activeObject.name){
                name_input.value = activeObject.name;
            }            

            //make this an iteration of some sort. for the other exposed fields
            var propertyMenu = document.getElementById("properties");
            propertyMenu.innerHTML= "";
            
            var x_label = document.createTextNode("X: ");
            var x_input = document.createElement("input");
            x_input.setAttribute("type","number");
            x_input.value = activeObject.x; 

            var y_label = document.createTextNode("Y: ");            
            var y_input = document.createElement("input");
            y_input.setAttribute("type","number");
            y_input.value = activeObject.y; 
            
            //@TODO add new field button.
            
            var updateButton = document.createElement("button");    
            updateButton.onclick= function(){
                this.renameObject(name_input.value);
                //movement still broken.               
                //rework selection. 
                this.moveObject(activeObject,x_input.value,y_input.value);

            }.bind(this);
            updateButton.innerHTML = "Update"; 
   

            propertyMenu.appendChild(name_label);
            propertyMenu.appendChild(name_input);
            
            propertyMenu.appendChild(x_label);
            propertyMenu.appendChild(x_input);

            propertyMenu.appendChild(y_label);
            propertyMenu.appendChild(y_input);

            propertyMenu.appendChild(updateButton);           

            }
        }             
    //Rework to take ref instead of using field
    renameObject(name){
        if (name){            
            //@TODO, more extensive namespace checking
            if (!this.spriteNamespace[name]){
                this.focusObject.name = name;
                this.spriteNamespace[name] = this.focusObject;            
            }else if (this.spriteNamespace[name]==this.focusObject){
                //Probably more elegangt way.
            }else{
                console.log("Name taken");
            }
        }
    }

    createSnowDrift(x, y) {
        //this.map.putTileAt(12, x, y, 'base');
        let snowDrift = this.add.sprite(x, y, 'tiles',12);
        snowDrift.depth = 1;
        return snowDrift;
    }

    createTree(x, y) {
        //TODO groups
        let tree = this.add.group();

        tree.add(this.add.sprite(x, y, 'tiles',20));
        tree.add(this.add.sprite(x, y-16, 'tiles',10));
        tree.add(this.add.sprite(x, y-32, 'tiles',0));

        return tree;

        //this.map.putTileAt(0, x, y, 'objects');
        //this.map.putTileAt(10, x, y + 1, 'objects');
        //this.map.putTileAt(20, x, y + 2, 'objects');
    }

    createHouse(x, y) {
        this.map.putTileAt(3, x, y, 'objects');
        this.map.putTileAt(4, x + 1, y, 'objects');
        this.map.putTileAt(5, x + 2, y, 'objects');
        this.map.putTileAt(13, x, y + 1, 'objects');
        this.map.putTileAt(14, x + 1, y + 1, 'objects');
        this.map.putTileAt(15, x + 2, y + 1, 'objects');
    }
    createDeer(x, y) {
        let deer = this.add.sprite(x, y, 'tiles',1);
        deer.depth = 1;        
        //let deer = this.map.putTileAt(1, x, y, 'objects');
        return deer;        
    }

}

class tileSelection extends Phaser.Scene{
//Menu to select which block to drag out. 
//@TODO indication as to which block is selected
    /*
    buttons = [];
    selected; //which button has been selected
    baseScene;

    debugText; //Text, only for debugging.
    */

    constructor ()
    {
        super("Block_Menu");
    }

    create(){
        this.baseScene = this.scene.get("Game_Scene");
        this.buttons = [];
        
        //Buttons should be autogenerated from existing prototypes. 
        var treeButton = this.add.text(10, 10, 'Tree')
        .setInteractive()
        .on('pointerdown', () => { 
            console.log("Tree Sprite");
            this.baseScene.selected_tile = 'tree'; 
            this.selected = treeButton;      
        });
        this.buttons.push(treeButton);

        var deerButton = this.add.text(60, 10, 'Deer')
        .setInteractive()
        .on('pointerdown', () => { 
            console.log("Deer Sprite");
            this.baseScene.selected_tile = 'deer';
            this.selected = deerButton; 
        });
        this.buttons.push(deerButton);
        
        var snowButton = this.add.text(110, 10, 'Snow')
        .setInteractive()
        .on('pointerdown', () => { 
            console.log("Snow Sprite");
            this.baseScene.selected_tile = 'snow';            
            this.selected = snowButton; 
        });
        this.buttons.push(snowButton);
    }

    update(){   

        //colour in the selected button
        for (var i=0;i<this.buttons.length;i++){
            if (this.buttons[i] == this.selected){
                this.buttons[i].setStyle({ fill: '#49B62E'});
            }else{
                this.buttons[i].setStyle({ fill: '#FFFFFF'});
            } 
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
    scene: [mainScene, tileSelection]
}

let game = new Phaser.Game(config);