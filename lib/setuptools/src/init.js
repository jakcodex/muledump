//
//  root tools
//

//  initialize setuptools
setuptools.init.main = function(window) {

    setuptools.window = window;
    setuptools.app.uaTiming('startup', 'stInitMain', 'start');

    if ( setuptools.data.muledump.totals.configSets.active === 'Default' ) setuptools.app.muledump.totals.config.getTypes().filter(function(key, index) {
        key = 'totalsFilter-' + key;
        index = setuptools.config.totalsSaveKeys.indexOf(key);
        if ( index >= setuptools.config.totalsFilterKeysIndex ) {
            setuptools.copy.totals.defaultConfig[key] = true;
            //setuptools.data.options[key] = true;
        }
    });

    if ( setuptools.state.preview === true ) $('#previewnotice').html('<div>Muledump Preview v' + window.VERSION + '</div>');

    //  store a clone of the original accounts.js object if present
    if ( typeof window.accounts === 'object' && (
        (Object.keys(setuptools.window.accounts).length < 3 && !setuptools.window.accounts.email && !setuptools.window.accounts.email2) ||
        (Object.keys(setuptools.window.accounts).length >= 3))
    ) {

        //  at some point ctrl+shift+r this into setuptools.copy.originalAccountsJS
        setuptools.originalAccountsJS = $.extend(true, {}, window.accounts);

    }

    //  add a notice if the browser is unsupported
    if ( setuptools.browser === 'other' ) {

        setuptools.app.assistants.browser();

        setuptools.app.muledump.notices.add(
            'Unsupported browser detected',
            setuptools.app.assistants.browser,
            {
                notifyClass: 'rateLimited',
                menuClass: 'rateLimitMenu'
            }
        );

    }

    //  check if we should bypass
    if ( setuptools.storage.test() === false ) {

        //  stop the stInitMain timer
        setuptools.app.uaTiming('startup', 'stInitMain', 'stop');

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

        setuptools.app.ga('init');
        setuptools.app.ga('send', 'event', {
            eventCategory: 'runtimeMode',
            eventAction: 'limited'
        });

    } else if ( setuptools.state.error === false ) {

        //  new users can't load muledump so we'll help them get started

        if ( setuptools.app.checknew() === true ) {

            //  load options
            window.options_init(setuptools.state.hosted);

            //  stop the stInitMain timer
            setuptools.app.uaTiming('startup', 'stInitMain', 'stop');

            window.techlog('Notice: You may ignore any accounts.js file not found errors because SetupTools is running', 'norecord', true);
            setuptools.state.firsttime = true;
            setuptools.data.config.enabled = true;
            setuptools.app.index();

            setuptools.app.ga('init');
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

            //  setuptools in bypass mode
            if ( setuptools.config.devForcePoint !== 'bad-config' && setuptools.data.config.enabled === false ) {

                setuptools.state.loaded = false;
                window.techlog('SetupTools/Init - Bypassing', 'force');

                //  load configuration keys from accounts.js
                Object.keys(setuptools.data.config).forEach(function(key) {
                    if ( typeof window[key] !== 'undefined' ) {
                        window.techlog('SetupTools/Init - Accounts.js Import key: ' + key);
                        setuptools.data.config[key] = window[key];
                    }
                });

                //  if user provides their own configuration let's load it
                if (
                    typeof userConfiguration === 'object' &&
                    userConfiguration.enabled === true
                ) {

                    window.techlog('SetupTools/Init - Client config importing ' + Object.keys(userConfiguration).length + ' keys', 'force');

                    delete userConfiguration.enabled;
                    $.extend(true, setuptools.data, userConfiguration);

                }

                //  load our configuration into the window
                Object.filter(setuptools.data.config, function(key, value) {
                    window[key] = value;
                });

                //  run analytics if enabled
                var userid = setuptools.storage.read('userid');
                if ( typeof userid === 'string' && userid.match(setuptools.config.regex.gaUserId) ) setuptools.data.userid = userid;
                setuptools.app.ga('init');
                setuptools.app.ga('send', 'event', {
                    eventCategory: 'runtimeMode',
                    eventAction: 'accountsjs'
                });

                //  import vaultbuilder configuration
                setuptools.app.muledump.vaultbuilder.tasks.upgrade();

                //  check for potential performance issues
                setuptools.app.checkperf();

                //  apply ui modifiers
                setuptools.init.uiModifiers();

                //  load options
                window.options_init(setuptools.state.hosted);

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

                //  stop the stInitMain timer
                setuptools.app.uaTiming('startup', 'stInitMain', 'stop');

            //  setuptools loaded successfully
            } else if ( setuptools.config.devForcePoint !== 'bad-config' && setuptools.data.config.enabled === true && setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true ) {

                setuptools.state.loaded = true;
                window.techlog('SetupTools/Init - Loaded stored configuration', 'force');
                window.techlog('Notice: You may ignore any accounts.js file not found errors because setuptools loaded successfully', 'norecord', true);

                //  load our configuration into the window
                Object.filter(setuptools.data.config, function(key, value) {
                    window[key] = value;
                });

                //  run any configuration upgrades
                setuptools.app.upgrade.seek();

                //  load options
                window.options_init(setuptools.state.hosted);

                //  run automatic backups
                setuptools.app.backups.auto();

                //  run lazy save background task
                setuptools.app.config.lazySave();

                //  run backup assistant
                if ( setuptools.data.config.backupAssistant === 1 ) setTimeout(function() {
                    setuptools.app.assistants.backups();
                }, setuptools.config.backupAssistantDelay);

                //  run hash navigation
                setuptools.app.hashnav();
                window.onhashchange = setuptools.app.hashnav;

                //  run basic ga events if enabled
                setuptools.app.ga('init');
                setuptools.app.ga('send', 'event', {
                    eventCategory: 'runtimeMode',
                    eventAction: 'setuptools'
                });

                //  check system performance to make any necessary recommendations
                setuptools.app.checkperf();

                //  create totals configSets backup
                setuptools.app.muledump.totals.config.backup();

                //  apply ui modifiers
                setuptools.init.uiModifiers();

                //  reset default totals configSet
                //setuptools.app.muledump.totals.config.delete('Default');

                //  stop the stInitMain timer
                setuptools.app.uaTiming('startup', 'stInitMain', 'stop');

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
                window.options_init(setuptools.state.hosted);

                //  this should've been caught already, but just in case?
                setuptools.app.uaTiming('startup', 'stInitMain', 'stop');
                setuptools.state.firsttime = true;
                setuptools.app.ga('init');
                setuptools.app.ga('send', 'event', {
                    eventCategory: 'runtimeMode',
                    eventAction: 'unknown'
                });
                setuptools.app.index();

            } else {

                //  stop the stInitMain timer
                setuptools.app.uaTiming('startup', 'stInitMain', 'stop');

                setuptools.app.ga('init');
                setuptools.app.ga('send', 'event', {
                    eventCategory: 'runtimeMode',
                    eventAction: 'error'
                });
                window.techlog('SetupTools/Init - Problem detected with stored configuration');
                setuptools.lightbox.create("There seems to be a problem with your configuration.");

            }

            //  start the console history recorder
            setuptools.app.recordConsole();

            //  perform storage check
            if ( setuptools.data.config.lowStorageSpace === true ) {

                var sr = setuptools.storage.report();
                if (sr.warning === true) setuptools.app.muledump.notices.add(
                    sr.warningText,
                    setuptools.app.devtools.viewSystemsReport,
                    {
                        notifyClass: 'rateLimited',
                        menuClass: 'rateLimitMenu'
                    }
                );

            }

        }

    }

};

