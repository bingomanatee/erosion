var Terrain = require('./terrain.js');
var Hub = require('cluster-hub');
var q = require('q');
var _ = require('lodash');

function _boundsJSON(data){
    return data.map(function(item){
        return _.pick(item, ['i', 'j', 'value']);
    })
}

function TerrainWorker() {
    this.bounds = [];
    this.hub = new Hub();

    this.hub.on('initDivision', function (data, sender, callback) {
        this.createTerrain(data, 'hex');
        callback(null, this.terrain.toJSON(true));
    }.bind(this));
    this.hub.on('initBounds', function (data, sender, callback) {
        this.askBounds()
          .then(function () {
              callback(null, data.echo ? _boundsJSON(this.boundsData) : true);
          }.bind(this));
    }.bind(this));
    this.hub.on('die', process.exit.bind(process));
}

TerrainWorker.prototype = {
    askBounds: function () {
        var def = q.defer();
        this.hub.requestMaster('getBounds', this.terrain.toJSON(), function (err, bounds) {
            if (err) {
                def.reject(err);
            } else {
                this.boundsData = bounds;
                def.resolve(bounds);
            }
        }.bind(this));

        return def.promise;
    },

    createTerrain: function (data, encoding) {
        var buffer = new Buffer(data, encoding);
        this.terrain = Terrain.fromData(buffer);
        // console.log('terrain received');
        //  console.log(this.terrain.to2Darray());
    }
};

TerrainWorker.decodeBounds = require('./TerrainWorkerLib/decodeBounds');

module.exports = TerrainWorker;