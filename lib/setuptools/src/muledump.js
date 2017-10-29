//
//  settings and things inside muledump / separate from mainland setuptools
//

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
            <a href="#" class="setuptools app muledump save list nomargin" style="float: left; clear: left;">Save List</a> \
            <a href="#" class="setuptools app muledump save delete nomargin destroy action noclose" style="float: right; clear: right;">Delete List</a> \
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

    $('.setuptools.app.muledump.save.delete').click(function() {

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
        setuptools.app.config.save();

        //  update the form
        $('select[name="chsortExisting"] option[value="' + chsortId + '"]').remove();
        if ( typeof newChsortId === 'string' ) {

            $('select[name="chsortExisting"] option[value="' + newChsortId + '"]').prop('selected', 'selected');
            $('input[name="chsortListName"]').val(newChsortId);
            $('input[name="chsortcustom"]').val(setuptools.data.muledump.chsortcustom.accounts[mule.guid].data[newChsortId].join(', '));

        }

    });

    //  save changes to a list or new list
    $('.setuptools.app.muledump.save.list').click(function() {

        var UserListName = $('input[name="chsortListName"]').val();
        var UserInput = $('input[name="chsortcustom"]').val();
        var Lists = false;
        if ( UserInput.length > 0 ) Lists = setuptools.app.muledump.chsortcustomDedupAndValidate(UserInput, mule);
        var SaveState = false;

        //  save the list if it's at least 1 long
        if ( typeof Lists === 'object' && Lists.FinalList.length > 0 ) {

            setuptools.data.muledump.chsortcustom.accounts[mule.guid].active = UserListName;
            setuptools.data.muledump.chsortcustom.accounts[mule.guid].data[UserListName] = $.extend(true, [], Lists.FinalList);
            SaveState = setuptools.app.config.save();
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
