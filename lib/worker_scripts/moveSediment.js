var terrainHeight = require('./terrainHeight');
var _ = require('lodash');
var util = require('util');

module.exports = function (cell) {

    if (cell.water > 0) {
        var height = terrainHeight(cell);

        var lowestNeighbor = cell.neighbors().reduce(function (out, neighbor) {
            if (neighbor.meta === 'absent') {
                return out;
            }
            var neighborHeight = terrainHeight(neighbor);
            if (neighborHeight < out.height) {
                out.height = neighborHeight;
                out.neighbor = neighbor;
            }
            return out;
        }, {height: height, neighbor: null});

        if (lowestNeighbor.neighbor) {

            var drop = height - lowestNeighbor.height;
            var soluables = cell.water + cell.sed;
            var neighbor = lowestNeighbor.neighbor;
            var movingSoluables = drop / 2;
         //   console.log('soluables: ', soluables, 'movingSoluables:', movingSoluables, 'drop: ', drop);

            if (soluables < movingSoluables) {
                //  transfer all
           //     console.log('transferring all water from ', cell.toString(), 'to', neighbor.toString());

                neighbor.sed2 += cell.sed;
                neighbor.water2 += cell.water;
                cell.water2 -= cell.water;
                cell.sed2 -= cell.sed;
            } else {
                // transfer some

                var ratio = movingSoluables / soluables;
                var movingWater = cell.water * ratio;
                var movingSed = cell.sed * ratio;

             //   console.log('transferring some water from ', cell.toString(), 'to', neighbor.toString());
            //    console.log('drop: ', drop, 'ratio: ', ratio, 'water: ', movingWater, 'sed: ', movingSed);

                cell.water2 -= movingWater;
                neighbor.water2 += movingWater;
                cell.sed2 -= movingSed;
                neighbor.sed2 += movingSed;

             //   console.log('cell is now: ', cell.toString(), 'neighbor is ', neighbor.toString());

            }
        }
    }
};