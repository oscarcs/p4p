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
                    this.advance();
                    
                    let expression = this.expression(0);
                    this.advance();
                    
                    //@@TODO: This is probably indicative of an error but whatever. 
                    if (this.token().type !== 'rparen') {
                        //@@ERROR:
                        throw 'no matching right parenthesis!';
                    } 

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

            'lparen': {
                f: (token, left) => {
                    this.expect('lparen');
                    let node = new Node('call', left.reproduction);
                    
                    if (this.token().type !== 'rparen') {
                        while (true) {
                            let arg = this.expression(0);
                            this.advance();
                            console.log(this.token());
                            node.addChild(arg);    

                            if (!this.accept('comma')) {
                                break;
                            }
                        }
                                                
                        //@@TODO: This is probably indicative of an error but whatever. 
                        if (this.token().type !== 'rparen') {
                            //@@ERROR:
                            throw 'Expected matching rparen!';
                        } 
                    }
                    return node;
                }
            }
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

        return 0;
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
        let msg = 'Expected ' + type + ' but got ' + Lexer.printToken(this.tokens[this.index]) + '\n';
        throw msg;
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

    block() {
        let block = new Node('block', '');

        this.expect('linebreak');

        let stmt;
        while (true) {
            stmt = this.statement();
            if (stmt === null) {
                break;
            }
            block.addChild(stmt);
        }

        return block;
    }

    statement() {
        let left = this.token();
        if (left === null) {
            return null;
        }

        if (this.accept('if')) {
            let node = new Node('if', 'if');

            let condition = this.expression(0);
            this.advance();
            let body = this.block();

            node.addChild(condition);
            node.addChild(body);

            while (!this.accept('end')) {
                if (this.accept('else')) {
                    if (this.accept('if')) {
                        // Parse an 'else if'
                        let childNode = new Node('else if', 'else if');

                        let condition = this.expression(0);
                        this.advance();
                        let body = this.block();

                        childNode.addChild(condition);
                        childNode.addChild(body);
                        node.addChild(childNode);
                    }
                    else {
                        // Complete the block
                        let childNode = new Node('else', 'else');
                        
                        let body = this.block();

                        childNode.addChild(body);
                        node.addChild(childNode);

                        this.expect('end');
                        break;
                    }
                }
            }
            return node;
        }
        else if (this.accept('for')) {
            let node = new Node('for', 'for');

            let ident = this.token();
            this.expect('ident');
            let identNode = new Node('ident', ident.reproduction);

            this.expect('=');

            let startNode = this.expression(0);
            this.advance();
            node.addChild(startNode);

            this.expect('to');

            let endNode = this.expression(0);
            this.advance();
            node.addChild(endNode);

            let body = this.block();
            node.addChild(body);

            this.expect('end');

            return node;
        }
        else if (this.accept('while')) {
            let node = new Node('while', 'while');

            let condition = this.expression(0);
            this.advance();
            node.addChild(condition);
            
            let body = this.block();
            node.addChild(body);

            this.expect('end');

            return node;
        }
        else if (this.accept('action')) {

        }
        else if (this.accept('return')) {
            let node = new Node('return', 'return');
            let body = this.expression(0);
            this.advance();
            node.addChild(body);

            return node;
        }
        else if (this.accept('loop')) {
            let node = new Node('loop', 'loop');

            let body = this.block();
            node.addChild(body);

            this.expect('end');

            return node;
        }
        else if (this.token().type === 'ident') {
            if (this.lookahead().type === 'lparen') {
                let call = this.expression(0);
                console.log(this.token());
                this.accept('rparen');
                this.accept('\n');
                return call;
            }
            else {
                this.advance();
                this.expect('=');
    
                let right = this.expression(0);
    
                this.advance();
                this.accept('\n');
    
                let node = new Node('assignment', '=');
                node.addChild(new Node('ident', left.reproduction));
                node.addChild(right);
                return node;
            }

        }
        else {
            return null;
        }
    }

    expression(precedence) {
        if (this.prefix(this.token()) !== null) {
            
            let prefix = this.prefix(this.token());
            let left = prefix(this.token(), null);

            // console.log(precedence, this.lookahead(), this.precedence(this.lookahead()));

            while (precedence < this.precedence(this.lookahead())) {
                this.advance();

                let infix = this.infix(this.token());

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