/**
 * @namespace vaultbuilder
 * @description Contains all Vault Builder tools and uis
 */

/**
 * @function
 * @param {Number} [ttl] - Time in miliseconds to set the new timer for
 * @description Resets the auto-save timer for vault changes
 */
setuptools.app.muledump.vaultbuilder.vaultChangeTimer = function(ttl) {

    $(this).parent().parent().attr('data-valutId', $(this).attr('data-vaultId'));
    if ( ttl !== 0 && typeof ttl !== 'number' ) ttl = 2000;
    if ( setuptools.tmp.vaulteditoridchangetimer ) clearTimeout(setuptools.tmp.vaulteditoridchangetimer);
    setuptools.tmp.vaulteditoridchangetimer = setTimeout(setuptools.app.muledump.vaultbuilder.pushChanges, ttl);

};

/**
 * @function
 * @param {Number | string} [layout] - Layout ID to load
 * @param {string} [guid] - Account to load into Account View
 * @description Draws the vault layout for the vault builder ui
 */
setuptools.app.muledump.vaultbuilder.drawVaultLayout = function(layout, guid) {

    if ( isNaN(+layout) && typeof layout !== 'string' ) layout = setuptools.data.muledump.vaultbuilder.config.layout;
    if ( typeof guid !== 'string' ) guid = setuptools.data.muledump.vaultbuilder.config.guid;
    if ( typeof guid === 'string' ) setuptools.data.muledump.vaultbuilder.config.guid = guid;
    if ( typeof layout === 'string' ) layout = +layout;
    if ( isNaN(+layout) ) layout = setuptools.data.options.vaultlayout;
    if ( guid === 'default' ) guid = undefined;

    setuptools.tmp.vaultbuilderState = {
        data: $.extend(true, {}, setuptools.data.muledump.vaultbuilder.layouts[layout])
    };
    var state = setuptools.tmp.vaultbuilderState;

    var html = '';
    state.data.vaultorder.filter(function(vaultid) {

        var state = 'closed';
        if ( vaultid === 0 ) state = 'blank';
        if (
            typeof guid === 'string' &&
            vaultid > 0 &&
            typeof mules[guid].data.query.results.Chars.Account.Vault === 'object' &&
            Array.isArray(mules[guid].data.query.results.Chars.Account.Vault.Chest) &&
            mules[guid].data.query.results.Chars.Account.Vault.Chest.length >= vaultid ) state = 'opened';

        if (
            typeof guid === 'string' &&
            vaultid === 1 &&
            typeof mules[guid].data.query.results.Chars.Account.Vault === 'object' &&
            typeof mules[guid].data.query.results.Chars.Account.Vault.Chest === 'string' ) state = 'opened';

        if ( typeof guid !== 'string' && vaultid > 0 ) state = 'opened';

        html += '<div class="vault drag ' + state + '" data-vaultId="' + vaultid + '"><span><input name="vaultid" data-originalValue="' + vaultid + '" value="' + vaultid + '"></span></div>';

    });

    $('#vaultbuilder').css({width: (setuptools.data.muledump.vaultbuilder.layouts[layout].vaultwidth * 56)+112});
    $('#vaultbuilder > div.manager')
        .css({width: (setuptools.data.muledump.vaultbuilder.layouts[layout].vaultwidth * 56)})
        .html(html);

    $('div.layoutInfo div.layoutname').text(setuptools.data.muledump.vaultbuilder.layouts[layout].layoutname);
    $('div.layoutInfo div.layout').text(layout);
    $('div.layoutInfo div.width').html(' \
        ' + setuptools.data.muledump.vaultbuilder.layouts[layout].vaultwidth + ' rows wide \
        <br>' + Math.ceil(setuptools.data.muledump.vaultbuilder.layouts[layout].vaultorder.length/setuptools.data.muledump.vaultbuilder.layouts[layout].vaultwidth) + ' rows tall \
    ');
    $('div.setuptools.link.vaultorder > div:last-child').each(function() {
        $(this).text((setuptools.data.muledump.vaultbuilder.layouts[layout][$(this).parent().attr('data-key')] === true) ? 'On' : 'Off');
    });

    //  input interactive bindings
    $('input[name="vaultid"]')
        .off('keyup keydown focus change blur')
        //  validate vaultid input
        .on('keydown.vaultidvalidation', setuptools.app.muledump.vaultbuilder.validateNumericInput)
        //  automatically remove 0 when editing vaultid
        .on('keydown.vaultidmodifier', function(e) {
            if ( $(this).val() === '0' ) $(this).val('');
        })
        //  select input when div is clicked and restore original value on blur if no change
        .on('click.selectinput focus.selectinput', function() {
            if ( $(this).val() === '0' ) $(this).val('');
            $(this).on('blur', function() {
                if ( $(this).val() === '' ) {
                    $(this).val($(this).attr('data-originalValue'));
                    $(this).parent().parent().attr('data-vaultId', $(this).attr('data-originalValue')).removeClass('conflict');
                    if ( $(this).val() !== '0' ) {
                        $(this).parent().parent().addClass('opened').removeClass('blank closed');
                    } else $(this).parent().parent().addClass('blank').removeClass('opened closed');
                }
            });
        })
        //  lazy save changes
        .on('change.updatetimer keyup.updatetimer', setuptools.app.muledump.vaultbuilder.vaultChangeTimer)
        //  force save or reset changes
        .on('blur.updatetimer', function() {
            if ( $(this).val() !== $(this).attr('data-originalValue') && $(this).val() !== '' ) {
                $('div.vault.drag').removeClass('conflict');
                $(this).parent().parent().attr('data-vaultId', $(this).val());
                if ( $(this).val() !== '0' ) {
                    $(this).parent().parent().addClass('opened').removeClass('blank closed');
                } else $(this).parent().parent().addClass('blank').removeClass('opened closed');
                setuptools.app.muledump.vaultbuilder.vaultChangeTimer(0);
            } else clearTimeout(setuptools.tmp.vaulteditoridchangetimer);
            //  blur or reset vaultid
        }).on('keyup.blur', function(e) {
        if ( e.key === 'Escape' ) $(this).blur();
        if ( e.key === 'z' && e.ctrlKey === true ) {
            $(this).val($(this).attr('data-originalValue'));
            $(this).parent().parent().attr('data-vaultId', $(this).attr('data-originalValue')).removeClass('conflict');
            if ( +$(this).val() > 0 ) {
                $(this).parent().parent().removeClass('blank').addClass('opened');
            } else $(this).parent().parent().removeClass('opened closed').addClass('blank');
        }
        if ( e.key === 'Delete' ) {
            $(this).val('0');
            $(this).parent().parent().attr('data-vaultId', 0).removeClass('conflict opened closec').addClass('blank');
        }
    });

    //  div clicks focuses child input
    $('#vaultbuilder > div.manager > div')
        .off('click blur')
        .on('click.selectinput', function() {
            if ( $(this).find('input').val() === '0' ) $(this).find('input').val('');
            $(this).find('input').focus().on('blur', function() {
                if ( $(this).val() === '' ) {
                    $(this)
                        .val($(this).attr('data-originalValue'))
                        .attr('data-vaultId', $(this).attr('data-originalValue'))
                        .removeClass('conflict');
                }
            });
        });

    //  vault swapping
    setuptools.tmp.vaultEditorDragging = new Muledump_Dragging({
        target: ['vault', 'drag'],
        targetattr: 'data-vaultId',
        activeclass: 'bright',
        mode: 'swap',
        callbacks: {
            target: function(parent, self, e, target) {
                if ( $(e.target)[0].localName === 'input' ) target = target.parent().parent();
                if ( $(e.target)[0].localName === 'span' ) target = target.parent();
                return target;
            },
            finish: setuptools.app.muledump.vaultbuilder.pushChanges
        }
    });

};

