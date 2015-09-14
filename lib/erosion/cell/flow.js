var NEAR_RANGE = 0.01;

module.exports = function (cell, cell2) {
### TODO: test neighborcell flow
    if (!cell2){
        var lowestHeight = null;
        cell2 = cell.neighbors().reduce(function(lowest, neighborCell){
            if(!lowest){
                lowestHeight = neighborCell.totalHeight();
                return neighborCell;
            } else {
                var neighborHeight = neighbor.totalHeight();
                if (neighborHeight > lowestHeight + NEAR_RANGE){
                    return lowest;
                } else if (neighborHeight > lowestHeight - NEAR_RANGE){
                    if (cell.terrain.random() > 0.5){
                        return lowest;
                    }
                }

                lowestHeight = neighborHeight;
                return neighborCell;
            }
        }, null);

        if ((cell2 === null) || (lowestHeight >= cell.totalHeight())){
            return;
        }
    }

    var flowSubstance = cell.sed + cell.water;
    if (flowSubstance <= 0) {
        return;
    }

    var drop = cell.totalHeight() - cell2.totalHeight();
    if (drop <= 0) {
        return;
    }

    var flowRatio = Math.min (1, drop / (2 * flowSubstance));

    var flowWater = cell.water * flowRatio;
    var flowSed = cell.sed * flowRatio;

    cell.water2 -= flowWater;
    cell.sed2 -= flowSed;

    cell2.water2 += flowWater;
    cell2.sed2 += flowSed;
};