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

        //@TODO probably worthwhile to create a delete tool as well.

        //PROTOTYPE HANDLING BUTTONS        
        this.deleteButton = document.getElementById("deleteButton");
        this.deleteButton.onclick = function(){
            if (this.selectionPane.value != "Basic tile"){
                delete this.world.prototypes[this.selectionPane.value];
                this.selectionPane.remove(this.selectionPane.selectedIndex);               
            }            
        }.bind(this);

        this.editButton = document.getElementById("editButton");
        this.editButton.onclick = function(){
            console.log("nice");
            //@TODO, implement this so we can edit prototypes
        }.bind(this);
        this.multipleSelect = false; 
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

            //When there are multiple sprites being selected.
            if (this.multipleSelect.size>1){
                var nextButton = document.createElement("button");
                nextButton.setAttribute("class","wideButton");
                nextButton.innerHTML= "Next Tile";

                nextButton.onclick = function(){
                    var nextTile = this.multipleIterator.next();

                    if (nextTile.done){
                        this.multipleIterator = this.multipleSelect.values();
                        nextTile = this.multipleIterator.next();
                    }
                    this.world.focusObject = nextTile.value;
                    this.displayProperties(nextTile.value);                       
                }.bind(this);

                this.buttonMenu.append(nextButton)

                this.buttonMenu.append(document.createElement("br"));
                this.buttonMenu.append(document.createElement("br"));
            }

            var propertyInputs = []; //Inputfields for all the user defined fields          
            
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


            var type_div = this.makeTypeField(activeObject);
            var name_div = this.makeTextField(activeObject,"name");

            //Sprite information of a tile @TODO Divify this.
            var sprite_label = document.createElement("span");
            sprite_label.textContent = "Sprite: ";
            sprite_label.setAttribute("class", "propertyLabel")

            var sprite_input = document.createElement("select");
            sprite_input.setAttribute("class", "propertyInput");

            for (var spriteName in this.world.spriteDict){
                var option = document.createElement("option");
                option.textContent = spriteName; 
                sprite_input.appendChild(option);
            }
            sprite_input.value = activeObject.spriteName;    

            var sprite_div = this.makeDiv(sprite_label,sprite_input);


            var x_div = this.makeNumberField(activeObject, "x");
            var y_div = this.makeNumberField(activeObject, "y");
            var layer_div = this.makeNumberField(activeObject, "layer");
            var solid_div = this.makeBoolField(activeObject, "solid");

            this.propertyMenu.appendChild(type_div);            

            this.propertyMenu.appendChild(name_div);            

            this.propertyMenu.appendChild(sprite_div);        

            this.propertyMenu.appendChild(x_div);

            this.propertyMenu.appendChild(y_div);

            this.propertyMenu.appendChild(layer_div);

            this.propertyMenu.appendChild(solid_div);
           

            //Non core fields lables and inputs. 
            for (var index in activeObject.exposed_fields){ 

                var label = document.createElement("span");
                label.textContent = index +": ";
                label.setAttribute("class","propertyLabel");             
                
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
                
                var propertyDiv = this.makeDiv(label,propertyInputs[index]);
                propertyDiv.appendChild(this.makeDeleteButton(activeObject,index));

                this.propertyMenu.appendChild(propertyDiv); 
                }  
                
            //On edit
            this.propertyMenu.oninput=function(){
                this.renameObject(activeObject, this.getDivValue(name_div));
                this.world.moveObject(activeObject,this.getDivValue(x_div),this.getDivValue(y_div));
                activeObject.solid = this.getDivValue(solid_div);
                activeObject.changeSprite(this.getSelectDivValue(sprite_div));
                activeObject.changeDepth(this.getDivValue(layer_div));

                this.updateFields(activeObject,propertyInputs);
                }.bind(this);           
            }
        } 
            

   //function to add a field label + input to the tile, 
    //two string inputs, one for the name of the field and one for the type of the field
    //"string", "number", "boolean"
    addField(activeObject,propertyInputs,fieldName, fieldType){ 

        if (fieldName.length < 1 ){
            console.log("Field name too short");
            return;
        }else if (fieldName.length >20){
            console.log("Field name too long");
            return;
        }


        if (fieldName in activeObject.exposed_fields || fieldName in propertyInputs){
            console.log("Field taken");
            return;
        }

        var label = document.createElement("span");
        label.textContent = fieldName + ": ";
        label.setAttribute("class", "propertyLabel");

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

        var propertyDiv = this.makeDiv(label,propertyInputs[fieldName]);
        propertyDiv.appendChild(this.makeDeleteButton(activeObject,fieldName));

        this.propertyMenu.appendChild(propertyDiv);

        this.updateFields(activeObject,propertyInputs);

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

    makeTypeField(activeObject){
        var type_label  = document.createElement("span");
        type_label.textContent = "Tile Type: "
        type_label.setAttribute("class", "propertyLabel");

        var type_input = document.createElement("span");
        type_input.textContent = activeObject.type;
        type_input.setAttribute("class","propertyInput");

        return(this.makeDiv(type_label,type_input));
    }

    makeTextField(activeObject, fieldName){
        //Label for name data for a tile.
        var text_label = document.createElement("span");
        text_label.textContent = fieldName + ": ";
        text_label.setAttribute("class", "propertyLabel");

        var text_input = document.createElement("input");
        text_input.setAttribute("class", "propertyInput");

        if (fieldName in activeObject && activeObject[fieldName]!==undefined){
            text_input.value = activeObject[fieldName];
        } 

        return(this.makeDiv(text_label,text_input));
    }

    makeBoolField(activeObject, fieldName){
        //Label for Boolean information about a tile.
        var bool_label=document.createElement("span");
        bool_label.textContent=fieldName + ": ";
        bool_label.setAttribute("class","propertyLabel");

        var bool_check = document.createElement("input");
        bool_check.setAttribute('type','checkbox');
        bool_check.setAttribute("class", "propertyInput");

        if (fieldName in activeObject && activeObject[fieldName]!==undefined){
            bool_check.checked = activeObject[fieldName];
        }
        return(this.makeDiv(bool_label,bool_check));
    }

    makeNumberField(activeObject, fieldName){
        //Y Position information about a tile
        var num_label = document.createElement("span");
        num_label.textContent = fieldName+ ": ";
        num_label.setAttribute("class", "propertyLabel");
            
        var num_input = document.createElement("input");
        num_input.setAttribute("type","number");         
        num_input.setAttribute("class","propertyInput");

        if (fieldName in activeObject && activeObject[fieldName]!==undefined){
            num_input.value = activeObject[fieldName];
        } 
        return this.makeDiv(num_label, num_input);
    }

    //For div labels for our properties
    makeDiv(label, input){
        var outputDiv = document.createElement("div");
        outputDiv.setAttribute("class","propertyDiv"); 
        outputDiv.appendChild(label);
        outputDiv.appendChild(input);        
        return outputDiv;
    }

    getDivValue(inputDiv){
        var input = inputDiv.getElementsByTagName("INPUT")[0];
        if (input.type == "checkbox"){
            return input.checked;
        }else{
            return input.value;
        }
    }

    //For when the div has select rather than input.
    getSelectDivValue(selectDiv){
        var select = selectDiv.getElementsByTagName("SELECT")[0];
        return select.value;
    }

    //Used to make the deleteButton for an object
    makeDeleteButton(activeObject,field){
        var deleteButton = document.createElement("button");

        deleteButton.onclick =function(){                    
            this.deleteField(activeObject,field);
        }.bind(this);
        deleteButton.innerHTML = "Delete";
        return deleteButton;
    }


    deleteField(activeObject, field){
        if(field in activeObject.exposed_fields){
            delete activeObject.exposed_fields[field];
        }        
        this.updateFields();
        this.displayProperties(activeObject);
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

    handleMultipleTargets(multipleSet){
        this.multipleSelect = multipleSet;
        this.multipleIterator = multipleSet.values();
    }    

    getTool(){
        var tools = document.getElementsByName("tool");
        //Could make this lazy but eh.
        for (var i = 0; i<tools.length;i++){
            if (tools[i].checked){
                return (tools[i].value);
            }
        }
    }
}