(function($, window) {

    var options = {
        totals: false,
        email: false,
        accountName: true,
        accountinfo: false,
        chdesc: true,
        chsortchoice: true,
        chsort: '0',
        equipment: true,
        hpmp: true,
        inv: true,
        vaults: true,
        vaultlayout: '0',
        famefilter: false,
        fameamount: '0',
        feedfilter: false,
        feedpower: '0',
        sbfilter: false,
        utfilter: false,
        stfilter: false,
        stats: true,
        sttype: 'base',
        pcstats: true,
        goals: true,
        backpack: true,
        gifts: false,
        wawawa: false
    };

//  generate our list of available vault layouts from the default list
    AvailableVaultLayouts = {};
    for ( i = 0; i < window.vaultorders.length; i++ )
        AvailableVaultLayouts[i] = window.vaultorders[i].layoutname;

    var options_layout = {
        'totals': 'Totals',
        'famefilter': {
            'label': 'Fame Bonus Filter',
            'radio': ['fameamount', {
                '0': '> 0',
                '1': '> 1%',
                '2': '> 2%',
                '3': '> 3%',
                '4': '> 4%',
                '5': '> 5%'
            }]
        },
        'feedfilter': {
            'label': 'Feed Power Filter',
            'radio': ['feedpower', {
                '0': '> 0',
                '100': '> 100',
                '250': '> 250',
                '500': '> 500',
                '1000': '> 1000',
                '2500': '> 2500'
            }]
        },
        'sbfilter': 'Soulbound Filter',
        'utfilter': 'UT Filter',
        'stfilter': 'ST Filter',
        'email': 'Email',
        'accountName': 'Account Name',
        'accountinfo': 'Account Info',
        'chdesc': 'Char Description',
        'chsortchoice': {
            'label': 'Char Sort',
            'radio': ['chsort', {0: 'ID', 1: 'Base Fame', 2: 'Total Fame', 3: 'Base Exp', 4: 'Class', 5: 'Active Time', 6: 'Maxed Stats', 100: 'Custom'}]
        },
        'equipment': 'Equipment',
        'hpmp': 'HP/MP Pots',
        'inv': 'Inventory',
        'backpack': 'Backpacks',
        'vaults': {
            'label': 'Vaults',
            'radio': ['vaultlayout', AvailableVaultLayouts]
        },
        'gifts': 'Gift Chests',
        'stats': {
            'label': 'Stats',
            'radio': ['sttype', {
                'base': 'Base',
                'avg': 'Distance from average',
                'max': 'Left to max',
                'comb': 'Base / Max',
            }]
        },
        'pcstats': 'Additional Stats',
        'goals': 'Achievement Progress',
        'wawawa': 'Wawawa\'s Progress Tracker'
    };

    var globalopts = { 'totals': 1, 'famefilter': 1, 'feedfilter': 1, 'sbfilter': 1, 'utfilter': 1, 'stfilter': 1 };
    var hiddenopts = { 'sttype': 1, 'fameamount': 1, 'feedpower': 1, 'vaultlayout': 1, 'chsort': 1, 'chsortchoice': 1, 'vaults': 1};

    function gen_option(o, $targ, guid) {
        var opt = options_layout[o];
        var onacc = $targ.attr('id') === 'accopts';
        var oas = onacc ? 'acc_' : '';
        var $o = $('<div>');
        $targ.append($o);
        var radio = typeof opt === 'object';
        // checkbox
        var $inp = $('<input>').attr({
            type: 'checkbox',
            name: o,
            value: o,
            id: 'check_' + oas + o
        });
        if (guid ? window.mules[guid].opt(o) : options[o]) $inp.attr('checked', 'checked');
        // label for checkbox
        var ltext = radio ? opt.label : opt;
        var $lab = $('<label>').attr('for', 'check_' + oas + o).text(ltext);

        $inp.change(function() {
            var name = $(this).attr('name');
            if (onacc) {
                options[guid] = options[guid] || {};
                options[guid][name] = $(this).is(':checked');
                window.mules[guid].query(false, true);
            } else {
                options[name] = $(this).is(':checked');
                option_updated(name);
            }
        });
        // tree-style toggle
        if (radio) {
            $inp.change(function(e) {
                $('#radio_' + oas + o).toggle($(this).is(':checked'));
            });
        }
        $inp.appendTo($o);
        $lab.appendTo($o);
        if (!radio) return $o;
        // radio
        var r = opt.radio;
        var rname = r[0], ritems = r[1];
        // radio container
        var $rc = $('<div class="radio">').attr('id', 'radio_' + oas + o);
        for (var i in ritems) {
            if ( ritems.hasOwnProperty(i) ) {
                $inp = $('<input>').attr({
                    type: 'radio',
                    name: rname,
                    value: i,
                    id: 'radio_' + oas + o + i
                });
                var mule = window.mules[guid];
                if ((onacc ? mule.opt(rname) : options[rname]) === i) $inp.attr('checked', 'checked');
                $lab = $('<label>').attr('for', 'radio_' + oas + o + i).text(ritems[i]);

                $inp.change(function () {
                    var $this = $(this), name = $this.attr('name');
                    if (onacc) {
                        var guid = $targ.data('guid');
                        if (!guid) return;
                        options[guid] = options[guid] || {};
                        options[guid][name] = $this.is(':checked') ? $this.val() : false;
                        mule.query(false, true);
                    } else {
                        options[name] = $this.is(':checked') ? $this.val() : false;
                        option_updated(name);
                    }
                });

                $('<div>').append($inp).append($lab).appendTo($rc);
            }
        }
        $rc.toggle(!!(onacc ? window.mules[guid].opt(o) : options[o])).appendTo($o);

    }

// update everything with single option
    function option_updated(o) {
        if ( o === 'vaultlayout' ) window.vaultlayout = options.vaultlayout;

        if (o === 'equipment' || o === 'inv' || o === 'vaults' || o === 'gifts' ) {
            window.update_totals();
            window.update_filter();
        }
        if (o === 'totals') {
            $('#totals').toggle(!!options.totals);
        }
        if (['famefilter', 'fameamount', 'feedfilter', 'feedpower', 'utfilter', 'sbfilter', 'stfilter'].indexOf(o) > -1 ) {
            window.update_totals();
        }
        if (!(o in globalopts)) {
            for (var i in options) {
                if (i in options_layout || i in hiddenopts) continue;
                if (typeof options[i] === 'object' && o in options[i]) delete options[i][o];
            }

            for (i in window.mules) {
                if ( window.mules.hasOwnProperty(i) )
                    window.mules[i].query(false, true);
            }
        }
        // save
        try {
            localStorage['muledump:options'] = JSON.stringify(options, null, 4);
        } catch (e) {}
        window.relayout();
    }

    function updaccopts(guid) {
        var $ao = $('#accopts');
        $ao.empty();
        $ao.data('guid', guid);
        for (var i in options_layout) {
            if (!(i in globalopts)) gen_option(i, $ao, guid);
        }
    }

    function options_init(hosted) {

        // read options from cache
        var c = '';
        try {
            c = localStorage['muledump:options'];
        } catch (e) {
            //if ( typeof localStorage !== 'undefined' ) localStorage.clear();
        }
        if (c) {
            try {
                c = JSON.parse(c);
                for (var k in c) {
                    if ( c.hasOwnProperty(k) )
                        options[k] = c[k];
                }
            } catch (e) {}
        }

        if ( hosted === true ) {

            delete options.updatecheck;

        } else {

            //  upgrade old format configs
            if ( options.updatecheck === true ) options.updatecheck = '1';

            //  add update check options
            if ( typeof options.updates === 'undefined' ) options.updates = true;
            if ( typeof options.updatecheck === 'undefined' ) options.updatecheck = '1';
            options_layout.updates = {
                'label': 'Muledump Update Notifier',
                'radio': ['updatecheck', {
                    '0': 'Releases only',
                    '1': 'All versions'
                }]
            };
            globalopts.updates = 1;
            globalopts.updatecheck = 1;

            //  add renders check options
            if ( typeof options.renderscheck === 'undefined' ) options.renderscheck = true;
            options_layout.renderscheck = 'Renders Update Notifier';
            globalopts.renderscheck = 1;

        }

        //  create object clone for recovery option
        setuptools.copy.options = $.extend(true, {}, options);

        var $options = $('#options');
        for (var i in options_layout) {
            gen_option(i, $options);
        }
        $('#accopts')
            .on('mouseleave', function() { setuptools.tmp.accoptsMouseLeaveTimer = setTimeout(function(self) { $(self).hide(); }, 300, this); })
            .on('mouseenter', function() { clearTimeout(setuptools.tmp.accoptsMouseLeaveTimer); });

        /*
        //  #options inside #fix was prevented from scrolling, this handles display in the new format
        //  this has to track both #options and .handle.options as the mouse starts in one location and moves to the other
        */

        //  keep #options lined up with .handle.options when scrolling up
        ScrollUpAdjustments = function() {

            setuptools.tmp.ScrollPos = 0;
            $(window).unbind('scroll').scroll(function () {

                var optionsDom = $('#options');
                if ($(this).scrollTop() <= setuptools.tmp.ScrollPos) {

                    //Scrolling Up
                    var pos = $('.handle.options').offset();
                    var domPos = optionsDom.offset();
                    if ( (domPos.top-26) >= pos.top ) {

                        optionsDom.css({
                            left: pos.left,
                            top: pos.top + 26,
                            visibility: 'visible',
                            'z-index': '1000'
                        });

                    }

                } else {

                    optionsDom.css({"z-index": "475"});

                }

                setuptools.tmp.ScrollPos = $(this).scrollTop();

            });

        };

        //  start a timer to close #options
        function CloseTimer() {

            setuptools.tmp.optionsMouseLeaveTimer = setTimeout(function() {
                $('#options').css({visibility: 'hidden'});
                $(window).unbind('scroll');
            }, 300);

        }

        //  #options menu hovering
        $('#options').unbind('hover').hover(function() {

            // hovering, so we don't want to close the menu anymore
            clearTimeout(setuptools.tmp.optionsMouseLeaveTimer);

        }, function() {

            //  mouse no longer hovering, start menu close timer
            CloseTimer()

        });

        //  .handler.options button hovering
        $('.handle.options').unbind('hover').hover(function() {

            //  hovering on the option button means we display the menu
            ScrollUpAdjustments();
            clearTimeout(setuptools.tmp.optionsMouseLeaveTimer);
            var pos = $(this).offset();
            var optionsDom = $('#options');
            optionsDom.css({
                left: pos.left,
                top: pos.top+26,
                visibility: 'visible'
            });

        }, function() {

            //  mouse no longer hovering, start menu close timer
            CloseTimer();

        });

    }

    window.options_init = options_init;
    window.option_updated = option_updated;
    window.updaccopts = updaccopts;
    window.options = options;
    window.options_layout = options_layout;
    window.globalopts = globalopts;

})($, window);