//  load account data
setuptools.init.accounts = function() {

    setuptools.app.mulecrypt.system(function() {

        //  if setuptools successfully loaded then insert our accounts object
        if (setuptools.state.loaded === true) {

            //  load accounts from setuptools config
            window.accounts = setuptools.app.config.convert(setuptools.data.accounts, 0);

            //  load accounts from groups manager config
            if (setuptools.data.config.groupsMergeMode > 0) {

                var groupAccounts = setuptools.app.groups.load(window.accounts);
                if (typeof groupAccounts === 'object' && Object.keys(groupAccounts).length > 0) {
                    window.techlog('Groups Manager is running', 'force');
                    window.accounts = groupAccounts;
                }

            }

            //  adaptive accountLoadDelay when value is set to 0 or -1
            window.accountLoadDelay = Number(window.accountLoadDelay);
            if (window.accountLoadDelay === 0 || window.accountLoadDelay === -1) {
                var AccountLength = Object.keys(window.accounts).length;
                if (AccountLength < 10) window.accountLoadDelay = 0;
                if (AccountLength >= 10 && AccountLength < 20) window.accountLoadDelay = (window.accountLoadDelay === -1) ? 0 : 2;
                if (AccountLength >= 20) window.accountLoadDelay = (window.accountLoadDelay === -1) ? 6 : 10;
                window.techlog('SetupTools/InitAccounts - Dynamically set accountLoadDelay to ' + window.accountLoadDelay + ' seconds', 'force');
            }

        }

        //  create our global totals tracker
        setuptools.tmp.globalTotalsCounter = new Muledump_TotalsCounter('global');

        //  load totals configSets prior to mules
        if ( setuptools.app.checknew() === false ) {

            //  load live configuration over loaded saved configuration
            for (var option in setuptools.data.options)
                if (setuptools.data.options.hasOwnProperty(option))
                    if (typeof setuptools.app.muledump.totals.config.getKey(option, undefined, null) !== 'undefined')
                        setuptools.app.muledump.totals.config.setKey(option, setuptools.data.options[option]);

            //  remove accountFilter members if the guid isn't loaded
            var accountFilterChanged = [];
            if (Array.isArray(setuptools.data.options.accountFilter)) setuptools.data.options.accountFilter.filter(function (guid) {
                if (typeof window.accounts[guid] === 'undefined') accountFilterChanged.push(guid);
            });
            if (accountFilterChanged.length > 0) {

                //setuptools.app.muledump.totals.config.activate('Default');
                for (var x = 0; x < accountFilterChanged.length; x++) setuptools.data.options.accountFilter.splice(
                    setuptools.data.options.accountFilter.indexOf(accountFilterChanged[x]),
                    1
                );
                setuptools.app.muledump.totals.config.setKey('accountFilter', setuptools.data.options.accountFilter);

            }

        }

        //  load all accounts into the mules object
        for (var i in window.accounts)
            if (window.accounts.hasOwnProperty(i))
                if (!mules[i])
                    mules[i] = new Mule(i);

        //  look for non-existent or disabled accounts present in the mules object
        for (var i in mules)
            if (mules.hasOwnProperty(i))
                if (setuptools.state.loaded === true && setuptools.app.config.userExists(i) === false || setuptools.app.config.userEnabled(i) === false) {
                    mules[i].dom.remove();
                    delete mules[i];
                }

        //  post mule init actions
        if ( setuptools.app.checknew() === false ) {

            //  run mulequeue
            setuptools.app.mulequeue.main();
            setuptools.app.mulequeue.task.load();
            setuptools.app.mulequeue.task.loadConfig();

            //  update secondary filter to recognize any of the above changes
            if ( Array.isArray(setuptools.data.options.accountFilter) && setuptools.data.options.accountFilter.length > 0 ) {

                setuptools.data.options.accountFilter.filter(function(guid) {
                    setuptools.tmp.globalTotalsCounter.import(guid);
                });

            }

            //  initialize totals
            window.init_totals();
            setuptools.app.muledump.totals.updateSecondaryFilter();

        }

    });

};

