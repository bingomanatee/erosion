var StateMachine = require('javascript-state-machine');

module.exports = {
    initState: function () {
        this.state = StateMachine.create({
            initial: 'new',
            events: [
                {name: 'loadingWorkers', from: 'new', to: 'loadingworkers'},
                {name: 'workersReady', from: 'loadingworkers', to: 'workersready'},
                {name: 'workerError', from: '*', to: 'workererror'}
            ],

            callbacks: {
                onenterworkersready: function () {
                    console.log("ALL WORKERS READY!!!!!");
                }
            }

        });
    }
};