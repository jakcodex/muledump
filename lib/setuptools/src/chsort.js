/**
 * @function
 * @param {string} guid
 * @param {number} charid
 * Records the date a character id is first seen
 */
setuptools.app.muledump.charSeen = function(guid, charid) {

    charid = Number(charid);
    if ( typeof setuptools.data.muledump.charsSeen[guid] !== 'object' ) setuptools.data.muledump.charsSeen[guid] = {};
    if ( typeof setuptools.data.muledump.charsSeen[guid][charid] === 'undefined' ) {
        setuptools.data.muledump.charsSeen[guid][charid] = Date.now();
        setuptools.app.config.save('Recording character seen', true);
    }

};

/**
 * @function
 * @param {string} guid
 * @param {string | boolean} [list]
 * @returns {void | string}
 * Returns active charlist for a guid if no list is provided, or sets new active charlist if valid
 */
setuptools.app.muledump.charsort.active = function(guid, list) {

    if ( !(mules[guid] instanceof Mule) ) return;
    var CustomList = setuptools.data.muledump.chsortcustom.accounts[guid];
    if ( typeof CustomList !== 'object' ) return;

    //  return the active list if none is provided
    if ( list === false ) {
        options_set('chsort', null, guid);
        mules[guid].query(false, true);
        return '';
    } else if ( list === true ) {
        options_set('chsort', '100', guid);
        mules[guid].query(false, true);
        return CustomList.active;
    }

    if ( typeof list !== 'string' ) return CustomList.active;
    if ( list === '' ) {
        CustomList.active = '';
        options_set('chsort', null, guid);
        setuptools.app.config.save('Muledump/Charsort changed active', true);
        mules[guid].query(false, true);
        return '';
    }

    if (
        typeof CustomList === 'object' &&
        typeof CustomList.data === 'object' &&
        Array.isArray(CustomList.data[list])
    ) {

        CustomList.active = list;
        options_set('chsort', '100', guid);
        setuptools.app.config.save('Muledump/Charsort changed active', true);
        mules[guid].query(false, true);
        return list;

    }

    if ( typeof CustomList === 'object' && CustomList.active ) return CustomList.active;

};

/**
 * @function
 * @param {string} guid
 * @param {string | boolean} [list]
 * @param {boolean} [clist]
 * @returns {*}
 * Reads a character sorting list (or active) for provided guid
 */
setuptools.app.muledump.charsort.read = function(guid, list, clist) {

    if ( typeof list === 'boolean' ) {
        clist = list;
        list = undefined;
    }

    if ( !(mules[guid] instanceof Mule) || !Array.isArray(mules[guid].data.query.results.Chars.Char) ) return;
    var d = mules[guid].data.query.results.Chars;
    var CharList = [];
    var CustomList = setuptools.data.muledump.chsortcustom.accounts[guid];
    if (
        typeof CustomList === 'object' &&
        typeof CustomList.data === 'object' &&
        Array.isArray(CustomList.data[(list || CustomList.active)])
    ) {

        if ( typeof list !== 'string' ) list = CustomList.active;
        if ( typeof CustomList.data[list] === 'undefined' ) return;
        for (var i in d.Char) {

            if (d.Char.hasOwnProperty(i)) {

                var index = CustomList.data[list].indexOf(d.Char[i].id);
                if (index > -1) CharList[index] = ( clist === true ) ? d.Char[i] : d.Char[i].id;

            }

        }

        //  make sure no missing entries were found (i.e. dead characters)
        for (var i2 = 0; i2 < CharList.length; i2++)
            if (typeof CharList[i2] === 'undefined')
                CustomList.data[list].splice(i2, 1);

    }

    if ( CharList.length > 0 ) setuptools.app.ga('send', 'event', {
        eventCategory: 'detect',
        eventAction: 'charSortCustom'
    });

    return CharList;

};

/**
 * @function
 * @param {string} guid
 * @param {string} charlist
 * @param {array} CharList
 * @returns {boolean}
 * Sets a charlist with new data
 */
setuptools.app.muledump.charsort.set = function(guid, charlist, CharList) {

    if ( !Array.isArray(CharList) ) return false;
    setuptools.app.muledump.charsort.unsaved = true;
    setuptools.data.muledump.chsortcustom.accounts[guid].data[charlist] = CharList;
    return true;

};

/**
 * @function
 * @param {function} [callback]
 * @returns {void | boolean}
 * Saves the configuration if any list changes were made
 */
