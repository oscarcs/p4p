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

    getDefaultEvent() {
        if (this.events.length > 0) {
            return this.events[0];
        }
    }

    /**
     * Lex the code for a particular event
     * @param {string} event 
     */
    lex(event) {
        let lexer = new Lexer(this.code);
        return lexer.lex();
    }

    /**
     * Parse the code for a particular event 
     * @param {string} event 
     */
    parse(event) {
        let tokens = this.lex();
        let parser = new Parser(tokens);
        return parser.parse();
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
        
        if (name in this.props){
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

    }

    /**
     * Get the value of a local variable by name
     * @param {*} event 
     * @param {*} name 
     */
    getLocal(event, name) {

    }

    /**
     * Look up the value of
     * @param {*} name 
     */
    lookup(name) {
        //@@TODO
    }
}