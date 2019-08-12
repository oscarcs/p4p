class Interpreter {
    constructor(root, event, context) {
        this.root = root;
        this.next = root;
        this.event = event;
        this.context = context;
        this.stack = [];
    }

    pushStack(value) {
        this.stack.push(value);
    }

    popStack() {
        return this.stack.pop();
    }

    step() {
        let next = this.execute(this.next);
        console.log(next, this.stack);

        if (next) {
            this.next = next;
        }
        else {
            this.context.stop(this.event);
            this.next = this.root;
        }
    }

    execute(node) {
        switch (node.type) {
            case 'assignment':
                let value = this.popStack();
                let ident = this.popStack();

                //@@TODO: local vs prop logic!

                //@@TODO: lookup and set
                this.context.setProperty(ident.name, value);

                return node.successor;

            case 'ident':
                this.pushStack({name: node.reproduction});
                return node.successor;
            
            case 'numeric':
                this.pushStack(parseFloat(node.reproduction));
                return node.successor;
            
            case 'string':
                this.pushStack(node.reproduction);
                return node.successor;

            case 'boolean':
                this.pushStack(node.reproduction === 'true');
                return node.successor;

            case 'op':
                let x = this.popStack();
                let y = this.popStack();

                // Resolve variables
                if (x.name) {
                    x = this.context.lookup(this.event, x.name);
                }
                if (y.name) {
                    y = this.context.lookup(this.event, y.name);
                }

                //@@TODO: typechecking!
                
                switch (node.reproduction) {
                    case '+': this.pushStack(x + y); break;
                    case '-': this.pushStack(x - y); break;
                    //@@TODO: implement ops
                }

                return node.successor;
            
            default:
                throw 'Not implemented!';
        }
    }
}