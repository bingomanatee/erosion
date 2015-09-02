function TerrainManager(cluster, masterTerrain) {
    this.cluster = cluster;
    this.numCPUs = require('os').cpus().length;
    this.masterTerrain = masterTerrain;
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

// Fork workers. Fork them good and hard!
        for (var i = 0; i < numCPUs; i++) {
            var worker = cluster.fork();
            worker.on('message', function (msg) {
                console.log('message recieved from worker: ', msg);
                worker.send('message recieved');
            });
        }

        this.divisions = this.masterTerrain.divide(numCPUs);
        var index = 0;
        for (var id in cluster.workers) {
            if (index < divisions.length) {
                cluster.workers[id].send({message: 'create terrain', _cells: this.divisions[index].toData()});
                this.divisions[index].workerId = id;
                ++index;
            } else {
                cluster.workers[id].kill();
            }
        }
    }
};

module.exports = TerrainManager;