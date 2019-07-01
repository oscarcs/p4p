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
    //TODO, need to include an immutable "type" property.
    constructor(world,x,y,spriteName,name=undefined){
        this.world=world;
        
        this.exposed_fields = {}; //array of exposed fields mapped to their values. 
        
        this.x = x;
        this.y = y;

        this.spriteName = spriteName;
        var index = world.spriteDict[spriteName];
        this.sprite = this.world.add.sprite(world.utils.gridXtoTrueX(x), world.utils.gridYtoTrueY(y),'tiles',index); //This shouldn't be exposed.

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

        if (this.solid){
            this.world.worldGrid[this.x][this.y] = 1;
        }

    }

    destroy(){
        if (this.solid){
            this.world.worldGrid[this.x][this.y] = 0;
        }
        this.sprite.destroy(); 
    }


    addStringField(field){
        //need to check if field already exists
        this.exposed_fields[field] = " ";
    }

    addNumberField(field){
        this.exposed_fields[field] = 0;
    }

    addBooleanField(field){
        this.exposed_fields[field] = false;
    }

    changeSprite(newSprite){
        if (this.spriteName == newSprite){
            //lazy update
            return;
        }

        if (this.world.spriteDict[newSprite]!=undefined){
            this.spriteName = newSprite;
            var index = this.world.spriteDict[newSprite];

            //Dirty
            this.sprite.destroy();            
            this.sprite = this.world.add.sprite(this.world.utils.gridXtoTrueX(this.x), this.world.utils.gridYtoTrueY(this.y),'tiles',index);
        }
    }

    //@TODO need to make a some way to set an interval between actions without blocking.
    //Use getTime() and a variable. prevTime. i.e. if getTime() - prevTime> some threshhold,
    //sprite can do action. 
   
}

