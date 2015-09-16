module.exports = function (cell, waterFreq, waterAmount, neighborWaterAmount) {
    if (cell.terrain.random(cell) <= waterFreq) {
        cell.water += waterAmount;
        if (neighborWaterAmount){
            cell.neighbors().forEach(function(n){
                if (!n.meta === 'absent'){
                    n.water2 += neighborWaterAmount;
                }
            })
        }
    }
};