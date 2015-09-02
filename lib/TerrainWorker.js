var Terrain = require('./terrain.js');

function TerrainWorker(cluster) {
    this.cluster = cluster;
}

TerrainWorker.prototype = {

    init: function() {
        this.cluster.worker.on('message', this.listen.bind(this));
    },

    listen: function(info) {
        switch (info.msg) {
            case 'create terrain worker':
                this.createTerrain(info.data);
                break;
            default:
                console.log('worker at ', this.cluster.worker.id, ' received unknown message:', info.msg);
        }
    },

    send: function(message) {
        this.cluster.worker.send(message);
    },

    createTerrain: function(data){
        var buffer = new Buffer(data);
        this.terrain = Terrain.fromData(buffer);
        this.terrain.state.isWorker();
        this.send({msg: 'terrain created', data: this.terrain.toJSON()});
    }
};

module.exports = TerrainWorker;