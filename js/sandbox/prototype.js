class Prototype {
    constructor(type, tile) {
        this.type = type;
        this.context = new ExecutionContext();


        if (tile) {
            tile.getContext().copy(this.context);
        }
        else {
            this.spriteName = 'tree';
        }
        
    }

    /**
     * Return the context of the prototype. 
     */
    getContext() {
        return this.context;
    }

    serialize() {
        return JSON.stringify(this);
    }
}