setuptools.app.muledump.charsort.save = function(callback) {

    if ( setuptools.app.muledump.charsort.unsaved !== true ) return;
    delete setuptools.app.muledump.charsort.unsaved;
    setuptools.app.config.save('Muledump/Charsort saving changes');
    if ( typeof callback === 'function' ) callback();
    return true;

};

/**
 * @function
 * @param {string} guid
 * @param {string} charlist
 * @returns {boolean}
 * Creates an empty charlist
 */
setuptools.app.muledump.charsort.create = function(guid, charlist) {

    if ( typeof setuptools.data.muledump.chsortcustom.accounts[guid] === 'undefined' ) setuptools.data.muledump.chsortcustom.accounts[guid] = $.extend(true, {}, setuptools.objects.charlist);
    if ( typeof setuptools.data.muledump.chsortcustom.accounts[guid].data[charlist] === 'undefined' ) {
        setuptools.data.muledump.chsortcustom.accounts[guid].active = charlist;
        setuptools.data.muledump.chsortcustom.accounts[guid].data[charlist] = [];
    }
    return true;

};

/**
 * @function
 * @param {string} guid
 * @param {string} charlist
 * @returns {boolean}
 * Deletes the specified charlist
 */
setuptools.app.muledump.charsort.delete = function(guid, charlist) {

    if (
        typeof setuptools.data.muledump.chsortcustom.accounts[guid] === 'undefined' ||
        typeof setuptools.data.muledump.chsortcustom.accounts[guid].data[charlist] === 'undefined'
    ) return false;
    delete setuptools.data.muledump.chsortcustom.accounts[guid].data[charlist];
    if ( setuptools.data.muledump.chsortcustom.accounts[guid].active === charlist ) setuptools.app.muledump.charsort.active(guid, false);
    return true;

};

/**
 * @function
 * @param {string} guid
 * @param {string} charlist
 * @param {string} charid
 * @param {number} [position]
 * @returns {void | boolean}
 * Adds a charid to a list
 */
setuptools.app.muledump.charsort.add = function(guid, charlist, charid, position) {

    var CharList = setuptools.app.muledump.charsort.read(guid, charlist);
    if ( !Array.isArray(CharList) ) return;
    if ( CharList.indexOf(charid) > -1 ) return false;
    if ( !position || position >= CharList.length ) {
        CharList.push(charid);
    } else CharList.splice(position, 0, charid);
    setuptools.app.muledump.charsort.set(guid, charlist, CharList);
    return true;

};

/**
 * @function
 * @param {string} guid
 * @param {string} charlist
 * @param {string} charid
 * @returns {void | boolean}
 * Removes a charid from a list
 */
setuptools.app.muledump.charsort.remove = function(guid, charlist, charid) {

    var CharList = setuptools.app.muledump.charsort.read(guid, charlist);
    if ( !Array.isArray(CharList) ) return;
    if ( CharList.indexOf(charid) === -1 ) return false;
    CharList.splice(CharList.indexOf(charid), 1);
    setuptools.app.muledump.charsort.set(guid, charlist, CharList);
    return true;

};

/**
 * @function
 * @param {*} [guids]
 * Clean up character sorting lists for the provided guids
 */
setuptools.app.muledump.charsort.clean = function(guids) {

    if ( typeof guids === 'undefined' ) guids = Object.keys(setuptools.data.muledump.chsortcustom.accounts);
    if ( typeof guids === 'string' ) guids = [guids];
    if ( !Array.isArray(guids) ) return;

    setuptools.app.techlog('Muledump/Charsort cleanup is running');

    //  loop thru each provided guid
    for ( var id = 0; id < guids.length; id++ ) {

        //  a bit of sanity here
        var guid = guids[id];
        var CustomList = setuptools.data.muledump.chsortcustom.accounts[guid];
        if (
            typeof CustomList === 'object' &&
            typeof CustomList.data === 'object'
        ) {

            var saveReq = [];
            var d = mules[guid].data.query.results.Chars;

            //  loop thru each list for this account
            for ( var list in CustomList.data ) {

                if ( CustomList.data.hasOwnProperty(list) ) {

                    //  loop thru all characters for this account and check match their ids to list members
                    var length = CustomList.data[list].length;
                    CustomList.data[list] = CustomList.data[list].filter(function(charid) {
                        return (d.Char.filter(function(char) {
                            return ( char.id === charid );
                        }).length > 0);
                    });

                    if ( CustomList.data[list].length < length ) saveReq.push([list, length-CustomList.data[list].length]);

                }

            }

            //  if any lists were found with bad data we'll save the changes
            if (saveReq.length > 0) setuptools.app.config.save('CharSort/Cleanup updated these lists: ' + saveReq);

        }

    }

};

