//  muledump setup tools - ui-based accounts.js management

//  setuptools object layout
var setuptools = {
    error: false,
    loaded: false,
    firsttime: false,
    hosted: false,
    originalAccountsJS: false,
    config: {},
    tmp: {},
    copy: {config: {}},
    data: {
        config: {}
    },
    init: {},
    storage: {},
    app: {
        accounts: {},
        groups: {},
        config: {},
        backups: {},
        muledump: {}
    },
    lightbox: {builds: {}, overrides: {}}
};

//  setuptools configuration
setuptools.config.keyPrefix = 'muledump:setuptools:';
setuptools.config.hostedDomain = 'jakcodex.github.io';
setuptools.config.accountsJS = "\nrowlength = 7;\ntesting = 0;\nprices = 0;\nmulelogin = 0;\nnomasonry = 0;\naccountLoadDelay = 2;\ndebugging = false;\n//ImgurClientID = '';";
setuptools.config.errorColor = '#ae0000';
setuptools.config.devForcePoint = '';
setuptools.config.reloadDelay = 3;
setuptools.config.drawhelpUrlPrefix = ['https://jakcodex.github.io/muledump/'];
setuptools.config.regex = {
    email: new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    guid: new RegExp(/^((steamworks|kongregate|kabam):[a-zA-Z0-9]*)$/i),
    accountsJS: new RegExp(/^(?:(rowlength|testing|prices|mulelink|nomasonry|debugging) ?= ?([a-z0-9]*).*?|.*?(?:'|")((?:(?:[^<>()\[\]\\.,;:\s@"]+(?:\.[^<>()\[\]\\.,;:\s@"]+)*)|(?:".+"))@(?:(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(?:(?:steamworks|kongregate|kabam):[a-zA-Z0-9]*))(?:'|"): ?(?:'|")(.*?)(?:'|").*?)$/, 'i'),
    helpdocsBaseHref: new RegExp(/<!-- ([a-zA-Z]*) (.*?) -->/m)
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
setuptools.data.config.accountLoadDelay = 0;
setuptools.data.config.debugging = false;
setuptools.data.accounts = {};
setuptools.data.muledump = {chsortcustom: {}};
setuptools.data.options = window.options;

//  keep a default list (for settings reset)
setuptools.copy.config = $.extend(true, {}, setuptools.data.config);
setuptools.copy.config.enabled = true;

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
setuptools.storage.read = function(key, skipPrefix) {

    result = '';
    try {
        key = ( skipPrefix === true ) ? key : setuptools.config.keyPrefix + key;
        result = localStorage[key];
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

    if ( setuptools.config.devForcePoint === 'storage-test' ) return false;
    setuptools.storage.write('test', 'test');
    return ( setuptools.storage.read('test') === 'test' );

};

//
//  lightbox tools
//

//  create a lightbox
setuptools.lightbox.create = function(data, config, title) {

    if ( typeof title === 'undefined' ) title = 'Muledump Setup';
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
            ' + ( (title !== false) ? '<h1>' + title + '</h1> ' : '' ) + ' \
            <span>' + data + '</span> \
            </p> \
        ', config);

    }

};

//  provide an interface to override default actions on pages
setuptools.lightbox.override = function(targetPage, targetAction, callback, data) {

    if ( typeof setuptools.lightbox.overrides[targetPage] === 'undefined' ) setuptools.lightbox.overrides[targetPage] = {};
    setuptools.lightbox.overrides[targetPage][targetAction] = {
        callback: callback,
        data: data
    };

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
        var gobackData;
        var drawhelpData;
        for ( var i in setuptools.lightbox.builds[id] )
            if ( setuptools.lightbox.builds[id].hasOwnProperty(i) )
                if ( typeof setuptools.lightbox.builds[id][i] === 'object' ) {

                    //  check for goback data
                    if ( setuptools.lightbox.builds[id][i].iam === 'goback' ) {

                        //  build the gobackData and check for overrides
                        gobackData = setuptools.lightbox.builds[id][i];
                        if ( setuptools.lightbox.overrides[id] && setuptools.lightbox.overrides[id]['goback'] ) {

                            gobackData.text1 = ( typeof setuptools.lightbox.overrides[id]['goback'].data === 'object' && setuptools.lightbox.overrides[id]['goback'].data.text1 ) ? setuptools.lightbox.overrides[id]['goback'].data.text1 : gobackData.text1;
                            gobackData.text2 = ( typeof setuptools.lightbox.overrides[id]['goback'].data === 'object' && setuptools.lightbox.overrides[id]['goback'].data.text2 ) ? setuptools.lightbox.overrides[id]['goback'].data.text2 : gobackData.text2;
                            gobackData.callback = setuptools.lightbox.overrides[id]['goback'].callback;

                        }

                        //  build the message
                        setuptools.lightbox.builds[id][i] = ' \
                            <div style="width: width: 100%; clear: both;" class="setuptools bottom container"> \
                                <div style="clear: left; float: left; height: 100%;"> \
                                    <br><span style="font-weight: 900;">&#10094;&nbsp;</span> \
                                    ' + gobackData.text1 + ' <a href="#" class="setuptools goback">' + gobackData.text2 + '</a> \
                                </div> \
                            </div> \
                        ';

                        //  check for drawhelp data
                    } else if ( setuptools.lightbox.builds[id][i].iam === 'drawhelp' ) {

                        drawhelpData = setuptools.lightbox.builds[id][i];
                        setuptools.lightbox.builds[id][i] = '';

                        //  about this; if I send it to any full-html url, this permanently break $.featherlight
                        //  I wasted 3 hours of my life trying to figure out that bug. What a waste of time.

                        //  for dev we'll just default to a placeholder
                        //data-featherlight="' + setuptools.config.drawhelpUrlPrefix[1] + drawhelpData.link + '" \
                        //data-featherlight-type="ajax" \
                        //data-featherlight="' + url + ' section, div:not(#title)" \
                        //data-featherlight-open-speed="0" \
                        //data-featherlight-close-speed="0" \

                        var url = setuptools.config.drawhelpUrlPrefix[0] + drawhelpData.link.replace(/.md$/i, '');
                        setuptools.lightbox.builds[id].push(' \
                            <a class="drawhelp' + (( setuptools.firsttime === true ) ? ' noclose' : '') + '" \
                            title="' + drawhelpData.title + '" \
                            href="' + url + '" \
                            target="_blank" \
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

        //  bind any help button
        if ( typeof drawhelpData === 'object' ) $('.drawhelp').click(function(e) {

            //  they can ctrl+click and right click to open it still, but we're intercepting left click
            e.preventDefault();

            //  gather base information
            var url = $(this).attr('href');
            var LightboxConfig = {variant: 'setuptools-medium', openSpeed: 0, closeSpeed: 0, closeOnClick: 'background', closeIcon: '&#10005;', closeOnEsc: true};
            var BaseErrorMessage = 'Failed to load help docs. <br><br><a href="' + url + '" target="_blank">Click here</a> to go to the help doc page.';

            //  call the help doc url
            $.ajax(url).done(function(data) {

                //  we receive html content in response and it should have two tags: <section> and <div id="title">
                var ParsedData = $(data);
                var HelpSection = ParsedData.find('section');
                if ( setuptools.config.devForcePoint !== 'drawhelp-ajax' && HelpSection.find('div#title') ) {

                    //  the title is obnoxious and useless in the help bubble so we remove it
                    HelpSection.find('div#title').remove();

                    //  github pages vs source request uri's vary a bit which means we need to rebuild any hyperlinks in the responses
                    if ( matches = HelpSection.html().match(setuptools.config.regex.helpdocsBaseHref) ) {

                        //  baseHref has to be provided for href replacement
                        if ( matches[1] === 'baseHref' ) {

                            var BaseUrl = matches[2];
                            HelpSection.find('a').each(function() {

                                var Href = $(this).attr('href').replace('.md', '');
                                $(this).attr('href', setuptools.config.drawhelpUrlPrefix[0].replace('/muledump/', '') + Href);
                                $(this).attr('target', '_blank');

                            });

                        }

                    }

                    //  draw the lightbox
                    setuptools.lightbox.build('drawhelp', HelpSection.html());
                    setuptools.lightbox.settitle('drawhelp', false);
                    setuptools.lightbox.display('drawhelp', LightboxConfig);

                } else {

                    setuptools.lightbox.build('drawhelp', BaseErrorMessage);
                    if ( setuptools.hosted === false ) setuptools.lightbox.build('drawhelp', '<br><br>If all else fails check the docs/ folder in your Muledump install.');
                    setuptools.lightbox.settitle('drawhelp', drawhelpData.title);
                    setuptools.lightbox.display('drawhelp', LightboxConfig);

                }

            }).fail(function() {

                setuptools.lightbox.build('drawhelp', BaseErrorMessage);
                if ( setuptools.hosted === false ) setuptools.lightbox.build('drawhelp', '<br><br>If all else fails check the docs/ folder in your Muledump install.');
                setuptools.lightbox.build('<br><br>Finally, the specific error indicates you may be having an Internet connection issue.');
                setuptools.lightbox.settitle('drawhelp', drawhelpData.title);
                setuptools.lightbox.display('drawhelp', LightboxConfig);

            });

        });

    }

};

//  erase build data if it exists
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
setuptools.lightbox.goback = function(id, page, text1, text2) {

    if ( !text1 && !text2 ) {
        text1 = 'Go back to the';
        text2 = 'previous page';
    }
    if ( typeof page != 'function' ) setuptools.lightbox.error('The callback value for goback is not valid.', 10);

    if ( !setuptools.lightbox.builds[id] ) setuptools.lightbox.builds[id] = [];
    setuptools.lightbox.builds[id].push({
        iam: 'goback',
        callback: page,
        text1: text1,
        text2: text2
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

//  greet new users with accounts.js files in their folders
setuptools.app.introduction = function() {

    setuptools.lightbox.build('introduction', ' \
        Welcome to Muledump Setuptools! This is a new set of features designed to make management of your Muledump configuration easier.\
        <br><br><h3>Features include:</h3> \
        <br>&middot; Browser-based management of all Muledump accounts and settings \
        <br>&middot; Enable and disable accounts for easier management \
        <br>&middot; Account grouping for managing a large number of accounts \
        <br>&middot; Configuration backup and restore (with automatic backups) \
        <br>&middot; Export full copies of ROTMG account XML data in JSON format \
        <br>&middot; Import of local and uploaded accounts.js files \
        <br><br>For more information see <a href="https://jakcodex.github.io/muledump/docs/setuptools/index" target="_blank">SetupTools</a> in the docs. \
        <br><br>Ready to proceed? \
        <br><br> \
    ');

    if ( typeof setuptools.originalAccountsJS === 'object' ) {

        if ( setuptools.app.config.validateFormat(setuptools.originalAccountsJS, 0) === true ) {

            setuptools.lightbox.build('introduction', ' \
                <a href="#" class="setuptools app intro import local">Yes, let\'s go!</a> or <a href="#" class="setuptools app intro cancel">No, close SetupTools</a> \
            ');

        } else {

            setuptools.lightbox.build('introduction', ' \
                An accounts.js file was located but the accounts object was not valid. \
                <br><br>You can <a href="#" class="setuptools app intro import upload">upload an accounts.js</a> file instead. \
            ');

        }

    } else {

        setuptools.lightbox.build('introduction', ' \
            Header over to the <a href="#" class="setuptools app intro accounts">Accounts Manager</a> to get started. \
        ');

    }

    setuptools.lightbox.override('accounts-accountsjs-import', 'goback', setuptools.app.introduction);
    setuptools.lightbox.override('accounts-accountsjs-import', 'cancel', setuptools.app.introduction);
    setuptools.lightbox.drawhelp('introduction', 'docs/setuptools/index', 'SetupTools Introduction');
    setuptools.lightbox.settitle('introduction', 'Muledump SetupTools Introduction');
    setuptools.lightbox.display('introduction', {variant: 'setuptools-halfsies'});

    //  import user settings from accounts.js if they exist
    $('.setuptools.app.intro').click(function() {

        for ( var i in setuptools.copy.config )
            if ( setuptools.copy.config.hasOwnProperty(i) )
                if ( typeof window[i] !== 'undefined' )
                    setuptools.data.config[i] = window[i];

        setuptools.data.config.enabled = true;

    });
    $('.setuptools.app.intro.accounts').click(setuptools.app.accounts.manager);
    $('.setuptools.app.intro.import.local').click(setuptools.app.accounts.AccountsJSImportLocal);
    $('.setuptools.app.intro.import.upload').click(setuptools.app.accounts.AccountsJSImportUpload);

};

//  start page for setup tools
setuptools.app.index = function(config) {

    if ( typeof config !== 'object' ) config = {};

    //  cleanup for a fresh start
    delete setuptools.tmp.SelectedBackupID;

    //  look for a fresh configuration
    if ( setuptools.app.checknew() === true ) {

        var variant = 'setuptools-small';
        setuptools.lightbox.build('main', ' \
            Welcome to Muledump Account Setup Tools! \
            <br><br>It looks like you are new here. Setup Tools will help you get started with Muledump. Whether you\'re a new user or returning user it is easy to get up and running. \
            <br><br>New users can <a href="#" class="setuptools accounts manage">click here</a> to begin. \
            <br><br>Returning users can <a href="#" class="setuptools config restore">restore a backup</a>. \
            <br><br>Want to import an <a href="#" class="setuptools config import">existing accounts.js</a>? \
        ');

    } else {

        if ( setuptools.loaded === false ) {

            setuptools.app.introduction();
            return;

        }

        var variant = 'setuptools-medium-centered';
        setuptools.lightbox.build('main', ' \
            <div style="width: 100%; text-align: center;">\
                Welcome to Muledump Account Setup Tools! \
                <br><br>Please choose from the following choices. \
                <br><br><a href="#" class="setuptools accounts manage">Manage Accounts</a> \
                | <a href="#" class="setuptools accounts groups">Manage Groups</a> \
                <br><br><a href="#" class="setuptools config settings">Muledump Settings</a> \
                | <a href="#" class="setuptools config backup">Backup Management</a> \
            </div> \
        ');

    }

    //  display the built lightbox and register click action
    setuptools.lightbox.settitle('main', 'Muledump SetupTools');
    setuptools.lightbox.override('accounts-manager', 'goback', setuptools.app.index);
    if ( setuptools.app.checknew() === true ) {
        setuptools.lightbox.drawhelp('main', 'docs/setuptools/help/first-time', 'SetupTools Help');
    } else setuptools.lightbox.drawhelp('main', 'docs/setuptools/help/index', 'SetupTools Help');
    setuptools.lightbox.display('main', $.extend(true, {}, config, {'variant': variant}));
    $('.setuptools.accounts.manage').click(setuptools.app.accounts.manager);
    $('.setuptools.accounts.groups').click(setuptools.app.groups.manager);
    $('.setuptools.config.restore').click(setuptools.app.backups.index);
    $('.setuptools.config.backup').click(setuptools.app.backups.index);
    $('.setuptools.config.settings').click(setuptools.app.config.settings);
    $('.setuptools.config.import').click(setuptools.app.accounts.AccountsJSImport);

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

//  so it begins
setuptools.app.groups.manager = function() {

    setuptools.lightbox.build('groups-manager', "Coming soon");
    setuptools.lightbox.settitle('groups-manager', 'Account Group Manager');
    setuptools.lightbox.goback('groups-manager', setuptools.app.index);
    setuptools.lightbox.drawhelp('groups-manager', 'docs/setuptools/help/accounts-manager/groups', 'Account Groups Help');
    setuptools.lightbox.display('groups-manager');

};

//  manage setuptools and muledump settings
setuptools.app.config.settings = function() {

    setuptools.lightbox.build('settings', ' \
        <div class="setuptools app config container"> \
            <div class="setuptools app config settings"> \
                <div>SetupTools Enabled</div> \
                <select name="enabled" class="setting">\
                    <option' + ( (setuptools.data.config.enabled === true) ? ' selected' : '' ) + ' value="1">Yes</option> \
                    <option' + ( (setuptools.data.config.enabled === false) ? ' selected' : '' ) + ' value="0">No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Prevent Auto Download</div> \
                <select name="preventAutoDownload" class="setting">\
                    <option' + ( (setuptools.data.config.preventAutoDownload === true) ? ' selected' : '' ) + ' value="1">Yes</option> \
                    <option' + ( (setuptools.data.config.preventAutoDownload === false) ? ' selected' : '' ) + ' value="0">No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Maximum Backups in Local Storage</div> \
                <select name="maximumBackupCount" class="setting"> \
    ');

    for ( i = 0; i < 31; i++ ) setuptools.lightbox.build('settings', ' \
        <option ' + ( (Number(i) === Number(setuptools.data.config.maximumBackupCount)) ? 'selected' : '' ) + ' value="' + i + '">' + i + '</option> \
    ');

    setuptools.lightbox.build('settings', ' \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Automatic Backups</div> \
                <select name="automaticBackups" class="setting">\
                    <option' + ( (setuptools.data.config.automaticBackups === true) ? ' selected' : '' ) + ' value="1">Yes</option> \
                    <option' + ( (setuptools.data.config.automaticBackups === false) ? ' selected' : '' ) + ' value="0">No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Account Load Delay in Seconds</div> \
                <select name="accountLoadDelay" class="setting"> \
    ');

    for ( i = 0; i <= 60; i++ ) setuptools.lightbox.build('settings', ' \
        <option ' + ( (Number(i) === Number(setuptools.data.config.accountLoadDelay)) ? 'selected' : '' ) + ' value="' + i + '">' + i + '</option> \
    ');

    setuptools.lightbox.build('settings', ' \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Characters Displayed per Row</div> \
                <select name="rowlength" class="setting"> \
    ');

    for ( i = 1; i <= 50; i++ ) setuptools.lightbox.build('settings', ' \
        <option ' + ( (Number(i) === Number(setuptools.data.config.rowlength)) ? 'selected' : '' ) + ' value="' + i + '">' + i + '</option> \
    ');

    setuptools.lightbox.build('settings', ' \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Testing</div> \
                <select name="testing" class="setting">\
                    <option' + ( (setuptools.data.config.testing === 1) ? ' selected' : '' ) + ' value="1">Yes</option> \
                    <option' + ( (setuptools.data.config.testing === 0) ? ' selected' : '' ) + ' value="0">No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Price Display in Tooltips</div> \
                <select name="prices" class="setting">\
                    <option' + ( (setuptools.data.config.prices === 1) ? ' selected' : '' ) + ' value="1">Yes</option> \
                    <option' + ( (setuptools.data.config.prices === 0) ? ' selected' : '' ) + ' value="0">No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Enable One-click Login</div> \
                <select name="mulelogin" class="setting">\
                    <option' + ( (setuptools.data.config.mulelogin === 1) ? ' selected' : '' ) + ' value="1">Yes</option> \
                    <option' + ( (setuptools.data.config.mulelogin === 0) ? ' selected' : '' ) + ' value="0">No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Use Smart Layout</div> \
                <select name="nomasonry" class="setting">\
                    <option' + ( (setuptools.data.config.nomasonry === 0) ? ' selected' : '' ) + ' value="0">Yes</option> \
                    <option' + ( (setuptools.data.config.nomasonry === 1) ? ' selected' : '' ) + ' value="1">No</option> \
                </select> \
            </div> \
            <div class="setuptools app config settings"> \
                <div>Enable Debug Logging</div> \
                <select name="debugging" class="setting">\
                    <option' + ( (setuptools.data.config.debugging === true) ? ' selected' : '' ) + ' value="1">Yes</option> \
                    <option' + ( (setuptools.data.config.debugging === false) ? ' selected' : '' ) + ' value="0">No</option> \
                </select> \
            </div> \
            <a href="#" class="setuptools app config settings action save">Save Settings</a> \
            <a href="#" class="setuptools app config settings action destroy noclose">Reset to Default Settings</a> \
            <a href="#" class="setuptools app config settings action arrrrgbaaad noclose">Erase Configuration</a> \
        </div> \
    ');
    setuptools.lightbox.settitle('settings', 'Muledump Settings');
    setuptools.lightbox.goback('settings', setuptools.app.index);
    setuptools.lightbox.drawhelp('settings', 'docs/setuptools/help/settings-manager', 'Muledump Settings Help');
    setuptools.lightbox.display('settings');

    //  reset the settings to default values
    $('.setuptools.app.config.settings.action.destroy').click(function() {

        $('.setuptools.app.config.settings select').each(function() {

            //  setup
            var name = $(this).attr('name');
            var newvalue = false;

            //  these options are boolean in the config
            if ( ['enabled', 'preventAutoDownload', 'automaticBackups', 'debugging'].indexOf(name) > -1 ) {

                newvalue = ( setuptools.copy.config[name] === true ) ? 1 : 0;

            //  these settings are integers in the config
            } else if ( ['maximumBackupCount', 'rowlength', 'nomasonry', 'accountLoadDelay', 'testing', 'prices', 'mulelogin'].indexOf(name) > -1 ) {

                newvalue = setuptools.copy.config[name];

            } else setuptools.lightbox.error('Setting value does not exist');

            if ( newvalue !== false ) $('.setuptools.app.config select[name="' + name + '"] option[value="' + newvalue + '"]').prop('selected', 'selected');

        });

    });

    //  assist user in erasing setuptools configuration
    $('.setuptools.app.config.settings.action.arrrrgbaaad').click(function() {

        setuptools.lightbox.build('settings-erase-confirm', ' \
            This will complete erase SetupTools and its configuration. It will not erase any accounts.js file. \
            <br><br>Are you sure? \
            <br><br><a href="#" class="setuptools app erase">Yes, erase</a> or <a href="#" class="setuptools app cancelBadThing">No, cancel</a> \
            <br><br><input type="checkbox" name="clearBackups"> Erase backups stored in your browser \
        ');
        setuptools.lightbox.display('settings-erase-confirm', {"openSpeed": 0, "closeSpeed": 0});

        $('.setuptools.app.erase').click(function () {

            var BackupList = [];
            if ( $('input[name="clearBackups"]').prop('checked') === true ) {

                BackupList = setuptools.app.backups.listAll();
                for ( var i in BackupList )
                    if ( BackupList.hasOwnProperty(i) )
                        setuptools.storage.delete(BackupList[i][1]);

            }

            setuptools.storage.delete('configuration');
            setuptools.storage.delete('test');

            setuptools.lightbox.build('settings-erase-completed', ' \
                SetupTools configuration has been erased. \
                ' + ( (BackupList.length > 0) ? '<br><br>Erased ' + BackupList.length + ' backups.' : '') + ' \
                <br><br>This window will reload in a few seconds. \
            ');

            setuptools.lightbox.display('settings-erase-completed', {closeOnClick: false, otherClose: '', closeOnEsc: false, closeIcon: ''});

            setTimeout(function() {
                location.reload();
            }, 3000);

        });

    });

    $('.setuptools.app.config.settings.save').click(function() {

        $(this).unbind('click');

        //  gather our new settings
        var settings = {};
        settings.enabled = ( $('.setuptools.app.config.settings select[name="enabled"]').val() === '1' );
        settings.preventAutoDownload = ( $('.setuptools.app.config.settings select[name="preventAutoDownload"]').val() === '1' );
        settings.maximumBackupCount = $('.setuptools.app.config.settings select[name="maximumBackupCount"]').val();
        settings.automaticBackups = ( $('.setuptools.app.config.settings select[name="automaticBackups"]').val() === '1' );
        settings.rowlength = $('.setuptools.app.config.settings select[name="rowlength"]').val();
        settings.accountLoadDelay = $('.setuptools.app.config.settings select[name="accountLoadDelay"]').val();
        settings.testing = ( $('.setuptools.app.config.settings select[name="testing"]').val() === '1' ) ? 1 : 0;
        settings.prices = ( $('.setuptools.app.config.settings select[name="prices"]').val() === '1' ) ? 1 : 0;
        settings.mulelogin = ( $('.setuptools.app.config.settings select[name="mulelogin"]').val() === '1' ) ? 1 : 0;
        settings.nomasonry = ( $('.setuptools.app.config.settings select[name="nomasonry"]').val() === '0' ) ? 0 : 1;
        settings.debugging = ( $('.setuptools.app.config.settings select[name="debugging"]').val() === '1' );

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
    ), null, 4);

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

    if ( typeof accountConfig === 'undefined' ) accountConfig = setuptools.data.accounts;
    return btoa('accounts = ' + JSON.stringify(setuptools.app.config.convert(accountConfig, 0), null, 4) + setuptools.config.accountsJS);

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

    setuptools.lightbox.build('backups-index', ' \
        <h3>Available Actions</h3> \
    ');

    //  display a varying menu based on if setuptools is loaded or not
    if ( setuptools.loaded === true ) {

        //  for another time - <a href="#" class="setuptools app backups createdeep">Deep Backup</a> | \
        setuptools.lightbox.build('backups-index', ' \
            <a href="#" class="setuptools app backups create">Create New Backup</a> | \
            <a href="#" class="setuptools app backups autobackups noclose">' + ( (setuptools.data.config.automaticBackups === true) ? 'Disable' : 'Enable' ) + ' Auto Backups</a> | \
        ');

    }

    //  when setuptools is not loaded the user will only have the ability to restore backups
    setuptools.lightbox.build('backups-index', ' \
        <a href="#" class="setuptools app backups upload">Upload Backup</a> <br><br> \
    ');

    setuptools.lightbox.build('backups-index', ' \
        <div class="setuptools app backups container"> \
            <div class="setuptools app backups options"> \
    ');

    var BackupList = setuptools.app.backups.listAll();

    if ( BackupList.length === 0 ) {

        setuptools.lightbox.build('backups-index', ' \
                    <div><strong>No stored backups located.</strong></div> \
                </div>\
            </div>\
        ');

    } else {

        setuptools.lightbox.build('backups-index', ' \
            <div><strong>Stored Backups</strong></div> \
            <select name="BackupName" class="setting">\
        ');

        for ( i = BackupList.length-1; i >= 0; i-- )
            if ( BackupList.hasOwnProperty(i) )
                setuptools.lightbox.build('backups-index', ' \
                    <option value="' + BackupList[i][1] + '" data-filename="' + BackupList[i][4] + '" ' + ( (BackupList[i][1] === setuptools.tmp.SelectedBackupID) ? 'selected' : '' ) + '>' + BackupList[i][3] + '</option>\
                ');

        setuptools.lightbox.build('backups-index', ' \
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

    setuptools.lightbox.settitle('backups-index', 'Muledump Backup Manager');
    setuptools.lightbox.goback('backups-index', setuptools.app.index);
    setuptools.lightbox.drawhelp('backups-index', 'docs/setuptools/help/backups-manager/backups', 'Backup Manager Help');
    setuptools.lightbox.display('backups-index');

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

                $('.setuptools.app.backups.delete').removeClass('deleteDisabled').attr('title', 'Delete Backup');
                bindDelete();

                protectButton.text('Protect').attr('title', 'Enable Backup Protection');
                protectButton.click(function() { setuptools.app.backups.protect(SelectedBackupID, SelectedBackupName, true); });

            } else {

                $('.setuptools.app.backups.delete').addClass('deleteDisabled')
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

    if ( BackupList.length > 0 ) updateProtection();
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

    setuptools.lightbox.display('backups-restore-confirmed');
    $('.setuptools.app.backups.restoreCancelled').click(setuptools.app.backups.index);
    $('.setuptools.app.backups.restoreConfirmed').click(function() {
        setuptools.app.backups.restore('local', BackupID, BackupName, SaveExisting, true, true);
    });

};
*/

//  process a user-provided upload
setuptools.app.backups.upload = function(manual) {

    function ParseUploadedFile(FileContents) {

        //  ready for final click
        var UploadFileJSON = false;
        try {
            UploadFileJSON = JSON.parse(FileContents);
        } catch(e) {}

        if (typeof UploadFileJSON === 'object' && UploadFileJSON.meta) {

            $('.setuptools.app.backups.uploadData.save').html('Restore Backup').removeClass('noclose').click(function () {

                setuptools.app.backups.restore('upload', FileContents, 'User-Uploaded', $('input[name="restoreSaveExisting"]').prop('checked'), true, true);

            });

            $('.setuptools.app.backups.uploadResults').html(' \
                <br>Found ' + Object.keys(UploadFileJSON.accounts.accounts).length + ' accounts, \
                ' + Object.keys(UploadFileJSON.config).length + ' settings, and \
                ' + Object.keys(UploadFileJSON.options).length + ' options \
            ');

        } else {

            $('.setuptools.app.backups.uploadData.save').html('Invalid file');
            $('.setuptools.app.backups.uploadResults').html('File could not be processed.');

        }

    }

    var DoFiles = false;
    if ( setuptools.config.devForcePoint != 'backups-upload' && manual !== true && window.File && window.FileReader && window.FileList && window.Blob ) {

        setuptools.tmp.FileReaderCapable = true;
        DoFiles = true;
        setuptools.lightbox.build('backups-upload', ' \
            Please select the backup file you wish to restore. \
            <br><br><input type="file" id="files" name="files[]" class="setuptools app backups uploadFile" style="width: 475px;"> \
        ');

        if ( setuptools.loaded === true ) {

            setuptools.lightbox.build('backups-upload', ' \
                <br><br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
            ');

        }

        setuptools.lightbox.build('backups-upload', ' \
            <br> \
        ');

    } else {

        if ( typeof setuptools.tmp.FileReaderCapable === 'undefined' && manual !== true ) {

            setuptools.lightbox.build('backups-upload', 'File uploads are not supported by your browser. Please instead paste the contents of the backup file below.');

        } else {

            setuptools.lightbox.build('backups-upload', 'Please paste the contents of the backup file below.');

        }

        setuptools.lightbox.build('backups-upload', ' \
            <br><br><div class="setuptools app backups uploadData"><textarea name="uploadData" spellcheck="false" class="setuptools scrollbar"></textarea></div> \
        ');

        if ( setuptools.loaded === true ) {

            setuptools.lightbox.build('backups-upload', ' \
                <br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
            ');

        }

        setuptools.lightbox.build('backups-upload', ' \
            <br> \
        ');

    }

    setuptools.lightbox.build('backups-upload', ' \
        <div class="setuptools app backups uploadResults" style="margin-top: 6px; margin-bottom: 6px; float: left;"></div> \
        <br><a href="#" class="setuptools app backups uploadData save noclose" style="font-size: 14px; font-weight: bold;">Select a File</a> \
    ');

    if ( DoFiles === false ) {
        if (manual === true) setuptools.lightbox.goback('backups-upload', setuptools.app.backups.upload);
        if (manual !== true) setuptools.lightbox.goback('backups-upload', setuptools.app.backups.index);
    } else setuptools.lightbox.goback('backups-upload', setuptools.app.backups.index);
    setuptools.lightbox.drawhelp('backups-upload', 'docs/setuptools/help/backups-manager/upload', 'Backup Upload Help');
    setuptools.lightbox.settitle('backups-upload', 'Muledump Backup Upload');
    setuptools.lightbox.display('backups-upload', {variant: 'setuptools-large'});

    if ( DoFiles === true ) {

        $('.setuptools.bottom.container').append(' \
            <div style="clear: right; float: right; height: 100%; margin-top: 3px; margin-right: 5px;"> \
                <br><a href="#" class="setuptools app backups switchToUpload">Switch to Manual Upload</a> \
            </div> \
        ');

        $('.setuptools.app.backups.switchToUpload').click(function() {
            setuptools.app.backups.upload(true);
        });

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

                    ParseUploadedFile(reader.result);

                }

            }

        });

    } else {

        $('.setuptools.app.backups.uploadData.save').html('Paste in File');
        $('textarea[name="uploadData"]').change(function() {

            $('.setuptools.app.backups.uploadData.save').html('Loading file...');
            ParseUploadedFile($(this).val());

        })

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

                setuptools.lightbox.drawhelp('backups-restore-confirmed', 'docs/setuptools/help/backups-manager/restore', 'Backup Restoration Help');
                setuptools.lightbox.settitle('backups-restore-confirmed', 'Muledump Backup Manager');

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

                    setuptools.lightbox.build('backups-restore-confirmed', ' \
                        Warning: There were ' + badEntries.length + ' invalid accounts in your backup. They have been removed. <br><br> \
                        Proceed with restoration? <br><br>\
                        <a href="#" class="setuptools app backups restoreConfirmed">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
                    ');

                    setuptools.lightbox.display('backups-restore-confirmed');
                    $('.setuptools.app.backups.restoreCancelled').click(setuptools.app.backups.index);
                    $('.setuptools.app.backups.restoreConfirmed').click(function() {
                        setuptools.app.backups.restore(RestoreMethod, BackupID, BackupName, SaveExisting, true, true);
                    });

                } else {

                    //  create a protected backup of the current configuration
                    if ( setuptools.loaded === true && SaveExisting === true ) ExistingBackupObject = setuptools.app.config.backup(true);
                    if ( setuptools.loaded === true && SaveExisting === true && ExistingBackupObject.status === false && BadSaveForce !== true ) {

                        setuptools.lightbox.build('backups-restore-confirmed', ' \
                            Warning: Failed to create a backup of the existing configuration.<br><br> \
                            Proceed with restoration? <br><br>\
                            <a href="#" class="setuptools app backups restoreConfirmed">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
                        ');

                        setuptools.lightbox.display('backups-restore-confirmed');
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
                            setuptools.lightbox.build('backups-restore-confirmed', 'Backup ' + BackupName + ' has been restored. <br><br>This window will reload in a few seconds.');
                            setuptools.lightbox.display('backups-restore-confirmed');
                            setuptools.tmp.SelectedBackupID = BackupID;

                            setTimeout(function () {
                                location.reload();
                            }, 3000);

                        } else {

                            setuptools.lightbox.build('backups-restore-confirmed', 'Failed to save restored configuration.');
                            setuptools.lightbox.display('backups-restore-confirmed');

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

    setuptools.lightbox.build('backups-restore-confirm', ' \
        Are you sure you wish to restore the backup ' + BackupName + '? \
        <br><br><a href="#" class="setuptools app backups restoreConfirmed" style="transform: ">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
    ');

    if ( setuptools.loaded === true ) {

        setuptools.lightbox.build('backups-restore-confirm', ' \
            <br><br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
        ');

    }

    setuptools.lightbox.build('backups-restore-confirm', ' \
        <br> \
    ');

    setuptools.lightbox.goback('backups-restore-confirm', setuptools.app.backups.index);
    setuptools.lightbox.drawhelp('backups-restore-confirm', 'docs/setuptools/help/backups-manager/restore', 'Backup Restoration Help');
    setuptools.lightbox.settitle('backups-restore-confirm', 'Muledump Backup Manager');
    setuptools.lightbox.display('backups-restore-confirm');

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

    setuptools.lightbox.drawhelp('backup-delete', 'docs/setuptools/help/backups-manager/delete', 'Backup Deletion Help');
    setuptools.lightbox.goback('backup-delete', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backup-delete', 'Muledump Backup Manager');
    setuptools.lightbox.display('backup-delete');

};

//  change the protection state of a backup
setuptools.app.backups.protect = function(BackupID, BackupName, BackupProtected) {

    if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' || typeof BackupProtected === 'undefined' ) setuptools.lightbox.error('Required arguments BackupID, BackupName, or protection state are missing.', 15);
    if ( !BackupID.match(/^muledump-backup-.*$/) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

    var BackupData = JSON.parse(setuptools.storage.read(BackupID));
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
        setuptools.lightbox.drawhelp('backups-protect', 'docs/setuptools/help/backups-manager/protect', 'Backup Protection Help');
        setuptools.lightbox.settitle('backup-protect', 'Muledump Backup Manager');
        setuptools.lightbox.display('backups-protect');

    } else setuptools.lightbox.error("Supplied BackupID was not located.", 16);

};

//  download a backup
setuptools.app.backups.download = function(BackupID, BackupName, BackupFileName) {

    if ( !BackupID.match(/^muledump-backup-.*$/) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);
    var BackupData = false;
    var ParseError = false;
    try {
        BackupData = JSON.stringify(JSON.parse(setuptools.storage.read(BackupID)), null, 4);
    } catch (e) {}
    if ( !BackupData ) ParseError = true;
    if ( BackupData ) {

        setuptools.lightbox.build('backups-download', ' \
            Backup ' + BackupFileName + ' is ready for download. \
            <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
            <br><br><a download="' + BackupFileName + '.json" href="data:text/json;base64,' + btoa(BackupData) + '" class="setuptools config download noclose">Download Backup</a> \
        ');

    } else {

        if ( ParseError === true ) {
            setuptools.lightbox.build('backups-download', 'There was a problem decoding the backup from ' + BackupName + '.');
        } else setuptools.lightbox.build('backups-download', 'No backup exists with the name ' + BackupName + '.');

    }

    //  display the download box
    setuptools.lightbox.goback('backups-download', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backups-download', 'Muledump Backup Manager');
    setuptools.lightbox.display('backups-download');
    if ( BackupData ) setuptools.app.config.downloadAck();

};

//  create a backup
setuptools.app.backups.create = function() {

    var BackupObject = setuptools.app.config.backup();

    if ( BackupObject.status === false ) setuptools.lightbox.build('backups-createbackup-', '<br><br><span class="setuptools error">Warning</span>: Failed to save backup to browser storage');

    setuptools.lightbox.build('backups-create', ' \
        Backup has been created with name ' + BackupObject.BackupName + '. \
        <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
        <br><br><a download="' + BackupObject.BackupName + '.json" href="data:text/json;base64,' + btoa(BackupObject.BackupData) + '" class="setuptools config download noclose">Download Backup</a> \
    ');

    //  display the download box
    if ( setuptools.firsttime === true ) setuptools.lightbox.build('backups-create', '<br><br>Once ready you must reload Muledump.');
    if ( setuptools.firsttime === false ) setuptools.lightbox.goback('backups-create', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backups-create', 'Muledump Backup Manager');
    setuptools.lightbox.display('backups-create');
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
            window.techlog("SetupTools/Backups Deleting " + Candidates[i][1], 'force');
            setuptools.storage.delete(Candidates[i][1]);
        }
    }

};

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
            ' + ( ( setuptools.loaded === true ) ? '<br><a href="#" class="setuptools app export accountsjs save" style="margin-top: 10px; float: left; clear: left;">Export Accounts.js</a>' : '' ) + ' \
            ' + ( ( setuptools.loaded === true ) ? '<br><a href="#" class="setuptools app export deepCopy save" style="margin-top: 10px; float: left; clear: left;">Export Deep Copy</a>' : '' ) + ' \
        </div> \
    ');

    setuptools.lightbox.override('accounts-accountsjs-index', 'goback', setuptools.app.accounts.manager);
    setuptools.lightbox.goback('accounts-manager', ( setuptools.firsttime === true ) ? setuptools.app.accounts.start : setuptools.app.index);
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
            ('0' + date.getMonth()).slice(-2) +
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
    if ( setuptools.loaded === false ) setuptools.lightbox.override('accounts-accountsjs-import', 'goback', setuptools.app.accounts.manager);
    if ( setuptools.loaded === false ) setuptools.lightbox.override('accounts-accountsjs-upload', 'goback', setuptools.app.accounts.manager);
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

    if ( setuptools.firsttime === false ) setuptools.lightbox.override('accounts-manager', 'goback', setuptools.app.accounts.AccountsJSImportLocal);
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
        var UploadFile = FileContents.split("\n");
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
                if ( setuptools.firsttime === false ) setuptools.lightbox.override('accounts-manager', 'goback', setuptools.app.accounts.AccountsJSImportUpload, {text1: 'Go back to', text2: 'Accounts.js Import'});
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
            Please select your accounts.js file. \
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

    //if ( setuptools.firsttime === false ) setuptools.lightbox.override('accounts-manager', 'goback', setuptools.app.accounts.AccountsJSImportUpload);
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

    setuptools.lightbox.build('muledump-chsortcustom-index', ' \
        For account ' + mule.guid + ' \
        <br><br>Enter a list of IDs separated by commas. IDs not included in this list will be omitted from display. \
        <br><br><input type="text" name="chsortcustom" class="setuptools app wideinput" value="' + ( (typeof setuptools.data.muledump.chsortcustom[mule.guid] === 'object') ? setuptools.data.muledump.chsortcustom[mule.guid].join(', ') : '' ) + '"> \
        <br><br><a href="#" class="setuptools app muledump save nomargin">Save List</a> \
    ');

    setuptools.lightbox.settitle('muledump-chsortcustom-index', 'Custom Sort List');
    setuptools.lightbox.display('muledump-chsortcustom-index');

    $('.setuptools.app.muledump.save').click(function() {

        var UserInput = $('input[name="chsortcustom"]').val();
        var Lists = false;
        if ( UserInput.length > 0 ) Lists = setuptools.app.muledump.chsortcustomDedupAndValidate(UserInput, mule);
        var SaveState = false;

        //  save the list if it's at least 1 long
        if ( typeof Lists === 'object' && Lists.FinalList.length > 0 ) {

            setuptools.data.muledump.chsortcustom[mule.guid] = $.extend(true, [], Lists.FinalList);
            SaveState = setuptools.app.config.save();
            if ( setuptools.config.devForcePoint !== 'chsortcustom-save' && SaveState === true ) {

                if ( Lists.RemovedList.length > 0 ) setuptools.lightbox.build('muledump-chsortcustom-save', 'The follow IDs were invalid or duplicates: <br><br>' + Lists.RemovedList.join(', ') + '<br><br>');
                setuptools.lightbox.build('muledump-chsortcustom-save', 'All set!');
                mule.query(false, true);

            }

        } else {

            //  if no list is provided then we're erasing this instead
            if ( UserInput.length === 0 ) {

                delete setuptools.data.muledump.chsortcustom[mule.guid];
                SaveState = setuptools.app.config.save();
                mule.query(false, true);

            } else {

                setuptools.lightbox.build('muledump-chsortcustom-save', ' \
                    Oops! No valid account IDs were detected. \
                    <br><br>Valid formats include: \
                    <br><br><span style="margin-right: 20px; margin-top: 20px;">1, 2, 3, 4, ...</span> \
                    <br><br><span style="margin-right: 20px; margin-top: 20px;">1,2,3,4,...</span> \
                    <br><br><span style="margin-right: 20px; margin-top: 20px;">#1,#2,#3,#4,...</span> \
                    <br><br><span style="margin-right: 20px; margin-top: 20px;">1, #2, 3,#4, ...</span> \
                    <br><br>You get the idea. \
                ');

            }

        }

        if ( Lists === false || Lists.RemovedList.length === 0 ) {

            setuptools.lightbox.cancel('muledump-chsortcustom-save');
            return;

        }

        if ( SaveState === false ) setuptools.lightbox.build('muledump-chsortcustom-save', 'Hmm, there was a problem saving. This setting will reset on page reload.');
        setuptools.lightbox.goback('muledump-chsortcustom-save', function() {
            setuptools.app.muledump.chsortcustom(mule);
        });
        setuptools.lightbox.settitle('muledump-chsortcustom-save', 'Custom Sort List');
        setuptools.lightbox.display('muledump-chsortcustom-save');


    });

};

//
//  root tools
//

//  initialize setup tools
setuptools.init.main = function(window) {

    setuptools.window = window;

    //  is this the hosted version?
    if ( window.location.hostname === setuptools.config.hostedDomain ) setuptools.hosted = true;

    //  store a clone of the original accounts.js object if present
    if ( typeof window.accounts === 'object' && (
                                                (Object.keys(setuptools.window.accounts).length < 3 && !setuptools.window.accounts.email && !setuptools.window.accounts.email2) ||
                                                (Object.keys(setuptools.window.accounts).length > 3))
                                                ) {

        setuptools.originalAccountsJS = $.extend(true, {}, window.accounts);

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
            setuptools.data.config.enabled = true;
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
                        <br><br>You can enable SetupTools by visiting <a href="#" class="setuptools app settings manager">Settings Manager</a>. \
                        <br><br>Or you can head over to the <a href="#" class="setuptools app intro">SetupTools Introduction</a>. \
                    ');
                    setuptools.lightbox.drawhelp('bypass-help', 'docs/setuptools/help/bypass', 'Setup Tools Help');
                    setuptools.lightbox.display('bypass-help');
                    $('.setuptools.app.settings.manager').click(setuptools.app.config.settings);
                    $('.setuptools.app.intro').click(setuptools.app.introduction);

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

                //  adaptive accountLoadDelay when value is set to 0
                window.accountLoadDelay = Number(window.accountLoadDelay);
if ( window.accountLoadDelay === 0 ) {
    var AccountLength = Object.keys(setuptools.app.config.convert(setuptools.data.accounts, 0)).length;
    if ( AccountLength <= 3 ) window.accountLoadDelay = 0;
    if ( AccountLength > 3 && AccountLength <= 6 ) window.accountLoadDelay = 2;
    if ( AccountLength > 6 && AccountLength <= 9 ) window.accountLoadDelay = 5;
    if ( AccountLength > 9 ) window.accountLoadDelay = 12;
    window.techlog('Dynamically set accountLoadDelay to ' + window.accountLoadDelay, 'force');
}

                //  if no accounts are active let's alert the user
                var ActiveAccounts = Object.keys(setuptools.app.config.convert(setuptools.data.accounts, 0)).length;
                if ( ActiveAccounts === 0 ) {

                    setuptools.lightbox.build('noaccounts-help', ' \
                        No Muledump accounts available to display. \
                        <br><br>Did you just enable SetupTools for the first time? \
                        <br><br>Head over to <a href="#" class="setuptools app initsetup accountsjsImport">Accounts.js Import</a> if you need to import user accounts. \
                        <br><br>Manage configured accounts in <a href="#" class="setuptools app accounts manager">Account Management</a> \
                    ');
                    setuptools.lightbox.drawhelp('noaccounts-help', 'docs/setuptools/help/no-accounts', 'Account Management Help');
                    setuptools.lightbox.display('noaccounts-help');
                    $('.setuptools.app.accounts.manager').click(setuptools.app.accounts.manager);
                    $('.setuptools.app.initsetup.accountsjsImport').click(setuptools.app.accounts.AccountsJSImport);

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

        setuptools.lightbox.error('SetupTools cannot run because your browser does not presently support local storage.', 1);

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
