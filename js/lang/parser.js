class Node {
    constructor(type, reproduction) {
        this.type = type;
        this.reproduction = reproduction;
        this.children = [];
    }

    addChild(child) {
        this.children.push(child);
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;

        this.prefixFunctions = {
            'ident': {
                f: (token) => {
                    return new Node('ident', token.reproduction);
                },
                precedence: 0
            },
            
            'numeric': {
                f: (token) => {
                    return new Node('numeric', token.reproduction);
                },
                precedence: 0
            },
            
            'string': {
                f: (token) => {
                    return new Node('string', token.reproduction);
                },
                precedence: 0
            },

            'boolean': {
                f: (token) => {
                    return new Node('boolean', token.reproduction);
                },
                precedence: 0
            },

            'lparen': {
                f: (token) => {
                    let expression = this.expression(0);
                    this.expect('rparen');
                    return expression;
                },
                precedence: 60
            },

            '+': {
                f: (token) => {
                    let precedence = this.precedence(token);

                    this.advance();
                    let operand = this.expression(precedence);
                    
                    let node = new Node("prefix_" + token.type, token.reproduction);
                    node.addChild(operand);
                    return node;
                },
                precedence: 60
            },

            '-': {
                f: (token) => {
                    let precedence = this.precedence(token);

                    this.advance();
                    let operand = this.expression(precedence);

                    let node = new Node("prefix_" + token.type, token.reproduction);
                    node.addChild(operand);
                    return node;
                },
                precedence: 60
            }
        };

        this.infixFunctions = {
            '+': {
                f: (token, left) => {
                    let precedence = this.precedence(token);

                    this.advance();
                    let right = this.expression(precedence);
                    
                    let node = new Node(token.type, token.reproduction);
                    node.addChild(left);
                    node.addChild(right);
                    return node;
                }
            },

            '-': {
                f: (token, left) => {
                    let precedence = this.precedence(token);

                    this.advance();
                    let right = this.expression(precedence);
                    
                    let node = new Node(token.type, token.reproduction);
                    node.addChild(left);
                    node.addChild(right);
                    return node;
                }
            },
        };
    }

    prefix(token) {
        if (this.prefixFunctions[token.type]) {
            return this.prefixFunctions[token.type].f;
        }
        else if (this.prefixFunctions[token.reproduction]) {
            return this.prefixFunctions[token.reproduction].f;
        }
        else {
            return null;
        }
    }
    
    infix(token) {
        if (this.infixFunctions[token.type]) {
            return this.infixFunctions[token.type].f;
        }
        else if (this.infixFunctions[token.reproduction]) {
            return this.infixFunctions[token.reproduction].f;
        }
        else {
            return null;
        }
    }

    precedence(token) {
        if (token === null) {
            return -1;
        }

        if (this.prefixFunctions[token.type]) {
            return this.prefixFunctions[token.type].precedence;
        }
        else if (this.prefixFunctions[token.reproduction]) {
            return this.prefixFunctions[token.reproduction].precedence;
        }
        else if (this.infixFunctions[token.type]) {
            return this.infixFunctions[token.type].precedence;
        }
        else if (this.prefixFunctions[token.reproduction]) {
            return this.prefixFunctions[token.reproduction].precedence;
        } 

        return null;
    }

    advance() {
        this.index++; 
    }

    token() {
        if (this.index < this.tokens.length) {
            return this.tokens[this.index];
        }
        return null;
    }

    lookahead() {
        if (this.index + 1 < this.tokens.length) {
            return this.tokens[this.index + 1];
        }
        return null;
    }

    accept(type) {
        if (this.token() === null) {
            return false;
        }

        if (typeof this.token() !== 'undefined' && 
            (this.token().type === type || this.token().reproduction === type)
        ) {
            this.index++;
            return true;
        }
        return false;
    }

    expect(type) {
        if (this.index >= this.tokens.length) {
            throw "Ran out of tokens!";
        }
        
        if (this.accept(type)) {
            return true;
        }

        //@@ERROR
        throw "Expected " + type + " but got " + Lexer.printToken(this.tokens[this.index]);
    }

    parse() {
        return this.program();
    }

    program() {
        let program = new Node('program', '');

        let stmt;
        while (true) {
            stmt = this.statement();
            if (stmt === null) {
                break;
            }
            program.addChild(stmt);
        }

        return program;
    }

    statement() {
        let left = this.token();
        if (left === null) {
            return null;
        }

        if (this.accept('if')) {

        }
        else if (this.accept('for')) {

        }
        else if (this.accept('while')) {

        }
        else if (this.accept('action')) {

        }
        else if (this.accept('return')) {

        }
        else if (this.accept('loop')) {

        }
        else if (this.accept('ident')) {
            this.expect('=');

            let right = this.expression(0);
            console.log(right);

            console.log("1", this.token());
            this.advance();
            console.log("2", this.token());
            this.accept('\n');
            console.log("3", this.token());

            let node = new Node('assignment', '=');
            node.addChild(new Node('ident', left.reproduction));
            node.addChild(right);
            return node;
        }
        else {
            return null;
        }
    }

    expression(precedence) {
        if (this.prefix(this.token()) !== null) {
            
            let prefix = this.prefix(this.token());
            let left = prefix(this.token(), null);

            while (precedence < this.precedence(this.lookahead())) {
                this.advance();

                let infix = this.infix(this.token());
                console.log(infix);

                if (infix === null) {
                    break;
                }
                else {
                    left = infix(this.token(), left);
                }
            }
            return left;
        }
        return null;
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
        return '"' + node.type + '" (' + node.reproduction + ')';
    }
}