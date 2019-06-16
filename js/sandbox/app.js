class mainScene extends Phaser.Scene
{   
    map; //the map that the sprites are placed upon
    focusObject; //tile currently selected, to be manipulated

    marker; //selector tool
    pointer; //Mouse pointer
    selected_tile; //currently selected tiletype

    deleteKey; //keyboard inputs

    sprites = []; //array to keep track of all created sprites

    constructor ()
    {
        super("Game_Scene");
    }

    preload () {

        this.load.spritesheet('tiles', '../assets/tilesheet.png', {
            frameWidth: 16,
            frameHeight: 16
        });
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

        //Marker handling        
        if (y>32 && x > 0){
            this.marker.setPosition(x,y);
            this.marker.depth = 100; //magic numbered to always be on top.
            var tentativeSelect; //tentative selection
            
            //check if marker is over a sprite.
            for (var i = 0;i <this.sprites.length;i++){
                
                if (this.sprites[i].x== x && this.sprites[i].y==y){
                    this.marker.setStrokeStyle(1,0xfff000);
                    tentativeSelect = i;
                    break;
                }else{
                    this.marker.setStrokeStyle(1,0xffffff);                    
                }
            }

            if (this.input.activePointer.primaryDown&&this.input.activePointer.justDown) {                
                //Selecting the active tile
                if (typeof tentativeSelect != "undefined"){
                    this.focusObject = this.sprites[tentativeSelect];
                    console.log("Selected: " + tentativeSelect);                    
                }else{
                    //convert to a callback based on what the selected tile is.
                    //TODO pass in the creation function first class. 
                    let deer = this.createDeer(x,y);  
                    this.sprites.push(deer);
                    this.focusObject = deer;   
                }          
            }
            if (this.input.activePointer.primaryDown){                
                if (this.focusObject){   
                    this.focusObject.x = this.marker.x;
                    this.focusObject.y = this.marker.y;
                }
            }
        }
        //@TODO fix deletion.
        if (this.deleteKey.isDown){
            if (this.focusObject){
                var index = this.sprites.indexOf(this.focusObject);
                console.log(index);
                this.sprites.splice(index,index);
                
                

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
    constructor ()
    {
        super("Block_Menu");
    }

    create(){
        let baseScene = this.scene.get("Game_Scene");

        var treeButton = this.add.text(10, 10, 'Tree')
        .setInteractive()
        .on('pointerdown', () => { 
            console.log("Tree Sprite");
            baseScene.selected_tile = 'tree'
           
        });

        var mooseButton = this.add.text(60, 10, 'Moose')
        .setInteractive()
        .on('pointerdown', () => { 
            console.log("Moose Sprite");
            baseScene.selected_tile = 'moose'
        });        
    }
    update(){

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
