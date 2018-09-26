//
//  settings and things inside muledump / separate from mainland setuptools
//

/**
 * @function
 * @param {Mule} Mule
 * @param {string} name
 * @param {object} data
 * Provide a warning button for an account when problems are detected
 */
setuptools.app.muledump.warnData = function(Mule, name, data) {

    if ( !setuptools.tmp.warnData ) setuptools.tmp.warnData = {guid: {}};

    if ( !setuptools.tmp.warnData[Mule.guid] ) {

        setuptools.tmp.warnData[Mule.guid] = {problems: {}};

        //  add the icon to the dom
        setuptools.tmp.warnData[Mule.guid].dom = $('<div class="button" title="Error in Account Data">').text('?');
        setuptools.tmp.warnData[Mule.guid].dom.prependTo(Mule.dom);

        //  capture clicks on the icon
        setuptools.tmp.warnData[Mule.guid].dom.click(function() {

            setuptools.lightbox.build('muledump-warnData', 'Unusual account data was detected. The following items failed to process:');

            for ( var i in setuptools.tmp.warnData[Mule.guid].problems )
                if ( setuptools.tmp.warnData[Mule.guid].problems.hasOwnProperty(i) )
                    setuptools.lightbox.build('muledump-warnData', ' \
                        <br><br><strong class="problem">' + i + '</strong> \
                        <br>' + setuptools.tmp.warnData[Mule.guid].problems[i].join(', ') + ' \
                    ');

            setuptools.lightbox.build('muledump-warnData', ' \
                <br><br><strong>What can you do?</strong> \
                <br>Try reloading that account\'s data from Deca servers. This sort of problem can happen briefly and fix itself. \
                <br><br>If this account is causing issues loading your other accounts, disable it in <a href="#" class="setuptools link accountsManager">Accounts Manager</a> for now. \
            ');

            setuptools.lightbox.settitle('muledump-warnData', 'Account Data Problems');
            setuptools.lightbox.display('muledump-warnData', {variant: 'setuptools-medium'});

            $('strong.problem').css('text-transform', 'capitalize');

            $('.setuptools.link.accountsManager').click(setuptools.app.accounts.manager);

        });


    }

    if ( typeof setuptools.tmp.warnData[Mule.guid].problems[name] === 'undefined' ) setuptools.tmp.warnData[Mule.guid].problems[name] = [];
    setuptools.tmp.warnData[Mule.guid].problems[name].push(data);

};

/**
 * @function
 * @param {jQuery} $i
 * @param {string | array} [classes]
 * @param {string} [content]
 * @param {number} [ttl]
 * Binds the item tooltip to all item divs
 */
setuptools.app.muledump.tooltip = function($i, classes, content, ttl) {

    if ( typeof ttl !== 'number' ) ttl = setuptools.data.config.tooltip;
    if ( typeof content === 'number' ) {

        ttl = content;
        content = undefined;

    }

    var contentCallback = function(self) {
        setuptools.lightbox.tooltip(self, content, {heightFrom: 'tooltip', classes: classes});
    };

    //  the default tooltip is for items
    var defaultCallback = function(self) {

        var id = +$(self).attr('data-itemId');
        var ItemData = items[id];
        if ( typeof ItemData !== 'object' || ItemData[0] === 'Empty Slot' ) return;

        //  build tooltip data
        //  three columns: [ bagTypeImage ] [ item name/feed power ] [ tier/fame bonus ]
        var html = '';

        //  poorman's bagType constants
        var bagPosition = '0px 0px';
        if ( ItemData[7] === 1 ) bagPosition = '-26px -0px';
        if ( ItemData[7] === 2 ) bagPosition = '-52px -0px';
        if ( ItemData[7] === 3 ) bagPosition = '-78px -0px';
        if ( ItemData[7] === 4 ) bagPosition = '-26px -26px';
        if ( ItemData[7] === 5 ) bagPosition = '-52px -26px';
        if ( ItemData[7] === 6 ) bagPosition = '-26px -52px';
        if ( ItemData[7] === 7 ) bagPosition = '-0px -26px';
        if ( ItemData[7] === 8 ) bagPosition = '-78px -26px';
        if ( ItemData[7] === 9 ) bagPosition = '-0px -52px';

        //  column one
        html += ' \
                <div class="cfleft ignore"> \
                    <div class="bagType" style="background-position: ' + bagPosition + ';">&nbsp;</div> \
                </div>\
            ';

        //  column two
        html += ' \
            <div class="fleft"> \
                ' + ItemData[0] + ( ( ItemData[8] === true ) ? '<span class="tooltip generic text" style="margin-left: 2px;"> (SB)</span>' : '' ) + ' \
                ' + ( (ItemData[6]) ? '<br><span class="tooltip feed">Feed Power: ' + ItemData[6] + '</span>' : '' ) + '\
            </div>\
        ';

        //  column three
        var tier = '';
        if ( ItemData[2] > -1 && ItemData[1] !== 10 ) tier += '<span class="tooltip tiered">T' + ItemData[2] + '</span>';
        if ( ItemData[9] === 1 && ItemData[1] !== 10 ) tier += '<span class="tooltip ut">UT</span>';
        if ( ItemData[9] === 2 ) tier += '<span class="tooltip st">ST</span>';
        var c2Margin = ( tier.length > 0 ) ? ' margin-left: 15px;' : '';
        html += ' \
                <div class="fleft" style="clear: right;' + c2Margin + '"> \
                    ' + tier + ' \
                    ' + ( ( ItemData[5] ) ? '<br><span class="tooltip generic text">Fame Bonus:</span> <span class="tooltip famebonus value">' + ItemData[5] + '%</span>' : '' ) + ' \
                </div>\
            ';

        setuptools.lightbox.tooltip(self, html, {classes: classes});
    };

    //  select all items
    if ( !item ) $i = $('.item');

    //  item mouseenter events
    $i.off('mouseenter.muledump.tooltip').on('mouseenter.muledump.tooltip', function(e) {

        if ( setuptools.app.muledump.keys('ctrl', e) === true ) return;
        var self = this;

        //  tooltip popup
        clearTimeout(setuptools.tmp.tstateOpen);
        setuptools.tmp.tstateOpen = setTimeout(((typeof content === 'string') ? contentCallback : defaultCallback), ttl, self);

        //  search context menu
        /*$(this).contextmenu(function(e) {

            e.preventDefault();

            //  display the menu
            if ( !setuptools.tmp.contextMenuOpen || typeof setuptools.tmp.contextMenuOpen['tooltip-menu'] === 'undefined' ) {

                //  base info
                var position = $(self);
                var options = [
                    {
                        option: 'pos',
                        vpx: 45
                    },
                    {
                        option: 'header',
                        value: 'Item Menu'
                    },
                    {
                        class: 'gotoRealmeye',
                        name: 'Open in Realmeye',
                        callback: function() {
                            console.log('gotoRealmeye');
                        }
                    }
                ];

                setuptools.lightbox.menu.context.create('tooltip-menu', false, position, options, self);
                $('div.setuptools.menu').mouseenter(function() {
                    clearInterval(setuptools.tmp.tstateMenuClose);
                });

                $('div.setuptools.menu').mouseleave(function() {
                    clearInterval(setuptools.tmp.tstateMenuClose);
                    setuptools.tmp.tstateMenuClose = setTimeout(function() {
                        setuptools.lightbox.menu.context.close('tooltip-menu');
                    }, 500);
                });

            } else {

                setuptools.lightbox.menu.context.close();

            }

        });*/

    });

    //  close the tooltip, cancel the load delay, or close context menu
    $i.off('mouseleave').on('mouseleave', function(e) {

        clearInterval(setuptools.tmp.findPosition);
        $(this).unbind('contextmenu');
        setuptools.tmp.tstateMenuClose = setTimeout(function() {
            setuptools.lightbox.menu.context.close('tooltip-menu');
        }, 500);
        clearTimeout(setuptools.tmp.tstateOpen);
        $('.tooltip').remove();

    });

};

/**
 * @function
 * @param {string} title
 * @param {function} callback
 * @param {object} argList
 * Add an item to the notice button
 */
setuptools.app.muledump.notices.add = function(title, callback, argList) {

    var queue = setuptools.app.muledump.notices.queue;
    var modifiers = {};
    if ( typeof argList === 'object' && Array.isArray(argList) === false ) {

        modifiers = $.extend(true, {}, argList);
        argList = modifiers.argList;

    }

    //  search for and deduplicate incoming entries
    if ( queue.find(function(object) {
            return object.title === title;
    }) ) return;

    //  adjust the argList to meet our format
    if ( typeof argList === 'undefined' ) argList = [];
    if ( Array.isArray(argList) === false ) argList = [argList];

    //  add the entry to the queue
    queue.push({
        index: queue.length,
        title: title,
        callback: callback,
        argList: argList,
        modifiers: modifiers
    });

    window.techlog('Notice: ' + title, 'force');

};

/**
 * @function
 * Check for new notices and display them
 */
setuptools.app.muledump.notices.monitor = function() {

    if ( typeof setuptools.tmp.noticesMonitorMax !== 'number' ) setuptools.tmp.noticesMonitorMax = 0;
    if ( setuptools.tmp.noticesMonitorInterval ) clearInterval (setuptools.tmp.noticesMonitorInterval);
    setuptools.tmp.noticesMonitorAge = 0;
    setuptools.tmp.noticesMonitorInterval = setInterval(function() {

        //  if the queue grows we'll update the system
        var queue = setuptools.app.muledump.notices.queue;
        if ( queue.length > setuptools.tmp.noticesMonitorMax ) {

            setuptools.tmp.noticesMonitorMax = queue.length;
            setuptools.app.muledump.notices.display();

        }

        //  don't run indefinitely
        setuptools.tmp.noticesMonitorAge++;
        if ( setuptools.tmp.noticesMonitorAge > setuptools.config.noticesMonitorMaxAge ) clearInterval(setuptools.tmp.noticesMonitorInterval);

    }, 1000);

};

/**
 * @function
 * @param {number} queuePos
 * Remove the specified notice
 */
setuptools.app.muledump.notices.remove = function(queuePos) {

    var noticeDom = $('#notice');
    setuptools.app.muledump.notices.queue.splice(queuePos, 1);
    if ( setuptools.app.muledump.notices.queue.length === 0 ) noticeDom.fadeOut(1000, function() {
        $(this).remove();
    })

};

/**
 * @function
 * Build and display the notice button
 */
setuptools.app.muledump.notices.display = function() {

    //  do nothing if the queue is empty
    var queue = setuptools.app.muledump.notices.queue;
    if ( queue.length === 0 ) return;

    //  search for notify button class overrides
    var classOrder = ['notifyPulse', 'rateLimited'];
    var notifyClass = 'notifyPulse';
    var modifiers = {};
    for ( var i = 0; i < queue.length; i++ )
        if (
            typeof queue[i].modifiers === 'object'
        ) {

            //  determine if this queue object has priority modifiers
            if (
                typeof queue[i].modifiers.notifyClass === 'string' &&
                classOrder.indexOf(queue[i].modifiers.notifyClass) > classOrder.indexOf(notifyClass)
            ) notifyClass = queue[i].modifiers.notifyClass;

            //  if this matches the newly selected class or if no class has been selected then use these modifiers
            if ( classOrder.indexOf(notifyClass) === 0 || notifyClass === queue[i].modifiers.notifyClass ) modifiers = queue[i].modifiers;

        }

    //  build the context menu
    var noticeDom = $('#notice');
    noticeDom.unbind('click').click(function() {

        //  close the menu if it is already open
        if ( setuptools.lightbox.menu.context.isOpen('notices') === true ) {

            setuptools.lightbox.menu.context.close();
            return;

        }

        //  build menu options
        var options = [
            {
                option: 'pos',
                vpx: noticeDom.outerHeight(true)+4
            },
            {
                option: 'css',
                css: {
                    "width": 'auto',
                    "max-width": '500px',
                    "background-color": '#2c2c2c'
                }
            },
            {
                option: 'skip',
                value: 'reposition'
            },
            {
                option: 'hover',
                action: 'close'
            }
        ];

        if ( typeof modifiers.menuClass === 'string' ) options.push({
            option: 'class',
            value: modifiers.menuClass
        });

        for ( var i = 0; i < queue.length; i++ ) options.push({
            class: 'notice-' + i,
            name: queue[i].title,
            callback: function(input) {
                input[0].apply(undefined, input[1]);
            },
            callbackArg: [queue[i].callback, queue[i].argList]
        });

        options.push({
            class: 'close',
            name: 'Close'
        });

        //  create the context menu
        setuptools.lightbox.menu.context.create('notices', false, noticeDom, options);

    });

    //  display the button
    noticeDom.addClass(notifyClass).show();

};

