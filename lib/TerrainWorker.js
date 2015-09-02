var Terrain = require('./terrain.js');
var clusterphone = require("clusterphone");
var Promise = require('promise');

function TerrainWorker() {
    this.bounds = [];

    this.state = StateMachine.create({
        initial: 'new',
        events: [
            {name: 'terrainMade', from: 'new', to: 'terrainmade'},
            {name: 'boundsRequested', from: 'terrainmade', to: 'boundsrequested'},
            {name: 'boundsReceived', from: 'boundsrequested', to: 'boundsreceived'}
        ]
    });

    if (_.isArray(values)) {
        for (var i = 0; i < this.iSize; ++i) {
            for (var j = 0; j < this.jSize; ++j) {
                this._cells.push(new TerrainCell(this, i, j, values.shift()));
            }
        }
    } else {
        for (var i = 0; i < this.iSize; ++i) {
            for (var j = 0; j < this.jSize; ++j) {
                var value = (typeof values === 'function') ? values(i, j) : values;
                var cell = new TerrainCell(this, i, j, value);
                this._cells.push(cell);
            }
        }
    }

}

TerrainWorker.prototype = {

    init: function() {
        clusterphone.handlers.crreateTerrainWorker = this.createTerrain.bind(this);
        clusterphone.handlers.sendBounds = this.sendBounds.bind(this);
    },

    sendBounds: function(){
        return Promise.resolve(this.terrain.boundsData());
    },

    boundries: function() {
        return {
            iMin: this.iStart - 1,
            iMax: this.iStart + this.iSize + 1,
            jMin: this.jStart - 1,
            jMax: this.jStart + this.jSize + 1
        };
    },

    askBounds: function(done) {
        if (this.bounds.length) {
            return done(this.bounds);
        } else if (this._boundsPromise) {
            this._boundsPromise.then(done);
        } else {
            this.state.askedBounds();
            clusterphone.sendToMaster('getbounds', this.terrain.toJSON()).ackd()
                .then(function(boundsData) {
                    this.boundsData = boundsData;
                    this.state.gotBounds();
                }, function(err) {

                });
        }

        this.send('askBounds');
    },

    createTerrain: function(data) {
        var buffer = new Buffer(data);
        this.terrain = Terrain.fromData(buffer);
        this.terrain.state.isWorker();
        return Promise.resolve(this.terrain.toJSON());
    }
};

module.exports = TerrainWorker;