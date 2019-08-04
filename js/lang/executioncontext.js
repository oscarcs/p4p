class ExecutionContext {
    constructor() {
        this.props = {};
        this.actions = {};
        this.queue = [];
        this.code = '';
        this.running = false;
    }

    lex() {
        let lexer = new Lexer(this.code);
        return lexer.lex();
    }

    parse() {
        let tokens = this.lex();
        let parser = new Parser(tokens);
        return parser.parse();
    }

    execute() {
        let ast = this.parse();
        let interpreter = new Interpreter(ast);
        return interpreter.interpret();
    }

    addAction(name, func) {
        if (this.actions[name]) {
            //@@ERROR
        }
        else {
            //@@TODO: bind the function to the scope of this object or something?
            this.actions[name] = func;
        }
    }

    getAction(name) {
        return this.actions[name];
    }

    getActionList() {
        return Object.keys(this.actions);
    }

    setAction(name, func) {
        //@@TODO: check the action exists

        //@@TODO: bind the function to the scope of this object or something?

        this.actions[name] = func;
    }

    addProperty(name, value, type) {
        //@@TODO: check that the name doesn't already exist in this tile

        this.props[name] = {
            value: value,
            type: type
        };
    }

    getProperty(name) {
        return this.props[name].value;
    } 

    getPropertyList() {
        return Object.keys(this.props);
    }

    setProperty(name, value) {
        //@@TODO: check prop with that name exists

        //@@TODO: typecheck!

        this.props[name].value = value;
    }

    pushAction(actionName) {
        this.queue.push(this.getAction(actionName));
    }

    popAction() {
        return this.queue.shift();
    }
}