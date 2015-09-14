module.exports = function (cell) {
    if (cell.water2 || cell.sed2){
        cell.water += cell.water2;
        cell.water2 = 0;
        cell.sed += cell.sed2;
        cell.sed2 = 0;
    }
};