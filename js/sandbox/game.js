class Game extends Phaser.Scene {         
    constructor() {
        super("Game_Scene");
    }

    preload() {
        //Changed to test with transparent backgrounds
        this.load.spritesheet('tiles', './assets/testTilesheet.png', {
            frameWidth: 16,
            frameHeight: 16
        }); 

        this.load.spritesheet('creatures', './assets/roguelikecreatures.png', {
            frameWidth: 16,
            frameHeight: 16
        }); 

        Utils.mapTilesToNames();
    }    

    create() {
        
        this.world = new World(this);
        window.world = this.world; 
        
        // this.input.mouse.disableContextMenu();

        this.input.setDefaultCursor('url("./assets/pencil.cur"), pointer');

        // Marker for what the mouse is currently over.
        this.marker = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1, 0xffffff);
        this.marker.depth = 100; // magic numbered to always be on top.
        
        // Indicator to which block is currently selected. 
        // @@TODO: rework to deal with more than one block.
        this.selectionIndicator = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1, 0x008000); 
        this.selectionIndicator.visible = false;
        this.selectionIndicator.depth = 99; //selection indicator always on top.

        
        this.deleteKey = this.input.keyboard.addKey('DELETE');  
        this.backSpaceKey = this.input.keyboard.addKey('BACKSPACE');
        this.spaceKey = this.input.keyboard.addKey('SPACE'); 

        //One tick per 100 milliseconds
       
        this.tick = 100;    

        this.cursors = this.input.keyboard.addKeys({
            up: 'up',
            down: 'down',
            left: 'left',
            right: 'right'
        });

        this.keysDown = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false
        }

        var date = new Date();
        this.waitTimer = date.getTime();
    }

    update() {
        this.world.update();        
        this.updateMarker();   
        this.updateSelectionMarker(); 
        this.updateKeyboard();
    }


    // Handle the mouse marker.
    updateMarker() {
        let x = Utils.trueToGrid(this.input.mousePointer.x);
        let y = Utils.trueToGrid(this.input.mousePointer.y);

        let tool = ui.currentTool;

        // Handle the marker
        if (ui.mouseInGame) {
            this.marker.setPosition(Utils.gridToTrue(x), Utils.gridToTrue(y));
            this.marker.visible = true;
            
            let color = 0xffffff;

            if (tool === 'select') {
                this.input.setDefaultCursor('pointer');

                if (this.world.getGrid(x, y).length == 1) {
                    color = 0xFFFF00;
                }
                else if (this.world.getGrid(x, y).length > 1) {
                    color = 0xFFFFF0;
                }   
            } else if (tool === "create") {
                this.input.setDefaultCursor('url("./assets/pencil.cur"), pointer');
            }
            this.marker.setStrokeStyle(1, color);
            
            
            //Alt button
            if (this.input.activePointer.rightButtonDown()&&this.input.activePointer.justDown) {
                let numObjectsBeneathCursor = this.world.getGrid(x, y).length;

                //If multiple tiles are stacked, cycle through from last to enter to first. 
                if (numObjectsBeneathCursor > 1) {
                    if (this.selectionIndicator.visible &&
                        Utils.trueToGrid(this.selectionIndicator.x) === x &&
                        Utils.trueToGrid(this.selectionIndicator.y )=== y)
                    {                    
                        var currentIndex = this.world.getGrid(x,y).indexOf(this.world.focusObject);
                        if(currentIndex === 0) {
                            currentIndex = this.world.getGrid(x,y).length;
                        }
                        this.world.focusObject = this.world.getGrid(x,y)[currentIndex-1];                        
                        ui.currentTile = this.world.focusObject;
                    }
                } 
            }

            // On click primary
            if (this.input.activePointer.primaryDown && this.input.activePointer.justDown) {
                if (tool === 'select') {
                    let numObjectsBeneathCursor = this.world.getGrid(x, y).length;
                
                    if (numObjectsBeneathCursor === 0) { 
                        this.world.focusObject = null;
                    }
                    else if (numObjectsBeneathCursor === 1) {    
                        this.world.focusObject = this.world.getGrid(x, y)[0];
                    }
                    else if (numObjectsBeneathCursor > 1) {
                        //In cases of multiple tiles on one square, first click select first to enter. 
                        if (!(this.selectionIndicator.visible &&
                            Utils.trueToGrid(this.selectionIndicator.x) === x &&
                            Utils.trueToGrid(this.selectionIndicator.y )=== y))
                        {
                            this.world.focusObject = this.world.getGrid(x,y).pop();
                        }
                        //@@UI: multiple-select mode
                    } 

                    ui.currentTile = this.world.focusObject;
                }
                else if (tool === 'create') {
                    var tile = this.world.addTile(x, y, this.world.getPrototype(ui.currentPrototype));

                    if (tile) {
                        this.world.focusObject = tile;
                    }
                    else {
                        this.world.focusObject = null;
                    }

                    ui.currentTile = this.world.focusObject;    
                }
            }
            else {
                if (this.world.focusObject && this.input.activePointer.primaryDown) {
                    this.world.focusObject.move(x,y);
                }
            }
        }
        else {
            this.marker.visible = false;
        }
    }

    updateSelectionMarker() {
        // SELECTION MARKER
        // If there is a object being focused, the selection indicator goes to true.
        
        if (this.world.focusObject) {
            this.selectionIndicator.visible = true;
            this.selectionIndicator.setPosition(
                Utils.gridToTrue(this.world.focusObject.x),
                Utils.gridToTrue(this.world.focusObject.y)
            );
        }
        else {
            this.selectionIndicator.visible = false;
        } 
    }

    updateKeyboard() {
        // Deletion shouldn't work when on text areas and input. 
        var activeElementType = document.activeElement.type;

        if (activeElementType == "text" || 
            activeElementType == "textarea" || 
            activeElementType == "number"
        ) {
            this.deleteKey.enabled = false;  
            this.backSpaceKey.enabled = false;
            this.spaceKey.enabled = false;
            
            for (var key in this.cursors){                
                this.cursors[key].enabled = false;
            }

            this.input.keyboard.clearCaptures();         
        }
        else {           
            this.deleteKey.enabled = true;
            this.input.keyboard.addCapture("DELETE");

            this.spaceKey.enabled = true;
            this.input.keyboard.addCapture("SPACE");

            this.backSpaceKey.enabled = true;
            this.input.keyboard.addCapture("BACKSPACE");

            for (var key in this.cursors){                
                this.cursors[key].enabled = true;
            }
            
            this.input.keyboard.addCapture({
                up: 'up',
                down: 'down',
                left: 'left',
                right: 'right'
            });
        }

        for (key in this.cursors) {
            if (this.cursors[key].isDown) {
                if (this.keysDown[key] == false) {
                    this.world.event('keyPress_' + key);
                }
                this.keysDown[key] = true;
            }
        }

        for (key in this.cursors) {
            if (this.cursors[key].isUp) {
                if (this.keysDown[key] == true) {
                    this.world.event('keyRelease_' + key);
                }
                this.keysDown[key] = false;
            }
        }

        if (this.spaceKey.isDown) {
            if (this.keysDown['space'] === false) {
                this.world.event('keyPress_space');
            }
            this.keysDown["space"] = true;
        }
        else {
            if (this.keysDown["space"] === true) {
                this.world.event('keyRelease_space');
            }
            this.keysDown["space"] = false;
        } 

        // Delete key polling.
        if (this.deleteKey.isDown || this.backSpaceKey.isDown) {
            this.world.deleteTile(this.world.focusObject);
        }
    }

    wait(duration) {
        var date = new Date();
        this.waitTimer = date.getTime() + duration;
    }
}