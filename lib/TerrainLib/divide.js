

module.exports = function (number) {
    var Terrain = require('./../Terrain');
    if (isNaN(number)) {
        throw new Error('bad divide prompt:' + number);
    }
    //  console.log('dividing', this.toString(), 'by', number);
    var iSize1, iSize2, jSize1, jSize2;
    var iStart1, iStart2, jStart1, jStart2;

    if (number == 1) {
        return [this];
    }

    iStart1 = jStart1 = 0;
    iStart2 = jStart2 = 0;
    jSize1 = jSize2 = this.jSize;
    iSize1 = iSize2 = this.iSize;

    if (this.iSize <= this.jSize) {
        jSize1 = jStart2 = Math.floor(this.jSize / 2);
        jSize2 = this.jSize - jSize1;
    } else {
        iSize1 = iStart2 = Math.floor(this.iSize / 2);
        iSize2 = this.iSize - iSize1;
    }

    //    console.log('size: ', this.iSize, this.jSize);

    //    console.log('iStart1', iStart1, 'jStart1:' , jStart1, 'iSize1', iSize1 ,'jSize1:', jSize1);
    //    console.log('iStart2', iStart2, 'jStart2:' , jStart2, 'iSize2', iSize2 ,'jSize2:', jSize2);
    var terrain1 = new Terrain(iSize1, jSize1,
      this.slice(iStart1, jStart1, iSize1, jSize1),
      this.iStart,
      this.jStart);
    var terrain2 = new Terrain(iSize2, jSize2,
      this.slice(iStart2, jStart2, this.iSize, this.jSize),
      iStart2 + this.iStart,
      jStart2 + this.jStart);

    var divide1 = Math.floor(number / 2);
    var divide2 = number - divide1;

    return terrain1.divide(divide1).concat(terrain2.divide(divide2));
};