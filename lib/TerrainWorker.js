var Terrain = require('./terrain.js');
var Hub = require('cluster-hub');
var cluster = require('cluster');
var q = require('q');
var _ = require('lodash');
var CONST = require('./util/const.json');

function _boundsJSON(data) {
    return data.map(function (item) {
        return _.pick(item, ['i', 'j', 'value']);
    })
}

function TerrainWorker(terrain) {
    if (cluster.isWorker) { // normally always true; but can be false under test scenarios
        this.hub = new Hub();

        this.hub.on('initDivision', function (data, sender, callback) {
            //   console.log('initDivision recieved data length ', data.size, data.data.length);
            this.createTerrain(data.data, CONST.encoding);
            //console.log(' --- terrain created(worker): --- ');
            //console.log(this.terrain.toJSON());
            //console.log(this.terrain.to2Darray());
            //console.log(' --- end terrain created(worker) --- ');
            callback(null, this.terrain.toJSON());
        }.bind(this));
        this.hub.on('initBounds', function (data, sender, callback) {
            this.askBounds()
              .then(function () {
                  callback(null, data.echo ? _boundsJSON(this.terrain.getBounds()) : true);
              }.bind(this));
        }.bind(this));
        this.hub.on('die', function (data, sender, callback) {
            callback();
            setTimeout(function () {
                process.exit.bind(process);
            }, 100);
        });

        this.hub.on('update', function (data, sender, callback) {
            //    console.log('worker asked to update with ', data);
            this.updateTerrain(data).then(function (result) {
                // console.log('sending result of ', data, 'back');
                callback(null, result);
            }, callback);
        }.bind(this));
    } else if (terrain) {
        this.terrain = terrain;
    }
}

TerrainWorker.prototype = {
    askBounds: function () {
        var def = q.defer();
        this.hub.requestMaster('getBounds', this.terrain.toJSON(), function (err, boundsStr) {
         //   console.log('bounds:', boundsStr);
            if (err) {
                def.reject(err);
            } else {
                var boundsData = TerrainWorker.decodeBounds(boundsStr);
                this.terrain.setBounds(boundsData);
                def.resolve(true);
            }
        }.bind(this));

        return def.promise;
    },

    createTerrain: function (data, encoding) {
        this.terrain = Terrain.fromData(data, encoding);
    },

    updateTerrain: function (data) {
        var startTime = new Date().getTime();
        return q.Promise(function (resolve, reject) {
            if (!data.script) {
                return reject('no script in data for updateTerrain');
            }
            var executor = require(data.script);
            //console.log('executor load took ', (new Date().getTime() - startTime) / 1000, 'secs');
            executor(this).then(function (result) {
                // console.log('updateTerrain took ', (new Date().getTime() - startTime) / 1000, 'secs');
                if (data.feedback) {
                    try {
                        resolve({
                            source: this.terrain.toJSON(),
                            data: this.terrain.toData().toString(CONST.encoding)
                        });
                    } catch (err) {
                        console.log('error in data feedback: ', err);
                        reject(err);
                    }
                    //       console.log(' ---------- returned data');

                } else {
                    resolve(true);
                }
            }.bind(this), reject);
        }.bind(this));
    }
};

TerrainWorker.decodeBounds = require('./TerrainWorkerLib/decodeBounds');

module.exports = TerrainWorker;