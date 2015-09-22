module.exports = {

    toBuffer: function (buffer) {
        buffer.writeInt16LE(this.i);
        buffer.writeInt16LE(this.j);
        buffer.writeFloatLE(this.height());
        buffer.writeFloatLE(this.water);
        buffer.writeFloatLE(this.sed);
    },

    toJSON: function () {
        return {
            i: this.i,
            j: this.j,
            height: this.height()
        };
    },

    snapshot: function () {
        this._snap = {
            height: this.height(),
            water: this.water,
            sed: this.sed
        };
    },

    snapshotToBuffer: function (buffer) {
        if (!this._snap) {
            return buffer;
        }

        var water = this.water - this._snap.water;
        var sed = this.sed - this._snap.sed;
        var height = this.height() - this._snap.height;

        if (water || sed || height) {
            var TerrainCell = require('./../TerrainCell');
            var cell = new TerrainCell({}, this.i, this.j, height, water, sed);
            cell.toBuffer(buffer);
        }

        delete this._snap;

        return buffer;
    }
};