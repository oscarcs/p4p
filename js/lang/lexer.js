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
        
        console.log(tokens);
        return tokens;
    }

    token() {
        // Skip whitespace
        if (Lexer.isWhitespace(this.char())) {
            this.whitespace();
        }
        
        let c = this.char();
        console.log(c);
        
        if (Lexer.isLinebreak(c)) {
            return this.linebreak();
        }
        
        if (Lexer.isNumeric(c)) {
            return this.number();
        }

        if (Lexer.isLetter(c)) {
            return this.identifier();
        }

        if (c === '-') {
            if (Lexer.isNumeric(this.next())) {
                return this.number();
            }

            if (Lexer.isWhitespace()) {
                return this.operator();
            }
        }

        if (c === '=') {
            if (this.next() === '=') {
                return this.operator();
            }
            else {
                return this.assignment();
            }
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

        while (!Lexer.isNumeric(this.char()) && !Lexer.isWhitespace(this.char())) {
            op += char();
        }

        if (Reserved.getOperator(op)) {
            let token = new Token('op', op);
            this.advance();
            return token;
        }
        else {
            // @@ERROR
        }
    }

    identifier() {
        let ident = '';

        while (Lexer.isLetter(this.char())) {
            ident += this.char();
            this.advance();
        }

        console.log(ident);

        if (Reserved.getOperator(ident)) {
            return new Token('op', ident);
        }

        if (Reserved.getKeyword(ident)) {
            return new Token('keyword', ident);
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