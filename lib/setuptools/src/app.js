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

        setuptools.state.firsttime = true;
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
            <div class="flex-container">\
                Welcome to the Muledump configuration utility! \
                <br><br>Please choose from the following choices. \
                <br>&nbsp;\
            </div> \
            <div class="flex-container" style="justify-content: space-evenly; flex-wrap: wrap;">\
                <div class="setuptools link accounts manage menuStyle bright menuSmall">Accounts</div> \
                <div class="setuptools link accounts groups menuStyle bright menuSmall">Groups</div> \
                <div class="setuptools link config settings menuStyle bright menuSmall notice mt10">Settings</div> \
                <div class="setuptools link config backup menuStyle bright menuSmall notice mt10">Backups</div> \
                <div class="setuptools link config totals menuStyle bright menuSmall mt10">Totals</div> \
                <div class="setuptools link config ocl menuStyle bright menuSmall mt10">One Click Login</div>\
                <div class="setuptools link config devtools menuStyle bright menuSmall notice mt10">Dev Tools</div>\
            </div>\
        ');

    }

    //  display the built lightbox and register click action
    setuptools.lightbox.settitle('main', 'Muledump Manager');
    setuptools.lightbox.override('accounts-manager', 'goback', setuptools.app.index);
    if ( setuptools.app.checknew() === true ) {
        setuptools.lightbox.drawhelp('main', 'docs/setuptools/help/first-time', 'SetupTools Help');
    } else setuptools.lightbox.drawhelp('main', 'docs/setuptools/help/index', 'SetupTools Help');
    setuptools.lightbox.display('main', $.extend(true, {}, config, {'variant': variant}));
    $('.setuptools.accounts.manage').on('click.setuptools.manage', setuptools.app.accounts.manager);
    $('.setuptools.accounts.groups').on('click.setuptools.groups', setuptools.app.groups.manager);
    $('.setuptools.config.restore').on('click.setuptools.restore', setuptools.app.backups.index);
    $('.setuptools.config.backup').on('click.setuptools.backup', setuptools.app.backups.index);
    $('.setuptools.config.settings').on('click.setuptools.settings', setuptools.app.config.settings);
    $('.setuptools.config.import').on('click.setuptools.import', setuptools.app.accounts.AccountsJSImport);
    $('.setuptools.app.intro').on('click.setuptools.introduction', setuptools.app.introduction);
    $('.setuptools.config.totals').on('click.setuptools.totals', function() {
        setuptools.lightbox.insert('totalsmenu-settings', 'goback', ['totalsmenu-settings', setuptools.app.index]);
        setuptools.app.muledump.totals.menu.settings();
    });
    $('.setuptools.config.ocl').on('click.setuptools.ocl', setuptools.app.muledump.ocl.manager);
    $('.setuptools.config.devtools').on('click.setuptools.devtools', setuptools.app.devtools.ui);

};

//  check if this is a new user
setuptools.app.checknew = function() {

    //  check if a stored configuration is present
    if ( setuptools.state.firsttime === false && setuptools.storage.read('configuration') ) return false;

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
    );

};

