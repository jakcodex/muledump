/**
 * @function
 * @param {Mule} Mule - Instance of Mule object
 * @param {string} name
 * @param {object} data
 * @description Provide a warning button for an account when problems are detected.
 *
 * This is a relic from the Muledump 7.3 days while we were still figuring out some data formatting. May not be necessary anymore.
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
 * @param {jQuery} $i - Item to bind tooltip
 * @param {string | array} [classes] - Classes to forward to the tooltip generator
 * @param {string} [content] - Content to forward to the tooltip generator
 * @param {number} [ttl] - Time to live for automatic tooltip closing on mouseleave
 * @description Binds the item tooltip to the provided dom
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
                <div style="display: flex; justify-content: space-between; align-items: center;">\
                <div class="ignore" style="display: flex; flex-flow: column; justify-content: center; align-items: center;"> \
                    <div class="bagType" style="background-position: ' + bagPosition + ';">&nbsp;</div> \
                </div>\
            ';

        //  column two
        var count = $(self).find('div').attr('data-qty');
        var oid = +$(self).attr('data-oid');
        html += ' \
            <div> \
                ' + ItemData[0] + ( ( ItemData[8] === true || $.isNumeric(oid) ) ? '<span class="tooltip generic text" style="margin-left: 2px;"> ' + ( ($.isNumeric(oid) ) ? 'ID: ' + oid : '(SB)' ) + '</span>' : '' ) + ' \
                ' + ( (ItemData[6]) ? '<br><span class="tooltip feed">Feed Power: ' + ItemData[6] + '</span>' : '' ) + '\
                ' + ( ( count > 0 ) ? '<br><span class="tooltip count">Count: <span class="tooltip generic text">' + count + '</span>' : '') + '\
            </div>\
        ';

        //  column three
        var tier = '';
        if ( ItemData[2] > -1 && ItemData[1] !== 10 ) tier += '<span class="tooltip tiered">T' + ItemData[2] + '</span>';
        if ( ItemData[9] === 1 && ItemData[1] !== 10 ) tier += '<span class="tooltip ut">UT</span>';
        if ( ItemData[9] === 2 ) tier += '<span class="tooltip st">ST</span>';
        var c2Margin = ( tier.length > 0 ) ? ' margin-left: 15px;' : '';
        html += ' \
            <div style="' + c2Margin + '"> \
                ' + tier + ' \
                ' + ( ( ItemData[5] ) ? '<br><span class="tooltip generic text">Fame Bonus:</span> <span class="tooltip famebonus value">' + ItemData[5] + '%</span>' : '' ) + ' \
            </div>\
            </div>\
        ';

        setuptools.lightbox.tooltip(self, html, {classes: classes});
    };

    //  select all items
    if ( !$i ) $i = $('.item');

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
 * @param {string} title - Title of the notice
 * @param {function} callback - Callback to trigger when notice is clicked
 * @param {object} [argList] - Arguments to provide the callback
 * @description Add an item to the notice button
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
 * @description Check for new notices and display them if available
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
 * @description Remove the specified notice
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
 * @description Build and display the notice button
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

setuptools.app.muledump.pagesearch.mode = {account: {}, items: {}};

/**
 * @function
 * @description Prepare the account search menu
 */
setuptools.app.muledump.pagesearch.mode.account.init = function() {

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
                execute: setuptools.app.muledump.pagesearch.mode.account.execute,
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

    setuptools.app.muledump.pagesearch.mode.account.bind();

};

/**
 * @function
 * @description Bind PageSearch menu actions
 */
