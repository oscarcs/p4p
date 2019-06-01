class Token {
    constructor(type, reproduction) {
        this.type = type;
        this.reproduction = reproduction;
    }
}

class Lexer {
    constructor(code) {
        this.code = code;
        this.pos = 0;
        this.lineNumber = 1;
    }

    char() {
        if (this.pos < this.code.length) {
            return this.code[this.pos];
        }
        return '';
    }

    next() {
        if (this.pos + 1 < this.code.length) {
            return this.code[this.pos + 1];
        }
        return '';
    }

    advance() {
        this.pos++;
    }

    lex() {
        let tokens = [];

        while (this.char() !== '') {
            this.whitespace();
            tokens = tokens.concat(this.line());
        }
        return tokens;
    }
    
    whitespace() {
        while (this.char() === ' ' || this.char() === '\t') {
            this.advance();
        }
    }

    line() {
        let tokens = [];

        let tok = this.token()
        while (tok !== null) {
            this.whitespace();

            tokens.push(tok);
            tok = this.token();
        }

        tokens.push(this.linebreak());

        return tokens;
    }

    token() {

        if (Lexer.isOp(this.char())) {
            return this.operator();
        }

        if (Lexer.isIdent(this.char())) {
            return this.identifier();
        }

        if (Lexer.isNumeric(this.char())) {
            return this.numeric();
        }

        return null;
    }

    linebreak() {
        while (Lexer.isLinebreak(this.char())) {
            this.advance();
        }
        return new Token('linebreak', '\n');
    }

    operator() {
        let op = new Token('op', this.char());
        this.advance();
        return op;
    }

    identifier() {
        let ident = '';

        while (Lexer.isIdent(this.char())) {
            ident += this.char();
            this.advance();
        }
        return new Token('ident', ident);
    }

    numeric() {
        let number = '';

        while (Lexer.isNumeric(this.char())) {
            number += this.char();
            this.advance();
        }
        return new Token('numeric', number);
    }

    static printTokens(output) {
        let text = '';
        for (let token of output) {
            text += Lexer.printToken(token) + '\n';
        }
        return text;
    }

    static printToken(token) {
        return token.type + ' ' + JSON.stringify(token.reproduction); 
    }

    static isIdent(c) {
        return new RegExp('[A-Za-z]').test(c);
    }

    static isNumeric(c) {
        return new RegExp('[0-9]').test(c);
    }

    static isOp(c) {
        return  c === '+' ||
                c === '-' || 
                c === '*' || 
                c === '/' ||
                c === '^' || 
                c === '=' ||
                c === '<' ||
                c === '>';
    }

    static isLinebreak(c) {
        return c === '\n' || c === '\r';
    }

    // static isWhitespace(c) {
    //     return new RegExp('\\s').test(c);
    // }
}