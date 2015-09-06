var Terrain = require('../lib/Terrain');
var TerrainWorker = require('../lib/TerrainWorker');
var chai = require('chai');
var expect = chai.expect;
var q = require('q');
var _ = require('lodash');
var SmartBuffer = require('smart-buffer');

describe('TerrainWorker', function () {

    describe('#decodeBounds', function () {
        var boundsBuffer, decode;

        beforeEach(function () {
            boundsBuffer = new SmartBuffer(12);
            boundsBuffer.writeInt16LE(6);
            boundsBuffer.writeInt16LE(9);
            boundsBuffer.writeFloatLE(55.5);
            decode = TerrainWorker.decodeBounds(boundsBuffer.toBuffer());
        });

        it('should decode buffer', function () {
            expect(decode.map(function (cell) {
                return _.pick(cell, 'i,j,value'.split(','))
            })).to.eql([{i: 6, j: 9, value: 55.5}]);
        });

    });

});