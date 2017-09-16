//  muledump setup tools - ui-based accounts.js management

//  setuptools object layout
var setuptools = {
    error: false,
    loaded: false,
    firsttime: false,
    forcereload: {enabled: false, active: false, target: '', BuildID: 'forcereload'},
    originalAccountsJS: false,
    config: {},
    tmp: {},
    data: {
        config: {}
    },
    init: {},
    storage: {},
    app: {
        initsetup: {},
        config: {},
        backups: {}
    },
    lightbox: {builds: {}}
};

//  setuptools configuration
setuptools.config.keyPrefix = 'muledump:setuptools:';
setuptools.config.accountsJS = "\nrowlength = 7;\ntesting = 0;\nprices = 0;\nmulelogin = 0;\nnomasonry = 0;\naccountLoadDelay = 5;\ndebugging = false;\n//ImgurClientID = '';";
setuptools.config.errorColor = '#ae0000';
setuptools.config.devForcePoint = '';
setuptools.config.reloadDelay = 3;
setuptools.config.drawhelpUrlPrefix = ['https://jakcodex.github.io/muledump/', 'https://raw.githubusercontent.com/jakcodex/muledump/setuptools/'];
setuptools.config.regex = {
    email: new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    guid: new RegExp(/^((steamworks|kongregate|kabam):[a-zA-Z0-9]*)$/i),
    accountsJS: new RegExp(/^(?:(rowlength|testing|prices|mulelink|nomasonry|debugging) ?= ?([a-z0-9]*).*?|.*?'((?:(?:[^<>()\[\]\\.,;:\s@"]+(?:\.[^<>()\[\]\\.,;:\s@"]+)*)|(?:".+"))@(?:(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(?:(?:steamworks|kongregate|kabam):[a-zA-Z0-9]*))': ?'(.*?)'.*?)$/, 'i')
};

//  muledump setuptools configuration defaults
setuptools.data.config.enabled = false;
setuptools.data.config.preventAutoDownload = true;
setuptools.data.config.maximumBackupCount = 10;
setuptools.data.config.automaticBackups = true;
setuptools.data.config.rowlength = 7;
setuptools.data.config.testing = 0;
setuptools.data.config.prices = 0;
setuptools.data.config.mulelogin = 0;
setuptools.data.config.nomasonry = 0;
setuptools.data.config.accountLoadDelay = 2;
setuptools.data.config.debugging = false;
setuptools.data.accounts = {};
setuptools.data.options = window.options;

//
//  storage tools
//

