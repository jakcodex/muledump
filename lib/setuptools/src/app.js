//
//  application
//

//  greet new users with accounts.js files in their folders
setuptools.app.introduction = function() {

    //  cleanup for a fresh start
    delete setuptools.tmp.SelectedBackupID;
    setuptools.lightbox.overrides = {};

    setuptools.lightbox.build('introduction', ' \
        Welcome to Muledump Setuptools! This is a new set of features designed to make management of your Muledump configuration easier.\
        <br><br><h3>Features include:</h3> \
        <br>&middot; Browser-based management of all Muledump accounts and settings \
        <br>&middot; Enable and disable accounts for easier management \
        <br>&middot; Account grouping for managing a large number of accounts (soon) \
        <br>&middot; Configuration backup and restore (with automatic backups) \
        <br>&middot; Export full copies of ROTMG account XML data in JSON format \
        <br>&middot; Import of local and uploaded accounts.js files \
        <br><br>For more information see <a href="' + setuptools.config.url + '/docs/setuptools/index" class="setuptools noclose" target="_blank">SetupTools</a> in the docs. \
        <br><br>The wiki has a helfpul <a href="https://github.com/jakcodex/muledump/wiki/Installation-and-Setup" class="setuptools noclose" target="_blank">Installation and Setup Guide</a>. \
        <br><br>Be sure to check out the <a href="' + setuptools.config.url + '/REQUIREMENTS" target="_blank" class="red">Requirements</a> before starting. \
        <br><br>Ready to proceed? \
        <br><br> \
    ');

    if ( typeof setuptools.originalAccountsJS === 'object' ) {

        if ( setuptools.app.config.validateFormat(setuptools.originalAccountsJS, 0) === true ) {

            setuptools.lightbox.build('introduction', ' \
                <div class="setuptools link import local menuStyle cfleft" style="width: 175px;">Yes, let\'s go!</div> \
                <div class="setuptools link cancel menuStyle negative cfright" style="width: 175px;">No, close SetupTools</div> \
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
    setuptools.lightbox.display('introduction', {variant: 'fl-Introduction'});

    //  import user settings from accounts.js if they exist
    $('.setuptools.link.import').click(function() {

        for ( var i in setuptools.copy.config )
            if ( setuptools.copy.config.hasOwnProperty(i) )
                if ( typeof window[i] !== 'undefined' )
                    setuptools.data.config[i] = window[i];

        setuptools.data.config.enabled = true;

    });

    $('.setuptools.app.intro.accounts').click(setuptools.app.accounts.manager);
    $('.setuptools.link.import.local').click(setuptools.app.accounts.AccountsJSImportLocal);
    $('.setuptools.app.intro.import.upload').click(setuptools.app.accounts.AccountsJSImportUpload);

};

//  start page for setup tools
setuptools.app.index = function(config) {

    if ( typeof config !== 'object' ) config = {};

    //  cleanup for a fresh start
    delete setuptools.tmp.SelectedBackupID;
    setuptools.lightbox.overrides = {};

    //  look for a fresh configuration
    var variant;
    if ( setuptools.app.checknew() === true ) {

        variant = 'fl-Index';
        setuptools.lightbox.build('main', ' \
            Welcome to Muledump Account Setup Tools! \
            <br><br>It looks like you are new here. Setup Tools will help you get started with Muledump. Whether you\'re a new user or returning user it is easy to get up and running. \
            <br><br><a href="' + setuptools.config.url + '" class="setuptools noclose" target="_blank">Overview</a> | \
                <a href="#" class="setuptools app intro">Introduction</a> | \
                <a href="https://github.com/jakcodex/muledump/wiki/Installation-and-Setup" class="setuptools noclose" target="_blank">Installation and Setup Guide</a>\
            <br><br>Be sure to check out the <a href="' + setuptools.config.url + '/REQUIREMENTS" target="_blank" class="red">Requirements</a> before starting. \
            <br><br>New users can <a href="#" class="setuptools accounts manage">click here</a> to begin. \
            <br><br>Returning users can <a href="#" class="setuptools config restore">restore a backup</a>. \
            <br><br>Want to import an <a href="#" class="setuptools config import">existing accounts.js</a>? \
        ');

    } else {

        if ( setuptools.state.loaded === false && setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === false ) {

            setuptools.app.introduction();
            return;

        }

        variant = 'fl-IndexCentered';
        setuptools.lightbox.build('main', ' \
            <div class="w100 textCenter">\
                Welcome to the Muledump configuration utility! \
                <br><br>Please choose from the following choices. \
                <br><br>\
                <div class="setuptools link accounts manage menuStyle menuSmall mr5 cfleft">Accounts</div> \
                <div class="setuptools link accounts groups menuStyle menuSmall mr0 cfright">Groups</div> \
                <div class="setuptools link config settings menuStyle menuSmall mt5 mr5 notice cfleft">Settings</div> \
                <div class="setuptools link config backup menuStyle menuSmall mt5 mr0 notice cfright">Backups</div> \
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
    $('.setuptools.app.intro').click(setuptools.app.introduction);

};

//  check if this is a new user
setuptools.app.checknew = function() {

    //  check if a stored configuration is present
    if ( setuptools.config.devForcePoint != 'newuser' && setuptools.state.firsttime === false && setuptools.storage.read('configuration') ) return false;

    //  check if any other account data is present
    return (
        //  check if force point set for this position
        setuptools.config.devForcePoint === 'newuser' ||

        //  first time user detected already
        setuptools.state.firsttime === true ||

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