//  provide a linking service into muledump using the location hash
setuptools.app.hashnav = function() {

    //  don't run if any notifier is running
    if ( setuptools.state.notifier === true || location.hash === '#' ) return;

    //  parse the request path
    var matches = location.hash.match(setuptools.config.regex.hashnav);
    if ( !matches ) return;

    //  navigation links that require setuptools be loaded
    if ( setuptools.state.loaded === true ) {

        //  groups manager
        if ( matches[0] === 'groups' ) {

            setuptools.lightbox.close();
            location.hash = '#';

            if ( matches[1] === 'create' ) {

                setuptools.app.groups.create();

            } else if ( matches[1] === 'select' ) {

                setuptools.app.groups.manager();
                $('div.setuptools.groupControls > div.groupSelect').click();

                if ( matches[2] === 'all' ) {

                    $('div.setuptools.menu a.selectAll').click();

                } else if ( matches[2] === 'enabled' ) {

                    $('div.setuptools.menu a.selectEnabled').click();

                } else if ( matches[2] === 'disabled' ) {

                    $('div.setuptools.menu a.selectDisabled').click();

                }

            } else if ( matches[1] === 'enableAll' ) {

                $('div.groups.enableAll.toggle').click();

            } else if ( matches[1] === 'disableAll' ) {

                $('div.groups.disableAll.toggle').click();

            } else setuptools.app.groups.manager();

        }
        //  accounts manager
        else if ( matches[0] === 'accounts' ) {

            setuptools.lightbox.close();
            location.hash = '#';
            if ( matches[1] === 'mass' || matches[1] === 'massSwitch') {

                setuptools.app.accounts.manager();
                $('.editor.control.massSwitch').click();

            } else if ( matches[1] === 'export' ) {

                setuptools.app.accounts.AccountsJSExport();

            } else setuptools.app.accounts.manager();

            return;

        }
        //  backups manager
        else if ( matches[0] === 'backups' ) {

            if ( matches[1] === 'create' ) {

                setuptools.lightbox.close();
                location.hash = '#';
                setuptools.app.backups.create();
                return;

            }

        }

    }
    //  navigation links that require setuptools be unloaded
    else {



    }

    //  import local or uploaded accounts.js file
    if ( matches[0] === 'accountsjs' ) {

        setuptools.lightbox.close();
        location.hash = '#';
        if ( !matches[1] ) setuptools.app.accounts.AccountsJSImport();
        if ( matches[1] === 'upload' ) setuptools.app.accounts.AccountsJSImportUpload();

    }
    //  settings takes two arguments, highlight and section
    else if ( matches[0] === 'settings' ) {

        setuptools.lightbox.close();
        location.hash = '#';
        setuptools.app.config.settings(matches[1], matches[2]);

    }
    //  open about menu
    else if ( matches[0] === 'about' ) {

        setuptools.lightbox.close();
        location.hash = '#';
        $('#about').ready(function() {
            $('#about').click();
        });

    }
    //  backups manager
    else if ( matches[0] === 'backups' ) {

        setuptools.lightbox.close();
        location.hash = '#';
        if ( matches[1] === 'upload' ) {

            setuptools.app.backups.upload();

        } else if ( matches[1] === 'restore' ) {

            //  we'll push them to the latest backup otherwise fallback on the upload page
            var BackupList = setuptools.app.backups.listAll();
            if ( BackupList.length > 0 ) {

                var BackupMeta = BackupList[BackupList.length-1];
                setuptools.app.backups.restoreConfirm(BackupMeta[1], BackupMeta[5] || BackupMeta[4]);

            } else setuptools.app.backups.upload();

        } else if ( !matches[1] ) setuptools.app.backups.index();

    }
    //  assistance
    else if ( matches[0] === 'help' ) {

        if ( matches[1] === 'cors' ) {

            setuptools.lightbox.close();
            location.hash = '#';
            setuptools.app.assistants.cors(true);

        }

    }
    //  systems report
    else if ( matches[0] === 'report' ) {

        setuptools.app.devtools.viewSystemsReport();

    }

};

