//  lock an element to a position when scrolling
class Muledump_ElementScrollLock {

    constructor(track, hook, config) {

        if ( typeof track === 'undefined' ) throw 'Track selector is invalid';
        if ( typeof hook === 'undefined' ) throw 'Hook selector is invalid';

        //  build config
        this.config = {
            name: undefined,
            autoStart: true
        };
        if ( typeof config === 'object' ) $.extend(true, this.config, config);
        if ( typeof config === 'string' ) this.config.name = config;
        this.name = 'ScrollLock' + ( typeof this.config.name === 'string' ) ? '.' + this.config.name : '';

        this.track = track;
        this.hook = hook;
        if ( this.config.autoStart === true ) this.start();

    }

    start() {

        this.ScrollPos = 0;
        $(window).off('scroll.' + this.name).on('scroll.' + this.name, [this], function (e) {

            var self = e.data[0];
            this.trackDom = $(self.track);
            if ($(this).scrollTop() <= this.ScrollPos) {

                //Scrolling Up
                var pos = $(self.hook).offset();
                var domPos = this.trackDom.offset();
                if ( typeof domPos === 'undefined' ) {
                    return;
                }
                if ( (domPos.top-26) >= pos.top ) {

                    this.trackDom.css({
                        left: pos.left,
                        top: pos.top + 26,
                        visibility: 'visible',
                        'z-index': '1000'
                    });

                }

            } else {

                this.trackDom.css({"z-index": "475"});

            }

            this.ScrollPos = $(this).scrollTop();

        });

    };

    stop() {

        $(window).off('scroll.' + this.name);

    }

}

//  provide an interface for collecting totals data
class Muledump_TotalsCounter {

    constructor(guid, cache, callback) {

        this.state = true;
        this.busy = false;
        this.aggregate = false;
        this.sources = [];
        this.sourceData = {};
        this.excluded = [];
        this.cache = cache;
        if ( guid === 'global' ) this.cache = false;
        if ( typeof callback === 'function' ) this.callback = callback;
        this.guid = guid;
        this.cache_key = 'cache:' + guid + ':totals';
        this.data = this.createDataObject();
        this.log = ( setuptools && setuptools.app && typeof setuptools.app.techlog === 'function' ) ? setuptools.app.techlog : console.log;

        //  are we loading the cache?
        var json = this.read(this.cache_key);
        if ( cache === true && typeof json !== 'string' ) {
            this.cache = false;
        }
        if ( typeof cache === 'undefined' && typeof json === 'string' ) this.cache = true;
        if ( this.cache === false ) return;

        //  is there cache data available?
        var data;
        try {
            data = JSON.parse(json);
        } catch (e) {}
        if ( typeof data !== 'object' ) return;

        //  merge it
        $.extend(true, this.data, data);
        if ( typeof this.callback === 'function' ) this.callback(this);

    }

    read(key) {

        if ( typeof setuptools === 'object' ) return setuptools.storage.read(key);

        var response;
        try {
            response = localStorage[key];
        } catch(e) {
            return;
        }
        return response;

    }

    //  very simple storage function
    write(key, value) {

        //  making this friendly to non-muledump users
        if ( typeof setuptools === 'object' ) return setuptools.storage.write(key, value);

        try {
            localStorage[key] = value;
        } catch(e) {
            return false;
        }
        return true;

    }

    //  provide a clean, new copy of our default totals object
    createDataObject() {

        return $.extend(true, {}, {
            meta: {
                version: 0,
                created: Date.now()
            },
            types: {
                equipment: {},
                inv: {},
                backpack: {},
                vaults: {},
                potions: {},
                gifts: {}
            },
            totals: {}
        });

    }

    //  count the provided item
    count(id, type, qty, force) {

        if ( typeof qty === 'boolean' ) {
            force = qty;
            qty = undefined;
        }
        if ( this.state === false ) return;
        if ( this.cache === true && force !== true ) {
            this.error = "Cannot count totals when using cached data";
        }

        if ( typeof qty !== 'number' ) qty = 1;
        if ( typeof this.data.types[type] === 'object' ) this.data.types[type][id] = ( typeof this.data.types[type][id] === 'number' ) ? this.data.types[type][id]+qty : qty;
        this.data.totals[id] = ( typeof this.data.totals[id] === 'number' ) ? this.data.totals[id]+qty : qty;
        this.data.meta.updated = Date.now();

    }

