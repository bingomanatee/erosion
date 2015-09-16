var _ = require('lodash');
var flow = require('./flow');

module.exports = function flowToNeighbors(cell, sedErode, distance) {
    if (cell.water <= 0) {
        return;
    }
    var cellHeight = cell.totalHeight();
    var maxDrop = 0;
    var downStreamNeighbors = cell.neighbors().reduce(function(out, neighbor) {
        if (neighbor.meta === 'absent') return out;
        var nHeight = neighbor.totalHeight();
        var totalDrop = out.hasOwnProperty('totalDrop') ? out.totalDrop : 0;
        if (nHeight >= cellHeight) {
            return out;
        }
        var drop = cellHeight - nHeight;
        maxDrop = Math.max(maxDrop, drop);

        out.push({height: nHeight, drop: drop, neighbor : neighbor});
        return out;
    }, []);

    if (downStreamNeighbors.length <= 0) {
        return;
    }

    var totalDrop = _.sum(_.pluck(downStreamNeighbors, 'drop'));
    var averageDrop = totalDrop / downStreamNeighbors.length;
    var meanDrop = (totalDrop + maxDrop)/2;
    var angle = Math.atan2(meanDrop, distance);
    var sin = Math.max(0.1, Math.sin(angle));
  //  if (Math.random() < 0.00001) console.log('drop: ', maxDrop, 'distance: ', distance, 'angle:', angle, 'sin: ', Math.floor(1000 * sin));

    var newSed = cell.water * sedErode * sin;
    newSed -= cell.sed/2;
    if (newSed > 0){
        cell.sed += newSed;
        cell.value -= newSed;
    }


    var flowSubstance = cell.sed + cell.water;
    var K = 1;
    if (flowSubstance > averageDrop) {
        K = averageDrop / flowSubstance;
    }

    downStreamNeighbors.forEach(function(n) {
        var fraction = K * n.drop / totalDrop;
        if(isNaN(fraction)) {
            console.log('bad fraction: k = ', K, 'drop:', n.drop, 'averageDrop = ', averageDrop, 'totalDrop: ', totalDrop);

            console.log('n = ', require('util').inspect(n, {depth: 2}));
            console.log(require('util').inspect(downStreamNeighbors, {depth: 2}));
            throw new Error('bad cow');
        }
        n.fraction = fraction;
        flow(cell, n.neighbor, fraction);
    });
    return downStreamNeighbors;
};