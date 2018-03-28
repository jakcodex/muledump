(function($, window) {

    var options = {
        totals: false,
        totalsGlobal: false,
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

        $inp.on('change.muledump.options', function() {
            var name = $(this).attr('name');
            if (onacc) {
                options[guid] = options[guid] || {};
                options[guid][name] = $(this).is(':checked');
                options_save();
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

        try {
            localStorage['muledump:options'] = JSON.stringify(options, null, 4);
        } catch (e) {}

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
        options_save();
        window.relayout();
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

        //  create object clone for recovery option
        setuptools.copy.options = $.extend(true, {}, options);

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
    function options_get() {
        return options;
    }

    window.options_get = options_get;
    window.options_init = options_init;
    window.option_updated = option_updated;
    window.updaccopts = updaccopts;
    window.options = options;
    window.options_layout = options_layout;
    window.globalopts = globalopts;

})($, window);
