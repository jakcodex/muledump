(function($, window) {

    var options = {
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
        stats: true,
        classstats: false,
        sttype: 'base',
        pcstats: true,
        goals: true,
        backpack: true,
        potions: true,
        gifts: false,
        wawawa: false,
        shrink: false,

        //  totals menu options
        totals: true,
        totalsGlobal: false,
        famefilter: false,
        fameamount: '-1',
        feedfilter: false,
        feedpower: '-1',
        sbfilter: false,
        nonsbfilter: false,
        utfilter: false,
        stfilter: false,
        wbfilter: false,
        //  remaining keys are auto-generated on startup from window.itemsSlotTypeMap key names
        //  see setuptools.app.muledump.totals.updateSecondaryFilter() for generation code
    };

    //  create object clone for recovery option
    var optionsCopy = JSON.parse(JSON.stringify(options));

    //  generate our list of available vault layouts from the default list
    var AvailableVaultLayouts = {};
    for ( var i = 0; i < window.vaultorders.length; i++ )
        AvailableVaultLayouts[i] = window.vaultorders[i].layoutname;

    var options_layout = {
        'email': 'Email',
        'accountName': 'Account Name',
        'accountinfo': 'Account Info',
        'chdesc': 'Char Description',
        'chsortchoice': {
            'label': 'Char Sort',
            'radio': ['chsort', {0: 'ID', 1: 'Base Fame', 2: 'Total Fame', 3: 'Base Exp', 4: 'Class', 5: 'Active Time', 6: 'Maxed Stats', 100: 'Custom'}] //7: 'Character Value',
        },
        'equipment': 'Equipment',
        'hpmp': 'HP/MP Pots',
        'inv': 'Inventory',
        'backpack': 'Backpacks',
        'vaults': {
            'label': 'Vaults',
            'radio': ['vaultlayout', AvailableVaultLayouts]
        },
        'potions': 'Potion Storage',
        'gifts': 'Gift Chests',
        'stats': {
            'label': 'Character Stats',
            'radio': ['sttype', {
                'base': 'Base',
                'avg': 'Distance from average',
                'max': 'Left to max',
                'comb': 'Base / Max',
            }]
        },
        'classstats': 'Class Stats',
        'pcstats': 'Additional Stats',
        'goals': 'Achievement Progress',
        'wawawa': 'Wawawa\'s Progress Tracker',
        'shrink': 'Shrink Mules',
    };

    var globalopts = { 'totals': 1, 'famefilter': 1, 'feedfilter': 1, 'sbfilter': 1, 'nonsbfilter': 1, 'utfilter': 1, 'stfilter': 1, 'wbfilter': 1 };
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

        $inp.on('change.muledump.options', function() {
            var name = $(this).attr('name');
            if (onacc) {
                options[guid] = options[guid] || {};
                options[guid][name] = $(this).is(':checked');
                options_save();
                if ( ['totals', 'accountinfo', 'accountName', 'email', 'chdesc', 'pcstats', 'stats', 'wawawa', 'updatecheck'].indexOf(o) === -1 ) {
                    window.update_totals();
                    window.update_filter();
                }
                window.mules[guid].query(false, true);
            } else {
                options[name] = $(this).is(':checked');
                option_updated(name);
            }
        });
        // tree-style toggle
        if (radio) {
            $inp.on('change.muledump.options.radio', function(e) {
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

                $inp.on('change.muledump.options.radioContainer', function () {
                    var $this = $(this), name = $this.attr('name');
                    if (onacc) {
                        var guid = $targ.data('guid');
                        if (!guid) return;
                        options[guid] = options[guid] || {};
                        options[guid][name] = $this.is(':checked') ? $this.val() : false;
                        options_save();
                        if ( ['totals', 'accountinfo', 'accountName', 'email', 'chdesc', 'pcstats', 'stats', 'wawawa', 'updatecheck'].indexOf(o) === -1 ) {
                            window.update_totals();
                            window.update_filter();
                        }
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

    function options_save() {

        setuptools.storage.write('muledump:options', JSON.stringify(options, null, 4), true);

    }

    // update everything with single option
    function option_updated(o) {

        //  update vault layout option
        if ( o === 'vaultlayout' ) window.vaultlayout = options.vaultlayout;

        //  update totals display on/off
        if (o === 'totals') {
            $('#totals').toggle(!!options.totals);
        }

        //  redraw mules on certain changes
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

        //  save changes
        options_save();

        //  update display
        if ( ['totals', 'accountinfo', 'accountName', 'email', 'chdesc', 'pcstats', 'stats', 'wawawa', 'updatecheck'].indexOf(o) === -1 ) {
            window.update_totals();
            window.update_filter();
        }
        if ( setuptools.tmp.masonry ) setuptools.tmp.masonry.layout();
    }

    function updaccopts(guid) {
        var $ao = $('#accopts');
        $ao.empty();
        $ao.data('guid', guid);
        for (var i in options_layout) {
            if (!(i in globalopts)) {
                gen_option(i, $ao, guid);
            }
        }
    }

    function options_init() {

        //  create a copy of the original objects object
        setuptools.copy.options = optionsCopy;

        // read options from cache
        var c = setuptools.storage.read('muledump:options', true);
        if (c) {
            try {
                c = JSON.parse(c);
                for (var k in c) {
                    if ( c.hasOwnProperty(k) )
                        options[k] = c[k];
                }
            } catch (e) {}
        }

        if ( setuptools.state.hosted === true ) {

            delete options.updatecheck;

        } else {

            //  add update check options
            if ( typeof options.updatecheck === 'undefined' ) options.updatecheck = true;
            options_layout.updatecheck = 'Muledump Update Notifier';
            globalopts.updatecheck = true;

        }

        var $options = $('#options');
        $options.empty();
        for (var i in options_layout) {
            gen_option(i, $options);
        }
        $('#accopts')
            .off('mouseenter.muledump.options.accopts mouseleave.muledump.options.accopts')
            .on('mouseleave.muledump.options.accopts', function() { setuptools.tmp.accoptsMouseLeaveTimer = setTimeout(function(self) { $(self).hide(); }, 300, this); })
            .on('mouseenter.muledump.options.accopts', function() { clearTimeout(setuptools.tmp.accoptsMouseLeaveTimer); });

        /*
        //  options button and menu interactions
        */

        //  start a timer to close #options
        function CloseTimer() {

            setuptools.tmp.optionsMouseLeaveTimer = setTimeout(function() {
                $('#options').css({visibility: 'hidden'});
                if ( ScrollLock instanceof Muledump_ElementScrollLock ) ScrollLock.stop();
            }, 300);

        }

        //  #options menu hovering
        $('#options').off('mouseenter.options.display mouseleave.options.display').hover(function() {

            // hovering, so we don't want to close the menu anymore
            clearTimeout(setuptools.tmp.optionsMouseLeaveTimer);

        }, function() {

            //  mouse no longer hovering, start menu close timer
            CloseTimer()

        });

        //  .handler.options button hovering
        var ScrollLock = new Muledump_ElementScrollLock('#options', '.handle.options', {name: 'options', autoStart: false});
        $('.handle.options').off('mouseenter.options.menuButton mouseleave.options.menuButton').on('mouseenter.options.menuButton', function() {

            //  hovering on the option button means we display the menu
            ScrollLock.start();
            clearTimeout(setuptools.tmp.optionsMouseLeaveTimer);
            var pos = $(this).offset();
            var optionsDom = $('#options');
            optionsDom.show().css({
                left: pos.left,
                top: pos.top+26,
                visibility: 'visible'
            });

        })
        .on('mouseleave.options.menuButton', function() {

            //  mouse no longer hovering, start menu close timer
            CloseTimer();

        });


    }

    //  return the options var on demand
    function options_get(key, guid) {
        if ( !key && !guid ) return options;
        if ( guid in options ) if ( options[guid][key] ) return options[guid][key];
        return options[key];
    }

    //  sets the options var on demand
    function options_set(key, value, guid) {

        if ( typeof key === 'undefined' || typeof value === 'undefined' ) return false;

        if ( value === null ) var copy = $.extend(true, {}, optionsCopy);
        if ( typeof guid === 'string' ) {
            if ( value !== null && typeof options[guid] === 'undefined' ) options[guid] = {};
            if ( value !== null ) {
                options[guid][key] = value;
            } else if ( options[guid] && options[guid][key] ) delete options[guid][key];
            if ( options[guid] && Object.keys(options[guid]).length === 0 ) delete options[guid];
        } else
            options[key] = ( value === null ) ? copy[key] : value;

        options_save();
        return true;

    }

    window.options_get = options_get;
    window.options_set = options_set;
    window.options_init = options_init;
    window.option_updated = option_updated;
    window.options_save = options_save;
    window.updaccopts = updaccopts;
    window.options = options;
    window.options_layout = options_layout;
    window.globalopts = globalopts;

})($, window);
