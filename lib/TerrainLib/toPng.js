var PNG = require('node-png').PNG;
var dataOr = require('./../dataOr');
var fs = require('fs');
module.exports = {

    toPng: function (filePath, config, done) {
        var min = dataOr('min', config, 0);
        var max = dataOr('max', config, 100);
        var range = max - min;

        var png = new PNG({
            width: this.iSize,
            height: this.jSize
        });
        console.log('png length: ', png.data.length);

            this.each(function (cell) {
                var offset = ((cell.i * this.jSize) + cell.j) * 4;
                var value = 255 * (cell.height() - min) / range;
                value = Math.max(0, Math.min(255, value));
                console.log('offset:', offset, 'value, ', value);
                value = Math.floor(value);
                png.data[offset] = value;
                png.data[offset + 1] = value;
                png.data[offset + 2] = value;
                png.data[offset + 3] = 255;
            });
            console.log('data: ', png.data);
            var stream = fs.createWriteStream(filePath);
            png.pack().pipe(stream);
            stream.on('close', done);

    }

};