//
//  root tools
//

//  initialize setuptools
setuptools.init.main = function(window) {

    setuptools.window = window;

    //  store a clone of the original accounts.js object if present
    if ( typeof window.accounts === 'object' && (
        (Object.keys(setuptools.window.accounts).length < 3 && !setuptools.window.accounts.email && !setuptools.window.accounts.email2) ||
        (Object.keys(setuptools.window.accounts).length >= 3))
    ) {

        //  at some point ctrl+shift+r this into setuptools.copy.originalAccountsJS
        setuptools.originalAccountsJS = $.extend(true, {}, window.accounts);

    }

    //  check if we should bypass
    if ( setuptools.storage.test() === false ) {

        //  when we bypass, accounts.js is allowed to populate the accounts var and we won't touch it
        window.techlog('SetupTools - LocalStorage not supported', 'force');
        setuptools.state.error = true;

        //  a browser without local storage is a sad browser (or ie, which is much, much worse)
        if ( setuptools.app.checknew() === true ) setuptools.lightbox.create(' \
            Welcome to Muledump first time setup. \
            <br><br>Unfortunately, your browser does not support local storage. This greatly reduces the functions and features available to you. \
            <br><br>See <a href="' + setuptools.config.url + '/">Overview</a> for more information. \
            ' + ( (setuptools.state.hosted === true) ? '<br><br>Muledump Online requires local storage support. Download the latest release instead to get started.' : '' ) + ' \
        ');

        setuptools.app.ga('send', 'event', {
            eventCategory: 'runtimeMode',
            eventAction: 'limited'
        });

    } else {

        //  new users can't load muledump so we'll help them get started

        if ( setuptools.app.checknew() === true ) {

            //  load options
            window.options_init(setuptools.state.hosted);

            //  update baseurl
            window.BASEURL = window.BASEURL[+!!window.testing];

            window.techlog('Notice: You may ignore any accounts.js file not found errors because SetupTools is running', 'force');
            setuptools.state.firsttime = true;
            setuptools.data.config.enabled = true;
            setuptools.app.index();

            setuptools.app.ga('send', 'event', {
                eventCategory: 'runtimeMode',
                eventAction: 'newUser'
            });

        } else {

            //  load our stored configuration if available and merge it into the runtime
            if ( setuptools.storage.read('configuration') ) $.extend(
                true,
                setuptools.data,
                JSON.parse(setuptools.storage.read('configuration'))
            );

            //  reposition menu position based on settings
            if ( setuptools.data.config.menuPosition < 2 ) $('#top').css({'text-align': (setuptools.data.config.menuPosition === 0) ? 'left' : 'center'});

            //  setuptools in bypass mode
            if ( setuptools.config.devForcePoint !== 'bad-config' && setuptools.data.config.enabled === false ) {

                setuptools.state.loaded = false;
                window.techlog('SetupTools/Init - Bypassing', 'force');

                //  load options
                window.options_init(setuptools.state.hosted);

                //  update baseurl
                window.BASEURL = window.BASEURL[+!!window.testing];

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

                setuptools.app.ga('send', 'event', {
                    eventCategory: 'runtimeMode',
                    eventAction: 'bypass'
                });

            //  setuptools loaded successfully
            } else if ( setuptools.config.devForcePoint !== 'bad-config' && setuptools.data.config.enabled === true && setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true ) {

                setuptools.state.loaded = true;
                window.techlog('SetupTools/Init - Loaded stored configuration', 'force');
                window.techlog('Notice: You may ignore any accounts.js file not found errors because setuptools loaded successfully', 'force');

                //  load options
                window.options_init(setuptools.state.hosted);

                //  load our configuration into the window
                for ( var i in setuptools.data.config )
                    if ( setuptools.data.config.hasOwnProperty(i) )
                        window[i] = setuptools.data.config[i];

                //  update baseurl
                window.BASEURL = window.BASEURL[+!!window.testing];

                //  run any configuration upgrades
                setuptools.app.upgrade.seek();

                //  run automatic backups
                setuptools.app.backups.auto();

                //  run backup assistant
                setuptools.app.assistants.backups();

                //  run hash navigation
                setuptools.app.hashnav();
                window.onhashchange = setuptools.app.hashnav;

                //  run basic ga events
                setuptools.app.ga('init');

                //  update totals width
                $('#totals').css({'max-width': ( (setuptools.data.config.totalswidth === 0) ?
                    (setuptools.config.totalsItemWidth*(Math.floor(($(window).innerWidth()-30)/setuptools.config.totalsItemWidth)))-setuptools.config.totalsItemWidth+2 :
                    (setuptools.data.config.totalswidth*setuptools.config.totalsItemWidth)+2
                )});

                //  if no accounts are active let's alert the user
                var ActiveAccounts = Object.keys(setuptools.app.config.convert(setuptools.data.accounts, 0)).length;
                if ( ActiveAccounts === 0 ) {

                    setuptools.lightbox.build('noaccounts-help', 'There are no enabled accounts');

                    if ( setuptools.state.hosted === false ) {

                        setuptools.lightbox.build('noaccounts-help', ' \
                            <br><br>Did you just enable SetupTools for the first time? \
                            <br><br>Head over to <a href="#" class="setuptools app initsetup accountsjsImport">Accounts.js Import</a> if you need to import user accounts. \
                        ');

                    }

                    setuptools.lightbox.build('noaccounts-help', '<br><br>Manage configured accounts in <a href="#" class="setuptools app accounts manager">Account Management</a>');

                    setuptools.lightbox.drawhelp('noaccounts-help', 'docs/setuptools/help/no-accounts', 'Account Management Help');
                    setuptools.lightbox.display('noaccounts-help');
                    $('.setuptools.app.accounts.manager').click(setuptools.app.accounts.manager);
                    $('.setuptools.app.initsetup.accountsjsImport').click(setuptools.app.accounts.AccountsJSImport);

                }

                //  setuptools disabled and no accounts js
            } else if ( setuptools.config.devForcePoint !== 'bad-config' && (typeof setuptools.data.config.enabled === 'undefined' || setuptools.data.config.enabled === false) ) {

                //  load options
                window.options_init(setuptools.state.hosted);;

                //  this should've been caught already, but just in case?
                setuptools.state.firsttime = true;
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
    if ( setuptools.state.loaded === true ) {

        //  load accounts from setuptools config
        window.accounts = setuptools.app.config.convert(setuptools.data.accounts, 0);

        //  load accounts from groups manager config
        if ( setuptools.data.config.groupsMergeMode > 0 ) {

            var groupAccounts = setuptools.app.groups.load(window.accounts);
            if ( typeof groupAccounts === 'object' && Object.keys(groupAccounts).length > 0 ) window.accounts = groupAccounts;

        }

        //  adaptive accountLoadDelay when value is set to 0
        window.accountLoadDelay = Number(window.accountLoadDelay);
        if ( window.accountLoadDelay === 0 ) {
            var AccountLength = Object.keys(window.accounts).length;
            if ( AccountLength < 10 ) window.accountLoadDelay = 0;
            if ( AccountLength >= 10 && AccountLength <= 20 ) window.accountLoadDelay = 2;
            if ( AccountLength >= 20 && AccountLength < 30 ) window.accountLoadDelay = 5;
            if ( AccountLength >= 30 ) window.accountLoadDelay = 10;
            window.techlog('Dynamically set accountLoadDelay to ' + window.accountLoadDelay + ' seconds', 'force');
        }

    }

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