    //  aggregate data from multiple trackers
    import(tracker, excluded) {

        if ( this.busy === true ) return;
        var self = this;

        //  exclude or include guids from global totals when rebuilding
        if ( typeof window.accounts[tracker] === 'string' ) tracker = [tracker];
        if ( Array.isArray(tracker) === true ) {

            if ( excluded === true && this.excluded.indexOf(tracker) === -1 ) this.excluded = this.excluded.concat(tracker);
            if ( excluded === false )
                for ( var i = 0; i < tracker.length; i++ )
                    this.excluded.splice(this.excluded.indexOf(tracker[i]), 1);

            if ( tracker.length === 1 ) {
                tracker = ( mules[tracker[0]].totals instanceof Muledump_TotalsCounter ) ? mules[tracker[0]].totals : undefined;
            } else tracker = undefined;

        }

        //  clear all excluded items from the filter
        if ( tracker === 'clearExcluded' ) {
            this.excluded = [];
            tracker = undefined;
        }

        //  modify excluded accounts to include Account Filter
        //this.excluded = [];
        for ( var guid in window.mules )
            if ( window.mules.hasOwnProperty(guid) )
                if (
                    this.excluded.indexOf(guid) === -1 &&
                    (
                        (window.mules[guid].loaded === false && window.mules[guid].loginOnly !== true) ||
                        window.mules[guid].disabled === true ||
                        (
                            Array.isArray(setuptools.app.muledump.totals.config.getKey('accountFilter')) === true &&
                            setuptools.app.muledump.totals.config.getKey('accountFilter').length > 0 &&
                            setuptools.app.muledump.totals.config.getKey('accountFilter').indexOf(guid) === -1
                        )
                ) ) this.excluded.push(guid);

        //  load provided tracker into aggregate data
        if ( tracker instanceof Muledump_TotalsCounter &&

            //  this verifies that we are eligible for mode 0 if the source is already imported
            !(this.sources.indexOf(tracker.guid) > -1 && !this.sourceData[tracker.guid])
        ) {

            this.busy = true;
            this.aggregate = true;

            //  import mode 0: subtraction of existing source tracker data
            if ( this.sources.indexOf(tracker.guid) > -1 ) {

                //  check if the source and target data are identical
                if (
                    excluded !== true &&
                    typeof this.sources[guid] === 'object' &&
                    new SeaSalt_Hashing(JSON.stringify(this.sourceData[tracker.guid].meta), 'sha256', 'hex').toString() === new SeaSalt_Hashing(JSON.stringify(tracker.data.meta), 'sha256', 'hex').toString()
                ) {
                    this.log('Muledump_TotalsCounter/Import skipping identical source - ' + tracker.guid + ' - ' + JSON.stringify(this.sourceData[tracker.guid].meta));
                    this.busy = false;
                    return;
                }

                this.log('Muledump_TotalsCounter/Import mode 0', 'norecord');
                Object.filter(this.sourceData[tracker.guid].types, function (type, data) {
                    for (var item in data) {
                        if (data.hasOwnProperty(item)) {

                            if ( self.data.types[type][item] ) self.data.types[type][item] = self.data.types[type][item]-data[item];
                            if ( self.data.totals[item] ) self.data.totals[item] = self.data.totals[item]-data[item];

                        }
                    }
                });

                this.sources.splice(this.sources.indexOf(tracker.guid), 1);
                delete this.sourceData[tracker.guid];

            }

            //  if excluded we'll only subtract
            if ( excluded === true ) {
                this.busy = false;
                return;
            }

            //  import mode 1: addition of new source tracker data
            this.log('Muledump_TotalsCounter/Import mode 1', 'norecord');
            this.sources.push(tracker.guid);
            this.sourceData[tracker.guid] = tracker.data;
            Object.filter(tracker.data.types, function (type, data) {
                for (var item in data)
                    if (data.hasOwnProperty(item))
                        self.count(item, type, data[item], true);
            });
            this.busy = false;

        }

        //  import mode 2: reimport of all tracker sources
        else {

            this.log('Muledump_TotalsCounter/Import mode 2', 'norecord');
            this.busy = true;
            this.aggregate = true;
            this.excluded = [];
            tracker = [];
            this.sources = [];
            this.data = this.createDataObject();
            for (var guid in window.mules) {

                if (
                    window.mules.hasOwnProperty(guid) &&
                    this.excluded.indexOf(guid) === -1 &&
                    window.mules[guid].disabled !== true &&
                    (window.mules[guid].loaded === true || window.mules[guid].loginOnly === true)
                ) {

                    if ( !(window.mules[guid].totals instanceof Muledump_TotalsCounter) ) {
                        this.error = "Import only accepts instances of Muledump_TotalsCounter as its argument";
                        continue;
                    }

                    Object.filter(window.mules[guid].totals.data.types, function (type, data) {
                        for (var item in data)
                            if (data.hasOwnProperty(item))
                                self.count(item, type, data[item], true);
                    });

                    this.sources.push(guid);
                    this.sourceData[guid] = window.mules[guid].totals.data;

                }

            }

            this.busy = false;

        }

    }

