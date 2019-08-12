window.onload = function() {
    ui = new Vue({
        el: '#app',
        data: {
            mouseInGame: false,

            // Variables tracked in the app
            currentTile: null,
            prototypes: [],

            devOutput: '',

            currentPrototype: 'BasicTile',
            currentTool: 'select',
            currentContext: null,
            currentEventName: 'main',
            showProperties: false,
            editPrototypeMode: false,
            newPropertyName: '',
        },
        watch: {
            'currentTile': function() {
                this.changeCurrentContext();
                this.editPrototypeMode = false;
            },
            'currentPrototype': function() {
                if (this.editPrototypeMode){
                    this.editPrototypeMode = false;
                    this.currentContext = null;
                }                
            }
        },
        computed: {

        },
        methods: {
            go: function() {
                this.currentContext.start(this.currentEventName);
            },

            stop: function() {
                this.currentContext.stop(this.currentEventName);
            },

            lex: function() {
                this.devOutput = Lexer.printTokens(
                    this.currentContext.lex(this.currentEventName)
                );
            },
            
            parse: function() {
                this.devOutput = Parser.printSyntaxTree(
                    this.currentContext.parse(this.currentEventName)
                );
            },

            thread: function() {
                let t = this.currentContext.thread(this.currentEventName)
                this.devOutput = ContextHandler.printContext(
                    t
                );
                console.log(t);
            },

            changeCurrentContext: function() {
                if (this.currentTile !== null) {
                    this.currentContext = this.currentTile.getContext();
                    this.currentEventName = this.currentContext.getDefaultEventName();

                }
                else {
                    this.currentContext = null;
                    this.currentEventName = null;
                }
            },

            addProperty: function() {
                if (this.newPropertyName.length > 0){
                    Vue.set(this.currentContext.props,this.newPropertyName,{
                        value: '',
                        type:'string'
                    });

                    this.currentContext.addProperty(this.newPropertyName, '', 'string');
                    this.newPropertyName = '';

                }                
            },

            deleteProperty: function(name) {
                Vue.delete(this.currentContext.props,name);
                this.currentContext.deleteProperty(name);                
            },

            editPrototype: function() {
                if (typeof world.getPrototype(this.currentPrototype) !== "undefined") {
                    
                    this.currentContext = world.getPrototype(this.currentPrototype).getContext();
                    this.editPrototypeMode = true;                    
                }                
            },

            applyPrototypeChanges: function() {

                for (var tile of world.getTiles()){

                    if (tile.getType() === this.currentPrototype){
                        tile.context = world.getPrototype(this.currentPrototype).getContext().copy();
                    }
                }
            },

            deletePrototype: function() {
                if (this.editPrototypeMode) {                    
                    this.editPrototypeMode = false;     
                }
                Vue.delete(world.prototypes, this.currentPrototype);
                
            },

            savePrototype: function() {
                var newPrototypeName  = prompt("Enter prototype name");
                
                if (newPrototypeName.length > 0 && 
                    !(newPrototypeName in world.prototypes) &&
                    typeof this.currentTile !== "null") {
                    Vue.set(world.prototypes, newPrototypeName, new Prototype(newPrototypeName,this.currentTile));
                    
                }               
            },
        }
    });

    game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 320,
        height: 240,
        parent: 'sandbox',
        pixelArt: true,
        zoom: 2,
        scene: [Game]
    });
}
