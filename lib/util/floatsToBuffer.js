module.exports = function arrayOfFloatsToBuffer(data, offset){
    if (!offset) offset = 0;
    var buffer = new Buffer(offset + data.length * 4);
    for (var n = 0; n < data.length; ++n){
        buffer.writeFloatLE(data[n], offset + 4 * n);
    }
    return buffer;
};