//  write to localStorage
setuptools.storage.write = function(key, value, skipPrefix) {

    try {
        key = ( skipPrefix === true ) ? key : setuptools.config.keyPrefix + key;
        localStorage[key] = value;
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
        localStorage.removeItem(setuptools.config.keyPrefix + key);
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
setuptools.lightbox.create = function(data, config, title) {

    if ( !title ) title = 'Muledump Setup';
    if ( typeof data === 'string' ) {

        if ( !config ) config = {};
        if ( typeof config === 'string' ) config = {variant: config};
        if ( typeof config !== 'object' ) {

            setuptools.lightbox.error('Supplied Featherlight config is invalid', 2);
            return;

        } else {

            if ( setuptools.app.checknew() === true ) {
                if ( typeof config.closeOnEsc === 'undefined' ) config.closeOnEsc = false;
                if ( typeof config.closeIcon === 'undefined' ) config.closeIcon = '';
                if ( typeof config.closeOnClick === 'undefined' ) config.closeOnClick = false;
            }

            if ( typeof config.otherClose === 'undefined' ) config.otherClose = 'a.setuptools:not(.noclose), .setuptools.error';
            if ( typeof config.variant === 'undefined' ) config.variant = 'setuptools';
            if ( typeof config.openSpeed === 'undefined' ) config.openSpeed = 0;
            if ( typeof config.closeOnClick === 'undefined' ) config.closeOnClick = 'background';

        }

        $.featherlight(' \
            <p class="setuptools block"> \
            <h1>' + title + '</h1> \
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
setuptools.lightbox.display = function(id, config) {

    //  check if the build exists
    if ( !setuptools.lightbox.builds[id] ) {

        setuptools.lightbox.error('Build ID ' + id + ' does not exist.', 3);

    //  create the lightbox from the build data
    } else {

        if ( typeof config !== 'object' ) config = {};

        //  search build data for drawhelp and goback data
        for ( var i in setuptools.lightbox.builds[id] )
            if ( setuptools.lightbox.builds[id].hasOwnProperty(i) )
                if ( typeof setuptools.lightbox.builds[id][i] === 'object' ) {

                    //  check for goback data
                    if ( setuptools.lightbox.builds[id][i].iam === 'goback' ) {

                        gobackData = setuptools.lightbox.builds[id][i];
                        setuptools.lightbox.builds[id][i] = gobackData.message;

                        //  check for drawhelp data
                    } else if ( setuptools.lightbox.builds[id][i].iam === 'drawhelp' ) {

                        drawhelpData = setuptools.lightbox.builds[id][i];
                        setuptools.lightbox.builds[id][i] = '';

                        //  about this; if I send it to any full-html url, this permanently break $.featherlight
                        //  I wasted 3 hours of my life trying to figure out that bug. What a waste of time.

                        //  for dev we'll just default to a placeholder
                        //data-featherlight="' + setuptools.config.drawhelpUrlPrefix[1] + drawhelpData.link + '" \
                        //data-featherlight-type="ajax" \

                        setuptools.lightbox.builds[id].push(' \
                            <a class="drawhelp' + (( setuptools.firsttime === true ) ? ' noclose' : '') + '" \
                            title="' + drawhelpData.title + '" \
                            href="' + setuptools.config.drawhelpUrlPrefix[0] + drawhelpData.link.replace(/.md$/i, '') + '" \
                            data-featherlight="<p>Placeholder</p>" \
                            data-featherlight-open-speed="0" \
                            data-featherlight-close-speed="0" \
                            >?</a>\
                        ');

                    //  check for new header title
                    } else if ( setuptools.lightbox.builds[id][i].iam === 'title' ) {

                        var title = setuptools.lightbox.builds[id][i].title;
                        setuptools.lightbox.builds[id][i] = '';

                    }

                }

        //  create the lightbox and delete the temporary build data
        setuptools.lightbox.create(setuptools.lightbox.builds[id].join(' '), config, title);
        setuptools.lightbox.builds[id].splice(0);

        //  bind any goback click
        if ( typeof gobackData === 'object' ) $('.setuptools.goback').click(function(e) { e.preventDefault(); gobackData.callback(); });

    }

};

setuptools.lightbox.cancel = function(id) {

    return ( typeof setuptools.lightbox.builds[id] === 'object' && setuptools.lightbox.builds[id].splice(0) );

};

//  add a help icon
setuptools.lightbox.drawhelp = function(id, link, title) {

    if ( !id || !link || !title ) setuptools.lightbox.error('Invalid data supplied to drawhelp.', 11);
    if ( !setuptools.lightbox.builds[id] ) setuptools.lightbox.builds[id] = [];
    setuptools.lightbox.builds[id].push({
        iam: 'drawhelp',
        link: link,
        title: title
    });

};

//  change the lightbox header title
setuptools.lightbox.settitle = function(id, title) {

    if ( !setuptools.lightbox.builds[id] ) setuptools.lightbox.builds[id] = [];
    setuptools.lightbox.builds[id].push({
        iam: 'title',
        title: title
    });

};

//  provide a goback link
setuptools.lightbox.goback = function(id, page) {

    if ( typeof page != 'function' ) setuptools.lightbox.error('The callback value for goback is not valid.', 10);

    if ( !setuptools.lightbox.builds[id] ) setuptools.lightbox.builds[id] = [];
    setuptools.lightbox.builds[id].push({
        iam: 'goback',
        callback: page,
        message: '<div style="width: auto;"><div style="clear: both; float: left;"><br><span style="font-weight: 900;">&#10094;&nbsp;</span> Go back to the <a href="#" class="setuptools goback">previous page</a></div></div>'
    });

};

//  display an error message
setuptools.lightbox.error = function(message, code) {

    if ( !code ) code = 0;
    setuptools.lightbox.create(' \
        <p><span class="setuptools error">Error ' + code + '</span> - ' + message + '</p> \
        <span>See <a href="https://github.com/jakcodex/muledump/wiki/Setup+Tools" target="_blank">Setup Tools</a> in the wiki for more help.</span> \
    ');
    throw new Error('Error ' + code + ' - ' + message);

};

//
//  application
//

//  start page for setup tools
setuptools.app.index = function(config) {

    setuptools.lightbox.build('main', 'Welcome to Muledump Account Setup Tools!');

    if ( typeof config !== 'object' ) config = {};

    //  cleanup for a fresh start
    delete setuptools.tmp.SelectedBackupID;
    delete setuptools.tmp.userAccounts;

    //  look for a fresh configuration
    if ( setuptools.app.checknew() === true ) {

        var variant = 'setuptools-small';
        setuptools.lightbox.build('main', ' \
            <br><br>It looks like you are new here. Setup Tools will help you get started with Muledump. Whether you\'re a new user or returning user it is easy to get up and running. \
            <br><br>New users can <a href="#" class="setuptools accounts manage">click here</a> to begin. \
            <br><br>Returning users can <a href="#" class="setuptools config restore">restore a backup</a>. \
            <br><br>Want to import an <a href="#" class="setuptools config import">existing accounts.js</a>? \
        ');

    } else {

        var variant = 'setuptools-medium';
        setuptools.lightbox.build('main', ' \
            <br><br>Please choose from the following choices. \
            <br><br><a href="#" class="setuptools accounts manage">Manage Accounts</a> \
            | <a href="#" class="setuptools config settings">Muledump Settings</a> \
            | <a href="#" class="setuptools config backup">Backup Management</a> \
        ');

    }

    //  display the built lightbox and register click action
    setuptools.lightbox.drawhelp('main', 'docs/setuptools/index.html', 'SetupTools Help');
    setuptools.lightbox.display('main', $.extend(true, {}, config, {'variant': variant}));
    $('.setuptools.accounts.manage').click(setuptools.app.initsetup.page2);
    $('.setuptools.config.restore').click(setuptools.app.backups.index);
    $('.setuptools.config.backup').click(setuptools.app.backups.index);
    $('.setuptools.config.settings').click(setuptools.app.config.settings);
    $('.setuptools.config.import').click(setuptools.app.initsetup.page6);

};

//  check if this is a new user
setuptools.app.checknew = function() {

    //  check if a stored configuration is present
    if ( setuptools.config.devForcePoint != 'newuser' && setuptools.firsttime === false && setuptools.storage.read('configuration') ) return false;

    //  check if any other account data is present
    return (
        //  check if force point set for this position
        setuptools.config.devForcePoint === 'newuser' ||

        //  first time user detected already
        setuptools.firsttime === true ||

        //  accounts object missing
        typeof setuptools.window.accounts === 'undefined' ||

        //  accounts variable present but not an object
        typeof setuptools.window.accounts !== 'object' ||

        //  accounts object present and in the default state
        (typeof setuptools.window.accounts === 'object' &&
        Object.keys(setuptools.window.accounts).length < 3 &&
        setuptools.window.accounts.email && setuptools.window.accounts.email2)
    ) ? true : false;

};

setuptools.app.config.settings = function() {

    setuptools.lightbox.build('settings', ' \
        <div class="setuptools app config container"> \
            <div class="setuptools app config settings"> \
                <div>SetupTools Enabled</div> \
                <select name="enabled" class="setting">\
                    <option' + ( (setuptools.data.config.enabled === true) ? ' selected' : '' ) + '>Yes</option> \
                    <option' + ( (setuptools.data.config.enabled === false) ? ' selected' : '' ) + '>No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Prevent Auto Download</div> \
                <select name="preventAutoDownload" class="setting">\
                    <option' + ( (setuptools.data.config.preventAutoDownload === true) ? ' selected' : '' ) + '>Yes</option> \
                    <option' + ( (setuptools.data.config.preventAutoDownload === false) ? ' selected' : '' ) + '>No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Maximum Backups in Local Storage</div> \
                <select name="maximumBackupCount" class="setting"> \
    ');

    for ( i = 0; i < 31; i++ ) setuptools.lightbox.build('settings', ' \
        <option ' + ( (Number(i) === Number(setuptools.data.config.maximumBackupCount)) ? 'selected' : '' ) + '>' + i + '</option> \
    ');

    setuptools.lightbox.build('settings', ' \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Automatic Backups</div> \
                <select name="automaticBackups" class="setting">\
                    <option' + ( (setuptools.data.config.automaticBackups === true) ? ' selected' : '' ) + '>Yes</option> \
                    <option' + ( (setuptools.data.config.automaticBackups === false) ? ' selected' : '' ) + '>No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Characters Displayed per Row</div> \
                <select name="rowlength" class="setting"> \
    ');

    for ( i = 1; i <= 50; i++ ) setuptools.lightbox.build('settings', ' \
        <option ' + ( (Number(i) === Number(setuptools.data.config.rowlength)) ? 'selected' : '' ) + '>' + i + '</option> \
    ');

    setuptools.lightbox.build('settings', ' \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Testing</div> \
                <select name="testing" class="setting">\
                    <option' + ( (setuptools.data.config.testing === 1) ? ' selected' : '' ) + '>Yes</option> \
                    <option' + ( (setuptools.data.config.testing === 0) ? ' selected' : '' ) + '>No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Price Display in Tooltips</div> \
                <select name="prices" class="setting">\
                    <option' + ( (setuptools.data.config.prices === 1) ? ' selected' : '' ) + '>Yes</option> \
                    <option' + ( (setuptools.data.config.prices === 0) ? ' selected' : '' ) + '>No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Enable One-click Login</div> \
                <select name="mulelogin" class="setting">\
                    <option' + ( (setuptools.data.config.mulelogin === 1) ? ' selected' : '' ) + '>Yes</option> \
                    <option' + ( (setuptools.data.config.mulelogin === 0) ? ' selected' : '' ) + '>No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Use Smart Layout</div> \
                <select name="nomasonry" class="setting">\
                    <option' + ( (setuptools.data.config.nomasonry === 0) ? ' selected' : '' ) + '>Yes</option> \
                    <option' + ( (setuptools.data.config.nomasonry === 1) ? ' selected' : '' ) + '>No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Enable Debug Logging</div> \
                <select name="automaticBackups" class="setting">\
                    <option' + ( (setuptools.data.config.debugging === true) ? ' selected' : '' ) + '>Yes</option> \
                    <option' + ( (setuptools.data.config.debugging === false) ? ' selected' : '' ) + '>No</option> \
                </select> \
            </div> \
            <br><a href="#" class="setuptools app config settings save" style="font-size: 14px; font-weight: bold;">Save Settings</a> \
        </div> \
    ');
    setuptools.lightbox.settitle('settings', 'Muledump Settings');
    setuptools.lightbox.goback('settings', setuptools.app.index);
    setuptools.lightbox.drawhelp('settings', 'docs/setuptools/settings', 'Muledump Settings Help');
    setuptools.lightbox.display('settings');

    $('.setuptools.app.config.settings.save').click(function() {

        $(this).unbind('click');

        //  gather our new settings
        var settings = {};
        settings.enabled = ( $('.setuptools.app.config.settings select[name="enabled"]').val() === 'Yes' );
        settings.preventAutoDownload = ( $('.setuptools.app.config.settings select[name="preventAutoDownload"]').val() === 'Yes' );
        settings.maximumBackupCount = $('.setuptools.app.config.settings select[name="maximumBackupCount"]').val();
        settings.automaticBackups = ( $('.setuptools.app.config.settings select[name="automaticBackups"]').val() === 'Yes' );
        settings.rowlength = $('.setuptools.app.config.settings select[name="rowlength"]').val();
        settings.testing = ( $('.setuptools.app.config.settings select[name="testing"]').val() === 'Yes' ) ? 1 : 0;
        settings.prices = ( $('.setuptools.app.config.settings select[name="prices"]').val() === 'Yes' ) ? 1 : 0;
        settings.mulelogin = ( $('.setuptools.app.config.settings select[name="mulelogin"]').val() === 'Yes' ) ? 1 : 0;
        settings.nomasonry = ( $('.setuptools.app.config.settings select[name="nomasonry"]').val() === 'Yes' ) ? 0 : 1;
        settings.debugging = ( $('.setuptools.app.config.settings select[name="debugging"]').val() === 'Yes' );

        console.log(settings);

        //  roll them into the config
        for ( var i in settings )
            if ( settings.hasOwnProperty(i) )
                setuptools.data.config[i] = settings[i];

        //  save the configuration
        if ( setuptools.app.config.save() === false ) {
            setuptools.app.config.saveError();
        } else {
            setuptools.lightbox.build('settings-saved', 'Settings have been saved. <br><br>This page will reload in a few seconds.');
            setuptools.lightbox.goback('settings-saved', setuptools.app.config.settings);
            setuptools.lightbox.display('settings-saved');

            var ReloadTimeout = setTimeout(function() {
                window.location.reload();
            }, 3000);
            $('.setuptools.goback').click(function() {

                clearTimeout(ReloadTimeout);

            });
        }

    });

};

//  create account configuration backup
setuptools.app.config.backup = function(backupProtected) {

    if ( typeof backupProtected != 'boolean' ) backupProtected = false;
    date = new Date(Date.now()+new Date().getTimezoneOffset());
    var BackupID = "muledump-backup-" + Date.now();
    var BackupName = "muledump-backup-" +
        date.getFullYear() +
        ('0' + date.getMonth()).slice(-2) +
        ('0' + date.getDate()).slice(-2) + '-' +
        ('0' + date.getHours()).slice(-2) +
        ('0' + date.getMinutes()).slice(-2) +
        ('0' + date.getSeconds()).slice(-2);

    //  build our backup data object with meta data, setuptool.data, and muledump options
    var BackupData = JSON.stringify($.extend(true, {},
        {meta: {BackupDate: new Date().toISOString(), protected: backupProtected}},
        setuptools.data,
        {options: window.options}
    ));

    //  write to local storage
    var BackupStatus = setuptools.storage.write(BackupID, BackupData);

    //  cleanup backups if we are over the limit1
    if ( BackupStatus === true ) setuptools.app.backups.cleanup();

    //  return the result
    return {
        BackupID: BackupID,
        BackupName: BackupName,
        BackupData: BackupData,
        status: BackupStatus
    };

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
setuptools.app.config.convert = function(accountConfig, format, group, all) {

    if ( group ) group = Number(group);
    if ( typeof all === 'undefined' ) all = false;
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

            //  loop thru the accounts and return accounts that are enabled and, if provided, match the specified group
            accountData = {};
            for (var i in accountConfig.accounts)
                if (accountConfig.accounts.hasOwnProperty(i))
                    if ( all === true || (accountConfig.accounts[i].enabled === true && (!group || accountConfig.accounts[i].group === group)) )
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

//  determine the format in use
setuptools.app.config.determineFormat = function(accountConfig) {

    if ( setuptools.app.config.validateFormat(accountConfig, 1) === true ) {
        return 1;
    } else if ( setuptools.app.config.validateFormat(accountConfig, 0) === true ) {
        return 0;
    } else setuptools.lightbox.format('Supplied account configuration is of an unknown format.', 14);

};

//  determine if a user exists
setuptools.app.config.userExists = function(username) {

    if ( setuptools.data.config.enabled === true ) {

        format = setuptools.app.config.determineFormat(setuptools.data.accounts);
        if (format === 0) {
            return !!( setuptools.data.accounts[username] );
        } else if (format === 1) {
            return !!( setuptools.data.accounts.accounts[username] );
        } else {
            //  this honestly shouldn't happen
            setuptools.lightbox.error('Invalid account data provided', 14);
        }

    } else {

        return !!( window.accounts[username] );

    }

};

//  determine if a user is enabled
setuptools.app.config.userEnabled = function(username) {

    if ( setuptools.data.config.enabled === true ) {

        format = setuptools.app.config.determineFormat(setuptools.data.accounts);
        if ( format === 0 ) {
            return true;
        } else if ( format === 1 ) {
            return setuptools.data.accounts.accounts[username].enabled;
        } else {
            //  this honestly shouldn't happen
            setuptools.lightbox.error('Invalid account data provided', 14);
        }

    } else {
        return true;
    }

};

//  create a new user object and do something with it
setuptools.app.config.createUser = function(username, password, enabled, group, autoReload, action, format) {

    var accountConfig;
    format = Number(format);

    //  traditional format
    if ( format === 0 ) {

        //  type 0 implies set
        if ( setuptools.app.config.validateFormat(setuptools.data.accounts, 0) === true ) {
            setuptools.data.accounts[username] = password;
        } else setuptools.lightbox.error('Cannot set user on an invalid format configuration', 12);

    //  new format
    } else if ( format === 1 ) {

        accountConfig = {
            password: password,
            enabled: enabled,
            group: group,
            autoReload: autoReload
        };

        if ( action == 'set' ) {

            if ( setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true ) {
                setuptools.data.accounts.accounts[username] = accountConfig;
            } else setuptools.lightbox.error('Cannot set user on an invalid format configuration', 12);

        } else if ( action == 'return' ) {

            return accountConfig;

        }

    } else {

        setuptools.lightbox.error('The specified format does not exist.', 13);

    }

};

//  create a new account configuration object
setuptools.app.config.create = function(accountConfig, format) {

    format = Number(format);
    var accountData = {};

    //  currently the only format, but this could change in the future
    if ( format === 1 ) {

        if ( setuptools.app.config.validateFormat(accountConfig, 0) === true ) {

            accountData = {meta: {created: Date.now(), modified: Date.now(), format: 1, version: 1}, accounts: {}};
            for (var i in accountConfig)
                if (accountConfig.hasOwnProperty(i))
                    accountData.accounts[i] = setuptools.app.config.createUser(i, accountConfig[i], true, 0, false, 'return', 1);

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

//  generate a usable accounts.js file
setuptools.app.config.generateAccountsJS = function(accountConfig) {

    return btoa('accounts = ' + JSON.stringify(setuptools.app.config.convert(accountConfig, 0)) + setuptools.config.accountsJS);

};

//  display an error when the config fails to save to local storage
setuptools.app.config.saveError = function() {

    var AccountsJS = setuptools.app.config.generateAccountsJS(setuptools.data.accounts);
    setuptools.lightbox.build('saveerror', ' \
            Warning: Failed to save configuration to local storage. \
            <br><br>You may continue using Muledump but you will need to save the accounts.js file to the Muledump folder. \
            <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
            <br><br><a download="accounts.js" href="data:text/json;base64,' + AccountsJS + '" class="setuptools config download">Download accounts.js</a> \
        ');
    setuptools.lightbox.display('saveerror', {closeOnClick: 'background', closeIcon: '&#10005;', otherClose: null});
    setuptools.app.config.downloadAck();

};

//  save the current configuration
setuptools.app.config.save = function() {

    //  seems reasonable
    if ( setuptools.error === false && setuptools.config.devForcePoint != 'config-save' ) {

        //  new users importing their accountsjs
        if ( setuptools.app.config.determineFormat(setuptools.data.accounts) === 0 && !setuptools.storage.read('configuration') ) setuptools.data.accounts = setuptools.app.config.create(setuptools.data.accounts, '1');

        //  update metadata
        setuptools.data.accounts.meta.modified = Date.now();
        setuptools.data.accounts.meta.version++;

        //  try to write the configuration
        return setuptools.storage.write('configuration', JSON.stringify(setuptools.data));

    } else {
        return false;
    }

};

//  backups management menu
setuptools.app.backups.index = function() {

    setuptools.lightbox.build('backup-index', ' \
        <h3>Available Actions</h3> \
    ');

    //  display a varying menu based on if setuptools is loaded or not
    if ( setuptools.loaded === true ) {

        //  for another time - <a href="#" class="setuptools app backups createdeep">Deep Backup</a> | \
        setuptools.lightbox.build('backup-index', ' \
            <a href="#" class="setuptools app backups create">Create New Backup</a> | \
            <a href="#" class="setuptools app backups autobackups noclose">' + ( (setuptools.data.config.automaticBackups === true) ? 'Disable' : 'Enable' ) + ' Auto Backups</a> | \
        ');

    }

    //  when setuptools is not loaded the user will only have the ability to restore backups
    setuptools.lightbox.build('backup-index', ' \
        <a href="#" class="setuptools app backups upload">Upload Backup</a> <br><br> \
    ');

    setuptools.lightbox.build('backup-index', ' \
        <div class="setuptools app backups container"> \
            <div class="setuptools app backups options"> \
    ');

    BackupList = setuptools.app.backups.listAll();

    if ( BackupList.length === 0 ) {

        setuptools.lightbox.build('backup-index', ' \
                    <div><strong>No stored backups located.</strong></div> \
                </div>\
            </div>\
        ');

    } else {

        setuptools.lightbox.build('backup-index', ' \
            <div><strong>Stored Backups</strong></div> \
            <select name="BackupName" class="setting">\
        ');

        for ( i = BackupList.length-1; i >= 0; i-- )
            if ( BackupList.hasOwnProperty(i) )
                setuptools.lightbox.build('backup-index', ' \
                    <option value="' + BackupList[i][1] + '" data-filename="' + BackupList[i][4] + '" ' + ( (BackupList[i][1] === setuptools.tmp.SelectedBackupID) ? 'selected' : '' ) + '>' + BackupList[i][3] + '</option>\
                ');

        setuptools.lightbox.build('backup-index', ' \
                </select> \
                </div> \
            </div> \
            <div class="setuptools app backups container" style="float: right;"> \
                <br>\
                <div style="margin-right: 5px;"> \
                    <a href="#" class="setuptools app backups download" title="Download Backup">Download</a> | \
                    <a href="#" class="setuptools app backups restore" title="Restore Backup">Restore</a> | \
                    <a href="#" class="setuptools app backups protect" title="">&nbsp;</a> | \
                    <a href="#" class="setuptools app backups delete" title="Delete Backup">Delete</a> \
                </div> \
            </div> \
        ');

    }

    setuptools.lightbox.settitle('backup-index', 'Muledump Backup Manager');
    setuptools.lightbox.goback('backup-index', setuptools.app.index);
    setuptools.lightbox.drawhelp('backup-index', 'docs/setuptools/backupmanager/index.html', 'Backup Manager Help');
    setuptools.lightbox.display('backup-index');

    //  jquery bindings
    $('.setuptools.app.backups.upload').click(setuptools.app.backups.upload);

    //  create and autoBackups only work for loaded users
    if ( setuptools.loaded === true ) {

        //  these don't require any special arguments
        $('.setuptools.app.backups.create').click(setuptools.app.backups.create);
        $('.setuptools.app.backups.autobackups').click(function() {

            setuptools.data.config.automaticBackups = ( setuptools.data.config.automaticBackups !== true );
            if ( setuptools.app.config.save() === true ) {

                $(this).text((setuptools.data.config.automaticBackups === true) ? 'Disable Auto Backups' : 'Enable Auto Backups');

            } else $(this).text('Error saving settings!').unbind('click');


        });
        //  another time - $('.setuptools.app.backups.createdeep').click(setuptools.app.backups.createDeep);

    }

    //  bind restore click
    $('.setuptools.app.backups.restore').click(function() {
        var BackupID = $('select[name="BackupName"]').val();
        var BackupName = $('select[name="BackupName"] option:selected').text();
        setuptools.app.backups.restoreConfirm(BackupID, BackupName);
    });

    //  bind download click
    $('.setuptools.app.backups.download').click(function() {
        var BackupID = $('select[name="BackupName"]').val();
        var BackupName = $('select[name="BackupName"] option:selected').text();
        var BackupFileName = $('select[name="BackupName"] option:selected').attr('data-filename');
        setuptools.app.backups.download(BackupID, BackupName, BackupFileName);
    });

    //  deletion option
    function bindDelete() {

        $('.setuptools.app.backups.delete').unbind('click');
        $('.setuptools.app.backups.delete').click(function() {
            var SelectedBackupID = $('select[name="BackupName"] option:selected').val();
            var SelectedBackupName = $('select[name="BackupName"] option:selected').text();
            setuptools.app.backups.delete(SelectedBackupID, SelectedBackupName);
        });

    }

    //  protection options
    function updateProtection() {

        var SelectedBackupID = $('select[name="BackupName"] option:selected').val();
        var SelectedBackupName = $('select[name="BackupName"] option:selected').text();
        var SelectedBackupData = JSON.parse(setuptools.storage.read(SelectedBackupID));
        setuptools.tmp.SelectedBackupID = SelectedBackupID;
        $('.setuptools.app.backups.protect').unbind('click');

        if ( typeof SelectedBackupData === 'object' && SelectedBackupData.meta ) {

            var protectButton = $('.setuptools.app.backups.protect');
            if ( typeof SelectedBackupData.meta.protected === 'undefined' ) SelectedBackupData.meta.protected = false;
            if ( SelectedBackupData.meta.protected === false ) {

                $('.setuptools.app.backups.delete').css({'text-decoration': ''}).attr('title', 'Delete Backup');
                bindDelete();

                protectButton.text('Protect').attr('title', 'Enable Backup Protection');
                protectButton.click(function() { setuptools.app.backups.protect(SelectedBackupID, SelectedBackupName, true); });

            } else {

                $('.setuptools.app.backups.delete').css({'text-decoration': 'line-through'})
                    .unbind('click')
                    .addClass('noclose')
                    .attr('title', 'Protected Backup - Expose First');

                protectButton.text('Expose').attr('title', 'Disable Backup Protection');
                protectButton.click(function() { setuptools.app.backups.protect(SelectedBackupID, SelectedBackupName, false); });

            }

        } else {

            $('.setuptools.app.backups.protect').text('Examine').attr('title', 'Problem detected with backup');
            $('.setuptools.app.backups.protect').click(function() { setuptools.app.backups.examine(SelectedBackupID); });

        }

    }

    updateProtection();
    $('select[name="BackupName"]').change(updateProtection);

};

//  for another time as it serves no purpose
//  but this feature would backup the account data stored locally too
//  giving you a snapshot of your account at an exact point-in-time
/*
setuptools.app.backups.createDeep = function() {

    setuptools.lightbox.build('backup-deep', ' \
        A deep backup includes all of your stored account data. <br><br> \
        Proceed with restoration? <br><br>\
        <a href="#" class="setuptools app backups restoreConfirmed">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
    ');

    setuptools.lightbox.display('restore-confirm');
    $('.setuptools.app.backups.restoreCancelled').click(setuptools.app.backups.index);
    $('.setuptools.app.backups.restoreConfirmed').click(function() {
        setuptools.app.backups.restore('local', BackupID, BackupName, SaveExisting, true, true);
    });

};
*/

//  process a user-provided upload
setuptools.app.backups.upload = function() {

    var DoFiles = false;
    if ( setuptools.config.devForcePoint != 'backup-upload' && window.File && window.FileReader && window.FileList && window.Blob ) {

        DoFiles = true;
        setuptools.lightbox.build('backup-upload', ' \
            Please select the backup file you wish to restore. \
            <br><br><input type="file" id="files" name="files[]" class="setuptools app backups uploadFile" style="width: 400px;"> \
        ');

        if ( setuptools.loaded === true ) {

            setuptools.lightbox.build('backup-upload', ' \
                <br><br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
            ');

        }

        setuptools.lightbox.build('backup-upload', ' \
            <br> \
        ');

    } else {

        setuptools.lightbox.build('backup-upload', ' \
            File uploads are not supported by your browser. Please instead paste the contents of the backup file below. \
            <br><br><textarea name="uploadData" class="setuptools app backups uploadData"></textarea> \
        ');

        if ( setuptools.loaded === true ) {

            setuptools.lightbox.build('backup-upload', ' \
                <br><br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
            ');

        }

        setuptools.lightbox.build('backup-upload', ' \
            <br> \
        ');

    }

    setuptools.lightbox.build('backup-upload', ' \
        <br><a href="#" class="setuptools app backups uploadData save noclose" style="font-size: 14px; font-weight: bold;">Select a File</a> \
    ');

    setuptools.lightbox.drawhelp('backup-upload', 'docs/setuptools/backup-upload.html', 'Backup Upload Help');
    setuptools.lightbox.settitle('backup-upload', 'Muledump Backup Manager');
    setuptools.lightbox.goback('backup-upload', setuptools.app.backups.index);
    setuptools.lightbox.display('backup-upload', {variant: 'setuptools-medium'});

    if ( DoFiles === true ) {

        $('input[id="files"]').change(function(e) {

            $('.setuptools.app.backups.uploadData.save').html('Loading File...');
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {

                if ( reader.error ) {

                    $('.setuptools.app.backups.uploadData.save').html('Upload failed');
                    setuptools.lightbox.error('Failed to upload file with error: ' + reader.error, 23);

                } else {

                    //  ready for final click
                    var UploadFile = reader.result;
                    $('.setuptools.app.backups.uploadData.save').html('Restore Backup').removeClass('noclose').click(function () {

                        setuptools.app.backups.restore('upload', UploadFile, 'User-Uploaded', $('input[name="restoreSaveExisting"]').prop('checked'), true, true);

                    });

                }

            }

        });

    }

};

//  restore a backup
setuptools.app.backups.restore = function(RestoreMethod, BackupID, BackupName, SaveExisting, BadEntriesForce, BadSaveForce) {

    //  this function supports restoring both local and uploaded backups
    if ( RestoreMethod === 'local' || RestoreMethod === 'upload' ) {

        if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' ) setuptools.lightbox.error('Required arguments BackupID or BackupName are missing.', 19);
        if ( RestoreMethod === 'local' && !BackupID.match(/^muledump-backup-.*$/) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

        //  when RestoreMethod is upload, BackupID will contain the data
        var BackupFile = ( RestoreMethod === 'local' ) ? setuptools.storage.read(BackupID) : BackupID;

        if ( BackupFile ) {

            //  does it parse
            var BackupData;
            if ( BackupData = JSON.parse(BackupFile) ) {

                //  does meta data exist, and loosely check if it is valid
                if ( typeof BackupData.meta != 'object' || (typeof BackupData.meta === 'object' && typeof BackupData.meta.BackupDate === 'undefined') )
                    setuptools.lightbox.error('Parsed data is not a valid backup object.', 23);

                setuptools.lightbox.drawhelp('restore-confirm', 'docs/setuptools/backup-restoration.html', 'Backup Restoration Help');
                setuptools.lightbox.settitle('restore-confirm', 'Muledump Backup Manager');

                //  is the accounts data valid
                var badEntries = [];
                for ( var i in BackupData.accounts.accounts ) {

                    if (BackupData.accounts.accounts.hasOwnProperty(i)) {

                        var username = i;
                        var password = BackupData.accounts.accounts[i].password;

                        //  if either is provided and the other is empty then this is a bad record
                        if ((username === '' || password === '') && !(username === '' && password === '')) {

                            badEntries.push(BackupData.accounts.accounts[i]);
                            delete BackupData.accounts.accounts[i];

                        } else {

                            //  if neither are provided then it can be ignored
                            if (username.length > 0 && password.length > 0) {

                                //  if a username is provided we should validate it's contents a bit
                                if (username.length > 0) {

                                    //  is it an email address, steam, kongregate, or kabam?
                                    if (!username.match(setuptools.config.regex.email) && !username.match(setuptools.config.regex.guid)) {

                                        BackupData.accounts.accounts[i].username = username;
                                        badEntries.push(BackupData.accounts.accounts[i]);
                                        delete BackupData.accounts.accounts[i];

                                    }

                                }

                            }

                        }

                    }

                }

                //  if there were any bad accounts let's confirm once again
                if ( badEntries.length > 0 && BadEntriesForce !== true ) {

                    setuptools.lightbox.build('restore-confirm', ' \
                        Warning: There were ' + badEntries.length + ' invalid accounts in your backup. They have been removed. <br><br> \
                        Proceed with restoration? <br><br>\
                        <a href="#" class="setuptools app backups restoreConfirmed">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
                    ');

                    setuptools.lightbox.display('restore-confirm');
                    $('.setuptools.app.backups.restoreCancelled').click(setuptools.app.backups.index);
                    $('.setuptools.app.backups.restoreConfirmed').click(function() {
                        setuptools.app.backups.restore(RestoreMethod, BackupID, BackupName, SaveExisting, true, true);
                    });

                } else {

                    //  create a protected backup of the current configuration
                    if ( setuptools.loaded === true && SaveExisting === true ) ExistingBackupObject = setuptools.app.config.backup(true);
                    if ( setuptools.loaded === true && SaveExisting === true && ExistingBackupObject.status === false && BadSaveForce !== true ) {

                        setuptools.lightbox.build('restore-confirm', ' \
                            Warning: Failed to create a backup of the existing configuration.<br><br> \
                            Proceed with restoration? <br><br>\
                            <a href="#" class="setuptools app backups restoreConfirmed">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
                        ');

                        setuptools.lightbox.display('restore-confirm');
                        $('.setuptools.app.backups.restoreCancelled').click(setuptools.app.backups.index);
                        $('.setuptools.app.backups.restoreConfirmed').click(function() {
                            setuptools.app.backups.restore(RestoreMethod, BackupID, BackupName, SaveExisting, true, true, true);
                        });

                    } else {

                        //  remove the metadata set options and version number
                        window.options = BackupData.options;
                        delete BackupData.meta;
                        if ( setuptools.loaded === true ) BackupData.accounts.meta.version = setuptools.data.accounts.meta.version+1;

                        //  update our local data
                        setuptools.data = BackupData;
                        if ( setuptools.app.config.save() === true) {

                            //  update options storage
                            setuptools.storage.write('muledump:options', JSON.stringify(BackupData.options), true);

                            //  done
                            setuptools.lightbox.build('restore-confirm', 'Backup ' + BackupName + ' has been restored. <br><br>This window will reload in a few seconds.');
                            setuptools.lightbox.display('restore-confirm');
                            setuptools.tmp.SelectedBackupID = BackupID;

                            setTimeout(function () {
                                location.reload();
                            }, 3000);

                        } else {

                            setuptools.lightbox.build('restore-confirm', 'Failed to save restored configuration.');
                            setuptools.lightbox.display('restore-confirm');

                        }


                    }

                }

            } else setuptools.lightbox.error("Failed to parse backup data.", 22);

        } else setuptools.lightbox.error("Failed to read backup data with ID " + BackupID, 21);

    } else setuptools.lightbox.error('Restore method ' + RestoreMethod + ' is not a valid option.', 20);

};

//  confirm backup restoration
setuptools.app.backups.restoreConfirm = function(BackupID, BackupName) {

    if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' ) setuptools.lightbox.error('Required arguments BackupID or BackupName are missing.', 19);
    if ( !BackupID.match(/^muledump-backup-.*$/) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

    setuptools.lightbox.build('backup-restore', ' \
        Are you sure you wish to restore the backup ' + BackupName + '? \
        <br><br><a href="#" class="setuptools app backups restoreConfirmed" style="transform: ">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
    ');

    if ( setuptools.loaded === true ) {

        setuptools.lightbox.build('backup-restore', ' \
            <br><br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
        ');

    }

    setuptools.lightbox.build('backup-restore', ' \
        <br> \
    ');

    setuptools.lightbox.goback('backup-restore', setuptools.app.backups.index);
    setuptools.lightbox.drawhelp('backup-restore', 'docs/setuptools/backup-restoration.html', 'Backup Restoration Help');
    setuptools.lightbox.settitle('backup-restore', 'Muledump Backup Manager');
    setuptools.lightbox.display('backup-restore');

    $('.setuptools.app.backups.restoreCancelled').click(setuptools.app.backups.index);
    $('.setuptools.app.backups.restoreConfirmed').click(function() {
        setuptools.app.backups.restore('local', BackupID, BackupName, $('input[name="restoreSaveExisting"]').prop("checked"));
    });

};

//  delete the specified backup
setuptools.app.backups.delete = function(BackupID, BackupName) {

    if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' ) setuptools.lightbox.error("Required arguments BackupID or BackupName missing.", 17);
    if ( !BackupID.match(/^muledump-backup-.*$/) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

    var BackupData = setuptools.storage.read(BackupID);
    if ( BackupData === false ) {

        setuptools.lightbox.build('backup-delete', 'Specified BackupID ' + BackupID + ' was not located.');

    } else {

        BackupData = JSON.parse(BackupData);
        if ( BackupData && typeof BackupData.meta === 'object' ) {

            //  if the backup isn't protected, delete it
            if ( typeof BackupData.meta.protected === 'undefined' || BackupData.meta.protected === false ) {

                if ( setuptools.storage.delete(BackupID) === true ) {
                    setuptools.lightbox.build('backup-delete', 'Successfully deleted backup ' + BackupName + '.');
                } else setuptools.lightbox.build('backup-delete', 'Failed to delete backup ' + BackupName + '.');

            } else setuptools.lightbox.build('backup-delete', ' \
                Cannot delete backup ' + BackupName + ' because it is protected. <br><br> \
                Go back to the previous page and choose \'Expose\' to enable deletion of this backup. \
            ');

        } else {

            if ( setuptools.storage.delete(BackupID) === true ) {
                setuptools.lightbox.build('backup-delete', 'Invalid backup data located. The object has been removed.');
            } else setuptools.lightbox.build('backup-delete', 'Invalid backup data located and it could not be deleted.');

        }

    }

    setuptools.lightbox.drawhelp('backup-delete', 'docs/setuptools/backup-deletion.html', 'Backup Deletion Help');
    setuptools.lightbox.goback('backup-delete', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backup-delete', 'Muledump Backup Manager');
    setuptools.lightbox.display('backup-delete');

};

//  change the protection state of a backup
setuptools.app.backups.protect = function(BackupID, BackupName, BackupProtected) {

    if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' || typeof BackupProtected === 'undefined' ) setuptools.lightbox.error('Required arguments BackupID, BackupName, or protection state are missing.', 15);
    if ( !BackupID.match(/^muledump-backup-.*$/) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

    var BackupData = JSON.parse(setuptools.storage.read(BackupID));
    console.log(BackupData.meta);
    if ( typeof BackupData === 'object' && BackupData.meta ) {

        //  if this key is missing let's add it with the default value
        if ( typeof BackupData.meta.protected === 'undefined' ) BackupData.meta.protected = false;

        ProtectionState = ( BackupProtected === true ) ? 'Protected' : 'Exposed';
        if ( BackupData.meta.protected === BackupProtected ) {

            setuptools.lightbox.build('backups-protect', "Protection state is already set to " + ProtectionState + '.');

        } else {

            //  change backup state
            BackupData.meta.protected = BackupProtected;

            //  save changes
            if ( setuptools.storage.write(BackupID, JSON.stringify(BackupData)) === true ) {
                setuptools.lightbox.cancel('backups-protect');
                setuptools.app.backups.index();
                return;
            } else setuptools.lightbox.build('backups-protect', 'Failed to change protection state.');

        }

        setuptools.lightbox.goback('backups-protect', setuptools.app.backups.index);
        setuptools.lightbox.drawhelp('backups-protect', 'docs/setuptools/backup-protection.html', 'Backup Protection Help');
        setuptools.lightbox.settitle('backup-protect', 'Muledump Backup Manager');
        setuptools.lightbox.display('backups-protect');

    } else setuptools.lightbox.error("Supplied BackupID was not located.", 16);

};

//  download a backup
setuptools.app.backups.download = function(BackupID, BackupName, BackupFileName) {

    if ( !BackupID.match(/^muledump-backup-.*$/) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);
    var BackupData = setuptools.storage.read(BackupID);
    if ( BackupData ) {

        setuptools.lightbox.build('backup-download', ' \
            Backup ' + BackupFileName + ' is ready for download. \
            <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
            <br><br><a download="' + BackupFileName + '.json" href="data:text/json;base64,' + btoa(BackupData) + '" class="setuptools config download noclose">Download Backup</a> \
        ');

    } else {

        setuptools.lightbox.build('backup-download', 'No backup exists with the name ' + BackupName + '.');

    }

    //  display the download box
    setuptools.lightbox.goback('backup-download', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backup-download', 'Muledump Backup Manager');
    setuptools.lightbox.display('backup-download');
    if ( BackupData ) setuptools.app.config.downloadAck();

};

//  create a backup
setuptools.app.backups.create = function() {

    var BackupObject = setuptools.app.config.backup();

    if ( BackupObject.status === false ) setuptools.lightbox.build('backup-createbackup-', '<br><br><span class="setuptools error">Warning</span>: Failed to save backup to browser storage');

    setuptools.lightbox.build('backup-create', ' \
        Backup has been created with name ' + BackupObject.BackupName + '. \
        <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
        <br><br><a download="' + BackupObject.BackupName + '.json" href="data:text/json;base64,' + btoa(BackupObject.BackupData) + '" class="setuptools config download noclose">Download Backup</a> \
    ');

    //  display the download box
    if ( setuptools.firsttime === true ) setuptools.lightbox.build('backup-create', '<br><br>Once ready you must reload Muledump.');
    if ( setuptools.firsttime === false ) setuptools.lightbox.goback('backup-create', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backup-create', 'Muledump Backup Manager');
    setuptools.lightbox.display('backup-create');
    setuptools.app.config.downloadAck();
    setuptools.tmp.SelectedBackupID = BackupObject.BackupID;

};

//  list all available backups
setuptools.app.backups.listAll = function() {

    //  find all backups in local storage
    var backups = [];
    for ( var i in localStorage ) {
        if ( localStorage.hasOwnProperty(i) ) {
            regex = new RegExp('^' + setuptools.config.keyPrefix + '(muledump-backup-([0-9]*))$');
            if ( matches = i.match(regex) ) {
                var date = new Date(Number(matches[2]));
                var BackupName = date.getFullYear() + '-' +
                    ('0' + date.getMonth()).slice(-2) + '-' +
                    ('0' + date.getDate()).slice(-2) + ' at ' +
                    ('0' + date.getHours()).slice(-2) + ':' +
                    ('0' + date.getMinutes()).slice(-2) + ':' +
                    ('0' + date.getSeconds()).slice(-2);
                var BackupFileName = "muledump-backup-" +
                    date.getFullYear() +
                    ('0' + date.getMonth()).slice(-2) +
                    ('0' + date.getDate()).slice(-2) + '-' +
                    ('0' + date.getHours()).slice(-2) +
                    ('0' + date.getMinutes()).slice(-2) +
                    ('0' + date.getSeconds()).slice(-2);
                backups.push([matches[0], matches[1], matches[2], BackupName, BackupFileName]);

            }
        }
    }

    //  now sort them by date in descending order
    backups.sort(function(a, b) {
        return a[1] + b[1];
    });

    return backups;

};

//  cleanup config backups by enforcing the maximumBackupCount setting
setuptools.app.backups.cleanup = function() {

    var backups = setuptools.app.backups.listAll();

    var Candidates = [];
    for ( i = backups.length-1; i >= 0; i-- )
        if ( backups.hasOwnProperty(i) ) {

            var BackupData = JSON.parse(setuptools.storage.read(backups[i][1]));
            if (typeof BackupData.meta.protected === 'undefined' || BackupData.meta.protected === false ) Candidates.push(backups[i]);

    }

    //  if backup length exceeds the maximum then let's clean up
    if ( Candidates.length > setuptools.data.config.maximumBackupCount ) {
        window.techlog("SetupTools/Backups Cleaning up " + (Candidates.length-setuptools.data.config.maximumBackupCount) + " backups", 'force');
        for ( var i = setuptools.data.config.maximumBackupCount; i < Candidates.length; i++ ) {
            console.log(Candidates[i]);
            window.techlog("SetupTools/Backups Deleting " + Candidates[i][1], 'force');
            setuptools.storage.delete(Candidates[i][1]);
        }
    }

};

//  first time setup walk-through
setuptools.app.initsetup.index = function() {

    setuptools.lightbox.build('initsetup-index', '<span>Do you have <a href="#" class="setuptools initsetup page2">one or a few accounts</a> or <a href="#" class="setuptools initsetup page3">many accounts</a>?</span>');
    setuptools.lightbox.goback('initsetup-index', setuptools.app.index);
    setuptools.lightbox.drawhelp('initsetup-index', 'docs/setuptools/initsetup/index.html', 'Account Setup Help');
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
    function createRow(username, password, enabled) {

        rowId = Number(rowId)+Number(1);

        if ( !username ) username = '';
        if ( !password ) password = '';
        if ( username === '' && password === '' ) enabled = true;
        if ( typeof setuptools.tmp.userAccounts['row-' + rowId] === 'undefined' ) setuptools.tmp.userAccounts['row-' + rowId] = {username: username, password: password};
        if ( typeof setuptools.tmp.userAccounts['row-' + rowId].enabled === 'undefined' ) setuptools.tmp.userAccounts['row-' + rowId].enabled = true;
        if ( typeof enabled === 'boolean' || typeof enabled === 'undefined' ) setuptools.tmp.userAccounts['row-' + rowId].enabled = enabled;
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
    setuptools.lightbox.build('initsetup-page2', ' \
        Enter your account information in the lines below. Click the + to add more accounts.<br><br>\
        <div class="setuptools app initsetup container"> \
            <div class="setuptools app initsetup accounts"> \
                <input type="checkbox" name="checkAll" checked title="Disable All Accounts"> \
                <div style="font-weight: bold">Account Email or ID</div> \
                <div style="font-weight: bold">Account Password</div> \
            </div> \
        </div> \
        <div style="float: left; width: 100%;"> \
            <br> <a href="#" class="setuptools app initsetup save">Save Accounts</a> \
            ' + ( (typeof setuptools.originalAccountsJS === 'object') ? '<a href="#" class="setuptools app import save" style="float: left;">Import Existing Accounts.js</a>' : '' ) + '\
        </div> \
    ');
    setuptools.lightbox.goback('initsetup-page2', ( setuptools.firsttime === true ) ? setuptools.app.initsetup.index : setuptools.app.index);
    setuptools.lightbox.drawhelp('initsetup-page2', 'docs/setuptools/initsetup/manual-input.html', 'Account Setup Help');
    setuptools.lightbox.display('initsetup-page2');

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
    $('.setuptools.app.initsetup.save').click(setuptools.app.initsetup.page4);
    $('.setuptools.app.import.save').click(setuptools.app.initsetup.page5);

    //  react to check all box
    $('input[name="checkAll"]').change(function() {

        var CheckState = $(this).prop('checked');
        console.log(CheckState);
        for ( var row in setuptools.tmp.userAccounts )
            if ( setuptools.tmp.userAccounts.hasOwnProperty(row) ) {

                setuptools.tmp.userAccounts[row].enabled = CheckState;
                $('#' + row + ' input[name="enabled"]').prop('checked', CheckState);
                if ( CheckState === false ) $('input[name="checkAll"]').attr('title', 'Enable All Accounts');
                if ( CheckState === true ) $('input[name="checkAll"]').attr('title', 'Disable All Accounts');

            }

    });

};

//  pasting a list that is well-formatted
setuptools.app.initsetup.page3 = function() {

    setuptools.lightbox.build('initsetup-page3', 'Sounds good! Let\'s gather some information.');
    setuptools.lightbox.goback('initsetup-page3', setuptools.app.initsetup.index);
    setuptools.lightbox.drawhelp('initsetup-page3', 'docs/setuptools/initsetup/advanced-import.html', 'Advanced Import Help');
    setuptools.lightbox.display('initsetup-page3');

};

//  process supplied accounts from page2
setuptools.app.initsetup.page4 = function() {

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
        setuptools.lightbox.build('initsetup-page4', ' \
            Oops, there was a problem. You did not provide any valid user accounts. \
            <br><br>Did you make sure to provide both a username and password? \
            <br><br> \
        ');

    } else {

        setuptools.lightbox.build('initsetup-page4', 'Your changes have been saved. \
        <br><br>It is recommended you download <a href="#" class="setuptools config backup">a backup</a> of your Muledump configuration. \
            <br><br>If you are ready, you may now proceed to <a href="#" class="setuptools app loadaccounts">Muledump</a>. \
        ');

        if ( badEntries.length > 0 ) setuptools.lightbox.build('initsetup-page4', '<br><br>Warning: ' + badEntries.length + ' supplied accounts was invalid. You may go back and try again if you wish.');

        //  convert traditional accounts.js format to setuptools format

        //  if the config is currently format 0 we need to convert to format 1
        if ( setuptools.app.config.validateFormat(setuptools.data.accounts, 0) === true ) setuptools.data.accounts = setuptools.app.config.convert(setuptools.data.accounts, 1);

        //  save the configuration
        setuptools.data.config.enabled = true;
        var saveResult = setuptools.app.config.save();
        window.techlog('SetupTools/Saving configuration');

    }

    //  display the box
    setuptools.lightbox.goback('initsetup-page4', setuptools.app.initsetup.page2);
    setuptools.lightbox.drawhelp('initsetup-page4', 'docs/setuptools/new-user-setup.html', 'Help');
    setuptools.lightbox.display('initsetup-page4', {variant: 'setuptools-medium'});
    $('.setuptools.app.loadaccounts').click(function() {
        location.reload();
    });
    $('.setuptools.config.backup').click(setuptools.app.backups.create);

    if ( saveResult === false ) setuptools.app.config.saveError();

    //  aaaand we're done

};

//  confirm import of accounts.js
setuptools.app.initsetup.page5 = function() {

    FoundKeys = Object.keys(setuptools.originalAccountsJS).length;
    if ( FoundKeys > 0 ) {

        setuptools.lightbox.build('initsetup-page5', ' \
            Proceed with import of ' + FoundKeys + ' located accounts in Accounts.js? \
            <br><br><a href="#" class="setuptools app initsetup importConfirmed">Yes, import</a> or <a href="#" class="setuptools app initsetup importCancelled">Cancel</a> \
            <br><br><input type="checkbox" name="accountjsMerge" checked> Merge with existing accounts\
        ');
        setuptools.lightbox.goback('initsetup-page5', setuptools.app.initsetup.index);

    } else {

        setuptools.lightbox.build('initsetup-page5', ' \
            Could not locate any accounts in accounts.js. \
        ');
        setuptools.lightbox.goback('initsetup-page5', setuptools.app.index);

    }

    setuptools.lightbox.drawhelp('initsetup-page5', 'docs/setuptools/initsetup/accountsjs-import.html', 'Accounts.js Import Help');
    setuptools.lightbox.display('initsetup-page5');

    $('.setuptools.app.initsetup.importCancelled').click(setuptools.app.initsetup.page2);
    $('.setuptools.app.initsetup.importConfirmed').click(function() {

        //  this click implies setuptools should be enabled
        setuptools.data.config.enabled = true;

        if ( typeof setuptools.tmp.userAccounts === 'undefined' ) setuptools.tmp.userAccounts = {};
        var x = Number(Object.keys(setuptools.tmp.userAccounts).length);
        if ( $('input[name="accountjsMerge"]').prop('checked') === false ) {

            setuptools.tmp.userAccounts = {};
            x = Number(0);

        }

        for ( var i in setuptools.originalAccountsJS ) {

            if (setuptools.originalAccountsJS.hasOwnProperty(i)) {

                console.log(i, setuptools.originalAccountsJS[i]);
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

        //  send user back to review screen
        setuptools.app.initsetup.page2();

    });

};

//  assist in account.js import for first-time users
setuptools.app.initsetup.page6 =  function() {

    setuptools.lightbox.build('initsetup-page6', ' \
        There are two ways you can import your accounts.js file.\
        <br><br>First - \
        ' + ( (setuptools.data.config.enabled === true) ? '<a href="#" class="setuptools app enable noclose">SetupTools Enabled</a>' : '<a href="#" class="setuptools app enable noclose">Enable SetupTools</a>' ) + ' \
        <br><br>Second - \
    ');

    if ( Object.keys(setuptools.originalAccountsJS).length > 0 ) setuptools.lightbox.build('initsetup-page6', ' \
        Import a <a href="#" class="setuptools app import accountsJS noclose">Local Accounts.js</a> or \
     ');
    setuptools.lightbox.build('initsetup-page6', '<a href="#" class="setuptools app import upload noclose">Upload an Accounts.js</a>');
    setuptools.lightbox.goback('initsetup-page6', setuptools.app.index);
    setuptools.lightbox.drawhelp('initsetup-page6', 'docs/setuptools/initsetup/accountsjs-import.html', 'Accounts.js Import Help');
    setuptools.lightbox.settitle('initsetup-page6', 'Muledump Accounts.js Import');
    setuptools.lightbox.display('initsetup-page6');

    if ( setuptools.data.config.enabled === false ) {

        $('.setuptools.app.enable').click(function () {
            setuptools.data.config.enabled = true;
            $(this).unbind('click').css({'pointer-events': 'none', 'cursor': 'default'}).text('SetupTools Enabled');
            $('.setuptools.app.import').removeClass('noclose');
            $('.setuptools.app.import.accountsJS').click(setuptools.app.initsetup.page5);
            $('.setuptools.app.import.upload').click(setuptools.app.initsetup.page7);
        });

    } else {

        $('.setuptools.app.enable').unbind('click').css({'pointer-events': 'none', 'cursor': 'default'}).text('SetupTools Enabled');
        $('.setuptools.app.import').removeClass('noclose');
        $('.setuptools.app.import.accountsJS').click(setuptools.app.initsetup.page5);
        $('.setuptools.app.import.upload').click(setuptools.app.initsetup.page7);

    }

};

//  upload and parse accounts.js
setuptools.app.initsetup.page7 = function() {

    var DoFiles = false;
    if ( setuptools.config.devForcePoint != 'restorejs-upload' && window.File && window.FileReader && window.FileList && window.Blob ) {

        DoFiles = true;
        setuptools.lightbox.build('initsetup-page7', ' \
            Please select your accounts.js file. \
            <br><br><input type="file" id="files" name="files[]" class="setuptools app initsetup uploadFile" style="width: 400px;"> \
        ');

        setuptools.lightbox.build('initsetup-page7', ' \
            <br> \
        ');

    } else {

        setuptools.lightbox.build('initsetup-page7', ' \
            File uploads are not supported by your browser. Please instead paste the contents of the accounts.js file below. \
            <br><br><textarea name="uploadData" class="setuptools app initsetup uploadData"></textarea> \
        ');

        setuptools.lightbox.build('initsetup-page7', ' \
            <br> \
        ');

    }

    setuptools.lightbox.build('initsetup-page7', ' \
        <br><div class="setuptools app initsetup uploadResults" style="float: left;"></div><a href="#" class="setuptools app initsetup uploadData save noclose" style="font-size: 14px; font-weight: bold;">Select a File</a> \
    ');

    setuptools.lightbox.drawhelp('initsetup-page7', 'docs/setuptools/accountsjs-upload.html', 'Accounts.js Upload Help');
    setuptools.lightbox.settitle('initsetup-page7', 'Muledump Accounts.js Import');
    setuptools.lightbox.goback('initsetup-page7', setuptools.app.initsetup.page6);
    setuptools.lightbox.display('initsetup-page7', {variant: 'setuptools-medium'});

    if ( DoFiles === true ) {

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

                    var UploadParse = {accounts: {}, settings: {}};
                    var UploadFile = reader.result.split("\n");
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
                            for ( var i in UploadParse.accounts )
                                if ( UploadParse.accounts.hasOwnProperty(i) )
                                    setuptools.app.config.createUser(i, UploadParse.accounts[i], true, 0, false, 'set', setuptools.app.config.determineFormat(setuptools.data.accounts));

                            setuptools.app.initsetup.page2();

                        } else {

                            $('.setuptools.app.initsetup.uploadResults').html('You must load a valid accounts.js first.');

                        }

                    });

                }

            }

        });

    }

};

//
//  root tools
//

//  initialize setup tools
setuptools.init.main = function(window) {

    setuptools.window = window;

    //  store the original accounts.js object if present
    if ( typeof window.accounts === 'object' && (
                                                (Object.keys(setuptools.window.accounts).length < 3 && !setuptools.window.accounts.email && !setuptools.window.accounts.email2) ||
                                                (Object.keys(setuptools.window.accounts).length > 3))
                                                ) {

        setuptools.originalAccountsJS = window.accounts;

    }

    //  check if we should bypass
    if ( setuptools.storage.test() === false ) {

        //  when we bypass, accounts.js is allowed to populate the accounts var and we won't touch it
        window.techlog('SetupTools - LocalStorage not supported', 'force');
        setuptools.error = true;

        //  a browser without local storage is a sad browser (or ie, which is much, much worse)
        if ( setuptools.app.checknew() === true ) setuptools.lightbox.create(' \
            Welcome to Muledump first time setup. \
            <br><br>Unfortunately, your browser does not support local storage. This greatly reduces the functions and features available to you. \
            <br><br>See <a href="https://jakcodex.github.io/">Setup Help</a> for more information. \
            <br><br>Otherwise you can perform a <a class="help setup" \
                title="Manual Installation Help" \
                href="https://jakcodex.github.io/muledump/" \
                data-featherlight="<p>Placeholder</p>" \
                data-featherlight-type="html" \
                data-featherlight-open-speed="0" \
                data-featherlight-close-speed="0" \
                target="_blank" \
                >Manual Installation</a>. \
        ', {variant: 'setuptools-small'});

    } else {

        //  new users can't load muledump so we'll help them get started

        if ( setuptools.app.checknew() === true ) {

            window.techlog('Notice: You may ignore any accounts.js file not found errors because SetupTools is running', 'force');
            setuptools.firsttime = true;
            setuptools.app.index();

        } else {

            //  load our stored configuration if available
            if ( setuptools.storage.read('configuration') ) {

                //  merge stored configuration into runtime configuration
                var ImportData = JSON.parse(setuptools.storage.read('configuration'));
                for ( var i in ImportData )
                    if ( ImportData.hasOwnProperty(i) )
                        setuptools.data[i] = ImportData[i];

            }

            //  setuptools in bypass mode
            if ( setuptools.config.devForcePoint != 'bad-config' && setuptools.data.config.enabled === false ) {

                setuptools.loaded = false;
                window.techlog('SetupTools/Init - Bypassing', 'force');

                if ( typeof setuptools.window.accounts === 'undefined' ||

                    //  accounts variable present but not an object
                    typeof setuptools.window.accounts !== 'object' ||

                    //  accounts object present and in the default state
                    (typeof setuptools.window.accounts === 'object' &&
                    Object.keys(setuptools.window.accounts).length < 3 &&
                    setuptools.window.accounts.email && setuptools.window.accounts.email2)
                ) {

                    setuptools.lightbox.build('bypass-help', ' \
                        No Muledump accounts available to display. \
                        <br><br>SetupTools is disabled and your accounts.js file is not configured. \
                        <br><br>You can enable SetupTools in the <a href="#" class="setuptools app config settings">settings menu</a>. \
                    ');
                    setuptools.lightbox.drawhelp('bypass-help', 'docs/setuptools/bypass', 'Setup Tools Help');
                    setuptools.lightbox.display('bypass-help');
                    $('.setuptools.app.config.settings').click(setuptools.app.config.settings);

                }

            //  setuptools loaded successfully
            } else if ( setuptools.config.devForcePoint != 'bad-config' && setuptools.data.config.enabled === true && setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true ) {

                setuptools.loaded = true;
                window.techlog('SetupTools/Init - Loaded stored configuration', 'force');
                window.techlog('Notice: You may ignore any accounts.js file not found errors because SetupTools loaded successfully', 'force');

                //  load our configuration into the window
                for ( var i in setuptools.data.config )
                    if ( setuptools.data.config.hasOwnProperty(i) )
                        window[i] = setuptools.data.config[i];

                //  if no accounts are active let's alert the user
                var ActiveAccounts = Object.keys(setuptools.app.config.convert(setuptools.data.accounts, 0)).length;
                if ( ActiveAccounts === 0 ) {

                    setuptools.lightbox.build('noaccounts-help', ' \
                        No Muledump accounts available to display. \
                        <br><br>Did you just enable SetupTools for the first time? \
                        <br><br>Head over to <a href="#" class="setuptools app initsetup accountsjsImport">Accounts.js Import</a> if you need to import user accounts. \
                        <br><br>Manage configured accounts in <a href="#" class="setuptools app initsetup page2">Account Management</a> \
                    ');
                    setuptools.lightbox.drawhelp('noaccounts-help', 'docs/setuptools/noaccounts', 'Account Management Help');
                    setuptools.lightbox.display('noaccounts-help');
                    $('.setuptools.app.initsetup.page2').click(setuptools.app.initsetup.page2);
                    $('.setuptools.app.initsetup.accountsjsImport').click(setuptools.app.initsetup.page5);

                }

            //  setuptools disabled and no accounts js
            } else if ( setuptools.config.devForcePoint != 'bad-config' && (typeof setuptools.data.config.enabled === 'undefined' || setuptools.data.config.enabled === false) ) {

                //  this should've been caught already, but just in case?
                setuptools.firsttime = true;
                setuptools.app.index();

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

    //  load all accounts into the mules object
    for (var i in window.accounts)
        if ( !mules[i] )
            mules[i] = new Mule(i);

    //  look for non-existent or disabled accounts present in the mules object
    for ( var i in mules )
        if ( mules.hasOwnProperty(i) )
            if ( setuptools.app.config.userExists(i) === false || setuptools.app.config.userEnabled(i) === false ) {
                mules[i].dom.remove();
                delete mules[i];
            }

    //  mule queries are now ran in serial instead of in parallel to account for Deca rate limiting
    window.MuleQueue = new window.MQObject(mules);

    //  load mules into the request queue
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
