var Terrain = require('./../lib/Terrain');
var TerrainManager = require('../../lib/TerrainManager');
var chai = require('chai');
var expect = chai.expect;
var q = require('q');

describe('TerrainManager', function () {
    var terMaster, mgr;

    beforeEach(function (done) {
        terMaster = new Terrain(10, 12, function (i, j, iSize, jSize) {
            return i * jSize + j;
        });

        mgr = new TerrainManager(terMaster);
        SpyOn(mgr, 'createWorker').and.callFake(function(){
            return Q.fcall(function(){
                return true;
            });
        });

        mgr.init(4).then(done);
    });

    describe('#bounds', function(){
        var input, bounds;

        beforeEach(function(){
            input = mgr.divisions[1].toJSON();
            bounds = mgr.boundsFor(input);
        })
    });

});