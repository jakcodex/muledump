//
//  settings and things inside muledump / separate from mainland setuptools
//

//  provide a warning button for an account when problems are detected
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

//  deduplicate and validate custom character id list
setuptools.app.muledump.chsortcustomDedupAndValidate = function(CustomList, mule) {

    //  get our list of char ids
    var FinalList = [];
    var CharIdList = [];
    var DuplicateList = [];
    var RemovedList = [];
    CustomList = CustomList.replace('#', '').split(/, ?/);

    //  generate the character id list
    for ( var i = 0; i < mule.data.query.results.Chars.Char.length; i++ ) CharIdList.push(mule.data.query.results.Chars.Char[i].id);

    //  validate and deduplicate
    for ( var i in CustomList ) {

        if ( CustomList.hasOwnProperty(i) ) {

            //  is it a valid id
            if ( CharIdList.indexOf(CustomList[i]) === -1 ) {
                if ( typeof CustomList[i] === 'string' ) RemovedList.push(JSON.parse(JSON.stringify(CustomList[i])));
                delete CustomList[i];
            }

            //  is it already in the list
            if ( DuplicateList.indexOf(CustomList[i]) > -1) {
                if ( typeof CustomList[i] === 'string' ) RemovedList.push(JSON.parse(JSON.stringify(CustomList[i])));
                delete CustomList[i];
            } else {
                if ( typeof CustomList[i] === 'string' ) DuplicateList.push(JSON.parse(JSON.stringify(CustomList[i])));
            }

        }

    }

    //  clean up our final list
    for ( var i in CustomList )
        if ( CustomList.hasOwnProperty(i) )
            if ( typeof CustomList[i] === 'string' )
                FinalList.push(CustomList[i]);

    return {FinalList: FinalList, RemovedList: RemovedList};

};

//  assist the user in creating a custom sort list
setuptools.app.muledump.chsortcustom = function(mule) {

    if ( !mule ) setuptools.lightbox.error('No mule provided to custom sort utility.');

    //  prepare the object is none exists
    if ( typeof setuptools.data.muledump.chsortcustom.accounts[mule.guid] === 'undefined' ) setuptools.data.muledump.chsortcustom.accounts[mule.guid] = {active: '', data: {}};

    setuptools.lightbox.build('muledump-chsortcustom-index', ' \
        Saving a list will set that list as active and overwrite any stored data for that list or create a new list item. \
        <br><br><strong>For account :</strong><span style="font-weight: bold;">:</span> ' + mule.guid + ' \
        ' + ( (
            setuptools.state.loaded === true &&
            typeof setuptools.data.accounts.accounts[mule.guid].ign === 'string' &&
            setuptools.data.accounts.accounts[mule.guid].ign.length > 0
            ) ? '<br><strong>IGN :</strong><span style="font-weight: bold;">:</span> ' + setuptools.data.accounts.accounts[mule.guid].ign + '</span>' : '' ) + '\
        <br><br><strong>Choose Existing List</strong> \
        <br>\
        <div class="setuptools app"> \
    ');

    //  build our select menu
    if ( Object.keys(setuptools.data.muledump.chsortcustom.accounts[mule.guid].data).length > 0 ) {

        setuptools.lightbox.build('muledump-chsortcustom-index', ' \
                <br><select name="chsortExisting" class="setuptools app nomargin"> \
        ');

        //  loop thru data
        for ( var i in setuptools.data.muledump.chsortcustom.accounts[mule.guid].data )
            if ( setuptools.data.muledump.chsortcustom.accounts[mule.guid].data.hasOwnProperty(i) )
                setuptools.lightbox.build('muledump-chsortcustom-index', ' \
                    <option value="' + i + '" ' + ( (setuptools.data.muledump.chsortcustom.accounts[mule.guid].active === i) ? 'selected' : '' ) + '>' + i + '</option> \
                ');

        setuptools.lightbox.build('muledump-chsortcustom-index', ' \
                </select> \
        ');

    } else {

        setuptools.lightbox.build('muledump-chsortcustom-index', 'No saved lists found');

    }

    setuptools.lightbox.build('muledump-chsortcustom-index', ' \
            <br><br><strong>List Name to Edit</strong> \
            <br><br><input name="chsortListName" class="setuptools app nomargin" value="' + setuptools.data.muledump.chsortcustom.accounts[mule.guid].active + '"> \
        </div>\
        <br><strong>Prepare List</strong> \
        <br><br>Enter a list of IDs separated by commas. \
        <br><br><input type="text" name="chsortcustom" class="setuptools app wideinput" value="' + ( ( setuptools.data.muledump.chsortcustom.accounts[mule.guid].active.length > 0 ) ? setuptools.data.muledump.chsortcustom.accounts[mule.guid].data[setuptools.data.muledump.chsortcustom.accounts[mule.guid].active].join(', ') : '' ) + '"> \
        <br><br> \
        <div>\
            <div class="setuptools link muledump save list nomargin cfleft menuStyle">Save List</div> \
            <div class="setuptools link muledump save delete nomargin destroy action noclose menuStyle negative cfright">Delete List</div> \
        </div> \
    ');

    setuptools.lightbox.settitle('muledump-chsortcustom-index', 'Character Sorting Lists');
    setuptools.lightbox.drawhelp('muledump-chsortcustom-index', 'docs/features/character-sorting', 'Character Sorting Lists Help');
    setuptools.lightbox.display('muledump-chsortcustom-index');

    //  populate selected data
    $('select[name="chsortExisting"]').change(function() {

        var chsortId = $(this).val();
        $('input[name="chsortListName"]').val(chsortId);
        $('input[name="chsortcustom"]').val(setuptools.data.muledump.chsortcustom.accounts[mule.guid].data[chsortId].join(', '));

    });

    $('.setuptools.link.muledump.save.delete').click(function() {

        var chsortId = $('input[name="chsortListName"]').val();
        if ( chsortId.length === 0 ) return;
        if ( typeof setuptools.data.muledump.chsortcustom.accounts[mule.guid].data[chsortId] === 'undefined' ) return;

        //  delete the list
        delete setuptools.data.muledump.chsortcustom.accounts[mule.guid].data[chsortId];

        //  set default value to top key
        var newChsortId = Object.keys(setuptools.data.muledump.chsortcustom.accounts[mule.guid].data)[0];
        if ( setuptools.data.muledump.chsortcustom.accounts[mule.guid].active === chsortId )
            setuptools.data.muledump.chsortcustom.accounts[mule.guid].active = (typeof newChsortId === 'undefined' ) ? '' : newChsortId;

        //  save the changes
        setuptools.app.config.save('CharacterSort/Delete');

        //  update the form
        $('select[name="chsortExisting"] option[value="' + chsortId + '"]').remove();
        if ( typeof newChsortId === 'string' ) {

            $('select[name="chsortExisting"] option[value="' + newChsortId + '"]').prop('selected', 'selected');
            $('input[name="chsortListName"]').val(newChsortId);
            $('input[name="chsortcustom"]').val(setuptools.data.muledump.chsortcustom.accounts[mule.guid].data[newChsortId].join(', '));

        }

    });

    //  save changes to a list or new list
    $('.setuptools.link.muledump.save.list').click(function() {

        var UserListName = $('input[name="chsortListName"]').val();
        var UserInput = $('input[name="chsortcustom"]').val();
        var Lists = false;
        if ( UserInput.length > 0 ) Lists = setuptools.app.muledump.chsortcustomDedupAndValidate(UserInput, mule);
        var SaveState = false;

        //  save the list if it's at least 1 long
        if ( typeof Lists === 'object' && Lists.FinalList.length > 0 ) {

            setuptools.data.muledump.chsortcustom.accounts[mule.guid].active = UserListName;
            setuptools.data.muledump.chsortcustom.accounts[mule.guid].data[UserListName] = $.extend(true, [], Lists.FinalList);
            SaveState = setuptools.app.config.save('CharacterSort/Save');
            if ( setuptools.config.devForcePoint !== 'chsortcustom-save' && SaveState === true ) {

                if ( Lists.RemovedList.length > 0 ) setuptools.lightbox.build('muledump-chsortcustom-save', 'The follow IDs were invalid or duplicates: <br><br>' + Lists.RemovedList.join(', ') + '<br><br>');
                setuptools.lightbox.build('muledump-chsortcustom-save', 'The changes have been saved.');
                mule.query(false, true);

            }

        } else {

            //  if no list is provided then we're erasing this instead
            if ( UserInput.length === 0 ) {

                setuptools.lightbox.build('muledump-chsortcustom-save', 'Choose \'Delete List\' to remove a list.');

            } else {

                setuptools.lightbox.build('muledump-chsortcustom-save', 'Oops! No valid account IDs were detected.');

            }

            setuptools.lightbox.build('muledump-chsortcustom-save', ' \
                <br><br>Valid formats include: \
                <br><br><span style="margin-right: 20px; margin-top: 20px;">1, 2, 3, 4, ...</span> \
                <br><br><span style="margin-right: 20px; margin-top: 20px;">1,2,3,4,...</span> \
                <br><br><span style="margin-right: 20px; margin-top: 20px;">#1,#2,#3,#4,...</span> \
                <br><br><span style="margin-right: 20px; margin-top: 20px;">1, #2, 3,#4, ...</span> \
                <br><br>You get the idea. \
            ');

        }

        if ( SaveState === false ) setuptools.lightbox.build('muledump-chsortcustom-save', 'Hmm, there was a problem saving. This setting will reset on page reload.');
        setuptools.lightbox.goback('muledump-chsortcustom-save', function() {
            setuptools.app.muledump.chsortcustom(mule);
        });
        setuptools.lightbox.settitle('muledump-chsortcustom-save', 'Character Sorting Lists');
        setuptools.lightbox.display('muledump-chsortcustom-save');


    });

};

