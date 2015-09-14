var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var path = require('path');

var TerrainCell = require('./../lib/TerrainCell');
var terrainHeight = require('./../lib/worker_scripts/terrainHeight');
var Terrain = require('./../lib/Terrain');
var moveSed = require('./../lib/worker_scripts/moveSediment');
var resolveMoveSed = require('./../lib/worker_scripts/resolveMoveSediment');
var TerrainWorker = require('./../lib/TerrainWorker');
var _ = require('lodash');

describe('erosion', function () {
    var cell;
    var terrain;
    var WIDTH = 4;
    var HEIGHT = 4;

    beforeEach(function () {
        terrain = new Terrain(WIDTH, HEIGHT, 40);
        terrain.setHeight(0, 0, 10);
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
            terrain.each(function (cell) {
                cell.water = cell.sed = 0;
            });
            c11 = terrain.getCell(1, 1);
            c11.sed = 5;
            c11.water = 10;
        });

        it('should change the height', function () {
            terrain.each(moveSed);
            terrain.each(resolveMoveSed);

            var newHeights = terrain.map(terrainHeight).map(Math.round.bind(Math));
            expect(newHeights).to.eql([
                23, 25, 40, 40,
                40, 23, 40, 40,
                40, 40, 40, 40,
                40, 40, 40, 40
            ]);
        });

        it('should not change the net sum heights', function () {
            var startHeight = _.sum.apply(_, terrain.map(terrainHeight));
            terrain.each(moveSed);
            terrain.each(resolveMoveSed);

            var endHeight = _.sum.apply(_, terrain.map(terrainHeight));
            expect(Math.abs(startHeight - endHeight)).to.be.below(0.1);
        });
    });

    describe('erode', function () {
        var script = path.resolve(__dirname, '../lib/worker_scripts/erode');
        var worker;
        var config = {
            script: script,
            sedDissolve: 0.2,
            maxSaturation: 0.5,
            waterAmount: 5,
            waterFreq: 0.5,
            evapRate: 0.8,
            reps: 1
        };

        function cycle() {
            var worker = new TerrainWorker(terrain);
            return worker.updateTerrain(config);
        }

        function _terrainHeights() {
            try {
                return terrain.map(terrainHeight).map(function (height) {
                    return _.round(height, 2);
                });
            } catch (err) {
                console.log('error:', err);
                return [];
            }
        }

        beforeEach(function () {
            this.timeout(40000);
            // only one drop, once, at 1, 1
            var dropped = false;
            terrain.random = function (cell) {
                if (cell.i === 1 && cell.j === 1) {
                    if (!dropped) {
                        dropped = true;
                        return 0;
                    }
                }
                return 1;
            };

        });

        it.only('should change terrain', function (end) {
            this.timeout(12000);
            //   console.log('initial state:');
            //    terrain.erosionReport(100);

            var heights = _terrainHeights();
            console.log('heights: ', heights);
            expect(heights).to.eql([
                10, 25, 40, 40,
                40, 15, 40, 40,
                40, 40, 40, 40,
                40, 40, 40, 40
            ]);

            cycle().then(function () {
                //      console.log('after first cycle: ');
                //      terrain.erosionReport(100);
                var heights = _terrainHeights();
                console.log('heights 1: ', heights);
                expect(heights).to.eql([
                    14.17, 25, 40, 40,
                    40, 14.83, 40, 40,
                    40, 40, 40, 40,
                    40, 40, 40, 40]);

                cycle().then(function () {
                    console.log('after second cycle:  removing water');
                    terrain.each(function (cell) {
                        cell.water = 0;
                    });
                    //       terrain.erosionReport(100);

                    var heights = _terrainHeights();
                    console.log('heights 2: ', heights);

                    expect(heights).to.eql([
                        10.91, 25, 40, 40,
                        40, 14.09, 40, 40,
                        40, 40, 40, 40,
                        40, 40, 40, 40
                    ]);
                    end();
                }, function (err2) {
                    console.log('cycle err 2', err2);
                });
            }, function (err) {
                console.log('cycle err:', err);
            });
        });

    });
});