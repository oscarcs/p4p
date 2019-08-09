// Reserved words.
let Reserved = {
    operators: {
        'mod': {},
        'pow': {},
        'and': {},
        'nand': {},
        'or': {},
        'nor': {},
        'xor': {},
        'equals': {},
        'not equals': {},
        'is': {},
        'is not': {},
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
            return true;
        }
        return false;
    },

    getKeyword: function(str) {
        if (typeof this.keywords[str] !== 'undefined') {
            return true;
        }
        return false;
    },
}