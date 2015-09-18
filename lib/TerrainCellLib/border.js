var SmartBuffer = require('smart-buffer');

module.exports = {
    encodeBorderUpdates: function (buffer) {
        buffer.writeInt16LE(this.i);
        buffer.writeInt16LE(this.j);
        buffer.writeFloatLE(this.heightStart);
        buffer.writeFloatLE(this.waterStart);
        buffer.writeFloatLE(this.sedStart);
    },

    initBorderChange: function () {
        this.heightStart = this.height;
        this.waterStart = this.water;
        this.sedStart = this.sed;
    },

    recordBorderChange: function (buffer) {
        var heightChange = this.height() - this.heightStart;
        var waterChange = this.water - this.waterStart;
        var sedChange = this.sed - this.sedStart;

        if (heightChange || waterChange || sedChange) {
            buffer.writeInt16LE(this.i);
            buffer.writeInt16LE(this.j);
            buffer.writeFloatLE(this.heightChange);
            buffer.writeFloatLE(this.waterChange);
            buffer.writeFloatLE(this.sedChange);
        }
    }
};