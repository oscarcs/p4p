class DummyFunctions{
    //class to dummy some potential functions that the block can be done.
    moveTo(scene,tile,x,y){
        scene.moveObject(tile,x,y);
    }

    wait(tile,duration){
        var date = new Date();
        tile.waitTimer = date.getTime()+duration;
    }

}