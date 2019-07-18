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
    world;
    x; // x position in terms of the game grid
    y;
    sprite;   
    
    solid = false; //Should this block allow other blocks to "overlap"

    constructor(world,x,y,index,name=undefined){
        this.world=world;
        this.x = x;
        this.y = y;
        this.sprite = this.world.add.sprite(world.utils.gridXtoTrueX(x), world.utils.gridYtoTrueY(y), 'tiles',index);
        this.sprite.depth = 1;  
        
        if (index === 0){
            this.solid = true;
        }
    }
    
    update(){               
        //further instructions for each block type to be hooked into here
        //Parser.getnextInstruction etc. 
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
}

class mainScene extends Phaser.Scene
{   
    map; //the map that the sprites are placed upon  

    marker; //selector tool    
    pointer; //Mouse pointer
    focusObject; //tile currently selected, to be manipulated    
    selected_tile; //currently selected tiletype

    deleteKey; //keyboard input for delete, @TODO refactor for more generality.

    sprites = []; //array to keep track of all created sprites
    spriteDict = []; // map the numerical positions of the tiles to names.

    utils = new Utils();
    worldGrid; //grid to represent every grid position. 
    worldWidth = 20; //Very magic number-y.
    worldHeight = 13;
       
    constructor ()
    {
        super("Game_Scene");
    }

    preload () {
        this.load.spritesheet('tiles', '../assets/tilesheet.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        
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

        this.worldGrid = this.initializeWorldGrid();

        this.marker = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1,0xffffff);       
        
        this.deleteKey = this.input.keyboard.addKey('DELETE');
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
                       
            if (this.sprites[i].x=== x && this.sprites[i].y===y){                
                selected = true;
                tentativeSelect = i;               
            }

        }

        //Marker handling        
        if (y>=0 && x >=0 && x <this.worldWidth && y<this.worldWidth){
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
                        //On click, the selected object becomes focused.                    
                    }else{
                        //tile placement
                        if (this.selected_tile){                                
                            let tileSprite = new BasicTile(this,x,y,this.spriteDict[this.selected_tile]);                             
                            this.sprites.push(tileSprite);
                            this.focusObject = tileSprite;                  
                        }                    
                    }
                }

                this.moveFocusObject(this.utils.TrueXtoGridX(this.marker.x),this.utils.TrueYtoGridY(this.marker.y))
          
            }
        }else{
            this.marker.visible=false;
            this.movingTile=false;
        }
        
        if (this.deleteKey.isDown){
            if (this.focusObject){
                let index = this.sprites.indexOf(this.focusObject);
                this.sprites.splice(index,1);

                this.focusObject.destroy();
                this.focusObject = undefined;
            }
        }
    }

    initializeWorldGrid(){
        let grid = [];
        for (var i =0;i<this.worldWidth;i++){
            grid[i] = new Array(this.worldHeight)
        }
        return grid;
    }

    //function to move an object to a new grid location, will do nothing if the position is taken.
    //@TODO, could add more generality by making the focus object a parameter for a sprite.
    moveFocusObject(new_x,new_y){
        if (this.focusObject){
            let currentX = this.focusObject.x;
            let currentY = this.focusObject.y;

            if (this.worldGrid[new_x][new_y] != 1){
                this.focusObject.x = new_x;
                this.focusObject.y = new_y;

                if (this.focusObject.solid){
                    this.worldGrid[currentX][currentY] = 0;
                    this.worldGrid[this.focusObject.x][this.focusObject.y] = 1;
                }
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

    buttons = [];
    selected; //which button has been selected
    baseScene;

    debugText; //Text, only for debugging.

    constructor ()
    {
        super("Block_Menu");
    }

    create(){
        this.baseScene = this.scene.get("Game_Scene");

        this.debugText=this.add.text(160, 10, 'No Focus Object',{ fontSize: '10px'}); //@debug 

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
        //@debug
        if(this.baseScene.focusObject){
            this.debugText.setText("x: " + (this.baseScene.focusObject.x) +" y: " + (this.baseScene.focusObject.y));
        }else{
            this.debugText.setText("No Focus Object");
        }        

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
