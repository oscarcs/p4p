class Prototype {
    constructor(type, tile) {
        this.type = type;
        this.context = new ExecutionContext();

        
        if (tile) {
            tile.getContext().copy(this.context);            
        }      
    }

    /**
     * Return the context of the prototype. 
     */
    getContext() {
        return this.context;
    }

    getSpriteName() {
        return this.context.getProperty("spriteName");
    }

    serialize() {
        return JSON.stringify(this);
    }
}