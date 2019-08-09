class ExecutionContext {
    constructor() {
        this.props = {};
        this.actions = {};
        this.events = {};
    }

    /**
     * Copy the values in this context to a new object.
     */
    copy() {
        let context = new ExecutionContext();
        //@@TODO: Return a copy the fields etc

        return context;
    }

    /**
     * Add an event type to this context.
     * @param {string} name 
     */
    addEvent(name) {
        if (this.events[name]) {
            //@@ERROR
        }
        else {
            this.events[name] = {
                locals: {},
                code: '',
                queue: [],
                running: false    
            };
        }
    }

    /**
     * Get a list of the events on this context
     */
    getEventList() {
        return Object.keys(this.events);
    }

    /**
     * Get the 'default' event.
     */
    getDefaultEventName() {
        return 'main';
    }

    /**
     * Lex the code for a particular event
     * @param {string} event 
     */
    lex(event) {
        if (typeof this.events[event] !== 'undefined') {
            let lexer = new Lexer(this.events[event].code);
            return lexer.lex();
        }
        //@@ERROR
        return null;
    }

    /**
     * Parse the code for a particular event 
     * @param {string} event 
     */
    parse(event) {
        let tokens = this.lex(event);
        let parser = new Parser(tokens);
        return parser.parse();
    }

    /**
     * Thread the AST to produce a node ordering
     * @param {Node} root 
     */
    thread(event) {
        let root = this.parse(event);
        let contextHandler = new ContextHandler(root);
        return contextHandler.thread();
    }

    /**
     * Register an action
     * @param {string} name 
     * @param {function} func 
     */
    addAction(name, func) {
        if (this.actions[name]) {
            //@@ERROR
        }
        else {
            //@@TODO: bind the function to the scope of this object or something?
            this.actions[name] = func;
        }
    }

    /**
     * Get the fucntion associated with an action name.
     */
    getAction(name) {
        return this.actions[name];
    }

    /**
     * Get a list of the actions defined on this context.
     */
    getActionList() {
        return Object.keys(this.actions);
    }

    /**
     * Set the value of an existing action.
     * @param {string} name 
     * @param {function} func 
     */
    setAction(name, func) {
        //@@TODO: check the action exists

        //@@TODO: bind the function to the scope of this object or something?

        this.actions[name] = func;
    }

    /**
     * Add a property to this context
     * @param {string} name 
     * @param {*} value 
     * @param {string} type 
     */
    addProperty(name, value, type) {
        if (name in this.props) {
            return;
        }

        this.props[name] = {
            value: value,
            type: type
        };
    }

    /**
     * Get the value of a property by name.
     * @param {string} name 
     */
    getProperty(name) {
        if (typeof this.props[name] !== 'undefined') {
            return this.props[name].value;
        }
        return null;
    } 

    /**
     * Get a list of the properties in this context.
     */
    getPropertyList() {
        return Object.keys(this.props);
    }

    /**
     * Set the value of a property
     * @param {string} name 
     * @param {*} value 
     */
    setProperty(name, value) {
        if (typeof this.props[name] !== 'undefined') {
            this.props[name].value = value;
            return true;
        }
        return false;
    }

    /**
     * Delete the property by name
     * @param {string} name 
     */
    deleteProperty(name) {
        if(typeof this.props[name] !== "undefined"){
            delete this.props[name];
        }
    }

    /**
     * Add a local variable to an event
     * @param {string} event 
     * @param {string} name 
     * @param {*} value 
     * @param {string} type 
     */
    addLocal(event, name, value, type) {
        if (typeof this.events[event] !== 'undefined') {
            if (typeof this.events[event].locals[name] === 'undefined') {
                this.events[event].locals[name] = {
                    value: value,
                    type: type
                };
                return true;
            }
        }
        return false;
    }

    /**
     * Get the value of a local variable by name
     * @param {string} event 
     * @param {string} name 
     */
    getLocal(event, name) {
        if (typeof this.events[event] !== 'undefined') {
            if (typeof this.events[event].locals[name] !== 'undefined') {
                return this.events[event].locals[name].value;
            }
        }
        return null;
    }

    /**
     * Get a list of the names of local variables for an event.
     * @param {string} event 
     */
    getLocalList(event) {
        if (typeof this.events[event] !== 'undefined') {
            return Object.keys(this.events[name].locals);
        }
        return null;
    }

    /**
     * Set the value of a local variable.
     * @param {string} event 
     * @param {string} name 
     * @param {*} value 
     */
    setLocal(event, name, value) {
        if (typeof this.events[event] !== 'undefined') {
            if (typeof this.events[event].locals[name] !== 'undefined') {
                this.events[event].locals[name].value = value;
                return true;
            }
        }
        return false;
    }

    /**
     * Look up the value of a variable name using local and global variables.
     * @param {string} event 
     * @param {string} name 
     */
    lookup(event, name) {
        if (typeof this.events[event] !== 'undefined') {
            if (typeof this.events[event].locals[name] !== 'undefined') {
                return this.events[event].locals[name].value;
            }
        }

        if (typeof this.props[name] !== 'undefined') {
            return this.props[name].value;
        }
    }
}