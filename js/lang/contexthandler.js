class ContextHandler {
    constructor(root) {
        this.root = root;
        this.lastNode = null;
    }

    thread() {
        let dummyNode = {};
        this.lastNode = dummyNode;
        this.threadBlock(this.root);
        return dummyNode.successor;
    }

    threadBlock(node, exitNode) {
        for (let child of node.children) {
            this.threadStatement(child, exitNode);
        }
        // this.lastNode.successor = node;
        // this.lastNode = node;
    }

    threadStatement(node, exitNode) {
        switch(node.type) {
            case 'if':
                this.threadIfStatement(node);
                return;

            case 'while':
                this.threadWhileStatement(node);
                return;

            case 'for':
                this.threadForStatement(node);
                return;
            
            case 'action':
                //@@TODO
                break;
            
            case 'return':
                //@@TODO: going to require a bit more context management
                break;

            case 'break':
                this.threadBreakStatement(node, exitNode);
                break;

            case 'loop':
                this.threadLoopStatement(node);
                return;

            case 'assignment':
                this.threadAssignmentStatement(node);
                return;

            case 'call':
                this.threadExpression(node);
                return;
        }
    }

    threadIfStatement(node) {
        // Thread the condition and then jump to the if
        this.threadExpression(node.children[0]);
        this.lastNode.successor = node;
        
        // Create a 'fake' node that joins the flow of control after the conditional.
        let endIfNode = new Node('pseudo', ContextHandler.randomID());

        // Thread the false block first, because we're going to overwrite the next
        // pointer afterwards.
        this.lastNode = node;
        this.threadElse(node.children[2]);
        this.lastNode.successor = endIfNode;
        node.successorFalse = node.successor;

        // Thread the true block.
        this.lastNode = node;
        this.threadBlock(node.children[1]);
        this.lastNode.successor = endIfNode;
        
        this.lastNode = endIfNode;
    }

    //@@TODO: Do this more cleanly.
    threadElse(node) {
        if (node.children.length === 0) {
            return;
        }
        else if (node.children[0].type === 'if') {
            this.threadStatement(node.children[0]);
        }
        else if (node.children[0].type === 'block') {
            this.threadBlock(node.children[0]);
        }
    }

    threadLoopStatement(node) {
        this.lastNode.successor = node;
        this.lastNode = node;
        
        // Create a cycle in the control flow graph with a fake node.
        let endLoopNode = new Node('pseudo', ContextHandler.randomID());
        endLoopNode.successor = node;

        // Thread the loop body
        this.threadBlock(node.children[0], endLoopNode);
        
        this.lastNode.successor = endLoopNode;
        this.lastNode = endLoopNode;
    } 

    threadWhileStatement(node) {
        // Create a pseudo node for the entry point to the conditional.
        let startWhileNode = new Node('pseudo', ContextHandler.randomID());
        this.lastNode.successor = startWhileNode;
        this.lastNode = startWhileNode;

        // Thread the condition and jump to the while node afterwards.
        this.threadExpression(node.children[0]);
        this.lastNode.successor = node;
        this.lastNode = node;

        // Create a 'fake' node that joins the flow of control after the conditional.
        let endWhileNode = new Node('pseudo', ContextHandler.randomID());
        node.successorFalse = endWhileNode;

        // Thread the loop body
        this.threadBlock(node.children[1], endWhileNode);

        // Jump back to the entry point after the body
        this.lastNode.successor = startWhileNode;

        this.lastNode = endWhileNode;
    }

    threadForStatement(node) {
        // Thread the identifier
        this.lastNode.successor = node.children[0];
        this.lastNode = node.children[0];

        this.threadExpression(node.children[1]);
        this.threadExpression(node.children[2]);
        this.lastNode.successor = node;
        this.lastNode = node;

        // Create a 'fake' node that joins the flow of control after the conditional.
        let endForNode = new Node('pseudo', ContextHandler.randomID());
        node.successorFalse = endForNode;
        
        this.threadBlock(node.children[3], endForNode);
        this.lastNode.successor = node.children[0];

        this.lastNode = endForNode;
    }

    threadAssignmentStatement(node) {
        this.lastNode.successor = node.children[0];
        this.lastNode = node.children[0];
        
        this.threadExpression(node.children[1]);

        this.lastNode.successor = node;
        this.lastNode = node;
    }

    threadBreakStatement(node, exitNode) {
        this.lastNode.successor = node;
        this.lastNode = node;
        this.lastNode.successor = exitNode;
    }

    threadExpression(node) {
        switch(node.type) {
            case 'op':
                this.threadExpression(node.children[0]);
                this.threadExpression(node.children[1]);
                this.lastNode.successor = node;
                this.lastNode = node;
                break;

            case 'prefix_op':
                this.threadExpression(node.children[0]);
                this.lastNode.successor = node;
                this.lastNode = node;
                break;

            case 'numeric':
            case 'string':
            case 'boolean':
            case 'ident':
                this.lastNode.successor = node;
                this.lastNode = node;
                break;

            case 'call':
                for (let child of node.children) {
                    this.threadExpression(child);
                }

                this.lastNode.successor = node;
                this.lastNode = node;
                node.args = node.children.length;
                return;
            
            default:
                throw 'Error in context handler: Not implemented!';
        }
    }

    static printContext(root, indent) {
        if (typeof indent === 'undefined') {
            indent = '';
        }

        let str = '';
        let cur = root;
        while (cur.successor && cur.successor.type !== 'loop') {
            str += indent + Parser.printNode(cur) + '\n';

            if (cur.successorFalse) {
                str += ContextHandler.printContext(cur.successorFalse, indent + '    ') + '\n'; 
            }

            cur = cur.successor;
        }
        str += Parser.printNode(cur);

        return str;
    }

    // Generate a random reproduction for debugging purposes.
    static randomID() {
        return Math.round(Math.random() * 1000000) + '';
    }
}