//  binds the item tooltip to all item divs
setuptools.app.muledump.tooltip = function($i, classes) {

    //  select all items
    if ( !item ) $i = $('.item');

    //  item mouseenter events
    $i.off('mouseenter.muledump.tooltip').on('mouseenter.muledump.tooltip', function(e) {

        if ( e.ctrlKey === true ) return;
        var self = this;
        var id = +$(self).attr('data-itemId');
        var ItemData = items[id];
        if ( typeof ItemData !== 'object' || ItemData[0] === 'Empty Slot' ) return;

        //  tooltip popup
        clearTimeout(setuptools.tmp.tstateOpen);
        setuptools.tmp.tstateOpen = setTimeout(function() {
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
        }, setuptools.data.config.tooltip);

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

//  add an item to the notice button
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

//  check for new notices and display them
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

setuptools.app.muledump.notices.remove = function(queuePos) {

    var noticeDom = $('#notice');
    setuptools.app.muledump.notices.queue.splice(queuePos, 1);
    if ( setuptools.app.muledump.notices.queue.length === 0 ) noticeDom.fadeOut(1000, function() {
        $(this).remove();
    })

};

//  build and display the notice button
setuptools.app.muledump.notices.display = function(queuePos) {

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

//  generate an image of the specified dom
setuptools.app.muledump.canvas = function(dom) {

    if ( setuptools.tmp.canvasWait === true ) return;
    setuptools.tmp.canvasWait = true;
    setuptools.lightbox.build('canvas-loading', 'This may take awhile for larger images. Please wait...');
    setuptools.lightbox.settitle('canvas-loading', 'Generating Image');
    setuptools.lightbox.display('canvas-loading', {
        closeSpeed: 0,
        afterClose: function() { setuptools.tmp.canvasWait = false; },
        afterOpen: function() {

            html2canvas(dom).then(function(canvas) {

                if ( setuptools.tmp.canvasWait === true ) {

                    setuptools.lightbox.close('canvas-loading');
                    setuptools.lightbox.build('canvas-display', 'Right click and choose "Save image as..." <br><br><div id="html2canvas"></div>');
                    setuptools.lightbox.settitle('canvas-display', 'Mule Image');
                    setuptools.lightbox.display('canvas-display', {
                        variant: 'setuptools-large',
                        openSpeed: 0
                    });
                    $('#html2canvas').append(canvas);
                    setuptools.app.ga('send', 'event', {
                        eventCategory: 'detect',
                        eventAction: 'export-html2canvas'
                    });

                }

                //  rip all those cpu cycles if they closed the loading window

            });

        }
    });

};

/* AffaSearch(TM) */
setuptools.app.muledump.pagesearch = {
    state: {
        list: []
    }
};

//  prepare the account search menu
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

/*
//  Totals
*/

setuptools.app.muledump.totals = {
    menu: {},
    config: {}
};

//  display the advanced totals menu
setuptools.app.muledump.totals.menu.advanced = function(track, page) {

    if ( !(track instanceof jQuery) ) track = $('#totalsMenu');
    setuptools.lightbox.menu.context.close('totalsmenuAdvanced');
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
            callback: setuptools.app.muledump.totals.menu.advanced,
            callbackArg: [track, page]
        },
        {
            option: 'css',
            css: {
                width: '177px'
            }
        },
        {
            option: 'class',
            value: 'smallMenuCells'
        },
        {
            option: 'pos',
            h: 'left',
            v: 'top',
            vpx: 28
        },
        {
            class: 'goBack',
            name: 'Go back...',
            callback: setuptools.app.muledump.totals.menu.main,
            override: 'afterClose'
        },
        /*{
            class: 'goBack',
            name: 'Basic Filters...',
            callback: setuptools.app.muledump.totals.menu.basic,
            override: 'afterClose'
        },*/
        {
            option: 'header',
            value: 'Weapons',
            class: 'openTotalWeaponsMenu',
            callback: function(args) {
                setuptools.app.muledump.totals.menu.advanced(args.track, args.page);
            },
            callbackArg: {track: track, page: 'weapons'},
            override: 'afterClose'
        }
    ];

    //  populate type - weapons
    if ( page === 'weapons' ) setuptools.app.muledump.totals.menu.populateByType(
        options,
        ['bows', 'daggers', 'katanas', 'staves', 'swords', 'wands']
    );

    options.push({
        option: 'header',
        value: 'Abilities',
        class: 'openTotalAbilitiesMenu',
        callback: function(args) {
            setuptools.app.muledump.totals.menu.advanced(args.track, args.page);
        },
        callbackArg: {track: track, page: 'abilities'},
        override: 'afterClose'
    });

    //  populate type - abilities
    if ( page === 'abilities' ) setuptools.app.muledump.totals.menu.populateByType(
        options,
        ['cloaks', 'helms', 'orbs', 'poisons', 'prisms', 'quivers', 'scepters', 'seals', 'shields', 'skulls', 'spells', 'stars', 'tomes', 'traps']
    );

    options.push({
        option: 'header',
        value: 'Armor',
        class: 'openTotalArmorMenu',
        callback: function(args) {
            setuptools.app.muledump.totals.menu.advanced(args.track, args.page);
        },
        callbackArg: {track: track, page: 'armor'},
        override: 'afterClose'
    });

    //  populate type - armor
    if ( page === 'armor' ) setuptools.app.muledump.totals.menu.populateByType(
        options,
        ['heavyarmor', 'lightarmor', 'robes']
    );

    setuptools.app.muledump.totals.menu.populateByType(options, ['rings']);

    options.push(
        {
            class: 'disableAll',
            name: 'Disable All Filters',
            callback: setuptools.app.muledump.totals.config.toggleAllTypes,
            callbackArg: false
        },
        {
            class: 'hideAll',
            name: 'Enable All Filters',
            callback: setuptools.app.muledump.totals.config.toggleAllTypes,
            callbackArg: true
        }
    );

    if ( setuptools.data.muledump.totals.configSets.active !== 'Default' ) options.push({
        class: 'saveTotalsSettings',
        name: 'Save Settings',
        callback: function() {
            setuptools.app.muledump.totals.config.save('active', true);
            setuptools.lightbox.status(this, 'Saved!');
        }
    });

    options.push({
        class: 'resetTotalsSettings',
        name: 'Reset Settings',
        callback: function() {
            setuptools.app.muledump.cleanupSecondaryCache();
            setuptools.app.muledump.totals.config.activate('active', true);
        }
    });

    setuptools.lightbox.menu.context.create('totalsmenuAdvanced', false, track, options);

};

//  display the item types totals menu
//  presently not used (keeping the menu short)
setuptools.app.muledump.totals.menu.basic = function(track, page) {

    if ( !(track instanceof jQuery) ) track = $('#totalsMenu');
    setuptools.lightbox.menu.context.close('totalsmenuBasic');
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
            callback: setuptools.app.muledump.totals.menu.basic,
            callbackArg: [track, page]
        },
        {
            option: 'class',
            value: 'smallMenuCells'
        },
        {
            option: 'css',
            css: {
                width: '177px'
            }
        },
        {
            option: 'pos',
            h: 'left',
            v: 'top',
            vpx: 28
        },
        {
            class: 'goBack',
            name: 'Go back...',
            callback: setuptools.app.muledump.totals.menu.main,
            override: 'afterClose'
        },
        {
            class: 'goBack',
            name: 'Advanced Filters...',
            callback: setuptools.app.muledump.totals.menu.advanced,
            override: 'afterClose'
        }
    ];

    /* waiting on this
    options.push({
        option: 'header',
        value: 'Equipment',
        class: 'openTotalEquipmentMenu',
        callback: function(args) {
            setuptools.app.muledump.totals.menu.basic(args.track, args.page);
        },
        callbackArg: {track: track, page: 'equipment'},
        override: 'afterClose'
    });

    //  populate type - equipment
    if ( page === 'equipment' ) setuptools.app.muledump.totals.menu.populateByType(
        options,
        ['weapons', 'abilities', 'armor', 'rings']
    );*/

    options.push({
        option: 'header',
        value: 'Consumables',
        class: 'openTotalConsumableMenu',
        callback: function(args) {
            setuptools.app.muledump.totals.menu.basic(args.track, args.page);
        },
        callbackArg: {track: track, page: 'consumables'},
        override: 'afterClose'
    });

    //  populate type - consumables
    if ( page === 'consumables' ) setuptools.app.muledump.totals.menu.populateByType(
        options,
        ['candies', 'helpfulconsumables', 'assistants', 'otherconsumables', 'potions', 'potionssb']
    );

    options.push({
        option: 'header',
        value: 'Single Use Items',
        class: 'openTotalSingleUseMenu',
        callback: function(args) {
            setuptools.app.muledump.totals.menu.basic(args.track, args.page);
        },
        callbackArg: {track: track, page: 'singleuse'},
        override: 'afterClose'
    });

    //  populate type - singleuser
    if ( page === 'singleuse' ) setuptools.app.muledump.totals.menu.populateByType(
        options,
        ['finespirits', 'eggs', 'keys', 'petfood', 'petstones', 'portkeys', 'skins', 'textiles']
    );

    options.push({
        option: 'header',
        value: 'Other Items',
        class: 'openTotalOtherItemsMenu',
        callback: function(args) {
            setuptools.app.muledump.totals.menu.basic(args.track, args.page);
        },
        callbackArg: {track: track, page: 'otheritems'},
        override: 'afterClose'
    });

    //  populate type - armor
    if ( page === 'otheritems' ) setuptools.app.muledump.totals.menu.populateByType(
        options,
        ['empty', 'eventitems', 'misc', 'tarot', 'treasures', 'assistants', 'other', 'tarot', 'treasures']
    );

    options.push(
        {
            class: 'disableAll',
            name: 'Disable All Filters',
            callback: setuptools.app.muledump.totals.config.toggleAllTypes,
            callbackArg: false
        },
        {
            class: 'hideAll',
            name: 'Enable All Filters',
            callback: setuptools.app.muledump.totals.config.toggleAllTypes,
            callbackArg: true
        }
    );

    if ( setuptools.data.muledump.totals.configSets.active !== 'Default' ) options.push({
        class: 'saveTotalsSettings',
        name: 'Save Settings',
        callback: function() {
            setuptools.app.muledump.totals.config.save('active', true);
            setuptools.lightbox.status(this, 'Saved!');
        }
    });

    options.push({
        class: 'resetTotalsSettings',
        name: 'Reset Settings',
        callback: function() {
            setuptools.app.muledump.cleanupSecondaryCache();
            setuptools.app.muledump.totals.config.activate('active', true);
        }
    });

    setuptools.lightbox.menu.context.create('totalsmenuBasic', false, track, options);

};

