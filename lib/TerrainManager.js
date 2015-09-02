function TerrainManager(cluster) {
    this.cluster = cluster;
    this.numCPUs = require('os').cpus().length;
}

TerrainManager.prototype = {
    init: function () {
        var cluster = this.cluster;
        var numCPUs = this.numCPUs;

        cluster.on('exit', function (worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
        });

        cluster.on('death', function (worker) {
            console.log('worker died:', worker);
        });

// Fork workers.
        for (var i = 0; i < numCPUs; i++) {
            var worker = cluster.fork();
            worker.on('message', function (msg) {
                console.log('message recieved from worker: ', msg);
                worker.send('message recieved');
            });
        }

        var divisions = masterTerrain.divide(numCPUs);
        for (var id in cluster.workers) {
            if (divisions.length) {
                cluster.workers[id].send({message: 'create terrain', _cells: divisions.pop().toData()});
            } else {
                cluster.workers[id].kill();
            }
            break;
        }

    }
};

module.exports = TerrainManager;