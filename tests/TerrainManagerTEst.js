var Terrain = require('../lib/Terrain');
var TerrainManager = require('../lib/TerrainManager');
var TerrainWorker = require('../lib/TerrainWorker');
var chai = require('chai');
var expect = chai.expect;
var q = require('q');

describe('TerrainManager', function () {
    var terMaster, mgr;

    beforeEach(function (done) {
        terMaster = new Terrain(8, 6, function (i, j, iSize, jSize) {
            return i * jSize + j;
        });

        mgr = new TerrainManager(terMaster);
        mgr.createWorker = function () {
            return q.fcall(function () {
                return true;
            });
        };

        var p = mgr.init(2);
        p.then(function () {
            done();
        });
    });

    describe('#bounds', function () {
        var input, bounds, decoded;

        beforeEach(function () {
            input = mgr.divisions[1].toJSON();
            bounds = mgr.boundsFor(input);
            decoded = TerrainWorker.decodeBounds(bounds);
           // console.log('terrain heights:');
           // console.log(terMaster.to2Darray());
        });

        it('should give good bounds', function () {
            expect(decoded).to.eql([
                  {i: 3, j: 0, value: 18, virtual: true, terrain: null},
                  {i: 3, j: 1, value: 19, virtual: true, terrain: null},
                  {i: 3, j: 2, value: 20, virtual: true, terrain: null},
                  {i: 3, j: 3, value: 21, virtual: true, terrain: null},
                  {i: 3, j: 4, value: 22, virtual: true, terrain: null},
                  {i: 3, j: 5, value: 23, virtual: true, terrain: null}]
            );
        });
    });

});