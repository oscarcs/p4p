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
        let cur = this.token();
        
        while (cur !== null) {
            tokens.push(cur);
            cur = this.token();
        }

        return tokens;
    }

    token() {
        // Skip whitespace
        if (Lexer.isWhitespace(this.char())) {
            this.whitespace();
        }
        
        let c = this.char();
        
        if (Lexer.isLinebreak(c)) {
            return this.linebreak();
        }
        
        if (Lexer.isNumeric(c)) {
            return this.number();
        }

        if (Lexer.isLetter(c)) {
            return this.identifier();
        }

        if (Lexer.isQuote(c)) {
            return this.stringLiteral();
        }

        if (c === '(') {
            this.advance();
            return new Token('lparen', '(');
        }

        if (c === ')') {
            this.advance();
            return new Token('rparen', ')');
        }

        if (c == '[') {
            this.advance();
            return new Token('lsqbracket', '[');
        }

        if (c == ']') {
            this.advance();
            return new Token('rsqbracket', ']');
        }

        if (c === ',') {
            this.advance();
            return new Token('comma', ',');
        }

        if (c === '=') {
            if (this.next() === '=') {
                return this.operator();
            }
            else {
                return this.assignment();
            }
        }

        if (c !== '') {
            return this.operator();
        }

        return null;
    }

    whitespace() {
        while (Lexer.isWhitespace(this.char())) {
            this.advance();
        }
    }

    linebreak() {
        while (Lexer.isLinebreak(this.char())) {
            this.advance();
        }
        return new Token('linebreak', '\n');
    }

    operator() {
        let op = '';

        while (
            !Lexer.isLetter(this.char()) &&
            !Lexer.isNumeric(this.char()) &&
            !Lexer.isWhitespace(this.char()) && 
            !Lexer.isQuote(this.char()) &&
            !Lexer.isLinebreak(this.char()) &&
            this.char() !== ''
        ) {
            op += this.char();
            this.advance();
        }

        if (Reserved.getOperator(op) !== null) {
            let token = new Token('op', Reserved.getOperator(op));
            return token;
        }
        else {
            // @@ERROR
            throw 'Unrecognized token: ' + op;
        }
    }

    identifier() {
        let ident = '';

        while (Lexer.isLetter(this.char())) {
            ident += this.char();
            this.advance();
        }

        if (Reserved.getOperator(ident) !== null) {
            return new Token('op', Reserved.getOperator(ident));
        }

        if (Reserved.getKeyword(ident)) {
            return new Token('keyword', ident);
        }

        if (ident === 'true' || ident === 'false') {
            return new Token('boolean', ident);
        }

        return new Token('ident', ident);
    }

    number() {
        let number = '';

        if (this.char() === '-') {
            number += this.char();
            this.advance();
        }

        while (Lexer.isNumeric(this.char())) {
            number += this.char();
            this.advance();
        }
        return new Token('numeric', number);
    }

    stringLiteral() {
        let str = '';
        let quoteType = this.char();

        this.advance();
        while (this.char() !== quoteType && this.char() !== '') {
            str += this.char();
            this.advance();
        }
        this.advance();

        if (this.char() === '') {
            //@@ERROR
        }

        return new Token('string', str);
    }

    assignment() {
        if (this.char() === '=') {
            this.advance();
        }

        return new Token('assignment', '=');
    }

    static isWhitespace(c) {
        return c === ' ' || c === '\t';
    }

    static isLetter(c) {
        return new RegExp('[A-Za-z]').test(c);
    }

    static isNumeric(c) {
        return new RegExp('[0-9]').test(c);
    }

    static isLinebreak(c) {
        return c === '\n' || c === '\r';
    }

    static isQuote(c) {
        return c === '"' || c === "'";
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
}