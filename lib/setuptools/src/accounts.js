//  first time setup walk-through
setuptools.app.accounts.start = function() {

    setuptools.lightbox.build('accounts-start', '<span>Do you have <a href="#" class="setuptools initsetup page2">one or a few accounts</a> or <a href="#" class="setuptools initsetup page3">many accounts</a>?</span>');
    setuptools.lightbox.goback('accounts-start', setuptools.app.index);
    setuptools.lightbox.drawhelp('accounts-start', 'docs/setuptools/help/accounts-manager/index', 'Account Setup Help');
    setuptools.lightbox.display('accounts-start');
    $('.setuptools.initsetup.page2').click(setuptools.app.accounts.manager);
    $('.setuptools.initsetup.page3').click(setuptools.app.accounts.massImport);

};

//  manual input of account data
setuptools.app.accounts.manager = function() {

    //  initialize our temporary storage
    uAFresh = false;
    if ( !setuptools.tmp.userAccounts ) {

        uAFresh = true;
        setuptools.tmp.userAccounts = {};

    }

    //  create a user account row and populate it if necessary
    var rowId = Number(0);
    function createRow(username, password, enabled) {

        rowId = Number(rowId)+Number(1);

        if ( !username ) username = '';
        if ( !password ) password = '';
        if ( username === '' && password === '' ) enabled = true;
        if ( typeof setuptools.tmp.userAccounts['row-' + rowId] === 'undefined' ) setuptools.tmp.userAccounts['row-' + rowId] = {username: username, password: password};
        if ( typeof setuptools.tmp.userAccounts['row-' + rowId].enabled === 'undefined' ) setuptools.tmp.userAccounts['row-' + rowId].enabled = true;
        if ( typeof enabled === 'boolean' || typeof enabled === 'undefined  ' ) setuptools.tmp.userAccounts['row-' + rowId].enabled = enabled;
        var checkboxData = (enabled === true) ? 'checked value="Yes"' : 'value="No"';
        $('.setuptools.app.initsetup.container').append(' \
            <div class="setuptools app initsetup accounts" id="row-' + rowId + '"> \
                <input name="enabled" type="checkbox" ' + checkboxData + ' title="Account Enabled"> \
                <input name="username" value="' + username + '"> \
                <input name="password" type="password" value="' + password + '"> \
                ' + ( (username != '' || password != '') ? '<div class="remove controller" rowId="row-' + rowId + '">-</div>' : '<div class="add controller" rowId="row-' + rowId + '">+</div>' ) + ' \
                <div class="reveal controller" rowId="row-' + rowId + '" state="reveal">&#9679;</div> \
            </div> \
        ');
        $('#row-' + rowId + ' input[name="username"]').focus();

        bindAdd();
        bindChange();
        if ( username != '' || password != '' ) bindRemove();

    }

    //  bind the row remove button
    function bindRemove() {

        //  unbind first to register new elements
        $('.setuptools.app.initsetup.accounts .remove').unbind('click');
        $('.setuptools.app.initsetup.accounts .remove').click(function() {

            RemoveRowId = $(this).attr('rowId');
            $('#' + RemoveRowId).remove();
            delete setuptools.tmp.userAccounts[RemoveRowId];

        });

    }

    //  bind the row add button (implies bindReveal)
    function bindAdd() {

        bindReveal();
        $('.setuptools.app.initsetup.accounts .add').click(function() {

            $(this).removeClass('add').addClass('remove').html('-');
            $(this).unbind('click');
            createRow();
            bindRemove();
            bindReveal();

        })

    }

    //  bind the password reveal button
    function bindReveal() {

        $('.setuptools.app.initsetup.accounts .reveal').unbind('click');
        $('.setuptools.app.initsetup.accounts .reveal').click(function() {
            state = $(this).attr('state');
            var rowId = $(this).attr('rowId');
            if ( state === 'reveal' ) {
                input = $('#' + rowId + ' input:nth-child(3)');
                newinput = $('<input name="password">').val(input.val()).insertBefore(input);
                input.remove();
                $(this).attr('state', 'hide');
            } else {
                input = $('#' + rowId + ' input:nth-child(3)');
                newinput = $('<input name="password" type="password">').val(input.val()).insertBefore(input);
                input.remove();
                $(this).attr('state', 'reveal');
            }

            //  we have to rebind changes to pick up the new element
            bindChange();

        });

    }

    //  capture and record changes
    function bindChange() {

        $('.setuptools.app.initsetup.accounts input[name!="checkAll"]').unbind('change');
        $('.setuptools.app.initsetup.accounts input[name!="checkAll"]').change(function(e) {

            var rowId = $(this).parent().attr('id');
            var iam = $(this).attr('name');
            if (iam === 'enabled') {
                setuptools.tmp.userAccounts[rowId][iam] = $(this).prop("checked");
            } else setuptools.tmp.userAccounts[rowId][iam] = $(this).val();

        });

    }

    //  build our lightbox data
    setuptools.lightbox.build('accounts-manager', ' \
        Enter your account information in the lines below. Click the + to add more accounts.<br><br>\
        <div class="setuptools app initsetup container"> \
            <div class="setuptools app initsetup accounts"> \
                <input type="checkbox" name="checkAll" checked title="Disable All Accounts"> \
                <div style="font-weight: bold">Account Email or ID</div> \
                <div style="font-weight: bold">Account Password</div> \
            </div> \
        </div> \
        <div style="float: left; width: 100%;"> \
            <br> <a href="#" class="setuptools app initsetup save" style="float: right; clear: right;">Save Accounts</a> \
            <a href="#" class="setuptools app import save" style="float: left; clear: left;">Import Accounts.js</a> \
            ' + ( ( setuptools.state.loaded === true ) ? '<br><a href="#" class="setuptools app export accountsjs save" style="margin-top: 10px; float: left; clear: left;">Export Accounts.js</a>' : '' ) + ' \
            ' + ( ( setuptools.state.loaded === true ) ? '<br><a href="#" class="setuptools app export deepCopy save" style="margin-top: 10px; float: left; clear: left;">Export Deep Copy</a>' : '' ) + ' \
        </div> \
    ');

    setuptools.lightbox.override('accounts-accountsjs-index', 'goback', setuptools.app.accounts.manager);
    setuptools.lightbox.goback('accounts-manager', ( setuptools.state.firsttime === true ) ? setuptools.app.accounts.start : setuptools.app.index);
    setuptools.lightbox.drawhelp('accounts-manager', 'docs/setuptools/help/accounts-manager/users', 'Account Setup Help');
    setuptools.lightbox.settitle('accounts-manager', 'Muledump Accounts Manager');
    setuptools.lightbox.display('accounts-manager');

    //  load any known accounts
    if ( uAFresh === true ) {

        //  this could for format 0 or 1 depending on if the user went back or not
        var accountConfig = ( setuptools.app.config.validateFormat(setuptools.data.accounts, 0) === true ) ?
            $.extend(true, {}, setuptools.data.accounts) :
            setuptools.app.config.convert(setuptools.data.accounts, 0, undefined, true);

        //  on fresh loads we will attempt to populate from accounts.js
        for ( var i in accountConfig )
            if (accountConfig.hasOwnProperty(i))
                createRow(i, accountConfig[i], (setuptools.app.config.determineFormat(setuptools.data.accounts) === 1) ? setuptools.data.accounts.accounts[i].enabled : true);

    } else {

        //  on return visits we'll just load what's in the cache
        for (var i in setuptools.tmp.userAccounts)
            if (setuptools.tmp.userAccounts.hasOwnProperty(i))
                if ( setuptools.tmp.userAccounts[i].username.length > 0 || setuptools.tmp.userAccounts[i].password.length > 0 )
                    createRow(setuptools.tmp.userAccounts[i].username, setuptools.tmp.userAccounts[i].password, setuptools.tmp.userAccounts[i].enabled);

    }

    //  make a fresh and empty row
    createRow();

    //  bind the save button
    $('.setuptools.app.initsetup.save').click(setuptools.app.accounts.save);
    $('.setuptools.app.import.save').click(setuptools.app.accounts.AccountsJSImport);
    $('.setuptools.app.export.accountsjs.save').click(setuptools.app.accounts.AccountsJSExport);
    $('.setuptools.app.export.deepCopy.save').click(setuptools.app.accounts.ExportDeepCopy);

    //  react to check all box
    $('input[name="checkAll"]').change(function() {

        var CheckState = $(this).prop('checked');
        for ( var row in setuptools.tmp.userAccounts )
            if ( setuptools.tmp.userAccounts.hasOwnProperty(row) ) {

                setuptools.tmp.userAccounts[row].enabled = CheckState;
                $('#' + row + ' input[name="enabled"]').prop('checked', CheckState);
                if ( CheckState === false ) $('input[name="checkAll"]').attr('title', 'Enable All Accounts');
                if ( CheckState === true ) $('input[name="checkAll"]').attr('title', 'Disable All Accounts');

            }

    });

};

