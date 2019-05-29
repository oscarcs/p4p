var game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 320,
    height: 240,
    parent: 'sandbox',
    pixelArt: true,
    zoom: 2,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
});

function preload () {

    this.load.spritesheet('tiles', '../assets/tilesheet.png', {
        frameWidth: 16,
        frameHeight: 16
    });
}

function create () {
    let map = this.make.tilemap({
        width: 100, 
        height: 100,
        tileWidth: 16,
        tileHeight: 16,
    });

    let tiles = map.addTilesetImage('tiles', null, 16, 16);

    let base = map.createBlankDynamicLayer('base', tiles);
    map.fill(2, 0, 0, map.width, map.height, 'base');

    for (let i = 0; i < 10; i++) {
        createSnowDrift(map, Math.floor(Math.random() * 20), Math.floor(Math.random() * 16));
    }

    let objs = map.createBlankDynamicLayer('objects', tiles);

    
    for (let i = 0; i < 3; i++) {
        createDeer(map, Math.floor(Math.random() * 20), Math.floor(Math.random() * 16));
    }
    
    for (let i = 0; i < 15; i++) {
        createTree(map, Math.floor(Math.random() * 20), Math.floor(Math.random() * 16));
    }

    createHouse(map, 8, 5);
}

function update () {

}

function createSnowDrift(map, x, y) {
    map.putTileAt(12, x, y, 'base');
}

function createTree(map, x, y) {
    map.putTileAt(0, x, y, 'objects');
    map.putTileAt(10, x, y + 1, 'objects');
    map.putTileAt(20, x, y + 2, 'objects');
}

function createHouse(map, x, y) {
    map.putTileAt(3, x, y, 'objects');
    map.putTileAt(4, x + 1, y, 'objects');
    map.putTileAt(5, x + 2, y, 'objects');
    map.putTileAt(13, x, y + 1, 'objects');
    map.putTileAt(14, x + 1, y + 1, 'objects');
    map.putTileAt(15, x + 2, y + 1, 'objects');
}

function createDeer(map, x, y) {
    map.putTileAt(1, x, y, 'objects');
}