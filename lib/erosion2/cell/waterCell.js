var _ = require('lodash');

module.exports = function(cell, waterFreq, waterAmount, neighborWaterAmount) {
    if (cell.terrain.random(cell) <= waterFreq) {
        var scale = Math.max(Math.random(), Math.random());
        waterAmount *= scale;
        neighborWaterAmount *= scale;
        cell.water += waterAmount;
        if (neighborWaterAmount) {
            var ns = cell.neighbors();
            ns.forEach(function(n) {
                if (!(n.meta === 'absent') && (!(n.meta === 'bounds'))) {
                    n.water += neighborWaterAmount;
                    if (neighborWaterAmount >= 1) {
                        n.neighbors().forEach(function(nn) {
                            if ((!(nn === cell)) && !(nn.meta === 'absent')) {
                                nn.water += neighborWaterAmount / 4;
                            }
                        });
                    }
                }
            })
        }
    }
};