/**
 * @function
 * @param {string} name - Vault layout to lookup
 * @returns {string | number | Array | undefined} Returns the found layout ID, IDs, or undefined
 * @description Searches for an existing vault layout by the specified name
 */
setuptools.app.muledump.vaultbuilder.findByName = function(name) {

    if ( typeof +name === 'number' ) return +name;
    var result;

    //  seek layouts matching the provided name
    Object.keys(setuptools.data.muledump.vaultbuilder.layouts).filter(function(index) {

        var data = setuptools.data.muledump.vaultbuilder.layouts[index];
        if (
            data.layoutname.match(
                new RegExp(
                    '(' + name + ')',
                    'i'
                )
            ) !== null
        ) {
            if ( Array.isArray(result) ) result.push(+index);
            if ( typeof result === 'string' ) result = [result, +index];
            if ( result === undefined ) result = +index;
        }

    });

    return result;

};

/**
 * @function
 * @returns {number}
 * @description Finds the next vault layout ID number
 */
setuptools.app.muledump.vaultbuilder.findNewId = function() {

    //  find the next id on the array
    var newId = Math.max.apply(null, Object.keys(setuptools.data.muledump.vaultbuilder.layouts))+1;

    //  return it if it meets the minimum requirements or send the smallest allowed id
    return ( newId >= setuptools.config.vaultbuilderMinimumId ) ? newId : setuptools.config.vaultbuilderMinimumId;

};

/**
 * @function
 * @description Updates state of vault layout and check for duplicate vault ids
 */
setuptools.app.muledump.vaultbuilder.pushChanges = function() {

    var siblings = $('div.vault.drag');
    var layout = [];
    var matches = {};
    siblings.each(function(index, element) {
        var vaultid = +$(element).attr('data-vaultId');
        if ( !Array.isArray(matches[vaultid]) ) matches[vaultid] = [];
        matches[vaultid].push(index);
        layout.push(vaultid);
    });

    var dupes = [];
    Object.keys(matches).filter(function(vaultid) {
        if ( vaultid === '0' ) return;
        if ( matches[vaultid].length > 1 ) dupes.push(vaultid);
    });

    siblings.removeClass('conflict');
    if ( dupes.length > 0 ) {

        dupes.filter(function(vaultid) {
            $('div.vault.drag[data-vaultId="' + vaultid + '"]').addClass('conflict');
        });
        return;

    }

    setuptools.tmp.vaultbuilderState.data.vaultorder = layout;

};

/**
 * @function
 * @param {Object} e - Input event object
 * @description Validates that key being typed into an input field is numerical
 */
setuptools.app.muledump.vaultbuilder.validateNumericInput = function(e) {

    if (
        (e.key === 'r' && setuptools.app.muledump.keys('ctrl', e) === true) ||
        (e.key === 'a' && setuptools.app.muledump.keys('ctrl', e) === true) ||
        (e.key === 'x' && setuptools.app.muledump.keys('ctrl', e) === true) ||
        (e.key === 'v' && setuptools.app.muledump.keys('ctrl', e) === true) ||
        (e.key === 'c' && setuptools.app.muledump.keys('ctrl', e) === true)
    ) return;

    if (
        e.key.match(/^([0-9]*?)$/) === null &&
        e.key.match(/^(Backspace|Tab|Enter|Shift|Control|Escape|Delete)$/i) === null
    ) e.preventDefault();

};

/**
 * @function
 * @param {Number | string} [layout] - Layout ID to load into editor
 * @param {string} [guid] - Account to load into account view
 * @description Displays the vault builder UI
 */
