//  muledump setup tools - ui-based accounts.js management

//  setuptools object layout
var setuptools = {
    error: false,
    loaded: false,
    firsttime: false,
    config: {},
    tmp: {},
    data: {
        config: {}
    },
    init: {},
    storage: {},
    app: {
        initsetup: {},
        config: {}
    },
    lightbox: {builds: {}}
};

//  setuptools configuration
setuptools.config.keyPrefix = 'muledump:setuptools:';
setuptools.config.errorColor = '#ae0000';
setuptools.config.devForcePoint = '';
setuptools.config.regex = {
    email: new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    guid: new RegExp(/^((steamworks|kongregate|kabam):[a-zA-Z0-9]*)$/i)
};

//  muledump setuptools configuration defaults
setuptools.data.config.preventAutoDownload = true;
setuptools.data.config.maximumBackupCount = 5;
setuptools.data.accounts = {};
setuptools.data.options = window.options;

//
//  storage tools
//

//  write to localStorage
setuptools.storage.write = function(key, value) {

    try {
        localStorage[setuptools.config.keyPrefix + key] = value;
    } catch(e) {
        return false;
    }

    return true;

};

//  read from localStorage
setuptools.storage.read = function(key) {

    result = '';
    try {
        result = localStorage[setuptools.config.keyPrefix + key];
    } catch (e) {}
    return result;

};

//  delete from localStorage
setuptools.storage.delete = function(key) {

    try {
        localStorage.removeItem(key);
    } catch (e) { return false; }
    return true;

};

//  check if localStorage is available
setuptools.storage.test = function() {

    //return false;
    setuptools.storage.write('test', 'test');
    if ( setuptools.storage.read('test') === 'test' ) {
        return true;
    } else return false;

};

//
//  lightbox tools
//

//  create a lightbox
setuptools.lightbox.create = function(data, config) {

    if ( typeof data === 'string' ) {

        if ( !config ) config = {};
        if ( typeof config === 'string' ) config = {variant: config};
        if ( typeof config !== 'object' ) {

            setuptools.lightbox.error('Supplied Featherlight config is invalid', 2);
            return;

        } else {

            if ( !config.variant ) config.variant = 'setuptools';
            if ( !config.openSpeed ) config.openSpeed = 0;
            if ( config.closeOnClick === undefined ) config.closeOnClick = 'anywhere';
            if ( setuptools.app.checknew() === true ) {
                config.closeOnClick = false;
                if ( typeof config.otherClose === 'undefined' ) config.otherClose = 'a.setuptools, .setuptools.error';
            }
        }

        $.featherlight(' \
            <p> \
            <h1>Muledump Setup</h1> \
            <span>' + data + '</span> \
            </p> \
        ', config);

    }

};

//  store pieces to a lightbox build
setuptools.lightbox.build = function(id, message) {

    //  create the build's array and store the message
    if ( !setuptools.lightbox.builds[id] ) setuptools.lightbox.builds[id] = [];
    setuptools.lightbox.builds[id].push(message);

};

//  display a built lightbox
setuptools.lightbox.display = function(id, config=false) {

    //  check if the build exists
    if ( !setuptools.lightbox.builds[id] ) {

        setuptools.lightbox.error('Build ID ' + id + ' does not exist.', 3);

        //  create the lightbox from the build data
    } else {

        if ( typeof config !== 'object' ) config = {};

        //  check for goback data
        gobackData = false;
        if ( setuptools.lightbox.builds[id][10000] ) {

            //  copy data, remove key, and insert message at end of build
            gobackData = setuptools.lightbox.builds[id][10000];
            setuptools.lightbox.builds[id].splice(10000, 1);
            setuptools.lightbox.builds[id].push(gobackData.message);

        }

        //  create the lightbox and delete the temporary build data
        setuptools.lightbox.create(setuptools.lightbox.builds[id].join(' '), config);
        setuptools.lightbox.builds[id].splice(0);

        //  bind any goback click
        if ( typeof gobackData === 'object' ) $('.setuptools.goback').click(function(e) { e.preventDefault(); gobackData.callback(); });

    }

};

