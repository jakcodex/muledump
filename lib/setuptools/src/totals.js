/*
//  Totals
*/

/**
 * @function
 * @param {jQuery} [track]
 * @param {string} [page]
 * Display the advanced totals menu
 */
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

/**
 * @function
 * @param {jQuery} [track]
 * @param {string} [page]
 * Display the item types totals menu
 * Presently not used (keeping the menu short)
 */
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

/**
 * @function
 * Display a menu for managing totals-related settings
 */
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
                <div class="setuptools link favorite noclose menuStyle checkbox bright flex-container ' + favClass + '" title="' + favTitle + '" style="background-color: initial; width: 26px; height: 26px"><span style="margin-top: -2px;">&#9733;</span></div>\
                <div class="setuptools link activateSet noclose menuStyle bright menuTiny textCenter flex-container" style="width: 93px; height: 26px;">Save</div> \
                <div class="setuptools link reset noclose menuStyle menuTiny bright textCenter flex-container" style="width: 93px; height: 26px;">Reset</div> \
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
                <div class="setuptools link saveNewSet noclose menuStyle bright menuTiny textCenter flex-container" style="width: 124px; height: 26px;">Create</div>  \
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

    if (
        setuptools.state.loaded === true &&
        setuptools.app.muledump.totals.config.getKey('accountFilter').length > 0
    ) setuptools.lightbox.build('totalsmenu-settings', '\
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
            if ( item === undefined ) {

                var data = setuptools.app.muledump.totals.config.getKey('itemFilter');
                data.splice(data.indexOf(+itemid), 1);
                setuptools.app.muledump.totals.config.setKey('itemFilter', data);
                setuptools.app.techlog('Totals/itemFilter removing: ' + itemid);

            } else setuptools.lightbox.build('totalsmenu-settings', '<div class="item noselect" data-itemId="' + itemid + '" style="background-position: -' + item[3] + 'px -' + item[4] + 'px;"></div>');

        });

    }

    setuptools.lightbox.build('totalsmenu-settings', '</div>\
    ');

    if ( setuptools.app.muledump.totals.config.getKey('itemFilter').length > 0 ) setuptools.lightbox.build('totalsmenu-settings', ' \
        <div class="flex-container unknownItems expansion" title="Expand">&#9898;&#9898;&#9898;</div>\
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
            if ( setuptools.app.muledump.totals.config.getKey('sortingMode') === 'items' ) window.init_totals();
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
            if ( setuptools.app.muledump.keys('shift', e) === false ) return;
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
            setuptools.lightbox.display('totalsmenu-itemSorting', {variant: 'fl-Totals nobackground'});

            //  provide a hidden item filter integration
            $('#itemSubsortingBox > div.item').on('click.muledump.itemFilter', function(e) {

                if ( e.target !== this || setuptools.app.muledump.keys('shift', e) === false || !$(this).attr('data-itemid') ) return;
                setuptools.app.muledump.totals.toggleHideItem($(this).attr('data-itemid'));
                $(this).toggleClass('selected');

            });

            //  bind the tooltip
            var itemsSelected = $('div#itemSubsortingBox div.item');
            if ( setuptools.data.config.tooltipItems > -1 ) setuptools.app.muledump.tooltip(itemsSelected, 'itemSubsortingTooltip');

            //  item dragging
            setuptools.tmp.itemSubsortDragging = new Muledump_Dragging({
                target: ['item', 'subsorting', 'cell'],
                targetattr: 'data-itemId',
                approach: 0.1,
                activeclass: 'dragging bright',
                callbacks: {
                    during_drag: function(parent, self) {

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
                    after_drag: function(parent, self) {

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
            during_drag: function(parent, self) {

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
            after_drag: function(parent, self) {

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

        if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('totals-favorite') > -1 ) return;
        if ( $(this).hasClass('disabled') === true ) return;
        var name = $(this).parent().prev().find('select[name="totalsConfigSets"]').val();
        if ( name === 'Default' ) {
            setuptools.lightbox.status(this, 'No!', 'totals-favorite');
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
        if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('totals-reset') > -1 ) return;
        if ( $(this).hasClass('disabled') === true ) return;
        setuptools.app.muledump.totals.config.activate(undefined, true, true);
        setuptools.lightbox.close();
        setuptools.app.muledump.totals.menu.settings();
        setuptools.lightbox.status($('.setuptools.link.reset'), 'Active reset!', 'totals-reset');
    });

    //  switch active configuration
    $('.setuptools.link.activateSet')
        .off('click.muledump.totals.activateSet')
        .on('click.muledump.totals.activateSet', function() {

            if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('totals-activate') > -1 ) return;
            if ( $(this).hasClass('disabled') === true ) return;
            var name = $('select[name="totalsConfigSets"]').val();
            if ( typeof setuptools.data.muledump.totals.configSets.settings[name] !== 'object' ) return;
            if ( $(this).text() === 'Save' ) {

                setuptools.app.muledump.totals.config.save(name, true);
                setuptools.lightbox.status($(this), 'Saved!', 'totals-activate');

                window.init_totals();
                window.update_totals();

                return;

            }

            if ( currentSet !== name ) setuptools.app.muledump.totals.config.reset(currentSet);
            currentSet = name;
            setuptools.app.muledump.totals.config.activate(name);
            setuptools.app.muledump.totals.menu.settings();
            setuptools.lightbox.status($('.setuptools.link.activateSet'), "Enabled!", 'totals-activate');

        });

    //  delete a configuration set
    $('.setuptools.link.deleteSet').on('click.muledump.totals.deleteSet', function() {

        if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('totals-delete') > -1 ) {
            console.log('no');
            return;
        }
        if ( $(this).hasClass('disabled') === true ) return;
        var name = $('select[name="totalsConfigSets"]').val();
        if ( name === 'Default' ) {
            setuptools.lightbox.status(this, 'No!', 'totals-delete');
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

        if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('totals-create') > -1 ) return;
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
            }, 'totals-create');
            return;

        }

        //  name must be unique
        if ( typeof setuptools.data.muledump.totals.configSets[name] === 'object' ) {

            $(this).removeClass('positive').addClass('negative');
            setuptools.lightbox.status(this, 'Name already exists', function(self) {
                self.removeClass('negative').addClass('positive');
            }, 'totals-create');
            return;

        }

        var origName = setuptools.data.muledump.totals.configSets.active;

        //  create the configuration
        setuptools.app.muledump.totals.config.save(name);
        setuptools.app.muledump.totals.menu.settings();
        setuptools.lightbox.status($('.setuptools.link.saveNewSet'), 'Created!', 'totals-create');

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
    if ( setuptools.data.config.tooltipItems > -1 ) setuptools.app.muledump.tooltip(itemsSelected, 'hiddenItemsTooltip');
    itemsSelected.off('click.muledump.totals.hiddenItems').on('click.muledump.totals.hiddenItems', function(e) {
        if ( setuptools.app.muledump.keys('shift', e) === true ) {

            var itemId = +$(this).attr('data-itemid');
            setuptools.app.muledump.totals.config.getKey('itemFilter').splice(setuptools.app.muledump.totals.config.getKey('itemFilter').indexOf(itemId), 1);
            setuptools.app.muledump.totals.config.setKey('itemFilter', setuptools.app.muledump.totals.config.getKey('itemFilter'));
            $(this).remove();
            $('.tooltip').remove();

        }
    });

    //  handle account filter list clicks
    $('#accountFilterList div').off('click.muledump.totals.accountFilterList').on('click.muledump.totals.accountFilterList', function(e) {

        if ( setuptools.app.muledump.keys('shift', e) === true ) {

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

/**
 * @function
 * @param {jQuery} [track]
 * Display the totals menu
 */
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
                if ( setuptools.app.muledump.totals.config.getKey('sortingMode') === 'items' ) window.init_totals();
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

                if ( setuptools.app.muledump.totals.config.getKey('sortingMode') === 'items' ) window.init_totals();
                window.update_totals();
                window.update_filter();
                window.options_save();

            },
            callbackArg: 'totalsGlobal'
        });

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
                    fp: 'Feed Power',
                    items: 'Item Count'
                },
                selected: setuptools.app.muledump.totals.config.getKey('sortingMode'),
                binding: function () {

                    $('select.sortingMode').on('change.muledump.totals.sortingMode', function () {

                        var mode = $(this).val();
                        setuptools.app.muledump.totals.config.setKey('sortingMode', mode);
                        setuptools.app.muledump.totals.updateSecondaryFilter();
                        window.init_totals();
                        window.update_totals();
                        setuptools.app.muledump.totals.menu.main();

                    });

                }
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

        if ( Object.keys(favoriteOptions).length > 1 ) options.push({
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
            },
            {
                class: 'toggleWBFilter',
                name: ( (setuptools.data.options.wbfilter === true) ? 'Disable' : 'Show Only' ) + ' White Bags',
                callback: setuptools.app.muledump.toggleoption,
                callbackArg: 'wbfilter'
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

/**
 * @function
 * @param {string} key
 * @param {string} [configSet]
 * @param {*} [defaultValue]
 * @returns {*}
 * Returns the specified key from a configSet
 */
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

/**
 * @function
 * @param {string} key
 * @param {*} value
 * @param {string} [configSet]
 * Returns the specified key from a configSet
 */
setuptools.app.muledump.totals.config.setKey = function(key, value, configSet) {

    if ( typeof key !== 'string' || !value ) return;
    if ( !configSet ) configSet = setuptools.data.muledump.totals.configSets.active;
    if ( typeof setuptools.data.muledump.totals.configSets.settings[configSet] !== 'object' ) return;
    setuptools.data.muledump.totals.configSets.settings[configSet][key] = value;
    setuptools.data.options[key] = setuptools.data.muledump.totals.configSets.settings[configSet][key];

};

/**
 * @function
 * @param {string} configSet
 * @returns {boolean}
 * Returns whether or not the specified configSet exists
 */
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

/**
 * @function
 * @param {string} configSet
 * @returns {boolean}
 * Delete a specific configSet
 */
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
    if ( setuptools.app.muledump.totals.config.getKey('sortingMode') === 'items' ) window.init_totals();
    window.update_totals();
    window.update_filter();
    option_updated('totals');
    return true;

};

/**
 * @function
 * @param {string} name
 * Store a temporary backup of all configSets
 */
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

/**
 * @function
 * @param {string} name
 * @param {boolean} [immediate]
 * Create a totals configuration set
 */
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

/**
 * @function
 * @returns {Array}
 * Return a list of item types
 */
setuptools.app.muledump.totals.config.getTypes = function() {

    var types = [];
    Object.filter(window.itemsSlotTypeMap, function(type) {
        if ( types.indexOf(type) === -1 ) types.push(type);
    });
    return types;

};

/**
 * @function
 * @param vst
 * Returns a list of items by virtualSlotType
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
 * Return the virtualSlotType of a named item group
 */
setuptools.app.muledump.itemSlotTypeVst = function(name) {

    if ( typeof window.itemsSlotTypeMap[name] === 'undefined' ) return;
    return window.itemsSlotTypeMap[name].virtualSlotType || window.itemsSlotTypeMap[name].slotType;

};

/**
 * @function
 * @param {number} vst
 * @returns {*}
 * Determine the display name of a provided type name, slotType, or virtualSlotType
 */
setuptools.app.muledump.itemSlotTypeName = function(vst) {

    var type = Object.filter(window.itemsSlotTypeMap, undefined, function(type, data) {
        if ( vst === type || data.virtualSlotType === vst || data.slotType === vst ) return data.displayName || type[0].toUpperCase()+type.substr(1);
    });
    return type[Object.keys(type)[0]];

};

/**
 * @function
 * @param {number} type
 * @returns {*}
 * Map item SlotType to a virtual id format
 */
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
        if ( +itemid === 0 ) return 50001;

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
 * Update all secondary filters for totals processing
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
 * Toggle the item in and out of the itemFilter
 */
setuptools.app.muledump.totals.toggleHideItem = function(itemid) {

    itemid = Number(itemid);
    var index = setuptools.app.muledump.totals.config.getKey('itemFilter').indexOf(itemid);
    if ( index === -1 ) {
        setuptools.app.muledump.totals.config.getKey('itemFilter').push(itemid);
    } else setuptools.app.muledump.totals.config.getKey('itemFilter').splice(index, 1);
    setuptools.app.muledump.totals.config.setKey('itemFilter', setuptools.app.muledump.totals.config.getKey('itemFilter'));
    if ( setuptools.app.muledump.totals.config.getKey('sortingMode') === 'items' ) window.init_totals();
    window.update_totals();
    window.update_filter();
    option_updated('totals');

};