//  apply user configuration modifications to the ui
setuptools.init.uiModifiers = function() {

    //  animations may be reduced or turned off
    if ( setuptools.data.config.animations === 1 ) $('body').removeClass('AReduced');
    if ( setuptools.data.config.animations < 1 ) $('#stickynotice').addClass('AReduced');

    //  page search can switched to expandable or turned off
    if ( setuptools.data.config.pagesearch === 0 ) {

        $('#pagesearch').remove();

    } else if ( setuptools.data.config.pagesearch === 1 ) {

        $('#pagesearch').removeClass('full').addClass('small');
        $('#pagesearch > input')
            .attr('placeholder', 'PS')
            .click(function () {
                $('#pagesearch').removeClass('small').addClass('full');
                $(this).attr('placeholder', 'Email or Username');
            })
            .focusout(function () {
                setTimeout(function(self) {
                    $(self).attr('placeholder', 'PS');
                    $('#pagesearch').removeClass('full').addClass('small');
                }, 300, this);
            });

    }

    //  product name and version text can be turned off
    if ( setuptools.data.config.hideHeaderText === true ) $('div#intro').html('');

    //  muledump menu can be repositioned to center or left
    if ( setuptools.data.config.menuPosition === 0 ) $('#topContainer').css({'flex-flow': 'row-reverse'});
    if ( setuptools.data.config.menuPosition === 1 ) $('#topContainer').css({'justify-content': 'center'});

};
