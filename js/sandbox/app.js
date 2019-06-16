class mainScene extends Phaser.Scene
{   
    map; //the map that the sprites are placed upon

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
        this.map = this.make.tilemap({
            width: 100, 
            height: 100,
            tileWidth: 16,
            tileHeight: 16,
        });

        let tiles = this.map.addTilesetImage('tiles', null, 16, 16);

        let base = this.map.createBlankDynamicLayer('base', tiles);
        this.map.fill(2, 0, 0, this.map.width, this.map.height, 'base');        
        
        this.scene.launch("Block_Menu");   

    }

    update () {
        //TODO use this to render all drawn blocks.
                       
    }

    createSnowDrift(x, y) {
        this.map.putTileAt(12, x, y, 'base');
    }

    createTree(x, y) {
        this.map.putTileAt(0, x, y, 'objects');
        this.map.putTileAt(10, x, y + 1, 'objects');
        this.map.putTileAt(20, x, y + 2, 'objects');
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
        this.map.putTileAt(1, x, y, 'objects');
    }

}


class tileSelection extends Phaser.Scene{
    selected;

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
            this.selected="tree"; 
            baseScene.createTree(10,10);                  
           
        });

        var mooseButton = this.add.text(60, 10, 'Moose')
        .setInteractive()
        .on('pointerdown', () => { 
            console.log("Moose Sprite");
            this.selected = "moose";
            baseScene.createDeer(10,10);  
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
