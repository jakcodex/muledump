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
            setuptools.lightbox.build('muledump-alertNewVersion', ' \
                Muledump Online has been updated to a new ' + ( (setuptools.data.config.alertNewVersion === 2) ? 'version' : 'release' ) + '. \
                <br><br>The changelog can be viewed here: \
                <br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp nostyle" target="_blank">https://jakcodex.github.io/muledump/CHANGELOG</a> \
                <br><br>You can disable this startup check in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
            ');
            setuptools.lightbox.settitle('muledump-alertNewVersion', '<strong>Muledump Online v0.' + setuptools.version.major + '.' + setuptools.version.minor + ( (setuptools.version.patch !== false) ? '-' + setuptools.version.patch : '' ) + '</strong>');
            setuptools.lightbox.display('muledump-alertNewVersion', {
                variant: 'setuptools-small',
                closeSpeed: 0,
                openSpeed: 0
            });
            $('.drawhelp').click(function (e) {
                setuptools.lightbox.ajax(e, {title: 'Muledump Changelog', url: $(this).attr('href')}, this);
            });
            $('.setuptools.app.link.settingsmanager').click(function() { setuptools.app.config.settings('alertNewVersion'); });

        }

        //  update the configuration
        window.techlog('ST/Client configuration version updated to ' + JSON.stringify(setuptools.version), 'force');
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

    //  upgrade muledump.chsortcustom from format 0 to format 1
    if ( typeof setuptools.data.muledump.chsortcustom === 'object' && !setuptools.data.muledump.chsortcustom.format ) {

        newObject = {format: 1, accounts: {}};
        for ( var i in setuptools.data.muledump.chsortcustom )
            if ( setuptools.data.muledump.chsortcustom.hasOwnProperty(i) )
                newObject.accounts[i] = {
                    active: 'User-Custom',
                    data: {'User-Custom': setuptools.data.muledump.chsortcustom[i]}
                };

        setuptools.data.muledump.chsortcustom = newObject;
        setuptools.app.config.save();
        window.techlog('ST/ClientConfig upgraded muledump.chsortcustom 0:1', 'force');

    }

    setuptools.app.upgrade.version();

};