setuptools.app.muledump.vaultbuilder.ui = function(layout, guid) {

    setuptools.lightbox.close();
    if ( isNaN(+layout) && typeof layout !== 'string' ) layout = setuptools.data.muledump.vaultbuilder.config.layout;
    if ( typeof setuptools.data.muledump.vaultbuilder.layouts[layout] !== 'object' ) layout = setuptools.data.options.vaultlayout;
    if ( typeof layout === 'string' ) layout = +layout;
    if ( isNaN(+layout) ) layout = setuptools.data.options.vaultlayout;
    if ( !isNaN(+layout) ) setuptools.data.muledump.vaultbuilder.config.layout = layout;
    if ( typeof setuptools.data.muledump.vaultbuilder.layouts[layout] !== 'object' ) {
        layout = 0;
        setuptools.data.muledump.vaultbuilder.config.layout = 0;
    }
    if ( typeof guid !== 'string' ) guid = setuptools.data.muledump.vaultbuilder.config.guid;
    if ( typeof guid === 'string' ) setuptools.data.muledump.vaultbuilder.config.guid = guid;

    var width = (setuptools.data.muledump.vaultbuilder.layouts[layout].vaultwidth * 56);
    setuptools.lightbox.build('vaultbuilder', ' \
        <div class="flex-container">\
            <div id="vaultbuilder" class="flex-container noFlexAutoWidth" style="width: ' + (width+112) + ' px;"> \
                <div class="flex-container"><h1>Vault Builder</h1></div>\
                <div class="flex-container">\
                    <div class="flex-container uimenu">\
                        \
                        <div class="flex-container">\
                            <div class="flex-container mr5">\
                                <div class="flex-container setuptools link vaultbuilder createNew menuStyle menuSmall notice textCenter noclose mb5 mr0">Create Layout</div> \
                                <div class="flex-container mb5">Loaded Layout</div>\
                                <div class="flex-container mb5">Layout ID</div>\
                                <div class="flex-container">Loaded Size</div>\
                            </div>\
                            <div class="flex-container layoutInfo mr5">\
                                <div class="flex-container setuptools link vaultbuilder loadExisting menuStyle menuSmall notice textCenter noclose mb5 mr0">Load Layout</div>\
                                <div class="flex-container layoutname mb5" style="text-align: center;"></div>\
                                <div class="flex-container layout mb5" style="text-align: center;"></div>\
                                <div class="flex-container width" style="text-align: center;"></div>\
                            </div>\
                            <div class="flex-container">\
                                <div class="flex-container setuptools link vaultbuilder options menuStyle menuSmall notice textCenter noclose mr0 mb5">Options</div>\
                                <div class="flex-container setuptools link vaultorder menuStyle menuSmall textcenter mr0 mb5 bright noclose" data-key="vaultshowempty" style="justify-content: space-between;">\
                                    <div>Show Empty Vaults</div>\
                                    <div></div>\
                                </div>\
                                <div class="flex-container setuptools link vaultorder menuStyle menuSmall textcenter mr0 mb5 bright noclose" data-key="vaultcompressed" style="justify-content: space-between;">\
                                    <div>Width Compression</div>\
                                    <div></div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div class="flex-container manager" style="width: ' + width + 'px;"></div>\
            </div>\
        </div>\
    ');
    setuptools.lightbox.settitle('vaultbuilder', false);
    setuptools.lightbox.drawhelp('vaultbuilder', 'docs/setuptools/help/vaultbuilder', 'Vault Builder Help');
    setuptools.lightbox.goback('vaultbuilder', setuptools.app.devtools.ui);
    setuptools.lightbox.display('vaultbuilder', {variant: 'fl-VaultBuilder'});
    setuptools.app.muledump.vaultbuilder.drawVaultLayout(layout, guid);

    $('div.setuptools.link.vaultorder').off('click.vaultorder.options').on('click.vaultorder.options', function(e) {

        var key = $(this).attr('data-key');
        setuptools.data.muledump.vaultbuilder.layouts[layout][key] = !(setuptools.data.muledump.vaultbuilder.layouts[layout][key]);
        setuptools.tmp.vaultbuilderState.data[key] = setuptools.data.muledump.vaultbuilder.layouts[layout][key];
        $(this).find('div:last-child').text((setuptools.data.muledump.vaultbuilder.layouts[layout][key] === true) ? 'On' : 'Off');

    });

    //  only allow numbers and certain keys
    $('input[name="existingVaultWidth"]').off('keydown.inputvalidation').on('keydown.inputvalidation', setuptools.app.muledump.vaultbuilder.validateNumericInput);

    $('div.setuptools.link.vaultbuilder.createNew')
        .off('click.createNew mouseover.createNew')
        .on('click.createNew', setuptools.app.muledump.vaultbuilder.menu.create)
        .on('mouseover.createNew', setuptools.lightbox.menu.context.close);

    $('div.setuptools.link.vaultbuilder.loadExisting')
        .off('click.loadExisting mouseover.loadExisting')
        .on('click.loadExisting mouseover.loadExisting', setuptools.app.muledump.vaultbuilder.menu.load);

    $('div.setuptools.link.vaultbuilder.options')
        .off('click.options mouseover.options')
        .on('click.options mouseover.options', setuptools.app.muledump.vaultbuilder.menu.options);

};

/**
 * @function
 * @param {Number | string} name - Layout ID or name of the layout
 * @param {Number | string} width - Vault width
 * @param {Number | string} height - Vault height
 * @returns {boolean}
 * @description Creates an empty vault with the provided specifications
 */
setuptools.app.muledump.vaultbuilder.tasks.create = function(name, width, height) {

    var layout = setuptools.app.muledump.vaultbuilder.findByName(name);
    layout = +layout;
    if ( !isNaN(+layout) ) return false;
    layout = setuptools.app.muledump.vaultbuilder.findNewId();

    if ( layout >= setuptools.config.vaultbuilderMinimumId ) {

        var vaultorder = [];
        for ( var i = 0; i < (width*height); i++ ) vaultorder.push(0);
        setuptools.data.muledump.vaultbuilder.config.layout = layout;
        setuptools.data.muledump.vaultbuilder.layouts[layout] = $.extend(true, {}, vaultorders[0], {
            layoutname: name,
            vaultwidth: width
        });
        setuptools.data.muledump.vaultbuilder.layouts[layout].vaultorder = vaultorder;

        if ( setuptools.app.config.save('Muledump/VaultBuilder created new layout') !== true ) return false;
        setuptools.app.muledump.vaultbuilder.ui();
        return true;

    }
    return false;

};

/**
 * @function
 * @param {String} name - Name of the vault layout
 * @param {Number | string} layout - Layout ID or name to rename
 * @returns {boolean}
 * @description Saves the opened vault under a new layout id or overwrite existing
 */
setuptools.app.muledump.vaultbuilder.tasks.saveAs = function(name, layout) {

    if ( isNaN(+layout) ) layout = setuptools.app.muledump.vaultbuilder.findByName(name);
    layout = +layout;
    if ( isNaN(layout) ) layout = setuptools.app.muledump.vaultbuilder.findNewId();
    if ( layout >= setuptools.config.vaultbuilderMinimumId ) {

        setuptools.data.muledump.vaultbuilder.config.layout = layout;
        setuptools.tmp.vaultbuilderState.data.layoutname = name;
        return setuptools.app.muledump.vaultbuilder.tasks.save();

    }
    return false;

};

/**
 * @function
 * @description Processes all saved configurations and upgrades them with new data if necessary.
 *
 * Rebuilds Options and Account Options menus with available vault layouts.
 */