    //  save data cache to local storage
    save() {

        if ( this.state === false ) return;
        this.data.meta.saved = Date.now();
        this.data.meta.version++;
        var saveObject;
        try {
            saveObject = JSON.stringify(this.data);
        } catch (e) {
            this.error = "Cannot save to local storage";
            return;
        }
        this.cache = true;
        this.write(this.cache_key, saveObject);
        if ( typeof this.callback === 'function' ) this.callback(this);

    }

    //  output the totals data for this tracker in json
    toString(pretty) {

        var json;
        try {
            json = ( pretty === true ) ? JSON.stringify(this.data, true, 5) : JSON.stringify(this.data);
        } catch (e) {}
        return json;

    }

    //  delete data cache
    clear() {

        return setuptools.storage.delete(this.cache_key);

    }

}

class Muledump_MouseDirection {

    constructor(config) {

        this.config = $.extend(true, {
            debug: false,
            name: 'muledump.mousedirection',
            variance: 5,
            approach: 0.3,
            target: {}
        }, config);

        this.state = 'init';
        this.track = {
            mouse: {x: 0, y: 0},
            offset: {x: 0, y: 0},
            target: {width: 0, height: 0}
        };

        //  positioning relative to the target
        this.rel = {
            v: false,
            h: false
        };

        //  direction the mouse is moving relative to the window
        this.travel = {
            v: false,
            h: false
        };

        //  approach detection of the mouse on a target
        this.approach = {
            v: false,
            h: false
        };

        this.runtimeId = (setuptools.seasalt.hash.sha256(Date.now().toString())).substr(56, 64);
        this.namespace = this.config.name + '.' + this.runtimeId;
        if ( typeof config === 'undefined' ) config = {};
        if ( typeof config !== 'object' ) {
            this.state = 'error';
            this.error = true;
            this.errorMessage = 'Supplied configuration is not valid.';
            return;
        }

        this.state = 'ready';
        this.restart();

    }

    restart() {
        this.off();
        this.on();
    }

    off() {

        if ( this.state !== 'running' ) return;
        $(window).off('mousemove.' + this.namespace);
        this.state = 'ready';

    }

