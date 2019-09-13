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

    /**
     * Pop the stack, resolving the variable if there is one.
     */
    popStackAsValue() {
        let x = this.popStack();
        if (x.name) {
            x = this.context.lookup(this.event, x.name);
        }
        return x;
    }

    step() {
        let next = this.execute(this.next);

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
            case 'pseudo':
            case 'loop':
                return node.successor;
                
            case 'assignment':
                let value = this.popStackAsValue();
                let ident = this.popStack();
                this.context.lookupAndSet(this.event, ident.name, value);

                return node.successor;

            case 'call':
                let values = [];
                for (let i = 0; i < node.args; i++) {
                    values.unshift(this.popStackAsValue());
                }                

                let f = this.context.getAction(node.reproduction);
                let result = 0;
                if (f !== null) {
                    result = f.apply(this.context.parent, values);
                }
                else {
                    //@@ERROR
                }
                this.pushStack(result);

                return node.successor;

            case 'if':
                let condition = this.popStackAsValue();
                let state = false;
                if (typeof condition === 'boolean') {
                    state = condition;
                }
                else if (typeof condition === 'number') {
                    state = condition > 0;
                }
                else if (typeof condition === 'string') {
                    state = condition !== '';
                }

                return state ? node.successor : node.successorFalse;
            
            case 'for':
                let upperBound = this.popStackAsValue();
                let lowerBound = this.popStackAsValue();
                let loopVariable = this.popStack();

                if (loopVariable.name) {
                    let val = this.context.lookup(this.event, loopVariable.name);

                    if (val === null) {
                        this.context.addLocal(this.event, loopVariable.name, lowerBound, 'numeric');
                        val = lowerBound;
                    }
                    else {
                        if (upperBound > lowerBound) {
                            this.context.lookupAndSet(this.event, loopVariable.name, val + 1);
                        }
                        else {
                            this.context.lookupAndSet(this.event, loopVariable.name, val - 1);
                        }
                    }

                    // Decide whether to continue the for loop or exit:
                    let state = true;
                    if (upperBound > lowerBound) {
                        state = val < upperBound;
                    }
                    else {
                        state = val > upperBound;
                    }
    
                    return state ? node.successor : node.successorFalse;
                }
                else {
                    //@@ERROR
                    throw 'Loop variable is not actually a variable!';
                }

            case 'while':
                console.log(node);

                throw 'not implemented';

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
                let y = this.popStackAsValue();
                let x = this.popStackAsValue();

                //@@TODO: typechecking!
                
                switch (node.reproduction) {
                    case '+': this.pushStack(x + y); break;
                    case '-': this.pushStack(x - y); break;
                    case '*': this.pushStack(x * y); break;
                    case '/': this.pushStack(x / y); break;
                    case '==': this.pushStack(x === y); break;
                    case '!=': this.pushStack(x !== y); break;
                    case '<': this.pushStack(x < y); break;
                    case '>': this.pushStack(x > y); break;
                    case '>=': this.pushStack(x >= y); break;
                    case '<=': this.pushStack(x <= y); break;
                    case '&&': this.pushStack(x && y); break;
                    case '||': this.pushStack(x || y); break;
                    case 'mod': this.pushStack(x % y); break;
                    case 'pow': this.pushStack(Math.pow(x, y)); break;
                    //@@TODO: implement ops
                }

                return node.successor;

            case 'prefix_op':
                let v = this.popStackAsValue();

                //@@TODO: typechecking!

                switch (node.reproduction) {
                    case '+': this.pushStack(+v); break;
                    case '-': this.pushStack(-v); break;
                    case '!': this.pushStack(!v); break;
                }

                return node.successor;
            
            default:
                throw 'Interpreter Error: Type not implemented: ' + node.type;
        }
    }
}