var _ = require('lodash');

module.exports = function(cell, waterFreq, waterAmount, neighborWaterAmount) {
    if (cell.terrain.random(cell) <= waterFreq) {
        cell.water += waterAmount;
        if (neighborWaterAmount) {
            var ns = cell.neighbors();
            ns.forEach(function(n) {
                if (!(n.meta === 'absent')) {
                    n.water2 += neighborWaterAmount;
                    if (neighborWaterAmount >= 1) {
                        n.neighbors().forEach(function(nn) {
                            if (nn === cell) {
                                return;
                            }
                            if (!(nn.meta === 'absent')) {
                                nn.water2 += neighborWaterAmount / 4;
                            }
                        });
                    }
                }
            })
        }
    }
};