/* AffaSearch(TM) */

/**
 * @function
 * Prepare the account search menu
 */
setuptools.app.muledump.pagesearch.init = function() {

    //  generate a PageList of account guids and igns
    var Accounts = ( setuptools.app.config.determineFormat(setuptools.data.accounts) === 0 ) ? window.accounts : setuptools.data.accounts.accounts;
    for ( var guid in Accounts ) {

        if ( Accounts.hasOwnProperty(guid) ) {

            setuptools.app.muledump.pagesearch.state.list.push({
                username: guid,
                ign: ( (Accounts[guid].ign) ? Accounts[guid].ign : undefined )
            });

        }

    }

    //  create pagination object
    setuptools.app.muledump.pagesearch.paginate = new setuptools.lightbox.menu.paginate.create(
        setuptools.app.muledump.pagesearch.state.list,
        undefined,
        'pagesearch',
        undefined,
        undefined,
        undefined,
        {
            search: {
                container: 'div#top',
                keys: ['ign', 'username'],
                keyup: true,
                execute: setuptools.app.muledump.pagesearch.execute,
                skip: ['reposition'],
                channel: {
                    keyup: setuptools.app.muledump.quickUserAdd
                },
                context: function(self, e) {

                    e.preventDefault();
                    setuptools.app.muledump.mulemenu(e, $(self).text(), undefined, $('div#pagesearch'), {
                        top:[{
                            option: 'header',
                            value: $(self).text()
                        }],
                    });

                }
            }
        }
    );

    setuptools.app.muledump.pagesearch.bind();

};

/**
 * @function
 * Bind PageSearch menu actions
 */
setuptools.app.muledump.pagesearch.bind = function() {

    new setuptools.lightbox.menu.search.bind(
        setuptools.app.muledump.pagesearch.paginate,
        false,
        'div#top',
        undefined,
        {
            h: 'left',
            v: 'top',
            vpx: 28,
            hpx: 0
        }
    );

};

/**
 * @function
 * @param state
 * @param searchTerm
 * Perform the lookup and search action
 */
setuptools.app.muledump.pagesearch.execute = function(state, searchTerm) {

    //  find our result object
    var object = setuptools.app.muledump.pagesearch.paginate.PageList.find(function(element) {
        return ( element.ign === searchTerm || element.username === searchTerm )
    });

    window.techlog('PageSearch/Scroll to ' + JSON.stringify(object));

    //  get positioning information
    var fix = $('#fix').outerHeight();
    var mule = mules[object.username].dom;
    var pos = mule.offset();

    //  generate the notice panel
    var panel = $('<div>')
        .css({
            left: pos.left-5,
            top: pos.top-50
        })
        .addClass('pagesearch result flex-container')
        .html(' \
            <div>Here!</div>\
        ');

    //  display panel and set removal timeout
    $('body').append(panel);
    setTimeout(function() {
        panel.fadeOut(2500, function() {
            $(this).remove();
        });
    }, 500);

    //  scroll to the result position
    window.scrollTo(0, pos.top-fix-50);

    //  empty the search bar
    $('div#pagesearch input').val('').blur();
    if ( setuptools.data.config.pagesearch === 1 ) $('#pagesearch').removeClass('full').addClass('small');

};

/**
 * @function
 * @param {string} guid
 * @returns {string}
 * Returns the display name for a provided guid
 */
setuptools.app.muledump.getName = function(guid) {

    return ( (
        setuptools.state.loaded === true &&
        setuptools.data.config.mqDisplayIgn === true &&
        typeof setuptools.data.accounts.accounts[guid].ign === 'string'
    ) ? setuptools.data.accounts.accounts[guid].ign : guid );

};

/**
 * @function
 * @param {string | array} keys
 * @param {object} e
 * @param {boolean} [raw]
 * Return the state of the specified keys
 */
setuptools.app.muledump.keys = function(keys, e, raw) {

    if ( typeof keys === 'undefined' ) return;
    if ( typeof keys === 'string' ) keys = [keys];
    if ( !Array.isArray(keys) ) return;

    var keymap = $.extend(true, setuptools.data.muledump.keys[0], setuptools.data.muledump.keys[setuptools.data.config.keyBindings]);
    var result = {};
    keys.filter(function(key) {
        result[key] = e[keymap[key]] || false;
    });

    if ( keys.length === 1 ) return result[keys[0]];
    if ( raw === true ) return result;
    var falseCount = 0;
    Object.filter(result, function(key, value) {
        if ( value === false ) falseCount++;
    });
    return ( falseCount === 0 );

};

/**
 * @function
 * @param {string} option
 * @param {boolean} [value]
 * @param {boolean} [skip]
 * Toggle the state of the specified options
 */
setuptools.app.muledump.toggleoption = function(option, value, skip) {

    if ( typeof option === 'undefined' ) return;
    if ( typeof option === 'string' ) option = [option];
    if ( Array.isArray(option) === false ) return;

    //  switch the option
    for ( var i = 0; i < option.length; i++) setuptools.data.options[option[i]] = ( typeof value === 'undefined' ) ? !setuptools.data.options[option[i]] : value;

    //  totals filter keys need to update the secondary item filter list
    setuptools.app.muledump.totals.updateSecondaryFilter();

    if ( skip !== true ) {
        update_totals();
        update_filter();
        options_save();
    }

};

/**
 * @function
 * @param {object} e
 * Create a quick access menu for various UI endpoints and commands
 */
setuptools.app.muledump.bodymenu = function(e) {

    e.preventDefault();
    var options = [{
        option: 'customPos',
        h: 'left',
        v: 'top',
        hpx: e.pageX-5,
        vpx: e.pageY-15
    },
    {
        option: 'skip',
        value: 'reposition'
    },
    {
        option: 'keyup',
        value: false
    },
    {
        option: 'class',
        value: 'smallMenuCells'
    },
    {
        option: 'css',
        css: {
            'width': '150px'
        }
    },
    {
        option: 'hover',
        action: 'close'
    }];

    var MuleQueueButton = $('#mulequeue');
    if ( MuleQueueButton.hasClass('running') === true || MuleQueueButton.hasClass('paused') === true ) {

        options.push({
            option: 'header',
            value: 'MuleQueue'
        });

        if ( setuptools.app.mulequeue.state.paused === false ) {

            options.push({
                class: 'pauseQueue',
                name: 'Pause Reload',
                callback: function () {
                    setuptools.app.mulequeue.task.pause();
                }
            });

        } else {

            options.push({
                class: 'resumeQueue',
                name: 'Resume Reload',
                callback: function () {
                    setuptools.app.mulequeue.task.resume();
                }
            });

        }

        options.push({
            class: 'cancelQueue',
            name: 'Cancel Reload',
            callback: function() {
                setuptools.app.mulequeue.task.cancel();
            }
        });

    } else {

        options.push({
            class: 'startQueue',
            name: 'Reload Accounts',
            callback: function () {
                setuptools.app.mulequeue.task.reload();
            }
        });

    }

    if ( setuptools.state.loaded === true ) options.push(
        {
            option: 'header',
            value: 'Managers'
        },
        {
            class: 'setuptoolsAccount',
            name: 'Accounts',
            callback: function() {
                setuptools.app.accounts.manager();
            }
        },
        {
            class: 'setuptoolsGroups',
            name: 'Groups',
            callback: function() {
                setuptools.app.groups.manager();
            }
        },
        {
            class: 'setuptoolsSettings',
            name: 'Settings',
            callback: function() {
                setuptools.app.config.settings();
            }
        },
        {
            class: 'setuptoolsTotals',
            name: 'Totals',
            callback: setuptools.app.muledump.totals.menu.settings
        });

    setuptools.lightbox.menu.context.create('bodymenu', false, $('body'), options);

};

/**
 * @function
 * @param {object} e
 * @param {string} guid
 * @param {jQuery} [context]
 * @param {jQuery} [track]
 * @param {object} [extraopts]
 * Display the account mule menu
 */
setuptools.app.muledump.mulemenu = function(e, guid, context, track, extraopts) {

    var accounts = ( setuptools.app.config.determineFormat(setuptools.data.accounts) === 1 ) ?
        setuptools.app.config.convert(setuptools.data.accounts, 0) :
        window.accounts;

    if ( typeof accounts !== 'object' ) return;
    if ( typeof extraopts !== 'object' ) extraopts = {};

    //  convert ign to guid
    if ( typeof accounts[guid] === 'undefined' && setuptools.app.config.determineFormat(setuptools.data.accounts) === 1 )
        Object.keys(setuptools.data.accounts.accounts).filter(function(element) {
            if ( setuptools.data.accounts.accounts[element].ign === guid ) guid = element;
        });

    if ( !accounts[guid] ) return;

    var muleId = 'mule-' + setuptools.seasalt.hash.sha256(guid);
    if ( e ) e.preventDefault();
    if ( !context && setuptools.lightbox.menu.context.isOpen(muleId) === true ) {
        setuptools.lightbox.menu.context.close();
        return;
    }

    if ( context ) setuptools.lightbox.menu.context.close();

    var options = [];

    if ( typeof extraopts.top === 'object' ) options = options.concat(extraopts.top);

    options.push(
        {
            option: 'keyup',
            value: false
        },
        {
            option: 'hover',
            action: 'close'
        },
        {
            option: 'class',
            value: 'smallMenuCells'
        }
    );

    if ( typeof track === 'undefined' ) {

        //  right-click context menus open with different positioning data
        if (context) {

            options.push(
                {
                    option: 'pos',
                    h: 'right',
                    v: 'bottom',
                    hpx: -5,
                    vpx: -15
                },
                {
                    option: 'absPos',
                    h: 'left',
                    v: 'top',
                    hpx: e.pageX,
                    vpx: e.pageY
                },
                {
                    option: 'header',
                    value: 'Mule Menu'
                }
            );

        } else {

            options.push({
                option: 'pos',
                h: 'right',
                hpx: 8
            });

        }

    } else {

        options.push({
            option: 'absPos',
            h: 'left',
            v: 'top',
            hpx: track.offset().left,
            vpx: track.offset().top+28
        })

    }

    options.push({
        class: 'reloadImmediate',
        name: 'Reload Account',
        callback: function(guid) {
            setuptools.app.mulequeue.task.start(guid);
        },
        callbackArg: guid
    });

    //  add one click login option if enabled
    if ( guid.indexOf('steamworks:') === -1 && window.mulelogin) {

        options.push({
            option: 'link',
            class: 'oneclick',
            name: 'One click login',
            href: setuptools.app.muledump.mulelink(guid)
        });

    } else {

        options.push({
            option: 'link',
            class: 'oneclick',
            name: 'One click login',
            href: setuptools.config.oneclickHelp,
            target: '_blank'
        });

    }

    //  add global options
    if ( setuptools.data.options.totals === true ) options.push({
        class: 'toggleTotals',
        name: ((
            Array.isArray(setuptools.app.muledump.totals.config.getKey('accountFilter')) === false ||
            (
                Array.isArray(setuptools.app.muledump.totals.config.getKey('accountFilter')) === true &&
                setuptools.app.muledump.totals.config.getKey('accountFilter').indexOf(guid) === -1
            )) ? 'Add to' : 'Remove from' ) + ' Account Filter',
        callback: function(guid) {

            if ( setuptools.app.muledump.totals.config.getKey('accountFilter').indexOf(guid) === -1 ) {
                setuptools.app.muledump.totals.config.getKey('accountFilter').push(guid);
            } else setuptools.app.muledump.totals.config.getKey('accountFilter').splice(setuptools.app.muledump.totals.config.getKey('accountFilter').indexOf(guid), 1);
            setuptools.app.muledump.totals.config.setKey('accountFilter', setuptools.app.muledump.totals.config.getKey('accountFilter'));
            setuptools.app.muledump.totals.updateSecondaryFilter();
            setuptools.tmp.globalTotalsCounter.import();
            setuptools.app.config.save('Mule Menu - Modifying totalsFilter', true);
            window.update_totals();
            window.update_filter();
            option_updated('totals');

        },
        callbackArg: guid
    });

    if (
        setuptools.app.config.determineFormat(setuptools.data.accounts, 0) === true ||
        (setuptools.state.loaded === true && setuptools.data.accounts.accounts[guid].loginOnly === false )
    ) options.push(
        {
            class: 'chsort',
            name: 'Character Sorting Lists',
            callback: function(guid) {
                //  v1  //  setuptools.app.muledump.chsortcustom(mules[guid]);
                setuptools.app.muledump.charsort.menu(guid);
            },
            callbackArg: guid
        }
    );

    options.push({
        class: 'openWardrobe',
        name: 'Skin Wardrobe',
        callback: function(guid) {
            setuptools.app.muledump.ownedSkins(guid);
        },
        callbackArg: guid
    },{
        class: 'openWhitebags',
        name: 'Whitebag Tracker',
        callback: function(guid) {
            setuptools.app.muledump.whitebag.tracker(guid);
        },
        callbackArg: guid
    },{
        class: 'copyMenuOpen',
        name: "Copy...",
        callback: setuptools.app.muledump.copymenu,
        callbackArg: guid
    });

    if ( mules[guid].loginOnly === false && mules[guid].disabled === false ) options.push({
        class: 'screenshotMenuOpen',
        name: "Screenshot...",
        callback: setuptools.app.muledump.screenshotmenu,
        callbackArg: guid
    });

    if ( !context ) {
        $(this).addClass('selected');
    } else {
        context.addClass('selected');
    }

    if ( typeof extraopts.bottom === 'object' ) options = options.concat(extraopts.bottom);
    if ( typeof track === 'undefined' && context ) track = context;
    if ( typeof track === 'undefined' ) track = $(this);
    setuptools.lightbox.menu.context.create(muleId, false, track, options, track);

};