setuptools.lightbox.goback = function(page, id) {

    //  picking an arbitrarily large number
    setuptools.lightbox.builds[id][10000] = {
        callback: page,
        message: '<div style="clear: both;"><br>Go back to the <a href="#" class="setuptools goback">previous page</a></div>'
    };

};

//  display an error message
setuptools.lightbox.error = function(message, code=0) {

    setuptools.lightbox.create(' \
        <p><span class="setuptools error">Error ' + code + '</span> - ' + message + '</p> \
        <span>See <a href="https://github.com/jakcodex/muledump/wiki/Setup+Tools" target="_blank">Setup Tools</a> in the wiki for more help.</span> \
    ');

};

//
//  application
//

//  start page for setup tools
setuptools.app.index = function(config) {

    setuptools.lightbox.build('main', 'Welcome to Muledump Account Setup Tools!');

    if ( typeof config !== 'object' ) config = {};

    //  look for a fresh configuration
    if ( setuptools.app.checknew() === true ) {

        setuptools.lightbox.build('main', ' \
            <br><br>It looks like you are new here. Setup Tools will help you get started with Muledump. Whether you\'re a new user or returning user it is easy to get up and running. \
            <br><br>New users can <a href="#" class="setuptools initsetup index">click here</a> to begin. \
            <br><br>Returning users can <a href="#" class="setuptools config restore">restore a backup</a>. \
            <br><br>Have an existing accounts.js file? You can copy it into the Muledump folder to get started. \
        ');

    } else {

        setuptools.lightbox.build('main', ' \
            <br><br>What would you like to do? \
            <br><br><a href="#" class="setuptools accounts manage">Manage your accounts</a> \
            <br><br><a href="#" class="setuptools config backup">Create a configuration backup</a> \
            <br><br><a href="#" class="setuptools config restore">Restore a backup</a> \
        ');

    }

    //  display the built lightbox and register click action
    setuptools.lightbox.display('main', $.extend(true, {}, config, {'variant': 'setuptools-small'}));
    $('.setuptools.initsetup.index').click(setuptools.app.initsetup.index);
    $('.setuptools.config.restore').click(setuptools.app.config.restore);
    $('.setuptools.config.backup').click(setuptools.app.config.backup);

};

//  check if this is a new user
setuptools.app.checknew = function() {

    //  check if a stored configuration is present
    if ( setuptools.config.devForcePoint != 'newuser' && setuptools.storage.read('configuration') ) return false;

    //  check if any other account data is present
    return (
        //  check if force point set for this position
        setuptools.config.devForcePoint === 'newuser' ||

        //  accounts object missing
        !setuptools.window.accounts ||

        //  accounts object present and in the default state
        (typeof setuptools.window.accounts === 'object' &&
        Object.keys(setuptools.window.accounts).length < 3 &&
        setuptools.window.accounts.email && setuptools.window.accounts.email2) ||

        //  accounts variable present but not an object
        typeof setuptools.window.accounts !== 'object' ||

        //  first time user detected already
        setuptools.firsttime === true
    ) ? true : false;

};

//  cleanup config backups by enforcing the maximumBackupCount setting
setuptools.app.config.cleanup = function() {

    var backups = [];

    //  find all backups in local storage
    for ( var i in localStorage ) {
        if ( localStorage.hasOwnProperty(i) ) {
            regex = new RegExp('^' + setuptools.config.keyPrefix + 'muledump-backup-([0-9]*)$');
            if ( matches = i.match(regex) ) backups.push([i, matches[1]]);
        }
    }

    //  now sort them by date in descending order
    backups.sort(function(a, b) {
        return a[1] + b[1];
    });

    //  if backup length exceeds the maximum then let's clean up
    if ( backups.length > setuptools.data.config.maximumBackupCount ) {
        window.techlog("SetupTools/Backups Cleaning up " + (backups.length-setuptools.data.config.maximumBackupCount) + " backups", 'force');
        for ( i = setuptools.data.config.maximumBackupCount; i < backups.length; i++ ) {
            window.techlog("SetupTools/Backups Deleting " + backups[i][0], 'force');
            setuptools.storage.delete(backups[i][0]);
        }
    }

};

