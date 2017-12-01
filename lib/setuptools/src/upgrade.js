//
//  configuration upgrades
//

//  upgrade configuration version if it has changed in setuptools
//  also display a message for muledump online users
//  this is called after setuptools.app.upgrade.seek() finishes
setuptools.app.upgrade.version = function() {

    var alertRun = false;
    function alertNewVersion() {

        alertRun = true;
        if ( setuptools.state.loaded === true && setuptools.state.hosted === true ) {

            //  display the message
            setuptools.state.versionNotifier = true;
            setuptools.lightbox.build('muledump-alertNewVersion', ' \
                Muledump Online has been updated to a new ' + ( (setuptools.data.config.alertNewVersion === 2) ? 'version' : 'release' ) + '. \
                <br><br>The changelog can be viewed here: \
                <br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp docs nostyle" target="_blank">' + setuptools.config.url + '/CHANGELOG</a> \
                <br><br>You can disable this startup check in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
            ');
            setuptools.lightbox.settitle('muledump-alertNewVersion', '<strong>Muledump Online v0.' + setuptools.version.major + '.' + setuptools.version.minor + ( (setuptools.version.patch !== false) ? '-' + setuptools.version.patch : '' ) + '</strong>');
            setuptools.lightbox.display('muledump-alertNewVersion', {
                variant: 'setuptools-small',
                closeSpeed: 0,
                openSpeed: 0
            });
            $('.drawhelp.docs').click(function (e) {
                setuptools.lightbox.ajax(e, {title: 'Muledump Changelog', url: $(this).attr('href')}, this);
            });
            $('.setuptools.app.link.settingsmanager').click(function() { setuptools.app.config.settings('alertNewVersion'); });

        }

        //  update the configuration
        window.techlog('SetupTools/ClientConfig version updated to ' + JSON.stringify(setuptools.version), 'force');
        setuptools.data.version = setuptools.version;
        if ( setuptools.state.loaded === true ) setuptools.app.config.save();

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
        if ( setuptools.state.loaded === true ) setuptools.app.config.save();

    }

};

//  look for upgrade conditions within the client configuration
setuptools.app.upgrade.seek = function() {

    var newObject;
    var saveCount = 0;

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

        var autoBackup = setuptools.app.config.backup(true, true);
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
        if ( autoBackup.status === true ) {
            setuptools.app.config.save();
        } else window.techlog('SetupTools/ClientConfig not saving accounts upgrade due to auto backup error', 'force');

    }

    /*
    //  change default value for autoReloadDays from 0 to 1 if user is trying to use auto reload
    */
    //  this will only remain in v0.8.3 as it prevents someone from turning the feature off in settings
    if ( setuptools.data.config.autoReloadDays === 0 ) {

        var ardReset = false;
        for (var i in setuptools.data.accounts.accounts) {

            if (setuptools.data.accounts.accounts.hasOwnProperty(i)) {

                if (ardReset === false && setuptools.data.accounts.accounts[i].autoReload === true) {

                    ardReset = true;
                    window.techlog('SetupTools/ClientConfig conditionally converting autoReloadDays to 1 day', 'force');
                    setuptools.data.config.autoReloadDays = 1;
                    saveCount++;

                }

            }

        }

    }

    //  save if any upgrades request a save
    if ( saveCount > 0 ) setuptools.app.config.save();

    //  check for new muledump version and upgrade ClientConfig to new version number
    //  On Muledump Online - display version update notice conditionally
    setuptools.app.upgrade.version();

};