//  wrap analytics var
setuptools.app.ga = function(command, action, value1, value2, value3, value4, value5) {

    //  run only on certain conditions
    var analytics = window[setuptools.config.gaFuncName];
    if (
        (typeof analytics !== 'function' && command !== 'init') ||
        setuptools.data.config.ga === false
    ) return;

    //  initial events to trigger
    if ( command === 'init' ) {

        if ( setuptools.state.firsttime === false && (setuptools.data.userid === false || !setuptools.data.userid.match(setuptools.config.regex.gaUserId)) ) {

            setuptools.app.muledump.notices.add('Review Usage Analytics options', setuptools.app.gaReview);
            setuptools.data.userid = setuptools.seasalt.hash.sha256(Date.now().toString());
            setuptools.data.userid = setuptools.data.userid.substr(0, 20) + setuptools.data.userid.substr(setuptools.data.userid.length-20, 20);
            setuptools.app.config.save('UsageAnalytics/first-run');
            if ( setuptools.state.loaded === false ) setuptools.storage.write('userid', setuptools.data.userid);
            return;

        }

        (function(i, s, o, g, r, a, m) {
            i["GoogleAnalyticsObject"] = r;
            (i[r] =
                i[r] ||
                function() {
                    (i[r].q = i[r].q || []).push(arguments);
                }), (i[r].l = 1 * new Date());
            (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m);
        })(
            window,
            document,
            "script",
            "https://www.google-analytics.com/analytics.js",
            setuptools.config.gaFuncName
        );

        analytics = window[setuptools.config.gaFuncName];
        analytics('create', setuptools.config.ga, setuptools.config.gaOptions);
        analytics('set', 'userId', setuptools.data.userid);
        analytics('set', 'checkProtocolTask', null); // Disable file protocol checking.
        analytics('set', 'checkStorageTask', null); // Disable cookie storage checking.
        analytics('set', 'historyImportTask', null); // Disable history checking (requires reading from cookies)
        analytics('set', 'aip', 1); // Anonymize IP address
        analytics('send', 'pageview');
        if ( setuptools.data.config.gaPing === true ) setuptools.tmp.gaInterval = setInterval(setuptools.app.ga, setuptools.config.gaInterval, 'send', {hitType: 'pageview', page: '#ping'});

        setuptools.app.ga('timing', {
            category: 'script',
            key: 'scriptInit',
            value: timing.scriptInit.runtime
        });

        analytics('send', 'event', {
            eventCategory: 'browser',
            eventAction: setuptools.browser
        });

        analytics('send', 'event', {
            eventCategory: 'detect',
            eventAction: 'muledump-platform',
            eventLabel: ( setuptools.state.hosted === true ) ? 'online' : 'local'
        });

        analytics('send', 'event', {
            eventCategory: 'detect',
            eventAction: 'muledump-version',
            eventLabel: setuptools.version.major + '.' + setuptools.version.minor + '.' + setuptools.version.patch
        });

        var storageReport = setuptools.storage.report();
        analytics('send', 'event', {
            eventCategory: 'detect',
            eventAction: 'storageSizeLocal',
            eventValue: storageReport.used
        });

        analytics('send', 'event', {
            eventCategory: 'detect',
            eventAction: 'storageSizeConfig',
            eventValue: storageReport.keys['muledump:setuptools:configuration']
        });

        return;

    }

    //  timing shortcut
    if ( command === 'timing' ) {

        //  send the timing value if valid
        if ( typeof action === 'object' ) {

            //  merge provided sample with default object
            action = $.extend(true, {
                category: undefined,
                key: undefined,
                value: undefined
            }, action);

            //  send timing if object size is correct
            if ( Object.keys(Object.filter(action, function(key, value) {
                return (
                    ( ['category', 'key', 'value'].indexOf(key) > -1 ) &&
                    ( ['string', 'number'].indexOf(typeof value) > -1 )
                );
            })).length === 3 ) setuptools.app.ga('send', 'timing', action.category, action.key, action.value);

        }

        return;

    }

    //  at least these two arguments are required
    if ( !command && !action ) return;

    //  if the userid isn't generated or the user optioned out thru the notice panel we'll disable analytics
    if ( setuptools.data.userid === false || setuptools.data.userid === 0 ) return;

    //  run any additional commands (must be explicitly approved below)
    if (

        //  all page timings are allowed
        ( action === 'timing' ) ||

        //  eventActions that require gaErrors be enabled
        ( action === 'event' && [
            'corsError', 'accountBanned', 'accountInUse', 'genericServerError', 'export-imgur-error',
            'export-imgur-networkError', 'export-imgur-httpError', 'export-img-loadError'
        ].indexOf(value1.eventAction) > -1 && setuptools.data.config.gaErrors === true ) ||

        //  eventActions that require gaOptions be enabled
        ( action === 'event' && [
            'staleCache', 'charSortCustom', 'wawawa', 'export-txt', 'export-csv', 'export-json', 'export-img',
            'export-imgur', 'export-html2canvas'
        ].indexOf(value1.eventAction) > -1 && setuptools.data.config.gaOptions === true ) ||

        //  eventCategories that require gaOptions be enabled
        ( action === 'event' && [
            'ocl'
        ].indexOf(value1.eventCategory) > -1 && setuptools.data.config.gaOptions === true ) ||

        //  eventActions that are always enabled when ga is enabled
        ( action === 'event' && [
            'nonJakcodexCORS', 'isJakcodexCORS', 'mqAccountFinish', 'newUserSetup', 'storageSizeLocal', 'storageSizeConfig',
            'muledump-platform', 'muledump-version'
        ].indexOf(value1.eventAction) > -1 ) ||

        //  event categories whose actions require gaErrors be enabled
        ( action === 'event' && [
            // empty
        ].indexOf(value1.eventCategory) > -1 && setuptools.data.config.gaErrors === true ) ||

        //  event categories whose actions are always enabled when ga is enabled
        ( action === 'event' && [
            'runtimeMode', 'rateLimited', 'stars', 'browser'
        ].indexOf(value1.eventCategory) > -1 ) ||

        //  pings require that gaPing be enabled
        ( typeof action === 'object' && action.hitType === 'pageview' && action.page === '#ping' && setuptools.data.config.gaPing === true ) ||

        //  pageviews are enabled with ga
        ( typeof action === 'object' && action.hitType === 'pageview' && action.page !== '#ping' )

    ) {

        analytics(command, action, value1, value2, value3, value4, value5);
    }

};

