var lowestNeighbor = require('./lowestNeighbor');

module.exports = function (cell, cell2, fraction) {

    var flowRatio;
    if (!cell2) {
        cell2 = lowestNeighbor(cell);
        if (!cell2) {
            return;
        }
    }

    if (arguments.length > 2) {
        flowRatio = fraction;
    } else {
        var flowSubstance = cell.sed + cell.water;
        if (flowSubstance <= 0) {
            return;
        }

        var drop = cell.totalHeight() - cell2.totalHeight();
        if (drop <= 0) {
            return;
        }
        flowRatio = Math.min(1, drop / (2 * flowSubstance));
    }

    var flowWater = cell.water * flowRatio;
    var flowSed = cell.sed * flowRatio;

    cell.water2 -= flowWater;
    cell.sed2 -= flowSed;

    cell2.water2 += flowWater;
    cell2.sed2 += flowSed;
};