//  display a menu for managing totals-related settings
setuptools.app.muledump.totals.menu.settings = function() {

    /*  Active Configuration Sets
    /*  Create New Configuration Set
    /*  Active Account Filter Members
    /*  Item Group Sort Order
    /*  Permanently Hidden Items
    */

    setuptools.lightbox.close();
    setuptools.lightbox.build('totalsmenu-settings', ' \
        <div class="flex-container" style="flex-wrap: wrap;">\
    ');

    if ( setuptools.state.loaded === false ) setuptools.lightbox.build('totalsmenu-settings', ' \
        <div class="w100">In order to permanently save these settings you must be using SetupTools. See <a href="https://github.com/jakcodex/muledump/wiki/Totals-Management" target="_blank">Totals Management</a> in the wiki.</div>\
        <div class="w100">&nbsp;</div> \
    ');

    //  display the account filter info
    setuptools.lightbox.build('totalsmenu-settings', ' \
        <div class="w100 flex-container" style="justify-content: space-around;">\
            <div style="width: 225px; font-size: 14px;"><strong>Active Configuration Set</strong></div>\
            <div style="width: 201px;">\
                <select class="setuptools w100" name="totalsConfigSets">\
    ');

    Object.filter(setuptools.data.muledump.totals.configSets.settings, function(name, config) {
        var activeText = '';
        if ( setuptools.data.muledump.totals.configSets.active === name ) activeText = ' (active)';
        setuptools.lightbox.build('totalsmenu-settings', ' \
                        <option ' + ( (setuptools.data.muledump.totals.configSets.active === name) ? 'selected' : '' ) + ' value="' + name + '">' + name + activeText + '</option>\
        ');
    });

    var favClass = '';
    var favTitle = 'Click to Favorite';
    if ( setuptools.data.muledump.totals.configSets.favorites.indexOf(setuptools.data.muledump.totals.configSets.active) > -1 ) {
        favClass = 'selected';
        favTitle = 'Click to Unfavorite';
    }

    setuptools.lightbox.build('totalsmenu-settings', ' \
                </select>\
            </div>\
            <div class="flex-container noFlexAutoWidth" style="width: 326px; justify-content: flex-start; padding-left: 5px;">\
                <div class="setuptools link favorite noclose menuStyle flex-container ' + favClass + '" title="' + favTitle + '" style="background-color: initial; width: 26px; height: 26px"><span style="margin-top: -2px;">&#9733;</span></div>\
                <div class="setuptools link activateSet noclose menuStyle menuTiny textCenter flex-container" style="width: 93px; height: 26px;">Save</div> \
                <div class="setuptools link reset noclose menuStyle menuTiny textCenter flex-container" style="width: 93px; height: 26px;">Reset</div> \
                <div class="setuptools link deleteSet noclose menuStyle menuTiny negative textCenter flex-container mr0" style="width: 93px; height: 26px;">Delete</div> \
            </div>\
        </div>\
        <div class="w100">&nbsp;</div>\
        \
        <div class="w100 flex-container" style="justify-content: space-around;">\
            <div class="accountFilterList" style="width: 225px; font-size: 14px;"><strong>Create New Configuration Set</strong></div>\
            <div style="width: 201px;">\
                <input type="text" name="newConfigSetName" placeholder="New configuration set name..." class="setuptools w100">\
            </div>\
            <div class="flex-container noFlexAutoWidth" style="width: 326px; justify-content: flex-start; padding-left: 5px;">\
                <div class="setuptools link saveNewSet noclose menuStyle menuTiny textCenter flex-container" style="width: 124px; height: 26px;">Create</div>  \
            </div>\
        </div>\
        <div class="w100">&nbsp;</div>\
        \
        <div class="w100 itemSlotTypeSorting" style="justify-content: flex-start; font-size: 14px;"><strong>Item Group Sorting</strong></div>\
        ' + ( (setuptools.app.muledump.totals.config.getKey('slotOrder').length === 0) ? '<div class="w100" style="justify-content: flex-start">Uh oh :D This configSet has invalid data!<br>&nbsp;</div>' : '' ) + ' \
        <div class="w100 flex-container scrollbar" style="height: 113px; overflow-y: scroll; flex-wrap: wrap;" id="itemSlotTypeSorting">\
    ');

    //  sort keys into their proper order
    var types = setuptools.app.muledump.totals.config.getTypes().sort(function(a, b) {
        var slotOrder = setuptools.app.muledump.totals.config.getKey('slotOrder');
        var vst = {};
        vst.a = setuptools.app.muledump.itemSlotTypeVst(a);
        vst.b = setuptools.app.muledump.itemSlotTypeVst(b);
        return ( slotOrder.indexOf(vst.a) - slotOrder.indexOf(vst.b) );
    });

    //  display a tile for each type
    types.filter(function(type) {
        var name = setuptools.app.muledump.itemSlotTypeName(type);
        var vst = setuptools.app.muledump.itemSlotTypeVst(type);
        var itemList = setuptools.app.muledump.itemsByVst(vst);
        var item = window.items[itemList[Math.floor(Math.random()*Math.floor(itemList.length))]];
        var classes = '';

        if ( setuptools.data.options['totalsFilter-' + type] === true ) classes += 'enabled';
        setuptools.lightbox.build('totalsmenu-settings', ' \
            <div class="itemSlotTypeSorting cell flex-container noFlexAutoWidth ' + classes + '" data-type="' + type + '" style="overflow: hidden; justify-content: space-between;"> \
                <div>' + name + '</div> \
                <div style="width: 40px; height: 40px; position: relative; background-image: url(lib/media/itemsilhouettes.png); background-position: -' + window.itemsSlotTypeMap[type].sheet[0] + 'px -' + window.itemsSlotTypeMap[type].sheet[1] + 'px; background-repeat: no-repeat;"></div>\
            </div>\
        ');

    });

    setuptools.lightbox.build('totalsmenu-settings', ' \
        </div>\
        <div class="flex-container itemSlotTypeSorting expansion" title="Expand">&#9898;&#9898;&#9898;</div>\
        <div class="w100" style="margin-top: 4px; margin-left: 1px; justify-content: flex-start;"><div class="setuptools link resetSlotOrder menuStyle negative">Reset to Default Sorting Order</div></div> \
        <div class="w100">&nbsp;</div>\
        \
        <div class="w100 accountFilterList" style="justify-content: flex-start; font-size: 14px;"><strong>Active Account Filter Members</strong></div>\
        ' + ( (setuptools.app.muledump.totals.config.getKey('accountFilter').length === 0) ? '<div class="w100" style="justify-content: flex-start">No accounts in filter</div>' : '' ) + ' \
        <div class="w100 scrollbar flex-container" style="max-height: 264px; overflow-y: scroll; flex-wrap: wrap; " id="accountFilterList">\
    ');

    if ( setuptools.app.muledump.totals.config.getKey('accountFilter').length > 0 ) setuptools.lightbox.build('totalsmenu-settings', '\
        <div class="flex-container nohover muledump link nameswap menuStyle buttonStyle noFlexAutoWidth mt5" title="Switch Account Name Display"><div style="font-weight: normal; overflow: hidden;">&#9788;</div></div> \
    ');

    setuptools.app.muledump.totals.config.getKey('accountFilter').sort();
    setuptools.app.muledump.totals.config.getKey('accountFilter').filter(function(guid) {

        setuptools.lightbox.build('totalsmenu-settings', ' \
            <div data-guid="' + guid + '">' + setuptools.app.muledump.getName(guid) + '</div>\
        ');

    });

    setuptools.lightbox.build('totalsmenu-settings', ' \
        </div>\
        <div class="w100">&nbsp;</div>\
    ');

    //  display the hidden items filter info
    setuptools.lightbox.build('totalsmenu-settings', ' \
        <div class="w100" style="justify-content: flex-start; font-size: 14px;"><strong>Permanently Hidden Items</strong></div>\
        ' + ( ( setuptools.app.muledump.totals.config.getKey('itemFilter').length === 0 ) ? '<div class="w100" style="justify-content: flex-start">No items hidden</div>' : '' ) + '\
        <div class="w100 scrollbar flex-container" style="height: 90px; overflow-y: scroll; flex-wrap: wrap; justify-content: flex-start;" id="hiddenItems">');

    if ( setuptools.app.muledump.totals.config.getKey('itemFilter').length > 0 ) {

        setuptools.app.muledump.totals.config.getKey('itemFilter').filter(function(itemid) {

            var item = items[+itemid];
            setuptools.lightbox.build('totalsmenu-settings', '<div class="item noselect" data-itemId="' + itemid + '" style="background-position: -' + item[3] + 'px -' + item[4] + 'px;"></div>');

        });

    }

    setuptools.lightbox.build('totalsmenu-settings', '</div>\
    ');

    if ( setuptools.app.muledump.totals.config.getKey('itemFilter').length > 0 ) setuptools.lightbox.build('totalsmenu-settings', ' \
        <div class="flex-container hiddenItems expansion" title="Expand">&#9898;&#9898;&#9898;</div>\
        <div class="w100" style="margin-top: 4px; margin-left: 1px; justify-content: flex-start;"><div class="setuptools link clearAllHidden menuStyle negative">Clear All Hidden Items</div></div>\
    ');

    setuptools.lightbox.build('totalsmenu-settings', ' \
        <div class="w100">&nbsp;\
            <br><strong>Legend</strong>\
            <br>Shift+Click items to enable/disable them\
            <br>Click and drag items to sort them (item sorting)\
            <br>Double click items to access subsorting menu (item sorting)\
        </div>\
    ');

    var currentSet = setuptools.data.muledump.totals.configSets.active;
    setuptools.lightbox.settitle('totalsmenu-settings', 'Totals Settings Manager');
    setuptools.lightbox.drawhelp('totalsmenu-settings', 'docs/muledump/totals-manager', 'Totals Help');
    setuptools.lightbox.display('totalsmenu-settings', {variant: 'fl-Totals', afterClose: function() {
        setuptools.tmp.itemSortDragging.off();
        setuptools.app.muledump.totals.updateSecondaryFilter();
        window.update_totals();
        window.update_filter();
        option_updated('totals');
    }});

    if ( setuptools.state.loaded === false ) {
        $('.featherlight-content input').prop('disabled', true).attr('placeholder', 'This feature requires SetupTools');
        $('.featherlight-content select').prop('disabled', true);
        $('.featherlight-content div.setuptools.menuStyle:not(.resetSlotOrder)').addClass('disabled truly').removeClass('selected negative').attr('title', 'This feature requires SetupTools');
    }

    //  item subsorting allows for sorting items within a group
    $('.itemSlotTypeSorting.cell')
        .on('click.muledump.totals.itemGroupSorting', function(e) {
            if ( e.shiftKey === false ) return;
            setuptools.app.muledump.toggleoption('totalsFilter-' + $(this).attr('data-type'), undefined, true);
            $(this).toggleClass('enabled');
            if ( setuptools.state.loaded === false ) {
                window.update_totals();
                window.update_filter();
                option_updated('totals');
            }
        })
        .on('dblclick.muledump.totals.itemGroupSorting', function(e) {

            var vst = setuptools.app.muledump.itemSlotTypeVst($(this).attr('data-type'));
            var itemList = setuptools.app.muledump.itemsByVst(vst);
            if ( typeof vst === 'undefined' ) return;

            setuptools.lightbox.build('totalsmenu-itemSorting', ' \
                <div class="w100">\
                    Click and drag to sort items within their group. Don\'t forget to save on previous page.\
                    <br>&nbsp;\
                </div>\
                <div class="w100 scrollbar flex-container" id="itemSubsortingBox">\
            ');

            //  determine item sorting
            var slotSubOrder = setuptools.app.muledump.totals.config.getKey('slotSubOrder');
            if ( Array.isArray(slotSubOrder[vst]) === false ) {

                //itemList = itemList.sort(window.ids_sort);
                slotSubOrder[vst] = itemList;

            }

            if ( slotSubOrder[vst].length > 0 ) slotSubOrder[vst].filter(function(itemid) {

                var item = items[+itemid];
                if ( setuptools.config.disqualifiedItemIds.indexOf(+itemid) > -1 ) return;
                if ( item[3] === 40 && item[4] === 0 ) return;
                setuptools.lightbox.build('totalsmenu-itemSorting', '<div class="item subsorting cell noselect" data-itemId="' + itemid + '" style="background-position: -' + item[3] + 'px -' + item[4] + 'px;"></div>');

            });

            setuptools.lightbox.build('totalsmenu-itemSorting', ' \
                </div>\
                \
            ');

            setuptools.lightbox.settitle('totalsmenu-itemSorting', 'Item Sorting');
            setuptools.lightbox.display('totalsmenu-itemSorting', {variant: 'fl-Totals'});

            //  provide a hidden item filter integration
            $('#itemSubsortingBox > div.item').on('click.muledump.itemFilter', function(e) {

                if ( e.target !== this || e.shiftKey === false || !$(this).attr('data-itemid') ) return;
                setuptools.app.muledump.totals.toggleHideItem($(this).attr('data-itemid'));
                $(this).toggleClass('selected');

            });

            //  bind the tooltip
            var itemsSelected = $('div#itemSubsortingBox div.item');
            setuptools.app.muledump.tooltip(itemsSelected, 'itemSubsortingTooltip');

            //  item dragging
            setuptools.tmp.itemSubsortDragging = new Muledump_Dragging({
                target: ['item', 'subsorting', 'cell'],
                targetattr: 'data-itemId',
                approach: 0.1,
                dragclass: 'dragging bright',
                callbacks: {
                    before: function(parent, self) {

                        if (
                            typeof window.items[self.attr('data-itemId')] !== 'object' ||
                            typeof window.items[parent.target] !== 'object'
                        ) return;

                        //  determine source and target virtualSlotTypes and exit if target doesn't have the attribute
                        var itemid = self.attr('data-itemId');
                        var targetid = parent.target;
                        parent.itemid = itemid;
                        parent.targetid = targetid;
                        if ( itemid === targetid ) return;
                        return true;

                    },
                    after: function(parent, self) {

                        var slotSubOrder = setuptools.app.muledump.totals.config.getKey('slotSubOrder');
                        var vst = window.items[parent.itemid][setuptools.config.vstIndex];
                        slotSubOrder[vst].splice(slotSubOrder[vst].indexOf(parent.itemid), 1);
                        slotSubOrder[vst].splice((slotSubOrder[vst].indexOf(parent.targetid)+parent.indexModifier), 0, parent.itemid);

                    }
                }
            });

        });

    //  bind the dragging class
    setuptools.tmp.itemSortDragging = new Muledump_Dragging({
        target: ['itemSlotTypeSorting', 'cell'],
        targetattr: 'data-type',
        approach: 0.1,
        callbacks: {
            before: function(parent, self) {

                if (
                    typeof window.itemsSlotTypeMap[self.attr('data-type')] !== 'object' ||
                    typeof window.itemsSlotTypeMap[parent.target] !== 'object'
                ) return;

                //  determine source and target virtualSlotTypes and exit if target doesn't have the attribute
                var vst = setuptools.app.muledump.itemSlotTypeVst(self.attr('data-type'));
                var targetVst = setuptools.app.muledump.itemSlotTypeVst(parent.target);
                parent.vst = vst;
                parent.targetVst = targetVst;
                if ( vst === targetVst ) return;
                return true;

            },
            after: function(parent, self) {

                var slotOrder = setuptools.app.muledump.totals.config.getKey('slotOrder');
                slotOrder.splice(slotOrder.indexOf(parent.vst), 1);
                slotOrder.splice((slotOrder.indexOf(parent.targetVst)+parent.indexModifier), 0, parent.vst);

            },
            finish: function(parent, self) {

                if ( parent.clickIndexDown === parent.clickIndexUp ) return;
                if ( setuptools.state.loaded === false ) {
                    window.init_totals();
                    window.update_totals();
                }

            }
        }
    });

    //  item sorting is an expandable box
    setuptools.lightbox.expander('#itemSlotTypeSorting', '.itemSlotTypeSorting.expansion');
    setuptools.lightbox.expander('#hiddenItems', '.hiddenItems.expansion');

    //  toggle favorite status
    $('.setuptools.link.favorite').on('click.muledump.totals.favorite', function() {

        if ( $(this).hasClass('disabled') === true ) return;
        var name = $(this).parent().prev().find('select[name="totalsConfigSets"]').val();
        if ( name === 'Default' ) {
            setuptools.lightbox.status(this, 'No!');
            return;
        }
        var index = setuptools.data.muledump.totals.configSets.favorites.indexOf(name);
        if ( index === -1 ) {
            setuptools.data.muledump.totals.configSets.favorites.push(name);
            $(this).addClass('selected').attr('title', 'Click to Unfavorite');
        } else {
            setuptools.data.muledump.totals.configSets.favorites.splice(index, 1);
            $(this).removeClass('selected').attr('title', 'Click to Favorite');
        }
        setuptools.app.config.save('Totals config set was favorite toggled', true);

    });

    //  automatically switch buttons on config selection
    $('select[name="totalsConfigSets"]').on('change.muledump.totals.totalsConfigSets', function() {

        var name = $(this).val();

        var favoriteButton = $('.setuptools.link.favorite');
        if ( setuptools.data.muledump.totals.configSets.favorites.indexOf(name) === -1 ) {
            favoriteButton.removeClass('selected').attr('title', 'Click to Favorite');
        } else favoriteButton.addClass('selected').attr('title', 'Click to Unfavorite');

        var activateButton = $('.setuptools.link.activateSet');
        if ( setuptools.data.muledump.totals.configSets.active === name ) {
            activateButton.text('Save');
        } else activateButton.text('Switch To');

    });

    //  resets configuration to original state
    $('.setuptools.link.reset').on('click.muledump.totals.reset', function() {
        if ( $(this).hasClass('disabled') === true ) return;
        setuptools.app.muledump.totals.config.activate(undefined, true, true);
        setuptools.lightbox.status(this, 'Active reset!');
        setuptools.app.muledump.totals.menu.settings();
    });

    //  switch active configuration
    $('.setuptools.link.activateSet')
        .off('click.muledump.totals.activateSet')
        .on('click.muledump.totals.activateSet', function() {

        if ( $(this).hasClass('disabled') === true ) return;
        var name = $('select[name="totalsConfigSets"]').val();
        if ( typeof setuptools.data.muledump.totals.configSets.settings[name] !== 'object' ) return;
        if ( $(this).text() === 'Save' ) {

            setuptools.app.muledump.totals.config.save(name, true);
            setuptools.lightbox.status($(this), 'Saved!');

            window.init_totals();
            window.update_totals();

            return;

        }

        if ( currentSet !== name ) setuptools.app.muledump.totals.config.reset(currentSet);
        currentSet = name;
        setuptools.app.muledump.totals.config.activate(name);
        setuptools.app.muledump.totals.menu.settings();
        setuptools.lightbox.status($('.setuptools.link.activateSet'), "Enabled!");

    });

    //  delete a configuration set
    $('.setuptools.link.deleteSet').on('click.muledump.totals.deleteSet', function() {

        if ( $(this).hasClass('disabled') === true ) return;
        var name = $('select[name="totalsConfigSets"]').val();
        if ( name === 'Default' ) {
            setuptools.lightbox.status(this, 'No!');
            return;
        }
        if ( typeof setuptools.data.muledump.totals.configSets.settings[name] !== 'object' ) return;
        delete setuptools.data.muledump.totals.configSets.settings[name];
        setuptools.app.config.save('Totals config set deleted', true);
        if ( name === setuptools.data.muledump.totals.configSets.active ) setuptools.app.muledump.totals.config.activate('Default');
        setuptools.app.muledump.totals.menu.settings();

    });

    //  save configurations
    $('.setuptools.link.saveNewSet').on('click.muledump.totals.saveNewSet', function() {

        if ( $(this).hasClass('disabled') === true ) return;
        if ( this.busy === true ) return;
        var name = $('input[name="newConfigSetName"]').val();

        //  name cannot be empty
        if ( name === '' ) {

            this.busy = true;
            $(this).removeClass('positive').addClass('negative');
            setuptools.lightbox.status(this, 'Invalid set name', function(self) {
                self.busy = false;
                $(self).removeClass('negative');
            });
            return;

        }

        //  name must be unique
        if ( typeof setuptools.data.muledump.totals.configSets[name] === 'object' ) {

            $(this).removeClass('positive').addClass('negative');
            setuptools.lightbox.status(this, 'Name already exists', function(self) {
                self.removeClass('negative').addClass('positive');
            });
            return;

        }

        var origName = setuptools.data.muledump.totals.configSets.active;

        //  create the configuration
        setuptools.app.muledump.totals.config.save(name);
        setuptools.app.muledump.totals.menu.settings();
        setuptools.lightbox.status($('.setuptools.link.saveNewSet'), 'Created!');

        //  reset previous configSet if saving a new set
        if ( origName !== name ) setuptools.app.muledump.totals.config.reset(origName);

    });

    //  reset the slotOrder to default
    $('div.setuptools.link.resetSlotOrder').on('click.muledump.resetSlotOrder', function() {
        setuptools.app.muledump.totals.config.setKey('slotOrder', $.extend(true, [], setuptools.copy.totals.defaultConfig.slotOrder));
        setuptools.app.muledump.totals.config.setKey('slotSubOrder', $.extend(true, {}, setuptools.config.totalsKeyObjects.slotSubOrder));
        setuptools.app.muledump.totals.menu.settings();
    });

    //  erase the hidden items list
    $('div.setuptools.link.clearAllHidden').on('click.muledump.clearAllHidden', function() {
        setuptools.app.muledump.totals.config.setKey('itemFilter', $.extend(true, [], setuptools.config.totalsKeyObjects.itemFilter));
        setuptools.tmp.globalTotalsCounter.import('clearExcluded');
        window.update_totals();
        window.update_filter();
        option_updated('totals');
        setuptools.app.muledump.totals.menu.settings();
    });

    //  handle hidden items list clicks
    var itemsSelected = $('div#hiddenItems div.item');
    setuptools.app.muledump.tooltip(itemsSelected, 'hiddenItemsTooltip');
    itemsSelected.off('click.muledump.totals.hiddenItems').on('click.muledump.totals.hiddenItems', function(e) {
        if ( e.shiftKey === true ) {

            var itemId = +$(this).attr('data-itemid');
            setuptools.app.muledump.totals.config.getKey('itemFilter').splice(setuptools.app.muledump.totals.config.getKey('itemFilter').indexOf(itemId), 1);
            setuptools.app.muledump.totals.config.setKey('itemFilter', setuptools.app.muledump.totals.config.getKey('itemFilter'));
            $(this).remove();
            $('.tooltip').remove();

        }
    });

    //  handle account filter list clicks
    $('#accountFilterList div').off('click.muledump.totals.accountFilterList').on('click.muledump.totals.accountFilterList', function(e) {

        if ( e.shiftKey === true ) {

            var guid = $(this).attr('data-guid');
            if ( !guid ) return;
            setuptools.app.muledump.totals.config.getKey('accountFilter').splice(setuptools.app.muledump.totals.config.getKey('accountFilter').indexOf(guid), 1);
            $(this).remove();
            if ( setuptools.app.muledump.totals.config.getKey('accountFilter').length === 0 ) {

                $('#accountFilterList').text('No accounts in filter');

            }

        }

    });

    $('div.muledump.link.nameswap').on('click.muledump.link.nameswap', function() {
        setuptools.data.config.mqDisplayIgn = !(setuptools.data.config.mqDisplayIgn);
        setuptools.app.muledump.totals.menu.settings();
    });

};

