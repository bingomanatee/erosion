var PNG = require('node-png').PNG;
var dataOr = require('./../dataOr');
var fs = require('fs');
var q = require('q');
module.exports = {

    toPng: function (filePath, config, done) {
        if (!config) config = {};
        return q.Promise(function(resolve, reject)
        {

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
            stream.on('close', function(){
                if (done) done();
                resolve(true);
            });

        }.bind(this));
    }

};