    on() {

        if ( this.state !== 'ready' ) return;
        var self = this;
        $(window).on('mousemove.' + this.namespace, function(e) {

            //  where are we located relative to the target we are over?
            self.rel.target = $(e.target);
            var matches = 0;
            var required = 0;

            //  target validation if provided

            //  are required classes provided?
            if ( self.config.target.class ) {

                if ( typeof self.config.target.class === 'string' ) self.config.target.class = [self.config.target.class];
                if ( Array.isArray(self.config.target.class) === false ) return;
                required += self.config.target.class.length;
                for ( var i = 0; i < self.config.target.class.length; i++ )
                    if ( self.rel.target.hasClass(self.config.target.class[i]) === true )
                        matches++;

            }

            //  are required attributes provided?
            if ( self.config.target.attr ) {

                if ( typeof self.config.target.attr !== 'object' ) return;
                required += Object.keys(self.config.target.attr).length;
                for ( var attr in self.config.target.attr )
                    if ( self.config.target.attr.hasOwnProperty(attr) )
                        if ( self.rel.target.attr(attr) === self.config.target.attr[attr] )
                            matches++;

            }

            //  if required number of matches are not met we will not calculate this event
            if ( matches !== required ) return;

            //  horizontal page positioning
            if ( Math.abs(e.pageX-self.track.mouse.x) > self.config.variance ) {
                self.travel.h = ( self.track.mouse.x < e.pageX );
                self.track.mouse.x = e.pageX;
            } else self.travel.h = undefined;

            //  vertical page positioning
            if ( Math.abs(e.pageY-self.track.mouse.y) > self.config.variance ) {
                self.travel.v = ( self.track.mouse.y < e.pageY );
                self.track.mouse.y = e.pageY;
            } else self.travel.v = undefined;

            //  target positioning
            self.rel.h = ( (e.offsetX/$(e.target).outerWidth()) > 0.5 );
            self.rel.v = ( (e.offsetY/$(e.target).outerHeight()) > 0.5 );

            //  target approach calculations
            var avariance = 0.5-self.config.approach;
            if ( self.travel.h === true ) {
                self.approach.h = ( (e.offsetX/$(e.target).outerWidth()) >= (0.5-avariance) );
            } else {
                self.approach.h = ( (e.offsetX/$(e.target).outerWidth()) <= (0.5+avariance) );
            }

            if ( self.travel.v === true ) {
                self.approach.v = ( (e.offsetY/$(e.target).outerHeight()) >= (0.5-avariance) );
            } else {
                self.approach.v = ( (e.offsetY/$(e.target).outerHeight()) <= (0.5+avariance) );
            }

        });

    }

}

//  drag target divs around a container and react to changes
class Muledump_Dragging {

    constructor(config) {

        if ( typeof config === 'undefined' ) config = {};
        if ( typeof config !== 'object' ) {
            this.state = 'error';
            this.error = true;
            this.errorMessage = 'Invalid configuration provided';
            return;
        }
        this.config = $.extend(true, {
            approach: 0.2,
            callbacks: {
                after_drag: undefined,
                after_swap: undefined,
                before: undefined,
                before_swap: undefined,
                during_drag: undefined,
                finished: undefined,
                start: undefined,
                target: undefined
            },
            activeclass: 'dragging',
            mode: 'drag',
            name: 'draggable',
            target: [],
            targetattr: undefined,
            variance: 5,
            swap: []
        }, config);

        //  convert to an array
        if ( typeof this.config.swap === 'string' ) this.config.swap = [this.config.swap];
        if ( !Array.isArray(this.config.swap) ) this.config.swap = [];

        //  this must be a string or empty
        if ( ['string', 'undefined'].indexOf(typeof this.config.targetattr) === -1 ) {
            this.state = 'error';
            this.error = true;
            this.errorMessage = 'Invalid target attribute specified';
            return;
        }

        this.targetName = '.' + this.config.target.join('.');
        this.namespace = 'muledump.dragging.' + this.config.name + Date.now().toString();
        this.MouseDirection = new Muledump_MouseDirection({
            target: {
                class: this.config.target
            },
            approach: this.config.approach,
            variance: this.config.variance
        });

        this.on();

    }

    //  callback mapping
    after_drag_callbacks(parent, self) {
        return this.callback_router('after_drag', parent, self, true);
    }

    after_swap_callbacks(parent, self, c) {
        return this.callback_router('after_swap', parent, self, c);
    }

    before_callbacks(parent, self) {
        return this.callback_router('before', parent, self);
    }

    before_swap_callbacks(parent, self, c) {
        return this.callback_router('before_swap', parent, self, c);
    }

    during_drag_callbacks(parent, self) {
        return this.callback_router('during_drag', parent, self);
    }

    finish_callbacks(parent, self) {
        return this.callback_router('finish', parent, self, true);
    }

    start_callbacks(parent, self) {
        return this.callback_router('start', parent, self);
    }

    target_callbacks(parent, self, e, target) {
        var result = this.callback_router('target', parent, self, e, target);
        if ( result === true ) return target;
        return result;
    }

    //  callback router
    callback_router(route, parent, self, e, target, force) {

        if ( typeof e === 'boolean' ) {
            force = e;
            e = undefined;
            target = undefined;
        }

        var truth = true;
        if ( typeof this.config.callbacks[route] === 'function' ) this.config.callbacks[route] = [this.config.callbacks[route]];
        if (
            Array.isArray(this.config.callbacks[route])
        ) this.config.callbacks[route].filter(function(callback) {
            if ( force !== true ) if ( typeof callback !== 'function' || truth !== true ) return;
            var result = callback(parent, self, e, target);
            if ( force !== true && result !== true ) truth = result;
        });

        return truth;

    }

