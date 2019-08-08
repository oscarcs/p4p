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
                    this.currentEventName = this.currentContext.getDefaultEvent();
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