/**
 * @function
 * @param {string} guid
 * Displays the screenshot menu for the specified account
 */
setuptools.app.muledump.screenshotmenu = function(guid) {

    if (
        typeof mules[guid] === 'undefined' ||
        mules[guid].loginOnly === true ||
        mules[guid].disabled === true
    ) return;

    var position = $('div.setuptools.menu');
    var options = [{
        option: 'skip',
        value: 'reposition'
    },
        {
            option: 'header',
            value: 'Screenshot Menu'
        },
        {
            option: 'hover',
            action: 'close',
            timer: 'mulemenu-screenshot'
        },
        {
            option: 'class',
            value: 'smallMenuCells'
        },
        {
            class: 'ssEntireMule',
            name: 'Entire Mule',
            callback: function(guid) {
                setuptools.app.muledump.exporter.canvas($(mules[guid].dom)[0]);
            },
            callbackArg: guid
        }
    ];

    if ( mules[guid].opt('accountinfo') ) options.push({
        class: 'ssAccountInfo',
        name: 'Account Info',
        callback: function(guid) {
            setuptools.app.muledump.exporter.canvas($(mules[guid].dom.find('div.stats'))[0]);
        },
        callbackArg: guid
    });

    if ( $(mules[guid].dom.find('table.chars'))[0] !== undefined ) options.push(
        {
            class: 'ssCharTable',
            name: 'Character Table',
            callback: function(guid) {
                setuptools.app.muledump.exporter.canvas($(mules[guid].dom.find('table.chars'))[0]);
            },
            callbackArg: guid
    });

    if ( mules[guid].opt('vaults') ) options.push({
        class: 'ssVaults',
        name: 'Vault Table',
        callback: function(guid) {
            setuptools.app.muledump.exporter.canvas($(mules[guid].dom.find('table.vaults'))[0]);
        },
        callbackArg: guid
    });

    if ( mules[guid].opt('gifts') ) options.push({
        class: 'ssGifts',
        name: 'Gift Table',
        callback: function(guid) {
            setuptools.app.muledump.exporter.canvas($(mules[guid].dom.find('table.gifts'))[0]);
        },
        callbackArg: guid
    });

    setuptools.lightbox.menu.context.create('mulemenu-screenshot', true, position, options);

};

/**
 * @function
 * @param {string} guid
 * Display the copy menu for the specified account
 */
setuptools.app.muledump.copymenu = function(guid) {

    //  generate menu options
    var position = $('div.setuptools.menu');
    var options = [{
        option: 'skip',
        value: 'reposition'
    },
        {
            option: 'header',
            value: 'Copy Menu'
        },
        {
            option: 'hover',
            action: 'close',
            timer: 'mulemenu-copy'
        },
        {
            option: 'class',
            value: 'smallMenuCells'
        },
        {
            class: 'copySelection username',
            name: 'Username',
            callback: function(guid) {

                new ClipboardJS('div.setuptools.menu > div.link', {
                    text: function() {
                        return guid;
                    }
                });

            },
            callbackArg: guid
        }
    ];

    //  offer ign if known
    if ( setuptools.app.config.determineFormat(setuptools.data.accounts) === 1 &&
        typeof setuptools.data.accounts.accounts[guid].ign === 'string'
    ) options.push({
        class: 'copySelection ign',
        name: 'IGN',
        callback: function(guid) {

            new ClipboardJS('div.setuptools.menu > div.link', {
                text: function() {
                    return setuptools.data.accounts.accounts[guid].ign;
                }
            });

        },
        callbackArg: guid
    });

    //  offer password
    options.push({
        class: 'copySelection password',
        name: 'Password',
        callback: function(guid) {

            new ClipboardJS('div.setuptools.menu > div.link', {
                text: function() {
                    return ( setuptools.app.config.determineFormat(setuptools.data.accounts) === 1 ) ?
                        setuptools.data.accounts.accounts[guid].password :
                        window.accounts[guid];
                }
            });

        },
        callbackArg: guid
    });

    //  offer deep copy
    options.push({
        class: 'copySelection deepcopy',
        name: 'Deep Copy',
        callback: function(guid) {

            new ClipboardJS('div.setuptools.menu > div.link', {
                text: function() {
                    return setuptools.app.accounts.ExportDeepCopy(guid, true);
                }
            });

        },
        callbackArg: guid
    });

    //  offer account json
    /*  //  dsiabled until importing account json strings is fully supported
    var accountJson;
    if ( setuptools.app.config.determineFormat(setuptools.data.accounts) === 1 ) {

        var dataKeys = Object.keys(setuptools.data.accounts.accounts[data.mule.guid]).sort(function(a, b) {
            return (a > b);
        });
        var dataObject = {};
        for ( var i = 0; i < dataKeys.length; i++ )
                dataObject[dataKeys[i]] = setuptools.data.accounts.accounts[data.mule.guid][dataKeys[i]];

        accountJson = ('{"' + data.mule.guid + '": ' + JSON.stringify(dataObject, null, 5) + '}');

    } else accountJson = ('{"' + data.mule.guid + '": "' + window.accounts[data.mule.guid] + '"}');

    options.push({
        class: 'copySelection',
        name: 'Account JSON',
        attributes: {
            'data-clipboard-text': accountJson
        }
    });
    */

    setuptools.lightbox.menu.context.create('mulemenu-copy', true, position, options);

};

setuptools.app.muledump.quickUserAdd = function() {

};

/**
 * @function
 * @param {object} totals
 * Automatically adjust totals width
 */
setuptools.app.muledump.totalsWidth = function(totals) {

    //  update totals width
    var totalswidth = setuptools.data.config.totalswidth;
    var totalItems = Object.keys(totals).length;

    //  if total items is less than the totalswidth then we need to adjust it
    if ( totalItems < setuptools.data.config.totalswidth ) totalswidth = totalItems;

    //  if totalswidth is set to whole screen we need to determine how many items that could possibly be
    if ( setuptools.data.config.totalswidth === 0 ) {

        var maxItems = Math.floor($(window).innerWidth()/setuptools.config.totalsItemWidth);
        if ( totalItems < maxItems ) totalswidth = totalItems;

    }

    $('#totals').css({'max-width': ( (totalswidth === 0) ?
            //  calculate the max-width for totals
            (setuptools.config.totalsItemWidth*(Math.floor($(window).innerWidth()/setuptools.config.totalsItemWidth)))-setuptools.config.totalsItemWidth+2 :

            //  set fixed max-width for totals
            (totalswidth*setuptools.config.totalsItemWidth)+2
    )});

};

/**
 * @function
 * @param {string} guid
 * @returns {string}
 * Generate a one click login url
 */
setuptools.app.muledump.mulelink = function(guid) {

    //  does not support guid's or testing
    if (
        guid.match(setuptools.config.regex.guid) !== null ||
        (setuptools.state.loaded === true && setuptools.data.accounts.accounts[guid].testing === true)
    ) return;

    //  return the link
    return 'muledump:' + sodium.to_hex(guid) + '-' + sodium.to_hex(window.accounts[guid]);

};

/*
//  Realmeye features
*/

/**
 * @function
 * @param {number} itemNumber
 * @param {string} link
 * @param {number} [extra]
 * @returns {string | void}
 * Generate links to the realmeye wiki for items
 */
