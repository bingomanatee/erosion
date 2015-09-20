var PNG = require('node-png').PNG;
var dataOr = require('./../dataOr');
var fs = require('fs');
var q = require('q');
var Canvas = require('canvas');
var Stats = require('fast-stats').Stats;
var Color = require('color');

var RANGE = 1.5;

function _scaleByStat(value, mean, dev) {
    var min, max, range;

    if (arguments.length == 3) {
        min = mean - RANGE * dev;
        range = RANGE * 2 * dev;
        return (value - min) / range;
    } else {
        max = 2 * mean;
        return value / max;
    }
}

function _g(value) {
    return Math.max(0, Math.min(255, Math.round(255 * value)));
}

function _c(r, g, b) {
    if (arguments.length == 1) {
        b = g = r;
    }
    return Color().rgb(r, g, b);
}

module.exports = {
    toMultiPng: function (filePath, pixelSize, swSize) {
        return new Promise(function (resolve, reject) {

            pixelSize = Math.max(2, pixelSize);
            swSize = Math.min(swSize, pixelSize/2);
            console.log('drawing multiPing ', filePath, pixelSize, swSize);
            var canvas = new Canvas(this.iSize * pixelSize, this.jSize * pixelSize);
            var ctx = canvas.getContext('2d');

            var heightStat = new Stats();
            var waterStat = new Stats();
            var sedStat = new Stats();

            this.each(function (cell) {
                heightStat.push(cell.height());
                waterStat.push(cell.water);
                sedStat.push(cell.sed);
            });

            var heightMean = heightStat.amean().toFixed(2);
            var heightSTdev = heightStat.stddev();
            var waterMean = waterStat.amean();
            var waterSTdev = waterStat.stddev();
            var sedMean = sedStat.amean();
            var sedSTdev = sedStat.stddev();

            this.each(function (cell) {
                var heightValue = _scaleByStat(cell.height(), heightMean, heightSTdev);
                var grey = _g(heightValue);
                ctx.fillStyle = _c(grey, grey, grey).rgbaString();
                //  console.log('height:', cell.height(), 'color:', ctx.fillStyle, heightValue, heightMean, heightSTdev);
                var x = (cell.i - this.iStart) * pixelSize;
                var y = (cell.j - this.jStart) * pixelSize;
                ctx.fillRect(x, y, pixelSize, pixelSize);

                heightValue = _scaleByStat(cell.sed, sedMean);
                var red = _g(heightValue);
                ctx.fillStyle = _c(red, 0, 0).rgbaString();
                //  console.log('height:', cell.height(), 'color:', ctx.fillStyle, heightValue, heightMean, heightSTdev);
                ctx.fillRect(x, y, swSize, swSize);

                heightValue = _scaleByStat(cell.water, waterMean);
                var blue = _g(heightValue);
                ctx.fillStyle = _c(0, 0, blue).rgbaString();
                //  console.log('height:', cell.height(), 'color:', ctx.fillStyle, heightValue, heightMean, heightSTdev);
                ctx.fillRect(x + swSize, y + swSize, swSize, swSize);

            }.bind(this));

            var out = fs.createWriteStream(filePath)
                , stream = canvas.pngStream();

            stream.on('data', out.write.bind(out));

            stream.on('end', resolve);
        }.bind(this));
    },

    toPng: function (filePath, config) {
        if (!config) {
            config = {};
        }
        return q.Promise(function (resolve, reject) {

            var min = dataOr('min', config, 0);
            var max = dataOr('max', config, 100);
            var range = max - min;

            var png = new PNG({
                width: this.iSize,
                height: this.jSize
            });

            this.each(function (cell) {
                var offset = ((cell.i * this.jSize) + cell.j) * 4;
                var value = 255 * (cell.height() - min) / range;
                value = Math.max(0, Math.min(255, value));
                value = Math.floor(value);
                png.data[offset] = value;
                png.data[offset + 1] = value;
                png.data[offset + 2] = value;
                png.data[offset + 3] = 255;
            });
            // console.log('data: ', png.data);
            var stream = fs.createWriteStream(filePath);
            png.pack().pipe(stream);
            stream.on('close', function () {
                resolve(true);
            });

        }.bind(this));
    }

};