class Utils{
    //Helper class to manage grid location conversions.
    //@TODO rework the mainscene co-cordinates.

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

class Prototype{
    constructor(type,tile){
        this.type = type;
        this.spriteName = tile.spriteName;
        this.solid = tile.solid;
        this.fields = {};

        for (var keys in tile.exposed_fields){
            this.fields[keys] = tile.exposed_fields[keys];
        }
    }
}

class BasicTile{   
    //TODO, need to include an immutable "type" property.
    constructor(world,x,y,spriteName,name=undefined){
        this.world=world;
        this.type = "BasicTile";
        this.exposed_fields = {}; //array of exposed fields mapped to their values. 

        this.x = x;
        this.y = y;

        this.spriteName = spriteName;
        var index = world.spriteDict[spriteName];
        this.sprite = this.world.add.sprite(world.utils.gridXtoTrueX(x), world.utils.gridYtoTrueY(y),'tiles',index); //This shouldn't be exposed.

        this.sprite.depth = 1;  
        this.solid = false;
        this.name = name;
    }
    
    //Takes a base tile and then applies the prototype, i.e. changing the internal elements as neccessary. 
    applyProtoType(prototype){        
        this.solid = prototype.solid;
        this.type = prototype.type;
        this.changeSprite(prototype.spriteName);
        
        for (var key in prototype.fields){
            this.exposed_fields[key] = prototype.fields[key];
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
        }else{
            this.world.worldGrid[this.x][this.y] = 0;
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

        this.spriteDict = []; //dictionary mapping sprites to indexes, used for tilesheets

        this.sprites = []; //all sprites
        this.spriteNamespace = []; //Name dictionary to map exisiting tiles to names

        this.prototypes = {}; //map each prototype name to a new prototype.
        
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

        this.UI = new userInterface(this);

        this.worldGrid = this.initializeWorldGrid();
        //@TODO make it so the world grid has two different values 1 for occupation and 2 for solid.

        //Marker for what the mouse is currently over.
        this.marker = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1,0xffffff);  
        this.marker.depth = 100; //magic numbered to always be on top.
        
        //Indicator to which block is currently selected. Need to rework when we have to deal with more than one block.
        this.selectionIndicator = this.add.rectangle(0, 32, 16, 16).setStrokeStyle(1,0x008000); 
        this.selectionIndicator.visible=false;
        this.selectionIndicator.depth = 99;
        
        this.deleteKey = this.input.keyboard.addKey('DELETE'); //@TODO refactor for more generality, fix deletion to be an alternate input.  
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
                        if (this.UI.selectionPane.value){
                            var tileSprite = new BasicTile(this,x,y,"tree");
                            if (this.UI.selectionPane.value != "Basic tile"){
                                console.log("Working");
                                tileSprite.applyProtoType(this.prototypes[this.UI.selectionPane.value]);   
                            }                         
                            //@TODO, tilesprite based off prototype.
                            this.sprites.push(tileSprite);
                            this.focusObject = tileSprite;                  
                        }                    
                    }
                }
                this.moveObject(this.focusObject,this.utils.TrueXtoGridX(this.marker.x),this.utils.TrueYtoGridY(this.marker.y));

                this.UI.displayProperties(this.focusObject); //ouput the focused objects relevant fields
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
            console.log("collided");
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

            this.UI.clearPropertyFields();
        }
    }    
}

//Class for all non main-scene elements.
class userInterface{
    constructor(world){
        this.world = world;
        this.propertyMenu = document.getElementById("properties");
        this.buttonMenu = document.getElementById("propertyButtons");
        this.selectionPane = document.getElementById("selectionMenu");

        var option = document.createElement("option");
        option.textContent = "Basic tile";
        this.selectionPane.appendChild(option);

        //ugh
        this.deleteButton = document.getElementById("deleteButton");
        this.deleteButton.onclick = function(){
            if (this.selectionPane.value != "Basic tile"){
                delete this.world.prototypes[this.selectionPane.value];
                this.selectionPane.remove(this.selectionPane.selectedIndex);               
            }            
        }.bind(this);
    }

