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
                       
        if (activeObject){
            this.clearPropertyFields();

            this.propertyMenu = document.getElementById("properties");
            this.propertyMenu.setAttribute("class","propertyList");

            this.buttonMenu = document.getElementById("propertyButtons");
            this.buttonMenu.setAttribute("class","buttonMenu");

            var propertyInputs = []; //Inputfields for all the user defined fields

            var type_label  = document.createElement("span");
            type_label.textContent = "Tile Type: "
            type_label.setAttribute("class", "propertyLabel");

            var type_input = document.createElement("span");
            type_input.textContent = activeObject.type;
            type_input.setAttribute("class","propertyInput");
            

            //Label for name data for a tile.
            var name_label = document.createElement("span");
            name_label.textContent = "Name: ";
            name_label.setAttribute("class", "propertyLabel");

            var name_input = document.createElement("input");
            name_input.setAttribute("class", "propertyInput");
            if (activeObject.name){
                name_input.value = activeObject.name;
            }          

            //Sprite information of a tile
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

            //X Position information about a tile
            var x_label = document.createElement("span");
            x_label.textContent = "X: ";
            x_label.setAttribute("class", "propertyLabel");

            var x_input = document.createElement("input");
            x_input.setAttribute("type","number");
            x_input.setAttribute("class","propertyInput");
            x_input.value = activeObject.x; 

            //Y Position information about a tile
            var y_label = document.createElement("span");
            y_label.textContent = "Y: ";
            y_label.setAttribute("class", "propertyLabel");
            
            var y_input = document.createElement("input");
            y_input.setAttribute("type","number");
            y_input.value = activeObject.y; 
            y_input.setAttribute("class","propertyInput");

            //Solid/passable information about a tile
            var solid_label=document.createElement("span");
            solid_label.textContent="Solid: ";
            solid_label.setAttribute("class","propertyLabel");

            var solid_check = document.createElement("input");
            solid_check.setAttribute('type','checkbox');
            solid_check.setAttribute("class", "propertyInput");
            solid_check.checked = activeObject.solid;            
            
             //Add new String property Button
            var addStringFieldButton = document.createElement("button"); //Need to tidy the formatting up
            addStringFieldButton.onclick=function(){
                var fieldName = window.prompt("Name of new field");                                
                this.addField(activeObject,propertyInputs,fieldName,"string");              
            }.bind(this);
            addStringFieldButton.innerHTML = "Add String Property";            
            

            //Add new Number Property Button
            var addNumberFieldButton = document.createElement("button");
            addNumberFieldButton.onclick=function(){
                var fieldName = window.prompt("Name of new field") 
                this.addField(activeObject,propertyInputs,fieldName,"number");    
                }.bind(this);
            addNumberFieldButton.innerHTML="Add Number Property";

            
            //Add new Boolean(True/False) Button
            var addBooleanFieldButton = document.createElement("button");
            addBooleanFieldButton.onclick = function(){
                var fieldName = window.prompt("Name of new field");
                this.addField(activeObject,propertyInputs,fieldName,"boolean");
            }.bind(this);
            addBooleanFieldButton.innerHTML = "Add True/False Property";
                      

            this.propertyMenu.oninput=function(){
            this.renameObject(activeObject, name_input.value);
            this.world.moveObject(activeObject,x_input.value,y_input.value);
            activeObject.solid = solid_check.checked;
            activeObject.changeSprite(sprite_input.value);

            this.updateFields(activeObject,propertyInputs);
           }.bind(this);


           //Save as new base type button
           var newBaseTypeButton = document.createElement("button");
           newBaseTypeButton.setAttribute("class", "wideButton");
           newBaseTypeButton.onclick= function(){
               var newBaseTypeName = prompt("Name your new tile type");               
                if (newBaseTypeName && newBaseTypeName.length>1 && !(newBaseTypeName in this.world.prototypes)){
                    this.world.prototypes[newBaseTypeName] = new Prototype(newBaseTypeName, activeObject);
                    this.addPrototypeToList(newBaseTypeName);
                    activeObject.type = newBaseTypeName;
                    
                    this.displayProperties(activeObject);

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
            this.buttonMenu.appendChild(newBaseTypeButton);

            //Core exposed values are hard coded in.
            //Yet to add, depth property 
            //Depth is a number, sprite should be a dropdown of all available sprites.
            this.propertyMenu.appendChild(type_label);
            this.propertyMenu.appendChild(type_input);
            this.propertyMenu.appendChild(document.createElement("br"));

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
           
            //Non core fields lables and inputs. 
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
    
    addPrototypeToList(newBaseTypeName){
        var option = document.createElement("option");
        option.textContent=newBaseTypeName;
        this.selectionPane.appendChild(option);
    }
    
    renameObject(activeObject, name){
        if (name){            
            //@TODO, more extensive namespace checking
            if (!this.world.spriteNamespace[name]){
                activeObject.name = name;
                this.world.spriteNamespace[name] = activeObject;            
            }else if (this.world.spriteNamespace[name]==activeObject){
                //Probably more elegant way.
            }else{
                console.log("Name taken");
            }
        }
    }
}