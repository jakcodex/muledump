//  JTimer v0.1.1

class JTimer {

    constructor(options) {

        //  set default properties
        this.state = 'init';
        this.options = {};
        this.historyData = [];
        this.track = {
            init: new Date,
            start: undefined,
            stop: undefined
        };

        //  options definition
        this.optionsTemplate = {
            name: {types: ['string'], required: true, default: 'JTimerDefault'},
            autoStart: {types: ['boolean'], default: true},
            verbose: {types: ['boolean']},
            startCallback: {types: ['function']},
            stopCallback: {types: ['function']},
            custom: {types: ['object']},
            plugins: {types: ['object'], array: true},
            pluginsOptions: {types: ['object']}
        };

        //  process options options
        try {

            if (typeof options !== 'object') options = {};

            //  specify default values
            var defaultValues = Object.keys(this.objFilter(this.optionsTemplate, function(key, value) {
                return ( typeof value.default !== 'undefined' );
            }));
            for ( var j = 0; j < defaultValues.length; j++ )
                if ( typeof options[defaultValues[j]] === 'undefined' )
                    options[defaultValues[j]] = this.optionsTemplate[defaultValues[j]].default;

            //  check for required options
            var requiredOptions = Object.keys(this.objFilter(this.optionsTemplate, function(key, value) {
                return ( value.required === true );
            }));
            for ( var x = 0; x < requiredOptions.length; x++ )
                if ( typeof options[requiredOptions[x]] === 'undefined' ) throw 'Option "' + x + '" is required and missing.';

            //  validate input options
            for (var i in options) {

                if (options.hasOwnProperty(i)) {

                    if (typeof this.optionsTemplate[i] === 'undefined') throw 'Option "' + i + '" is not recognized.';

                    //  we might encounter an array as being valid which the standard typeof test doesn't account for
                    if (
                        typeof this.optionsTemplate[i].types === 'object' &&
                        this.optionsTemplate[i].types.indexOf(typeof options[i]) === -1 &&
                        (
                            this.optionsTemplate[i].array !== true ||
                            (
                                this.optionsTemplate[i].array === true &&
                                Array.isArray(options[i]) === false
                            )
                        )
                    ) throw 'Option "' + i + '" is not a valid type.';

                }

            }

            //  create and validate aggregate if requested
            if ( Array.isArray(options.plugins) === true )
                for ( var j = 0; j < options.plugins.length; j++ ) {
                    if (typeof options.plugins[j] === 'string') {

                        /*/
                        //  Internal Plugin Loading
                        //  Update the custom plugin section with your own data
                        /*/

                        //  cannot dynamically load classes
                        if ( options.plugins[j] === 'aggregate' ) {
                            options.plugins[j] = new JTimerAggregate(this, ( (typeof options.pluginsOptions === 'object') ? options.pluginsOptions[options.plugins[j]] : undefined));
                        } else if ( options.plugins[j] === 'MyCustomPlugin' ) {
                            //  options.plugins[j] = new MyCustomPlugin(...);
                        } else throw "Unrecognized plugin - " + options.plugins[j];

                    } else if (typeof options.plugins[j] !== 'object') throw "Provided plugin was not a valid object at index " + j;
                }

        } catch(e) {

            this.state = 'error';
            this.error = e;
            if ( ['string', 'number', 'boolean', 'object'].indexOf(typeof e) === -1 ) throw 'JTimer/Error - ' + this.options.name + ' - invalid error message';
            console.error('JTimer/Error - ' + ( this.options.name || 'Unknown') + ' - ' + e);
            return;

        }

        //  save our options
        this.options = options;

        //  start timer
        this.state = 'ready';
        if ( this.options.autoStart === true ) this.start();

    }

    //  filter provided object
    objFilter(object, expect, callback) {

        //  argument shortcut
        if ( typeof expect === 'function' ) {
            callback = expect;
            expect = true;
        }

        //  run the comparison
        var list = {};
        for ( var i in object )
            if ( object.hasOwnProperty(i) )
                if ( callback(i, object[i]) === expect )
                    list[i] = object[i];
        return list;

    }

    //  record a history message for the timer
    history(message, data) {

        try {
            if (this.state === 'error') throw 'Timer is not eligible to start.';
        } catch(e) {
            this.catchError(e);
            return;
        }

        if ( this.options.verbose === true ) {

            var historyObject = {
                t: new Date,
                m: message,
                d: data || null
            };
            this.historyData.push(historyObject);

        }

    }

    //  start a timer and any startup callbacks
    start(callback) {

        try {
            if (['ready', 'done'].indexOf(this.state) === -1 ) throw 'Timer is not eligible to start.';
        } catch(e) {

            this.error = e;
            if ( ['string', 'number', 'boolean', 'object'].indexOf(typeof e) === -1 ) throw 'JTimer/Error - ' + this.options.name + ' - invalid error message';
            console.error('JTimer/Error - ' + ( this.options.name || 'Unknown') + ' - ' + e);
            return;

        }

        if ( typeof callback === 'function' ) this.options.startCallback = callback;
        this.state = 'running';
        this.error = undefined;
        this.history('Timer is starting');
        this.track.stop = undefined;
        this.track.start = performance.now() || Date.now();
        if ( typeof this.options.startCallback === 'function' ) this.options.startCallback(this);

    }