//  display the totals menu
setuptools.app.muledump.totals.menu.main = function(track) {

    if ( !(track instanceof jQuery) ) track = $('#totalsMenu');
    setuptools.lightbox.menu.context.close('totalsmenu');
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
            callback: setuptools.app.muledump.totals.menu.main
        },
        {
            option: 'class',
            value: 'smallMenuCells'
        },
        {
            option: 'css',
            css: {
                width: '177px'
            }
        },
        {
            option: 'pos',
            h: 'left',
            v: 'top',
            vpx: 28
        },
        {
            class: 'toggleTotals',
            name: ( (setuptools.data.options.totals === true) ? 'Disable' : 'Enable' ) + ' Totals',
            callback: setuptools.app.muledump.toggleoption,
            callbackArg: 'totals'
        },
        {
            class: 'openTotalsSettings',
            name: 'Settings Manager',
            callback: setuptools.app.muledump.totals.menu.settings,
            override: 'afterClose'
        }
    ];

    //  totals needs to be enabled for these options
    if ( setuptools.data.options.totals === true ) {

        if ( Array.isArray(setuptools.app.muledump.totals.config.getKey('accountFilter')) && setuptools.app.muledump.totals.config.getKey('accountFilter').length > 0 ) options.push({
            class: 'resetAccountFilter',
            name: 'Reset Account Filter',
            callback: function() {
                setuptools.app.muledump.totals.config.setKey('accountFilter', $.extend(true, [], setuptools.config.totalsKeyObjects.accountFilter));
                setuptools.app.muledump.totals.updateSecondaryFilter();
                setuptools.tmp.globalTotalsCounter.import();
                window.update_totals();
                window.update_filter();
                option_updated('totals');
            }
        });

        options.push({
            class: 'displayGlobalTotals',
            name: ( (setuptools.data.options.totalsGlobal === true) ? 'Disable' : 'Enable' ) + ' Global',
            callback: function(arg) {

                //  toggle the option
                setuptools.app.muledump.toggleoption(arg, undefined, true);

                //  mules with custom sorting need to be reset in certain circumstances
                for (var guid in mules)
                    if (mules.hasOwnProperty(guid))
                        if (mules[guid].customSorting === true) {

                            mules[guid].createCounter();
                            mules[guid].query(false, true);

                        }

                window.update_totals();
                window.update_filter();
                window.options_save();

            },
            callbackArg: 'totalsGlobal'
        });

        var favoriteOptions = {};
        setuptools.data.muledump.totals.configSets.favorites.filter(function(item, index) {
            if ( setuptools.app.muledump.totals.config.exists(item) === false ) {

                setuptools.data.muledump.totals.configSets.favorites.splice(index, 1);
                return;

            }

            favoriteOptions[item] = item;
        });
        if ( typeof favoriteOptions[setuptools.data.muledump.totals.configSets.active] !== 'string' ) favoriteOptions[setuptools.data.muledump.totals.configSets.active] = setuptools.data.muledump.totals.configSets.active;

        options.push(
        /*{
            class: 'totalsBasicMenu',
            name: 'Basic Filters...',
            callback: setuptools.app.muledump.totals.menu.basic,
            override: 'afterClose'
        },*/
        {
            option: 'select',
            name: 'Sorting Mode',
            class: 'sortingMode',
            options: {
                standard: 'Standard',
                alphabetical: 'Alphabetical',
                fb: 'Fame Bonus',
                fp: 'Feed Power'
            },
            selected: setuptools.app.muledump.totals.config.getKey('sortingMode'),
            binding: function() {

                $('select.sortingMode').on('change.muledump.totals.sortingMode', function() {

                    var mode = $(this).val();
                    setuptools.app.muledump.totals.config.setKey('sortingMode', mode);
                    setuptools.app.muledump.totals.updateSecondaryFilter();
                    window.init_totals();
                    window.update_totals();
                    setuptools.app.muledump.totals.menu.main();

                });

            }
        },
        {
            option: 'select',
            name: 'Favorite Filters',
            class: 'favoriteFilter',
            options: favoriteOptions,
            selected: setuptools.data.muledump.totals.configSets.active,
            binding: function() {

                $('select.favoriteFilter').on('change.muledump.totals.favoriteFilter', function() {

                    var name = $(this).val();
                    if ( typeof setuptools.data.muledump.totals.configSets.settings[name] !== 'object' ) return;
                    setuptools.app.muledump.totals.config.reset(setuptools.data.muledump.totals.configSets.active);
                    setuptools.app.muledump.totals.config.activate(name);
                    setuptools.app.muledump.totals.menu.main();

                });

            }
        });

        if ( setuptools.data.muledump.totals.configSets.active !== 'Default' ) options.push({
            class: 'saveTotalsSettings',
            name: 'Save Settings',
            callback: function() {
                setuptools.app.muledump.totals.config.save('active', true);
                setuptools.lightbox.status(this, 'Saved!');
            }
        });

        options.push({
            class: 'resetTotalsSettings',
            name: 'Reset Settings',
            callback: function() {
                setuptools.app.muledump.cleanupSecondaryCache();
                setuptools.app.muledump.totals.config.activate('active', true);
            }
        },
        {
            option: 'header',
            value: 'Advanced Filters...',
            class: 'totalsAdvancedMenu',
            callback: setuptools.app.muledump.totals.menu.advanced,
            override: 'afterClose'
        },
        {
            option: 'header',
            value: 'Standard Filters'
        },
        {
            option: 'select',
            name: 'Fame Bonus',
            class: 'fameBonusFilter',
            options: {
                '-1': 'Disabled',
                '0': '&gt; 0',
                '1': '&gt; 1%',
                '2': '&gt; 2%',
                '3': '&gt; 3%',
                '4': '&gt; 4%',
                '5': '&gt; 5%'
            },
            selected: setuptools.data.options.fameamount,
            binding: function() {

                $('select.fameBonusFilter').change(function() {

                    setuptools.data.options.famefilter = !( $(this).val() === '-1' );
                    setuptools.data.options.fameamount = $(this).val();
                    option_updated('famefilter');

                });

            }
        },
        {
            option: 'select',
            name: 'Feed Power',
            class: 'feedPowerFilter',
            options: {
                '-1': 'Disabled',
                '0': '> 0',
                '100': '> 100',
                '250': '> 250',
                '500': '> 500',
                '1000': '> 1000',
                '2500': '> 2500'
            },
            selected: setuptools.data.options.feedpower,
            binding: function() {

                $('select.feedPowerFilter').change(function() {

                    setuptools.data.options.feedfilter = !( $(this).val() === '-1' );
                    setuptools.data.options.feedpower = $(this).val();
                    option_updated('feedfilter');

                });

            }
        },
        {
            class: 'toggleSBFilter',
            name: ( (setuptools.data.options.sbfilter === true) ? 'Disable' : 'Show Only' ) + ' Soulbound',
            callback: setuptools.app.muledump.toggleoption,
            callbackArg: 'sbfilter'
        },
        {
            class: 'toggleNonSBFilter',
            name: ( (setuptools.data.options.nonsbfilter === true) ? 'Disable' : 'Show Only' ) + ' Tradeable',
            callback: setuptools.app.muledump.toggleoption,
            callbackArg: 'nonsbfilter'
        },
        {
            class: 'toggleUTFilter',
            name: ( (setuptools.data.options.utfilter === true) ? 'Disable' : 'Show Only' ) + ' Untiered',
            callback: setuptools.app.muledump.toggleoption,
            callbackArg: 'utfilter'
        },
        {
            class: 'toggleSTFilter',
            name: ( (setuptools.data.options.stfilter === true) ? 'Disable' : 'Show Only' ) + ' Set Items',
            callback: setuptools.app.muledump.toggleoption,
            callbackArg: 'stfilter'
        });

    }

    setuptools.lightbox.menu.context.create('totalsmenu', false, track, options);

};

