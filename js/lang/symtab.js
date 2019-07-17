class Symtab {
    constructor(parent) {
        this.parent = parent;
        this.children = [];
        this.parent.addChild(this);
    }

    addChild(child) {
        this.children.push(child);
    }
}