    //  stop a timer and run any stop callbacks
    stop(callback) {

        try {
            if (this.state !== 'running') throw 'Timer is not running.';
        } catch(e) {

            this.error = e;
            if ( ['string', 'number', 'boolean', 'object'].indexOf(typeof e) === -1 ) throw 'JTimer/Error - ' + this.options.name + ' - invalid error message';
            console.error('JTimer/Error - ' + ( this.options.name || 'Unknown') + ' - ' + e);
            return;

        }

        this.track.stop = performance.now() || Date.now();
        if ( typeof callback === 'function' ) this.options.stopCallback = callback;
        this.state = 'done';
        this.error = undefined;
        this.runtime = Math.round(this.track.stop-this.track.start);
        this.history('Timer is finished - ' + this.runtime);

        //  run timer plugins
        if ( Array.isArray(this.options.plugins) === true )
            for ( var i = 0; i < this.options.plugins.length; i++ )
                if ( typeof this.options.plugins[i].callback === 'function' )
                    ( this.options.plugins[i].timer instanceof JTimer ) ?
                        this.options.plugins[i].callback() :
                        this.options.plugins[i].callback(this);

        //  run the stopCallback
        if ( typeof this.options.stopCallback === 'function' ) this.options.stopCallback(this);

        //  return the runtime
        return this.runtime;

    }

    //  restart a timer
    restart(startCallback) {

        try {
            if (['cancelled', 'done', 'running'].indexOf(this.state) === -1) throw 'Timer cannot be restarted.';
        } catch(e) {

            this.error = e;
            if ( ['string', 'number', 'boolean', 'object'].indexOf(typeof e) === -1 ) throw 'JTimer/Error - ' + this.options.name + ' - invalid error message';
            console.error('JTimer/Error - ' + ( this.options.name || 'Unknown') + ' - ' + e);
            return;

        }

        this.state = 'ready';
        this.error = undefined;
        this.track.start = undefined;
        this.track.stop = undefined;
        this.history('Restarting');
        this.start(startCallback);

    }

    //  stop a timer without performing any callbacks or runtime calculations
    cancel() {

        try {
            if ( ['init', 'running'].indexOf(this.state) === -1 ) throw 'Timer is not ready or running.';
        } catch(e) {

            this.error = e;
            if ( ['string', 'number', 'boolean', 'object'].indexOf(typeof e) === -1 ) throw 'JTimer/Error - ' + this.options.name + ' - invalid error message';
            console.error('JTimer/Error - ' + ( this.options.name || 'Unknown') + ' - ' + e);
            return;

        }

        this.track.stop = performance.now() || Date.now();
        this.state = 'cancelled';
        this.error = undefined;
        this.history('Cancelled');

    }

}

//  collects results from many timers and calculates averages
class JTimerAggregate {

    //  calculate the sample statistics
    run() {

        //  prepare for calculations
        if ( this.samples.length === 0 ) return;
        this.samples.sort(function(a, b) {
            return (a-b);
        });

        if ( typeof this.options.apdex === 'number' ) this.apdex = {satisfied: 0, tolerated: 0, frustrated: 0};

        //  calculate the new average
        this.average = 0;
        for ( var i = 0; i < this.samples.length; i++ ) {

            this.average = this.average + this.samples[i];

            //  calculate apdex if configured
            if ( typeof this.options.apdex === 'number' ) {

                if ( this.samples[i] <= this.options.apdex ) {
                    this.apdex.satisfied++;
                } else if ( (this.samples[i] > this.options.apdex) && (this.samples[i] <= (this.options.apdex*4)) ) {
                    this.apdex.tolerated++;
                } else this.apdex.frustrated++;

            }

        }

        this.average = this.round(this.average/this.samples.length);
        this.mean = this.average;

        //  calculate the sample median
        this.median = this.samples[(Math.ceil(this.samples.length/2)-1)];

        //  gather other stats
        this.max = this.samples[this.samples.length-1];
        this.min = this.samples[0];

        //  calculate 95th percentile
        this.percentiles = {
            '99': this.samples[this.samples.length-Math.ceil(this.samples.length*0.01)] || 0,
            '95': this.samples[this.samples.length-Math.ceil(this.samples.length*0.05)] || 0,
            '80': this.samples[this.samples.length-Math.ceil(this.samples.length*0.2)] || 0,
            '50': this.samples[this.samples.length-Math.ceil(this.samples.length*0.5)] || 0,
            '20': this.samples[this.samples.length-Math.ceil(this.samples.length*0.8)] || 0,
            '10': this.samples[this.samples.length-Math.ceil(this.samples.length*0.9)] || 0,
            '5': this.samples[this.samples.length-Math.ceil(this.samples.length*0.95)] || 0,
            '1': this.samples[this.samples.length-Math.ceil(this.samples.length*0.99)] || 0
        };

        //  calculate the range
        this.range = this.max-this.min;

        //  finish apdex calculations
        if ( typeof this.apdex === 'object' ) {

            this.apdex.score = this.round((this.apdex.satisfied+(this.apdex.tolerated/2))/this.samples.length, 2);
            if ( this.options.negative === true ) this.apdex.score = this.round((this.apdex.frustrated+(this.apdex.tolerated/2))/this.samples.length, 2);

        }

    }

