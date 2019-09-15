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
        };

        this.registerBasicPrefix('ident');
        this.registerBasicPrefix('numeric');
        this.registerBasicPrefix('string');
        this.registerBasicPrefix('boolean');
        this.registerPrefixOp('+', 60);
        this.registerPrefixOp('-', 60);
        this.registerPrefixOp('!', 60);

        this.infixFunctions = {
            'lparen': {
                f: (token, left) => {
                    this.expect('lparen');
                    let node = new Node('call', left.reproduction);
                    
                    if (this.token().type !== 'rparen') {
                        while (true) {
                            let arg = this.expression(0);
                            this.advance();

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

        this.registerBasicInfix('==', 35);
        this.registerBasicInfix('!=', 35);
        this.registerBasicInfix('||', 40);
        this.registerBasicInfix('&&', 41);
        this.registerBasicInfix('<', 45);
        this.registerBasicInfix('>', 45);
        this.registerBasicInfix('-', 50);
        this.registerBasicInfix('+', 50);
        this.registerBasicInfix('*', 55);
        this.registerBasicInfix('/', 55);
    }

    registerBasicPrefix(type) {
        this.prefixFunctions[type] = {
            f: (token) => new Node(type, token.reproduction),
            precedence: 0
        };
    }

    registerPrefixOp(type, precedence) {
        this.prefixFunctions[type] = {
            f: (token) => {
                let node = new Node('prefix_op', token.reproduction);
                this.advance();
                node.addChild(this.expression(this.precedence(token)));
                return node;
            },
            precedence: precedence
        };
    }

    registerBasicInfix(type, precedence) {
        this.infixFunctions[type] = {
            f: (token, left) => {
                let node = new Node(token.type, token.reproduction);
                this.advance();
                node.addChild(left);
                node.addChild(this.expression(this.precedence(token)));
                return node;
            },
            precedence: precedence
        };
    }

    getPrefix(token) {
        let prefix = this.prefixFunctions[token.type] || this.prefixFunctions[token.reproduction];
        return prefix ? prefix : null;
    }

    getInfix(token) {
        let infix = this.infixFunctions[token.type] || this.infixFunctions[token.reproduction];
        return infix ? infix : null;
    }

    precedence(token) {
        if (token === null) {
            return -1;
        }
        return (this.getPrefix(token) || this.getInfix(token) || {precedence: 0}).precedence;
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

    expression(precedence) {
        if (this.getPrefix(this.token()) !== null) {
            
            let prefix = this.getPrefix(this.token());
            let left = prefix.f(this.token(), null);

            while (precedence < this.precedence(this.lookahead())) {
                this.advance();

                let infix = this.getInfix(this.token());

                if (infix === null) {
                    break;
                }
                left = infix.f(this.token(), left);
            }
            return left;
        }
        return null;
    }

    /**
     * The program is a list of statements.
     */
    program() {
        let program = new Node('program', '');
        let stmt;
        while (true) {
            stmt = this.statement();
            if (stmt !== null) {
                program.addChild(stmt);
            }
            if (stmt === null || this.token() === null) {
                break;
            }
            this.expect('\n');
        }

        return program;
    }

    /**
     * A block begins with a linebreak, and contains a list of statements.
     */
    block() {
        let block = new Node('block', '');

        this.expect('linebreak');

        let stmt;
        while (true) {
            stmt = this.statement();
            if (stmt === null) {
                break;
            }
            this.expect('\n');
            block.addChild(stmt);
        }

        return block;
    }

    statement() {
        if (this.token() === null) {
            return null;
        }

        if (this.accept('if')) {
            let stmt = this.ifStatement();
            this.expect('end');
            return stmt;
        }
        if (this.accept('for')) {
            return this.forStatement();
        }
        if (this.accept('while')) {
            return this.whileStatement();
        }
        if (this.accept('action')) {
            throw 'Not implemented';
        }
        if (this.accept('return')) {
            return this.returnStatement();
        }
        if (this.accept('break')) {
            return this.breakStatement();
        }
        if (this.accept('loop')) {
            return this.loopStatement();
        }
        if (this.token().type === 'ident') {
            if (this.lookahead().type === 'lparen') {
                return this.callStatement();
            }
            else {
                return this.assignmentStatement();
            }
        }

        return null;
    }

    ifStatement() {
        let node = new Node('if', 'if');

        node.addChild(this.expression(0));
        this.advance();
        node.addChild(this.block());
        
        let elseNode = new Node('else', 'else');
        node.addChild(elseNode);

        if (this.accept('else')) {
            if (this.accept('if')) {
                // Parse an 'else if'
                elseNode.addChild(this.ifStatement());
            }
            else {
                // Complete the block
                elseNode.addChild(this.block());
            }
        }
        return node;
    }

    forStatement() {
        let node = new Node('for', 'for');

        // Identifier to increment
        let ident = this.token();
        this.expect('ident');
        node.addChild(new Node('ident', ident.reproduction));

        this.expect('=');

        // Starting value for the loop
        node.addChild(this.expression(0));
        this.advance();

        this.expect('to');

        // Ending value
        node.addChild(this.expression(0));
        this.advance();

        node.addChild(this.block());

        this.expect('end');

        return node;
    }

    whileStatement() {
        let node = new Node('while', 'while');

        node.addChild(this.expression(0));
        this.advance();
        
        node.addChild(this.block());
        this.expect('end');

        return node;
    }

    returnStatement() {
        let node = new Node('return', 'return');
        node.addChild(this.expression(0));
        this.advance();

        return node;
    }

    breakStatement() {
        let node = new Node('break', 'break');
        return node;
    }

    loopStatement() {
        let node = new Node('loop', 'loop');
        node.addChild(this.block());
        this.expect('end');

        return node;
    }

    callStatement() {
        let call = this.expression(0);
        this.accept('rparen');

        return call;
    }

    assignmentStatement() {
        let name = this.token();
        this.advance();
        this.expect('=');

        let right = this.expression(0);

        this.advance();

        let node = new Node('assignment', '=');
        node.addChild(new Node('ident', name.reproduction));
        node.addChild(right);
        return node;
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