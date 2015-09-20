var _ = require('lodash');

module.exports = function (cell, waterFreq, waterAmount, neighborWaterAmount, noScale) {
    if (cell.terrain.random(cell) <= waterFreq) {
        if (!noScale) {
            waterAmount *= Math.max(Math.random(), Math.random());
        }
        neighborWaterAmount *= Math.max(Math.random(), Math.random());
        cell.water += waterAmount;
        if (neighborWaterAmount) {
            var ns = cell.neighbors();
            ns.forEach(function (n) {
                if (!(n.meta === 'absent') && (!(n.meta === 'bounds'))) {
                    n.water += neighborWaterAmount;
                    if (neighborWaterAmount >= 1) {
                        n.neighbors().forEach(function (nn) {
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