    //  disable all mouse bindings
    off() {

        if ( this.error === true ) return;
        $(this.targetName).off('mousedown.' + this.namespace);
        this.MouseDirection.off();
        $(window)
            .off('mousemove.' + this.namespace)
            .off('mouseup.' + this.namespace);
    }

    //  enable all mouse bindings
    on() {

        if ( this.error === true ) return;
        var parent = this;
        $(this.targetName).on('mousedown.' + this.namespace, function(e) {

            //  cell has been selected
            var self = $(this);
            self.addClass(parent.config.activeclass);
            parent.lastIndex = 0;
            parent.clickIndexDown = self.index();

            //  run startup callbacks
            if ( parent.start_callbacks(parent, self) !== true ) return;

            if ( parent.config.mode === 'swap' ) {

                //  valid elements to consider have data-type attributes
                if (typeof parent.config.targetattr === 'string') {

                    parent.target = $(e.target).attr(parent.config.targetattr);
                    if (parent.target === undefined) return;

                }

            }

            //  run before callbacks
            if ( parent.before_callbacks(parent, self) !== true ) return;

            $(window)
            //  move the cell with the mouse
                .off('mousemove.' + parent.namespace)
                .on('mousemove.' + parent.namespace, function(e) {

                    //  drag mode
                    if ( parent.config.mode === 'drag' ) {

                        //  valid elements to consider have data-type attributes
                        if (typeof parent.config.targetattr === 'string') {

                            parent.target = $(e.target).attr(parent.config.targetattr);
                            if (parent.target === undefined) return;

                        }

                        //  it flickers like a back alley lamp if you don't exclude itself from the moving
                        if (parent.MouseDirection.approach.h === false && parent.MouseDirection.approach.v === false && parent.lastIndex === $(e.target).index()) return;
                        parent.lastIndex = $(e.target).index();

                        //  run during callbacks
                        if ( parent.during_drag_callbacks(parent, self) !== true ) return;

                        //  default action is to insert the div before the target
                        parent.indexModifier = 0;

                        //  if we are traveling to the right or down then we'll insert after the target
                        if (
                            (parent.MouseDirection.approach.h === true && parent.MouseDirection.travel.h === true) ||
                            (parent.MouseDirection.rel.v === false && parent.MouseDirection.travel.v === true)
                        ) parent.indexModifier = 1;

                        if (parent.indexModifier === 0) {
                            self.insertBefore($(e.target));
                        } else {
                            self.insertAfter($(e.target));
                        }

                        //  run after move callbacks
                        parent.after_drag_callbacks(parent, self);

                    }

                })
                //  react to the mouse being released
                .off('mouseup.' + parent.namespace)
                .on('mouseup.' + parent.namespace, function(e) {

                    var target = $(e.target);
                    target = parent.target_callbacks(parent, self, e, target);
                    if ( !(target instanceof jQuery) ) return;

                    parent.clickIndexUp = target.index();
                    self.removeClass(parent.config.activeclass);
                    $(window)
                        .off('mousemove.' + parent.namespace)
                        .off('mouseup.' + parent.namespace)
                        .off('mousedown.' + parent.namespace);

                    //  swap mode flips the source and target divs
                    if ( parent.config.mode === 'swap' ) {

                        //  generate base data
                        var siblings = $(parent.targetName);
                        var c = {
                            source: $(siblings.get(parent.clickIndexDown)),
                            target: $(siblings.get(parent.clickIndexUp))
                        };

                        //  run before swap callbacks
                        parent.before_swap_callbacks(parent, self, c);

                        //  swap elements
                        c.source.insertBefore(c.target);
                        if (parent.clickIndexDown > parent.clickIndexUp) {
                            c.target.insertAfter($($(parent.targetName).get(parent.clickIndexDown)));
                        } else {
                            c.target.insertBefore($($(parent.targetName).get(parent.clickIndexDown)));
                        }

                        //  run after swap callbacks
                        parent.after_swap_callbacks(parent, self, c);

                    }

                    //  run finish callbacks
                    parent.finish_callbacks(parent, self);

                });

        });

    }

}
