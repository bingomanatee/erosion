var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var path = require('path');

var TerrainCell = require('./../lib/TerrainCell');
var Terrain = require('./../lib/Terrain');
var _ = require('lodash');

describe('erosion', function () {
    describe('cell functions', function () {

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

        describe('#evaporate', function () {
            var evaporate = require('./../lib/erosion/cell/evaporate');
            var cell

            beforeEach(function () {
                cell = new TerrainCell({}, 0, 0, 100);
                cell.water = 50;
                cell.sed = 10;
            });

            it('should maintain state at a saturation rate of .5, evapRate of 0.8', function () {
                evaporate(cell, 0.8, 0.5);
                expect(cell.height()).to.eql(100);
                expect(cell.totalHeight()).to.eql(150);
                expect(cell.water).to.eql(40);
            });

            it('should reduce height at a rate of .5, evapRate 0f 0.2', function () {
                evaporate(cell, 0.8, 0.2);
                expect(cell.totalHeight()).to.eql(150);
                expect(cell.height()).to.eql(102);
                expect(cell.water).to.eql(40);
            });

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
                    //  console.log('cell: ', cell.toString(), 'cell2: ', cell2.toString());
                });
            });

        });
    });


    describe('#erode', function () {
        var erode = require('./../lib/erosion/erode');
        var terrain;
        var runParams;

        beforeEach(function () {
            var randTrue = false;
            terrain = new Terrain(11, 11, function (i, j, I, J) {
                return 100 * (i / (I - 1));
            });

            terrain.random = function (cell) {
                if (cell.i == 4 && cell.j == 4) {
                    randTrue = !randTrue;
                    return randTrue ? 1 : 0;
                } else {
                    return 0;
                }
            };

            runParams = {
                waterFreq: 0.5,
                waterAmount: 5,
                evapRate: 0.9,
                maxSaturation: 0.5,
                sedDissolve: 0.1
            }
        });

        it('should make a slope', function () {
            expect(terrain.to2Darray()).to.eql([
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
                [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
                [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
                [40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40],
                [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
                [60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60],
                [70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
                [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
                [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
                [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
            ]);
        });

        it('should erode only on single cell', function (done) {
            erode({terrain: terrain}, runParams).then(function () {
                terrain.erosionReport();
                done();
            }, function (err) {
                console.log('err: ', err);
                done();
            });
        });
    });

});