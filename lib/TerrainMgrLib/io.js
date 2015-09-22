var util = require('util');
var _ = require('lodash');

module.exports = {
    updateFromData: function (result) {
        console.log('updating workers from data: ', util.inspect(result).substr(0, 100));
        _.each(result, function (data) {
            this.masterTerrain.updateData(data[1].data);
        }, this);
    },

    getFeedback: function () {
        return new Promise(function (resolve, reject) {
            this.hub.requestAllWorkers('feedback', {full: !!full}, function (err, results) {
                if (err) {
                    return reject(err);
                }
                this.updateFromData(results);
                resolve(results);
            }.bind(this));
        }.bind(this));
    },
};