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
        'for': {},
        'while': {},
        'action': {},
        'return': {},
        'loop': {},
        'true': {},
        'false': {},
        'end': {},
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