/**
 * @function
 * @param a
 * @param b
 * @returns {number}
 * For use with CharList.sort()
 */
setuptools.app.muledump.charsort.sort = function(a, b) {

    //  by id
    if (setuptools.data.muledump.chsortcustom.sort === 0) return a.id - b.id;

    //  by fame
    if (setuptools.data.muledump.chsortcustom.sort === 1) return b.CurrentFame - a.CurrentFame;

    //  by total fame
    if (setuptools.data.muledump.chsortcustom.sort === 2) return b.muledump.TotalFame - a.muledump.TotalFame;

    //  by class, then fame
    if (setuptools.data.muledump.chsortcustom.sort === 3) {

        if (a.muledump.ClassName < b.muledump.ClassName) return -1;
        if (a.muledump.ClassName > b.muledump.ClassName) return 1;
        if (a.muledump.ClassName === b.muledump.ClassName) {
            return b.CurrentFame - a.CurrentFame;
        }
        return 0;

    }

};

/**
 * @function
 * @param {string} guid
 * @param {array} CharList
 * @param {object} chars
 * @returns {object}
 * Sort thru and add disabled chars to the CharList if enabled
 */
setuptools.app.muledump.charsort.disabled = function(guid, CharList, chars) {

    if ( !(mules[guid] instanceof Mule) || !Array.isArray(mules[guid].data.query.results.Chars.Char) ) return chars;
    if ( setuptools.data.muledump.chsortcustom.disabledmode === true ) {

        var unusedChars = [];
        mules[guid].data.query.results.Chars.Char.filter(function (element) {
            if (CharList.indexOf(element.id) === -1) unusedChars.push(element);
        });

        //  sort that list
        unusedChars.sort(setuptools.app.muledump.charsort.sort);

        //  join both lists
        chars = chars.concat(unusedChars);

    }
    return chars;

};

/**
 * @function
 * @param {string} guid
 * @param {string} charlist
 * Display the Char Sorting menu
 */
