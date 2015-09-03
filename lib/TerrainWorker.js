var Terrain = require('./terrain.js');
var clusterphone = require("clusterphone");
var Promise = require('promise');

function TerrainWorker() {
    this.bounds = [];

    /* this.state = StateMachine.create({
     initial: 'new',
     events: [
     {name: 'terrainMade', from: 'new', to: 'terrainmade'},
     {name: 'boundsRequested', from: 'terrainmade', to: 'boundsrequested'},
     {name: 'boundsReceived', from: 'boundsrequested', to: 'boundsreceived'}
     ]
     }); */

}

TerrainWorker.prototype = {

    init: function() {
        clusterphone.handlers.crreateTerrainWorker = this.createTerrain.bind(this);
        clusterphone.handlers.sendBounds = this.sendBounds.bind(this);
    },

    sendBounds: function() {
        return Promise.resolve(this.terrain.boundsData());
    },

    askBounds: function(done) {
        clusterphone.sendToMaster('getbounds', this.terrain.toJSON()).ackd()
            .then(function(boundsData) {
                this.boundsData = boundsData;
                this.state.gotBounds();
                done();
            }, function(err) {
                console.log('getBounds error: ', err);
                done(err);
            });

    },

    createTerrain: function(data) {
        var buffer = new Buffer(data);
        this.terrain = Terrain.fromData(buffer);
        this.terrain.state.isWorker();
        return Promise.resolve(this.terrain.toJSON());
    }
};

module.exports = TerrainWorker;