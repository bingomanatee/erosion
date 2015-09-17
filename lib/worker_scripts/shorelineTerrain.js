var perlin = require('perlin-noise');
var Terrain = require('./../Terrain');
var path = require('path');
var SimplexNoise = require('simplex-noise');

var K1 = 4;
var K2 = 18;
var K3 = 30;

var R1 = 50;
var R2 = 12;
var R3 = 5;
var DIV = (R1 + R2 + R3);
var MOUNTAIN_HEIGHT = 100;

module.exports = function shorelineTerrain(width, height) {

    var simplex = new SimplexNoise(Math.random);
    var simplex2 = new SimplexNoise(Math.random);
    var simplex3 = new SimplexNoise(Math.random);

    var ter = new Terrain(width, height, function (i, j, I, J) {
        var s1 = simplex.noise2D(i * K1 / I, j * K1 / J) * R1;
        var s2 = simplex2.noise2D(i * K2 / I, j * K2 / J) * R2;
        var s3 = simplex3.noise2D(i * K3 / I, j * K3 / J) * R3;

       var shoreHeight = 3 *(J/2 - j)/J;

            shoreHeight += Math.random() * 0.025;

        return MOUNTAIN_HEIGHT * ((shoreHeight +  (J - j * 1.2)/J *( s1 + s2 + s3) / DIV) + 1)/4;
    });

    return new Promise(function (resolve, reject) {
        ter.toPng(path.resolve(__dirname, '../../test_scripts/shoreline.png'), {
            max: MOUNTAIN_HEIGHT, min: 0
        }).then(function(){
            console.log('done with png');
            resolve(ter);
        }, function(err){
            console.log('error:', err);
            reject(err);
        });
    });
}