class Utils{
    //Helper class to manage grid location conversions.
    //@TODO rework the mainscene co-cordinates.

    //get the true value postion on screen given the grid position
    gridXtoTrueX(x){
        return x*16+8;
    }

    gridYtoTrueY(y){
        return y*16+8;
    }

    TrueXtoGridX(grid_x){
        return (grid_x-8)/16;
    }
    
    TrueYtoGridY(grid_y){
        return(grid_y-8)/16;
    }
}