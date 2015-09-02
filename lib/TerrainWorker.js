var Terrain = require('./terrain.js');
var clusterphone = require("clusterphone");
var Promise = require('promise');

function TerrainWorker() {
    this.bounds = [];
}

TerrainWorker.prototype = {

    init: function() {
        clusterphone.handlers.crreateTerrainWorker = this.createTerrain.bind(this);
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
            var def = q.defer();

            this.send('get bounds', this.boundries());

            this._boundsDef = def;
            this._boundsPromise = def.promise;
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