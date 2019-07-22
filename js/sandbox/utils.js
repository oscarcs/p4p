class Utils {
    // Helper class to manage grid location conversions.
    //@@TODO rework the mainscene co-cordinates.

    // Get the true value postion on screen given the grid position
    gridToTrue(point) {
        return point * 16 + 8;
    }

    trueToGrid(point) {
        return (point - 8) / 16;
    }
}