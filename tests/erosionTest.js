var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var path = require('path');

var TerrainCell = require('./../lib/TerrainCell');
var Terrain = require('./../lib/Terrain');
var _ = require('lodash');

describe('erosion', function () {
    var terrain;
    var cell;

    describe('#dissolve', function () {
        var dissolve = require('./../lib/erosion/cell/dissolve');
        var dissolveRate = 0.25;

        beforeEach(function () {
            cell = new TerrainCell({}, 0, 0, 5);
        });

        it('doesn\'t dissolve the terrain if there is no water', function () {
            dissolve(cell, dissolveRate);
            expect(cell.height()).to.eql(5);
            expect(cell.totalHeight(true)).to.eql(5);
        });

        it('doesn\'t change the total height', function () {
            dissolve(cell, dissolveRate);
            expect(cell.totalHeight(true)).to.eql(5);
        });

        describe('with water', function () {
            beforeEach(function () {
                cell.water = 10;
                dissolve(cell, dissolveRate);
            });

            it('dissolves the cell by a given percent of the present water', function () {
                expect(cell.height()).to.eql(2.5);
            });

            it('doesn\'t change the total height', function () {
                dissolve(cell, dissolveRate);
                expect(cell.totalHeight(true)).to.eql(5);
            });
        })
    });

    describe('#flow', function () {
        var flow = require('./../lib/erosion/cell/flow');
        var cell, cell2;
        beforeEach(function () {
            cell = new TerrainCell({}, 0, 0, 90);
            cell.water = 7;
            cell.sed = 3;

        });

        it('should not flow into an equal or higher cell', function () {
            cell2 = new TerrainCell({}, 0, 1, 100);
            flow(cell, cell2);

            expect(cell.totalHeight(true)).to.eql(100);
            expect(cell2.totalHeight(true)).to.eql(100);
        });

        it('should flow completely into a very low cell', function () {
            cell2 = new TerrainCell({}, 0, 1, 20);
            flow(cell, cell2);

            expect(cell.totalHeight(true)).to.eql(90);
            expect(cell2.totalHeight(true)).to.eql(30);

            expect(cell.totalWater()).to.eql(0);
            expect(cell.totalSed()).to.eql(0);
        });

        describe('should equalize the heights for cells in close range', function () {
            it('is equal for a drop of 5', function () {
                cell2 = new TerrainCell({}, 0, 1, 95);
                flow(cell, cell2);
                expect(cell.totalHeight(true)).to.be.closeTo(cell2.totalHeight(true), 0.1);
                expect(cell.totalHeight(true)).to.be.closeTo(97.5, 0.0001);
                expect(cell.totalWater()).to.be.closeTo(5.25, 0.0001);
                expect(cell.totalSed()).to.be.closeTo(2.25, 0.0001);
                console.log('cell: ', cell.toString(), 'cell2: ', cell2.toString());
            });
        });

    });
});