//  explain analytics to users
setuptools.app.gaReview = function() {

    setuptools.lightbox.build('gaReview', '\
        <div class="fleft cboth" style="text-align: justify;">\
            Usage Analytics provides anonymous information using Google Analytics to help us improve the quality and features in Muledump. \
            You can read more about the collected data at our <a href="' + setuptools.config.url + '/privacy-policy" target="_blank">Privacy Policy</a> page. \
            <br><br>Participation in Usage Analytics is option and you may opt-out. You can also control what information is collected by visiting the Settings Manager.\
            ' + ( (setuptools.state.loaded === false) ? '<br><br><strong>Accounts.js Users:</strong><br><br>You can disable Usage Analytics by adding <code>ga = false;</code> to accounts.js.' : '' ) + '\
            <br>&nbsp;\
        </div>\
    ');

    if ( setuptools.state.loaded === true ) setuptools.lightbox.build('gaReview', '\
        <div class="flex-container" style="flex-flow: column;">\
            <div class="setuptools link gaSettings menuStyle bright textCenter mb5">Review Usage Analytics Settings</div>\
            <div class="setuptools link gaOptOut menuStyle negative textCenter">Opt-out of Usage Analytics</div> \
        </div>\
    ');

    setuptools.lightbox.settitle('gaReview', 'Usage Analytics Information');
    setuptools.lightbox.display('gaReview', {variant: 'fl-Introduction'});

    $('.setuptools.link.gaOptOut').click(function() {

        setuptools.data.config.ga = false;
        setuptools.app.config.save('UsageAnalytics/opt-out');
        setuptools.lightbox.build('gaReview-optOut', 'Usage Analytics have been disabled.');
        setuptools.lightbox.settitle('gaReview-optOut', 'Usage Analytics Opt-out');
        setuptools.lightbox.display('gaReview-optOut');

    });

    $('.setuptools.link.gaSettings').click(function() {
        setuptools.lightbox.override('settings', 'goback', setuptools.app.gaReview);
        setuptools.app.config.settings('none', 'analytics');
    });

};

//  check if the user might experience any performance issues
setuptools.app.checkperf = function() {

    if (
        setuptools.data.acknowledge.assistants.performance !== true &&
        setuptools.data.config.animations === 1 &&
        (( window && window.performance && window.performance.timing && (window.performance.timing.domComplete-window.performance.timing.connectStart) > setuptools.config.perfLoadTime ) ||
        (typeof navigator === 'object' && navigator.hardwareConcurrency < setuptools.config.perfMinCPUs))
    ) {

        setuptools.app.muledump.notices.add(
            'Consider changing animations settings',
            setuptools.app.assistants.performance,
            setuptools.app.muledump.notices.queue.length
        );
    }

};

