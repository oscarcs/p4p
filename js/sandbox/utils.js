class Utils {
    

    //@@RENAME
    // Grid -> Screen
    static gridToTrue(point) {
        return point * 16 + 8;
    }

    //@@RENAME
    // Screen -> Grid
    static trueToGrid(point) {
        return Math.floor((point - 0) / 16);
    }

 
    //Get the mapping (tilesheet, index) of a tile given the spriteName
    static nameToMapping(name) {
        return this.spriteDict[name];
    }

    //Return the entire sprite Dicitonary
    static getSpriteMapping(){
        return Object.keys(this.spriteDict);
    }
    
    //Called at the start to map all the sprites to their tileSheet and index
    static mapTilesToNames() {
        this.spriteDict = {}
        
        this.spriteDict["deer"] = {sheet:'tiles', index: 1};
        this.spriteDict["snow"] = {sheet:'tiles', index: 12};
        this.spriteDict["tree"] = {sheet: 'tiles', index: 0};

        this.spriteDict["person"] = {sheet: 'creatures', index: 0};
        this.spriteDict["person2"] = {sheet: 'creatures', index: 1};
        this.spriteDict["person3"] = {sheet: 'creatures', index: 3};
        this.spriteDict["person4"] = {sheet: 'creatures', index: 4};
        this.spriteDict["person5"] = {sheet: 'creatures', index: 5};
        this.spriteDict["person6"] = {sheet: 'creatures', index: 6};

        this.spriteDict["rat"] = {sheet: 'creatures', index: 8};
        this.spriteDict["rat2"] = {sheet: 'creatures', index: 9};
        this.spriteDict["dog"] = {sheet: 'creatures', index: 10};
        this.spriteDict["dog2"] = {sheet: 'creatures', index: 11};
        this.spriteDict["rabbit"] = {sheet: 'creatures', index:12};
        this.spriteDict["wolf"] = {sheet: 'creatures', index: 13};
        
    }
}