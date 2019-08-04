class Tests {
    constructor() {

    }

    static run() {
        let tests = new Tests();
        tests.testSpawn();
        tests.testMove();
    }

    testSpawn() {
        // this.resetGame();

        // for (var i = 0; i < 5; i++) {
        //     this.queuedActions.push(function() {
        //         this.wait(100);
        //     }.bind(this));

        //     this.queuedActions.push(function() {
        //         var x = 0;
        //         var y = 5;

        //         var tile = this.addTile(x, y, 'BasicTile');
        //         if (tile) {
        //             // Can now set on trying to exit scene events.
        //             tile.setWhenExitScene(function() {
        //                 console.log("Collide");
        //                 this.deleteTile(tile);
        //             }.bind(this));
                    
        //             this.dummyMove(tile);
        //         }                
        //     }.bind(this));
        // }
    }

    testMove(activeTile) {
        // for (var j = 0; j < 20; j++) {
        //     activeTile.queuedActions.push(function() {
        //         var x = activeTile.x + 1;
        //         var y = activeTile.y + 1 ;
        //         //this.makeTile(activeTile.x,activeTile.y,"BasicTile");
        //         activeTile.actions["moveObject"](x, y);                
        //     });

        //     activeTile.queuedActions.push(function() {
        //         activeTile.actions["wait"](1000);
        //     });
        // }
    }
}