//  usage analytics timer method
setuptools.app.uaTiming = function(category, key, action, uid, ga) {

    if ( action !== 'start' ) {
        options = undefined;
        ga = undefined;
    }

    var aggregate;
    if ( ['start', 'stop', 'cancel'].indexOf(action) === -1 ) return;
    var nameKey = category + '-' + key;
    if ( typeof uid === 'string' ) {

        if ( ['realmAPICharListGet'].indexOf(key) === -1 ) ga = false;

        if ( typeof timing.aggregate[nameKey] === 'undefined' ) timing.aggregate[nameKey] = new JTimerAggregate();
        aggregate = timing.aggregate[nameKey];
        nameKey += '-' + uid;

    }
    if ( typeof ga === 'undefined' ) ga = true;
    if ( ['stop', 'cancel'].indexOf(action) > -1 && typeof timing[nameKey] === 'undefined' ) return;
    if ( typeof setuptools.tmp.activeRuntime === 'undefined' ) setuptools.tmp.activeRuntime = 0;

    //  start a timer
    if ( action === 'start' && typeof timing[nameKey] === 'undefined' ) timing[nameKey] = new JTimer({
        name: nameKey,
        verbose: setuptools.data.config.debugging,
        custom: {
            category: category,
            key: key,
            ga: ga,
            uid: uid
        },
        plugins: ( (aggregate instanceof JTimerAggregate) ? [aggregate] : [] ),
        stopCallback: function (self) {

            //  calculate runtime
            setuptools.tmp.activeRuntime = setuptools.tmp.activeRuntime + self.runtime;

            //  send to ga if enabled
            if (self.options.custom.ga === true) setuptools.app.ga('timing', {
                category: self.options.custom.category,
                key: self.options.custom.key,
                value: self.runtime
            });

        }
    });

    if ( action === 'start' && (timing[nameKey] instanceof JTimer) ) timing[nameKey].restart();

    //  stop a timer
    if ( action === 'stop' ) timing[nameKey].stop();

    //  cancel a timer
    if ( action === 'cancel' ) timing[nameKey].cancel();

};

//  aggregate profiling data
setuptools.app.uaTimingAggregate = function(self) {

    if ( setuptools.tmp.uaTiming === 'undefined' ) setuptools.tmp.uaTiming = {};

};

//  run background task for recordConsole
setuptools.app.recordConsole = function() {

    setuptools.app.techlog('Muledump/recordConsole background task starting', 'norecord');
    clearInterval(setuptools.tmp.recordConsoleTask);
    setuptools.tmp.recordConsoleTask = setInterval(function() {

        if ( !Array.isArray(setuptools.tmp.consoleHistory) || setuptools.tmp.consoleHistory.length === 0 ) return;
        var consoleHistory = JSON.parse(setuptools.storage.read('console'));
        if ( !Array.isArray(consoleHistory) ) consoleHistory = [];
        consoleHistory = consoleHistory.concat(setuptools.tmp.consoleHistory);
        setuptools.app.techlog('Muledump/recordConsole committing ' + setuptools.tmp.consoleHistory.length + ' records', 'norecord');
        setuptools.tmp.consoleHistory = [];
        var json;

        //  purge old records if history exceeds maximum size
        var splice = 0;
        if (
            setuptools.data.config.recordConsole > 0 &&
            consoleHistory.length > setuptools.data.config.recordConsole
        ) splice = consoleHistory.length-setuptools.data.config.recordConsole;

        if ( setuptools.data.config.recordConsole === -1 ) {

            json = JSON.stringify(consoleHistory);
            var report = setuptools.storage.report();
            var usable = Math.floor((report.remaining/4)*1000);
            var recordsize = Math.ceil((json.length*2)/consoleHistory.length);
            if ( recordsize < 1 ) recordsize = 1;
            var maxcount = Math.ceil(usable/recordsize);
            if ( maxcount < setuptools.config.recordConsoleMinimum ) maxcount = setuptools.config.recordConsoleMinimum;
            if ( maxcount < consoleHistory.length ) splice = consoleHistory.length-maxcount;

        }

        if ( splice > 0 ) consoleHistory.splice(0, splice);

        //  write history
        setuptools.storage.write('console', consoleHistory);

    }, setuptools.data.config.recordConsoleTtl);

};


