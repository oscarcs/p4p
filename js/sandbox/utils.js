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

        this.spriteDict["woman"] = {sheet: 'creatures', index: 0};
        this.spriteDict["man"] = {sheet: 'creatures', index: 3};
        this.spriteDict["noble"] = {sheet: 'creatures', index: 6};

        this.spriteDict["mouse"] = {sheet: 'creatures', index: 8};
        this.spriteDict["rat"] = {sheet: 'creatures', index: 9};
        this.spriteDict["dog"] = {sheet: 'creatures', index: 10};

        this.spriteDict["rabbit"] = {sheet: 'creatures', index:12};
        this.spriteDict["wolf"] = {sheet: 'creatures', index: 13};

        this.spriteDict["goblin"] = {sheet: 'creatures', index: 16};
        this.spriteDict["hog"] = {sheet: 'creatures', index: 21};

        this.spriteDict["spider"] = {sheet: 'creatures', index: 32};
        this.spriteDict["beetle"] = {sheet: 'creatures', index: 42};
        this.spriteDict["ghost"] = {sheet: 'creatures', index: 58};
        this.spriteDict["mushroom"] = {sheet: "creatures", index: 65};
        this.spriteDict["snake"] = {sheet:"creatures", index: 68};

        
    }
}