/**
 * @function
 * @param {object} options
 * @param types
 */
setuptools.app.muledump.totals.menu.populateByType = function(options, types) {

    if ( typeof types === 'string' ) types = [types];
    if ( Array.isArray(types) === false ) return;

    for ( var a = 0; a < types.length; a++ ) {

        var type = types[a];
        var filterName = 'totalsFilter-' + type;
        var displayName = setuptools.app.muledump.itemSlotTypeName(type);
        if ( typeof displayName === 'undefined' ) continue;
        options.push({
            class: 'toggle-' + filterName,
            name: ( (setuptools.data.options[filterName] === true) ? 'Hide' : 'Show' ) + ' ' + displayName,
            callback: setuptools.app.muledump.toggleoption,
            callbackArg: filterName
        });

    }

};

//  returns the specified key from a configSet
setuptools.app.muledump.totals.config.getKey = function(key, configSet, defaultValue) {

    if ( !configSet || configSet === false ) configSet = setuptools.data.muledump.totals.configSets.active;
    if ( typeof setuptools.data.muledump.totals.configSets.settings[configSet] !== 'object' ) return;
    if ( typeof setuptools.data.muledump.totals.configSets.settings[configSet][key] === 'undefined' ) {
        if ( defaultValue === null ) return;
        if ( !defaultValue ) defaultValue = ( Array.isArray(setuptools.config.totalsKeyObjects[key]) === true ) ?
            $.extend(true, [], setuptools.config.totalsKeyObjects[key]) :
            $.extend(true, {}, setuptools.config.totalsKeyObjects[key]);
        this.setKey(key, defaultValue, configSet);
        return defaultValue;
    }
    return setuptools.data.muledump.totals.configSets.settings[configSet][key];

};

