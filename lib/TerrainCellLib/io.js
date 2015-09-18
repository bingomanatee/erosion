module.exports = {

    updateFromBuffer: function (buffer, fullData) {
        this.height(buffer.readFloatLE());
        if (fullData){
            this.sed = buffer.readFloatLE();
            this.water = buffer.readFloatLE();
        }
    }

}