function TerrainManager(cluster, masterTerrain) {
    this.cluster = cluster;
    this.numCPUs = require('os').cpus().length;
    this.masterTerrain = masterTerrain;
}

TerrainManager.prototype = {

    listen: function(msg, terrainSlice) {
        console.log('TerrainManager: message received from ',terrainSlice.worker.id, ': ', msg.msg, msg.data);
    },

    createWorker: function(division){
        var cluster = this.cluster;
        var worker = cluster.fork();
        division.worker = worker;

        worker.on('message', function(msg) {
            this.listen(msg, division);
        }.bind(this));

        console.log('terrain manager tasking terrain ', division.toJSON(), 'to worker ', worker.id);
        worker.send({ msg: 'create terrain worker', data: division.toData().toString()} );
    },

    init: function() {
        var cluster = this.cluster;
        var numCPUs = this.numCPUs;

        console.log('dividing terrain into ', numCPUs, ' chunks');

        cluster.on('exit', function(worker, code, signal) {
            console.log('worker ' + worker.process.pid + ' died');
        });

        cluster.on('death', function(worker) {
            console.log('worker died:', worker);
        });

// Fork workers. Fork them good and hard!
        this.divisions = this.masterTerrain.divide(numCPUs);
        var index = 0;
        for (var i = 0; i < numCPUs; i++) {
            if (index < this.divisions.length) {
                var division = this.divisions[index];
                    this.createWorker(division);

                ++index;
            }
            else {
                break;
            }
        }
    }
}
;

module.exports = TerrainManager;