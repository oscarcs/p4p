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

    threadBlock(node) {
        for (let child of node.children) {
            this.threadStatement(child);
        }
        this.lastNode.successor = node;
        this.lastNode = node;
    }

    threadStatement(node) {
        switch(node.type) {
            case 'if':

                break;
            
            case 'while':

                break;
            
            case 'action':

                break;
            
            case 'return':

                break;

            case 'loop':

                break;

            case 'assignment':

                break;

            case 'call':

                break;
        }
    }

    threadExpression(node) {
        switch(node.type) {
            case 'op':
                this.threadExpression(node.children[0]);
                this.threadExpression(node.children[1]);
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
        }
    }
}