     clearPropertyFields(){
        this.propertyMenu.innerHTML= "";
        this.buttonMenu.innerHTML="";
    }

   
    displayProperties(activeObject){
        //Graphical prototype definition should use a similar method.
                
        if (activeObject){
            this.clearPropertyFields();

            this.propertyMenu = document.getElementById("properties");
            this.propertyMenu.setAttribute("class","propertyList");

            this.buttonMenu = document.getElementById("propertyButtons");
            this.buttonMenu.setAttribute("class","buttonMenu");

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

            for (var spriteName in this.world.spriteDict){
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
            
             //StringButton
            var addStringFieldButton = document.createElement("button"); //Need to tidy the formatting up
            addStringFieldButton.onclick=function(){
                var fieldName = window.prompt("Name of new field");                                
                this.addField(activeObject,propertyInputs,fieldName,"string");              
            }.bind(this);
            addStringFieldButton.innerHTML = "Add String Property";            
            
            //NumberButton
            var addNumberFieldButton = document.createElement("button");
            addNumberFieldButton.onclick=function(){
                var fieldName = window.prompt("Name of new field") 
                this.addField(activeObject,propertyInputs,fieldName,"number");    
                }.bind(this);
            addNumberFieldButton.innerHTML="Add Number Property";
            
            //Boolean(True/False) Button
            var addBooleanFieldButton = document.createElement("button");
            addBooleanFieldButton.onclick = function(){
                var fieldName = window.prompt("Name of new field");
                this.addField(activeObject,propertyInputs,fieldName,"boolean");
            }.bind(this);
            addBooleanFieldButton.innerHTML = "Add True/False Property";

           //Update button and enter key should both do the same thing.         
           var updateButton = document.createElement("button");
           updateButton.setAttribute("class","wideButton");    
           updateButton.onclick= function(){
               //set all the fixed fields.
               this.renameObject(name_input.value);
               this.world.moveObject(activeObject,x_input.value,y_input.value);
               activeObject.solid = solid_check.checked;
               activeObject.changeSprite(sprite_input.value);

               this.updateFields(activeObject,propertyInputs);
           }.bind(this);
           updateButton.innerHTML = "Update"; 
           
           //Enter key triggers update as well when pressed. 
           this.propertyMenu.addEventListener("keyup", function(event) {
           if (event.key === "Enter") {
               this.renameObject(name_input.value);
               this.world.moveObject(activeObject,x_input.value,y_input.value);
               activeObject.solid = solid_check.checked;
               activeObject.changeSprite(sprite_input.value);

               this.updateFields(activeObject,propertyInputs);                
               }
           }.bind(this));

           var newBaseTypeButton = document.createElement("button");
           newBaseTypeButton.setAttribute("class", "wideButton");
           newBaseTypeButton.onclick= function(){
               var newBaseTypeName = prompt("Name your new tile type");               
                if (newBaseTypeName && newBaseTypeName.length>1 && !(newBaseTypeName in this.world.prototypes)){
                    this.world.prototypes[newBaseTypeName] = new Prototype(newBaseTypeName, activeObject);

                    var option = document.createElement("option");
                    option.textContent=newBaseTypeName;
                    this.selectionPane.appendChild(option);
                }else{
                   console.log("invalid base type name");
               }               
           }.bind(this);
           newBaseTypeButton.innerHTML = "Save as new base type";
            
            //Need to space out the buttons a bit in the CSS.
            this.buttonMenu.appendChild(addNumberFieldButton);
            this.buttonMenu.appendChild(addStringFieldButton); 
            this.buttonMenu.appendChild(addBooleanFieldButton);
            this.buttonMenu.appendChild(document.createElement("br"));
            this.buttonMenu.appendChild(updateButton);
            this.buttonMenu.appendChild(document.createElement("br"));
            this.buttonMenu.appendChild(newBaseTypeButton);

            //Core exposed values are hard coded in.
            //Yet to add, depth property and sprite property.
            //Depth is a number, sprite should be a dropdown of all available sprites.
            this.propertyMenu.appendChild(name_label);
            this.propertyMenu.appendChild(name_input);
            this.propertyMenu.appendChild(document.createElement("br"));

            this.propertyMenu.appendChild(sprite_label);
            this.propertyMenu.appendChild(sprite_input);
            this.propertyMenu.appendChild(document.createElement("br"));

            this.propertyMenu.appendChild(x_label);
            this.propertyMenu.appendChild(x_input);
            this.propertyMenu.appendChild(document.createElement("br"));

            this.propertyMenu.appendChild(y_label);
            this.propertyMenu.appendChild(y_input);
            this.propertyMenu.appendChild(document.createElement("br"));

            this.propertyMenu.appendChild(solid_label);
            this.propertyMenu.appendChild(solid_check);
            this.propertyMenu.appendChild(document.createElement("br"));

            for (var index in activeObject.exposed_fields){               
                var label = document.createElement("span");
                label.textContent = index +": ";
                label.setAttribute("class","propertyLabel");
                this.propertyMenu.appendChild(label);              
                
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
                
                this.propertyMenu.appendChild(propertyInputs[index]);
                this.propertyMenu.appendChild(document.createElement("br"));
                }                      

            }
        }         

   //function to add a field label + input to the tile, 
    //two string inputs, one for the name of the field and one for the type of the field
    //"string", "number", "boolean"
    addField(activeObject,propertyInputs,fieldName, fieldType){ 
        if (fieldName && fieldName.length>1 && !(fieldName in activeObject.exposed_fields) && !(fieldName in propertyInputs)){                  
            var label = document.createElement("span");
            label.textContent = fieldName + ": ";
            label.setAttribute("class", "propertyLabel");
            this.propertyMenu.appendChild(label);

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

            this.propertyMenu.appendChild(propertyInputs[fieldName]);
            this.propertyMenu.appendChild(document.createElement("br"));
            }else if(fieldName in activeObject.exposed_fields || fieldName in propertyInputs){
                console.log("Propety name taken");
            }
    }

    //Used to update the non-core fields. 
    updateFields(activeObject, propertyInputs){
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
    }

    //Rework to take ref instead of using field
    renameObject(name){
        if (name){            
            //@TODO, more extensive namespace checking
            if (!this.world.spriteNamespace[name]){
                this.world.focusObject.name = name;
                this.world.spriteNamespace[name] = this.world.focusObject;            
            }else if (this.world.spriteNamespace[name]==this.world.focusObject){
                //Probably more elegant way.
            }else{
                console.log("Name taken");
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
    scene: [mainScene]
}

let game = new Phaser.Game(config);