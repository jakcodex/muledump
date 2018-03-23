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