//  restore account configuration
setuptools.app.config.restore = function() {

    setuptools.lightbox.build('restore', 'Feature coming soon!');
    setuptools.lightbox.goback(setuptools.app.index, 'restore');
    setuptools.lightbox.display('restore');

};

//  create account configuration backup
setuptools.app.config.backup = function() {

    date = new Date();
    BackupID = "muledump-backup-" + Date.now();
    BackupName = "muledump-backup-" +
        date.getFullYear() +
        ('0' + date.getMonth()).slice(-2) +
        ('0' + date.getDate()).slice(-2) + '-' +
        ('0' + date.getHours()).slice(-2) +
        ('0' + date.getMinutes()).slice(-2) +
        ('0' + date.getSeconds()).slice(-2);

    //  build our backup data object with meta data, setuptool.data, and muledump options
    BackupData = JSON.stringify($.extend(true, {},
        {meta: {BackupDate: new Date().toISOString()}},
        setuptools.data,
        {options: window.options}
    ));

    setuptools.lightbox.build('download', ' \
        Backup has been created with name ' + BackupName + '. \
        <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
        <br><br><a download="' + BackupName + '.json" href="data:text/json;base64,' + btoa(BackupData) + '" class="setuptools config download">Download Backup</a> \
    ');

    //  write to local storage
    if ( setuptools.storage.write(BackupID, BackupData) === false ) {
        setuptools.lightbox.build('download', '<br><br><span class="setuptools error">Warning</span>: Failed to save backup to browser storage');
    } else setuptools.app.config.cleanup();

    //  display the download box
    setuptools.lightbox.display('download', {'closeOnClick': 'background'});
    setuptools.app.config.downloadAck();

};

//  in case the user fails to read instructions we can get their attention
setuptools.app.config.downloadAck = function() {

    var AckCount = Number(0);
    $('.setuptools.config.download').click(function(e) {

        //  if autoDownload is disabled then we should remind the user what they need to do
        if ( setuptools.data.config.preventAutoDownload === true ) {

            //  stop the automatic download
            e.preventDefault();

            //  visual response
            css = false;
            if (AckCount % 1 == 0) css = {'color': setuptools.config.errorColor};
            if (AckCount % 2 == 0) css = {'color': 'red'};
            if (AckCount == Number(0)) css = {'font-weight': 'bold'};
            if (typeof css === 'object') $('.setuptools.config.download.acknowledge').css(css);

            //  this is a bonafide easter egg
            if (AckCount == Number(50)) $('.setuptools.config.download.acknowledge').html('You\'re really having fun with this, aren\'t you?');
            if (AckCount == Number(100)) $('.setuptools.config.download.acknowledge').html('Yeah I thought so. <a href="#" data-featherlight="http://3.bp.blogspot.com/_D_Z-D2tzi14/S8TTPQCPA6I/AAAAAAAACwA/ZHZH-Bi8OmI/s400/ALOT2.png">I care about this Alot more</a>.');
            AckCount++;

        }

    });

};

//  convert account data format
setuptools.app.config.convert = function(accountConfig, format) {

    format = Number(format);
    if ( !accountConfig || !$.isNumeric(format) ) {
        setuptools.lightbox.error("Supplied data is invalid for conversion.", 4);
        return;
    }

    //  format 0 is original muledump accounts var format
    var accountData;
    if ( format === 0 ) {

        //  is the supplied data in the correct format
        if ( setuptools.app.config.validateFormat(accountConfig, 1) === true ) {

            accountData = {};
            for (var i in accountConfig.accounts)
                if (accountConfig.accounts.hasOwnProperty(i))
                    accountData[i] = accountConfig.accounts[i].password;

            return accountData;

        //  something is wrong
        } else if ( accountConfig.meta && accountConfig.meta.format ) {
            setuptools.lightbox.error('Account configuration format ' + accountConfig.meta.format + ' cannot be converted to format ' + format, 6);
        } else setuptools.lightbox.error('Supplied configuration is not of a known format.', 7);

    //  format 1 is setuptools muledump accounts var format
    } else if ( format === 1 ) {

        //  validation is done inside setuptools.app.config.create()

        //  create the newly formatted account config
        accountData = setuptools.app.config.create(accountConfig, 1);

        return accountData;

    //  there are no other formats
    } else setuptools.lightbox.error("Request format for conversion is unknown", 5);

};

//  validate the supplied config against the specified format
setuptools.app.config.validateFormat = function(accountConfig, format) {

    format = Number(format);
    if ( format === 0 ) {

        //  is the supplied data in the correct format
        //  format 0 is very simple {'email1': 'password', 'email2': 'password', ...}
        for ( var i in accountConfig )
            if ( accountConfig.hasOwnProperty(i) )
                if ( !i.match(setuptools.config.regex.email) && !i.match(setuptools.config.regex.guid) )
                    return false;

        return true;

    } else if ( format === 1 ) {

        return !!( accountConfig.meta && accountConfig.meta.format === 1 )

    }

    return false;

};

//  create a new account configuration object
setuptools.app.config.create = function(accountConfig, format) {

    format = Number(format);
    var accountData;

    //  currently the only format, but this could change in the future
    if ( format === 1 ) {

        if ( setuptools.app.config.validateFormat(accountConfig, 0) === true ) {

            accountData = {meta: {created: Date.now(), modified: Date.now(), format: 1, version: 1}, accounts: {}};
            for (var i in accountConfig)
                if (accountConfig.hasOwnProperty(i))
                    accountData.accounts[i] = {
                        password: accountConfig[i],
                        enabled: true,
                        group: 0,
                        autoReload: 0
                    };

        } else {
            setuptools.lightbox.error("The supplied account configuration was invalid.", 8);
            return;
        }

    } else {
        setuptools.lightbox.error('Requested configuration format ' + format + ' does not exist.', 9);
        return;
    }

    return accountData;

};

//  save the current configuration
setuptools.app.config.save = function() {

    function saveError() {

        var AccountsJS = btoa('accounts = ' + JSON.stringify(setuptools.app.config.convert(setuptools.data.accounts, 0)) + "\nrowlength = 7;\ntesting = 0;\nprices = 0;\nmulelogin = 0;\nnomasonry = 0;\naccountLoadDelay = 5;\ndebugging = false;\n//ImgurClientID = '';");
        setuptools.lightbox.build('saveerror', ' \
            Warning: Failed to save configuration to local storage. \
            <br><br>You may continue using Muledump but you will need to save the accounts.js file to the Muledump folder. \
            <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
            <br><br><a download="accounts.js" href="data:text/json;base64,' + AccountsJS + '" class="setuptools config download">Download accounts.js</a> \
        ');
        setuptools.lightbox.display('saveerror', {closeOnClick: false, otherClose: ''});
        setuptools.app.config.downloadAck();

    }

    //  seems reasonable
    if ( setuptools.error === false && setuptools.config.devForcePoint != 'config-save' ) {

        //  try to write the configuration
        if ( setuptools.storage.write('configuration', JSON.stringify(setuptools.data)) === false ) {
            saveError();
            return false;
        } else return true;

    } else {
        saveError();
        return false;
    }

};

//  first time setup walk-through
setuptools.app.initsetup.index = function() {

    window.techlog('SetupTools First Time Setup running', 'force');
    setuptools.lightbox.build('initsetup-index', '<span>Do you have <a href="#" class="setuptools initsetup page2">one or a few accounts</a> or <a href="#" class="setuptools initsetup page3">many accounts</a>?</span>');
    setuptools.lightbox.goback(setuptools.app.index, 'initsetup-index');
    setuptools.lightbox.display('initsetup-index');
    $('.setuptools.initsetup.page2').click(setuptools.app.initsetup.page2);
    $('.setuptools.initsetup.page3').click(setuptools.app.initsetup.page3);

};

//  manual input of account data
setuptools.app.initsetup.page2 = function() {

    //  initialize our temporary storage
    uAFresh = false;
    if ( !setuptools.tmp.userAccounts ) {

        uAFresh = true;
        setuptools.tmp.userAccounts = {};

    }

    //  create a user account row and populate it if necessary
    var rowId = Number(0);
    function createRow(username, password) {

        rowId = Number(rowId)+Number(1);

        if ( !username ) username = '';
        if ( !password ) password = '';
        setuptools.tmp.userAccounts['row-' + rowId] = {username: username, password: password};
        $('.setuptools.app.initsetup.container').append(' \
            <div class="setuptools app initsetup accounts" id="row-' + rowId + '"> \
                <input name="username" value="' + username + '"> \
                <input name="password" type="password" value="' + password + '"> \
                <div class="add controller" rowId="row-' + rowId + '">+</div> \
                <div class="reveal controller" rowId="row-' + rowId + '" state="reveal">&#9679;</div> \
            </div> \
        ');
        $('#row-' + rowId + ' input[name="username"]').focus();

        bindAdd();
        bindChange();

    }

    //  bind the row remove button
    function bindRemove() {

        //  unbind first to register new elements
        $('.setuptools.app.initsetup.accounts .remove').unbind('click');
        $('.setuptools.app.initsetup.accounts .remove').click(function() {

            RemoveRowId = $(this).attr('rowId');
            $('#' + RemoveRowId).remove();

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
                input = $('#' + rowId + ' input:nth-child(2)');
                newinput = $('<input name="password">').val(input.val()).insertBefore(input);
                input.remove();
                $(this).attr('state', 'hide');
            } else {
                input = $('#' + rowId + ' input:nth-child(2)');
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

        $('.setuptools.app.initsetup.accounts input').unbind('change');
        $('.setuptools.app.initsetup.accounts input').change(function(e) {
            var rowId = $(this).parent().attr('id');
            var iam = $(this).attr('name');
            setuptools.tmp.userAccounts[rowId][iam] = $(this).val();
        });

    }

    //  build our lightbox data
    setuptools.lightbox.build('initsetup-page2', ' \
        Enter your account information in the lines below. Click the + to add more accounts.<br><br>\
        <div class="setuptools app initsetup container"> \
            <div class="setuptools app initsetup accounts"> \
                <div style="font-weight: bold">Account Email or ID</div> \
                <div style="font-weight: bold">Account Password</div> \
            </div> \
        </div> \
        <div style="float: left"><br>When you are finished <a href="#" class="setuptools app initsetup save">click here</a> to proceed.</div> \
    ');
    setuptools.lightbox.goback(setuptools.app.initsetup.index, 'initsetup-page2');
    setuptools.lightbox.display('initsetup-page2');

    //  load any known accounts
    if ( uAFresh === true ) {

        //  on fresh loads we will attempt to populate from accounts.js
        for ( var i in setuptools.data.accounts )
            if (setuptools.data.accounts.hasOwnProperty(i))
                createRow(i, setuptools.data.accounts[i]);

    } else {

        //  on return visits we'll just load what's in the cache
        for (var i in setuptools.tmp.userAccounts)
            if (setuptools.tmp.userAccounts.hasOwnProperty(i))
                if ( setuptools.tmp.userAccounts[i].username.length > 0 || setuptools.tmp.userAccounts[i].password.length > 0 )
                    createRow(setuptools.tmp.userAccounts[i].username, setuptools.tmp.userAccounts[i].password);

    }

    //  make a fresh and empty row
    createRow();

    //  bind the save button
    $('.setuptools.app.initsetup.save').click(setuptools.app.initsetup.page4);

};

//  pasting a list that is well-formatted
setuptools.app.initsetup.page3 = function() {

    setuptools.lightbox.build('initsetup-page3', 'Sounds good! Let\'s gather some information.');

};

setuptools.app.initsetup.page4 = function() {

    //  scan the supplied user accounts and remove bad entries
    var badEntries = [];
    for ( var i in setuptools.tmp.userAccounts )
        if ( setuptools.tmp.userAccounts.hasOwnProperty(i) ) {

            var username = setuptools.tmp.userAccounts[i].username;
            var password = setuptools.tmp.userAccounts[i].password;

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

                            setuptools.data.accounts[username] = password;

                        } else badEntries.push(setuptools.tmp.userAccounts[i]);

                    }

                }

            }

        }

    //  no good entries means this is a bust; give the user the opportunity to go back and try again
    if ( Object.keys(setuptools.data.accounts).length === 0 ) {

        setuptools.lightbox.build('initsetup-page4', 'Oops, there was a problem. You did not provide any valid user accounts. Did you make sure to provide both a username and password?');

    } else {

        setuptools.lightbox.build('initsetup-page4', 'Your changes have been saved. \
            <br><br>If you are ready, you may now proceed to <a href="#" class="setuptools app loadaccounts">Muledump</a>. \
        ')

        if ( badEntries.length > 0 ) setuptools.lightbox.build('initsetup-page4', '<br><br>Warning: ' + badEntries.length + ' supplied accounts was invalid. You may go back and try again if you wish.');

        //  convert traditional accounts.js format to setuptools format
        setuptools.data.accounts = setuptools.app.config.convert(setuptools.data.accounts, 1);

        //  save the configuration
        if ( setuptools.app.config.save() === true ) {

            setuptools.loaded = true;
            setuptools.lightbox.goback(setuptools.app.initsetup.page2, 'initsetup-page4');
            setuptools.lightbox.display('initsetup-page4');
            $('.setuptools.app.loadaccounts').click(setuptools.init.accounts);

            //  aaaand we're done

        }

    }

};

