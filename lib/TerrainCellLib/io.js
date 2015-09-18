module.exports = {

    updateFromBuffer: function (buffer, fullData) {
        this.height(buffer.readFloatLE());
        if (fullData){
            this.water = buffer.readFloatLE();
            this.sed = buffer.readFloatLE();
        }
    }

}