//  export a deep copy of user data
setuptools.app.accounts.ExportDeepCopy = function() {

    setuptools.lightbox.build('accounts-deepcopy', ' \
        <strong>Accounts Available for Deep Copy</strong> \
        <div class="setuptools app export deepCopy" style="word-break: keep-all; word-wrap: initial;"> \
    ');

    var AccountList = setuptools.app.config.convert(setuptools.data.accounts, 0);
    var AccountListHTML = '';
    var TempData = '';
    var LineCount = 0;
    for ( var i in AccountList )
        if ( AccountList.hasOwnProperty(i) )
            if ( TempData = setuptools.storage.read('muledump:' + i, true) ) {

                //  we line break every 5th account
                if ( LineCount === 4 ) {
                    AccountListHTML = AccountListHTML.substr(0, AccountListHTML.length-3);
                    AccountListHTML += '<br> ';
                    LineCount = 0;
                }

                AccountListHTML += '<a href="#" class="setuptools app export deepCopy select">' + i + '</a> | ';
                LineCount++;

            }
    AccountListHTML = AccountListHTML.substr(0, AccountListHTML.length-3);

    setuptools.lightbox.build('accounts-deepcopy', '</div>');
    setuptools.lightbox.build('accounts-deepcopy', AccountListHTML);
    setuptools.lightbox.settitle('accounts-deepcopy', 'Export Deep Copy');
    setuptools.lightbox.goback('accounts-deepcopy', setuptools.app.accounts.manager);
    setuptools.lightbox.display('accounts-deepcopy');

    //  generate download
    $('.setuptools.app.export.deepCopy.select').click(function() {

        var guid = $(this).text();
        var DeepCopyData = JSON.stringify(JSON.parse(setuptools.storage.read('muledump:' + guid, true)), null, 5);
        var date = new Date();
        var FileName = 'deep-copy-' + guid + '-' +
            date.getFullYear() +
            ('0' + (Number(date.getMonth())+1)).slice(-2) +
            ('0' + date.getDate()).slice(-2) + '-' +
            ('0' + date.getHours()).slice(-2) +
            ('0' + date.getMinutes()).slice(-2) +
            ('0' + date.getSeconds()).slice(-2);

        setuptools.lightbox.build('accounts-deepcopy-download', ' \
            Deep Copy for ' + guid + ' is ready for download. \
            <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
            <br><br><a download="' + FileName + '.json" href="data:text/json;base64,' + btoa(DeepCopyData) + '" class="setuptools config download noclose">Download Deep Copy</a> \
        ');

        setuptools.lightbox.settitle('accounts-deepcopy-download', 'Deep Copy Download');
        setuptools.lightbox.goback('accounts-deepcopy-download', setuptools.app.accounts.ExportDeepCopy);
        setuptools.lightbox.display('accounts-deepcopy-download');
        setuptools.app.config.downloadAck();

    });


};

//  pasting a list that is well-formatted
setuptools.app.accounts.massImport = function() {

    setuptools.lightbox.build('accounts-massImport', 'Sounds good! Let\'s gather some information.');
    setuptools.lightbox.goback('accounts-massImport', setuptools.app.accounts.start);
    setuptools.lightbox.drawhelp('accounts-massImport', 'docs/setuptools/help/accounts-manager/mass-import', 'Advanced Import Help');
    setuptools.lightbox.display('accounts-massImport');

};

//  process supplied accounts from page2
setuptools.app.accounts.save = function() {

    //  remove existing accounts object;
    if ( setuptools.app.config.validateFormat(setuptools.data.accounts, 0) === true ) {

        setuptools.data.accounts = {};

    } else {

        setuptools.data.accounts.accounts = {};

    }

    //  scan the supplied user accounts and remove bad entries
    var badEntries = [];
    for ( var i in setuptools.tmp.userAccounts )
        if ( setuptools.tmp.userAccounts.hasOwnProperty(i) ) {

            var username = setuptools.tmp.userAccounts[i].username;
            var password = setuptools.tmp.userAccounts[i].password;
            var enabled = setuptools.tmp.userAccounts[i].enabled;

            //  if either is provided and the other is empty then this is a bad record
            if ( (username === '' || password === '') && !(username === '' && password === '') ) {

                badEntries.push(setuptools.tmp.userAccounts[i]);

            } else {

                //  if neither are provided then it can be ignored
                if ( username.length > 0 && password.length > 0 ) {

                    //  if a username is provided we should validate it's contents a bit
                    if ( username.length > 0 ) {

                        //  is it an email address, steam, kongregate, or kabam?
                        if ( username.match(setuptools.config.regex.email) || username.match(setuptools.config.regex.guid) ) {

                            //  create the user account in the accounts object
                            setuptools.app.config.createUser(username, password, enabled, 0, false, 'set', setuptools.app.config.determineFormat(setuptools.data.accounts));

                        } else badEntries.push(setuptools.tmp.userAccounts[i]);

                    }

                }

            }

        }

    //  no good entries means this is a bust; give the user the opportunity to go back and try again
    var accountConfig = ( setuptools.app.config.validateFormat(setuptools.data.accounts, 0) === true ) ? setuptools.data.accounts : setuptools.data.accounts.accounts;
    if ( Object.keys(accountConfig).length === 0 ) {

        delete setuptools.tmp.userAccounts;
        setuptools.lightbox.build('accounts-save', ' \
            Oops, there was a problem. You did not provide any valid user accounts. \
            <br><br>Did you make sure to provide both a username and password? \
            <br><br> \
        ');

    } else {

        setuptools.lightbox.build('accounts-save', 'Your changes have been saved. \
        <br><br>It is recommended you download <a href="#" class="setuptools config backup">a backup</a> of your Muledump configuration. \
            <br><br>If you are ready, you may now proceed to <a href="#" class="setuptools app loadaccounts">Muledump</a>. \
        ');

        if ( badEntries.length > 0 ) setuptools.lightbox.build('accounts-save', '<br><br>Warning: ' + badEntries.length + ' supplied accounts was invalid. You may go back and try again if you wish.');

        //  convert traditional accounts.js format to setuptools format

        //  if the config is currently format 0 we need to convert to format 1
        if ( setuptools.app.config.validateFormat(setuptools.data.accounts, 0) === true ) setuptools.data.accounts = setuptools.app.config.convert(setuptools.data.accounts, 1);

        //  save the configuration
        setuptools.data.config.enabled = true;
        var saveResult = setuptools.app.config.save();
        window.techlog('SetupTools/Saving configuration');

    }

    //  display the box
    setuptools.lightbox.goback('accounts-save', setuptools.app.accounts.manager);
    setuptools.lightbox.drawhelp('accounts-save', 'docs/setuptools/help/new-user-setup', 'Welcome to Muledump!');
    setuptools.lightbox.display('accounts-save', {variant: 'setuptools-medium'});
    $('.setuptools.app.loadaccounts').click(function() {
        location.reload();
    });
    $('.setuptools.config.backup').click(setuptools.app.backups.create);

    if ( saveResult === false ) setuptools.app.config.saveError();

    //  aaaand we're done

};

//  export setuptools accounts to accounts.js file
setuptools.app.accounts.AccountsJSExport = function() {

    var AccountsJSData = setuptools.app.config.generateAccountsJS();
    setuptools.lightbox.build('accounts-accountsjs-export', ' \
        An accounts.js file has been created for you. \
        <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
        <br><br><a download="accounts.js" href="data:text/javascript;base64,' + AccountsJSData + '" class="setuptools export accountsjs noclose">Download Backup</a> \
    ');

    //  display the download box
    setuptools.lightbox.goback('accounts-accountsjs-export', setuptools.app.accounts.manager);
    setuptools.lightbox.settitle('accounts-accountsjs-export', 'Accounts.js Export');
    setuptools.lightbox.display('accounts-accountsjs-export');
    if ( AccountsJSData ) setuptools.app.config.downloadAck();

};

//  assist in account.js import for first-time users
setuptools.app.accounts.AccountsJSImport =  function() {

    setuptools.lightbox.build('accounts-accountsjs-index', ' \
        There are two ways you can import your accounts.js file. \
        <br><br>If there is an accounts.js in the Muledump folder it can be imported; otherwise, you can upload and import from your computer. \
        <br><br>First Step - \
        ' + ( (setuptools.data.config.enabled === true) ? '<a href="#" class="setuptools app enable noclose">SetupTools Enabled</a>' : '<a href="#" class="setuptools app enable noclose">Enable SetupTools</a>' ) + ' \
        <br><br> \
    ');

    if ( Object.keys(setuptools.originalAccountsJS).length > 0 ) setuptools.lightbox.build('accounts-accountsjs-index', ' \
        Import a <a href="#" class="setuptools app import accountsJS noclose">Local Accounts.js</a> or \
    ');

    //  intercept and send straight to upload page if local isn't available
    if ( setuptools.data.config.enabled === true && Object.keys(setuptools.originalAccountsJS).length === 0 ) {
        setuptools.app.accounts.AccountsJSImportUpload();
        return;
    }

    setuptools.lightbox.build('accounts-accountsjs-index', '<a href="#" class="setuptools app import upload noclose">Upload an Accounts.js</a>');
    setuptools.lightbox.goback('accounts-accountsjs-index', setuptools.app.index);
    setuptools.lightbox.drawhelp('accounts-accountsjs-index', 'docs/setuptools/help/accounts-manager/accountsjs-import', 'Accounts.js Import Help');
    setuptools.lightbox.settitle('accounts-accountsjs-index', 'Accounts.js Import');
    if ( setuptools.state.loaded === false ) setuptools.lightbox.override('accounts-accountsjs-import', 'goback', setuptools.app.accounts.manager);
    if ( setuptools.state.loaded === false ) setuptools.lightbox.override('accounts-accountsjs-upload', 'goback', setuptools.app.accounts.manager);
    setuptools.lightbox.display('accounts-accountsjs-index', {variant: 'setuptools-small'});

    if ( setuptools.data.config.enabled === false ) {

        $('.setuptools.app.enable').click(function () {
            setuptools.data.config.enabled = true;
            $(this).unbind('click').css({'pointer-events': 'none', 'cursor': 'default'}).text('SetupTools Enabled');
            $('.setuptools.app.import').removeClass('noclose');
            $('.setuptools.app.import.accountsJS').click(setuptools.app.accounts.AccountsJSImportLocal);
            $('.setuptools.app.import.upload').click(setuptools.app.accounts.AccountsJSImportUpload);
        });

    } else {

        $('.setuptools.app.enable').unbind('click').css({'pointer-events': 'none', 'cursor': 'default'}).text('SetupTools Enabled');
        $('.setuptools.app.import').removeClass('noclose');
        $('.setuptools.app.import.accountsJS').click(setuptools.app.accounts.AccountsJSImportLocal);
        $('.setuptools.app.import.upload').click(setuptools.app.accounts.AccountsJSImportUpload);

    }

};

//  import accounts.js from existing accounts.js file in folder
setuptools.app.accounts.AccountsJSImportLocal = function() {

    FoundKeys = Object.keys(setuptools.originalAccountsJS).length;
    if ( FoundKeys > 0 ) {

        setuptools.lightbox.build('accounts-accountsjs-import', ' \
            Proceed with import of ' + FoundKeys + ' located accounts in Accounts.js? \
            <br><br><a href="#" class="setuptools app initsetup importConfirmed">Review Import</a> or <a href="#" class="setuptools app initsetup importCancelled">Cancel</a> \
            <br><br><input type="checkbox" name="accountjsMerge" checked> Merge with any existing accounts \
        ');
        setuptools.lightbox.goback('accounts-accountsjs-import', setuptools.app.accounts.start);

    } else {

        setuptools.lightbox.build('accounts-accountsjs-import', ' \
            Could not locate any accounts in accounts.js. \
        ');
        setuptools.lightbox.goback('accounts-accountsjs-import', setuptools.app.index);

    }

    if ( setuptools.state.firsttime === false ) setuptools.lightbox.override('accounts-manager', 'goback', setuptools.app.accounts.AccountsJSImportLocal);
    setuptools.lightbox.drawhelp('accounts-accountsjs-import', 'docs/setuptools/help/accounts-manager/accountsjs-import', 'Accounts.js Import Help');
    setuptools.lightbox.settitle('accounts-accountsjs-import', 'Accounts.js Import');
    setuptools.lightbox.display('accounts-accountsjs-import');

    $('.setuptools.app.initsetup.importCancelled').click(setuptools.app.accounts.manager);
    $('.setuptools.app.initsetup.importConfirmed').click(function() {

        //  this click implies setuptools should be enabled
        setuptools.data.config.enabled = true;

        if ( typeof setuptools.tmp.userAccounts === 'undefined' ) setuptools.tmp.userAccounts = {};
        var x = Number(Object.keys(setuptools.tmp.userAccounts).length);
        if ( $('input[name="accountjsMerge"]').prop('checked') === false ) {

            setuptools.tmp.userAccounts = {};
            x = Number(0);

        }

        //  create our temporary user object from located accounts.js data
        for ( var i in setuptools.originalAccountsJS ) {

            if (setuptools.originalAccountsJS.hasOwnProperty(i)) {

                //  if the account already exists then just update then update the password only
                var FoundPos = false;
                for ( var row in setuptools.tmp.userAccounts ) {

                    if ( setuptools.tmp.userAccounts.hasOwnProperty(row) ) {

                        if ( setuptools.tmp.userAccounts[row].username === i ) {

                            FoundPos = row;
                            break;

                        }

                    }

                }

                if ( FoundPos != false ) {

                    setuptools.tmp.userAccounts[FoundPos].password = setuptools.originalAccountsJS[i];

                } else {

                    setuptools.tmp.userAccounts['row-' + x] = {username: i, password: setuptools.originalAccountsJS[i], enabled: true};
                    x++;

                }

            }

        }

        //  load settings from accounts.js
        if ( window.rowlength ) setuptools.data.config.rowlength = window.rowlength;
        if ( window.testing ) setuptools.data.config.testing = window.testing;
        if ( window.prices ) setuptools.data.config.prices = window.prices;
        if ( window.mulelogin ) setuptools.data.config.mulelogin = window.mulelogin;
        if ( window.accountLoadDelay ) setuptools.data.config.accountLoadDelay = window.accountLoadDelay;
        if ( window.debugging ) setuptools.data.config.debugging = window.debugging;

        //  send user back to review screen
        setuptools.app.accounts.manager();

    });

};

//  import accounts.js from a user-uploaded file
setuptools.app.accounts.AccountsJSImportUpload = function(manual) {

    //  parse the user-submitted file for accounts and settings
    function ParseUploadedFile(FileContents) {

        var UploadParse = {accounts: {}, settings: {}};
        var UploadFile = FileContents.split(/\r?\n/);
        for ( i = 0; i < UploadFile.length; i++ ) {

            if ( matches = UploadFile[i].match(setuptools.config.regex.accountsJS) ) {

                //  variables occupy matches[1] and matches[2]
                if ( typeof matches[3] === 'undefined' && typeof matches[4] === 'undefined' ) {

                    UploadParse.settings[matches[1]] = matches[2];
                    if ( matches[2].match(/^(true|false)$/) ) UploadParse.settings[matches[1]] = (matches[2] == 'true');
                    if ( matches[2].match(/^([0-9]*?)$/) ) UploadParse.settings[matches[1]] = Number(matches[2]);

                }

                //  accounts occupy matches[3] and matches[4]
                if ( typeof matches[1] === 'undefined' && typeof matches[2] === 'undefined' ) {

                    UploadParse.accounts[matches[3]] = matches[4];

                }

            }

        }

        $('.setuptools.app.initsetup.uploadResults').html('Found ' + Object.keys(UploadParse.accounts).length + ' accounts and ' + Object.keys(UploadParse.settings).length + ' settings');
        if ( Object.keys(UploadParse.accounts).length > 0 ) {
            $('.setuptools.app.initsetup.uploadData.save').removeClass('noclose');
        } else {
            $('.setuptools.app.initsetup.uploadData.save').addClass('noclose');
        }

        //  ready for final click
        $('.setuptools.app.initsetup.uploadData.save').html('Review Import').click(function () {

            if ( Object.keys(UploadParse.accounts).length > 0 ) {

                //  load settings into configuration
                for ( var i in UploadParse.settings )
                    if ( UploadParse.settings.hasOwnProperty(i) )
                        setuptools.data.config[i] = UploadParse.settings[i];

                //  load accounts into configuration
                if ( typeof setuptools.tmp.userAccounts === 'undefined' ) setuptools.tmp.userAccounts = {};
                var x = Object.keys(setuptools.tmp.userAccounts).length;

                for ( var i in UploadParse.accounts ) {

                    if (UploadParse.accounts.hasOwnProperty(i)) {

                        //  if the account already exists then just update then update the password only
                        var FoundPos = false;
                        for (var row in setuptools.tmp.userAccounts) {

                            if (setuptools.tmp.userAccounts.hasOwnProperty(row)) {

                                if (setuptools.tmp.userAccounts[row].username === i) {

                                    FoundPos = row;
                                    break;

                                }

                            }

                        }

                        if (FoundPos != false) {

                            setuptools.tmp.userAccounts[FoundPos].password = UploadParse.accounts[i];

                        } else {

                            setuptools.tmp.userAccounts['row-' + x] = {
                                username: i,
                                password: UploadParse.accounts[i],
                                enabled: true
                            };
                            x++;

                        }

                    }

                }

                //  goback should return here instead of the default
                if ( setuptools.state.firsttime === false ) setuptools.lightbox.override('accounts-manager', 'goback', setuptools.app.accounts.AccountsJSImportUpload, {text1: 'Go back to', text2: 'Accounts.js Import'});
                setuptools.app.accounts.manager();

            } else {

                $('.setuptools.app.initsetup.uploadResults').html('You must load a valid accounts.js first.');

            }

        });

    }

    //  setup our environment to receive the file
    var DoFiles = false;

    //  does this user support FileReader
    if ( setuptools.config.devForcePoint != 'restorejs-upload' && manual !== true && window.File && window.FileReader && window.FileList && window.Blob ) {

        setuptools.tmp.FileReaderCapable = true;
        DoFiles = true;
        setuptools.lightbox.build('accounts-accountsjs-upload', ' \
            If you have any issues switch to manual upload mode. \
            <br><br>Please select your accounts.js file. \
            <br><br><input type="file" id="files" name="files[]" class="setuptools app initsetup uploadFile" style="width: 400px;"> \
            <br> \
        ');

        //  no they do not
    } else {


        if ( typeof setuptools.tmp.FileReaderCapable === 'undefined' && manual !== true ) {

            setuptools.lightbox.build('accounts-accountsjs-upload', 'File uploads are not supported by your browser. Please instead paste the contents of the accounts.js file below.');

        } else {

            setuptools.lightbox.build('accounts-accountsjs-upload', 'Please paste the contents of the accounts.js file below.');

        }

        setuptools.lightbox.build('accounts-accountsjs-upload', ' \
            <br><br><div class="setuptools app initsetup uploadData"><textarea name="uploadData" class="setuptools scrollbar"></textarea></div> \
        ');

    }

    setuptools.lightbox.build('accounts-accountsjs-upload', ' \
        <br><div class="setuptools app initsetup uploadResults" style="margin-top: 6px; margin-bottom: 6px; float: left;"></div> \
        <a href="#" class="setuptools app initsetup uploadData save noclose" style="font-size: 14px; font-weight: bold;">Select a File</a> \
    ');

    //if ( setuptools.state.firsttime === false ) setuptools.lightbox.override('accounts-manager', 'goback', setuptools.app.accounts.AccountsJSImportUpload);
    setuptools.lightbox.drawhelp('accounts-accountsjs-upload', 'docs/setuptools/help/accounts-manager/accountsjs-upload', 'Accounts.js Upload Help');
    setuptools.lightbox.settitle('accounts-accountsjs-upload', 'Accounts.js Import');
    if ( DoFiles === false ) {
        if (manual === true) setuptools.lightbox.goback('accounts-accountsjs-upload', setuptools.app.accounts.AccountsJSImportUpload);
        if (manual !== true) setuptools.lightbox.goback('accounts-accountsjs-upload', setuptools.app.accounts.manager);
    } else setuptools.lightbox.goback('accounts-accountsjs-upload', setuptools.app.accounts.manager);
    setuptools.lightbox.display('accounts-accountsjs-upload', {variant: 'setuptools-large'});

    if ( DoFiles === true ) {

        $('.setuptools.bottom.container').append(' \
            <div style="clear: right; float: right; height: 100%; margin-top: 3px; margin-right: 5px;"> \
                <br><a href="#" class="setuptools app initsetup switchToUpload">Switch to Manual Upload</a> \
            </div> \
        ');

        $('.setuptools.app.initsetup.switchToUpload').click(function() {
            setuptools.app.accounts.AccountsJSImportUpload(true);
        });

        $('input[id="files"]').change(function(e) {

            $('.setuptools.app.initsetup.uploadData.save').html('Loading File...');
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {

                if ( reader.error ) {

                    $('.setuptools.app.initsetup.uploadData.save').html('Upload failed');
                    setuptools.lightbox.error('Failed to upload file with error: ' + reader.error, 23);

                } else {

                    ParseUploadedFile(reader.result);

                }

            }

        });

    } else {

        $('a.setuptools.app.initsetup.uploadData.save').html('Paste in File');
        $('textarea[name="uploadData"]').change(function() {

            var submitButton = $('.setuptools.app.initsetup.uploadData.save');
            submitButton.html('Loading File...');
            ParseUploadedFile($(this).val());

        });

    }

};
