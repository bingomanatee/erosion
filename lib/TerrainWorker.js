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
    if (terrain) {
        this.terrain = terrain;
    }

    if (cluster.isWorker) { // normally always true; but can be false under test scenarios
        this.hub = new Hub();

        this.hub.on('initDivision', function (data, sender, callback) {
            this.createTerrain(data.data, CONST.encoding);
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
            this.updateTerrain(data).then(function (result) {
                callback(null, result);
            }, callback);
        }.bind(this));
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
        return new Promise(function (resolve, reject) {
            if (!data.script) {
                return reject('no script in data for updateTerrain');
            }
            try {
                var executor = require(data.script);
            } catch (err) {
                console.log('cannot load script ', data.script, ': ', err);
                return reject(err);
            }
            var count = 0;

            function finish() {
                if (data.feedback) {
                    resolve({
                        source: this.terrain.toJSON(),
                        data: this.terrain.toData().toString(CONST.encoding)
                    });
                } else {
                    resolve(true);
                }
            }

            finish = finish.bind(this);

            function loop() {
                executor(this, data).then(function () {
                    ++count;
                    if (data.noisy) console.log('finished rep ', count, 'of', data.reps);

                    if (count >= data.reps) {
                        finish();
                    }
                    else {
                        loop();
                    }
                }.bind(this), reject);
            }

            loop = loop.bind(this);

            loop();
        }.bind(this));
    }
};

TerrainWorker.decodeBounds = require('./TerrainWorkerLib/decodeBounds');

module.exports = TerrainWorker;