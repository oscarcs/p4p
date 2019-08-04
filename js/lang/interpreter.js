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

                if (typeof this.tile[name] !== 'undefined') {
                    this.tile[name] = this.execute(node.children[1]);
                    return this.tile[name]; 
                }
                else {
                    this.tile.setProperty(name, this.execute(node.children[1]));
                    return this.tile.getProperty(name); 
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
                return this.tile.getProperty(name);

            case 'call':
                name = node.reproduction;

                let args = [];
                for (let arg of node.children) {
                    let v = this.execute(arg);
                    args.push(v);
                }

                this.tile.queuedActions.push(() => {
                    this.tile.actions[name].apply(null, args);
                });

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