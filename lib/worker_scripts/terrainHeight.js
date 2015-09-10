module.exports = function terrainHeight(cell) {
    var height = cell.height();

    if (cell.sed) {
        height += cell.sed;
    }
    if (cell.water) {
        height += cell.water;
    }

    return height;
};