    //  build the timer aggregate
    constructor(timer, options) {

        this.options = options;
        if ( typeof timer === 'object' && !(timer instanceof JTimer) ) {

            this.options = timer;
            timer = undefined;

        }

        if ( typeof this.options !== 'object' ) this.options = {};

        try {

            if ( typeof this.options !== 'object' ) throw 'Supplied options is not a valid type';

            //  automatically run the aggregate if a timer is supplied
            if ( typeof timer === 'object' && !(timer instanceof JTimer) ) throw "Supplied timer is not a valid timer";

        } catch (e) {

            this.state = 'error';
            this.error = e;
            if ( ['string', 'number', 'boolean', 'object'].indexOf(typeof e) === -1 ) throw 'JTimerAggregate/Error - ' + timer.options.name + ' - invalid error message';
            console.error('JTimerAggregate/Error - ' + ( timer.options.name || 'Unknown') + ' - ' + e);
            return;

        }

        this.timer = timer;
        this.samples = [];

    }

    //  receive a timer callbackup
    callback(timer) {

        try {

            if ( timer instanceof JTimer ) {

                //  state must be done
                if ( this.timer instanceof JTimer ) throw "Timer was supplied at construction";
                this.timer = timer;

            } else this.timer = {options:{}};

            //  state must be done
            if ( this.timer.state !== 'done' ) throw "Supplied timer is not in a valid state";

        } catch (e) {

            this.state = 'error';
            this.error = e;
            if ( ['string', 'number', 'boolean', 'object'].indexOf(typeof e) === -1 ) throw 'JTimerAggregate/Error - ' + this.timer.options.name + ' - invalid error message';
            console.error('JTimerAggregate/Error - ' + ( this.timer.options.name || 'Unknown') + ' - ' + e);
            return;

        }

        //  push the new sample
        this.samples.push(this.timer.runtime);
        this.run();

        //  remove the timer if it was provided at runtime
        if ( timer instanceof JTimer ) delete this.timer;

    }

    //  precision rounding
    round(number, precision) {

        if ( typeof precision !== 'number' ) precision = this.options.precision;
        if ( typeof precision !== 'number' ) precision = 0;
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;

    }

}

//  integrate timer with universal analytics user page timing
class JTimerUATiming {

    //  calculate the sample average
    run() {

        //  your code to process the samples
        //  this.samples contains all recorded values
        //  if running JTimer with an internal plugin, this.timer is accessible here

    }

    //  build the timer aggregate
    constructor(timer, options) {

        this.options = options;
        if ( typeof timer === 'object' && !(timer instanceof JTimer) ) {

            this.options = timer;
            timer = undefined;

        }

        if ( typeof this.options !== 'object' ) this.options = {};

        try {

            if ( typeof this.options !== 'object' ) throw 'Supplied options is not a valid type';

            //  automatically run the aggregate if a timer is supplied
            if ( typeof timer === 'object' && !(timer instanceof JTimer) ) throw "Supplied timer is not a valid timer";

        } catch (e) {

            this.state = 'error';
            this.error = e;
            if ( ['string', 'number', 'boolean', 'object'].indexOf(typeof e) === -1 ) throw 'TimerPlugin/Error - invalid error message';
            console.error(e);
            return;

        }

        this.timer = timer;
        this.samples = [];

    }

    //  receive a timer callbackup
    callback(timer) {

        try {

            if ( timer instanceof JTimer ) {

                //  state must be done
                if ( this.timer instanceof JTimer ) throw "Timer was supplied at construction";
                this.timer = timer;

            } else this.timer = {options:{}};

            //  state must be done
            if ( this.timer.state !== 'done' ) throw "Supplied timer is not in a valid state";

        } catch (e) {

            this.state = 'error';
            this.error = e;
            if ( ['string', 'number', 'boolean', 'object'].indexOf(typeof e) === -1 ) throw 'Plugin/Error - ' + this.timer.options.name + ' - invalid error message';
            console.error('Plugin/Error - ' + ( this.timer.options.name || 'Unknown') + ' - ' + e);
            return;

        }

        //  push the new sample
        this.samples.push(this.timer.runtime);
        this.calculate();

        //  remove the timer if it was provided at runtime
        if ( timer instanceof JTimer ) delete this.timer;

    }

    //  precision rounding
    round(number, precision) {

        if ( typeof precision !== 'number' ) precision = this.options.precision;
        if ( typeof precision !== 'number' ) precision = 0;
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;

    }

}
