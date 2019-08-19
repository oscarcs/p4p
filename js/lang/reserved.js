// Reserved words.
let Reserved = {
    operators: {
        'mod': {},
        'pow': {},
        'and': {
            canonical: '&&'
        },
        'nand': {},
        'or': {
            canonical: '||'
        },
        'nor': {},
        'xor': {},
        'equals': {
            canonical: '=='
        },
        'not equals': {
            canonical: '!='
        },
        'is': {
            canonical: '=='
        },
        'is not': {
            canonical: '!='
        },
        '+': {},
        '-': {},
        '*': {},
        '/': {},
        '==': {},
        '!=': {},
        '>': {},
        '<': {},
        '<=': {},
        '>=': {},
        '&&': {},
        '||': {},
        '!': {},
    },

    keywords: {
        'if': {},
        'else': {},
        'for': {},
        'to': {},
        'while': {},
        'action': {},
        'return': {},
        'loop': {},
        'end': {},
        'break': {},
    },

    getOperator: function(str) {
        if (typeof this.operators[str] !== 'undefined') {
            if (typeof this.operators[str].canonical !== 'undefined') {
                return this.operators[str].canonical;
            }
            return str;
        }
        return null;
    },

    getKeyword: function(str) {
        if (typeof this.keywords[str] !== 'undefined') {
            return true;
        }
        return false;
    },
}