//@TODO, need some dead zone to click so we can deselect.
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

        //Marker for what the mouse is currently over.
        this.marker = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1,0xffffff);  
        this.marker.depth = 100; //magic numbered to always be on top.
        
        //Indicator to which block is currently selected. Need to rework when we have to deal with more than one block.
        this.selectionIndicator = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1,0x008000); 
        this.selectionIndicator.visible=false;
        this.selectionIndicator.depth = 99;
        
        this.deleteKey = this.input.keyboard.addKey('DELETE'); //@TODO refactor for more generality, fix deletion to be an alternate input.

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

        //if there is a objecct being focused, the selection indicator goes to true.
        if (this.focusObject){
            this.selectionIndicator.visible = true;
            this.selectionIndicator.setPosition(this.utils.gridXtoTrueX(this.focusObject.x),this.utils.gridYtoTrueY(this.focusObject.y));
        }else{
            this.selectionIndicator.visible = false;
        }

        //DEMO for moving object with keyboard. Currently can only move the object being focused. 
        if ((Date.now() - this.prevTime > 100)&&this.focusObject){            
            this.prevTime = Date.now();
            //New method of taking input, poll in the update loop and if a key is pressed, set a flag. 
            //update method in each sprite will then take care of the flag.
        }

        //Marker handling        
        if (y>=0 && x >=0 && x <this.worldWidth && y<this.worldHeight){
            this.marker.setPosition(this.utils.gridXtoTrueX(x),this.utils.gridYtoTrueY(y));            

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
                            //Should the dictionary finding of the name happen here or in the class.                                
                            let tileSprite = new BasicTile(this,x,y,this.selected_tile);                             
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

            this.clearPropertyFields();
        }
    }

    clearPropertyFields(){
        var propertyMenu = document.getElementById("properties");
        var buttonMenu = document.getElementById("propertyButtons");
        propertyMenu.innerHTML= "";
        buttonMenu.innerHTML="";
    }

    //@TODO, this kinda deserves a big refactor. 
    displayProperties(activeObject){
        //Graphical prototype definition should use a similar method.
        if (activeObject){

            this.clearPropertyFields();

            var propertyMenu = document.getElementById("properties");
            var buttonMenu = document.getElementById("propertyButtons");

            var propertyInputs = []; //Inputfields for all the user defined fields

            var name_label = document.createElement("span");
            name_label.textContent = "Name: ";
            name_label.setAttribute("class", "propertyLabel");


            var name_input = document.createElement("input");
            name_input.setAttribute("class", "propertyInput");
            if (activeObject.name){
                name_input.value = activeObject.name;
            }          

            var sprite_label = document.createElement("span");
            sprite_label.textContent = "Sprite: ";
            sprite_label.setAttribute("class", "propertyLabel")

            var sprite_input = document.createElement("select");
            sprite_input.setAttribute("class", "propertyInput");

            for (var spriteName in this.spriteDict){
                var option = document.createElement("option");
                option.textContent = spriteName; //TODO, change to a name.
                sprite_input.appendChild(option);
            }
            sprite_input.value = activeObject.spriteName;

            //Really begging for a refactor this one.
            var x_label = document.createElement("span");
            x_label.textContent = "X: ";
            x_label.setAttribute("class", "propertyLabel");

            var x_input = document.createElement("input");
            x_input.setAttribute("type","number");
            x_input.setAttribute("class","propertyInput");
            x_input.value = activeObject.x; 

            var y_label = document.createElement("span");
            y_label.textContent = "Y: ";
            y_label.setAttribute("class", "propertyLabel");
            
            var y_input = document.createElement("input");
            y_input.setAttribute("type","number");
            y_input.value = activeObject.y; 
            y_input.setAttribute("class","propertyInput");

            var solid_label=document.createElement("span");
            solid_label.textContent="Solid: ";
            solid_label.setAttribute("class","propertyLabel");

            var solid_check = document.createElement("input");
            solid_check.setAttribute('type','checkbox');
            solid_check.setAttribute("class", "propertyInput");
            solid_check.checked = activeObject.solid;            
            
            //@Need to tidy up the property menu            
            var updateButton = document.createElement("button");    
            updateButton.onclick= function(){
                this.renameObject(name_input.value);

                this.moveObject(activeObject,x_input.value,y_input.value);
                activeObject.solid = solid_check.checked;

                activeObject.changeSprite(sprite_input.value);

                //iterate through all new fields updating them too.
                for (var newFields in propertyInputs){                    
                    let fieldValue = propertyInputs[newFields].value;
                    let fieldType = propertyInputs[newFields].type;                    

                    if (fieldType == "text"){
                        activeObject.addStringField(newFields);                        
                        activeObject.exposed_fields[newFields] = fieldValue;

                    }else if (fieldType == "number"){
                        activeObject.addNumberField(newFields);
                        activeObject.exposed_fields[newFields] = Number(fieldValue);

                    }else if (fieldType == "checkbox"){
                        activeObject.addBooleanField(newFields);
                        activeObject.exposed_fields[newFields] = propertyInputs[newFields].checked;
                    }
                }
            }.bind(this);
            updateButton.innerHTML = "Update"; 

            //StringButton
            var addStringFieldButton = document.createElement("button"); //Need to tidy the formatting up
            addStringFieldButton.onclick=function(){
                var fieldName = window.prompt("Name of new field");                                
                this.addField(propertyMenu,activeObject,propertyInputs,fieldName,"string");              
            }.bind(this);
            addStringFieldButton.innerHTML = "Add String Property";            
            
            //NumberButton
            var addNumberFieldButton = document.createElement("button");
            addNumberFieldButton.onclick=function(){
                var fieldName = window.prompt("Name of new field") 
                this.addField(propertyMenu,activeObject,propertyInputs,fieldName,"number");    
                }.bind(this);
            addNumberFieldButton.innerHTML="Add Number Property";
            
            //Boolean(True/False) Button
            var addBooleanFieldButton = document.createElement("button");
            addBooleanFieldButton.onclick = function(){
                var fieldName = window.prompt("Name of new field");
                this.addField(propertyMenu,activeObject,propertyInputs,fieldName,"boolean");
            }.bind(this);
            addBooleanFieldButton.innerHTML = "Add True/False Property";
            
            //Need to space out the buttons a bit in the CSS.
            buttonMenu.appendChild(addNumberFieldButton);
            buttonMenu.appendChild(addStringFieldButton); 
            buttonMenu.appendChild(addBooleanFieldButton);
            buttonMenu.appendChild(updateButton);

            //Core exposed values are hard coded in.
            //Yet to add, depth property and sprite property.
            //Depth is a number, sprite should be a dropdown of all available sprites.
            propertyMenu.appendChild(name_label);
            propertyMenu.appendChild(name_input);
            propertyMenu.appendChild(document.createElement("br"));

            propertyMenu.appendChild(sprite_label);
            propertyMenu.appendChild(sprite_input);
            propertyMenu.appendChild(document.createElement("br"));

            propertyMenu.appendChild(x_label);
            propertyMenu.appendChild(x_input);
            propertyMenu.appendChild(document.createElement("br"));

            propertyMenu.appendChild(y_label);
            propertyMenu.appendChild(y_input);
            propertyMenu.appendChild(document.createElement("br"));

            propertyMenu.appendChild(solid_label);
            propertyMenu.appendChild(solid_check);
            propertyMenu.appendChild(document.createElement("br"));

            for (var index in activeObject.exposed_fields){               
                var label = document.createElement("span");
                label.textContent = index +": ";
                label.setAttribute("class","propertyLabel");
                propertyMenu.appendChild(label);              
                
                propertyInputs[index] = document.createElement("input");
                propertyInputs[index].setAttribute("class", "propertyInput");

                if (typeof activeObject.exposed_fields[index] == "string"){
                    
                    propertyInputs[index].setAttribute("type","text"); 
                    propertyInputs[index].value = activeObject.exposed_fields[index];

                }else if (typeof activeObject.exposed_fields[index] == "number"){

                    propertyInputs[index].setAttribute("type","number");
                    propertyInputs[index].value = activeObject.exposed_fields[index];

                }else if (typeof activeObject.exposed_fields[index] == "boolean"){
                    propertyInputs[index].setAttribute("type","checkbox");
                    propertyInputs[index].checked = activeObject.exposed_fields[index];
                    }                          
                
                propertyMenu.appendChild(propertyInputs[index]);
                propertyMenu.appendChild(document.createElement("br"));
                }                      

            }
        }             

    //function to add a field label + input to the tile, 
    //two string inputs, one for the name of the field and one for the type  of the field
    //"string", "number", "boolean"
    addField(propertyMenu,activeObject,propertyInputs,fieldName, fieldType){ 
        if (fieldName && fieldName.length>1 && !(fieldName in activeObject.exposed_fields) && !(fieldName in propertyInputs)){                  
            var label = document.createElement("span");
            label.textContent = fieldName + ": ";
            label.setAttribute("class", "propertyLabel");
            propertyMenu.appendChild(label);

            propertyInputs[fieldName] = document.createElement("input");
            propertyInputs[fieldName].setAttribute("class", "propertyInput");

            if (fieldType == "number"){
                propertyInputs[fieldName].setAttribute("type","number");
                propertyInputs[fieldName].value = 0;
            }else if (fieldType == "string"){
                propertyInputs[fieldName].setAttribute("type","string");
                propertyInputs[fieldName].value = "";
            }else if(fieldType == "boolean"){
                propertyInputs[fieldName].setAttribute("type","checkbox");
                propertyInputs[fieldName].checked = false;
            }

            propertyMenu.appendChild(propertyInputs[fieldName]);
            propertyMenu.appendChild(document.createElement("br"));
            }else if(fieldName in activeObject.exposed_fields || fieldName in propertyInputs){
                console.log("Propety name taken");
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
                //Probably more elegant way.
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

//@TODO, need some deselection deadzone. 
class tileSelection extends Phaser.Scene{

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