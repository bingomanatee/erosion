var util = require('util');
var _ = require('lodash');

module.exports = {
    updateFromData: function (result, fullData) {
        console.log('updating workers from data: ', util.inspect(result).substr(0, 100));
        _.each(result, function (data) {
            this.masterTerrain.updateData(data[1].data, fullData);
        }, this);
    },

    getFeedback: function (full) {
        return new Promise(function (resolve, reject) {
            this.hub.requestAllWorkers('feedback', {full: !!full}, function (err, results) {
                if (err) {
                    return reject(err);
                }
                this.updateFromData(results, full);
                resolve(results);
            }.bind(this));
        }.bind(this));
    },
};