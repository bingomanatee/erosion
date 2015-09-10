var Terrain = require('./../lib/Terrain');
var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var path = require('path');

describe('Terrain', function () {

    var terrain;

    describe('constructor', function () {

        beforeEach(function () {
            var n = 0;
            terrain = new Terrain(12, 12, function (i, j) {
                return ++n;
            });
        });

        it('should create a terrain with data: ', function () {
            //  console.log('terrain data:', terrain.to2Darray());
            expect(terrain.to2Darray()).to.eql([
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
                [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
                [49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
                [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72],
                [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84],
                [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96],
                [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108],
                [109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120],
                [121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132],
                [133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144]
            ]);
        });
    });

    describe('#to2darray', function () {

        beforeEach(function () {
            var n = 0;
            terrain = new Terrain(4, 4, function (i, j) {
                return ++n;
            });
        });

        it('should return an int array', function () {

            expect(terrain.to2Darray()).to.eql([
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12],
                [13, 14, 15, 16]
            ]);
        });

        it('should return an int array with heads', function () {
            var table = terrain.to2Darray(true);
            expect(table).to.eql([
                ['', 'j:0', 'j:1', 'j:2', 'j:3'],
                ['i:0', 1, 2, 3, 4],
                ['i:1', 5, 6, 7, 8],
                ['i:2', 9, 10, 11, 12],
                ['i:3', 13, 14, 15, 16]
            ]);
        });
    });

    describe('#slice', function () {

        var terrain;

        beforeEach(function () {
            var n = 0;
            terrain = new Terrain(12, 12, function (i, j) {
                return ++n;
            });
        });

        it('should return a 3 x 3 dataset from zero', function () {
            expect(terrain.slice(0, 0, 3, 3)).to.eql([1, 2, 3, 13, 14, 15, 25, 26, 27])
        });

        it('should return a 4 x 4 dataset from 2, 2', function () {
            expect(terrain.slice(2, 2, 6, 6)).to.eql([27, 28, 29, 30, 39, 40, 41, 42, 51, 52, 53, 54, 63, 64, 65, 66]);
        });

        it('should return a 3 x 3 dataset from 10, 10 with nulls', function () {
            expect(terrain.slice(10, 10, 13, 13)).to.eql([131, 132, null, 143, 144, null, null, null, null]);
        });
    });

    describe('#divide', function () {

        var terrain;

        describe('wide terrain', function () {

            beforeEach(function () {
                var n = 0;
                terrain = new Terrain(8, 10, function (i, j) {
                    return ++n;
                });

                //    console.log('terrain data');
                //     console.log(terrain.to2Darray());
            });

            describe('divide wide terrain in 3', function () {
                var terrains;

                beforeEach(function () {
                    terrains = terrain.divide(3);
                });

                //console.log('terrain 0');
                //console.log(terrains[0].to2Darray());
                //
                //console.log('terrain 1');
                //console.log(terrains[1].to2Darray());
                //
                //console.log('terrain 2');
                //console.log(terrains[2].to2Darray());

                it('should have the proper data for the first slice', function () {
                    expect(terrains[0].to2Darray()).to.eql([
                        [1, 2, 3, 4, 5],
                        [11, 12, 13, 14, 15],
                        [21, 22, 23, 24, 25],
                        [31, 32, 33, 34, 35],
                        [41, 42, 43, 44, 45],
                        [51, 52, 53, 54, 55],
                        [61, 62, 63, 64, 65],
                        [71, 72, 73, 74, 75]
                    ]);
                    expect(terrains[0].iStart).to.eql(0);
                    expect(terrains[0].jStart).to.eql(0);
                });

                it('should have the proper data for the second slice', function () {
                    expect(terrains[1].to2Darray()).to.eql([
                        [6, 7, 8, 9, 10],
                        [16, 17, 18, 19, 20],
                        [26, 27, 28, 29, 30],
                        [36, 37, 38, 39, 40]
                    ]);
                    expect(terrains[1].iStart).to.eql(0);
                    expect(terrains[1].jStart).to.eql(5);
                });

                it('should have proper data for the third slice', function () {
                    expect(terrains[2].to2Darray()).to.eql([
                        [46, 47, 48, 49, 50],
                        [56, 57, 58, 59, 60],
                        [66, 67, 68, 69, 70],
                        [76, 77, 78, 79, 80]
                    ]);
                    expect(terrains[2].iStart).to.eql(4);
                    expect(terrains[2].jStart).to.eql(5);
                });
            });

            it('should divide deep terrain in 2', function () {

                var terrains = terrain.divide(2);

                // console.log('terrain 0');
                // console.log(terrains[0].to2Darray());
                expect(terrains[0].to2Darray()).to.eql([
                      [1, 2, 3, 4, 5],
                      [11, 12, 13, 14, 15],
                      [21, 22, 23, 24, 25],
                      [31, 32, 33, 34, 35],
                      [41, 42, 43, 44, 45],
                      [51, 52, 53, 54, 55],
                      [61, 62, 63, 64, 65],
                      [71, 72, 73, 74, 75]
                  ]
                );

                //   console.log('terrain 1');
                //   console.log(terrains[1].to2Darray());
                expect(terrains[1].to2Darray()).to.eql([
                      [6, 7, 8, 9, 10],
                      [16, 17, 18, 19, 20],
                      [26, 27, 28, 29, 30],
                      [36, 37, 38, 39, 40],
                      [46, 47, 48, 49, 50],
                      [56, 57, 58, 59, 60],
                      [66, 67, 68, 69, 70],
                      [76, 77, 78, 79, 80]
                  ]
                );
            });
        });

        describe('deep terrain', function () {

            beforeEach(function () {
                var n = 0;
                terrain = new Terrain(8, 4, function (i, j) {
                    return ++n;
                });

                //   console.log('terrain data');
                //  console.log(terrain.to2Darray());
            });

            it('should divide wide terrain in 2', function () {

                var terrains = terrain.divide(2);

                //   console.log('terrain 0');
                //   console.log(terrains[0].to2Darray());
                expect(terrains[0].to2Darray()).to.eql([
                    [1, 2, 3, 4],
                    [5, 6, 7, 8],
                    [9, 10, 11, 12],
                    [13, 14, 15, 16]
                ]);

                //   console.log('terrain 1');
                //   console.log(terrains[1].to2Darray());
                expect(terrains[1].to2Darray()).to.eql(
                  [
                      [17, 18, 19, 20],
                      [21, 22, 23, 24],
                      [25, 26, 27, 28],
                      [29, 30, 31, 32]
                  ]);
            });
        });

    });

    describe('#imax/jMax', function () {
        var terrain;
        beforeEach(function () {
            terrain = new Terrain(4, 5, 10, 8, 15);
        });

        it('should have max', function () {
            expect(terrain.iMax()).to.eql(11);
        });

        it('should have jMax', function () {
            expect(terrain.jMax()).to.eql(19);
        });
    });

    describe('#data', function () {
        var terrain2;

        beforeEach(function () {
            var n = 0;
            terrain = new Terrain(4, 4, function (i, j) {
                return ++n;
            });

            terrain2 = Terrain.fromData(terrain.toData());
        });

        it('should copy data perfectly', function () {
            expect(terrain2.to2Darray()).to.eql(terrain.to2Darray());
        });

    });

    describe('#dataSummary', function () {
        it('should produce a table out of data', function () {
            var n = 0;
            terrain = new Terrain(10, 10, function (i, j) {
                return ++n;
            });

            var summary = terrain.dataSummary(8, {
                chars: {
                    'top': '#', 'top-mid': '#', 'top-left': '#', 'top-right': '#'
                    , 'bottom': '#', 'bottom-mid': '#', 'bottom-left': '#', 'bottom-right': '#'
                    , 'left': '#', 'left-mid': '#', 'mid': '#', 'mid-mid': '#'
                    , 'right': '#', 'right-mid': '#', 'middle': '#'
                }
            });
          //  console.log('summary:', "\n", summary);
            var fpath = path.resolve(__dirname, '../test_scripts/dataSummary.txt');
          //  fs.writeFileSync(fpath, summary, 'utf8');

            expect(summary)
              .to.eql(fs.readFileSync(fpath, 'utf8'));
        });
    });

    describe('#neighborCells', function () {
        var neighbors;

        beforeEach(function () {
            var n = 0;
            terrain = new Terrain(4, 4, function (i, j) {
                return ++n;
            });
        });

        describe('should get corner neighbors', function () {
            var data;

            beforeEach(function () {
                neighbors = terrain.neighborCells(0, 0);
            });

            it('should have the right data', function () {
                data = neighbors.map(function (n) {
                    return {i: n.i, j: n.j, height: n.height()};
                });
                expect(data).to.eql([
                    {i: -1, j: -1, height: null},
                    {i: -1, j: 0, height: null},
                    {i: -1, j: 1, height: null},
                    {i: 0, j: -1, height: null},
                    {i: 0, j: 1, height: 2},
                    {i: 1, j: -1, height: null},
                    {i: 1, j: 0, height: 5},
                    {i: 1, j: 1, height: 6}
                ]);
            });

            it('should reflect bounds cells in corner', function () {

                terrain.setBounds([
                    {i: -1, j: -1, value: 100},
                    {i: -1, j: 0, value: 150},
                    {i: -1, j: 1, value: 200},
                    {i: 0, j: -1, value: 250},
                    {i: 1, j: -1, value: 300}
                ]);
                data = neighbors.map(function (n) {
                    return {i: n.i, j: n.j, height: n.height()};
                });
                expect(data).to.eql(
                  [
                      {i: -1, j: -1, height: 100},
                      {i: -1, j: 0, height: 150},
                      {i: -1, j: 1, height: 200},
                      {i: 0, j: -1, height: 250},
                      {i: 0, j: 1, height: 2},
                      {i: 1, j: -1, height: 300},
                      {i: 1, j: 0, height: 5},
                      {i: 1, j: 1, height: 6}
                  ]
                );
            })
        });

        describe('should get middle neighbors', function () {
            var data;

            beforeEach(function () {
                neighbors = terrain.neighborCells(1, 1);
                data = neighbors.map(function (n) {
                    return {i: n.i, j: n.j, height: n.height()};
                });
            });

            it('should have the right data', function () {
                expect(data).to.eql([
                    {i: 0, j: 0, height: 1},
                    {i: 0, j: 1, height: 2},
                    {i: 0, j: 2, height: 3},
                    {i: 1, j: 0, height: 5},
                    {i: 1, j: 2, height: 7},
                    {i: 2, j: 0, height: 9},
                    {i: 2, j: 1, height: 10},
                    {i: 2, j: 2, height: 11}
                ]);
            });
        });
    });

    describe('#toPNG', function(){

        beforeEach(function(){
            terrain = new Terrain(40, 40, function(i, j){
                return (i * j);
            });
        });

        it('should write a PNG', function(done){
            terrain.toPng(path.resolve(__dirname, '../test_scripts/pngOut.png'), {min: 0, max: (40 * 40/2)}, done);
        });
    })
});