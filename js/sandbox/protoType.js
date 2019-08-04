class Prototype {
    constructor(type, tile) {
        this.type = type;

        if (tile) {
            this.spriteName = tile.spriteName;
            this.solid = tile.solid;
            this.depth = tile.depth;
            this.fields = {};
            this.actions = {};

            for (var key in tile.fields) {
                this.fields[key] = tile.fields[key];
            }

            for (var action in tile.action) {
                this.actions[action] = tile.actions[action];
            }
        }
        else {
            this.spriteName = 'tree';
            this.solid = false;
            this.depth = 1;
            this.fields = {};
            this.actions = {};
        }
    }

    serialize() {
        return JSON.stringify(this);
    }
}