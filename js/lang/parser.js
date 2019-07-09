class Node {
    constructor(type) {
        this.type = type;
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
    }
}

class Parser {
    constructor (tokens) {
        this.tokens = tokens;
        this.index = 0;
    }

    token() {
        if (this.index < this.tokens.length) {
            return this.tokens[this.index];
        }
    }

    accept(type) {
        if (typeof this.token() !== 'undefined' && this.token().type === type) {
            this.index++;
            return true;
        }
        return false;
    }

    expect(type) {
        if (this.accept(type)) {
            return true;
        }

        //@@ERROR
        throw "Expected " + type + " but got " + this.tokens[this.index]
    }

    parse() {
        let root = new Node('program');
        return root;
    }

    static printSyntaxTree(root) {
        let str = '';

        let nodes = [root];
        let depths = [0];

        while (nodes.length > 0) {
            let cur = nodes.shift();
            let depth = depths.shift();

            nodes = cur.children.concat(nodes);

            for (let i of cur.children) {
                depths.unshift(depth + 1);
            }

            let indent = '';
            for (let i = 0; i < depth; i++) {
                indent += '    ';
            }

            str += indent + Parser.printNode(cur) + '\n';
        }
        
        return str;
    }

    static printNode(node) {
        return '"' + node.type + '"';
    }
}