setuptools.app.muledump.charsort.menu = function(guid, charlist) {

    setuptools.lightbox.close('muledump-charsort');
    var variant = 'fl-Chsort';
    var lists;
    var title = 'Custom Character Sorting';
    var goback = false;

    //  multi-character accounts have an array here
    if (
        typeof mules[guid] === 'object' &&
        typeof mules[guid].data === 'object' &&
        Array.isArray(mules[guid].data.query.results.Chars.Char)
    ) {

        //  select/create/manage lists
        if ( typeof charlist === 'undefined' ) {

            variant = '';
            function toggleButtonDraw() {

                var toggleButtonText = 'Turn on Custom Character Sorting';
                var toggleButtonClasses = ('muledump link toggleEnabled menuStyle textCenter mr0').split(' ');
                if ( mules[guid].opt('chsort') === '100' ) {
                    toggleButtonClasses.push('negative');
                    toggleButtonText = 'Turn off Custom Character Sorting';
                } else {
                    toggleButtonClasses.push('positive');
                }

                return '<div class="' + toggleButtonClasses.join(' ') + '" style="padding: 5px 7px; margin-bottom: 14px; width: 225px;">' + toggleButtonText + '</div>';

            }

            var content = $('<div>');
            setuptools.lightbox.build('muledump-charsort', ' \
                Welcome to the Character Sorting menu! \
                <br><br>From here you can create, select, edit, and delete custom character sorting lists. \
                <br>&nbsp;\
                <div id="toggleButton" class="flex-container" style="justify-content: flex-start;">\
                    ' + toggleButtonDraw() + '\
                </div>\
                <div style="width: 500px; display: flex; justify-content: flex-start; flex-wrap: wrap;">\
                    <input name="charsortNewList" class="setuptools mb5" placeholder="Enter New List Name ..." style="width: 45%;">\
                    <div style="width: 55%; margin-bottom: 5px; display: flex; justify-content: flex-start">\
                        <div class="muledump link createNew menuStyle menuSmall notice textCenter mr0 ml5" style="padding: 4px;">Create New List</div>\
                    </div>\
                    \
                    <select name="charsortList" class="setuptools" style="width: 45%;"> \
            ');

            lists = ( typeof setuptools.data.muledump.chsortcustom.accounts[guid] === 'object' ) ? Object.keys(setuptools.data.muledump.chsortcustom.accounts[guid].data) : [];
            if ( lists.length > 0 ) {

                for (var i in lists) {

                    if (lists.hasOwnProperty(i)) {

                        setuptools.lightbox.build('muledump-charsort', ' \
                            <option value="' + lists[i] + '" ' + ((setuptools.app.muledump.charsort.active(guid) === lists[i]) ? 'selected' : '') + '>' + lists[i] + '</option>\
                        ');

                    }

                }

            } else setuptools.lightbox.build('muledump-charsort', ' \
                <option value="">No lists created</option>\
            ');

            setuptools.lightbox.build('muledump-charsort', ' \
                    </select>\
                    <div style="width: 55%; display: flex; justify-content: center;">\
                        ' + (
                //  determine button state
                (
                    mules[guid].opt('chsort') !== '100' ||
                    (
                        mules[guid].opt('chsort') === '100' &&
                        setuptools.app.muledump.charsort.active(guid) === ''
                    )
                ) ?
                    '<div class="muledump link enableList menuStyle menuTiny positive textCenter ml5">Enable</div>' :
                    '<div class="muledump link enableList menuStyle menuTiny textCenter ml5">Disable</div>'
            ) + '\
                        <div class="muledump link editList menuStyle menuTiny notice textCenter">Edit</div>\
                        <div class="muledump link deleteList menuStyle menuTiny negative textCenter mr0">Delete</div>\
                    </div>\
                </div>\
            ');

        }
        //  character sorting gui
        else {

            goback = true;
            var list = setuptools.app.muledump.charsort.read(guid, charlist);
            var chars = [];

            //  build our list of enabled characters
            mules[guid].data.query.results.Chars.Char.filter(function(element) {
                if ( list.indexOf(element.id) > -1 ) chars.push(element);
            });

            //  sort that list
            chars.sort(function(a, b) {
                if ( list.indexOf(a.id) > -1 && list.indexOf(b.id) > -1 ) return list.indexOf(a.id) - list.indexOf(b.id);
                return Number(b.id) - Number(a.id);
            });

            //  build out list of disabled chars
            var unusedChars = [];
            mules[guid].data.query.results.Chars.Char.filter(function (element) {
                if (list.indexOf(element.id) === -1) unusedChars.push(element);
            });

            //  sort that list
            unusedChars.sort(setuptools.app.muledump.charsort.sort);

            //  join both lists
            chars = chars.concat(unusedChars);
            chars = setuptools.app.muledump.charsort.disabled(guid, list, chars);

            var portraits = {};
            var portraitHtml = '';
            for ( var cid in chars ) {

                if ( chars.hasOwnProperty(cid) ) {

                    portraits[chars[cid].id] = setuptools.app.muledump.drawPortrait(chars[cid]);
                    portraitHtml += '<div class="cell charsort ' + ( ( list.indexOf(chars[cid].id) > -1 ) ? 'enabled' : '') + '" data-charid="' + chars[cid].id + '">' + portraits[chars[cid].id].html() + '</div>';

                }

            }

            setuptools.lightbox.build('muledump-charsort', ' \
                <div id="charField" class="charField flex-container noFlexAutoWidth scrollbar">' + portraitHtml + '</div> \
                <div class="flex-container charField expansion" title="Expand">&#9898;&#9898;&#9898;</div>\
                <div class="flex-container" style="justify-content: space-between;">\
                    <ol style="margin: 0;">\
                        <li>Shift+Click characters to enable or disable them</li> \
                        <li>Click and drag enabled characters to sort them</li>\
                        <li>Changes save automatically when you close the UI</li> \
                    </ol>\
                    <div style="display: flex; flex-flow: column;">\
                        <div><strong>Disabled Characters Sort Mode</strong></div>\
                        <select class="setuptools" name="chsortmode">\
                            <option value="0" ' + ( (setuptools.data.muledump.chsortcustom.sort === 0) ? 'selected' : '' ) + '>Sort by ID</option> \
                            <option value="1" ' + ( (setuptools.data.muledump.chsortcustom.sort === 1) ? 'selected' : '' ) + '>Sort by Fame</option> \
                            <option value="2" ' + ( (setuptools.data.muledump.chsortcustom.sort === 2) ? 'selected' : '' ) + '>Sort by Total Fame</option> \
                            <option value="3" ' + ( (setuptools.data.muledump.chsortcustom.sort === 3) ? 'selected' : '' ) + '>Sort by Class, then Fame</option> \
                        </select>\
                        <div>&nbsp;<br><strong>Disabled Characters Display Mode</strong></div>\
                        <select class="setuptools" name="chsortdisabledmode">\
                            <option value="0" ' + ( (setuptools.data.muledump.chsortcustom.disabledmode === false) ? 'selected' : '' ) + '>Off</option> \
                            <option value="1" ' + ( (setuptools.data.muledump.chsortcustom.disabledmode === true) ? 'selected' : '' ) + '>On</option> \
                        </select>\
                    </div>\
                </div>\
            ');

        }

    }
    //  single-character accounts have an object here
    else if (
        typeof mules[guid] === 'object' &&
        typeof mules[guid].data === 'object' &&
        !Array.isArray(mules[guid].data.query.results.Chars.Char)
    ) {

        variant = '';
        setuptools.lightbox.build('muledump-charsort', ' \
            This feature can only be utilized by accounts with multiple characters.\
        ');

    }
    //  of course, if there's no guid they she be told that
    else if ( typeof guid !== 'undefined' ) {

        setuptools.lightbox.build('muledump-charsort', 'Invalid GUID specified: ' + guid);

    } else {

        setuptools.lightbox.build('muledump-charsort', 'Invalid request arguments');

    }

    setuptools.lightbox.settitle('muledump-charsort', title);
    setuptools.lightbox.drawhelp('muledump-charsort', 'docs/setuptools/help/charsort.md', 'Character Sorting Help');
    if ( goback === true ) setuptools.lightbox.goback('muledump-charsort', function() {
        setuptools.app.muledump.charsort.menu(guid);
    });
    setuptools.lightbox.display('muledump-charsort', {
        variant: variant,
        afterClose: function() {
            setuptools.app.muledump.charsort.save(function() {
                mules[guid].query(false, true);
            });
        }
    });

    //  create new list and open it in the editor
    $('div.muledump.link.createNew').on('click.charsort.createnew', function() {

        var name = $('input[name="charsortNewList"]').val();
        if ( typeof name !== 'string' || name.length < 1 ) return;
        setuptools.app.muledump.charsort.create(guid, name);
        setuptools.app.muledump.charsort.menu(guid, name);

    });

    //  create new list and open it in the editor
    $('div.muledump.link.deleteList').on('click.charsort.deleteList', function() {

        var name = $('select[name="charsortList"]').val();
        if ( typeof name !== 'string' || name.length < 1 ) return;
        setuptools.app.muledump.charsort.delete(guid, name);
        setuptools.app.config.save('Muledump/Charsort deleted a list', true);
        setuptools.app.muledump.charsort.menu(guid);

    });

    //  change character sorting mode for disabled chars
    $('select[name="chsortmode"]').on('change.chsortmode', function() {

        var value = Number($(this).val());
        if ( value > -1 && value <= 3 ) setuptools.data.muledump.chsortcustom.sort = value;
        setuptools.app.muledump.charsort.unsaved = true;
        if ( setuptools.data.muledump.chsortcustom.disabledmode === true ) setuptools.app.muledump.charsort.menu(guid, charlist);

    });

    //  change character disabled display mode for disabled chars
    $('select[name="chsortdisabledmode"]').on('change.chsortdisabledmode', function() {

        setuptools.data.muledump.chsortcustom.disabledmode = ( $(this).val() === "1" );
        setuptools.app.muledump.charsort.unsaved = true;
        setuptools.app.muledump.charsort.menu(guid, charlist);

    });

    //  toggle character enable/disable state
    //  did it this way so I can offer alternative bindings later on
    function charsortCellToggle(e, force) {

        if ( setuptools.app.muledump.keys('shift', e) === false && force !== true ) return;
        var charid = $(this).attr('data-charid');
        if ( typeof charid !== 'string' ) return;
        var state = !( $(this).hasClass('enabled') );
        if ( state === true ) {

            setuptools.app.muledump.charsort.add(guid, charlist, charid, $(this).index());
            $(this).addClass('enabled');

        } else {

            setuptools.app.muledump.charsort.remove(guid, charlist, charid);
            $(this).removeClass('enabled');

        }

    }

    $('div.charsort.cell').on('click.charsort.toggleEnable', charsortCellToggle);

    //  bind character click/drag sorting
    setuptools.tmp.itemSortDragging = new Muledump_Dragging({
        target: ['charsort', 'cell'],
        targetattr: 'data-charid',
        approach: 0.4,
        callbacks: {
            during_drag: function(parent, self) {

                //  validate the source and target
                if ( typeof self.attr('data-charid') !== 'string' ) return false;
                if ( !parent.CharList ) parent.CharList = setuptools.app.muledump.charsort.read(guid, charlist);
                parent.srcIndex = parent.CharList.indexOf(self.attr('data-charid'));
                parent.destIndex = parent.CharList.indexOf(parent.target);
                if ( parent.srcIndex === -1 || parent.destIndex === -1 || self.attr('data-charid') === parent.target ) return;
                return true;

            },
            after_drag: function(parent, self) {

                //  transform list
                parent.srcId = self.attr('data-charid');
                if ( parent.srcId === parent.target ) return;
                parent.CharList.splice(parent.CharList.indexOf(parent.srcId), 1);
                parent.CharList.splice((parent.CharList.indexOf(parent.target)+parent.indexModifier), 0, parent.srcId);
                setuptools.app.muledump.charsort.set(guid, charlist, parent.CharList);

            }
        }
    });

    //  bind character sorting display expansion
    setuptools.lightbox.expander('#charField', '.charField.expansion');

    //  bind edit list button
    $('div.muledump.link.editList').on('click.edit.list', function() {

        var name = $('select[name="charsortList"]').val();
        if ( typeof name !== 'string' || name.length < 1 ) return;
        setuptools.app.muledump.charsort.menu(guid, name);

    });

    //  toggle state of charsort option
    $('div.muledump.link.toggleEnabled').on('click.toggle.state', function() {

        var state = ( $(this).hasClass('positive') );
        var list = $('select[name="charsortList"]').val();
        if ( typeof list !== 'string' || list.length < 1 ) return;
        if ( state === true ) {

            $(this).removeClass('positive').addClass('negative').text('Turn off Custom Character Sorting');

            if (
                setuptools.app.muledump.charsort.active(guid) === list
            ) $('div.muledump.link.enableList').removeClass('positive').text('Disable');

            setuptools.app.muledump.charsort.active(guid, true);

        } else {

            $(this).removeClass('negative').addClass('positive').text('Turn on Custom Character Sorting');
            $('div.muledump.link.enableList').addClass('positive').text('Enable');
            setuptools.app.muledump.charsort.active(guid, false);

        }

    });

    //  bind character sorting list selection menu
    $('select[name="charsortList"]').on('change.charsortList', function() {

        var list = $(this).val();
        if ( typeof list !== 'string' || list.length < 1 ) return;
        if (
            options_get('chsort', guid) === '100' &&
            setuptools.app.muledump.charsort.active(guid) === list
        ) {
            $('div.muledump.link.enableList').removeClass('positive').text('Disable');
        } else $('div.muledump.link.enableList').addClass('positive').text('Enable');

    });

    //  toggle state of lists
    $('div.muledump.link.enableList').on('click.toggle.list', function() {

        var list = $('select[name="charsortList"]').val();
        var state = ( $(this).hasClass('positive') );
        if ( typeof list !== 'string' || list.length < 1 ) return;

        if ( state === true ) {
            $(this).removeClass('positive').text('Disable');
            $('div.muledump.link.enableList').removeClass('positive').text('Disable');
            setuptools.app.muledump.charsort.active(guid, list);
        } else {
            $(this).addClass('positive').text('Enable');
            setuptools.app.muledump.charsort.active(guid, '');
        }

    });

};

/**
 * @function
 * @param {array} CustomList
 * @param {object} mule
 * @returns {{FinalList: Array, RemovedList: Array}}
 * Chsort v1 - Deduplicate and validate custom character id list
 */
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

/**
 * @function
 * @param {object} mule
 * Chsort v1 - Assist the user in creating a custom sort list
 */
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
                    <option value="' + i + '" ' + ( (setuptools.app.muledump.charsort.active(this.guid) === i) ? 'selected' : '' ) + '>' + i + '</option> \
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
