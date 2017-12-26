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

        } else if ( !matches[1] ) setuptools.app.backups.manager();

    }
    //  assistance
    else if ( matches[0] === 'help' ) {

        if ( matches[1] === 'cors' ) {

            setuptools.lightbox.close();
            location.hash = '#';
            setuptools.app.assistants.cors(true);

        }

    }

};

//  wrap analytics var
setuptools.app.ga = function(command, action, value1, value2, value3, value4, value5) {

    //  don't run if local or disabled
    var analytics = window[setuptools.config.gaFuncName];
    if (
        typeof analytics !== 'function' ||
        setuptools.state.hosted === false ||
        setuptools.data.config.ga === false
    ) return;

    //  initial events to trigger
    if ( command === 'init' ) {

        if ( setuptools.state.loaded === true && (setuptools.data.userid === false || !setuptools.data.userid.match(setuptools.config.regex.gaUserId)) ) {

            setuptools.app.muledump.notices.add('Review new Usage Analytics options', setuptools.app.gaReview);
            setuptools.data.userid = $.sha256(Date.now()).toString('hex');
            setuptools.data.userid = setuptools.data.userid.substr(0, 10) + setuptools.data.userid.substr(setuptools.data.userid.length-10, 10);
            setuptools.app.config.save();
            return;

        }

        analytics('set', 'userId', setuptools.data.userid);
        analytics('create', setuptools.config.ga);
        analytics('send', 'pageview');
        setuptools.tmp.gaInterval = setInterval(setuptools.app.ga, setuptools.config.gaInterval, 'send', {hitType: 'pageview', page: '#ping'});

        if ( setuptools.data.config.gaTotals === true ) analytics('send', 'event', {
            eventCategory: 'totals',
            eventAction: 'accounts',
            eventValue: Object.keys(setuptools.data.accounts.accounts).length
        });

        if ( setuptools.data.config.gaTotals === true ) analytics('send', 'event', {
            eventCategory: 'totals',
            eventAction: 'totalGroups',
            eventValue: setuptools.data.groups.groupList.length
        });

        analytics('send', 'event', {
            eventCategory: 'runtimeMode',
            eventAction: 'loaded'
        });

        return;

    }

    //  at least these two arguments are required
    if ( !command && !action ) return;

    //  if the userid isn't generated or the user optioned out thru the notice panel we'll disable analytics
    if ( setuptools.data.userid === false || setuptools.data.userid === 0 ) return;

    //  run any additional commands (must be explicitly approved below)
    if (
        ( action === 'event' && ['rateLimited', 'corsError', 'accountBanned', 'genericServerError', 'export-imgur-error', 'export-imgur-networkError', 'export-imgur-httpError', 'export-img-loadError'].indexOf(value1.eventAction) > -1 && setuptools.data.config.gaErrors === true ) ||
        ( action === 'event' && ['staleCache', 'charSortCustom', 'wawawa', 'export-txt', 'export-csv', 'export-json', 'export-img', 'export-imgur'].indexOf(value1.eventAction) > -1 && setuptools.data.config.gaOptions === true ) ||
        ( action === 'event' && ['reloadAccounts', 'runtimeMode'].indexOf(value1.eventAction) > -1 ) ||
        ( typeof action === 'object' && action.hitType === 'pageview' && action.page === '#ping' && setuptools.data.config.gaPing === true ) ||
        ( typeof action === 'object' && action.hitType === 'pageview' && action.page !== '#ping' )
    ) analytics(command, action, value1, value2, value3, value4, value5);

};

//  explain analytics to users
setuptools.app.gaReview = function() {

    setuptools.lightbox.build('gaReview', '\
        <div class="fleft cboth" style="text-align: justify;">\
            Usage Analytics is a new feature in Jakcodex/Muledump. It provides anonymous information using Google Analytics to help us improve the quality and features in Muledump. \
            You can read more about the collected data at our <a href="' + setuptools.config.url + '/privacy-policy" target="_blank">Privacy Policy</a> page. \
            <br><br>Participation in Usage Analytics is entirely optional. You can also control what information is collected by visiting the Settings Manager.\
            <br>&nbsp;\
        </div>\
        <div class="setuptools link gaOptOut fleft menuStyle negative cfright textCenter">Opt-out of Usage Analytics</div> \
        <div class="setuptools link gaSettings fleft menuStyle cfleft textCenter">Review Usage Analytics Settings</div> \
    ');
    setuptools.lightbox.settitle('gaReview', 'Usage Analytics Information');
    setuptools.lightbox.display('gaReview', {variant: 'fl-Introduction'});

    $('.setuptools.link.gaOptOut').click(function() {

        setuptools.data.config.ga = false;
        setuptools.app.config.save();
        setuptools.lightbox.build('gaReview-optOut', 'Usage Analytics have been disabled.');
        setuptools.lightbox.settitle('gaReview-optOut', 'Usage Analytics Opt-out');
        setuptools.lightbox.display('gaReview-optOut');

    });

    $('.setuptools.link.gaSettings').click(function() {
        setuptools.app.config.settings('none', 'system');
    });

};

