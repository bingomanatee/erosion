var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var path = require('path');

var TerrainCell = require('./../lib/TerrainCell');
var terrainHeight = require('./../lib/worker_scripts/terrainHeight');
var Terrain = require('./../lib/Terrain');
var moveSed = require('./../lib/worker_scripts/moveSediment');
var _ = require('lodash');

describe('erosion', function () {
    var cell;
    var terrain;

    beforeEach(function () {
        terrain = new Terrain(3,3, 40);
        terrain.setHeight(0, 0, 15);
        terrain.setHeight(0, 1, 25);
        terrain.setHeight(1, 1, 15);
    });

    describe('terrainHeight', function () {
        beforeEach(function () {
            cell = new TerrainCell({}, 1, 1, 50);
            cell.water = 5;
            cell.sed = 10;
        });

        it('should measure sum height', function () {
            expect(terrainHeight(cell)).to.eql(65);
        });
    });

    describe('moveSediment', function () {
        var c11;

        beforeEach(function () {
            terrain.each(function(cell){
                cell.water = cell.sed = 0;
            });
            c11 = terrain.getCell(1, 1);
            c11.sed = 5;
            c11.water = 10;
        });

        it('should change the height', function () {
            moveSed(c11);
            expect(terrain.map(terrainHeight).map(Math.round.bind(Math))).to.eql([ 23, 28, 40, 40, 20, 40, 40, 40, 40 ]);
        });

        it('should not change the net sum heights', function () {
            var startHeight = _.sum.apply(_, terrain.map(terrainHeight));
            moveSed(c11);
            var endHeight = _.sum.apply(_, terrain.map(terrainHeight));
            expect(Math.abs(startHeight  - endHeight)).to.be.below(0.1);
        });
    });
});