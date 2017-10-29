//  help users with account administrative issues
setuptools.app.assistants.account = function(url, extraopts, callback) {

    //  if it isn't defined then it is an unknown type
    if ( !extraopts.type || typeof setuptools.state.assistant[extraopts.type] != 'boolean' ) {

        window.techlog('MD/accountAssistant encountered unknown type ' + extraopts.type, 'force');
        return;

    }

    //  set this assistant to active (2 or more occurrences will cause the subsequent ones to be ignored)
    if ( extraopts.type === 'ageVerify' && setuptools.state.assistant[extraopts.type] === false ) {

        setuptools.lightbox.build('muledump-account-assistant', ' \
				You need to verify your age in order to use this account. \
				<br><br>Please proceed to: <a href="' + url + '" target="_blank">' + url + '</a> \
				<br><br>When you are ready <a href="#" class="setuptools app link popupComplete">click here</a> to continue. \
				<br><br>You can disable the account assistant in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
			');
        setuptools.lightbox.settitle('muledump-account-assistant', 'Kongregate Age Verification');
        setuptools.lightbox.drawhelp('muledump-account-assistant', 'docs/muledump/ageVerify', 'Age Verification Help');

    } else if ( extraopts.type === 'tos' && setuptools.state.assistant[extraopts.type] === false ) {

        setuptools.lightbox.build('muledump-account-assistant', ' \
				You need to accept the TOS in order to use this account. \
				<br><br>Please proceed to: <a href="' + url + '" target="_blank">' + url + '</a> \
				<br><br>When you are ready <a href="#" class="setuptools app link popupComplete">click here</a> to continue. \
				<br><br>You can disable the account assistant in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
			');
        setuptools.lightbox.settitle('muledump-account-assistant', 'TOS Verification');
        setuptools.lightbox.drawhelp('muledump-account-assistant', 'docs/muledump/tos', 'TOS Verification Help');

    } else if ( extraopts.type === 'migration' && setuptools.state.assistant[extraopts.type] === false ) {

        setuptools.lightbox.build('muledump-account-assistant', ' \
				You need to finish migration in order to use this account. \
				<br><br>Please proceed to: <a href="' + url + '" target="_blank">' + url + '</a> \
				<br><br>When you are ready <a href="#" class="setuptools app link popupComplete">click here</a> to continue. \
				<br><br>Warning: Migration may no longer be possible. \
				<br><br>You can disable the account assistant in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
			');
        setuptools.lightbox.settitle('muledump-account-assistant', 'Account Migration');
        setuptools.lightbox.drawhelp('muledump-account-assistant', 'docs/muledump/migration', 'Account Migration Help');

    } else {

        //  hmm

    }

    setuptools.lightbox.display('muledump-account-assistant', {variant: 'setuptools-medium', actionClose: function() { setuptools.state.assistant[extraopts.type] = false; }});
    setuptools.state.assistant[extraopts.type] = true;
    $('.setuptools.link.settingsmanager').click(function() { setuptools.app.config.settings('accountAssistant'); });
    if ( typeof callback === 'function' ) $('.setuptools.link.popupComplete').click(callback);

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
            href="' + window.BASEURL + '" target="_blank">\
                ' + window.BASEURL + '\
            </a> \
        <br><br>If it fails to load then you are having connectivity issues with ROTMG. \
        <br><br><strong>Is your CORS extension configured properly?</strong> \
        <br>Check out the Requirements section in the <a \
            href="https://github.com/jakcodex/muledump/wiki/Installation-and-Setup#requirements" target="_blank">\
                Installation and Setup Guide\
            </a> \
        for visual help in configuring CORS. \
        <br><br><strong>CORS can be finicky</strong> \
        <br>Try turning the CORS extension off and back on. This fixes it majority of the time. \
        <br><br>If that fails, try removing and re-adding the Intercepted URL. \
        <br><br><strong>Still having troubles?</strong> \
        <br>Head over to Github and read about <a href="https://jakcodex.github.io/muledump/#jakcodex-supportandcontributions" target="_blank">Support</a>. \
    ');
    if ( setuptools.data.config.corsAssistant === 1 ) setuptools.lightbox.build('muledump-cors', ' \
        <br><br>You can disable the <strong>CORS Assistant</strong> in the <a href="#" class="setuptools link settings noclose">Settings Manager</a>.</strong>\
    ');
    setuptools.lightbox.settitle('muledump-cors', 'Problem Assistant');
    setuptools.lightbox.display('muledump-cors');
    $('.setuptools.link.settings').click(function() { setuptools.app.config.settings('corsAssistant'); });

};