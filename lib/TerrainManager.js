var StateMachine = require('javascript-state-machine');

function TerrainManager(cluster, masterTerrain) {
    this.cluster = cluster;
    this.numCPUs = require('os').cpus().length;
    this.masterTerrain = masterTerrain;
    this.errs = [];
    var clusterphone = require("clusterphone");

    this.state = StateMachine.create({
        initial: 'new',
        events: [
            {name: 'loadingWorkers', from: 'new', to: 'loadingworkers'},
            {name: 'workersReady', from: 'loadingworkers', to: 'workersready'},
            {name: 'workerError', from: '*', to: 'workererror'}
        ],

        callbacks: {
            onenterworkersready: function(){
                console.log("ALL WORKERS READY!!!!!");
            }
        }

    })

}

TerrainManager.prototype = {

    createWorker: function(division) {
        var cluster = this.cluster;
        var worker = cluster.fork();
        division.worker = worker;

        worker.on('message', function(msg) {
            this.listen(msg, division);
        }.bind(this));

        // console.log('terrain manager tasking terrain ', division.toJSON(), 'to worker ', worker.id);
        worker.on('online', function() {
            division.online = true;
            division.state.workerRequested();
            clusterphone.sendTo(worker, 'createTerrainWorker', division.toData().toString())
                .ackd().then(function(data){
                    //@TODO: validate data
                    division.state.workerMade();
                    this.onWorkerCreated();
                }.bind(this),
                function(err) {
                    this.onWorkerError(divsion, err);
                }.bind(this));
        });
    },

    onWorkerError: function(division, err) {
        this.errs.push(err);
        division.state.hasProblem();
        division.lastError = err;
        this.errs.push({err: err, division: division});
        this.state.workerError();
    },

    onWorkerCreated: function() {
        var created = true;
        this.divisions.forEach(function(div){
            if (created && ! div.state.is('workercreated')){
                created = false;
            }
        }, this);

        if (created){
            this.state.workersReady();
        }
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
};

module.exports = TerrainManager;