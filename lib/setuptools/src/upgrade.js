//
//  configuration upgrades
//

//  upgrade configuration version if it has changed in setuptools
//  also display a message for muledump online users
//  this is called after setuptools.app.upgrade.seek() finishes
setuptools.app.upgrade.version = function() {

    var alertRun = false;
    var text = {};
    function alertNewVersion() {

        //  for online users it will alert them that they have been upgraded to a new version
        //  for local users it will alert them that a new version is available (uses version argument)
        alertRun = true;
        if ( setuptools.state.loaded === true && setuptools.state.hosted === true ) {

            //  display the message
            var type = (setuptools.data.config.alertNewVersion === 2) ? 'version' : 'release';
            setuptools.state.notifier = true;
            setuptools.lightbox.build('muledump-alertNewVersion', ' \
                Muledump Online has been updated to a new ' + type + '. \
                <br><br>The changelog can be viewed here: \
                <br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp docs nostyle" target="_blank">' + setuptools.config.url + '/CHANGELOG</a> \
                <br><br>You can disable this startup check in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
            ');
            setuptools.lightbox.settitle('muledump-alertNewVersion', '<strong>Muledump Online v' + setuptools.version.major + '.' + setuptools.version.minor + '.' + setuptools.version.patch + '</strong>');
            setuptools.lightbox.display('muledump-alertNewVersion', {
                variant: 'setuptools-medium',
                closeSpeed: 0,
                openSpeed: 0
            });
            $('.drawhelp.docs').click(function (e) {
                setuptools.lightbox.drawHelp(e, {title: 'Muledump Changelog', url: $(this).attr('href')}, this);
            });
            $('.setuptools.app.link.settingsmanager').on('click.setuptools.newVersion.settingsmanager', function() { setuptools.app.config.settings('alertNewVersion'); });

        }

        //  update the configuration
        setuptools.data.version = setuptools.version;
        if ( setuptools.state.loaded === true ) {
            setuptools.app.config.save('SetupTools/ClientConfig version updated to ' + JSON.stringify(setuptools.version));
        } else {
            window.techlog('SetupTools/ClientConfig version updated to ' + JSON.stringify(setuptools.version), 'force');
        }

    }

    //  we need to know when to save
    if ( Object.keys(setuptools.data.version).length === 0 ) alertNewVersion();

    //  notify on all version changes
    if ( setuptools.data.config.alertNewVersion === 2 ) {

        if ( setuptools.version.major > setuptools.data.version.major || setuptools.version.minor > setuptools.data.version.minor || setuptools.version.patch > setuptools.data.version.patch ) alertNewVersion();

        //  notify on new releases only
    } else if ( setuptools.data.config.alertNewVersion === 1 ) {

        if ( setuptools.version.major > setuptools.data.version.major || setuptools.version.minor > setuptools.data.version.minor ) alertNewVersion();

    }

    //  always save on new versions
    if ( alertRun === false && (setuptools.version.major > setuptools.data.version.major || setuptools.version.minor > setuptools.data.version.minor || setuptools.version.patch > setuptools.data.version.patch) ) {

        setuptools.data.version = setuptools.version;
        if ( setuptools.state.loaded === true ) setuptools.app.config.save('SetupTools/ClientConfig version updated to ' + JSON.stringify(setuptools.version));

    }

};

//  look for upgrade conditions within the client configuration
setuptools.app.upgrade.seek = function() {

    var newObject;
    var saveCount = 0;
    var autoBackup = {};

    /*
    //  upgrade muledump.chsortcustom from format 0 to format 1 (deprecated; preview-related only)
    */
    if ( typeof setuptools.data.muledump.chsortcustom === 'object' && !setuptools.data.muledump.chsortcustom.format ) {

        newObject = {format: 1, accounts: {}};
        for ( var i in setuptools.data.muledump.chsortcustom )
            if ( setuptools.data.muledump.chsortcustom.hasOwnProperty(i) )
                newObject.accounts[i] = {
                    active: 'User-Custom',
                    data: {'User-Custom': setuptools.data.muledump.chsortcustom[i]}
                };

        setuptools.data.muledump.chsortcustom = newObject;
        window.techlog('SetupTools/ClientConfig upgraded muledump.chsortcustom 0:1', 'force');
        saveCount++;

    }

    /*
    //  upgrade groups object to latest default object
    */
    if ( typeof setuptools.data.groups !== 'object' || (typeof setuptools.data.groups === 'object' && Object.keys(setuptools.data.groups).length === 0) ) {

        setuptools.data.groups = $.extend(true, {}, setuptools.objects.dataGroup);
        window.techlog('SetupTools/ClientConfig upgraded groups to new object format', 'force');
        saveCount++;

    }

    /*
    //  upgrade accounts data to include latest default object keys
    */
    var checkObject = setuptools.data.accounts.accounts[Object.keys(setuptools.data.accounts.accounts)[0]];
    var accountsUpgrade = false;
    for ( var i in setuptools.objects.account )
        if ( setuptools.objects.account.hasOwnProperty(i) )
            if ( typeof checkObject[i] === 'undefined' ) {
                accountsUpgrade = true;
                break;
            }

    if ( accountsUpgrade === true ) {

        for ( var i in setuptools.data.accounts.accounts ) {

            if (setuptools.data.accounts.accounts.hasOwnProperty(i)) {

                //  merge in new config keys
                setuptools.data.accounts.accounts[i] = $.extend(
                    true,
                    {},
                    setuptools.objects.account,
                    setuptools.data.accounts.accounts[i]
                );

            }

        }

        window.techlog('SetupTools/ClientConfig upgraded accounts with new keys', 'force');
        saveCount++;

    }

    /*
    //  upgrade whitebag tracker object format (v9.5 preview dev change)
    */

    if (
        typeof setuptools.data.muledump.whitebagTracker === 'object' &&
        typeof setuptools.data.muledump.whitebagTracker.format === 'undefined'
    ) {

        setuptools.data.muledump.whitebagTracker.format = 1;
        Object.filter(setuptools.data.muledump.whitebagTracker.accounts, function(guid, data) {

            delete setuptools.data.muledump.whitebagTracker.accounts[guid].totals;
            setuptools.data.muledump.whitebagTracker.accounts[guid].owned = [];

        });

        window.techlog('SetupTools/ClientConfig upgraded whitebags to format 1', 'force');
        saveCount++;

    }

    /*
    //  upgrade wardrobe config silently
    */
    Object.keys(setuptools.data.accounts.accounts).filter(function(guid) {

        //  make the object for the first time
        if ( typeof setuptools.data.muledump.wardrobe.accounts[guid] === 'undefined' ) {

            setuptools.data.muledump.wardrobe.accounts[guid] = $.extend(true, {}, setuptools.objects.wardrobeConfig);

        } else {

            //  upgrade the object if there is a new format
            if (
                !setuptools.data.muledump.wardrobe.accounts[guid].format ||
                setuptools.data.muledump.wardrobe.accounts[guid].format < setuptools.objects.wardrobeConfig.format
            ) {
                setuptools.data.muledump.wardrobe.accounts[guid] = $.extend(true, setuptools.objects.wardrobeConfig, setuptools.data.muledump.wardrobe.accounts[guid]);
                window.techlog('SetupTools/ClientConfig upgraded wardrobe to format ' + setuptools.objects.wardrobeConfig.format, 'force');
                saveCount++;
            }

        }

    });

    /*
    //  upgrade accounts meta data for encryption
    */
    if ( typeof setuptools.data.accounts.meta.encryption === 'undefined' ) setuptools.data.accounts.meta.encryption = false;
    if ( typeof setuptools.data.accounts.meta.encryptionTestKey === 'undefined' ) setuptools.data.accounts.meta.encryptionTestKey = '';

    /*
    //  upgrade client configuration for vaultbuilder
    */
    setuptools.app.muledump.vaultbuilder.tasks.upgrade();

    /*
    //  activate usage analytics in 9.6 local
    //  no generated userid means this is the first run for 9.6
    //  user is prompted with a notice to undo this action
    //  this will be removed in 9.7
    */
    if (
        setuptools.state.hosted === false &&
        setuptools.data.userid === false &&
        setuptools.data.config.ga === false
    ) {

        setuptools.data.config.ga = true;
        setuptools.data.config.gaErrors = true;
        setuptools.data.config.gaOptions = true;
        setuptools.data.config.gaPing = true;
        setuptools.data.config.gaTotals = true;
        saveCount++;
        window.techlog('SetupTools/ClientConfig enabled UA for 9.6 local first run', 'force');

    }

    /*
    //  save if any upgrades request a save
    */
    if ( saveCount > 0 ) {

        autoBackup = setuptools.app.config.backup(true, true);
        if (autoBackup.status === true) {
            setuptools.app.config.save('SetupTools/ClientConfig updated ' + saveCount + ' keys');
        } else window.techlog('SetupTools/ClientConfig not saving accounts upgrade due to auto backup error', 'force');

    }

    //  check for new muledump version and upgrade ClientConfig to new version number
    //  On Muledump Online - display version update notice conditionally
    setuptools.app.upgrade.version();

};
