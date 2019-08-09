class Prototype {
    constructor(type, tile) {
        this.type = type;
        this.context = new ExecutionContext();

        if (tile) {
            this.context = tile.context.copy();
        }
        else {
            this.spriteName = 'tree';
        }
    }

    getContext() {
        return this.context;
    }

    serialize() {
        return JSON.stringify(this);
    }
}