setuptools.app.techlog = function(msg, type, force) {

    if ( !type ) type = "info";

    //  prepare debug settings
    //  if ( window.verbosity ) verbosity = window.verbosity;

    //  debug logging to console
    var ts = (new Date).toLocaleString();
    if ( (setuptools.data.config.debugging === true && ['info','norecord'].indexOf(type) > -1) || ['force'].indexOf(type) > -1 || force === true ) console.log(ts, '-', msg);

    if ( ['norecord', 'api', 'aggregate'].indexOf(type) === -1 && typeof setuptools.data.config.recordConsole === 'number' && setuptools.data.config.recordConsole !== 0 ) {

        if ( !Array.isArray(setuptools.tmp.consoleHistory) ) setuptools.tmp.consoleHistory = [];
        setuptools.tmp.consoleHistory.push([ts, setuptools.runtimeId, type, msg]);

    }

    //  process tech report if enabled
    //  this is no longer enabled for the time being
    /*if ( type !== 'hide' && options.techreport === true ) {

        //  strip sensitive data from messages
        if ( typeof msg === 'object' ) msg = JSON.stringify(msg);
        msg = msg.replace(/<PaymentData>{"token": "(.*?)"/g, '<PaymentData>{"token": "***"');
        msg = msg.replace(/"PaymentData":"{\\"token\\": \\"(.*?)\\"/g, '"PaymentData":"{\\"token\\": \\"***\\"');
        msg = msg.replace(/"Name":".*?"/g, '{"Name":"***"}');
        msg = msg.replace(/<Name>.*?<\/Name>/g, "<Name>***</Name>");
        msg = msg.replace(/guid=(.*?)&(password|secret)=(.*?)&/g, '***hidden***&');
        msg = msg.replace(/(((steamworks|kongregate|kabam):[a-zA-Z0-9]*)|([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}))/g, function(match) {
            return $.sha256(match);
        });

        //  make it html friendly
        msg = msg.replace(/</g, "&lt;");
        msg = msg.replace(/>/g, "&gt;");
        $("#techreport").append("<div>" + msg + "<br><br></div>\n");

    }*/
};

/**
 * @function
 * Draws a general help menu for Muledump
 */
setuptools.app.help = function() {

    setuptools.lightbox.build('help', ' \
        Need help using Muledump?\
        \
        <br><br>Perhaps one of these links can help you:\
        <ol>\
            <li><a href="' + setuptools.config.wikiUrl + '/Frequently-Asked-Questions" target="_blank">Frequently Asked Questions</a></li> \
            <li><a href="' + setuptools.config.wikiUrl + '/Muledump-CORS-Adapter" target="_blank">Muledump CORS Adapter</a></li> \
            <li><a href="' + setuptools.config.wikiUrl + '/Installation-and-Setup" target="_blank">Installation and Setup Guide</a></li> \
            <li><a href="' + setuptools.config.wikiUrl + '/Steam-Users-Setup-Guide" target="_blank">Steam Users Setup Guide</a></li> \
            <li><a href="' + setuptools.config.wikiUrl + '/Kongregate-Users-Setup-Guide" target="_blank">Kongregate Users Setup Guide</a></li> \
            <li><a href="' + setuptools.config.wikiUrl + '/One-Click-Login" target="_blank">One Click Login Guide</a></li> \
            <li><a href="' + setuptools.config.wikiUrl + '/Totals" target="_blank">Totals Overview</a></li> \
            <li><a href="' + setuptools.config.url + '/docs/muledump/totals-manager" target="_blank">Totals Detailed Usage Info</a></li>\
            <li><a href="' + setuptools.config.url + '/docs/setuptools/" target="_blank">Muledump SetupTools Info</a></li>\
            <li><a href="' + setuptools.config.wikiUrl + '/Rate-Limiting" target="_blank">Rate Limiting</a></li> \
            <li><a href="' + setuptools.config.url + '#support-and-contributions" target="_blank">Getting Support</a></li>\
            <li><a href="#" class="muledump link viewSystemsReport">View Systems Report</a></li>\
        </ol>\
        \
        Available Keyboard and Mouse Controls \
        <div class="help hotkeys">\
            <ol>\
                <strong class="info">Mule Controls</strong>\
                <li>Shift+Click a mule to add or remove it from the <a href="' + setuptools.config.url + '/docs/muledump/totals-manager#account-filter-members" target="_blank">Account Filter</a></li>\
                <li>Ctrl+Click a mule to disable it from Totals</li>\
                <li>Right Click a mule to access its Mule Menu</li>\
                <li>Click a mule header to access its account display options</li>\
                <li>Ctrl+Shift+Click one of the following to create an image: <br>Any mule, character, character table, vault, vault table, gift table, or background</li>\
            </ol> \
            <ol> \
                <strong class="info">Totals Controls</strong>\
                <li>Click an item to select only accounts containing the item</li>\
                <li>Shift+Click an item to add it to the <a href="' + setuptools.config.url + '/docs/muledump/totals-manager#permanently-hidden-items" target="_blank">Hidden Items Filter</a></li>\
                <li>Ctrl+Shift+Click the totals panel to generate an image</li>\
            </ol>\
            <ol> \
                <strong class="info">Totals Settings Manager Controls</strong> \
                <li>Shift+Click items to enable or disable them in all sections</li>\
                <li>Click and Drag items to sort them in <a href="' + setuptools.config.url + '/docs/muledump/totals-manager#item-group-sorting" target="_blank">Item Group Sorting</a> section</li>\
                <li>Double Click items to access the subsorting menu in Item Group Sorting section</li>\
                <li>Click the &#9898;&#9898;&#9898; to expand or collapse sections</li>\
            </ol>\
            <ol> \
                <strong class="info">Groups Manager Controls</strong>\
                <li>Click a group to select it</li>\
                <li>Ctrl+Click a group to select multiple groups</li>\
                <li>Right Click a group to open the Group Menu with it selected</li>\
                <li>Long Click (>1 second) a group to open it in the editor</li>\
                <li>Click and Drag to select multiple groups</li>\
                <li>Clicking an account in the Group Editor will add or remove it from the group</li>\
                <li>Right Click an account in the Group Editor will open the editor menu for it</li>\
            </ol>\
            <ol>\
                <strong class="info">Realmeye Controls</strong>\
                <li>Ctrl+Click a single item to access its Realmeye Menu</li>\
                <li>Ctrl+Click two items to access the Realmeye Trading Menu</li>\
            </ol>\
        </div>\
    ');
    setuptools.lightbox.settitle('help', 'Muledump Help');
    setuptools.lightbox.display('help', {variant: 'fl-AccountsManager select'});

    $('.muledump.link.viewSystemsReport').on('click.muledump.viewSystemsReport', function() {
        setuptools.lightbox.close();
        setuptools.lightbox.override('settings-viewSystemsReport', 'goback', setuptools.app.help);
        setuptools.app.devtools.viewSystemsReport();
    });

};