//
//  root tools
//

//  initialize setup tools
setuptools.init.main = function(window) {

    setuptools.window = window;

    //  check if we should bypass
    if ( setuptools.storage.test() === false ) {

        //  when we bypass, accounts.js is allowed to populate the accounts var and we won't touch it
        window.techlog('SetupTools - LocalStorage not supported', 'force');
        setuptools.error = true;

    } else {

        //  new users can't load muledump so we'll help them get started
        if ( setuptools.app.checknew() === true ) {

            setuptools.firsttime = true;
            setuptools.app.index();

        } else {

            //  load our stored configuration if available
            if ( setuptools.storage.read('configuration') ) setuptools.data = JSON.parse(setuptools.storage.read('configuration'));

            //  setuptools loaded successfully
            if ( setuptools.config.devForcePoint != 'bad-config' && setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true ) {

                setuptools.loaded = true;
                window.techlog('SetupTools/Init - Loaded stored configuration');

            //  setuptools in bypass mode
            } else if ( setuptools.config.devForcePoint != 'bad-config' && window.accounts && setuptools.app.config.validateFormat(window.accounts, 0) === true ) {

                setuptools.loaded = false;
                window.techlog('SetupTools/Init - Bypassing');

            } else {

                window.techlog('SetupTools/Init - Problem detected with stored configuration');
                setuptools.lightbox.create("There seems to be a problem with your configuration.");

            }

        }

    }

};

//  load account data
setuptools.init.accounts = function() {

    //  if setuptools successfully loaded then insert our accounts object
    if ( setuptools.loaded === true ) window.accounts = setuptools.app.config.convert(setuptools.data.accounts, 0);

    for (var i in window.accounts) {
        mules[i] = new Mule(i);
    }

    //  mule queries are now ran in serial instead of in parallel to account for Deca rate limiting
    window.MuleQueue = new window.MQObject(mules);

    //  Mule.queue is a new feature that rate limits querying to avoid the Deca block
    for (i in mules) mules[i].queueStart(i, false, 'query');

};

//  handle setuptools button click
setuptools.click = function() {

    //  if local storage isn't supported then setup tools is completely bypassed
    if ( setuptools.error === true ) {

        setuptools.lightbox.error('Your browser does not presently support local storage.', 1);

    //  load the app index
    } else setuptools.app.index();

};

(function($, window) {

    //  dom loaded
    $(function() {

        //  jquery bindings
        $('#setuptools').click(setuptools.click);

    });

})($, window);
