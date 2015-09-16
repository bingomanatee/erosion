var _ = require('lodash');
var flow = require('./flow');
var MIN_DROP = 0.2;
var SQUAK = 0;

module.exports = function flowToNeighbors(cell, sedErode, distance) {
    if (cell.water <= 0) {
        return;
    }
    var cellHeight = cell.totalHeight();
    var maxDrop = 0;
    var downStreamNeighbors = cell.neighbors().reduce(function(out, neighbor) {
        if (neighbor.meta === 'absent') {
            return out;
        }
        var nHeight = neighbor.totalHeight();
        if (nHeight >= (cellHeight - MIN_DROP)) {
            return out;
        }
        var drop = cellHeight - nHeight;
        maxDrop = Math.max(maxDrop, drop);

        out.push({height: nHeight, drop: drop, neighbor: neighbor});
        return out;
    }, []);

    if (downStreamNeighbors.length <= 0) {
        return;
    }

    var totalDrop = _.sum(_.pluck(downStreamNeighbors, 'drop'));
    var averageDrop = totalDrop / downStreamNeighbors.length;
    var say = !SQUAK ? 0 : Math.random() < SQUAK;
    if (say) {
        console.log('maxDrop: ', maxDrop, 'avgDrop:', averageDrop, 'distance: ', distance);
    }

    var flowSubstance = cell.sed + cell.water;
    var K = 1;
    if (flowSubstance > averageDrop) {
        K = averageDrop / flowSubstance;
    }
    if (cell.terrain.iStart == cell.terrain.jStart) {
  //      distance *= 2;
    }
    downStreamNeighbors.forEach(function(n) {
        var fraction = K * n.drop / totalDrop;
        var water = cell.water * fraction;

        var angle = Math.atan2(n.drop, distance);
        var sin = Math.max(0.05, Math.sin(angle));
 sin *= sin;
        if (say) {
            console.log('sin: ', Math.round(1000 * sin));
        }

        var sed = water * sedErode * sin;

        cell.sed += sed;
        cell.sed2 -= sed;
        cell.value -= sed;
        cell.water2 -= water;

        n.water2 += water;
        n.sed2 += sed;
    });
    return downStreamNeighbors;
};