setuptools.app.muledump.realmeye.link = function(itemNumber, link, extra) {

    var itemName;

    //  determine itemName
    if ( typeof itemNumber === 'number' || typeof Number(itemNumber) === 'number' ) itemName = items[itemNumber][0];

    //  if we still don't have the item hex yet, let's assume it's the item's exact name
    if ( typeof itemNumber === 'undefined' ) itemName = itemNumber;

    //  determine uri
    if ( link === 'wiki' ) {
        itemName = itemName.toLowerCase().replace(/(\s|')/g, '-');
    } else if ( link === 'sell' ) {
        link = 'offers-to/buy';
        itemName = itemNumber;
    } else if ( link === 'buy' ) {
        link = 'offers-to/sell';
        itemName = itemNumber;
    } else return;

    if ( typeof extra !== 'undefined' && (typeof extra === 'number' || typeof Number(extra) === 'number') ) extra = '/' + extra;

    return setuptools.config.realmeyeUrl + '/' + link + '/' + itemName + ( (typeof extra === 'string') ? extra : '' );

};

/**
 * @function
 * @param {object} e
 * React to ctrl+click actions
 */
setuptools.app.muledump.realmeye.itemCtrlUp = function(e) {

    var selected = setuptools.app.muledump.realmeye.state.selected;

    //  single item menu
    if ( selected.length === 1 ) {

        var position = $(selected[0]);
        var options = [{
            option: 'header',
            value: 'Realmeye Menu'
        },
        {
            option: 'close',
            callback: function() {
                for ( var i in setuptools.app.muledump.realmeye.state.selected )
                    if ( setuptools.app.muledump.realmeye.state.selected.hasOwnProperty(i) )
                        $(setuptools.app.muledump.realmeye.state.selected[i]).removeClass('realmeyeBorder');
                setuptools.app.muledump.realmeye.state.selected = [];
                setuptools.lightbox.menu.context.close();
            }
        },
        {
            option: 'css',
            css: {
                width: 'auto'
            }
        },
        {
            option: 'pos',
            vpx: 44
        },
        {
            option: 'hover',
            action: 'close',
            timer: 'realmeyeMenu'
        },
        {
            option: 'link',
            name: 'View in Wiki',
            href: setuptools.app.muledump.realmeye.link($(selected[0]).attr('data-itemid'), 'wiki'),
            target: '_blank'
        }];

        var item = items[$(selected[0]).attr('data-itemid')];
        if ( setuptools.config.realmeyeOfferIds.indexOf(Number($(selected[0]).attr('data-itemid'))) > -1 ) options.push({
            option: 'link',
            name: 'Buy ' + item[0],
            href: setuptools.app.muledump.realmeye.link($(selected[0]).attr('data-itemid'), 'buy'),
            target: '_blank'
        },
        {
            option: 'link',
            name: 'Sell ' + item[0],
            href: setuptools.app.muledump.realmeye.link($(selected[0]).attr('data-itemid'), 'sell'),
            target: '_blank'
        });

        setuptools.lightbox.menu.context.create('realmeyeMenu', false, position, options);

    }
    //  trading menu
    else if ( selected.length === 2 ) {

        //  we only allow the last two selected items to be used
        for ( var x = 0; x < (selected.length-2); x++ ) $(selected[x]).removeClass('realmeyeBorder');

        var position = $(selected[selected.length-1]);
        var options = [{
                option: 'header',
                value: 'Realmeye Offers Menu'
            },
            {
                option: 'close',
                callback: function() {
                    for ( var i in setuptools.app.muledump.realmeye.state.selected )
                        if ( setuptools.app.muledump.realmeye.state.selected.hasOwnProperty(i) )
                            $(setuptools.app.muledump.realmeye.state.selected[i]).removeClass('realmeyeBorder');
                    setuptools.app.muledump.realmeye.state.selected = [];
                    setuptools.lightbox.menu.context.close();
                }
            },
            {
                option: 'css',
                css: {
                    width: 'auto'
                }
            },
            {
                option: 'pos',
                vpx: 44
            },
            {
                option: 'hover',
                action: 'close',
                timer: 'realmeyeMenu'
        }];

        //  build the menu if both items can be traded on realmeye
        var item = items[$(selected[0]).attr('data-itemid')];
        if (
            setuptools.config.realmeyeOfferIds.indexOf(Number($(selected[0]).attr('data-itemid'))) > -1 &&
            setuptools.config.realmeyeOfferIds.indexOf(Number($(selected[1]).attr('data-itemid'))) > -1
        ) {
            options.push({
                option: 'link',
                name: 'Buy ' + items[$(selected[0]).attr('data-itemid')][0],
                href: setuptools.app.muledump.realmeye.link($(selected[0]).attr('data-itemid'), 'buy', $(selected[1]).attr('data-itemid')),
                target: '_blank'
            },
            {
                option: 'link',
                name: 'Sell ' + items[$(selected[1]).attr('data-itemid')][0],
                href: setuptools.app.muledump.realmeye.link($(selected[0]).attr('data-itemid'), 'sell', $(selected[1]).attr('data-itemid')),
                target: '_blank'
            });
        } else {

            for ( var x = 0; x < selected.length; x++ ) $(selected[x]).removeClass('realmeyeBorder');
            setuptools.app.muledump.realmeye.state.selected = [];
            return;

        }

        setuptools.lightbox.menu.context.create('realmeyeMenu', false, position, options);

    } else {

        //  one or both items is ineligible for trading
        for ( var x = 0; x < selected.length; x++ ) $(selected[x]).removeClass('realmeyeBorder');
        setuptools.app.muledump.realmeye.state.selected = [];

    }

};

/**
 * @function
 * @param self
 * Update item on selection in Realmeye menu
 */
setuptools.app.muledump.realmeye.itemSelection = function(self) {

    var item = $(self);
    if ( item.hasClass('realmeyeBorder') === false ) {
        setuptools.app.muledump.realmeye.state.selected.push(self);
        item.addClass('realmeyeBorder');
    }

};

/**
 * @function
 * @param {string} string
 * Cleanup secondary cache data
 */
setuptools.app.muledump.cleanupSecondaryCache = function(string) {

    if ( ['string', 'undefined'].indexOf(typeof string) === -1 ) return;
    var keyCheck = new RegExp('^' + setuptools.config.keyPrefix + 'cache:.+$', 'i');
    for ( var key in localStorage )
        if ( localStorage.hasOwnProperty(key) )
            if (
                key.match(keyCheck) !== null &&
                ( typeof string === 'undefined' || (key.indexOf(string) > -1) )
            ) localStorage.removeItem(key);

};

/**
 * @function
 * @param {string} guid
 * Clean up local storage data for a specific account
 */
setuptools.app.muledump.cleanupDataForGuid = function(guid) {

    if ( typeof guid !== 'string' ) return;
    for ( var key in localStorage )
        if ( localStorage.hasOwnProperty(key) )
            if ( key.indexOf(guid) > -1 )
                localStorage.removeItem(key);

};

/**
 * @function
 * Muledump online about page
 */
setuptools.app.muledump.about = function() {

    if (setuptools.state.hosted === false) {
        setuptools.app.muledump.checkupdates(true);
    } else {

        setuptools.lightbox.build('muledump-checkupdates', ' \
            You are on the latest version. \
            <br><br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp docs nostyle" target="_blank">v' + VERSION + ' Changelog</a> | \
            <a href="' + setuptools.config.url + '/" target="_blank">Muledump Homepage</a> | \
            <a href="https://github.com/jakcodex/muledump" target="_blank">Github</a> \
            <br><br>Muledump Online is updated automatically with new versions. \
            <br><br>Jakcodex Support Discord - <a href="https://discord.gg/JFS5fqW" target="_blank">https://discord.gg/JFS5fqW</a> \
        ');

        setuptools.lightbox.settitle('muledump-checkupdates', '<strong>Muledump Online v' + VERSION + '</strong>');
        setuptools.lightbox.display('muledump-checkupdates', {variant: 'select'});

        $('.drawhelp.docs').on('click.muledump.aboutdocs', function (e) {
            setuptools.lightbox.ajax(e, {title: 'About Muledump', url: $(this).attr('href')}, this);
        });

    }

};

/**
 * @function
 * @param {boolean} [force]
 * Muledump local check for updates and display an about page
 */
setuptools.app.muledump.checkupdates = function(force) {

    //  compare two versions
    function cmpver(v1, v2) {
        v1 = v1.split('.');
        v2 = v2.split('.');
        for (var i = 0; i < v1.length && i < v2.length; i++) {
            var r = (v1[i] || 0) - (v2[i] || 0);
            if (r) return r;
        }
        return v1.length - v2.length;
    }

    //  if no updates are available then this
    function BaseMessage() {

        setuptools.lightbox.build('muledump-about', 'You are on the latest release.<br>');

    }

    //  build the final message data and display it
    function DisplayMessage() {

        setuptools.state.notifier = true;
        setuptools.lightbox.build('muledump-about', ' \
                    <br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp docs nostyle" target="_blank">Changelog</a> | \
                    <a href="' + setuptools.config.url + '/" target="_blank">Muledump Homepage</a> | \
                    <a href="https://github.com/jakcodex/muledump" target="_blank">Github</a> \
                    <br><br>Jakcodex Support Discord - <a href="https://discord.gg/JFS5fqW" target="_blank">https://discord.gg/JFS5fqW</a>\
                    <br><br>Did you know Muledump can be loaded from Github now? \
                    <br><br>Check out <a href="' + setuptools.config.url + '/muledump.html" target="_blank">Muledump Online</a> to see it in action. \
                ');
        if (setuptools.state.loaded === true && setuptools.data.config.enabled === true) setuptools.lightbox.build('muledump-about', ' \
                    <br><br>Create and download a <a href="#" class="setuptools app backups noclose">backup</a> from here to get online fast. \
                ');

        setuptools.lightbox.override('backups-index', 'goback', function () {
        });
        setuptools.lightbox.settitle('muledump-about', '<strong>Muledump Local v' + VERSION + '</strong>');
        setuptools.lightbox.display('muledump-about', {variant: 'select center'});
        $('.setuptools.app.backups').click(setuptools.app.backups.index);
        $('.drawhelp.docs').click(function (e) {
            setuptools.lightbox.ajax(e, {title: 'About Muledump', url: $(this).attr('href')}, this);
        });

    }

    //  process the github tags api response
    function ProcessResponse(data) {

        if (data.meta.status !== 200) {

            if (force === true) {

                BaseMessage();
                DisplayMessage();

            }

            return;
        }

        if (typeof setuptools.tmp.updatecheck === 'undefined') setuptools.tmp.updatecheck = {
            expires: Date.now() + setuptools.config.updatecheckTTL,
            data: data
        };

        //  head of renders check
        var currentRendersData = rendersVersion.match(setuptools.config.regex.renderscheck);
        var currentRenders = new Date(currentRendersData[1], (currentRendersData[2] - 1), currentRendersData[3], currentRendersData[4], currentRendersData[5], currentRendersData[6]);
        var latestRenders = new Date(currentRendersData[1], (currentRendersData[2] - 1), currentRendersData[3], currentRendersData[4], currentRendersData[5], currentRendersData[6]);
        var latestRendersName = currentRendersData[7];
        var latestRendersData;

        var d = data.data, topver = VERSION, url;
        for (var i = 0; i < d.length; i++) {

            //  version check
            if (d[i].name.indexOf('renders-') === -1 && cmpver(d[i].name, topver) > 0) {
                topver = d[i].name;
                url = setuptools.config.githubArchive + topver + '.zip';
            }

            //  middle of renders check
            var rendersData = d[i].name.match(setuptools.config.regex.renderscheck);
            if (typeof rendersData === 'object' && rendersData !== null) {

                var newTimestamp = new Date(rendersData[1], (rendersData[2] - 1), rendersData[3], rendersData[4], rendersData[5], rendersData[6]);
                if (newTimestamp > latestRenders) {
                    latestRenders = newTimestamp;
                    latestRendersName = rendersData[7];
                    latestRendersData = d[i];
                }

            }

        }

        //  tail of renders check
        if (latestRenders > currentRenders) setuptools.app.muledump.notices.add(
            'New renders update available for ' + latestRendersName,
            function (d, i, rendersData, currentRendersName, latestRendersName) {
                var arg = $.extend(true, [], latestRendersData, rendersData, {
                    currentRenders: currentRendersName,
                    latestRenders: latestRendersName
                });
                setuptools.app.assistants.rendersupdate(arg);
            },
            [d, i, rendersData, currentRendersData[7], latestRendersName]
        );

        //  display the lightbox if a url is provided
        window.techlog("Update found: " + url, 'hide');

        var notifiedver = setuptools.storage.read('updatecheck-notifier');
        if (url) setuptools.app.muledump.notices.add(
            'Muledump v' + topver + ' now available!',
            setuptools.app.muledump.checkupdates,
            true
        );

        if (url && (force === true || (!force && setuptools.data.options.updatecheck === true && (typeof notifiedver === 'undefined' || (typeof notifiedver === 'string' && cmpver(notifiedver, topver) > 0))))) {

            DoDisplayMessage = true;
            setuptools.lightbox.build('muledump-about', ' \
                        <div style="width: 100%; border: #ffffff solid 2px; padding: 10px; background-color: #111;">\
                            Jakcodex/Muledump v' + topver + ' is now available! \
                            <br><br><a download="muledump-' + topver + '.zip" href="' + url + '">' + url + '</a> \
                        </div>\
                    ');

            setuptools.storage.write('updatecheck-notifier', topver);

        }

        if (force === true && !url) {

            DoDisplayMessage = true;
            BaseMessage();

        }

        if (DoDisplayMessage === true) DisplayMessage();

    }

    var DoDisplayMessage = false;

    //  send the request if there is no cached data or the cache has expired
    if (
        typeof setuptools.tmp.updatecheck === 'undefined' ||
        (
            typeof setuptools.tmp.updatecheck === 'object' &&
            Date.now() >= setuptools.tmp.updatecheck.expires
        )
    ) {

        //  delete any old cache data
        if (typeof setuptools.tmp.updatecheck === 'object') delete setuptools.tmp.updatecheck;

        //  send the request
        var xhr = $.ajax({
            dataType: 'jsonp',
            url: setuptools.config.updatecheckURL
        });

        xhr.fail(function () {
            if ( force === true ) {
                BaseMessage();
                DisplayMessage();
            }
        });

        xhr.done(ProcessResponse);

    }
    //  fresh response data located, don't call the api again
    else ProcessResponse(setuptools.tmp.updatecheck.data);

};

/*
//  White Bag Tracker
*/

/**
 * @function
 * @param {boolean} [full]
 * @returns {object}
 * Gather a list of white bag items from constants
 */
setuptools.app.muledump.whitebag.items = function(full) {

    //  pull a list of whitebags from constants
    setuptools.tmp.whitebagsFull = ( typeof setuptools.tmp.whitebagsFull === 'object' ) ?
        setuptools.tmp.whitebags :
        Object.filter(items, function(key, value) {
            if ( value[7] === 6 ) return true;
        });

    //  if full === true we will send the items and their data
    if ( full === true ) return setuptools.tmp.whitebagsFull;

    //  but typically we'll only need to send the item ids after converting them from strings
    if ( typeof setuptools.tmp.whitebagsCompact === 'object' ) return setuptools.tmp.whitebagsCompact;
    setuptools.tmp.whitebagsCompact = Object.keys(setuptools.tmp.whitebagsFull);
    setuptools.tmp.whitebagsCompact.filter(function(element, index) {
        setuptools.tmp.whitebagsCompact[index] = Number(element);
    });
    return setuptools.tmp.whitebagsCompact;

};

/**
 * @function
 * @param {string} guid
 * @param {boolean} [counters]
 * @param {boolean} [owned]
 * Initialize the base object for a new guid
 */
setuptools.app.muledump.whitebag.init = function(guid, counters, owned) {

    //  it's so big!
    var config = setuptools.data.muledump.whitebagTracker;

    //  generate the base configuration for new accounts
    if ( typeof config.accounts[guid] === 'undefined' ) config.accounts[guid] = $.extend(true, {}, setuptools.objects.whitebagTrackerAccount);
    if ( typeof config.accounts[guid] === 'object' ) {
        if ( counters === true ) config.accounts[guid].items = {};
        if ( owned === true ) config.accounts[guid].owned = [];
    }

};

/**
 * @function
 * @param {string} guid
 * @param {object} config
 * Saves the specified configuration permanently
 */
setuptools.app.muledump.whitebag.save = function(guid, config) {

    setuptools.data.muledump.whitebagTracker.accounts[guid] = config;
    setuptools.app.config.save('Whitebags/Totals saving changes', true);

};

/**
 * @function
 * @param guid
 * Display Whitebag Tracker for Totals Count
 */
setuptools.app.muledump.whitebag.tracker = function(guid) {

    setuptools.lightbox.close();
    setuptools.tmp.wbSaveOnClose = false;

    //  initialize the base object if this account is new here
    setuptools.app.muledump.whitebag.init(guid);

    //  it's so big!
    var config = $.extend(true, {}, setuptools.data.muledump.whitebagTracker.accounts[guid]);

    //  build our ui
    setuptools.lightbox.build('whitebag-totals', ' \
        <div class="wbmenu flex-container">\
            <div class="flex-container mr5">\
                <select class="setuptools menuTiny" name="wbaction">\
                    <option value="totals">' + ( (setuptools.data.config.wbTotals === true) ? 'Disable' : 'Enable' ) + ' Totals</option>\
                    <option>Save</option>\
                    <option>Clear</option>\
                    <option>Import</option>\
                    <option>Reset</option>\
                    <option>Cancel</option>\
                </select>\
            </div>\
            <div class="flex-container ml5"><div class="muledump link go menuStyle notice menuTiny textCenter">Go</div></div>\
        </div>\
        <div class="wbmenu flex-container">\
            <div class="flex-container mr5">\
                <select class="setuptools menuTiny textCenter" name="wbexport">\
                    <option value="txt" ' + ( (setuptools.data.config.exportDefault === 1) ? 'selected' : '' ) + '>Text</option>\
                    <option ' + ( (setuptools.data.config.exportDefault === 2) ? 'selected' : '' ) + '>CSV</option>\
                    <option ' + ( (setuptools.data.config.exportDefault === 3) ? 'selected' : '' ) + '>JSON</option>\
                    <option ' + ( (setuptools.data.config.exportDefault === 4) ? 'selected' : '' ) + '>Image</option>\
                    <option ' + ( (setuptools.data.config.exportDefault === 5) ? 'selected' : '' ) + '>Imgur</option>\
                </select>\
            </div>\
            <div class="flex-container ml5"><div class="muledump link export notice menuStyle menuTiny textCenter">Export</div></div>\
        </div>\
        <div class="flex-container bg222">\
            <div class="wbstage bg333"> \
                ' + ( (mules[guid].opt('accountName') === true ) ? '<div class="header">' + setuptools.app.muledump.getName(guid) + '</div>' : '' ) + ' \
                <div class="items"><div class="bg333"></div></div> \
            </div> \
        </div>\
        <div class="w100">&nbsp;\
            <br><strong>Legend</strong>\
            <br>Shift+Click items to add/remove them from the owned list\
            <br>Click items to increase the quantity by 1\
            <br>Ctrl+Click items to decrease the quantity by 1\
            <br>Auto saves on close\
        </div>\
    ');

    //  display our ui
    setuptools.lightbox.settitle('whitebag-totals', 'White Bag Tracker');
    setuptools.lightbox.drawhelp('whitebag-totals', 'docs/muledump/whitebags', 'White Bag Tracker Help');
    setuptools.lightbox.display('whitebag-totals', {
        variant: 'fl-Whitebags',
        afterClose: function() {

            if ( setuptools.tmp.wbSaveOnClose !== true ) return;
            setuptools.app.muledump.whitebag.save(guid, config);

        }
    });

    //  obtain and sort the whitebags list
    var whitebags = {};
    var wbitems = ((setuptools.app.muledump.whitebag.items()).filter(function(item) {
        whitebags[item] = 0;
        return true;
    })).sort(function(a,b) {
        //  sort alphabetically if same slotType
        if ( items[a][1] === items[b][1] ) {
            if ( items[a][0] < items[b][0] ) return -1;
            if ( items[a][0] > items[b][0] ) return 1;
            //  identical names; sort by itemid instead
            return a-b;
        }
        //  sort by slotType
        return (items[a][1]-items[b][1]);
    });

    //  merge the whitebags list with the configuration data
    config.items = $.extend(true, whitebags, config.items);

    //  populate items
    var itemsDom = $('div.wbstage > div.items > div');
    wbitems.filter(function(key) {
        var selected = false;
        if ( config.owned.indexOf(key) === -1 && config.items[key] > 0 ) config.owned.push(key);
        if ( config.owned.indexOf(key) > -1 ) selected = true;
        var itemDom = window.item(key, 'wb noselect' + ( (selected === true) ? ' selected' : '' ), ( (setuptools.data.config.wbTotals === true) ? (config.items[key] || 0) : undefined ));
        itemDom.appendTo(itemsDom);
    });

    //  select the newly inserted items
    var wbitemsdom = $('div.item.wb');

    //  bind tooltips
    setuptools.app.muledump.tooltip(wbitemsdom, 'whitebagTrackerTooltip', 750);

    //  bind increment/decrement
    wbitemsdom.on('click.wb.increment', function(e) {

        var itemid = Number($(this).attr('data-itemid'));

        if ( setuptools.app.muledump.keys('shift', e) === true ) {

            if ( config.owned.indexOf(itemid) === -1 ) {
                $(this).addClass('selected');
                config.owned.push(itemid);
            } else {
                if ( setuptools.data.config.wbTotals === true && config.items[itemid] > 0 ) return;
                $(this).removeClass('selected');
                config.owned.splice(
                    config.owned.indexOf(itemid),
                    1
                );
                config.items[itemid] = 0;
            }
            setuptools.tmp.wbSaveOnClose = true;
            return;

        }

        if ( setuptools.data.config.wbTotals === false ) return;
        var value = Number($(this).text());
        if ( typeof value !== 'number' ) value = 0;
        if ( value === 0 && setuptools.app.muledump.keys('ctrl', e) === true ) return;
        value = ( setuptools.app.muledump.keys('ctrl', e) === true ) ?
            (
                (value > 0) ?
                    value-1 :
                    value
            ) :
            value+1;

        setuptools.tmp.wbSaveOnClose = true;
        $(this).find('div').text(value);
        if ( value > 0 ) {
            $(this).addClass('selected');
            if ( config.owned.indexOf(itemid) === -1 ) config.owned.push(itemid);
        }
        if (
            value === 0 &&
            config.owned.indexOf(itemid) === -1
        ) $(this).removeClass('selected');
        config.items[itemid] = value;

    });

    //  handle the actions menu button
    $('div.muledump.link.go').on('click.wbmenu.go', function() {

        var action = $('select[name="wbaction"]').val().toLowerCase();
        if ( action === 'reset' ) {
            setuptools.tmp.wbSaveOnClose = false;
            setuptools.app.muledump.whitebag.tracker(guid);
        } else if ( action === 'cancel' ) {
            setuptools.tmp.wbSaveOnClose = false;
            setuptools.lightbox.close();
        } else if ( action === 'clear' ) {
            setuptools.app.muledump.whitebag.init(guid, true, true);
            setuptools.tmp.wbSaveOnClose = false;
            setuptools.app.muledump.whitebag.tracker(guid);
        } else if ( action === 'save' ) {
            setuptools.tmp.wbSaveOnClose = false;
            setuptools.app.muledump.whitebag.save(guid, config);
            setuptools.lightbox.status($(this), 'Ok!');
        } else if ( action === 'totals' ) {
            setuptools.data.config.wbTotals = !( setuptools.data.config.wbTotals );
            setuptools.app.config.save('WhiteBag/Tracker switching wbTotals option', true);
            setuptools.app.muledump.whitebag.tracker(guid);
        } else if ( action === 'import' ) {

            setuptools.lightbox.build('whitebags-import', ' \
                This replaces the current values by counting current inventory. \
                <br>&nbsp;\
                <br>How do you wish to proceed?\
                \
                <div class="flex-container wbimportoptions">\
                    <div class="muledump link import reset menuStyle positive textCenter mb5 flex-container noFlexAutoWidth"><div>Import</div><div>Reset counters and owned</div></div>\
                    <div class="muledump link import clear menuStyle positive textCenter mb5 flex-container noFlexAutoWidth"><div>Import</div><div>Reset counters</div></div>\
                    <div class="muledump link import keep menuStyle notice textCenter mb5 flex-container noFlexAutoWidth"><div>Import</div><div>Keep existing data</div></div>\
                    <div class="muledump link import cancel menuStyle negative textCenter">Cancel</div>\
                </div>\
            ');

            setuptools.lightbox.settitle('whitebags-import', 'Import from Inventory');
            setuptools.lightbox.drawhelp('whitebags-import', 'docs/features/whitebags', 'White Bag Tracker Help');
            setuptools.lightbox.display('whitebags-import', {variant: 'nobackground'});

            //  bind cancel button
            $('div.muledump.link.import.cancel').on('click.import.cancel', function() {
                setuptools.lightbox.close('whitebags-import');
            });

            //  bind confirm button
            $('div.muledump.link.import:not(.cancel)').on('click.import.confirm', function(e) {

                var action;
                if ( $(this).hasClass('clear') ) {
                    action = 'clear';
                } else if ( $(this).hasClass('reset') ) {
                    action = 'reset';
                }

                //  ctrl+click overrides the zeroing of existing data
                if ( action === 'clear' ) setuptools.app.muledump.whitebag.init(guid, true);
                if ( action === 'reset' ) setuptools.app.muledump.whitebag.init(guid, true, true);
                var config = $.extend(true, {}, setuptools.data.muledump.whitebagTracker.accounts[guid]);

                wbitems.filter(function(itemid) {
                    itemid = Number(itemid);
                    var newvalue = (config.items[itemid] || 0);
                    if ( mules[guid].totals instanceof Muledump_TotalsCounter ) newvalue += (mules[guid].totals.data.totals[itemid] || 0);
                    setuptools.data.muledump.whitebagTracker.accounts[guid].items[itemid] = (setuptools.data.muledump.whitebagTracker.accounts[guid].items[itemid] || 0)+newvalue;
                });

                setuptools.app.config.save('Whitebags/Totals saving after import');
                setuptools.app.muledump.whitebag.tracker(guid);

            });

        }

    });

    //  handle the export button
    $('div.muledump.link.export').on('click.wb.export', function(e) {

        //  build our base object
        var action = $('select[name="wbexport"]').val().toLowerCase();
        var owned = {};
        config.owned.filter(function(itemid) {
            owned[itemid] = 1;
        });

        //  insert goback button to exporter page
        setuptools.lightbox.insert('exporter-main', 'goback', ['exporter-main', function() {
            setuptools.app.muledump.whitebag.tracker(guid);
        }]);

        //  close lightbox and proceed to exporter
        setuptools.lightbox.close();
        setuptools.app.muledump.exporter.ui.main(undefined, action, {
            items: 11,
            totals: config.items,
            sortorder: wbitems,
            filter: owned,
            fillStyle: '#88a09b',
            strokeStyle: '#dcf7fe',
            minTotal: -1,
            fillNumbers: ( setuptools.data.config.wbTotals === true )
        });

    });

};

/*
//  Muledump Exporter
*/

/**
 * @function
 * @param dom
 * @param {boolean} [quiet]
 * @param {function} [callback]
 * @returns {*}
 * Generate an image of the specified dom
 */
setuptools.app.muledump.exporter.canvas = function(dom, quiet, callback) {

    function canvas() {

        try {

            html2canvas(dom).then(function (canvas) {

                if (setuptools.app.muledump.exporter.state.canvasWait === true) {

                    if ( quiet !== true ) setuptools.lightbox.close('canvas-loading');
                    setuptools.app.muledump.exporter.state.canvasWait = false;
                    if ( typeof callback === 'function' ) {
                        callback(canvas);
                        return;
                    }
                    setuptools.app.muledump.exporter.ui.main(canvas);

                }

                //  rip all those cpu cycles if they closed the loading window

            }).finally(function () {
                setuptools.app.muledump.exporter.state.canvasWait = false;
            });

        } catch(e) {

            return false;

        }

        return true;

    }

    //  one at a time
    if ( setuptools.app.muledump.exporter.state.canvasWait === true ) return;
    setuptools.app.muledump.exporter.state.canvasWait = true;

    //  normal mode will display a waiting screen
    if ( quiet !== true ) {

        setuptools.lightbox.build('canvas-loading', 'This may take awhile for larger images. Please wait...');
        setuptools.lightbox.settitle('canvas-loading', 'Generating Image');
        setuptools.lightbox.display('canvas-loading', {
            closeSpeed: 0,
            afterClose: function() {
                setuptools.app.muledump.exporter.state.canvasWait = false;
            },
            afterOpen: canvas
        });
        return;

    }

    //  quietly mode silently generates the image and returns the result
    return canvas();

};

/**
 * @function
 * @param {string} canvas
 * @param {function} [callback]
 * @returns {boolean}
 */
setuptools.app.muledump.exporter.imgur = function(canvas, callback) {

    if ( typeof callback !== 'function' ) callback = function(data, err, errDesc) {
        setuptools.app.techlog('Muledump/Exporter imgur received response: ' + ( (err || errDesc) ? errDesc : JSON.stringify(data) ));
    };

    if ( typeof canvas !== 'string' ) return false;
    var data = canvas.split(',')[1];

    $.ajax({
        type: 'POST',
        url: 'https://api.imgur.com/3/upload.json',
        data: {
            image: data,
            type: 'base64'
        },
        headers: {
            'Authorization': 'Client-ID ' + setuptools.data.exporter.remote.imgur
        },
        dataType: 'json'
    }).done(function(data) {

        callback(data);

    }).fail(function(xhr, err, errDesc) {

        callback(xhr, err, errDesc);

    });

};

/**
 * @function
 * @param {string} type
 * @param {object} [override]
 * @returns {string}
 * Generate the Totals text export data
 */
setuptools.app.muledump.exporter.text = function(type, override) {

    if ( typeof override !== 'object' ) override = {};
    var totals = override.totals || window.totals;
    var ids = override.sortorder || window.ids;
    var items = window.items;
    var e = {txt: [], csv: [], json: {}};
    if ( !e[type] ) return 'Invalid text export type requested';
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (!totals[id]) continue;
        var name = items[id][0], amt = totals[id];
        e.txt.push(amt + '\t' + name);
        e.csv.push('"' + name + '",' + amt);
        e.json[name] = amt;
    }
    e.txt = e.txt.join('\n');
    e.csv = e.csv.join('\n');
    e.json = JSON.stringify(e.json, null, '    ');
    return e[type];

};

/**
 * @function
 * @param {string} type
 * @param {string} data
 * @param {function} [callback]
 * Upload a paste to the Paste API
 */
setuptools.app.muledump.exporter.paste = function(type, data, callback) {

    if ( typeof callback !== 'function' ) callback = function(data, err, errDesc) {

        setuptools.app.techlog('Muledump/Exporter Paste API response: ' + JSON.stringify(data));

    };

    var format = 'plaintext';
    if ( type === 'json' ) format = 'json';
    if ( type === 'csv' ) format = 'csv';
    var pasteOptions = {
        content: data,
        type: format,
        title: 'Muledump Totals'
    };
    if ( typeof setuptools.data.exporter.remote.paste === 'string' ) pasteOptions.apiKey = setuptools.data.exporter.remote.paste;
    $.ajax(setuptools.config.remotePasteUrl, {
        method: 'POST',
        data: pasteOptions
    }).fail(callback).done(callback);

};

/**
 * @function
 * @param {string} string
 * @param {string} [type]
 * Adds a link to the exporter history
 */
setuptools.app.muledump.exporter.saveLink = function(string, type) {

    setuptools.data.exporter.storedLinks.push([string, type]);
    if ( setuptools.data.exporter.storedLinks.length > setuptools.config.exporterStoredLinks ) setuptools.data.exporter.storedLinks.splice(
        0,
        setuptools.data.exporter.storedLinks.length-setuptools.config.exporterStoredLinks
    );

};

/**
 * @function
 * @param [canvas]
 * @param {string} [type]
 * @param {object} [override]
 * Displays the Muledump Exporter UI
 */
setuptools.app.muledump.exporter.ui.main = function(canvas, type, override) {

    if ( typeof type === 'undefined' && typeof canvas === 'undefined' ) {

        if ( setuptools.data.config.exportDefault === 1 ) {
            type = 'txt';
        } else if ( setuptools.data.config.exportDefault === 2 ) {
            type = 'csv';
        } else if ( setuptools.data.config.exportDefault === 3 ) {
            type = 'json';
        } else if ( setuptools.data.config.exportDefault === 4 ) {
            type = 'image';
        } else if ( setuptools.data.config.exportDefault === 5 ) {
            type = 'imgur';
        }

    }

    function render(canvas) {

        if ( typeof canvas === 'undefined' ) return;
        $('div.exporter.status').html('<div> \
        ' + (
            ( typeof canvas === 'string' && canvas.match(/^https?:\/\/.*$/) ) ? '<br>Your Imgur Link: <a href="' + canvas + '" target="_blank">' + canvas + '</a><br>&nbsp;' : ''
        ) + '\
                <br>Right click and choose "Save image as..."<br>&nbsp;\
        ');

        //  append doms directly to the canvas
        if ( typeof canvas === 'object' ) {
            $('div.canvas.exporter').html(canvas);
        }

        //  strings can either be a base64 or imgur link
        if ( typeof canvas === 'string' ) {

            if ( canvas.match(/^https?:\/\/.*$/) ) {
                $('div.canvas.exporter').html('<a href="' + canvas + '" target="_blank"><img src="' + canvas + '"></a>');
            } else if ( canvas.match(/^data:image\/.*$/) ) {
                $('div.canvas.exporter').html('<img src="' + canvas + '">');
            } else {
                $('div.exporter.status').html('<br>No totals information available');
                $('div.canvas.exporter').html('');
            }

        }

        setuptools.app.ga('send', 'event', {
            eventCategory: 'detect',
            eventAction: 'export-html2canvas'
        });

    }

    setuptools.lightbox.build('exporter-main', '\
        <div class="flex-container exporterMenu">\
            <div><strong>Totals Export</strong></div>\
            <div>\
                <select class="setuptools select totals export mode" style="width: auto;">\
                    <option value="image" ' + ( (type === 'image') ? 'selected' : '' ) + '>Image</option>\
                    <option value="txt" ' + ( (type === 'txt') ? 'selected' : '' ) + '>Text</option>\
                    <option value="csv" ' + ( (type === 'csv') ? 'selected' : '' ) + '>CSV</option>\
                    <option value="json" ' + ( (type === 'json') ? 'selected' : '' ) + '>JSON</option>\
                </select>\
            </div>\
            <div class="setuptools link canvas totals export local menuStyle menuSmall textCenter noclose">Create</div>\
            <div class="setuptools link canvas totals export remote imgur menuStyle menuSmall notice textCenter noclose mr0">Upload to  ' + ( (type === 'image' || type === 'imgur' || typeof type === 'undefined') ? 'Imgur' : 'Paste' ) + '</div>\
            <!--<div class="setuptools link canvas mules menuStyle menuTiny noclose">All Mules</div>--> \
        </div>\
        <div class="exporter status textCenter"></div>\
        <div class="flex-container exporter canvas">' + ( (typeof canvas === 'string') ? 'Loading image...' : '' ) + '</div>\
        <div class="flex-container canvas content" style="overflow: hidden;"></div>\
    ');
    setuptools.lightbox.settitle('exporter-main', 'Muledump Exporter');
    setuptools.lightbox.drawhelp('exporter-main', 'docs/muledump/exporter', 'Muledump Exporter Help');
    setuptools.lightbox.display('exporter-main', {variant: 'fl-Exporter'});

    var local = $('div.setuptools.link.canvas.totals.export.local');
    var remote = $('div.setuptools.link.canvas.totals.export.remote');
    var mode = $('select.setuptools.select.totals.export.mode');
    mode.on('change.totals.export.mode', function() {

        if ( $(this).val() === 'image' ) {

            remote.removeClass('paste').addClass('imgur').text('Upload to Imgur');

        } else {

            remote.removeClass('imgur').addClass('paste').text('Upload to Paste');

        }

    });

    //  handle local requests
    function procLocal(type) {

        if ( type === 'image' ) {

            $('div.exporter.canvas').html('&nbsp;<br>Loading image...');
            render_totals(render, override);

        } else {


            //  produce the text export
            var text = setuptools.app.muledump.exporter.text(type, override);
            //setuptools.app.ga('send', 'event', {
            //    eventCategory: 'detect',
            //    eventAction: 'export-' + type
            //});

            $('div.exporter.status').html('');
            $('div.exporter.canvas').html('<textarea class="setuptools text exporter w100 scrollbar">' + text + '</textarea>');

        }

    }

    function procRemote(type) {

        //  process imgur uploads
        if ( type === 'image' ) {

            function imgur(data, err, errDesc) {

                var statusDom = $('div.exporter.status');

                //  did we get a link back
                if ( typeof data === 'object' && typeof data.data === 'object' && typeof data.data.link === 'string' ) {

                    setuptools.app.muledump.exporter.saveLink(data.data.link, 'image');
                    render(data.data.link);

                }
                //  no we did not
                else {

                    statusDom.prepend('<br><strong class="negative">Error</strong>: Failed to upload to Imgur<br>' + errDesc);

                }

            }

            var image = $('div.canvas.content img');
            if ( image.length === 0 || (image.length === 1 && image.attr('src').match(/^https?:\/\/.*/) !== null) ) {

                if ( image.length === 0 ) $('div.exporter.status').html('<br>Uploading to Imgur...<br>&nbsp;');
                if ( image.length > 0 ) $('div.exporter.status').html('<br>Uploading to Imgur...<br>&nbsp;');
                render_totals(function (canvas) {

                    if ( canvas.match(/^data:image\/.*$/) ) {
                        setuptools.app.muledump.exporter.imgur(canvas, imgur);
                    } else {
                        $('div.exporter.status').html('<br>No totals information available');
                        $('div.canvas.exporter').html('');
                    }

                }, override);

            } else if ( image.length === 1 ) {

                $('div.exporter.status').html('<br>Uploading to Imgur...<br>&nbsp;');
                setuptools.app.muledump.exporter.imgur(image.attr('src'), imgur);

            } else $('div.exporter.canvas').html('<br>Error processing request. Reload and try again.');

        }
        //  process paste uploads
        else {

            $('div.exporter.status').html('<br>Uploading to Paste...<br>&nbsp;');
            var text = setuptools.app.muledump.exporter.text(type, override);
            setuptools.app.muledump.exporter.paste(type, text, function(data, err, errDesc) {

                if ( err !== 'success' || data.data.error === true ) {
                    $('div.exporter.status').html('<br><strong class="negative">Error</strong>: Failed to upload to Paste<br>&nbsp;');
                    return;
                }

                if ( setuptools.data.exporter.remote.paste === false ) {

                    setuptools.data.exporter.remote.paste = data.data.result.apiKey;
                    setuptools.data.exporter.remote.pastesecret = data.data.result.secretKey;
                    setuptools.app.config.save('Storing Paste API Key');

                }

                setuptools.app.muledump.exporter.saveLink(data.data.result.link, type);
                var status = $('div.exporter.status');
                var pl = status.find('a.paste.link');
                if ( pl.length === 1 ) {

                    pl.attr('href', data.data.result.link).text(data.data.result.link);
                    return;

                }

                status.html('<br>Your Paste Link: <a href="' + data.data.result.link + '" target="_blank" class="paste link">' + data.data.result.link + '</a><br>&nbsp;');

            });

            $('div.exporter.canvas').html('<textarea class="setuptools text exporter w100 scrollbar m0">' + text + '</textarea>');

        }

    }

    local.on('click.totals.export.local', function() {
        procLocal(mode.val());
    });

    //  handle remote requests
    remote.on('click.totals.export.remote', function() {
        procRemote(mode.val());
    });

    if ( canvas instanceof jQuery ) {

        $('div.exporter.canvas').html('&nbsp;<br>Loading image...');
        setuptools.app.muledump.exporter.canvas(canvas[0], true, render);

    } else {

        if ( typeof type === 'string' && ['txt', 'csv', 'json', 'image'].indexOf(type) > -1 ) {
            procLocal(type);
        } else if ( type === 'imgur' ) {
            procRemote('image');
        } else {
            render(canvas);
        }

    }

    //

    $('div.setuptools.link.canvas.mules').on('click.screenshot.mules', function() {

        $('div.exporter.canvas').html('&nbsp;<br>Loading image...');
        setuptools.app.muledump.exporter.canvas($('#stage')[0], true, render);

    });

};

/**
 * @function
 * @param {jQuery} [track]
 * Draw the Muledump Exporter button menu
 */
setuptools.app.muledump.exporter.ui.menu = function(track) {

    if ( !(track instanceof jQuery) ) track = $('#exporter');
    setuptools.lightbox.menu.context.close('exportermenu');
    var options = [
        {
            option: 'hover',
            action: 'close'
        },
        {
            option: 'scrollLock',
            hook: '#exporter'
        },
        {
            option: 'skip',
            value: 'reposition'
        },
        {
            option: 'class',
            value: 'smallMenuCells exporterMenu'
        },
        {
            option: 'css',
            css: {
                width: track.outerWidth()*1.5
            }
        },
        {
            option: 'pos',
            h: 'left',
            v: 'top',
            vpx: 28
        },
        {
            class: 'exportText',
            name: 'Text',
            callback: function() { setuptools.app.muledump.exporter.ui.main(undefined, 'txt'); }
        },
        {
            class: 'exportCSV',
            name: 'CSV',
            callback: function() { setuptools.app.muledump.exporter.ui.main(undefined, 'csv'); }
        },
        {
            class: 'exportJSON',
            name: 'JSON',
            callback: function() { setuptools.app.muledump.exporter.ui.main(undefined, 'json'); }
        },
        {
            class: 'exportImage',
            name: 'Image',
            callback: function() { setuptools.app.muledump.exporter.ui.main(undefined, 'image'); }
        },
        {
            class: 'exportImgur',
            name: 'Imgur',
            callback: function() { setuptools.app.muledump.exporter.ui.main(undefined, 'imgur'); }
        }
    ];

    setuptools.lightbox.menu.context.create('exportermenu', false, track, options);

};

/**
 * @function
 * @param {object} c
 * @param {jQuery} [$c]
 * @returns {void | jQuery}
 * Return or render the character portrait and description
 */
setuptools.app.muledump.drawPortrait = function(c, $c) {

    var cl = classes[c.ObjectType];

    if ( $c instanceof jQuery ) {

        //  look for ld/lt/xp boost
        var boost = $('<img class="boost hidden" src="lib/media/boost.png">');
        var boosts = [c.XpBoosted, c.XpTimer, c.LDTimer, c.LTTimer];
        var boostHtml = '';
        for ( var x = 0; x < boosts.length; x++ ) {
            if ( boosts[x] !== "0" ) {

                boost.removeClass('hidden');
                var length = '';

                if ( c.XpBoosted !== "0" ) {

                    length = Math.floor(Number(c.XpTimer)/60) + ' minutes';
                    if ( c.XpTimer === "0" ) length = "Until Level 20";
                    boostHtml += '<div class="cfleft ignore">XpBooster</div><div class="cfright ignore">' + length + '</div>';

                }

                if ( c.LDTimer !== "0" ) {

                    length = Math.floor(Number(c.LDTimer)/60);
                    boostHtml += '<div class="cfleft ignore">Loot Drop</div><div class="cfright ignore">' + length + ' minutes</div>';

                }

                if ( c.LTTimer !== "0" ) {

                    length = Math.floor(Number(c.LTTimer)/60);
                    boostHtml += '<div class="cfleft ignore">Loot Tier</div><div class="cfright ignore">' + length + ' minutes</div>';

                }

                break;

            }

        }

    }

    var portimg = $('<img class="portrait">');
    window.portrait(portimg, c.ObjectType, c.Texture, c.Tex1, c.Tex2);
    var chtext = $('<div>');
    if ( typeof boost !== 'undefined' ) chtext.append(boost);
    chtext.append($('<div style="padding-top: 3px;">').text(cl[0] + ' ' + c.Level + ", " + c.muledump.MaxedStats + "/8" + ', #' + c.id))
          .append($('<div>').text(c.CurrentFame + ' F ' + c.Exp + ' XP'));

    var chdesc = $('<div class="chdesc">')
        .append(portimg)
        .append(chtext);

    if ( typeof $c === 'undefined' ) return chdesc;

    //  add it to the dom
    chdesc.appendTo($c);

    //  bind lt/ld/xp boost tooltip
    if ( boost && boost.hasClass('hidden') === false ) {

        boost.on('mouseenter.muledump.boostTooltip', [boost, boostHtml], function (e) {
            setuptools.lightbox.tooltip(
                e.data[0].parent().parent(),
                e.data[1],
                {
                    classes: 'tooltip-boost',
                    heightFrom: 'tooltip'
                }
            );
        });

        boost.on('mouseleave.muledump.boostTooltip', function() {
            $('.tooltip').remove();
        });

    }

    //  provide dye/texture data for portrait
    /*portimg.on('mouseover.muledump.portrait.tooltip', function() {
        $('.tooltip').remove();

        var tex1 = $(this).attr('data-tex1');
        var tex1 = $(this).attr('data-tex2');
        setuptools.lightbox.tooltip($(this).parent(), ' \
            Textile One\
            <br>Textile Two\
        ', {
            heightFrom: 'tooltip',
            classes: 'tooltip-textiles'
        });
    }).on('mouseleave.muledump.portrait.tooltip', function() {
        $('.tooltip').remove();
    });
    */

};

/*
//  Account Valuation
*/

setuptools.app.muledump.value = {
    items: {}
};

/**
 * @function
 * @param {number | string} itemid
 * @param {boolean} [raw]
 * @returns {number | object}
 * Calculates the value of an item
 */
setuptools.app.muledump.value.item = function(itemid, raw) {

    itemid = +itemid;
    if ( !items[itemid] || itemid === -1 ) return 0;
    if ( raw !== true && setuptools.app.muledump.value.items[itemid] ) return setuptools.app.muledump.value.items[itemid];

    var rel = setuptools.data.muledump.value.rel.item;
    var whites = setuptools.app.muledump.whitebag.items();
    var vst = items[itemid][setuptools.config.vstIndex];
    var value = {
        vst: ( (rel.vst[vst]) ? rel.vst[vst] : rel.vst.default ),
        tier: ( (items[itemid][2] > -1 ) ? (items[itemid][2]*((typeof rel.tier === 'number') ? rel.tier : 1)) : 0 ),
        fb: items[itemid][5]*((typeof rel.fb === 'number') ? rel.fb : 1),
        fp: items[itemid][6]*((typeof rel.fp === 'number') ? rel.fp : 1),
        white: ( ( whites.indexOf(itemid.toString()) > -1 ) ? (rel.white || 100) : 0 ),
        total: 0
    };

    Object.filter(value, function(key, element) {
        if ( key === 'total' ) return;
        value.total += element;
    });

    setuptools.app.muledump.value.items[itemid] = value.total;
    return ( raw === true ) ? value.total : value;

};

/**
 * @function
 * @param {string} guid
 * @param {string} charid
 * @param {boolean} [raw]
 * @returns {number | object | void}
 * Calculates the value of a character
 */
setuptools.app.muledump.value.char = function(guid, charid, raw) {

    if ( !mules[guid] ) return 0;
    var d = mules[guid].data.query.results.Chars;
    var chars;
    if ( !Array.isArray(d.Char) ) {
        chars = [d.Char];
    } else chars = $.extend(true, [], d.Char);

    var char = Object.filter(chars, function(key, element) {
        if ( +element.id === +charid ) return true;
    });

    if ( typeof char !== 'object' || Object.keys(char).length !== 1 ) return 0;

    var rel = setuptools.data.muledump.value.rel.char;
    char = char[Object.keys(char)[0]];
    var value = {
        level: +char.Level*((typeof rel.level === 'number') ? rel.level : 1),
        bp: ( ( +char.HasBackpack === 1 ) ? ((typeof rel.bp === 'number') ? rel.bp : 0) : 0 ),
        totalfame: char.muledump.TotalFame*((typeof rel.totalFame === 'number') ? rel.totalFame : 1),
        stats: char.muledump.MaxedStats*((typeof rel.stats === 'number') ? rel.stats : 1),
        inv: 0,
        equip: 0,
        total: 0
    };

    /*var charitems = char.Equipment.split(',').filter(function(itemid, index) {
        if ( index < 4 ) {
            value.inv += setuptools.app.muledump.value.item(+itemid, true)*((typeof rel.inv === 'number') ? rel.inv : 1)
        } else value.equip += (setuptools.app.muledump.value.item(+itemid, true)*((typeof rel.equip === 'number') ? rel.equip : 1))
    });*/

    Object.filter(value, function(key, element) {
        if ( key === 'total' ) return;
        value[key] = Number(element.toFixed(0));
        value.total += element;
    });

    value.total = Number(value.total.toFixed(0));
    return ( raw === true ) ? value.total : value;

};

/**
 * @function
 * @param {string} guid
 * @param {boolean} [raw]
 * Calculates the value of an account
 */
setuptools.app.muledump.value.mule = function(guid, raw) {

    if ( !(mules[guid] instanceof Mule) ) return 0;
    if ( typeof mules[guid].data === 'undefined' ) return 0;
    var d = mules[guid].data.query.results.Chars;
    var account = mules[guid].data.query.results;
    console.log(d);
    console.log(account);
    var chars;
    if ( !Array.isArray(d.Char) ) {
        chars = [d.Char]
    } else chars = $.extend(true, [], d.Char);

    var rel = setuptools.data.muledump.value.rel.mule;
    var value = {
        chars: 0,
        vaults: 0,
        gifts: 0,
        total: 0,
        openVaults: 0,
        charSlots: (account.maxCharNum*((typeof rel.charSlots === 'number') ? rel.charSlots : 1) || 0)
    };

    //  calculate character value
    chars.filter(function(char) {
        value.chars += setuptools.app.muledump.value.char(guid, char.id, true)*((typeof rel.chars === 'number') ? rel.chars : 1);
    });

    //  calculate gift vaults contents value
    var gifts = d.Account.Gifts.split(',');
    gifts.filter(function(itemid) {
        value.gifts += setuptools.app.muledump.value.item(itemid, true)*((typeof rel.gifts === 'number') ? rel.gifts : 1);
    });

    //  calculate vault contents value
    var vaults;
    if ( typeof d.Account.Vault.Chest === 'string' ) {
        vaults = [d.Account.Vault.Chest];
    } else if ( Array.isArray(d.Account.Vault.Chest) ) {
        vaults = $.extend(true, [], d.Account.Vault.Chest);
    } else vaults = [];

    vaults.filter(function(vault) {
        if ( typeof vault !== 'string' ) return;
        vault = vault.split(',');
        vault.filter(function(itemid) {
            value.vaults += setuptools.app.muledump.value.item(itemid, true)*((typeof rel.vaults === 'number') ? rel.vaults : 1);
        });
    });

    //  calculate value of owned skins
    account.OwnedSkins.filter(function(skinid) {
        skinid = +skinid;
    });

    //  total up all keys
    Object.filter(value, function(key, element) {
        if ( key === 'total' ) return;
        value[key] = Number(element.toFixed(0));
        value.total += element;
    });

    value.total = Number(value.total.toFixed(0));
    return ( raw === true ) ? value.total : value;

};

setuptools.app.muledump.value.generateCache = function(key, force) {

    var cache = {
        skins: {},
        skinitems: Object.filter(items, function(itemid, item) {
            //if ( item[0].match(/^.* Skin$/) !== null ) cache.skinitems[itemid] =
        })
    };

    //  build skins cache data
    Object.filter(skins, function(skinid, skin) {

        cache.skins[skinid] = {
            name: skin[0],
            item: Object.filter(items, function(itemid, item) {
                var pattern = new RegExp('^' + skin[0] + ' Skin$');
                if ( !( item[0].match(pattern) === null ) ) return true;

                pattern = new RegExp('^' + skin[0].replace(/\sStatue/, '') + ' Skin$');
                if ( !( item[0].match(pattern) === null ) ) return true;

                return false;

            })
        };

        cache.skins[skinid].item = cache.skins[skinid].item[Object.keys(cache.skins[skinid].item)[0]];

    });

};

/**
 * @function
 * @param {string} guid
 * @param {number | string} [tex1]
 * @param {number | string} [tex2]
 */
//  display owned skins
setuptools.app.muledump.ownedSkins = function(guid, tex1, tex2) {

    if ( !(mules[guid] instanceof Mule) ) return;

    setuptools.lightbox.close('wardrobe-index');

    //  sort out texture data
    if ( tex1 ) tex1 = Number(tex1);
    if ( tex2 ) tex2 = Number(tex2);
    if ( typeof tex1 !== 'number' || !textures[tex1] ) tex1 = (
        typeof setuptools.data.muledump.wardrobe.accounts[guid] === 'object' &&
        typeof setuptools.data.muledump.wardrobe.accounts[guid].clothes.large === 'number' &&
        textures[setuptools.data.muledump.wardrobe.accounts[guid].clothes.large]
    ) ? setuptools.data.muledump.wardrobe.accounts[guid].clothes.large : undefined;
    if ( typeof tex2 !== 'number' || !textures[tex2] ) tex2 = (
        typeof setuptools.data.muledump.wardrobe.accounts[guid] === 'object' &&
        typeof setuptools.data.muledump.wardrobe.accounts[guid].clothes.small === 'number' &&
        textures[setuptools.data.muledump.wardrobe.accounts[guid].clothes.small]
    ) ? setuptools.data.muledump.wardrobe.accounts[guid].clothes.small : undefined;
    var large;
    var small;
    if ( tex1 ) large = items[textures[tex1][1]];
    if ( tex2 ) small = items[textures[tex2][3]];
    if ( !large ) large = items[5073];
    if ( !small ) small = items[5074];

    //  obtain the base list of owned skins
    var ownedSkins = $.extend(true, [], mules[guid].data.query.results.Chars.OwnedSkins);
    ownedSkins.filter(function(element, index) {
        ownedSkins[index] = Number(element);
    });

    //  add default skins to owned list
    Object.keys(classes).filter(function(classid) {
        ownedSkins.push(Number(classid));
    });

    var count = {
        total: 0,
        owned: Object.keys(classes).length
    };
    var cache = true;

    //  build skinid map cache
    if ( typeof setuptools.tmp.skins !== 'object' ) setuptools.tmp.skins = {};
    if ( typeof setuptools.tmp.skins[guid] !== 'object' ) {

        cache = false;
        setuptools.tmp.skins[guid] = {};

        //  generate the base object
        Object.filter(classes, function (classid, data) {
            if ( !Array.isArray(setuptools.tmp.skins[guid][classid]) ) setuptools.tmp.skins[guid][classid] = {
                total: 0,
                owned: 0,
                skins: []
            };
        });

        //  populate skinids
        Object.filter(skins, function(skinid, data) {

            //  build a classlist
            var classlist = [];
            Object.keys(classes).filter(function(classid) {
                classlist.push(classes[classid][0]);
            });

            //  check skin validity
            if (
                [65535].indexOf(data[4]) > -1 ||
                data[0].match((new RegExp('^(?:.*? Set(?: Skin)?|Christmas (?:' + classlist.join('|') + '))$'))) !== null
            ) return;

            //  include skin
            setuptools.tmp.skins[guid][data[4]].skins.push(Number(skinid));

        });

        //  sort each class
        Object.filter(setuptools.tmp.skins[guid], function(classid, data) {
            data.skins.sort(function(a,b) {
                if ( classes[a] && !classes[b] ) return -1;
                if ( skins[a][1] === skins[b][1] ) return a-b;
                return skins[a][1] - skins[b][1];
            })
        });

    }

    //  build html
    var pieces = [];
    Object.filter(setuptools.tmp.skins[guid], function(classid, data) {

        classid = Number(classid);
        var classData = classes[classid];
        var html = ' \
            <div class="flex-container ownedSkins ' + classData[0] + '"> \
                <div class="flex-container mb5"> \
                    <div id="class-' + classData[0] + '"><strong>' + classData[0] + '</strong></div>\
                    <div>[[' + classid + '_count]]</div>\
                </div>\
                <div class="skinlist bg222" >\
        ';

        var skinDom = $('<div>');

        data.skins.filter(function(skinid) {

            skinid = Number(skinid);
            var $s = $('<img class="ownedSkins" style="padding: 5px; margin: 2px 3px 3px 2px; border: 1px transparent; overflow: hidden;" data-skinid="'+ skinid + '">');
            window.portrait($s, classid, skinid, tex1, tex2, false);
            if ( cache === false ) setuptools.tmp.skins[guid][classid].total++;
            count.total++;
            if ( ownedSkins.indexOf(skinid) > -1 ) {
                if ( cache === false ) setuptools.tmp.skins[guid][classid].owned++;
                count.owned++;
                $s.addClass('enabled');
            }
            skinDom.append($s);

        });

        //  insert skin count
        html = html.replace('[[' + classid + '_count]]', setuptools.tmp.skins[guid][classid].owned + ' of ' + setuptools.tmp.skins[guid][classid].total + ' (' + ( ((setuptools.tmp.skins[guid][classid].owned/setuptools.tmp.skins[guid][classid].total)*100).toFixed(0) ) + '%)');

        //  insert skins html
        html += ' \
                    ' + skinDom.html() + '\
                </div>\
            </div> \
        ';

        pieces.push([classid, html]);

    });

    //  sort pieces by class name
    pieces.sort(function(a,b) {
        if (classes[a[0]][0] < classes[b[0]][0]) return -1;
        if (classes[a[0]][0] > classes[b[0]][0]) return 1;
        return 0;
    });

    //  build page header
    setuptools.lightbox.build('wardrobe-index', ' \
        <div class="flex-container" style="justify-content: space-between;">\
            <ul style="padding-left: 40px;">\
                <li>Wardrobe for ' + setuptools.app.muledump.getName(guid) + '</li>\
                <li>You possess ' + count.owned + ' of ' + count.total + ' skins (' + ( ((count.owned/count.total)*100).toFixed(0) ) + '%)</li>\
            </ul>\
            <div class="flex-container noFlexAutoWidth" style="padding-right: 10px;">\
                <div class="cloth large item transbackground noselect mr5" style="background-position: -' + large[3] + 'px -' + large[4] + 'px;"></div>\
                <div class="cloth small item transbackground noselect mr5" style="background-position: -' + small[3] + 'px -' + small[4] + 'px;"></div>\
            </div>\
        </div>\
        <div class="flex-container classlinks" style="justify-content: space-evenly; flex-wrap: wrap;">\
    ');

    Object.keys(setuptools.tmp.skins[guid]).sort(function(a,b) {

        if ( classes[a][0] < classes[b][0] ) return -1;
        if ( classes[a][0] > classes[b][0] ) return 1;
        return 0;

    }).filter(function(classid) {

        var data = classes[classid];
        setuptools.lightbox.build('wardrobe-index', ' \
            <a href="#class-' + data[0] + '">\
                <img src="#" class="ownedSkins skinmenu" style="margin: 5px 7px; padding: 5px; overflow: hidden;" data-classid="'+ classid + '">\
            </a>\
        ');

    });

    setuptools.lightbox.build('wardrobe-index', ' \
        </div>\
        <div class="skinstage bg222">\
    ');

    //  insert pieces html to page
    pieces.filter(function(piece) {
        setuptools.lightbox.build('wardrobe-index', ' \
            ' + piece[1] + '\
        ');
    });

    setuptools.lightbox.build('wardrobe-index', ' \
        </div>\
        <div class="w100">&nbsp;\
            <br><strong>Legend</strong>\
            <br>Ctrl+Shift+Click within class block to take screenshot of class skins\
            <br>Ctrl+Shift+Click between class block to take screenshot of all classes \
        </div>\
    ');

    setuptools.lightbox.drawhelp('wardrobe-index', 'docs/muledump/wardrobe', 'Wardrobe Help');
    setuptools.lightbox.settitle('wardrobe-index', 'Skin Wardrobe');
    setuptools.lightbox.display('wardrobe-index', {variant: 'fl-Wardrobe'});

    //  insert images to class links
    Object.keys(classes).filter(function(classid) {

        var $s = $('img[data-classid="' + classid.toString() + '"]');
        window.portrait($s, classid, classid, tex1, tex2, false);
        setuptools.app.muledump.tooltip($s, 'ownedSkinsTooltip skinmenu', '<div>' + classes[classid][0] + '</div>', 100);

    });

    //  bind tooltips to skins
    $('img.ownedSkins:not(.skinmenu)').each(function() {

        var skinid = Number($(this).attr('data-skinid'));
        setuptools.app.muledump.tooltip($(this), 'ownedSkinsTooltip', '<div>' + skins[skinid][0] + '</div>');

    });

    //  bind cloth selection tool
    $('div.cloth.item').on('click.wardrobe.clothes', function(e) {

        setuptools.tmp.ownedSkinRefresh = false;

        //  is the size large or small (true or false)
        var clothindex = ( $(this).hasClass('large') ) ? 1 : 3;
        var clothkey = ( clothindex === 1 ) ? 'large' : 'small';

        //  sort through the textures object
        Object.keys(textures).filter(function(tex) {

            tex = Number(tex);
            if ( tex === 0xffffffff ) return;
            var texture = textures[tex];
            var cloth = items[texture[clothindex]];
            var enabled = '';
            if (
                typeof setuptools.data.muledump.wardrobe.accounts[guid] === 'object' &&
                setuptools.data.muledump.wardrobe.accounts[guid].clothes[clothkey] === tex
            ) enabled = 'enabled';

            setuptools.lightbox.build('wardrobe-clothes', ' \
                <div data-tex="' + tex + '" class="cloth selector item transbackground noselect mr5 ' + enabled + '" style="background-position: -' + cloth[3] + 'px -' + cloth[4] + 'px;"></div>\
            ');

        });

        setuptools.lightbox.drawhelp('wardrobe-clothes', 'docs/muledump/wardrobe', 'Wardrobe Help');
        setuptools.lightbox.settitle('wardrobe-clothes', false);
        setuptools.lightbox.display('wardrobe-clothes', {
            variant: 'fl-Wardrobe short nobackground',
            afterClose: function() {

                if ( setuptools.tmp.ownedSkinRefresh === true ) {
                    setuptools.app.config.save('SkinWardrobe/Clothes adjustment');
                    setuptools.app.muledump.ownedSkins(guid);
                }

            }
        });

        //  bind selector
        $('div.cloth.selector.item')
            .each(function() {

                var tex = $(this).attr('data-tex');
                tex = Number(tex);
                if ( tex === 0xffffffff || typeof tex !== 'number' ) return;
                var texture = textures[tex];
                setuptools.app.muledump.tooltip($(this), 'mb5 autoHeight highz ol1', '<div class="flex-container noFlexAutoWidth" style="color: #fff; flex-flow: column;">' + texture[clothindex-1] + '</div>');

            })
            .on('click.wardrobe.clothselector', function(e) {

            var tex = Number($(this).attr('data-tex'));
            if ( typeof tex !== 'number' ) return;

            //  make the object for the first time
            if ( typeof setuptools.data.muledump.wardrobe.accounts[guid] === 'undefined' ) setuptools.data.muledump.wardrobe.accounts[guid] = $.extend(true, {}, setuptools.objects.wardrobeConfig);

            //  update object to new format
            setuptools.data.muledump.wardrobe.accounts[guid] = $.extend(true, setuptools.objects.wardrobeConfig, setuptools.data.muledump.wardrobe.accounts[guid]);

            //  trigger the refresh on close
            setuptools.tmp.ownedSkinRefresh = true;

            //  deselect this
            if ( $(this).hasClass('enabled') ) {

                //  update the clothes array
                delete setuptools.data.muledump.wardrobe.accounts[guid].clothes[clothkey];
                $(this).removeClass('enabled');

            }
            //  select this
            else {

                //  update the clothes array
                setuptools.data.muledump.wardrobe.accounts[guid].clothes[clothkey] = tex;
                $(this).siblings().removeClass('enabled');
                $(this).addClass('enabled');

            }

        });

    });

    //  bind screenshot hotkeys
    $('div.ownedSkins:not(.skinmenu)').on('click.skins.block', function(e) {

        if ( setuptools.app.muledump.keys(['ctrl','shift'], e) === false ) return;
        setuptools.app.muledump.exporter.canvas(this);

    });

    $('div.skinstage').on('click.skins.stage', function(e) {

        if ( setuptools.app.muledump.keys(['ctrl','shift'], e) === false ) return;
        setuptools.app.muledump.exporter.canvas(this);

    });

};