//  returns the specified key from a configSet
setuptools.app.muledump.totals.config.setKey = function(key, value, configSet) {

    if ( typeof key !== 'string' || !value ) return;
    if ( !configSet ) configSet = setuptools.data.muledump.totals.configSets.active;
    if ( typeof setuptools.data.muledump.totals.configSets.settings[configSet] !== 'object' ) return;
    setuptools.data.muledump.totals.configSets.settings[configSet][key] = value;
    setuptools.data.options[key] = setuptools.data.muledump.totals.configSets.settings[configSet][key];

};

//  returns whether or not the specified configSet exists
setuptools.app.muledump.totals.config.exists = function(configSet) {

    if ( !configSet || configSet === 'active' ) configSet = setuptools.data.muledump.totals.configSets.active;
    if ( typeof configSet !== 'string' ) return;
    return ( typeof setuptools.data.muledump.totals.configSets.settings[configSet] === 'object' );

};

/**
 * @function
 * @param configSet
 * Reinitializes a configSet (or multiple) for when the slotMap changes or items get added or removed
 */
setuptools.app.muledump.totals.config.reinit = function(configSet) {

    if ( configSet === 'all' ) configSet = Object.keys(setuptools.data.muledump.totals.configSets.settings);
    if ( configSet === 'active' ) configSet = [setuptools.data.muledump.totals.configSets.active];
    if ( typeof configSet === 'string' ) configSet = [configSet];
    if ( Array.isArray(configSet) === false || configSet.length === 0 ) return;

    setuptools.app.techlog('Totals/ConfigSet reinit executing');

    //  configSet cleanup
    configSet.filter(function(configSet) {

        var slotSubOrder = setuptools.app.muledump.totals.config.getKey('slotSubOrder', configSet);
        Object.filter(slotSubOrder, function(vst, items) {

            //  loop through slotOrder groups and make list of items that do not belong
            var deleteItems = [];
            items.filter(function(item) {

                var itemid = +item;
                if (
                    typeof window.items[itemid] === 'undefined' ||
                    (
                        window.items[itemid][setuptools.config.vstIndex] !== (+vst) &&
                        window.items[itemid][1] !== (+vst)
                    )
                ) {
                    deleteItems.push(item);
                }

            });

            //  delete the found items
            for ( var i = 0; i < deleteItems.length; i++ ) {
                slotSubOrder[vst].splice(slotSubOrder[vst].indexOf(deleteItems[i]), 1);
                setuptools.app.techlog('Totals/ConfigSet reinit deleting: [set: ' + configSet + ', vst: ' + vst + ', itemid: ' + deleteItems[i] + ']');
            }

            //  loop through window.items and insert items that do belong
            Object.filter(window.items, function(itemid, item) {
                itemid = itemid.toString();
                if ( (!(item[setuptools.config.vstIndex] !== (+vst) && item[1] !== (+vst))) && slotSubOrder[vst].indexOf(itemid) === -1 ) {
                    slotSubOrder[vst].push(itemid);
                    setuptools.app.techlog('Totals/ConfigSet reinit adding: [set: ' + configSet + ', vst: ' + vst + ', itemid: ' + itemid + ']');
                }
            });

        });

    });

};

//  delete a specific configSet
setuptools.app.muledump.totals.config.delete = function(configSet) {

    if ( configSet === 'all' ) configSet = Object.keys(setuptools.data.muledump.totals.configSets.settings);
    if ( configSet === 'active' ) configSet = [setuptools.data.muledump.totals.configSets.active];
    if ( typeof configSet === 'string' ) configSet = [configSet];
    if ( Array.isArray(configSet) === false || configSet.length === 0 ) return;

    //  delete specified configSets
    configSet.filter(function(configSet) {
        if (
            setuptools.app.muledump.totals.config.exists(configSet) === false ||
            configSet === 'Default'
        ) return;

        //  delete configSet
        delete setuptools.data.muledump.totals.configSets.settings[configSet];

        //  remove from favorites
        if ( setuptools.data.muledump.totals.configSets.favorites.indexOf(configSet) > -1 ) setuptools.data.muledump.totals.configSets.favorites.splice(
            setuptools.data.muledump.totals.configSets.favorites.indexOf(configSet),
            1
        );
    });

    //  reset default configuration
    if ( configSet.length === 1 && configSet[0] === 'Default' ) setuptools.data.muledump.totals.configSets.settings[configSet[0]] = $.extend(true, {}, setuptools.copy.totals.defaultConfig);
    if ( configSet.indexOf(setuptools.data.muledump.totals.configSets.active) > -1 ) setuptools.app.muledump.totals.config.activate('Default');

    return true;

};

/**
 * @function
 * @param {boolean} state
 */
setuptools.app.muledump.totals.config.toggleAllTypes = function(state) {

    if ( typeof state === 'undefined' ) return false;
    setuptools.app.muledump.totals.config.getTypes().filter(function(type) {
        setuptools.app.muledump.toggleoption('totalsFilter-' + type, state, true);
    });
    window.update_totals();
    window.update_filter();
    option_updated('totals');
    return true;

};

//  store a temporary backup of all configSets
setuptools.app.muledump.totals.config.backup = function(name) {

    if ( typeof setuptools.copy.totals.configSets === 'undefined' ) {
        setuptools.copy.totals.configSets = $.extend(true, {}, setuptools.data.muledump.totals.configSets);
        return;
    }

    //  only copy configSets not present
    var configSets = [];
    if ( typeof name === 'string' ) configSets = [name];
    if ( configSets.length === 0 ) configSets = setuptools.data.muledump.totals.configSets.settings;
    for ( var configSet in configSets )
        if ( configSets.hasOwnProperty(configSet) )
            if ( typeof setuptools.copy.totals.configSets[configSet] === 'undefined' )
                setuptools.copy.totals.configSets[configSet] = $.extend(true, {}, configSets[configSet]);

};



//  create a totals configuration set
setuptools.app.muledump.totals.config.save = function(name, immediate) {

    if ( typeof name === 'undefined' || name === 'active') name = setuptools.data.muledump.totals.configSets.active;
    if ( typeof name !== 'string' ) return;
    var accountFilter = $.extend(true, [], setuptools.app.muledump.totals.config.getKey('accountFilter'));
    var slotOrder = $.extend(true, [], setuptools.app.muledump.totals.config.getKey('slotOrder'));
    var itemFilter = $.extend(true, [], setuptools.app.muledump.totals.config.getKey('itemFilter'));
    var slotSubOrder = $.extend(true, {}, setuptools.app.muledump.totals.config.getKey('slotSubOrder'));
    var disabled = $.extend(true, [], setuptools.app.muledump.totals.config.getKey('disabled'));
    var sortingMode = setuptools.app.muledump.totals.config.getKey('sortingMode');
    if ( setuptools.data.muledump.totals.configSets.settings[name] !== 'object' ) setuptools.data.muledump.totals.configSets.settings[name] = {};
    setuptools.config.totalsSaveKeys.filter(function(item) {
        setuptools.data.muledump.totals.configSets.settings[name][item] = setuptools.data.options[item];
    });
    var origName = setuptools.data.muledump.totals.configSets.active;
    setuptools.data.muledump.totals.configSets.active = name;
    setuptools.app.muledump.totals.config.setKey('accountFilter', accountFilter);
    setuptools.app.muledump.totals.config.setKey('slotOrder', slotOrder);
    setuptools.app.muledump.totals.config.setKey('itemFilter', itemFilter);
    setuptools.app.muledump.totals.config.setKey('slotSubOrder', slotSubOrder);
    setuptools.app.muledump.totals.config.setKey('sortingMode', sortingMode);
    setuptools.app.muledump.totals.config.setKey('disabled', disabled);
    setuptools.app.config.save('Totals config set saved', (immediate !== true));
    setuptools.copy.totals.configSets.settings[name] = $.extend(true, {}, setuptools.data.muledump.totals.configSets.settings[name]);
    if ( name !== origName ) setuptools.app.muledump.totals.config.reset(origName);
    window.options_save();
    setuptools.app.muledump.totals.config.backup(name);

};