/**
 * @function
 * @param pretty
 * @returns {*}
 * Returns runtime of all aggregate and startup timers
 */
setuptools.app.calculateCpuTime = function(pretty) {

    var cpuTime = 0;
    for ( var a in timing.aggregate )
        if ( timing.aggregate.hasOwnProperty(a) )
            for ( var s = 0; s < timing.aggregate[a].samples.length; s++ )
                cpuTime += timing.aggregate[a].samples[s];
    cpuTime += timing['scriptInit'].runtime;
    cpuTime += timing['startup-stInitMain'].runtime;
    cpuTime += timing['mdInit'].runtime;
    if ( pretty !== true ) return cpuTime;
    cpuTime = Number(cpuTime/1000);
    cpuTime = ( cpuTime >= 60 ) ? (cpuTime/60).toFixed(2) + ' Minutes' : cpuTime.toFixed(2) + ' Seconds';
    return cpuTime;

};

/**
 * @function
 * Determines local clock offset from realtime
 */
setuptools.app.timesync = function(callback) {

    setuptools.tmp.timeOffset = 0;

    if ( setuptools.data.config.timesync === false ) {

        if ( typeof callback === 'function' ) callback();
        return;

    }

    var opts = $.extend(true, {}, setuptools.config.realmApiParams);
    setuptools.app.uaTiming('system', 'timesync', 'start');
    $.ajax(setuptools.config.timesyncUrl + '?' + $.param(opts), {
        timeout: setuptools.config.timesyncTtl,
        complete: function() {
            setuptools.app.uaTiming('system', 'timesync', 'stop');
            if ( typeof callback === 'function' ) callback();
        },
        success: function(data) {

            if ( typeof data === 'object' ) {

                var timestamp = new Date(data.epoch);
                //if ( typeof timing['system-timesync'] === 'number' ) timestamp += timing['system-timesync'];
                var system = new Date;
                setuptools.tmp.timeOffset = system-timestamp;
                if ( typeof setuptools.tmp.timeOffset !== 'number' ) setuptools.tmp.timeOffset = 0;
                setuptools.app.techlog('SetupTools/TimeSync clock offset: ' + setuptools.tmp.timeOffset + '; delay: ' + timing['system-timesync'].runtime);

            }

        }
    });

};

/**
 * @function
 * @param {number | string} [ttl]
 */
setuptools.app.reload = function(ttl) {

    if ( typeof ttl === 'string' ) ttl = Number(ttl);
    if ( typeof ttl !== 'number' ) ttl = 3000;
    setTimeout(function () {
        location.reload();
    }, ttl);

};
