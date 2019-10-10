window.onload = function() {
    ui = new Vue({
        el: '#app',
        data: {
            mouseInGame: false,

            // Variables tracked in the app
            currentTile: null,
            prototypes: [],
            devOutput: '',
            running: false,
            currentTab: 'prototypes',
            currentPrototype: 'BasicTile',
            currentTool: 'select',
            currentContext: null,
            currentEventName: 'main',
            showProperties: false,
            editPrototypeMode: false,
            applyAllPopup: false,
            newPropertyName: '',
            gameSpeed: 1,
            utils: Utils,
            devMode: false,
        },
        watch: {
            'currentTile': function() {
                this.changeCurrentContext();
                this.editPrototypeMode = false;

            },
            'gameSpeed': function() {
                world.timeBetweenUpdate = 50 / this.gameSpeed;
            },
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

            goAll: function() {
                world.goAll();
            },

            stopAll: function() {
                world.stopAll();
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

            /**
             * Insert tab characters (spaces) into the code edit box.
             * This event fires on a tab key press.
             * @param {*} event 
             */
            insertTab: function(event) {
                let selectionStartPos = event.target.selectionStart;
                let selectionEndPos   = event.target.selectionEnd;
                let oldContent        = event.target.value;
        
                // Set the new content.
                let insert = "    ";
                let before = oldContent.substring(0, selectionStartPos);
                let after = oldContent.substring(selectionEndPos);
                event.target.value = before + insert + after;
        
                // Set the new cursor position
                event.target.selectionStart = event.target.selectionEnd = selectionStartPos + insert.length;        
            },

            changeCurrentContext: function() {
                if (this.currentTile !== null) {
                    this.currentContext = this.currentTile.getContext();
                    this.currentEventName = this.currentContext.getDefaultEventName();
                    this.currentTab = 'code';
                }
                else {
                    this.currentContext = null;
                    this.currentEventName = null;
                    this.currentTab = 'prototypes';
                }
            },

            addProperty: function() {
                if (this.newPropertyName.length > 0) {
                    Vue.set(this.currentContext.props, this.newPropertyName, {
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

            editPrototype: function(prototypeName) {
                this.currentPrototype = prototypeName;
                this.currentContext = world.getPrototype(this.currentPrototype).getContext();
                this.currentEventName = "main";                    
                this.editPrototypeMode = true; 
                this.currentTab='code';               
            },

            doneEdit() {
                //@@TODO make this dialogue an actual popup.
                this.applyAllPopup = true;

                if (this.editPrototypeMode) {
                    this.editPrototypeMode = false;
                    this.currentContext = null;
                    this.currentTab='prototypes';
                }
            },

            applyPrototypeChanges: function() {
                this.applyAllPopup = false;
                for (var tile of world.getTiles()) {
                    if (tile.getType() === this.currentPrototype) {
                        world.getPrototype(this.currentPrototype).getContext().copy(tile.context);
                    }
                    
                }
            },

            deletePrototype: function(prototypeName) {
                if (this.editPrototypeMode) {
                    this.editPrototypeMode = false;     
                }
                Vue.delete(world.prototypes, prototypeName);  
            },

            savePrototype: function() {
                var newPrototypeName = prompt("Enter prototype name");
                
                if (newPrototypeName.length > 0 && 
                    !(newPrototypeName in world.prototypes)
                ) {                    
                    Vue.set(
                        world.prototypes, 
                        newPrototypeName, 
                        new Prototype(newPrototypeName,world.prototypes['BasicTile'])
                    );                    
                    //this.currentTile.setPrototype(world.prototypes[newPrototypeName]);
                }               
            },

            resetGame: function() {
                var confirmation = confirm("This will delete all your unsaved work, are you sure?");
                if (confirmation) {
                    world.clearAll();
                }
            },

            uploadFile: function() {
                var fileImport = document.getElementById("fileImport");
                fileImport.value = "";
                fileImport.click();
                //Not waiting until the file is read.
            },

            //Clean this up
            importGame: function() {
                var fileImport = document.getElementById("fileImport");
                file = fileImport.files[0];

                var reader = new FileReader();
                var jsonObj;
                try {
                    // Closure to capture the file information.
                    reader.onload = (event) => {
                        jsonObj = event.target.result;
                        //console.log(jsonObj);
                        //console.log('FILE CONTENT', event.target.result);
                        world.loadGame(jsonObj);
                    };
                    reader.readAsText(file);
                } 
                catch {
                    alert("Invalid Save file");
                }

            },

            exportGame: function() {
                //Stop the world running to prevent saving mid state change
                world.stopAll();
                world.download(world.saveGame());

            }
        }
    });

    game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 320,
        height: 240,
        scale: {
            mode : Phaser.Scale.FIT
        },
        parent: 'sandbox',
        pixelArt: true,
        scene: [Game]
    });
}
