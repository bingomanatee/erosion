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
            this.createTerrain(data);
            callback(null, this.terrain.toJSON());
        }.bind(this));

        this.hub.on('doRequestBounds', function (data, sender, callback) {
            console.log('worker', this.toJSON(), 'requesting bounds');
            this.requestBounds().then(function (err) {
                if (err) {
                    return callback(err);
                }
                callback(null, true);
            });
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

        this.hub.on('feedback', function (data, sender, callback) {
            console.log('feedback request recieved: ----------');
            var feedback = data.json ? this.terrain.toJSON(data.full, data.bounds) : this.terrain.toData(data.full).toString(CONST.encoding);
            console.log('feedback -- sending data');
            callback(null, {
                source: this.terrain.toJSON(),
                data: feedback
            });
        }.bind(this))
    }
}

TerrainWorker.prototype = _.extend({
      createTerrain: function (data) {
          this.terrain = Terrain.fromData(data);
      },

      toString: function () {
          if (!this.terrain) {
              return 'worker for uninstantiated terrain';
          }
          return 'worker for ' + this.terrain.toString();
      },

      toJSON: function(){
        return this.terrain.toJSON();
      },

      updateTerrain: function (config) {
          return q.Promise(function (resolve, rej) {
              function reject(err) {
                  console.log('error in updateTerran', err);
                  rej(err);
              }

              if (!config.script) {
                  return reject('no script in data for updateTerrain');
              }
              try {
                  var executor = require(config.script);
              } catch (err) {
                  console.log('cannot load script ', config.script, ': ', err);
                  return reject(err);
              }
              var count = 0;

              function finish() {
                  if (config.feedback) {
                      resolve({
                          source: this.terrain.toJSON(),
                          data: this.terrain.toData().toString(CONST.encoding)
                      });
                  } else {
                      resolve(true);
                  }
              }

              finish = finish.bind(this);

              var noisy = config.noisy;

              function loop() {
                  executor(this, _.clone(config)).then(function () {
                      ++count;
                      if (noisy && !(count % noisy)) {
                          console.log('worker ', this.terrain.toString(), ' finished rep ' + count, 'of', config.reps);
                      }

                      if (count >= config.reps) {
                          finish();
                      }
                      else {
                          loop();
                      }
                  }.bind(this), function (err) {
                      console.log('error on loop: ', count, err);
                      reject(err);
                  });
              }

              loop = loop.bind(this);

              if (config.initBounds) {
                  this.initBounds()
                    .then(function () {
                        loop();
                    }, function (err) {
                        console.log('error asking for bounds', err);
                        reject(err);
                    });
              } else {
                  loop();
              }
          }.bind(this));
      }
  },
  require('./TerrainWorkerLib/bounds')
);

TerrainWorker.decodeBounds = require('./TerrainWorkerLib/decodeBounds');

module.exports = TerrainWorker;