setuptools.app.muledump.vaultbuilder.tasks.upgrade = function() {

    //  create the layouts array if it is missing
    if ( typeof setuptools.data.muledump.vaultbuilder.layouts !== 'object' ) setuptools.data.muledump.vaultbuilder.layouts = {};

    //  reset predefined configurations
    vaultorders.filter(function(layout, index) {
        setuptools.data.muledump.vaultbuilder.layouts[index] = vaultorders[index];
    });

    //  update all configurations with new keys
    var layoutkeys = Object.keys(vaultorders[0]);
    Object.keys(setuptools.data.muledump.vaultbuilder.layouts).map(function(layout) {
        var data = setuptools.data.muledump.vaultbuilder.layouts[layout];
        layoutkeys.map(function(key) {
            if ( typeof data[key] === 'undefined' ) setuptools.data.muledump.vaultbuilder.layouts[layout][key] = vaultorders[0][key];
        });
    });

    //  update the available vault layouts for options menu
    var AvailableVaultLayouts = {};
    Object.keys(setuptools.data.muledump.vaultbuilder.layouts).filter(function(index) {

        var data = setuptools.data.muledump.vaultbuilder.layouts[index];
        AvailableVaultLayouts[index] = data.layoutname;

    });
    window.options_layout.vaults.radio = ['vaultlayout', AvailableVaultLayouts];

};

/**
 * @function
 * @returns {boolean}
 * @description Saves any changes to the currently open vault layout
 */
setuptools.app.muledump.vaultbuilder.tasks.save = function() {

    var state = setuptools.data.muledump.vaultbuilder.config;
    var rename = false;

    if ( typeof state.layout !== 'number' ) state.layout = setuptools.app.muledump.vaultbuilder.findNewId();
    if (
        state.layout < setuptools.config.vaultbuilderMinimumId
    ) return setuptools.app.muledump.vaultbuilder.tasks.saveAs(
        setuptools.tmp.vaultbuilderState.data.layoutname + ' (custom)'
    );

    setuptools.data.muledump.vaultbuilder.layouts[state.layout] = $.extend(true, {}, vaultorders[0], {
        layoutname: setuptools.tmp.vaultbuilderState.data.layoutname + (rename ? ' (custom)' : ''),
        vaultwidth: setuptools.tmp.vaultbuilderState.data.vaultwidth,
        vaultshowempty: setuptools.tmp.vaultbuilderState.data.vaultshowempty,
        vaultcompressed: setuptools.tmp.vaultbuilderState.data.vaultcompressed
    });
    setuptools.data.muledump.vaultbuilder.layouts[state.layout].vaultorder = setuptools.tmp.vaultbuilderState.data.vaultorder;

    setuptools.app.config.save('Muledump/VaultBuilder saving changes');

    return true;

};

/**
 * @function
 * @param {Number | string} layout - Layout ID or name to open in vault builder
 * @returns {boolean}
 * @description Loads specified vault layout into vault builder
 */
setuptools.app.muledump.vaultbuilder.tasks.load = function(layout) {

    if ( isNaN(+layout) ) layout = setuptools.app.muledump.vaultbuilder.findByName(name);
    layout = +layout;
    if ( isNaN(+layout) ) return false;
    setuptools.data.muledump.vaultbuilder.config.layout = layout;
    setuptools.app.muledump.vaultbuilder.drawVaultLayout(layout, setuptools.data.muledump.vaultbuilder.config.guid);
    return true;

};

/**
 * @function
 * @param {Number | string} layout - Layout ID or name to delete
 * @returns {boolean}
 * @description Deletes the specified layout
 */
setuptools.app.muledump.vaultbuilder.tasks.delete = function(layout) {

    if ( isNaN(+layout) ) layout = setuptools.app.muledump.vaultbuilder.findByName(name);
    layout = +layout;
    if ( isNaN(+layout) ) return false;
    if ( typeof setuptools.data.muledump.vaultbuilder.layouts[layout] !== 'object' ) return false;
    delete setuptools.data.muledump.vaultbuilder.layouts[layout];
    if ( layout === setuptools.data.muledump.vaultbuilder.config.layout ) layout = 0;
    setuptools.data.muledump.vaultbuilder.config.layout = layout;
    setuptools.app.config.save('Muledump/VaultBuilder deleted a vault layout', true);
    return true;

};

/**
 * @function
 * @param {Number | string} layout - Layout ID or name to rename
 * @param name
 * @returns {boolean}
 * @description Renames the specified vault layout to the new name
 */
setuptools.app.muledump.vaultbuilder.tasks.rename = function(layout, name) {

    if ( isNaN(+layout) ) layout = setuptools.app.muledump.vaultbuilder.findByName(name);
    layout = +layout;
    if ( isNaN(+layout) ) return false;
    if ( typeof setuptools.data.muledump.vaultbuilder.layouts[layout] !== 'object' ) return false;
    setuptools.data.muledump.vaultbuilder.layouts[layout].layoutname = name;
    setuptools.app.config.save('Muledump/VaultBuilder renamed layout');
    return true;

};

/**
 * @function
 * @param {string} guid - Account to enter into account view
 * @description Loads an account into the account viewer for the vault builder
 */
setuptools.app.muledump.vaultbuilder.tasks.accountView = function(guid) {

    if (
        typeof guid !== 'string' ||
        !(mules[guid] instanceof Mule)
    ) return;
    setuptools.data.muledump.vaultbuilder.config.guid = guid;
    setuptools.app.config.save('Muledump/VaultBuilder changed account view', true);
    setuptools.app.muledump.vaultbuilder.ui(
        setuptools.data.muledump.vaultbuilder.config.layout || setuptools.data.options.vaultlayout,
        guid
    );

};

/**
 * @function
 * @param {string} [mode=import] - Mode to run in (import or export)
 * @description Displays the import and export configuration UI
 */
