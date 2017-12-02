(function($, window) {

    var options = {
        totals: false,
        email: false,
        accountinfo: false,
        chdesc: true,
        chsortchoice: true,
        chsort: '0',
        equipment: true,
        hpmp: true,
        inv: true,
        vaults: true,
        vaultlayoutchoice: true,
        vaultlayout: '0',
        famefilter: false,
        fameamount: '0',
        stats: true,
        sttype: 'base',
        pcstats: true,
        goals: true,
        backpack: true,
        gifts: false,
        wawawa: false,
        techreport: false
    };

//  generate our list of available vault layouts from the default list
    AvailableVaultLayouts = {};
    for ( i = 0; i < window.vaultorders.length; i++ )
        AvailableVaultLayouts[i] = window.vaultorders[i].layoutname;

    var options_layout = {
        'totals': 'totals',
        'famefilter': {
            'label': 'famebonus filter',
            'radio': ['fameamount', {
                '0': '> 0',
                '1': '> 1%',
                '2': '> 2%',
                '3': '> 3%',
                '4': '> 4%',
                '5': '> 5%'
            }]
        },
        'email': 'email',
        'accountinfo': 'account info',
        'chdesc': 'char description',
        'chsortchoice': {
            'label': 'char sort',
            'radio': ['chsort', {0: 'id', 1: 'base fame', 2: 'total fame', 3: 'base exp', 4: 'class', 100: 'custom'}]
        },
        'equipment': 'equipment',
        'hpmp': 'hp/mp pots',
        'inv': 'inventory',
        'backpack': 'backpacks',
        'vaults': 'vaults',
        'vaultlayoutchoice': {
            'label': 'vault layout',
            'radio': ['vaultlayout', AvailableVaultLayouts]
        },
        'gifts': 'gift chests',
        'stats': {
            'label': 'stats',
            'radio': ['sttype', {
                'base': 'base',
                'avg': 'distance from average',
                'max': 'left to max',
                'comb': 'base / max',
            }]
        },
        'pcstats': 'additional stats',
        'goals': 'achievement progress',
        'wawawa': 'wawawa',
        'techreport': 'debug logging'
    };

    var globalopts = { 'totals': 1, 'famefilter': 1, 'techreport': 1  };
    var hiddenopts = { 'sttype': 1, 'fameamount': 1, 'vaultlayout': 1, 'chsort': 1, 'vaultlayoutchoice': 1, 'chsortchoice': 1};

    function gen_option(o, $targ, guid) {
        var opt = options_layout[o];
        var onacc = $targ.attr('id') == 'accopts';
        var oas = onacc ? 'acc_' : '';
        var $o = $('<div>');
        $targ.append($o);
        var radio = typeof opt == 'object';
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
                if ( name !== 'techreport' ) window.mules[guid].query(false, true);
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
                if ((onacc ? mule.opt(rname) : options[rname]) == i) $inp.attr('checked', 'checked');
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
        if ( o === 'techreport' ) window.techreport = options.techreport;

        if (o === 'equipment' || o === 'inv' || o === 'vaults' || o === 'gifts' ) {
            window.update_totals();
            window.update_filter();
        }
        if (o === 'totals') {
            $('#totals').toggle(!!options.totals);
        }
        if (o === 'famefilter' || o === 'fameamount' ) {
            window.update_totals();
        }
        if (!(o in globalopts)) {
            for (var i in options) {
                if (i in options_layout || i in hiddenopts) continue;
                if (o in options[i]) delete options[i][o];
            }
            for (i in window.mules) {
                if ( window.mules.hasOwnProperty(i) )
                    window.mules[i].query(false, true);
            }
        }
        // save
        try {
            localStorage['muledump:options'] = JSON.stringify(options);
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

            if ( typeof options.updatecheck === 'undefined' ) options.updatecheck = true;
            options_layout.updatecheck = 'auto check for updates';
            globalopts.updatecheck = 1;

        }

        var $options = $('#options');
        for (var i in options_layout) {
            gen_option(i, $options);
        }
        $('#accopts').on('mouseleave', function() { $(this).hide(); });

    }

    window.options_init = options_init;
    window.option_updated = option_updated;
    window.updaccopts = updaccopts;
    window.options = options;
    window.options_layout = options_layout;
    window.globalopts = globalopts;

})($, window);
