var _ = require('lodash');
var flow = require('./flow');
var MIN_DROP = 0.01;
var SQUAK = 0; //0.0000001;
var MIN_SIN = 0;

module.exports = function flowToNeighbors(cell, sedErode, distance) {
    if (cell.water <= 0) {
        return;
    }

    var cellHeight = cell.totalHeight();
    var maxDrop = 0;
    var downStreamNeighbors = cell.neighbors().reduce(function (out, neighbor) {
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
    var say = !SQUAK ? 0 : Math.random() < SQUAK;
    if (cell.i == 1 && cell.j == 0) {
        say = true;
    }

    if (say) {
        downStreamNeighbors.forEach(function (n, i) {
            console.log("neighbor", i, ":", n.neighbor.toString());
        })
    }
    var totalDrop = _.sum(_.pluck(downStreamNeighbors, 'drop'));
    var averageDrop = totalDrop / downStreamNeighbors.length;
    if (say) {
        console.log('maxDrop: ', maxDrop, 'avgDrop:', averageDrop, 'distance: ', distance);
    }

    var flowSubstance = cell.sed + cell.water;
    var K = 1;
    if (flowSubstance > averageDrop) {
        K = averageDrop / flowSubstance;
    }
    var D2 = Math.pow(totalDrop, 2);
    downStreamNeighbors.forEach(function (n) {
        var fraction = K * Math.pow(n.drop, 2) / D2;
        var water = cell.water * fraction;

        var angle = Math.atan2(n.drop, distance);
        var sin = Math.max(MIN_SIN, Math.sin(angle));
        sin *= sin;
        var sed = water * sedErode * sin;

        if (say) {
            console.log('sin: ', Math.round(1000 * sin), 'water movement: ', water, 'sed movement: ', sed);
        }


        cell.sed += sed;
        cell.sed2 -= sed;
        cell.value -= sed;
        cell.water2 -= water;

        n.neighbor.water2 += water;
        n.neighbor.sed2 += sed;
    });
    return downStreamNeighbors;
};