setuptools.app.muledump.vaultbuilder.menu.import = function(mode) {

    setuptools.lightbox.menu.context.close('mulemenu-vaultbuilderMenuImport');
    if ( ['import','export'].indexOf(mode) === -1 ) mode = 'import';

    var position = $('div.setuptools.link.vaultbuilder.createNew');
    var options = [
        {
            option: 'class',
            value: 'bright simpleForm'
        },
        {
            option: 'pos',
            vpx: position.outerHeight(),
            hpx: 2
        },
        {
            option: 'css',
            css: {width: $('div#vaultbuilder div.uimenu').innerWidth()-24}
        }
    ];

    var html = '';
    if ( mode === 'import' ) html += ' \
        <input type="file" id="files" name="files" class="setuptools mb5 setuptools menuStyle bright buttonStyle inputfile mr0" multiple><label class="mr0 mb5 neutral" for="files" style="width: 100%; height: 17px;">Click to Select File(s)</label>\
        \
        <div class="flex-container import layouts" style="flex-wrap: wrap;">\
        </div>\
        \
        <div class="flex-container">\
            <div class="setuptools link vaultbuilder import save menuStyle buttonStyle positive bright flex-container noFlexAutoWidth mr5" style="width: 25%; height: 17px; flex-grow: 2;">Import</div>\
            <div class="setuptools link vaultbuilder cancel menuStyle buttonStyle negative flex-container noFlexAutoWidth mr0" style="width: 25%; height: 17px; flex-grow: 2;">Cancel</div>\
        </div>\
    ';

    if ( mode === 'export' ) {

        html += ' \
            <div class="flex-container" style="align-content: space-evenly;">\
                <div class="flex-container noFlexAutoWidth w50" style="height: 100%; flex-flow: column;">\
                    <div class="flex-container noFlexAutoWidth w50 mb10">Select Layouts</div>\
                    <div class="flex-container">\
                        <div class="flex-container noFlexAutoWidth setuptools link vaultbuilder saveExport menuStyle positive bright mr5" style="width: 25%; flex-grow: 2;">Export</div>\
                        <div class="setuptools link vaultbuilder cancel menuStyle negative flex-container noFlexAutoWidth mr5" style="width: 25%; flex-grow: 2;">Cancel</div>\
                    </div>\
                </div>\
                <select name="exportLayouts" class="flex-container noFlexAutoWidth w50 setuptools menuStyle notice bright scrollbar" multiple style="height: 93px;">\
        ';

        Object.keys(setuptools.data.muledump.vaultbuilder.layouts).forEach(function(layout) {

            var data = setuptools.data.muledump.vaultbuilder.layouts[layout];
            html += ' \
                <option value="' + layout + '">' + data.layoutname + '</option>\
            ';

        });

        html += ' \
                </select>\
            </div>\
            <div class="flex-container mt5">' + ( (setuptools.state.hosted === false && setuptools.browser === 'chrome') ? '<strong class="mr5">Warning</strong> <div style="text-align: justify;">Your browser may flag zip downloads from local apps as being potentially malicious.</div>' : '' ) + '</div>\
        ';

    }

    options.push({
        option: 'input',
        class: 'saveAsName',
        value: ' \
            <div class="flex-container" style="justify-content: space-between;">\
                <div class="flex-container mr5 noFlexAutoWidth" style="flex-flow: column; flex-grow: 0;">\
                    <div class="setuptools link vaultbuilder importMode menuStyle buttonStyle bright mr0 mb5 ' + ( (mode === 'import') ? 'selected' : '' ) + '" style="width: 150px; height: 17px;">Import</div>\
                    <div class="setuptools link vaultbuilder exportMode menuStyle buttonStyle bright notice menuSmall mr0 ' + ( (mode === 'export') ? 'selected' : '' ) + '" style="width: 150px; height: 17px;">Export</div>\
                </div>\
                <div class="flex-container noFlexAutoWidth p5 ' + ( (mode === 'export') ? 'notice' : '' ) + ' bright buttonStyle mr0" style="flex-wrap: wrap; height: 100%; flex-grow: 3;">\
                    ' + html + '\
                </div>\
            </div>\
        ',
        binding: function() {

            //  cancel button
            $('div.setuptools.link.vaultbuilder.cancel').on('click.createCancel', function() {
                setuptools.lightbox.menu.context.close();
            });

            //  import mode button
            $('div.setuptools.link.vaultbuilder.importMode').on('click.vaultbuilder.importMode', function() {
                setuptools.app.muledump.vaultbuilder.menu.import('import');
            });

            //  export mode button
            $('div.setuptools.link.vaultbuilder.exportMode').on('click.vaultbuilder.exportMode', function() {
                setuptools.app.muledump.vaultbuilder.menu.import('export');
            });

            //  layoutid input validation
            $('div.setuptools.menu input[name="saveAsId"]').on('keydown.validateinput', setuptools.app.muledump.vaultbuilder.validateNumericInput);

            function ImportFileParseZips(files) {

                var data = {};
                Object.keys(files.layouts).forEach(function(layout) {
                    if ( +layout >= setuptools.config.vaultbuilderMinimumId ) data[layout] = files.layouts[layout];
                });

                var label = $('label[for="files"]');
                label.text(Object.keys(files.layouts).length + " file" + ( (Object.keys(files.layouts).length !== 1) ? 's' : '' ) + ' found');
                var container = $('div.import.layouts');
                container.empty();

                Object.keys(files.layouts).forEach(function(layout) {

                    var dom = $('<div class="flex-container mb5" data-layout="' + layout + '"> \
                        <input type="checkbox" name="selected" class="mr5 ml0" placeholder="Selected" ' + ( (layout < setuptools.config.vaultbuilderMinimumId) ? '' : 'checked' ) + '>\
                        <input value="' + files.layouts[layout].layoutname + '" type="text" name="name" placeholder="Layout Name" class="setuptools flex-container noFlexAutoWidth mr5" style="height: 17px; flex-grow: 1; width: 25%;">\
                        <input value="' + ( (+layout < setuptools.config.vaultbuilderMinimumId) ? '' : layout ) + '" type="text" name="layout" placeholder="' + ( (+layout < setuptools.config.vaultbuilderMinimumId) ? layout : 'Layout ID' ) + '" class="setuptools flex-container noFlexAutoWidth" style="height: 17px; flex-grow: 1; width: 25%;">\
                    </div>')
                        .css({display: 'none'})
                        .appendTo(container)
                        .slideDown();

                    dom.find('input[name="layout"]').each(function(e) {
                        $(this).off('keydown.inputvalidation').on('keydown.inputvalidation', setuptools.app.muledump.vaultbuilder.validateNumericInput);
                        $(this).on('change.inputvalidation', function() {
                            if ( +$(this).val() < setuptools.config.vaultbuilderMinimumId ) $(this).attr('placeholder', 'Must be >= ' + setuptools.config.vaultbuilderMinimumId).val('');
                        });
                    });

                    dom.find('input[type="checkbox"]').each(function() {

                        $(this).on('change.vaultbuilder.import.selected', function(e) {

                            if (!this.checked) return;
                            if (
                                typeof +$(this).siblings('input[name="layout"]').val() !== 'number' ||
                                +$(this).siblings('input[name="layout"]').val() < setuptools.config.vaultbuilderMinimumId
                            ) {
                                this.checked = false;
                            }

                        });

                    })


                });

                $('div.setuptools.link.vaultbuilder.import.save').on('click.vaultbuilder.save', function() {

                    var selected = [];
                    container.find('input[type="checkbox"]').each(function() {
                        if ( !$(this).prop('checked') ) return;
                        selected.push($(this).parent().attr('data-layout'));
                    });

                    selected.forEach(function(layout) {

                        var dom = $('div[data-layout="' + layout + '"]');
                        layout = dom.find('input[name="layout"]').val();
                        if ( !layout || +layout < setuptools.config.vaultbuilderMinimumId ) return;
                        setuptools.data.muledump.vaultbuilder.layouts[layout] = data[layout];

                    });

                    setuptools.app.config.save('Muledump/VaultBuilder imported configuration');
                    setuptools.lightbox.menu.context.close();

                });

            }

            //  react to file upload changes
            $('input[type="file"]').on('change.input.file', function(e) {

                var self = this;
                var label = $('label[for="files"]');
                var files = {};
                var count = 0;
                var expect = 0;
                var start = Date.now();
                Object.keys(this.files).forEach(function(index) {

                    var file = self.files[index];
                    var reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = function () {

                        if (reader.error) {

                            label.text('Failed to parse selected file(s)');

                        } else {

                            var zip = new JSZip();
                            zip.loadAsync(reader.result).then(function (zip) {

                                expect += Object.keys(zip.files).length;
                                Object.keys(zip.files).filter(function(filename) {

                                    var matches = filename.match(/^(?:([a-z0-9]*)\/)?(.*?)\.json$/);
                                    if ( matches === null ) {
                                        count++;
                                        return;
                                    }
                                    if ( matches[1] && !files[matches[1]] ) files[matches[1]] = {};
                                    zip.file(filename).async("string").then(function(string) {
                                        count++;
                                        try {

                                            if (matches[1]) {
                                                files[matches[1]][matches[2].replace('----', ':')] = JSON.parse(string);
                                            } else files[matches[2]] = JSON.parse(string);

                                        } catch(e) {}
                                    });

                                });

                            });

                        }

                    }

                });

                //  we need to wait for multiple promises to fulfill
                var interval = setInterval(function() {
                    if ( expect === count || (Date.now()-start > 5000) ) {
                        clearInterval(interval);
                        ImportFileParseZips(files);
                    }
                },50);

            });

            /*
            //  export mode
            */

            $('div.setuptools.link.vaultbuilder.saveExport').on('click.vaultbuilder.export', function() {

                //  initiate our zip file
                var zip = new JSZip();
                $('select[name="exportLayouts"] option:selected').each(function() {
                    zip.file('layouts/' + $(this).val() + '.json', JSON.stringify(setuptools.data.muledump.vaultbuilder.layouts[$(this).val()]));
                });

                //  generate archive metadata
                zip.file('meta.json', JSON.stringify({
                    format: 1,
                    timestamp: (new Date).toISOString()
                }, null, 5));

                //  generate and serve the file
                zip.generateAsync({
                    type:"blob",
                    compression: "DEFLATE",
                    compressionOptions: {
                        level: 1
                    }
                }).then(function(content) {
                    saveAs(content, 'muledump-layouts-' + Date.now() + ".zip");
                });


            });

        }
    });

    setuptools.lightbox.menu.context.create('mulemenu-vaultbuilderMenuImport', false, position, options);

};

