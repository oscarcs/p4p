class BasicTile
{
    world;
    x;
    y;
    sprite;
    name;

    tilesize = 16;

    constructor(world,x,y,index){
        this.world=world;
        this.x=x;
        this.y = y;
        this.sprite = this.world.add.sprite(x, y, 'tiles',index);
        this.sprite.depth = 1; 
    }

    update(){
        //further instructions for each block type to be hooked into here
        //Parser.getnextInstruction etc.

        if (this.x!==this.sprite.x || this.y!==this.sprite.y){
            //lazy update position
            this.sprite.x = this.x;
            this.sprite.y = this.y;
        }
    }

    destroy(){
        this.sprite.destroy();
    }
}

class mainScene extends Phaser.Scene
{   
    map; //the map that the sprites are placed upon
    focusObject; //tile currently selected, to be manipulated

    marker; //selector tool
    pointer; //Mouse pointer    
    selected_tile; //currently selected tiletype

    deleteKey; //keyboard input for delete

    sprites = []; //array to keep track of all created sprites

    spriteDict = []; // map the numerical positions of the tiles to names.

    
    constructor ()
    {
        super("Game_Scene");
    }

    preload () {

        this.load.spritesheet('tiles', '../assets/tilesheet.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        
        //need to make this a seperate class.
        this.spriteDict["deer"] = 1;
        this.spriteDict["snow"] = 12;
        this.spriteDict["tree"] = 0; 
        //treat blocks that span wider differrently.
    }    

    create () {
        //TODO map a dict to map sprite names to spritesheet indexes.

        this.map = this.make.tilemap({
            width: 100, 
            height: 100,
            tileWidth: 16,
            tileHeight: 16,
        });
        
        let tiles = this.map.addTilesetImage('tiles', null, 16, 16);
        let base = this.map.createBlankDynamicLayer('base', tiles);
        this.map.fill(2, 0, 0, this.map.width, this.map.height, 'base');

                        
        this.marker = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1,0xffffff); 
        
        this.deleteKey = this.input.keyboard.addKey('DELETE');

        this.scene.launch("Block_Menu");   

    }

    update () {
        var x = Math.round(this.input.mousePointer.x/16)*16+8;
        var y = Math.round(this.input.mousePointer.y/16)*16+8;
        
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
        if (y>32 && x > 0){
            this.marker.setPosition(x,y);
            this.marker.depth = 100; //magic numbered to always be on top.
            this.marker.visible=true;

            if (selected){
                this.marker.setStrokeStyle(1,0xfff000);
            }else{
                                
                this.marker.setStrokeStyle(1,0xffffff);
            }           

            if (this.input.activePointer.primaryDown&&this.input.activePointer.justDown) {                
                //Selecting the active tile
                if (typeof tentativeSelect != "undefined"){
                    this.focusObject = this.sprites[tentativeSelect];
                    //On click, the selected object becomes focused.                    
                }else{
                    //convert to a callback based on what the selected tile is.
                    if (this.selected_tile){
                        
                        let tileSprite = new BasicTile(this,x,y,this.spriteDict[this.selected_tile]);  
                        this.sprites.push(tileSprite);
                        this.focusObject = tileSprite;                         
                    }                    
                }          
            }
            if (this.input.activePointer.primaryDown){                
                if (this.focusObject){   
                    this.focusObject.x = this.marker.x;
                    this.focusObject.y = this.marker.y;
                }
            }
        }else{
            this.marker.visible=false;
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

    constructor ()
    {
        super("Block_Menu");
    }

    create(){
        let baseScene = this.scene.get("Game_Scene");

        //Buttons should be autogenerated from existing prototypes. 
        var treeButton = this.add.text(10, 10, 'Tree')
        .setInteractive()
        .on('pointerdown', () => { 
            console.log("Tree Sprite");
            baseScene.selected_tile = 'tree'; 
            this.selected = treeButton;      
        });
        this.buttons.push(treeButton);

        var deerButton = this.add.text(60, 10, 'Deer')
        .setInteractive()
        .on('pointerdown', () => { 
            console.log("Deer Sprite");
            baseScene.selected_tile = 'deer';
            this.selected = deerButton; 
        });
        this.buttons.push(deerButton);
        
        var snowButton = this.add.text(110, 10, 'Snow')
        .setInteractive()
        .on('pointerdown', () => { 
            console.log("Snow Sprite");
            baseScene.selected_tile = 'snow';            
            this.selected = snowButton; 
        });
        this.buttons.push(snowButton);
    }

    update(){
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
