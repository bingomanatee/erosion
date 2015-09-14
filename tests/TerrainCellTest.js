var chai = require('chai');
var expect = chai.expect;
var fs = require('fs');
var path = require('path');

var TerrainCell = require('./../lib/TerrainCell');
var Terrain = require('./../lib/Terrain');
var _ = require('lodash');

describe('TerrainCell', function(){
    var cell;

    beforeEach(function(){
        cell = new TerrainCell({}, 0, 0, 5);
    });

    describe('#height', function(){
        it('should reflect current height', function(){
            expect(cell.height()).to.eql(5);
        });

        it('should not reflect sed or water', function(){
            cell.water = 2;
            cell.sed = 2;
            expect(cell.height()).to.eql(5);
        });
    });

    describe('totalHeight', function(){
        it('should reflect current height', function(){
            expect(cell.totalHeight()).to.eql(5);
        });

        it('should not reflect sed or water', function(){
            cell.water = 2;
            cell.sed = 2;
            expect(cell.totalHeight()).to.eql(9);
        });

        describe('with pending changes', function(){
            beforeEach(function(){
                cell.water = 2;
                cell.sed = 2;
                cell.water2 = 2;
                cell.sed2 = 2;
            });

            it('should reflect current height', function(){
                expect(cell.totalHeight()).to.eql(9);
            });

            it('should reflect current height with pending changes', function(){
                expect(cell.totalHeight(true)).to.eql(13);
            });
        })
    });

});