/**
 * @function
 * @description Displays the duplicate layout option menu
 */
setuptools.app.muledump.vaultbuilder.menu.duplicate = function() {

    var state = setuptools.tmp.vaultbuilderState;

    var position = $('div.setuptools.link.vaultbuilder.options');
    var options = [
        {
            option: 'pos',
            vpx: position.outerHeight(),
            hpx: position.innerWidth()+2,
            h: 'right'
        },
        {
            option: 'css',
            css: {width: position.innerWidth()}
        },
        {
            option: 'class',
            value: 'bright simpleForm vaultbuilder'
        }
    ];

    var layoutOptions = '';
    Object.keys(setuptools.data.muledump.vaultbuilder.layouts).filter(function(index) {

        var data = setuptools.data.muledump.vaultbuilder.layouts[index];
        layoutOptions += ' \
            <option style="background-color: #3f3f3f; outline: 0;" value="' + index + '" ' + ( (setuptools.data.muledump.vaultbuilder.config.layout === +index) ? 'selected' : '' ) + '>' + data.layoutname + '</option>\
        ';

    });

    options.push({
        option: 'input',
        class: 'createVaultName',
        value: ' \
            <div class="flex-container" style="justify-content: space-between;">\
                <select name="duplicateFrom" class="mb5">\
                    ' + layoutOptions + '\
                </select>\
                <input name="duplicateNewName" placeholder="New Name" class="mb5"> \
                <div class="setuptools link vaultbuilder duplicateNew confirm menuStyle buttonStyle menuSmall mr0 half">Duplicate</div>\
                <div class="setuptools link vaultbuilder cancel confirm menuStyle buttonStyle menuSmall mr0 half">Cancel</div>\
            </div>\
        ',
        binding: function() {

            $('div.setuptools.link.vaultbuilder.cancel').on('click.createCancel', function() {
                setuptools.lightbox.menu.context.close();
            });

            $('div.setuptools.link.vaultbuilder.duplicateNew').on('click.saveAsConfirm', function() {

                var input = $('input[name="duplicateNewName"]');
                setuptools.app.muledump.vaultbuilder.tasks.load(+$('select[name="duplicateFrom"]').val(), true);
                if ( setuptools.app.muledump.vaultbuilder.tasks.saveAs(input.val()) === true ) {
                    setuptools.app.muledump.vaultbuilder.ui();
                    return;
                }

                //  cannot overwrite predefined layouts
                input.addClass('conflict').val('').attr('placeholder', 'Cannot use that name');

            });

        }
    });

    setuptools.lightbox.menu.context.create('mulemenu-vaultbuilderMenuDuplicate', false, position, options);

};

/**
 * @function
 * @description Displays the layout creation menu
 */
