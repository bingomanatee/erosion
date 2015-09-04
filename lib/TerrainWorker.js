var Terrain = require('./terrain.js');
var Hub = require('cluster-hub');
var Promise = require('promise');

function TerrainWorker() {
    this.bounds = [];
    this.hub = new Hub();

    this.hub.on('initDivision', function(data, sender, callback){
        this.createTerrain(data);
        callback(null, this.terrain.toJSON());
    }.bind(this));
    this.hub.on('die', process.exit.bind(process));
}

TerrainWorker.prototype = {
    //
    //sendBounds: function() {
    //    return Promise.resolve(this.terrain.boundsData());
    //},
    //
    //askBounds: function(done) {
    //    clusterphone.sendToMaster('getbounds', this.terrain.toJSON()).ackd()
    //        .then(function(boundsData) {
    //            this.boundsData = boundsData;
    //            this.state.gotBounds();
    //            done();
    //        }, function(err) {
    //            console.log('getBounds error: ', err);
    //            done(err);
    //        });
    //
    //},

    createTerrain: function(data) {
        var buffer = new Buffer(data);
        this.terrain = Terrain.fromData(buffer);
    }
};

module.exports = TerrainWorker;