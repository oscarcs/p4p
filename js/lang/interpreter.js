class Interpreter {
    constructor(root, globalQueue, tile) {
        this.root = root;
        this.globalQueue = globalQueue;
        this.tile = tile;
        
    }

    interpret() {
        return this.execute(this.root);
    }

    execute(node) {
        let result = '';
        let name = '';

        // Switch on the node type:
        switch (node.type) {
            case 'program':
                for (let child of node.children) {
                    result = this.execute(child);
                }
                return result;
            
            case 'loop':
                return '';

            case 'block':
                for (let child of node.children) {
                    result = this.execute(child);
                }
                return result;

            case 'for':
                let start = this.execute(node.children[0]); 
                let end = this.execute(node.children[1]);

                if (start < end) {
                    for (let i = start; i < end; i++) {
                        result = this.execute(node.children[2]);
                    }
                }
                else if (end < start) {
                    for (let i = end; i < start; i++) {
                        result = this.execute(node.children[2]);
                    }
                }
                return result;

            case 'assignment':
                name = node.children[0].reproduction;

                //@@TODO type checking for core fields.
                if (typeof this.tile[name] !== 'undefined') {
                    this.tile.queuedActions.push(()=>{
                        this.tile[name] = this.execute(node.children[1]);
                    });

                    //this.tile[name] = this.execute(node.children[1]);
                    return this.tile[name]; 
                }
                else {
                    
                    this.tile.queuedActions.push(()=>{
                        this.tile.exposed_fields[name] = this.execute(node.children[1]);
                    });

                    //this.tile.exposed_fields[name] = this.execute(node.children[1]);
                    return this.tile.exposed_fields[name]; 
                }

            case 'op':
                return this.operator(node);

            case 'numeric':
                return parseFloat(node.reproduction);

            case 'string':
                return node.reproduction;

            case 'boolean':
                return node.reproduction === 'true';

            case 'identifier':
                name = node.reproduction;
                let value;

                if (typeof this.tile[name] !== 'undefined') {
                    return this.tile[name];
                }
                else if (typeof this.tile.exposed_fields[name] !== 'undefined') {
                    return this.tile.exposed_fields[name];
                }
                else {
                    //@@ERROR
                    return '';
                }

            case 'call':
                name = node.reproduction;

                let args = [];
                for (let arg of node.children) {
                    let v = this.execute(arg);
                    console.log(v);
                    args.push(v);
                }

                //Check if it is a function
                if (typeof this.tile !== "undefined" &&
                    name in this.tile.actions){

                    this.tile.queuedActions.push(() => {
                        this.tile.actions[name].apply(null, args);
                    });
                }else{
                    //@@ERROR 
                    console.log(name + " is not a action of this tile")
                    return;
                }              

                break;
        }

    }

    operator(node) {
        switch(node.reproduction) {
            case '+':
                return parseFloat(this.execute(node.children[0])) +
                    parseFloat(this.execute(node.children[1])); 
            case '-':
                return parseFloat(this.execute(node.children[0])) -
                    parseFloat(this.execute(node.children[1]));
        }
    }
}