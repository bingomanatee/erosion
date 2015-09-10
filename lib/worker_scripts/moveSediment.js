var terrainHeight = require('./terrainHeight');
var _ = require('lodash');
var util = require('util');

module.exports = function (cell) {
    var height = terrainHeight(cell);

    var neighborData = cell.neighbors().reduce(function (out, neighbor) {
        var nheight = terrainHeight(neighbor);
        if ((nheight !== null) && (nheight < height)) {
            out.push({height: nheight, neighbor: neighbor, drop: height - nheight});
        }
        return out;
    }, []);

    if (!neighborData.length) {
        return height;
    }

    var totalDrop = _.sum(_.pluck(neighborData, 'drop'));
    var averageDrop = totalDrop / (1 + neighborData.length);

    var flowAmount = Math.min(cell.water, averageDrop);
    var moveRatio = flowAmount / cell.water;
    cell.water -= flowAmount;

    if (cell.sed && cell.sed > 0) {
        var sedMoveAmount = cell.sed * moveRatio;
        cell.sed -= sedMoveAmount;

        neighborData.forEach(function (nData) {
            var ratio = nData.drop / totalDrop;
            nData.neighbor.water += flowAmount * ratio;
            nData.neighbor.sed += sedMoveAmount * ratio;
        });
    }
};