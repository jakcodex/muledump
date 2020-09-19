//  help users with account administrative issues
setuptools.app.assistants.account = function(url, extraopts, callback) {

    //  if it isn't defined then it is an unknown type
    if ( !extraopts.type || typeof setuptools.state.assistant[extraopts.type] !== 'boolean' ) {

        window.techlog('MD/accountAssistant encountered unknown type ' + extraopts.type, 'force');
        return;

    }

    setuptools.state.notifier = true;

    //  set this assistant to active (2 or more occurrences will cause the subsequent ones to be ignored)
    if ( extraopts.type === 'ageVerify' && setuptools.state.assistant[extraopts.type] === false ) {

        setuptools.lightbox.build('muledump-account-assistant', ' \
				You need to verify your age in order to use this account. \
				<br><br>Click to submit: <a href="' + url + '" target="_blank" class="setuptools app link popupComplete">' + url + '</a> \
				<br><br>You can disable the account assistant in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
			');
        setuptools.lightbox.settitle('muledump-account-assistant', 'Kongregate Age Verification');
        setuptools.lightbox.drawhelp('muledump-account-assistant', 'docs/muledump/ageVerify', 'Age Verification Help');

    } else if ( extraopts.type === 'tos' && setuptools.state.assistant[extraopts.type] === false ) {

        setuptools.lightbox.build('muledump-account-assistant', ' \
				You need to accept the TOS in order to use this account. \
				<br><br><strong>' + extraopts.guid + '</strong>\
				<br><br>Click to submit: <a href="' + url + '" target="_blank" class="setuptools app link popupComplete">ROTMG Account TOS Verification</a> \
				<br><br>You can disable the account assistant in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
			');
        setuptools.lightbox.settitle('muledump-account-assistant', 'TOS Verification');
        setuptools.lightbox.drawhelp('muledump-account-assistant', 'docs/muledump/tos', 'TOS Verification Help');

    } else if ( extraopts.type === 'migration' && setuptools.state.assistant[extraopts.type] === false ) {

        setuptools.lightbox.build('muledump-account-assistant', ' \
				You need to finish migration in order to use this account. \
				<br><br>Click to submit: <a href="' + url + '" target="_blank" class="setuptools app link popupComplete">' + url + '</a> \
				<br><br>Warning: Migration may no longer be possible. \
				<br><br>You can disable the account assistant in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
			');
        setuptools.lightbox.settitle('muledump-account-assistant', 'Account Migration');
        setuptools.lightbox.drawhelp('muledump-account-assistant', 'docs/muledump/migration', 'Account Migration Help');

    } else {

        //  hmm
        return;

    }

    setuptools.lightbox.display('muledump-account-assistant', {variant: 'setuptools-medium', afterClose: function() {
        if ( typeof callback === 'function' ) callback();
        setuptools.state.assistant[extraopts.type] = false;
        setuptools.state.notifier = false;
    }});
    setuptools.state.assistant[extraopts.type] = true;
    $('.setuptools.link.settingsmanager').click(function() { setuptools.app.config.settings('accountAssistant'); });
    if ( typeof callback === 'function' ) $('.setuptools.link.popupComplete').click(function(e) {
        $.get($(this).attr('href'));
        callback(e);
    });

};

//  help users with network or cors issues
setuptools.app.assistants.cors = function(force) {

    if ( setuptools.data.config.corsAssistant === 0 && force !== true ) return;
    if ( setuptools.state.assistant.cors === true && force !== true ) return;
    setuptools.state.assistant.cors = true;

    setuptools.lightbox.build('muledump-cors', ' \
        It seems you are experiencing connection issues with ROTMG servers. Let\'s try and fix that.\
        <br><br><strong>Can you connect to ROTMG?</strong> \
        <br>Try loading this link in your browser: <a \
            href="' + setuptools.config.appspotProd + '" target="_blank">\
                ' + setuptools.config.appspotProd + '\
            </a> \
        <br><br>If it fails to load then you are having connectivity issues with ROTMG. \
        ' +
        //  chrome extension notice
        ( (setuptools.state.extension !== true && ['chrome','opera'].indexOf(setuptools.browser) > -1) ? ' \
            <br><br><strong style="color: #da281e">Google Chrome v76 Breaks the Muledump CORS Adapter Extension</strong> \
            <br>As of Chrome version 76, by default Google no longer allows extensions to see the types of requests Muledump makes to Deca\'s servers. \
            <br><br>Due to this Jakcodex/Muledump no longer recommends Google Chrome including Chrome-based browsers like Opera for use with Muledump. \
            <br><br>Please consider upgrading to <a href="https://www.firefox.com/" target="_blank">Firefox</a> and use <a href="' + setuptools.config.url + '/muledump.html" target="_blank">Muledump Online</a>. \ \
            <br><br>After you do, you can go through the <a href="https://github.com/jakcodex/muledump/wiki/Installation-and-Setup" target="_blank">Installation and Setup Guide</a> and restore using a <a href="#" id="archive-backup">Muledump Archive Backup</a>. \
            <br><br>If you would prefer to remain on Chrome, or Chromium-based, then see <a href="https://github.com/jakcodex/muledump/wiki/Chrome-v76-Breaking-Changes" target="_blank">Chrome v76 Breaking Changes</a> in the wiki. \
        ' : '' ) +
        //  opera and firefox extension notice
        ( (setuptools.state.extension !== true && ['firefox'].indexOf(setuptools.browser) > -1) ? ' \
            <br><br><strong style="color: #da281e">Upgrade Your CORS Extension</strong> \
            <br>It does not look like you are using the Jakcodex/Muledump CORS Adapter browser extension. Is it on? \
            <br><br>You can read about upgrading to the <a href="https://github.com/jakcodex/muledump/wiki/Muledump-CORS-Adapter" target="_blank">Muledump CORS Adapter</a> in the wiki.\
        ' : '' ) +
        //  other browser notice
        ( ( ['chrome','opera','firefox'].indexOf(setuptools.browser) === -1 ) ? ' \
            <br><br><strong style="color: #da281e">Jakcodex/Muledump recommends Firefox</strong> \
            <br>If you like your browser and can get it working in a way you like, then great you can disregard this.\
            <br><br>If not then we recommend you install <a href="https://www.firefox.com/" target="_blank">Firefox</a> and run through the <a href="https://github.com/jakcodex/muledump/wiki/Installation-and-Setup" target="_blank">Installation and Setup Guide</a>.\
        ' : '' ) +
        ' \
        <br><br><strong>Still having troubles?</strong> \
        <br>Head over to Github and read about <a href="https://jakcodex.github.io/muledump/#jakcodex-supportandcontributions" target="_blank">Support</a> or drop into our <a href="https://discord.gg/JFS5fqW" target="_blank">Discord server</a>. \
    ');
    if ( setuptools.data.config.corsAssistant === 1 ) setuptools.lightbox.build('muledump-cors', ' \
        <br><br>You can disable the <strong>CORS Assistant</strong> in the <a href="#" class="setuptools link settings noclose">Settings Manager</a>.</strong>\
    ');
    setuptools.lightbox.settitle('muledump-cors', 'Problem Assistant');
    setuptools.lightbox.display('muledump-cors', {variant: 'select'});
    $('.setuptools.link.settings').click(function() {
        setuptools.app.config.settings('corsAssistant');
    });

    $('#archive-backup').on('click.archive.backup', function(){
        setuptools.app.backups.createarchive();
    })

};

//  alert the user to an api http server error
setuptools.app.assistants.xhrError = function(xhr) {

    if ( typeof xhr !== 'object' || typeof xhr.status !== 'number' || xhr.status === 0 ) return;
    if ( setuptools.state.notifier === true ) return;
    setuptools.state.notifier = true;

    var message = 'HTTP Server Error ' + xhr.status + ': ';
    switch(xhr.status) {
        case 404:
            message += 'File not found';
            break;
        case 403:
            message += 'Request Forbidden';
            break;
        case 500:
            message += 'Internal Server Error';
            break;
        case 503:
            message += 'Service Unavailable';
            break;
        default:
            message += 'Other';
    }

    setuptools.lightbox.close();
    setuptools.lightbox.build('muledump-xhrError', ' \
        There was a problem with the request to ROTMG servers. \
        <br><br><strong class="negative">' + message + '</strong> \
        <br><br>Please try again. <a href="' + setuptools.config.httpErrorHelp + '" target="_blank">Click here</a> for more information.\
    ');
    setuptools.lightbox.display('muledump-xhrError', {afterClose: function() { setuptools.state.notifier = false; }});

};

//  prompt the user to download a backup if a certain time period has passed
setuptools.app.assistants.backups = function(manual) {

    if ( setuptools.data.config.backupAssistant === 0 || setuptools.state.notifier === true ) return;
    var lastBackup = setuptools.storage.read('backupAssistant');
    if ( manual === true || !lastBackup || (Date.now()-lastBackup >= (setuptools.data.config.backupAssistant*86400000)) ) {

        setuptools.state.notifier = true;
        setuptools.lightbox.build('backup-assistant', ' \
            It is good practice to download a backup of your Muledump configuration from time-to-time.\
             \
            <br><br><div class="setuptools link downloadBackup menuStyle menuSmall cfleft textCenter">Download Latest Backup</div> \
            <div class="setuptools link cancel menuStyle menuSmall negative cfright">Cancel</div> \
            \
            <div class="fleft cboth"><br>The backup assistant can be disabled in <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>.</div> \
        ');

        setuptools.lightbox.settitle('backup-assistant', 'Backup Assistant');
        setuptools.lightbox.display('backup-assistant', {variant: 'setuptools-small', afterClose: function() {
            setuptools.state.notifier = false;
        }});

        setuptools.storage.write('backupAssistant', Date.now());

        $('.setuptools.link.downloadBackup').click(function() {
            setuptools.app.backups.latest(function() {
                setuptools.app.assistants.backups(true);
            });
        });

        $('.setuptools.link.settingsmanager').click(function () {

            setuptools.app.backups.latest(function() {
                setuptools.app.assistants.backups(true);
            });

            setuptools.app.config.settings('backupAssistant');

        });

    }

};

//  assist in updating renders-related files
setuptools.app.assistants.rendersupdate = function(data) {

    setuptools.lightbox.build('rendersupdate-assistant', ' \
        <div class="flex-container" style="flex-flow: column; min-width: 400px; align-items: flex-start;">\
            <div>\
            ' + ( (data.commit) ? ' \
                An updated renders has been published!\
                <br><br>This means you have outdated information and missing game sprites in Muledump.\
                <br><br>Click to save these files over the existing ones in your Muledump install and then refresh!\
            ' : ' \
                You are running the latest available renders.\
            ' ) + ' \
                <br>&nbsp;\
            </div>\
            <div class="flex-container" style="justify-content: space-evenly;">\
                <div style="width: 50%; text-align: center; padding-right: 5px;"><strong>Installed Version</strong></div> \
                <div style="width: 50%;"><span style="font-weight: bold;">' + data.currentRenders + '</span> <span class="generic text dark">(' + data.currentRendersDate.toLocaleString() + ')</span></div>\
            </div>\
            <div class="flex-container" style="justify-content: space-evenly;">\
                <div style="width: 50%; text-align: center; padding-right: 5px;"><strong>Latest Version</strong></div> \
                <div style="width: 50%;"><span style="font-weight: bold;">' + data.latestRenders + '</span> <span class="generic text dark">(' + data.latestRendersDate.toLocaleString() + ')</span></div>\
            </div>\
    ');

    if ( data.commit ) {

        setuptools.lightbox.build('rendersupdate-assistant', ' \
            <div class="flex-container">&nbsp;</div>\
            <div class="flex-container">\
                <a download="renders.png" href="' + setuptools.config.githubRawUrl + '/' + data.commit.sha + '/lib/renders.png"><div class="setuptools link menuStyle menuSmall bright noclose textCenter">\
                    /lib/renders.png\
                </div></a>\
                <a download="constants.js" href="' + setuptools.config.githubRawUrl + '/' + data.commit.sha + '/lib/constants.js"><div class="setuptools link menuStyle menuSmall bright noclose textCenter">\
                    /lib/constants.js\
                </div></a>\
                <a download="sheets.js" href="' + setuptools.config.githubRawUrl + '/' + data.commit.sha + '/lib/sheets.js"><div class="setuptools link menuStyle menuSmall bright noclose textCenter mr0">\
                    /lib/sheets.js\
                </div></a>\
            </div>\
            <div>&nbsp;<br>Tired of having to update these files or Muledump yourself? Why not check out <a href="' + setuptools.config.url + '/muledump.html" target="_blank">Muledump Online</a>?</div>\
        ');

    }

    setuptools.lightbox.build('rendersupdate-assistant', ' \
        </div>\
    ');

    setuptools.lightbox.goback('rendersupdate-assistant', function() {
        setuptools.app.muledump.checkupdates(true);
    });
    setuptools.lightbox.settitle('rendersupdate-assistant', 'Renders Version Information');
    setuptools.lightbox.drawhelp('rendersupdate-assistant', 'docs/muledump/rendersupdate', 'Renders Version Help');
    setuptools.lightbox.close();
    setuptools.lightbox.display('rendersupdate-assistant', {variant: 'select'});

};

//  assist the user in upgrading to the new Jakcodex/Muledump CORS Adapter extension
setuptools.app.assistants.jakcodexcors = function() {

    var variant = '';
    if ( setuptools.browser === 'chrome' ) variant = 'Chrome';
    if ( setuptools.browser === 'opera' ) variant = 'Opera';
    if ( setuptools.browser === 'firefox' ) variant = 'Firefox';
    if ( variant === '' ) return;

    if ( setuptools.browser === 'chrome' ) {

        setuptools.lightbox.build('jakcodexcors-extension-notice', " \
            Jakcodex/Muledump no longer recommends Google Chrome because it no longer allows extensions to receive the types of requests necessary to work with ROTMG.\
            <br><br>You can read more about <a href='https://github.com/jakcodex/muledump/wiki/Chrome-v76-Breaking-Changes' target='_blank'>Chrome v76 Breaking Changes</a> in the wiki.\
        ");
        setuptools.lightbox.settitle('jakcodexcors-extension-notice', 'Problems with Chrome');

    } else {

        setuptools.lightbox.build('jakcodexcors-extension-notice', " \
            Jakcodex/Muledump provides a CORS extension for " + variant + " users.\
            <br><br>\
            <div class='flex-container'>\
                <a href='" + (setuptools.config.corsURL[setuptools.browser] || setuptools.config.corsURL.default) + "' target='_blank'>\
                    <div class='menuStyle formStyle textCenter mr0 cboth' style='width: 300px;'>Jakcodex/Muledump CORS Adapter for " + variant + "</div>\
                </a>\
            </div>\
            <br>This new extension is always on and requires no configuration. Install the extension and you're ready to go. \
            <br><br>Header over to <a href='https://github.com/jakcodex/muledump/wiki/Muledump+CORS+Adapter' target='_blank'>Muledump CORS Adapter</a> in the wiki to read more.\
        ");
        setuptools.lightbox.settitle('jakcodexcors-extension-notice', 'New ' + variant + ' Extension Available');

    }

    setuptools.lightbox.display('jakcodexcors-extension-notice', {variant: 'fl-Notice'});

};

//  assist the user by recommending they upgrade their browser
setuptools.app.assistants.browser = function() {

    setuptools.lightbox.build('browser-assistant', ' \
            <div>Your browser is not compatible with all Muledump features.<br><br></div> \
            <div class="w100 flex-container"> \
                <a href="https://www.google.com/chrome/" target="_blank"> \
                    <div class="setuptools menuStyle textCenter">Download Google Chrome</div> \
                </a> \
            </div> \
            <div>\
                <br>We recommend you switch to Google Chrome or Firefox. Once ready, check out the <a href="https://github.com/jakcodex/muledump/wiki/Installation-and-Setup" target="_blank">Installation and Setup Guide</a> to get setup.\
                <br><br>If you believe this message is in error please report it to us via a <a href="https://github.com/jakcodex/muledump#support-and-contributions" target="_blank">Support Channel</a>.\
            </div> \
        ');
    setuptools.lightbox.settitle('browser-assistant', 'Muledump Error');
    setuptools.lightbox.display('browser-assistant', {variant: 'fl-Notice'});

};

//  assist the user by recommending muledump configuration changes to help their browser performance
setuptools.app.assistants.performance = function(queueIndex) {

    setuptools.lightbox.build('perf-assistant', ' \
            <div>Your computer might suffer from performance issues if you display all Muledump animations. \
            <br><br>You should consider setting animations to Reduced if you experience any performance issues.<br><br></div> \
            <div class="w100 flex-container" style="justify-content: space-between;"> \
                <div class="setuptools link acknowledge menuStyle negative textCenter">Acknowledge and Close</div>\
                <div class="setuptools link settingsManager menuStyle textCenter">Settings Manager</div> \
            </div> \
        ');
    setuptools.lightbox.settitle('perf-assistant', 'Performance Assistant');
    setuptools.lightbox.display('perf-assistant', {variant: 'fl-Notice'});

    $('.setuptools.link.settingsManager').click(function() {
        setuptools.app.config.settings('animations');
    })

    $('.setuptools.link.acknowledge').click(function() {

        setuptools.data.acknowledge.assistants.performance = true;
        setuptools.app.config.save('Assistant/Performance acknowledged');
        setuptools.app.muledump.notices.remove(queueIndex)

    });

};

/**
 * @function
 * @param {string} guid
 * @param {string} error
 * Provide an error reporting assistant for when a Mule fails to load
 */
setuptools.app.assistants.muledumperror = function(guid, error) {

    if ( setuptools.state.notifier === true ) return;
    setuptools.state.notifier = true;
    setuptools.state.assistant.muledumperror = true;
    setuptools.lightbox.build('muledumperror-assistant', '\
        <div class="w100">There was an error while accessing your account.<br>&nbsp;</div> \
        <div>' + guid + '<br>&nbsp;</div>\
        <div><strong class="negative">' + error + '</strong></div>\
    ');
    setuptools.lightbox.settitle('muledumperror-assistant', 'Account Error');
    setuptools.lightbox.display('muledumperror-assistant', {variant: 'fl-Index textCenter', afterClose: function() {
        setuptools.state.notifier = false;
        setuptools.state.assistant.muledumperror = false;
    }});

};
