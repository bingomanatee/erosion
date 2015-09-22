var q = require('q');
var util = require('util');

function _smooth(worker) {
    //console.log(':::::::::: smoothing ', worker.terrain.toJSON());
    //console.log(worker.terrain.to2Darray());
    var startTime = new Date().getTime();
    worker.terrain.updateTerrain(function (cell) {
        //  console.log(' ================ smoothing', cell.i, cell.j, cell.value, 'of', worker.terrain.toJSON());
        var neighbors = cell.neighbors();
        if (!neighbors.length) {
            console.log('no neighbors for ', cell.i, cell.j);
            console.log('... _neighbors =', cell._neighbors);
        }
        var neighborHeight = neighbors.reduce(function (out, cell) {
            var h = cell.height();
            if (h === null) {
                //     console.log('no value at ', cell.i, cell.j );
                return out;
            }
            ++out.count;
            out.sum += h;
            return out;

        }, {count: 0, sum: 0});
        if (neighborHeight.count <= 0) {
            console.log('no counts???');
            console.log(util.inspect(cell, {depth: 3}));
            return -1;
        }
        return Math.floor(neighborHeight.sum / neighborHeight.count);
    });
    //console.log(' ::::::::::::::::::::::: smoothed terrain for ', worker.terrain.toJSON(), 'in',
    //  (new Date().getTime() - startTime) / 1000, 'secs'
    //);
    //console.log(worker.terrain.to2Darray());
}

module.exports = function (worker, data) {
    var noBounds = (!worker.hub) || data.noBounds;
    var defer = q.defer();

    return new Promise(function(resolve, reject){
        if ((!worker.terrain._bounds) && (!noBounds)) {
            worker.initBounds().then(function () {
                _smooth(worker);
                resolve(true);
            },reject);
        } else {
            _smooth(worker);
            resolve(true);
        }
    });
};