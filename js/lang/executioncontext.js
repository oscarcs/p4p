class ExecutionContext {
    constructor(parent) {
        this.parent = parent;
        this.props = {};
        this.actions = {};
        this.events = {};
        
        this.builtinValues = [
            'x',
            'y',
        ];

        this.builtinFunctions = [
            'print',
            'alert',
            'changeImage',
            'move',
            'moveUp',
            'moveDown',
            'moveLeft',
            'moveRight',
            'checkEmpty',
            'checkContains',
            'randomNum',
            'destroy',
            'addTile',
            'getTileProperty',
            'changeLayer'
        ];

    }

    /**
     * Copy the values in this context to another context.
     */
    copy(context) {
        for (var prop in this.props) {

            if (prop in context.props && prop !== "name") {
                context.setProperty(prop,this.getProperty(prop));
                
            } else {
                context.addProperty(prop, this.getProperty(prop), this.props[prop].type);
            }
        }

        for (var action in this.actions) {
            context.addAction(action, this.getAction(action));
        }

        for (var event in this.events) {
            context.addEvent(event);
            context.events[event].code = this.events[event].code;

            let locals = this.events[event].locals;

            for (let local in locals) {               
               context.addLocal(event, local, locals[local].value, locals[local].type);
            }          
        }
    }


    update() {
        for (let event in this.events) {            
            if (this.events[event].running && 
                this.events[event].code.length > 1) {
                
                try{
                    this.events[event].interpreter.step(); 
                }catch {
                    this.events[event].running = false;
                }                
            }
        }
        /*
        if (this.events['main']) {
            if (this.events['main'].running) {
                this.events['main'].interpreter.step();
            }
        }
        */
    }

    event(eventName) {
        if (this.events[eventName] && 
            this.events[eventName].code.length > 1) {

            this.events[eventName].running = true;
            /*
            if (this.events[eventName].running) {
                this.events[eventName].interpreter.step();
            }
            */
        }
    }


    //Schedule a wait before the next step for an event.
    wait(eventName,duration) { 
        var date = new Date();

        if(this.events[eventName]) {
            if (this.events[eventName].running) {
                this.events[eventName].timer = date.getTime() + duration;
            }
        }
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
                running: false,
                timer: 0
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
     * Thread the AST to produce a linear node ordering.
     * @param {Node} root 
     */
    thread(event) {
        let root = this.parse(event);
        let contextHandler = new ContextHandler(root);
        return contextHandler.thread();
    }

    start(event) {
        this.events[event].running = true;
        let root = this.thread(event);
        this.events[event].interpreter = new Interpreter(root, event, this);
    }

    stop(event) {
        this.events[event].running = false;   
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
        if (this.builtinFunctions.includes(name)) {
            return this.parent[name];
        }

        if (this.actions[name]) {
            return this.actions[name];
        }
        return null;
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
     * Look up the value of a variable name using local and global variables.
     * @param {string} event 
     * @param {string} name 
     */
    lookup(event, name) {
        if (this.builtinValues.includes(name)) {
            return this.parent[name];
        }

        if (typeof this.events[event] !== 'undefined') {
            if (typeof this.events[event].locals[name] !== 'undefined') {
                return this.events[event].locals[name].value;
            }
        }

        if (typeof this.props[name] !== 'undefined') {
            return this.props[name].value;
        }

        return null;
    }

    /**
     * Look up a variable and set it.
     * @param {*} event 
     * @param {*} name 
     * @param {*} value 
     */
    lookupAndSet(event, name, value) {
        if (this.builtinValues.includes(name)) {
            this.parent[name] = value;
            return;
        }

        if (typeof this.events[event] !== 'undefined') {
            if (typeof this.events[event].locals[name] !== 'undefined') {
                this.events[event].locals[name].value = value;
                return;
            }
        }

        if (typeof this.props[name] !== 'undefined') {
            this.props[name].value = value;
            return;
        }
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

        console.log('set ', name, value);

        if (name === 'x') {
            this.parent.move(value, this.parent.y);
        } 
        else if (name === 'y') {
            this.parent.move(this.parent.x, value);
        }
        else if (typeof this.props[name] !== 'undefined') {
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


}