//  send a message to amazon sns
setuptools.app.feedback = function(sourcePage, subject, message) {

    //  not yet fully supported
    return;

    //  assume the user wants to see the feedback form
    if ( !sourcePage && !subject && !message ) {

        setuptools.lightbox.build('feedback', ' \
            Fill out the form below to submit your feedback. No personal information is included in the message. \
            <br><br>&nbsp;\
            <div class="flex-container setuptools div feedback">\
                <div>Reporting an Error?</div>\
                <div>\
                    <select name="error" style="width: 100px;">\
                        <option value="0">No</option> \
                        <option value="1">Yes</option> \
                    </select>\
                </div>\
            </div>\
            <div class="flex-container setuptools div feedback mt5">\
                <div>Message Subject</div>\
                <div><input type="subject" name="subject" class="w100"></div>\
            </div>\
            <div class="flex-container setuptools div feedback mt5">\
                <div>Message Text</div>\
                <div><textarea name="text" class="w100" style="height: 250px;"></textarea></div>\
            </div>\
            <div class="setuptools link feedbackSubmit cfleft menuStyle menuSmall textCenter">Send Message</div> \
            <div class="setuptools link feedbackReset cfright menuStyle negative menuSmall textCenter mr0 noclose">Reset</div> \
        ');
        setuptools.lightbox.settitle('feedback', 'User Feedback');
        setuptools.lightbox.display('feedback');

        $('.setuptools.link.feedbackReset').click(function() {

            $('input').val('');
            $('select').val('0');
            $('textarea').val('');

        });

        $('.setuptools.link.feedbackSubmit').click(function() {

            var error = Number($('select[name="error"]').val());
            var subject = $('input[name="subject"]').val();
            var message = $('textarea[name="text"]').val();
            setuptools.app.feedback('feedback', 'Muledump User Feedback', 'New message via Muledump Feedback -- \n\nError: ' + ( (error === 0) ? 'No' : 'Yes' ) + '\n\nSubject: ' + subject + '\n\nMessage: \n\n' + message);

        });

        return;

    }

    //  these must be strings
    if ( typeof sourcePage !== 'string' || typeof subject !== 'string' || typeof message !== 'string' ) return;

    //  validate the arn
    var matches = setuptools.config.snsArn.match(/^arn:aws:sns:([a-z0-9-]+):[0-9]+:.*$/i);
    if ( matches === null ) return;

    // initialize the Amazon Cognito credentials provider
    AWS.config.region = matches[1]; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: setuptools.config.snsIdentityPool
    });

    //  prepare and send the message
    var sns = new AWS.SNS();
    var params = {
        Message: message,
        Subject: subject,
        TopicArn: setuptools.config.snsArn
    };

    sns.publish(params, function(err, data) {
        if (err) HandleError(err, err.stack);
        else     HandleSuccess(data);
    });

    //  provide the user an alternative because their feedback failed to send
    function HandleError() {

        setuptools.lightbox.close(sourcePage);
        setuptools.lightbox.build('feedback-error', ' \
            Oops! There was a problem submitting your feedback. \
            <br><br>See the <a href="' + setuptools.config.url + '/#support-and-contributions" target="_blank">Support</a> section of the readme for alternative methods. \
            <br><br>Your message was:\
            <br><br><textarea class="setuptools w100" style="height: 150px;">' + message + '</textarea>\
            <br><br>&nbsp;\
            <div class="setuptools link feedbackRetry menuStyle menuTiny noclose">Retry</div>\
        ');
        setuptools.lightbox.settitle('feedback-error', 'Feedback Error');
        setuptools.lightbox.display('feedback-error', {variant: 'fl-Main'});

        //  retry
        $('.setuptools.link.feedbackRetry').click(function() {
            $(this).text('Retrying...');
            setuptools.app.feedback('feedback-error', subject, message);
        });

    }

    //  finish up
    function HandleSuccess() {

        setuptools.lightbox.close(sourcePage);
        setuptools.lightbox.build('feedback-success', 'Your feedback has been sent! Thank you.');
        setuptools.lightbox.settitle('feedback-success', 'Feedback');
        setuptools.lightbox.display('feedback-success');

    }

};
