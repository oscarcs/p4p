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
            lex: function() {
                this.devOutput = Lexer.printTokens(this.currentContext.lex());
            },
            
            parse: function() {
                this.devOutput = Parser.printSyntaxTree(this.currentContext.parse());
            },
            
            execute: function() {
                this.devOutput = this.currentContext.execute();
            },

            changeCurrentContext: function() {
                if (this.currentTile !== null) {
                    this.currentContext = this.currentTile.getContext();
                }
                else {
                    this.currentContext = null;
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
