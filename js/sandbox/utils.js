class Utils {
    // Helper class to manage grid location conversions.
    //@@TODO rework the mainscene co-cordinates.

    //@@RENAME
    // Grid -> Screen
    static gridToTrue(point) {
        return point * 16 + 8;
    }

    //@@RENAME
    // Screen -> Grid
    static trueToGrid(point) {
        return Math.floor((point - 0) / 16);
    }

    //@@TODO A more flexible system is required so we can swap tilesheets.
    static nameToIndex(name) {
        switch (name) {
            case 'deer':
                return 1;
            case 'snow':
                return 12;
            case 'tree':
                return 0;
        }
    }
}