setuptools.app.muledump.vaultbuilder.menu.create = function() {

    if ( setuptools.lightbox.menu.context.isOpen('mulemenu-vaultbuilderMenuCreate') === true ) {
        setuptools.lightbox.menu.context.close();
        return;
    };

    var position = $('div.setuptools.link.vaultbuilder.createNew');
    var options = [
        {
            option: 'class',
            value: 'bright simpleForm vaultbuilder'
        },
        {
            option: 'pos',
            vpx: position.outerHeight(),
            hpx: 2
        },
        {
            option: 'css',
            css: {width: position.innerWidth()}
        }
    ];

    options.push({
        option: 'input',
        class: 'createVaultName',
        value: ' \
            <div class="flex-container" style="justify-content: space-between;">\
                <input name="createNewName" placeholder="Name" class="mb5"> \
                <input name="createNewWidth" placeholder="Width" class="mb5 half">\
                <input name="createNewHeight" placeholder="Rows" class="mb5 half">\
                <div class="setuptools link vaultbuilder createNew confirm menuStyle buttonStyle menuSmall mr0 half">Create</div>\
                <div class="setuptools link vaultbuilder cancel confirm menuStyle buttonStyle menuSmall mr0 half">Cancel</div>\
            </div>\
        ',
        binding: function() {

            $('div.setuptools.menu input[name="createNewWidth"]').on('keydown.validateinput', setuptools.app.muledump.vaultbuilder.validateNumericInput);
            $('div.setuptools.menu input[name="createNewHeight"]').on('keydown.validateinput', setuptools.app.muledump.vaultbuilder.validateNumericInput);

            $('div.setuptools.menu div.setuptools.link.vaultbuilder.createNew.confirm').on('click.createNew', function() {

                $('div.setuptools.menu .conflict').removeClass('conflict');
                var name = $('input[name="createNewName"]').val() || '';
                var width = $('input[name="createNewWidth"]').val() || '';
                var height = $('input[name="createNewHeight"]').val() || '';

                if ( typeof name !== 'string' || name.length === 0 ) {
                    $('input[name="createNewName"]').addClass('conflict');
                    return;
                }

                if ( width.match(/^([0-9]+)$/) === null ) {
                    $('input[name="createNewWidth"]').addClass('conflict');
                    return;
                }

                if ( height.match(/^([0-9]+)$/) === null ) {
                    $('input[name="createNewHeight"]').addClass('conflict');
                    return;
                }

                if ( setuptools.app.muledump.vaultbuilder.tasks.create(name, width, height) === true ) {
                    setuptools.app.muledump.vaultbuilder.ui();
                    return;
                }

                //  cannot overwrite predefined layouts
                $('input[name="createNewName"]').addClass('conflict').val('').attr('placeholder', 'Choose another');

            });

            $('div.setuptools.link.vaultbuilder.cancel').on('click.saveAsCancel', function() {
                setuptools.lightbox.menu.context.close();
            });

        }
    });

    setuptools.lightbox.menu.context.create('mulemenu-vaultbuilderMenuCreate', false, position, options);

};

/**
 * @function
 * @description Displays the vault builder save as menu
 */
setuptools.app.muledump.vaultbuilder.menu.saveAs = function() {

    if ( setuptools.lightbox.menu.context.isOpen('mulemenu-vaultbuilderMenuSaveAs') === true ) {
        setuptools.lightbox.menu.context.close();
        return;
    };

    var position = $('div.setuptools.link.vaultbuilder.options');
    var options = [
        {
            option: 'class',
            value: 'bright simpleForm vaultbuilder'
        },
        {
            option: 'pos',
            vpx: position.outerHeight(),
            hpx: position.innerWidth()+2,
            h: 'right'
        },
        {
            option: 'css',
            css: {width: position.innerWidth()}
        }
    ];

    options.push({
        option: 'input',
        class: 'saveAsName',
        value: ' \
            <div class="flex-container" style="justify-content: space-between;">\
                <input name="saveAsName" placeholder="New Name" class="mb5"> \
                <div class="setuptools link vaultbuilder saveAs confirm menuStyle buttonStyle menuSmall mr0 half">Save</div>\
                <div class="setuptools link vaultbuilder cancel confirm menuStyle buttonStyle menuSmall mr0 half">Cancel</div>\
            </div>\
        ',
        binding: function() {

            $('div.setuptools.link.vaultbuilder.saveAs').on('click.saveAsConfirm', function() {

                var input = $('input[name="saveAsName"]');
                if ( setuptools.app.muledump.vaultbuilder.tasks.saveAs(input.val()) === true ) {
                    setuptools.app.muledump.vaultbuilder.ui();
                    return;
                }

                //  cannot overwrite predefined layouts
                input.addClass('conflict').val('').attr('placeholder', 'Cannot use that name');

            });

            $('div.setuptools.link.vaultbuilder.cancel').on('click.saveAsCancel', function() {
                setuptools.lightbox.menu.context.close();
            });

        }
    });

    setuptools.lightbox.menu.context.create('mulemenu-vaultbuilderMenuCreate', false, position, options);

};

/**
 * @function
 * @description Displays the vault layout rename menu
 */
setuptools.app.muledump.vaultbuilder.menu.rename = function() {

    if ( setuptools.lightbox.menu.context.isOpen('mulemenu-vaultbuilderMenuRename') === true ) {
        setuptools.lightbox.menu.context.close();
        return;
    };

    var position = $('div.setuptools.link.vaultbuilder.options');
    var options = [
        {
            option: 'class',
            value: 'bright simpleForm vaultbuilder'
        },
        {
            option: 'pos',
            vpx: position.outerHeight(),
            hpx: position.innerWidth()+2,
            h: 'right'
        },
        {
            option: 'css',
            css: {width: position.innerWidth()}
        }
    ];

    options.push({
        option: 'input',
        class: 'saveAsName',
        value: ' \
            <div class="flex-container" style="justify-content: space-between;">\
                <input name="renameAs" placeholder="New Name" class="mb5"> \
                <div class="setuptools link vaultbuilder renameAs confirm menuStyle buttonStyle menuSmall mr0 half">Save</div>\
                <div class="setuptools link vaultbuilder cancel confirm menuStyle buttonStyle menuSmall mr0 half">Cancel</div>\
            </div>\
        ',
        binding: function() {

            $('div.setuptools.link.vaultbuilder.renameAs').on('click.renameAsConfirm', function() {
                setuptools.app.muledump.vaultbuilder.tasks.rename(setuptools.data.muledump.vaultbuilder.config.layout, $('input[name="renameAs"]').val());
                setuptools.app.muledump.vaultbuilder.ui();
            });

            $('div.setuptools.link.vaultbuilder.cancel').on('click.saveAsCancel', function() {
                setuptools.lightbox.menu.context.close();
            });

        }
    });

    setuptools.lightbox.menu.context.create('mulemenu-vaultbuilderMenuCreate', false, position, options);

};

