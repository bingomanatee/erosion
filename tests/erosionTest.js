var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var path = require('path');

var TerrainCell = require('./../lib/TerrainCell');
var Terrain = require('./../lib/Terrain');
var _ = require('lodash');

describe('erosion', function() {
    describe('cell functions', function() {

        var cell;

        describe('evaporate', function() {
            var evaporate = require('./../lib/erosion/cell/evaporate');
            var cell;

            beforeEach(function() {
                cell = new TerrainCell({}, 0, 0, 100);
                cell.water = 50;
                cell.sed = 10;
            });

            // note = this test does NOT change sediment as it all remains under the water saturation level.
            it('should maintain state at a saturation rate of .5, evapRate of 0.8', function() {
                evaporate(cell, 0.8, 0.5);
                expect(cell.height()).to.eql(100);
                expect(cell.totalHeight()).to.eql(150);
                expect(cell.water).to.eql(40);
            });

            // this test DOES change sediment. 1 sediment blows away with the evaporating water.
            it('should reduce height at a rate of .5, evapRate 0f 0.2', function() {
                evaporate(cell, 0.8, 0.2);
                expect(cell.totalHeight()).to.eql(149);
                expect(cell.height()).to.eql(101);
                expect(cell.water).to.eql(40);
            });

        });

        describe('flow', function() {
            var flow = require('./../lib/erosion/cell/flow');
            var cell, cell2;
            beforeEach(function() {
                cell = new TerrainCell({}, 0, 0, 90);
                cell.water = 7;
                cell.sed = 3;
            });

            it('should not flow into an equal or higher cell', function() {
                cell2 = new TerrainCell({}, 0, 1, 100);
                flow(cell, cell2);

                expect(cell.totalHeight(true)).to.eql(100);
                expect(cell2.totalHeight(true)).to.eql(100);
            });

            it('should flow completely into a very low cell', function() {
                cell2 = new TerrainCell({}, 0, 1, 20);
                flow(cell, cell2);

                expect(cell.totalHeight(true)).to.eql(90);
                expect(cell2.totalHeight(true)).to.eql(30);

                expect(cell.totalWater()).to.eql(0);
                expect(cell.totalSed()).to.eql(0);
            });

            describe('should equalize the heights for cells in close range', function() {
                it('is equal for a drop of 5', function() {
                    cell2 = new TerrainCell({}, 0, 1, 95);
                    flow(cell, cell2);
                    expect(cell.totalHeight(true)).to.be.closeTo(cell2.totalHeight(true), 0.1);
                    expect(cell.totalHeight(true)).to.be.closeTo(97.5, 0.0001);
                    expect(cell.totalWater()).to.be.closeTo(5.25, 0.0001);
                    expect(cell.totalSed()).to.be.closeTo(2.25, 0.0001);
                });
            });

        });

        describe.skip('flowToNeighbors', function() { // this function is in severe flux
            var terrain;
            var flowToNeighbors = require('./../lib/erosion/cell/flowToNeighbors');
            var cell;
            beforeEach(function() {
                terrain = new Terrain(5, 5, function(i, j) {
                    return i * 10 + j * 2;
                });
                cell = terrain.getCell(2, 2);
                cell.water = 5;
                cell.sed = 2;
                flowToNeighbors(cell, 0.25, 10);
            });

            it('should flow into downstream neighbors', function(){
                //terrain.erosionReport();
            })
        });
    });

    describe('lowestNeighbor', function() {
        var terrain;
        var lowestNeighbor = require('./../lib/erosion/cell/lowestNeighbor');
        beforeEach(function() {
            terrain = new Terrain(5, 5, function(i, j) {
                return 10 - Math.abs(i - 2) - Math.abs(j - 2);
            });
            terrain.random = function() {
                return 1;
            }
        });

        it('should find the lowest neighbor at 1,1', function() {
            var lowest = lowestNeighbor(terrain.getCell(1, 1));
            expect(_.pick(lowest, ['i', 'j'])).to.eql({i: 0, j: 0});
        });

        it('should find the lowest neighbor at 0,1', function() {
            var lowest = lowestNeighbor(terrain.getCell(1, 1));
            expect(_.pick(lowest, ['i', 'j'])).to.eql({i: 0, j: 0});
        });

        it('should find the lowest neighbor at 3,3', function() {
            var lowest = lowestNeighbor(terrain.getCell(3, 3));
            expect(_.pick(lowest, ['i', 'j'])).to.eql({i: 4, j: 4});
        });

        it('should find the first of equals at 3, 2', function() {

            var lowest = lowestNeighbor(terrain.getCell(3, 2));
            expect(_.pick(lowest, ['i', 'j'])).to.eql({i: 4, j: 1});
        });

        it('should find the last of equals at 3, 2 with a random function of 0', function() {
            terrain.random = function() {
                return 0;
            };
            var lowest = lowestNeighbor(terrain.getCell(3, 2));
            expect(_.pick(lowest, ['i', 'j'])).to.eql({i: 4, j: 3});
        });
    });

    describe('erode', function() {
        var TerrainWorker = require('./../lib/TerrainWorker');
        var worker;
        var terrain;
        var runParams;

        beforeEach(function() {
            var randTrue = false;
            terrain = new Terrain(11, 11, function(i, j, I, J) {
                return 100 * (i / (I - 1));
            });
            worker = new TerrainWorker(terrain);

            terrain.random = function(cell) {
                randTrue = !randTrue;
                return randTrue ? 1 : 0;
            };

            runParams = {
                script: path.resolve(__dirname, './../lib/erosion/erode'),
                waterFreq: 0,
                waterAmount: 0,
                evapRate: 0.9,
                maxSaturation: 0.5,
                sedDissolve: 0.1,
                reps: 10
            }
        });

        it('should make a slope', function() {
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

        it('should melt a channel', function(done) {

            terrain.getCell(5, 5).water = 100;
            worker.updateTerrain(runParams)
                .then(function() {
                 //   terrain.erosionReport();
                    var imgPath = path.resolve(__dirname, '../test_scripts/singleChannel.png');
                    terrain.toPng(imgPath, {max: 50, min: -20})
                        .then(function() {
                            done();
                        });
                }, function(err) {
                    console.log('err: ', err);
                    console.log(err.getStack());
                    done();
                });
        });
    });

});