var q = require('q');

function _smooth(worker) {
    worker.terrain.updateTerrain(function (cell) {
        console.log('smoothing', cell.i, cell.j, cell.value);
        var neighbors = cell.neighbors();
        var neighborHeight = neighbors.reduce(function (out, cell) {
            var h = cell.height();
            if (h === null) {
                return out;
            }
            ++out.count;
            out.sum += h;
            return out;

        }, {count: 0, sum: 0});
        if (neighborHeight.count <= 0) {
            console.log('no counts???');
            return 0;
        }
        var mean = Math.floor(neighborHeight.sum / neighborHeight.count);
        return mean;
    });
    console.log('smoothed terrain for ', worker.terrain.toJSON());
    console.log(worker.terrain.to2Darray());
}

module.exports = function (worker, noBounds) {
    var defer = q.defer();

    if ((!worker.terrain._bounds) && noBounds) {
        worker.askBounds().then(function () {
            _smooth(worker);
            defer.resolve(true);
        }, function (err) {
            defer.reject(err);
        });
    } else {
        _smooth(worker);
        defer.resolve(true);
    }

    return defer.promise;
};