/**
 * @function
 * @param {string} [name]
 * Resets the specified configSet to its previous save state without changing the UI
 */
setuptools.app.muledump.totals.config.reset = function(name) {

    if ( typeof name === 'undefined' || name === 'active' ) name = setuptools.data.muledump.totals.configSets.active || 'Default';
    if ( typeof name !== 'string' ) return;
    if ( typeof setuptools.data.muledump.totals.configSets.settings[name] !== 'object' ) return;
    setuptools.data.muledump.totals.configSets.settings[name] = $.extend(true, {}, setuptools.copy.totals.configSets && setuptools.copy.totals.configSets.settings[name] || setuptools.copy.totals.defaultConfig);

};

/**
 * @function
 * @param {string} [name]
 * @param {boolean} [reset]
 * @param {boolean} [skipSave]
 * Activate a totals configSet and optionally reset its state
 */
setuptools.app.muledump.totals.config.activate = function(name, reset, skipSave) {

    if ( typeof name === 'boolean' ) {
        reset = name;
        name = undefined;
    }

    if ( typeof name === 'undefined' || name === 'active' ) name = setuptools.data.muledump.totals.configSets.active || 'Default';
    if ( typeof name !== 'string' ) return;
    if ( typeof setuptools.data.muledump.totals.configSets.settings[name] !== 'object' ) return;

    //  reset from original configuration
    if ( reset === true ) setuptools.app.muledump.totals.config.reset(name);

    //  reset keys for default profile
    if ( name === 'Default' ) {
        setuptools.data.muledump.totals.configSets.settings[name] = $.extend(true, {}, setuptools.copy.totals.defaultConfig);
        setuptools.data.muledump.totals.configSets.settings[name].sortingMode = setuptools.copy.totals.defaultConfig.sortingMode;
    }

    //  reset keys
    Object.filter(setuptools.data.muledump.totals.configSets.settings[name], function(key) {
        setuptools.data.options[key] = setuptools.data.muledump.totals.configSets.settings[name][key];
    });

    setuptools.data.muledump.totals.configSets.active = name;
    if ( skipSave !== true ) setuptools.app.config.save('Totals config set activated');
    if ( setuptools.tmp.globalTotalsCounter instanceof Muledump_TotalsCounter ) setuptools.tmp.globalTotalsCounter.import();
    setuptools.app.muledump.totals.updateSecondaryFilter();
    window.init_totals();
    window.update_totals();
    window.update_filter();

};

//  return a list of item types
setuptools.app.muledump.totals.config.getTypes = function() {

    var types = [];
    Object.filter(window.itemsSlotTypeMap, function(type) {
        if ( types.indexOf(type) === -1 ) types.push(type);
    });
    return types;

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
 * @param vst
 */
setuptools.app.muledump.itemsByVst = function(vst) {

    if ( typeof vst === 'string' ) vst = setuptools.app.muledump.itemSlotTypeVst(vst);
    if ( typeof vst !== 'number' ) return [];
    var itemList = [];
    Object.filter(window.items, function(itemid, item) {
        if (
            item[setuptools.config.vstIndex] === vst &&
            !(item[3] === 40 && item[4] === 0) &&
            setuptools.config.disqualifiedItemIds.indexOf(+itemid) === -1
        ) itemList.push(itemid);
    });
    return itemList;

};

/**
 * @function
 * @param {string} name
 */
setuptools.app.muledump.itemSlotTypeVst = function(name) {

    if ( typeof window.itemsSlotTypeMap[name] === 'undefined' ) return;
    return window.itemsSlotTypeMap[name].virtualSlotType || window.itemsSlotTypeMap[name].slotType;

};

//  determine the display name of a provided type name, slotType, or virtualSlotType
setuptools.app.muledump.itemSlotTypeName = function(vst) {

    var type = Object.filter(window.itemsSlotTypeMap, undefined, function(type, data) {
        if ( vst === type || data.virtualSlotType === vst || data.slotType === vst ) return data.displayName || type[0].toUpperCase()+type.substr(1);
    });
    return type[Object.keys(type)[0]];

};

//  map item SlotType to a virtual id for
setuptools.app.muledump.itemsSlotTypeMapper = function(type) {

    if ( typeof Number(type) === 'number' ) var itemid = Number(type);

    //  mapConfig identifier keys and their corresponding index in constants
    var mapKeys = {
        name: 0,
        slotType: 1,
        tier: 2,
        fameBonus: 5,
        feedPower: 6,
        bagType: 7,
        soulbound: 8,
        utst: 9
    };

    var mapConfig = window.itemsSlotTypeMap;
    var itemList = items;
    if ( typeof itemid === 'number' ) {

        itemList = {};
        itemList[itemid] = window.items[itemid];

    }

    var filteredItems = Object.filter(itemList, undefined, function(itemid, item) {

        if ( typeof item === 'undefined' ) return;

        var slotType = item[1];
        var virtualSlotType;
        var configKeys = Object.keys(Object.filter(mapConfig, function(type, data) {
            if ( data.slotType === slotType ) {
                if ( typeof data.sheet === 'undefined' ) data.sheet = setuptools.config.totalsDefaultIcon;
                return true;
            }
        }));

        for ( var x = 0; x < configKeys.length; x++ ) {

            var configKey = configKeys[x];

            if ( typeof mapConfig[configKey] === 'undefined' ) {
                setuptools.app.techlog('SlotTypeMapper encountered unknown slotType - ' + JSON.stringify(configKey));
                continue;
            }

            virtualSlotType = undefined;
            var matches = 0;
            var required = Object.keys(mapConfig[configKey]).length;
            for (var key in mapConfig[configKey]) {

                if (mapConfig[configKey].hasOwnProperty(key)) {

                    //  reserved properties; not checked against
                    if ( ['displayName', 'sheet'].indexOf(key) > -1 ) {
                        matches++;
                        continue;
                    }

                    if ( key === 'slotType' && typeof virtualSlotType !== 'string' ) virtualSlotType = mapConfig[configKey].virtualSlotType;

                    if ( key === 'virtualSlotType' ) {
                        virtualSlotType = mapConfig[configKey].virtualSlotType;
                        matches++;
                        continue;
                    }

                    //  values must match
                    if (
                        ['number', 'boolean'].indexOf(typeof mapConfig[configKey][key]) > -1 &&
                        mapConfig[configKey][key] !== item[mapKeys[key]]
                    ) continue;

                    //  try and include items but not require them to match (like name key)
                    if ( key === 'include' ) {

                        if (
                            mapConfig[configKey][key] instanceof RegExp &&
                            item[mapKeys.name].match(mapConfig[configKey][key])
                        ) {
                            matches = required;
                        } else {
                            required--;
                        }
                        continue;
                    }

                    //  some groups have multiple values for one key (I'm looking at you potions)
                    if (
                        Array.isArray(mapConfig[configKey][key]) === true &&
                        mapConfig[configKey][key].indexOf(item[mapKeys[key]]) === -1
                    ) continue;

                    if (
                        mapConfig[configKey][key] instanceof RegExp &&
                        !item[mapKeys[key]].match(mapConfig[configKey][key])
                    ) continue;

                    //  support multiple gt/gte/lt/lte operations
                    if (
                        Array.isArray(mapConfig[configKey][key]) === false &&
                        !(mapConfig[configKey][key] instanceof RegExp) &&
                        typeof mapConfig[configKey][key] === 'object'
                    ) {

                        var foundCommands = 0;
                        var matchedCommands = 0;
                        for ( var command in mapConfig[configKey][key] ) {

                            if ( mapConfig[configKey][key].hasOwnProperty(command) ) {

                                foundCommands++;
                                var value = mapConfig[configKey][key][command];
                                if (
                                    (command === 'gte' && item[mapKeys[key]] >= value) ||
                                    (command === 'gt' && item[mapKeys[key]] > value) ||
                                    (command === 'lte' && item[mapKeys[key]] <= value) ||
                                    (command === 'lt' && item[mapKeys[key]] < value)
                                ) matchedCommands++;

                            }

                        }

                        if ( foundCommands !== matchedCommands ) continue;

                    }

                    matches++;

                }

            }

            if ( matches >= required ) return virtualSlotType || slotType;

        }

    });

    var filteredValues = Object.values(filteredItems);
    if ( typeof itemid === 'number' && filteredValues.length === 0 ) return 50000;
    if ( filteredValues.length === 1 ) return filteredValues[0];
    return filteredItems;

};

/**
 * @function
 */
setuptools.app.muledump.totals.updateSecondaryFilter = function() {

    //  reset accountFilter and disabled filter on mules
    for ( var guid in mules ) {
        if (mules.hasOwnProperty(guid)) {

            //  accountFilter
            if ( setuptools.app.muledump.totals.config.getKey('accountFilter').indexOf(guid) === -1 ) {
                mules[guid].dom.removeClass('filteringEnabled');
            } else {
                mules[guid].dom.addClass('filteringEnabled');
            }

            //  disabled filter
            mules[guid].disabled = ( setuptools.app.muledump.totals.config.getKey('disabled').indexOf(guid) > -1 );
            mules[guid].dom.toggleClass('disabled', mules[guid].disabled);
            if ( mules[guid].disabled === true ) {
                setuptools.tmp.globalTotalsCounter.import(mules[guid].totals, true);
            } else {

                //  we'll only run this if it'll pass mode 0
                if (
                    typeof setuptools.tmp.globalTotalsCounter.sourceData[guid] !== 'object' ||
                    new SeaSalt_Hashing(JSON.stringify(setuptools.tmp.globalTotalsCounter.sourceData[guid].meta), 'sha256', 'hex').toString() !== new SeaSalt_Hashing(JSON.stringify(mules[guid].totals.data.meta), 'sha256', 'hex').toString()
                ) setuptools.tmp.globalTotalsCounter.import(mules[guid].totals);

            }

        }
    }

    //  insert generated totals save keys if they aren't already there
    //  note: doing this by key count is probably not as good a choice as doing it by key validation.
    //        this would be the place to add/remove key changes.
    if ( setuptools.config.totalsSaveKeys.length <= setuptools.config.totalsFilterKeysIndex ) {
        Object.keys(window.itemsSlotTypeMap).filter(function(element) {
            setuptools.config.totalsSaveKeys.push('totalsFilter-' + element);
        });
        setuptools.app.muledump.totals.config.activate(true);
    }

    //  populate any missing filter keys in options
    for ( var h = 0; h < setuptools.config.totalsSaveKeys.length; h++ )
        if ( typeof setuptools.data.options[setuptools.config.totalsSaveKeys[h]] === 'undefined' )
            setuptools.data.options[setuptools.config.totalsSaveKeys[h]] = true;

    //  generate the secondary item filter
    setuptools.tmp.totalsSecondaryFilter = [];
    for ( var i = setuptools.config.totalsFilterKeysIndex; i < setuptools.config.totalsSaveKeys.length; i++ ) {

        var key = setuptools.config.totalsSaveKeys[i];
        var type = (key.match(/^.*?-([a-z0-9]*)$/i))[1];
        var vstList = setuptools.app.muledump.itemSlotTypeVst(type);
        if ( typeof vstList !== 'number' ) vstList = [50000];
        if ( typeof vstList === 'number' ) vstList = [vstList];

        //  rather than build this every call, let's cache the object given it is static anyway
        if ( typeof setuptools.tmp.totalsRuntimeCache === 'undefined') setuptools.tmp.totalsRuntimeCache = {};
        if ( typeof setuptools.tmp.totalsRuntimeCache[type] === 'undefined' ) setuptools.tmp.totalsRuntimeCache[type] = [];

        Object.filter(
            window.items,
            function(itemid, item) {
                for ( var i = 0; i < vstList.length; i++ )
                    if ( item[setuptools.config.vstIndex] === vstList[i] ) setuptools.tmp.totalsRuntimeCache[type].push(Number(itemid));
            }
        );

        //  process the item list
        var itemList = setuptools.tmp.totalsRuntimeCache[type];
        var j;
        if ( setuptools.data.options[key] === true ) {

            for ( j = 0; j < itemList.length; j++ )
                if ( setuptools.tmp.totalsSecondaryFilter.indexOf(itemList[j]) > -1 )
                    setuptools.tmp.totalsSecondaryFilter.splice(setuptools.tmp.totalsSecondaryFilter.indexOf(itemList[j]), 1);

        } else {

            for ( j = 0; j < itemList.length; j++ )
                if ( setuptools.tmp.totalsSecondaryFilter.indexOf(itemList[j]) === -1 )
                    setuptools.tmp.totalsSecondaryFilter.push(itemList[j]);

        }

    }

};

/**
 * @function
 * @param {number} itemid
 */
setuptools.app.muledump.totals.toggleHideItem = function(itemid) {

    itemid = Number(itemid);
    var index = setuptools.app.muledump.totals.config.getKey('itemFilter').indexOf(itemid);
    if ( index === -1 ) {
        setuptools.app.muledump.totals.config.getKey('itemFilter').push(itemid);
    } else setuptools.app.muledump.totals.config.getKey('itemFilter').splice(index, 1);
    setuptools.app.muledump.totals.config.setKey('itemFilter', setuptools.app.muledump.totals.config.getKey('itemFilter'));
    window.update_totals();
    window.update_filter();
    option_updated('totals');

};

/**
 * @function
 * @param {string} option
 * @param {boolean} [value]
 * @param {boolean} [skip]
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
 * @param {string} option
 */
/*
setuptools.app.muledump.optionIsAlias = function(option) {

    //  check for evidence it isn't an alias
    if ( typeof option !== 'string' || option.length === 0 ) return;
    if ( typeof window.itemsSlotTypeMap[option] !== 'object' ) return;
    if ( Array.isArray(window.itemsSlotTypeMap[option].virtualSlotType) === false ) return false;

    //  try and find the specified config data
    var keyNames = [];
    var vsts = window.itemsSlotTypeMap[option].virtualSlotType;

    //  filter each found virtualSlotID and match it to real item groups
    vsts.filter(function(vst) {
        Object.filter(itemsSlotTypeMap, function(name, config) {
            if (
                (typeof (config.virtualSlotType||config.slotType) === 'number') &&
                ((config.virtualSlotType||config.slotType) === vst) &&
                keyNames.indexOf(name) === -1
            ) keyNames.push(name);
        });
    });

    //  return the results
    if ( keyNames.length === 0 ) return;
    return keyNames;

};
*/

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

//  display the account mule menu
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
    if (
        setuptools.app.config.determineFormat(setuptools.data.accounts, 0) === true ||
        (setuptools.state.loaded === true && setuptools.data.accounts.accounts[guid].loginOnly === false )
    ) options.push(
        {
            class: 'chsort',
            name: 'Edit Character Sorting Lists',
            callback: function(guid) {
                setuptools.app.muledump.chsortcustom(mules[guid]);
            },
            callbackArg: guid
        }
    );

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

    options.push({
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
            class: 'ssEntireMule',
            name: 'Entire Mule',
            callback: function(guid) {
                setuptools.app.muledump.canvas($(mules[guid].dom)[0]);
            },
            callbackArg: guid
        }
    ];

    if ( mules[guid].opt('accountinfo') ) options.push({
        class: 'ssAccountInfo',
        name: 'Account Info',
        callback: function(guid) {
            setuptools.app.muledump.canvas($(mules[guid].dom.find('div.stats'))[0]);
        },
        callbackArg: guid
    });

    if ( $(mules[guid].dom.find('table.chars'))[0] !== undefined ) options.push(
        {
            class: 'ssCharTable',
            name: 'Character Table',
            callback: function(guid) {
                setuptools.app.muledump.canvas($(mules[guid].dom.find('table.chars'))[0]);
            },
            callbackArg: guid
    });

    if ( mules[guid].opt('vaults') ) options.push({
        class: 'ssVaults',
        name: 'Vault Table',
        callback: function(guid) {
            setuptools.app.muledump.canvas($(mules[guid].dom.find('table.vaults'))[0]);
        },
        callbackArg: guid
    });

    if ( mules[guid].opt('gifts') ) options.push({
        class: 'ssGifts',
        name: 'Gift Table',
        callback: function(guid) {
            setuptools.app.muledump.canvas($(mules[guid].dom.find('table.gifts'))[0]);
        },
        callbackArg: guid
    });

    setuptools.lightbox.menu.context.create('mulemenu-screenshot', true, position, options);

};