setuptools.app.muledump.pagesearch.mode.account.bind = function() {

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
 * @param state - State of the search menu (not used anywhere but required by the api)
 * @param searchTerm - Term to search for
 * @description Perform the lookup and search action
 */
setuptools.app.muledump.pagesearch.mode.account.execute = function(state, searchTerm) {

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
 * @param {jQuery} [track] - DOM to bind search menu
 * @description Displays the PageSearch menu
 */
setuptools.app.muledump.pagesearch.menu = function(track) {

    if ( !(track instanceof jQuery) ) track = $('#pagesearchButton');
    setuptools.lightbox.menu.context.close('pagesearchButton');
    var options = [
        {
            option: 'hover',
            action: 'close'
        },
        {
            option: 'scrollLock',
            hook: '#totalsMenu'
        },
        {
            option: 'skip',
            value: 'reposition'
        },
        {
            option: 'afterClose',
            callback: setuptools.app.muledump.pagesearch.menu,
            callbackArg: [track]
        },
        {
            option: 'class',
            value: 'smallMenuCells'
        },
        {
            option: 'css',
            css: {
                width: '184px'
            }
        },
        {
            option: 'pos',
            h: 'left',
            v: 'top',
            vpx: 28
        }
    ];

    options.push({
        option: 'header',
        value: 'Search Mode'
    });

    options.push(
        {
            class: 'psModeAccounts',
            name: ' \
                <div class="flex-container" style="justify-content: flex-start;"> \
                    <div class="pagesearch account button mr5 ' + ( (setuptools.data.config.pagesearchMode === 0) ? 'active' : '') + '">&nbsp;</div>\
                    <div>Account Search</div> \
                </div>\
            ',
            callback: setuptools.app.muledump.pagesearch.buttonUpdate,
            callbackArg: 0
        },
        {
            class: 'psModeItem',
            name: ' \
                <div class="flex-container" style="justify-content: flex-start;"> \
                    <div class="pagesearch items button mr5 ' + ( (setuptools.data.config.pagesearchMode === 1) ? 'active' : '') + '">&nbsp;</div>\
                    <div>Item Search</div> \
                </div>\
            ',
            callback: setuptools.app.muledump.pagesearch.buttonUpdate,
            callbackArg: 1
        }
    );

    setuptools.lightbox.menu.context.create('pagesearchButton', false, track, options);

};

/**
 * @function
 * @param {string} mode
 * @description Updates the PageSearch mode and UI icon
 */
setuptools.app.muledump.pagesearch.buttonUpdate = function(mode) {

    var modes = ['account', 'items'];
    if ( modes.indexOf(mode) === -1 ) return;
    setuptools.data.config.pagesearchMode = mode;
    modes.filter(function(mode) {
        $('#pagesearchButton > div').removeClass(mode);
    });
    $('#pagesearchButton > div').addClass(modes[mode]);
    setuptools.app.config.save('PageSearch/Switch Mode', true);

};

/**
 * @function
 * @param {string} guid - Guid of the account to search for
 * @returns {string}
 * @description Get the display name for a provided guid
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
 * @param {string | array} keys - Key or keys to obtain the state for
 * @param {object} e - Input event
 * @param {boolean} [raw] - Whether or not to return the raw results
 * @description Return the state of the specified keys. Used for mapping hotkeys. Makes use of the key bindings layout.
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
 * @param {string} option - Name of option
 * @param {boolean} [value] - New option value
 * @param {boolean} [skip] - Skip updating UI
 * @description Toggle the state of the specified options
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
 * @description Create a quick access menu for various UI endpoints and commands
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
        },
        {
            class: 'setuptoolsOCL',
            name: 'OCL',
            callback: setuptools.app.muledump.ocl.manager
        });

    setuptools.lightbox.menu.context.create('bodymenu', false, $('body'), options);

};

/**
 * @function
 * @param {object} e
 * @param {string} guid - Account guid to load menu for
 * @param {jQuery} [context] - Button dom to highlight if in context menu mode
 * @param {jQuery} [track] - Element to bind menu to
 * @param {object} [extraopts]
 * @description Display the account mule menu
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
            name: 'One Click Login',
            href: setuptools.app.muledump.ocl.mulelink(guid)
        });

    } else {

        options.push({
            option: 'link',
            class: 'oneclick',
            name: 'One Click Login',
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
            setuptools.app.muledump.skinWardrobe(guid);
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
 * @description Displays the screenshot menu for the specified account
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

    if ( mules[guid].opt('potions') ) options.push({
        class: 'ssPotions',
        name: 'Potion Storage',
        callback: function(guid) {
            setuptools.app.muledump.exporter.canvas($(mules[guid].dom.find('table.potions'))[0]);
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
 * @description Display the copy menu for the specified account
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

/**
 * @description I don't remember and I'm too afraid to check
 */
setuptools.app.muledump.quickUserAdd = function() {
    setuptools.app.techlog('Why??');
};

/**
 * @function
 * @param {object} totals - Totals object maps
 * @description Automatically adjust totals width
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

/*
//  Realmeye features
*/

/**
 * @function
 * @param {number} itemNumber
 * @param {string} link
 * @param {number} [extra]
 * @returns {string | void}
 * @description Generate links to the realmeye wiki for items
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
 * @description React to ctrl+click actions
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
 * @description Update item on selection in Realmeye menu
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
 * @description Cleanup secondary cache data
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
 * @description Clean up local storage data for a specific account
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
 * @description Muledump online about page
 */
setuptools.app.muledump.about = function() {

    if (setuptools.state.hosted === false) {
        setuptools.app.muledump.checkupdates(true);
    } else {

        setuptools.lightbox.build('muledump-checkupdates', ' \
            You are on the latest version. \
            <br><br><a href="#" class="muledump link renders nostyle" target="_blank">Renders</a> | \
            <a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp docs nostyle" target="_blank">v' + VERSION + ' Changelog</a> | \
            <a href="' + setuptools.config.url + '/" target="_blank">Muledump Homepage</a> | \
            <a href="https://github.com/jakcodex/muledump" target="_blank">Github</a> \
            <br><br>Muledump Online is updated automatically with new versions. \
            <br><br>Jakcodex Support Discord - <a href="https://discord.gg/JFS5fqW" target="_blank">https://discord.gg/JFS5fqW</a> \
        ');

        setuptools.lightbox.settitle('muledump-checkupdates', '<strong>Muledump Online v' + VERSION + '</strong>');
        setuptools.lightbox.display('muledump-checkupdates', {variant: 'select'});

        $('.drawhelp.docs').on('click.muledump.aboutdocs', function (e) {
            setuptools.lightbox.drawHelp(e, {title: 'About Muledump', url: $(this).attr('href')}, this);
        });

        $('a.muledump.link.renders').on('click.muledump.renders', function(e) {
            e.preventDefault();
            setuptools.lightbox.override('rendersupdate-assistant', 'goback', setuptools.app.muledump.about);
            setuptools.app.muledump.checkupdates(true, true);
        });

    }

};

/**
 * @function
 * @param {boolean} [force]
 * @param {boolean} [renders]
 * @description Muledump local check for updates and display an about page
 */
setuptools.app.muledump.checkupdates = function(force, renders) {

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
                    <br><a href="#" class="muledump link renders nostyle" target="_blank">Renders</a> | \
                    <a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp docs nostyle" target="_blank">v' + VERSION + ' Changelog</a> | \
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
            setuptools.lightbox.drawHelp(e, {title: 'About Muledump', url: $(this).attr('href')}, this);
        });
        $('a.muledump.link.renders').on('click.muledump.renders', function(e) {
            e.preventDefault();
            setuptools.app.muledump.checkupdates(true, true);
        });

    }

    //  process the github tags api response
    function ProcessResponse(data) {

        if (data.meta.status !== 200) {

            if (force === true && renders !== true) {

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

        if (latestRenders > currentRenders) setuptools.app.muledump.notices.add(
            'New renders update available for ' + latestRendersName,
            function (d, i, rendersData, currentRendersName, latestRendersName) {
                var arg = $.extend(true, [], latestRendersData, rendersData, {
                    currentRenders: currentRendersName,
                    currentRendersDate: currentRenders,
                    latestRenders: latestRendersName,
                    latestRendersDate: latestRenders
                });
                setuptools.app.assistants.rendersupdate(arg);
            },
            [d, i, rendersData, currentRendersData[7], latestRendersName]
        );

        //  tail of renders check
        if ( force === true && renders === true ) {
            setuptools.app.assistants.rendersupdate($.extend(true, [], latestRendersData, rendersData, {
                currentRenders: currentRendersData[7],
                currentRendersDate: currentRenders,
                latestRenders: latestRendersName,
                latestRendersDate: latestRenders
            }));
            return;
        }

        //  display the lightbox if a url is provided
        if ( url ) window.techlog("Update found: " + url, 'hide');

        var notifiedver = setuptools.storage.read('updatecheck-notifier');
        if (url) setuptools.app.muledump.notices.add(
            'Muledump v' + topver + ' now available!',
            setuptools.app.muledump.checkupdates,
            true
        );

        if (url && ((force === true && renders !== true) || (!force && setuptools.data.options.updatecheck === true && (typeof notifiedver === 'undefined' || (typeof notifiedver === 'string' && cmpver(notifiedver, topver) > 0))))) {

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
 * @description Gather a list of white bag items from constants
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
 * @description Initialize the base object for a new guid
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
 * @description Saves the specified configuration permanently
 */
setuptools.app.muledump.whitebag.save = function(guid, config) {

    setuptools.data.muledump.whitebagTracker.accounts[guid] = config;
    setuptools.app.config.save('Whitebags/Totals saving changes', true);

};

/**
 * @function
 * @param guid
 * @description Display Whitebag Tracker for Totals Count
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
        var itemDom = setuptools.app.muledump.item(key, 'wb noselect' + ( (selected === true) ? ' selected' : '' ), ( (setuptools.data.config.wbTotals === true) ? (config.items[key] || 0) : undefined ));
        itemDom.appendTo(itemsDom);
    });

    //  select the newly inserted items
    var wbitemsdom = $('div.item.wb');

    //  bind tooltips
    if ( setuptools.data.config.tooltipItems > -1 ) setuptools.app.muledump.tooltip(wbitemsdom, 'whitebagTrackerTooltip', 750);

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
            if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('wb-save') > -1 ) return;
            setuptools.tmp.wbSaveOnClose = false;
            setuptools.app.muledump.whitebag.save(guid, config);
            setuptools.lightbox.status($(this), 'Ok!', 'wb-save');
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
 * @description Generate an image of the specified dom
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
 * @description Uploads an image to Imgur
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
 * @description Generate the Totals text export data
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
 * @description Upload a paste to the Paste API
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
 * @description Adds a link to the exporter history
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
 * @description Displays the Muledump Exporter UI
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

    //  handle local requests
    local.on('click.totals.export.local', function() {
        procLocal(mode.val());
    });

    //  handle remote requests
    remote.on('click.totals.export.remote', function() {
        procRemote(mode.val());
    });

    //  use html2canvas on a provided element
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

    //  screenshot binding
    $('div.setuptools.link.canvas.mules').on('click.screenshot.mules', function() {

        $('div.exporter.canvas').html('&nbsp;<br>Loading image...');
        setuptools.app.muledump.exporter.canvas($('#stage')[0], true, render);

    });

};

/**
 * @function
 * @param {jQuery} [track]
 * @description Draw the Muledump Exporter button menu
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
 * @description Return or render the character portrait and description
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

    //  build portrait
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
    if ( setuptools.data.config.tooltipXPBoost === 1 && boost && boost.hasClass('hidden') === false ) {

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

};


/**
 * @function
 * @param {string} guid
 * @param {number | string} [tex1]
 * @param {number | string} [tex2]
 * @description Display the skin wardrobe
 */
//  display owned skins
setuptools.app.muledump.skinWardrobe = function(guid, tex1, tex2) {

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
                //  excluded skinids
                [8381].indexOf(+skinid) > -1 ||

                //  excluded classes
                [65535].indexOf(data[4]) > -1 ||

                //  excluded specials
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
            var $s = $('<img class="ownedSkins" style="padding: 5px; margin: 2px 3px 3px 2px; border: 1px solid #222; overflow: hidden;" data-skinid="'+ skinid + '">');
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
                    setuptools.app.muledump.skinWardrobe(guid);
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

    //  generate screenshot
    $('div.skinstage').on('click.skins.stage', function(e) {

        if ( setuptools.app.muledump.keys(['ctrl','shift'], e) === false ) return;
        setuptools.app.muledump.exporter.canvas(this);

    });

};

/**
 * @function
 * @param {string} [profile] - Profile to open in manager
 * @param {boolean} [advanced=false] - Display advanced settings
 * @param {boolean} [hardreset=false] - Reset button resets settings to factory default (if available)
 * @description Displays the OCL manager UI
 */
setuptools.app.muledump.ocl.manager = function(profile, advanced, hardreset) {

    setuptools.lightbox.close();

    if ( hardreset === true && !setuptools.copy.data.muledump.ocl.configSets.settings[profile] ) hardreset = undefined;
    if ( typeof advanced === 'undefined' ) advanced = false;
    if ( typeof profile !== 'string' ) profile = setuptools.data.muledump.ocl.configSets.active;
    var data = setuptools.app.muledump.ocl.get(profile);
    if ( typeof data !== 'object' ) data = setuptools.app.muledump.ocl.get(setuptools.config.oclDefault);
    if ( data === false ) setuptools.lightbox.error("Failed to load any OCL profile");

    setuptools.lightbox.build('ocl-manager', ' \
        <div class="ocl switch flex-container" style="justify-content: space-between; margin-bottom: 17px;">\
            <div class="flex-container noFlexAutoWidth" style="justify-content: flex-start;">\
                <div class="flex-container noFlexAutoWidth"><strong>One Click Login Enabled</strong></div>\
                <div class="flex-container noFlexAutoWidth">\
                    <select name="oclEnabled" class="setuptools oclEnabled" style="width: auto; margin-left: 15px;">\
                        <option value="0" ' + ( (setuptools.data.config.mulelogin === 0) ? 'selected' : '' ) + '>No</option>\
                        <option value="1" ' + ( (setuptools.data.config.mulelogin === 1) ? 'selected' : '' ) + '>Yes</option>\
                    </select>\
                </div>\
                <div class="flex-container noFlexAutoWidth" style="margin-left: 15px;"><strong>Copy Links</strong></div>\
                <div class="flex-container noFlexAutoWidth">\
                    <select name="oclCopyLinks" class="setuptools oclCopyLinks" style="width: auto; margin-left: 15px;">\
                        <option value="0" ' + ( (setuptools.data.config.muleloginCopyLinks === 0) ? 'selected' : '' ) + '>No</option>\
                        <option value="1" ' + ( (setuptools.data.config.muleloginCopyLinks === 1) ? 'selected' : '' ) + '>Yes</option>\
                    </select>\
                </div>\
            </div>\
            <div class="flex-container noFlexAutoWidth" style="justify-content: flex-end;">\
                <div class="flex-container noFlexAutoWidth setuptools link ocl install menuStyle notice bright mr0">Install One Click Login</div> \
            </div>\
        </div>\
        <div class="ocl manager">\
            <div class="ocl configuration">\
                <div data-ocl="name">\
                    <div>Profile Name</div>\
                    <div>\
                        <input name="name" class="setuptools input ocl" value="' + profile + '" placeholder="Type profile name here" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\
                    </div>\
                </div>\
                <div data-ocl="default">\
                    <div>Is Default <strong class="help ml5">?</strong></div>\
                    <div>\
                        <select name="default" class="setuptools menu ocl">\
                            <option value="0" ' + ( (profile !== setuptools.data.muledump.ocl.configSets.active) ? 'selected' : '' ) + '>No</option>\
                            <option value="1" ' + ( (profile === setuptools.data.muledump.ocl.configSets.active) ? 'selected' : '' ) + '>Yes</option>\
                        </select>\
                    </div>\
                </div>\
                <div data-ocl="mode">\
                    <div>Mode <strong class="help ml5">?</strong></div>\
                    <div>\
                        <select name="mode" class="setuptools menu ocl">\
                            <option value="0" ' + ( (data.params.mode === 'browser') ? 'selected' : '' ) + '>Browser</option>\
                            <option value="1" ' + ( (data.params.mode === 'flash') ? 'selected' : '' ) + '>Flash Projector</option>\
                            <option value="2" ' + ( (data.params.mode === 'exalt') ? 'selected' : '' ) + '>Exalt</option>\
                        </select>\
                    </div>\
                </div>\
                <div data-ocl="path">\
                    <div>Path <strong class="help ml5">?</strong></div>\
                    <div>\
                        <input name="path" class="setuptools input ocl" value="' + data.params.path + '" placeholder="Browser URL, Flash Projector or Exalt exe path here" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\
                    </div>\
                </div>\
                <div data-ocl="client" style="' + ( (['browser','exalt'].indexOf(data.params.mode) > -1) ? 'display: none;' : '' ) + '">\
                    <div>Game Client <strong class="help ml5">?</strong></div>\
                    <div>\
                        <input name="client" class="setuptools input ocl" value="' + (data.params.client || setuptools.config.oclClient) + '" placeholder="Type path to game client swf" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\
                    </div>\
                </div>\
                <div data-ocl="title" style="' + ( (['browser'].indexOf(data.params.mode) > -1 || advanced === false) ? 'display: none;' : '' ) + '">\
                    <div>Custom Window Title <strong class="help ml5">?</strong></div>\
                    <div>\
                        <input name="title" class="setuptools input ocl" value="' + (data.params.title || '') + '" placeholder="Optionally set game client window title" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\
                    </div>\
                </div>\
                <div data-ocl="ign" style="' + ( (['browser'].indexOf(data.params.mode) > -1 || advanced === false) ? 'display: none;' : '' ) + '">\
                    <div>Include Account Name <strong class="help ml5">?</strong></div>\
                    <div>\
                        <select name="ign" class="setuptools menu ocl">\
                            <option value="0" ' + ( (data.params.ign !== true) ? 'selected' : '' ) + '>No</option>\
                            <option value="1" ' + ( (data.params.ign === true) ? 'selected' : '' ) + '>Yes</option>\
                        </select>\
                    </div>\
                </div>\
                <div data-ocl="admin" style="' + ( (advanced === false) ? 'display: none;' : '' ) + '">\
                    <div>Use Admin Privileges <strong class="help ml5">?</strong></div>\
                    <div>\
                        <select name="admin" class="setuptools menu ocl">\
                            <option value="0" ' + ( (data.params.admin !== true) ? 'selected' : '' ) + '>No</option>\
                            <option value="1" ' + ( (data.params.admin === true) ? 'selected' : '' ) + '>Yes</option>\
                        </select>\
                    </div>\
                </div>\
                <div data-ocl="paths" style="' + ( (['exalt'].indexOf(data.params.mode) > -1 || advanced === false) ? 'display: none;' : '' ) + '">\
                    <div>Update Paths <strong class="help ml5">?</strong></div>\
                    <div>\
                        <input name="paths" class="setuptools input ocl" value="' + data.params.paths + '" placeholder="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">\
                    </div>\
                </div>\
                <div style="justify-content: flex-end;">\
                    <div class="setuptools link ocl advanced noclose menuStyle buttonStyle bright" style="width: 100px;" data-state="' + ( (advanced === false) ? 'false' : 'true' ) + '">' + ( (advanced === false) ? 'Show' : 'Hide' ) + ' Advanced</div>\
                    <div class="setuptools link ocl delete noclose menuStyle buttonStyle notice " style="width: 75px;">Delete</div>\
                    <div class="setuptools link ocl reset noclose menuStyle buttonStyle negative" style="width: ' + ( (hardreset === true) ? '100' : '75' ) + 'px;">' + ( (hardreset === true) ? 'Factory ' : '' ) + 'Reset</div>\
                    <div class="setuptools link ocl save noclose menuStyle buttonStyle positive mr0" style="width: 75px;">Save</div>\
                </div>\
            </div>\
            <div class="ocl profiles ' + ( (Object.keys(setuptools.data.muledump.ocl.configSets.settings).length > 8) ? 'scrollbar overflowyScroll' : '' ) + '">\
                <div style="font-weight: bold;">Profiles</div>\
                <div class="setuptools link ocl createProfile noclose" style="font-weight: bold; cursor: pointer;">Create Profile</div>\
    ');

    //  create profile list
    Object.keys(setuptools.data.muledump.ocl.configSets.settings).forEach(function(profile) {
        var data = setuptools.data.muledump.ocl.configSets.settings[profile];
        if ( data.hidden === true ) return;
        setuptools.lightbox.build('ocl-manager', ' \
                <div data-oclProfile="' + profile + '">' + profile + '</div>\
        ');
    });

    setuptools.lightbox.build('ocl-manager', ' \
            </div>\
        </div>\
    ');
    setuptools.lightbox.settitle('ocl-manager', 'One Click Login');
    setuptools.lightbox.drawhelp('ocl-manager', 'docs/setuptools/help/ocl', 'OCL Help');
    setuptools.lightbox.goback('ocl-manager', setuptools.app.index);
    setuptools.lightbox.display('ocl-manager', {variant: 'fl-OclManager'});

    //  help info
    var help = {
        default: 'Use this profile when none other is selected for an account',
        mode: 'Launch game using the browser or Flash Projector',
        path: ['<code>Exalt:</code> Path to Exalt exe (e.g. C:\Users\YourAccount\Documents\RealmOfTheMadGod\Production\RotMG Exalt.exe)', '<code>Flash Projector:</code> Path to Flash Projector exe (e.g. C:\\flashplayer_16_sa.exe)', '<code>Browser:</code> URL to launch the game'],
        client: 'URL or local path to game SWF file',
        admin: ['Config setting <code>adminparams</code> must be set to <code>true</code> in <code>/lib/mulelogin.au3</code>', 'Run AutoIt with administrative privileges (may cause Windows UAC prompt)'],
        paths: 'Hostname to restrict updates of RotMG.sol files',
        ign: 'Whether or not to include account guid/ign',
        title: ['Type in <code>false</code> to disable renaming the window entirely.', 'Custom title for game client window.']
    };

    //  help buttons
    $('strong.help').on('click.help', function() {
        var parent = $(this).parent().parent();
        var param = parent.attr('data-ocl');
        var dom = $('div[data-help="ocl ' + param + '"]');

        //  display the help info
        if ( dom.length === 0 ) {

            var html = '';
            var pieces = help[param];
            if ( typeof pieces === 'string' ) pieces = [pieces];
            if ( !Array.isArray(pieces) ) pieces = [];
            pieces.forEach(function(piece) {
                $('<div data-help="ocl ' + param + '" style="display:none;" class="flex-container help">').html('<span class="strong">&#9646;&nbsp;</span><span>' + piece + '</span>').insertAfter(parent).slideDown();
            });
            $(this).html('&#9660;');

            return;

        }

        //  hide the help info
        dom.slideUp(function() {this.remove();});
        $(this).html('?');

    });

    //  reset button
    $('div.setuptools.link.ocl.reset').on('click.ocl.reset', function() {

        if ( hardreset === true ) {
            $.extend(true, setuptools.data.muledump.ocl.configSets.settings[profile], setuptools.copy.data.muledump.ocl.configSets.settings[profile]);
            setuptools.app.muledump.ocl.manager(profile, advanced);
            return;
        }

        setuptools.app.muledump.ocl.manager(profile, advanced, true);

    });

    //  delete button
    $('div.setuptools.link.ocl.delete').on('click.ocl.delete', function() {

        if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('ocl-delete') > -1 ) return;

        if ( setuptools.copy.data.muledump.ocl.configSets.settings[profile] ) {
            setuptools.lightbox.status($(this), "No!", 'ocl-delete');
            return;
        }

        delete setuptools.data.muledump.ocl.configSets.settings[profile];
        if ( setuptools.data.muledump.ocl.configSets.active === profile ) setuptools.data.muledump.ocl.configSets.active = setuptools.config.oclDefault;
        setuptools.app.config.save('Muledump/OCL deleted profile');
        setuptools.app.muledump.ocl.manager(undefined, advanced);
        setuptools.lightbox.status($('div.setuptools.link.ocl.delete'), "Ok!", 'ocl-delete');

    });

    //  install help button
    $('div.setuptools.link.ocl.install').on('click.ocl.install', setuptools.app.muledump.ocl.install);

    //  save button
    $('div.setuptools.link.ocl.save').on('click.ocl.save', function() {

        if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('ocl-save') > -1 ) return;
        var profile = $('input[name="name"]').val();
        var data = {};
        $('div.ocl.configuration input').each(function() {
            var param = $(this).attr('name');
            data[param] = $(this).val();
        });
        $('div.ocl.configuration select').each(function() {

            var param = $(this).attr('name');
            if ( param === 'mode' ) {
                if ( $(this).val() === '0' ) data[param] = 'browser';
                if ( $(this).val() === '1' ) data[param] = 'flash';
                if ( $(this).val() === '2' ) data[param] = 'exalt';
                return;
            }

            data[param] = ( $(this).val() === '1' );

        });

        delete data.name;
        setuptools.app.muledump.ocl.save(profile, data);
        setuptools.app.muledump.ocl.manager(profile, advanced);
        setuptools.lightbox.status($('div.ocl.configuration div.setuptools.link.save'), 'Ok!', 'ocl-save');

    });

    //  open the chosen profile in the editor
    $('div[data-oclProfile]').on('click.ocl.chooseProfile', function() {
        setuptools.app.muledump.ocl.manager($(this).attr('data-oclProfile'), advanced);
    });

    //  prepare fresh profile for create profile button
    $('div.setuptools.link.ocl.createProfile').on('click.ocl.createProfile', function() {
        $('div.ocl.manager input').val('');
        $('div.ocl.manager select').val('0');
        $('input[name="name"]').focus();
    });

    //  appears to do nothing as this element doesn't exist
    $('div.setuptools.link.ocl.browse').on('click.ocl.browse', function() {
        $(this).next().click();
    });

    //  mode select
    $('select[name="mode"]').on('change.ocl.mode', function() {

        if ( ['0','2'].indexOf($(this).val()) > -1 ) {

            $('div[data-ocl="client"]').hide();
            $('div[data-ocl="title"]').hide();
            $('div[data-ocl="ign"]').hide();
            return;

        }

        $('div[data-ocl="client"]').show();
        $('div[data-ocl="title"]').show();
        $('div[data-ocl="ign"]').show();

    });

    //  auto-update paths input on path change
    $('input[name="path"]').on('change.ocl.path', function() {

        var path = $(this).val();
        setuptools.config.oclAllPaths.forEach(function(paths) {
            if ( path.match(paths) !== null ) $('input[name="paths"]').val(paths);
        });

    });

    //  advanced button
    $('div.setuptools.link.ocl.advanced').on('click.ocl.advanced', function() {

        var mode = +$('select[name="mode"]').val();
        if ( $(this).attr('data-state') === 'false' ) {

            $(this).attr('data-state', 'true').text('Hide Advanced');
            advanced = true;
            $('div[data-ocl="admin"]').slideDown();
            if ( mode !== 2 ) $('div[data-ocl="paths"]').slideDown();
            if ( mode === 1 || mode === 2 ) $('div[data-ocl="title"]').slideDown();
            if ( mode === 1 || mode === 2 ) $('div[data-ocl="ign"]').slideDown();
            return;

        }

        advanced = false;
        $(this).attr('data-state', 'false').text('Show Advanced');
        $('div[data-ocl="admin"]').slideUp();
        $('div[data-ocl="paths"]').slideUp();
        $('div[data-help="ocl admin"]').slideUp(function() { this.remove() });
        $('div[data-help="ocl paths"]').slideUp(function() { this.remove() });
        $('div[data-ocl="admin"] strong.help').html('?');
        $('div[data-ocl="paths"] strong.help').html('?');

        if ( mode === 1 || mode === 2 ) $('div[data-ocl="title"]').slideUp();
        if ( mode === 1 || mode === 2 ) $('div[data-ocl="ign"]').slideUp();
        if ( mode === 1 || mode === 2 ) $('div[data-help="ocl title"]').slideUp(function() { this.remove() });
        if ( mode === 1 || mode === 2 ) $('div[data-help="ocl ign"]').slideUp(function() { this.remove() });
        if ( mode === 1 || mode === 2 ) $('div[data-ocl="title"] strong.help').html('?');
        if ( mode === 1 || mode === 2 ) $('div[data-ocl="ign"] strong.help').html('?');

    });

    //  ocl enable menu
    $('select[name="oclEnabled"]').on('change.ocl.enabled', function() {
        setuptools.data.config.mulelogin = ( setuptools.data.config.mulelogin === 0 ) ? 1 : 0;
        setuptools.app.config.save("Muledump/OCL toggled enabled status");
        setuptools.app.muledump.ocl.regenerate();
    });

    //  ocl copy links menu
    $('select[name="oclCopyLinks"]').on('change.ocl.copylinks', function() {
        setuptools.data.config.muleloginCopyLinks = ( setuptools.data.config.muleloginCopyLinks === 0 ) ? 1 : 0;
        setuptools.app.config.save("Muledump/OCL toggled copylinks status");
        setuptools.app.muledump.ocl.regenerate();
    });

};

/**
 * @function
 * @description Displays the OCL installation help UI
 */
setuptools.app.muledump.ocl.install = function() {

    setuptools.lightbox.build('ocl-install', ' \
        <div id="drawhelpBox">\
            Welcome to the One Click Login installation guide! Check out the <a href="' + setuptools.config.oneclickHelp + '" target="_blank">One Click Login wiki</a> for more comprehensive information. \
            \
            <br><br><h3>Download and Install AutoIt</h3>\
            <br>Go to the AutoIt <a href="https://www.autoitscript.com/site/autoit/downloads/" target="_blank">Downloads</a> page (or <a href="https://www.autoitscript.com/cgi-bin/getfile.pl?autoit3/autoit-v3-setup.exe" target="_blank">direct download</a>) and download the latest AutoIt.\
            \
            <br><br><h3>Download One Click Login AutoIt Script</h3>\
            ' + ( (setuptools.state.hosted === false) ? ' \
                <br><strong>Non-Exalt Users</strong>: You can find a copy of the One Click Login AutoIt script in your Muledump installation folder at <strong>lib\\mulelogin.au3</strong>.\
                <br>\
                <br><strong>Exalt Users</strong>: Follow the above instructions but use the file <strong>lib\\ocl-exalt.au3</strong> instead.\
                <br>\
            ' : ' \
                <br><strong>Non-Exalt Users</strong>: The latest version of One Click Login is available on Github: <a href="' + setuptools.config.url + '/lib/mulelogin.au3" target="_blank" download="mulelogin.au3">' + setuptools.config.url + '/lib/mulelogin.au3</a> \
                <br>\
                <br><strong>Exalt Users</strong>: The latest version of One Click Login is available on Github: <a href="' + setuptools.config.url + '/lib/mulelogin.au3" target="_blank" download="mulelogin.au3">' + setuptools.config.url + '/lib/mulelogin.au3</a> \
                <br>\
            ' ) + '\
            \
            <br><h3>Install One Click Login AutoIt Script</h3>\
            <br>Run <strong>mulelogin.au3</strong> or <strong>ocl-exalt.aue</strong> with AutoIt.\
            <br><br>If this is the first time you\'re installing OCL you should see a success message.\
            <br><br>Returning users will be prompted to reinstall or uninstall OCL. \
            <br><br>If converting between Exalt and non-Exalt OCL versions then choose Reinstall.\
            <br><br>If you encounter any errors, check out the wiki for troubleshooting tips.\
            \
            <br><br><h3>Enable and Configure One Click Login</h3>\
            <br>Go back to the previous page and set <strong>One Click Login Enabled</strong> to Yes. \
            <br><br>One Click Login works in Browser mode by default. You can switch to Flash Projector by updating its profile and setting to default.\
            <br><br>Profiles can be assigned to mules in the account menu if you want to use something other than the default profile.\
        </div>\
    ');
    setuptools.lightbox.settitle('ocl-install', 'One Click Login Installation Guide');
    setuptools.lightbox.drawhelp('ocl-install', setuptools.config.oneclickHelp, 'OCL Installation Help');
    setuptools.lightbox.goback('ocl-install', setuptools.app.muledump.ocl.manager);
    setuptools.lightbox.display('ocl-install', {variant: 'fl-SettingsLarge'});

};

/**
 * @function
 * @param {string} profile - Profile name
 * @param {Object} data - Profile data
 * @returns {boolean}
 * @description Saves the profile with the provided data
 */
setuptools.app.muledump.ocl.save = function(profile, data) {

    var profiles = setuptools.data.muledump.ocl.configSets.settings;
    if ( typeof profiles[profile] !== 'object' ) profiles[profile] = {params: {}};
    if ( data.default === true ) setuptools.data.muledump.ocl.configSets.active = profile;
    if ( typeof data.hidden !== 'undefined' ) profiles[profile].hidden = data.hidden;
    delete data.default;
    delete data.name;
    delete data.hidden;
    $.extend(true, profiles[profile].params, data);
    setuptools.app.config.save('Muledump/OCL profile saved');
    setuptools.app.muledump.ocl.regenerate();
    return true;

};

/**
 * @function
 * @param {string} [profile] - Profile to activate
 * @returns {boolean}
 * @description Activates the specified profile as the default profile
 */
setuptools.app.muledump.ocl.activate = function(profile) {

    var profiles = setuptools.data.muledump.ocl.configSets.settings;
    if ( !profiles[profile] ) return false;
    setuptools.data.muledump.ocl.configSets.active = profile;
    return true;

};

/**
 * @function
 * @param {string} [profile] - Profile to load
 * @returns {Object | boolean}
 * @description Returns the profile data for the specified or active profile.
 */
setuptools.app.muledump.ocl.get = function(profile) {

    var profiles = setuptools.data.muledump.ocl.configSets.settings;
    if ( typeof profile === 'undefined' ) profile = setuptools.data.muledump.ocl.configSets.active;
    if ( !profiles[profile] ) return false;
    return profiles[profile];

};

/**
 * @function
 * @param {string} [guid] - Guid to check for custom profile settings
 * @returns {Object | boolean}
 * @description Returns the appropriate OCL parameters config
 */
setuptools.app.muledump.ocl.router = function(guid) {

    if ( setuptools.state.loaded === false || !guid ) return setuptools.app.muledump.ocl.get();
    if ( !setuptools.data.accounts.accounts[guid] ) return false;
    return setuptools.app.muledump.ocl.get(setuptools.data.accounts.accounts[guid].oclProfile || undefined);

};

/**
 * @function
 * @param {Object} profile - Profile parameters to process
 * @returns {string}
 * @description Generates an OCL parameters string from the supplied object
 */
setuptools.app.muledump.ocl.params = function(profile) {

    var ocl_params = $.extend(true, {}, profile.params);
    if ( ['browser','exalt'].indexOf(ocl_params.mode) > -1 ) delete ocl_params.client;
    if ( ocl_params.paths.length === 0 ) delete ocl_params.paths;

    var params = '';
    Object.keys(ocl_params).forEach(function(param) {
        if ( typeof ocl_params[param] === 'string' ) ocl_params[param] = ocl_params[param].replace(" ", "%20");
        params += param + '=' + ocl_params[param] + setuptools.config.oclParamSeparator;
    });

    return params.substr(0, params.length-1);

};

/**
 * @function
 * @param {string | Array} [guids=all] - Guid or list of guids to regenerate the OCL link button data
 * @returns {boolean}
 * @description Updates all specified OCL links in Muledump
 */
setuptools.app.muledump.ocl.regenerate = function(guids) {

    if ( typeof guids === 'string' ) guids = [guids];
    if ( guids && !Array.isArray[guids] ) return false;
    if ( !guids ) guids = Object.keys(mules).filter(function(guid) {
        return ( mules[guid].loaded === true && mules[guid].loginOnly === false );
    });

    guids.forEach(function(guid) {
        var self = mules[guid].dom.find('a.button.ocl');
        if ( setuptools.data.config.mulelogin === 1 ) {
            self.show();
            if ( setuptools.data.config.muleloginCopyLinks === 1 ) self.attr('href', setuptools.app.muledump.ocl.mulelink(guid));
            if ( setuptools.data.config.muleloginCopyLinks === 0 ) self.attr('href', '#');
        } else {
            self.hide();
        }
    });

    return true;

};

/**
 * @function
 * @param {jQuery} position - Element to bind menu to
 * @param data - SetupTools account data object
 * @description Displays the OCL account submenu
 */
setuptools.app.muledump.ocl.accountMenu = function(position, data) {

    var options = [
        {
            option: 'header',
            value: 'One Click Login Profile'
        },
        {
            option: 'hover',
            action: 'close',
            timer: 'oclMenuHoverClose'
        },
        {
            option: 'skip',
            value: 'reposition'
        }
    ];

    //  build menu options
    ['Default'].concat(Object.keys(setuptools.data.muledump.ocl.configSets.settings)).forEach(function(profile) {

        options.push({
            class: 'oclProfile',
            name: ( (data.oclProfile === profile || (data.oclProfile === false && profile === 'Default')) ? '* ' : '' ) + profile,
            callback: function(profile) {
                data.oclProfile = ( setuptools.app.muledump.ocl.get(profile) === false ) ? false : profile;
                setuptools.app.techlog('Muledump/OCL account updated: ' + data.username + ' = ' + profile, 'force');
            },
            callbackArg: profile
        });

    });

    setuptools.lightbox.menu.context.create('oclAccountMenu', true, position, options);

};

/**
 * @function
 * @param {string} guid
 * @returns {string}
 * @description Generate a one click login url
 */
setuptools.app.muledump.ocl.mulelink = function(guid) {

    //  does not support non-email guid's
    if (guid.match(setuptools.config.regex.guid) !== null) return setuptools.config.oneclickHelp;

    if ( setuptools.state.loaded === true ) {

        //  build ocl runtime parameters
        var profile = setuptools.app.muledump.ocl.router(guid);

        //  profile transformations should not be done on the reference pointer
        var data = JSON.parse(JSON.stringify(profile));

        //  apply profile transformations
        if (data.params.ign === false || typeof guid !== 'string') delete data.params.ign;
        if (data.params.ign === true) data.params.ign = setuptools.app.muledump.getName(guid);
        if (data.params.title === "") delete data.params.title;

        //  generate ocl parameters
        var ocl_params = setuptools.app.muledump.ocl.params(data);

        //  if this account is a testing account let's update the hostnames
        if (setuptools.state.loaded === true && setuptools.data.accounts.accounts[guid].testing === true) ocl_params = ocl_params.replace(/www.realmofthemadgod.com/g, 'test.realmofthemadgod.com')

    }

    //  return the link
    return 'muledump:' + sodium.to_hex(guid) + '-' + sodium.to_hex(window.accounts[guid]) + ( (setuptools.state.loaded === true) ? '-' + ocl_params : '');

};

/**
 * @function
 * @param {string} guid
 * @description Records profile mode and client to usage analytics
 */
setuptools.app.muledump.ocl.record = function(guid) {

    //  does not support non-email guid's
    if (
        setuptools.state.loaded === false ||
        guid.match(setuptools.config.regex.guid) !== null
    ) return;

    //  build ocl runtime parameters
    var profile = setuptools.app.muledump.ocl.router(guid);

    var path = ( profile.params.mode === 'browser' ) ? profile.params.path : profile.params.client;
    setuptools.app.ga('send', 'event', {
        eventCategory: 'ocl',
        eventAction: profile.params.mode,
        eventLabel: ( (path.match(/^https?:\/\/.*$/i)) ? path : 'local' )
    });


};

/**
 * @function
 * @param {Number | string} id
 * @param {string} type
 * @param {Number| string} [num]
 * @param {Array} ext
 * @returns {jQuery}
 */
setuptools.app.muledump.item = function(id, type, num, ext) {
    id = +id;
    var oid = id;
    if ( typeof window.items[id] === 'undefined' ) {
        setuptools.tmp.constantsRemovedItems.push(id);
        setuptools.config.disqualifiedItemIds.push(id);
        id = 0;
    }
    if ( typeof type !== 'string' ) type = '';
    var ids = '0x' + id.toString(16);
    var $r = $('<div class="item ' + type + '">').data('id', id).append($('<div>').text(num || 0).hide());
    if ( typeof num === 'number' ) $r.find('div').show();
    var it = items[id];

    $r.attr('data-itemId', id);
    if ( setuptools.data.config.equipSilhouettes === false || !Array.isArray(ext) || (ext[0] !== 'equipment' || id > -1) ) {
        $r.css('background-position', '-' + it[3] + 'px -' + it[4] + 'px');
        if ( id === 0 ) {
            $r.addClass('noselect').attr('data-oid', oid);
            $('<span class="flex-container">' + oid + '</span>')
                .css({
                    'height': '100%',
                    'flex-flow': 'column',
                    'justify-content': 'flex-end',
                    'text-shadow': '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                    'letter-spacing': '1px'
                })
                .appendTo($r);
        }
        if ( setuptools.data.config.tooltipItems > 0 ) setuptools.app.muledump.tooltip($r);
    } else {
        //  classid gets classes slot array
        //  slottype is found in slotMap and position taken from there
        var slotmapPos = [];
        Object.filter(itemsSlotTypeMap, function(key, value) {
            if ( value.slotType === classes[ext[2]][4][ext[1]] ) slotmapPos = value.sheet;
        });
        $r.addClass('silhouette25p');
        $r.css('background-position', '-' + slotmapPos[0] + 'px -' + slotmapPos[1] + 'px');
    }
    return $r;
};

/**
 * @function
 * @param {Array} arr
 * @param {string} classname
 * @param {Number | string} classid
 * @returns {jQuery}
 */
setuptools.app.muledump.item_listing = function(arr, classname, classid) {
    var $r = $('<div class="itemsc">');
    for (var i = 0; i < arr.length; i++) {
        var itemid = arr[i];
        if ( typeof window.items[Number(arr[i])] === 'undefined' ) {
            setuptools.tmp.constantsRemovedItems.push(Number(arr[i]));
            setuptools.config.disqualifiedItemIds.push(Number(arr[i]));
        }
        setuptools.app.muledump.item(itemid, undefined, undefined, [classname, i, classid]).appendTo($r);
    }
    if (classname) $r.addClass(classname);
    return $r;
};

setuptools.app.muledump.findUnknownItems = function() {

}
