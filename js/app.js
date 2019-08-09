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
            currentEventName: null,
            showProperties: false,
            newPropertyName: '',
        },
        watch: {
            'currentTile': function() {
                this.changeCurrentContext();
            }
        },
        computed: {

        },
        methods: {
            go: function() {
                throw 'not implemented!';
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
                this.devOutput = this.currentContext.thread(this.currentEventName);
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
                this.currentContext.addProperty(this.newPropertyName, '', 'string');
                this.newPropertyName = '';
            },

            deleteProperty: function(name) {
                //@@TODO
            },

            editPrototype: function() {

            },

            deletePrototype: function() {
                
            },

            savePrototype: function() {

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
