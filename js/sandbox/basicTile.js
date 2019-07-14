class BasicTile{   
    //TODO, need to include an immutable "type" property.
    constructor(world,x,y,spriteName,name=undefined){
        this.world=world;
        this.type = "Basic Tile";
        this.exposed_fields = {}; //array of exposed fields mapped to their values. 

        this.actions = {}; //array of functions mapped to the function name.

        this.x = x;
        this.y = y;

        this.spriteName = spriteName;
        var index = world.spriteDict[spriteName];
        
        this.sprite = this.world.add.sprite(world.utils.gridToTrue(x), world.utils.gridToTrue(y),'tiles',index); //This shouldn't be exposed.

        this.sprite.depth = 1;  
        this.depth = 1; 

        this.solid = false;
        this.name = name;

        this.queuedActions = []; //push tasks in, shift tasks out.
        
        var date = new Date();      
        this.waitTimer = date.getTime();
    }
    
    //Takes a base tile and then applies the prototype, i.e. changing the internal elements as neccessary. 
    applyProtoType(prototype){        
        this.solid = prototype.solid;
        this.type = prototype.type;
        this.changeSprite(prototype.spriteName);
        this.depth = prototype.depth;
        
        for (var key in prototype.fields){
            this.exposed_fields[key] = prototype.fields[key];
        } 
    }

    update(){               
        //For now, the update loop will take a function from the queue and execute it at every tick
        var date = new Date();
        //For use with the wait primitive function.
        if (this.queuedActions.length>0 && date.getTime()>this.waitTimer){
            var action = this.queuedActions.shift();
            action();
        }        
        
        if (this.world.utils.gridToTrue(this.x)!==this.sprite.x || this.world.utils.gridToTrue(this.y)!==this.sprite.y){
            //lazy update position
            this.sprite.x = this.world.utils.gridToTrue(this.x);
            this.sprite.y = this.world.utils.gridToTrue(this.y);           
        } 
        this.world.worldGrid[this.x][this.y].add(this);
    }

    destroy(){        
        this.world.worldGrid[this.x][this.y].delete(this);        
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
            this.sprite = this.world.add.sprite(this.world.utils.gridToTrue(this.x), this.world.utils.gridToTrue(this.y),'tiles',index);
        }
    }

    changeDepth(depth){
        if (depth<1){
            this.depth = 1;
        }else if (depth>10){
            this.depth = 10;
        }else{
            this.depth = depth;
        }
    }
    
    wait(duration){
        var date = new Date();
        this.waitTimer = date.getTime()+duration;
    }

    serialize(){
        var saveSprite = {};
        saveSprite.type = this.type;
        saveSprite.name = this.name;
        saveSprite.spriteName=this.spriteName;        

        saveSprite.x = this.x;
        saveSprite.y = this.y;
        saveSprite.exposed_fields = this.exposed_fields;
        
        saveSprite.solid = this.solid;
        return JSON.stringify(saveSprite);
    }
   
}