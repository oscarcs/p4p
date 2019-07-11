class Prototype{
    constructor(type,tile){
        this.type = type;

        if (tile){
            this.spriteName = tile.spriteName;
            this.solid = tile.solid;
            this.fields = {};
            this.actions = {};

            for (var keys in tile.exposed_fields){
                this.fields[keys] = tile.exposed_fields[keys];
            }

            for (var action in tile.action){
                this.actions[action] = tile.actions[action];
            }
        }
    }
    serialize(){
        return JSON.stringify(this);
    }

}