//  generate the account copy menu
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

//  perform the lookup and search action
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

setuptools.app.muledump.quickUserAdd = function() {

};

//  automatically adjust totals width
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

//  generate a one click login url
setuptools.app.muledump.mulelink = function(guid) {

    //  does not support guid's or testing
    if (
        guid.match(setuptools.config.regex.guid) !== null ||
        (setuptools.state.loaded === true && setuptools.data.accounts.accounts[guid].testing === true)
    ) return;

    //  return the link
    return 'muledump:' + sodium.to_hex(guid) + '-' + sodium.to_hex(window.accounts[guid]);

};

/*setuptools.app.muledump.trackGold = function() {

};*/

/*
//  Realmeye features
*/

setuptools.app.muledump.realmeye.state = {
    selected: []
};

//  generate links to the realmeye wiki for items
setuptools.app.muledump.realmeye.link = function(itemNumber, link, extra) {

    var itemName;

    //  determine itemName
    if ( typeof itemNumber === 'number' || typeof Number(itemNumber) === 'number' ) itemName = items[itemNumber][0];

    //  if we still don't have the item hex yet, let's assume it's the item's exact name
    if ( typeof itemNumber === 'undefined' ) itemName = itemNumber;

    //  determine uri
    if ( link === 'wiki' ) {
        itemName = itemName.toLowerCase().replace(/\s/g, '-');
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

//  react to ctrl+click actions
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

//  update item on selection in realmeye menu
setuptools.app.muledump.realmeye.itemSelection = function(self) {

    var item = $(self);
    if ( item.hasClass('realmeyeBorder') === false ) {
        setuptools.app.muledump.realmeye.state.selected.push(self);
        item.addClass('realmeyeBorder');
    }

};

//  cleanup secondary cache data
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

setuptools.app.muledump.cleanupDataForGuid = function(guid) {

    if ( typeof guid !== 'string' ) return;
    for ( var key in localStorage )
        if ( localStorage.hasOwnProperty(key) )
            if ( key.indexOf(guid) > -1 )
                localStorage.removeItem(key);

};

//  muledump online about page
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

//  muledump local check for updates and display an about page
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

setuptools.app.muledump.whitebag = {};

//  returns a list of all white bag items
setuptools.app.muledump.whitebag.items = function(full) {

    //  pull a list of whitebags from constants
    var whitebags = Object.filter(items, function(key, value) {
        if ( value[7] === 6 ) return true;
    });

    //  if full === true we will send the items and their data
    if ( full === true ) return whitebags;

    //  but typically we'll only need to send the item ids
    return Object.keys(whitebags);

};

setuptools.app.muledump.whitebag.tracker = function(guid) {

    //  it's so big!
    var config = setuptools.data.muledump.whitebagTracker;

    //  generate the base configuration for new accounts
    if ( typeof config.accounts[guid] === 'undefined' ) config.accounts[guid] = $.extend(true, {}, setuptools.objects.whitebagTrackerAccount);

    var displayName;
    if (
        setuptools.state.loaded === true &&
        setuptools.data.config.mqDisplayIgn === true &&
        typeof setuptools.data.accounts.accounts[guid] === 'object' &&
        typeof setuptools.data.accounts.accounts[guid].ign === 'string'
    ) displayName = setuptools.data.accounts.accounts[guid].ign;
    if ( displayName === undefined ) displayName = guid;

    //  build our ui
    var dom = $('#whitebagTracker');
    var html = ' \
        <div class="wbstage"> \
            <div class="header">White Bag Tracker</div> \
            ' + ( (mules[guid].opt('accountName') === true ) ? '<div class="header">' + displayName + '</div>' : '' ) + ' \
            <div class="items"></div> \
        </div> \
    ';

    //  display our ui
    dom.empty().append(html);

    //  populate the items
    var itemsDom = dom.find('div.items');
    var whitebags = {};
    (setuptools.app.muledump.whitebag.items()).filter(function(item) {
        whitebags[item] = 0;
    });
    whitebags = $.extend(true, whitebags, config.accounts[guid].items);
    Object.filter(whitebags, function(key) {
        var itemDom = window.item(key, 'wb', (config.accounts[guid].items[key] || 0));
        itemDom.appendTo(itemsDom);
    });


};
