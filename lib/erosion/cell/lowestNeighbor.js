var NEAR_RANGE = 0.01;
module.exports = function lowestNeighbor(cell) {
    var lowestHeight = null;
    var cell2 = cell.neighbors().reduce(function (lowest, neighborCell) {
        if (neighborCell.meta === 'absent') {
            return lowest;
        }
        if (!lowest) {
            lowestHeight = neighborCell.totalHeight();
            return neighborCell;
        } else {
            var neighborHeight = neighborCell.totalHeight();
            if (neighborHeight > lowestHeight + NEAR_RANGE) {
                return lowest;
            } else if (neighborHeight > lowestHeight - NEAR_RANGE) {
                if (cell.terrain.random(cell) > 0.5) {
                    return lowest;
                }
            }

            lowestHeight = neighborHeight;
            return neighborCell;
        }
    }, null);

    if ((cell2 === null) || (lowestHeight >= cell.totalHeight())) {
        return false;
    }
    return cell2;
};