/**
 * @function
 * @description Displays the vault builder load menu
 */
setuptools.app.muledump.vaultbuilder.menu.load = function() {

    var position = $('div.setuptools.link.vaultbuilder.loadExisting');
    var options = [{
        option: 'skip',
        value: 'reposition'
    },
        {
            option: 'hover',
            action: 'close',
            timer: 'vaultbuilderMenuMain'
        },
        {
            option: 'class',
            value: 'bright'
        },
        {
            option: 'pos',
            vpx: position.outerHeight(),
            hpx: 2
        },
        {
            option: 'css',
            css: {width: position.innerWidth()}
        }
    ];

    Object.keys(setuptools.data.muledump.vaultbuilder.layouts).filter(function(index) {

        var data = setuptools.data.muledump.vaultbuilder.layouts[index];
        var rows = Math.ceil(data.vaultorder.length/data.vaultwidth);
        options.push({
            class: 'vaultbuilderChoice' + index.toString(),
            name: ' \
                <div class="flex-container" style="justify-content: space-between;">\
                    <div>' + data.layoutname + '</div>\
                    <div>' + data.vaultwidth + ' x ' + rows + '</div>\
                </div>\
            ',
            callback: setuptools.app.muledump.vaultbuilder.tasks.load,
            callbackArg: index
        });

    });

    setuptools.lightbox.menu.context.create('mulemenu-vaultbuilderMenuMain', false, position, options);

};

/**
 * @function
 * @description Displays the account view selection menu
 */
setuptools.app.muledump.vaultbuilder.menu.accountView = function() {

    var position = $('div.setuptools.link.vaultbuilder.options');
    var options = [
        {
            option: 'hover',
            action: 'close',
            timer: 'vaultbuilderAccountView'
        },{
            option: 'css',
            css: {
                width: position.innerWidth() + 'px',
                'overflow-x': 'hidden',
                'overflow-y': ( (Object.keys(mules).length > 10 && setuptools.data.config.vaultbuilderAccountViewLimit > 10 ) ? 'scroll' : '' ),
                'max-height': '324px'
            }
        },
        {
            option: 'pos',
            vpx: position.outerHeight(),
            hpx: 2
        },
        {
            option: 'class',
            value: 'scrollbar bright'
        },
        {
            class: 'accountViewBack',
            name: 'Back ...',
            callback: setuptools.app.muledump.vaultbuilder.menu.options
        }
    ];

    var limited = false;
    Object.keys(mules).filter(function(guid, index) {

        if ( index > (setuptools.data.config.vaultbuilderAccountViewLimit-1) ) {
            if ( limited === false ) {
                limited = true;
                options.push({
                    class: 'accountViewLimit',
                    name: 'Show More ...',
                    callback: function () {
                        setuptools.app.config.settings('vaultbuilderAccountViewLimit', 'advanced');
                    }
                });
            }
            return;
        }

        options.push({
            class: 'accountView ' + guid.replace('@', '-----'),
            name: setuptools.app.muledump.getName(guid),
            callback: setuptools.app.muledump.vaultbuilder.tasks.accountView,
            callbackArg: guid
        });

    });

    setuptools.lightbox.menu.context.create('mulemenu-vaultbuilderAccountView', false, position, options);

};

/**
 * @function
 * @description Displays the vault builder options menu
 */
setuptools.app.muledump.vaultbuilder.menu.options = function() {

    var position = $('div.setuptools.link.vaultbuilder.options');
    var options = [{
        option: 'skip',
        value: 'reposition'
    },
        {
            option: 'hover',
            action: 'close',
            timer: 'vaultbuilderMenuOptions'
        },
        {
            option: 'class',
            value: 'bright'
        },
        {
            option: 'pos',
            vpx: position.outerHeight(),
            hpx: 2
        },
        {
            option: 'css',
            css: {width: position.innerWidth()}
        }
    ];

    var accountView = {default: 'No Account'};
    Object.keys(mules).filter(function(guid) {
        if ( Object.keys(accountView).length > (setuptools.data.config.vaultbuilderAccountViewLimit+1) ) return;
        accountView[guid] = setuptools.app.muledump.getName(guid);
    });

    if ( setuptools.data.muledump.vaultbuilder.config.layout >= setuptools.config.vaultbuilderMinimumId ) options.push({
        class: 'vaultbuilderSave',
        name: 'Save',
        callback: setuptools.app.muledump.vaultbuilder.tasks.save
    });

    options.push(
        {
            class: 'vaultbuilderSave',
            name: 'Save as ...',
            callback: setuptools.app.muledump.vaultbuilder.menu.saveAs
        },
        {
            class: 'vaultbuilderReset',
            name: 'Reset',
            callback: setuptools.app.muledump.vaultbuilder.ui
        }
    );

    if ( setuptools.data.muledump.vaultbuilder.config.layout >= setuptools.config.vaultbuilderMinimumId ) options.push({
        class: 'vaultbuilderRename',
        name: 'Rename ...',
        callback: setuptools.app.muledump.vaultbuilder.menu.rename
    },{
        class: 'vaultbuilderDelete',
        name: 'Delete',
        callback: function() {
            setuptools.app.muledump.vaultbuilder.tasks.delete(setuptools.data.muledump.vaultbuilder.config.layout);
            setuptools.app.muledump.vaultbuilder.ui();
        }
    });

    options.push(
        {
            class: 'vaultbuilderDuplicate',
            name: 'Duplicate ...',
            callback: setuptools.app.muledump.vaultbuilder.menu.duplicate,
        },
        {
            class: 'vaultbuilderAccount',
            name: 'Account View ...',
            callback: setuptools.app.muledump.vaultbuilder.menu.accountView
        },
        {
            class: 'vaultbuilderImport',
            name: 'Import / Export ...',
            callback: setuptools.app.muledump.vaultbuilder.menu.import
        }
    );

    setuptools.lightbox.menu.context.create('mulemenu-vaultbuilderMenuOptions', false, position, options);

};
