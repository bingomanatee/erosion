module.exports = function (cell, waterFreq, waterAmount) {
    if (cell.terrain.random(cell) <= waterFreq) {
        cell.water += waterAmount;
    }
};