//  muledump setup tools - ui-based accounts.js management

//  setuptools object layout
var setuptools = {
    version: {
        major: 8,
        minor: 3,
        patch: 0
    },
    state: {
        error: false,
        loaded: false,
        firsttime: false,
        hosted: false,
        ctrlKey: false,
        versionNotifier: false,
        assistant: {
            cors: false,
            ageVerify: false,
            tos: false,
            migration: false,
            backup: false
        }
    },
    originalAccountsJS: false,
    objects: {
        dataGroup: {
            format: 1,
            groupList: {},
            groupOrder: []
        },
        group: {
            enabled: true,
            members: [] //  guids in an array; active groups will get merged into a deduped runtime accounts variable
        },
        account: {
            enabled: true,
            loginOnly: false,
            autoReload: false,
            cacheEnabled: true
        }
    },
    tmp: {},
    config: {},
    data: {
        config: {},
        version: {},
        accounts: {},
        groups: {},
        options: {}
    },
    copy: {
        config: {}
    },
    storage: {},
    lightbox: {
        active: {},
        builds: {},
        overrides: {},
        menu: {
            paginate: {
                state: {}
            },
            context: {},
            search: {}
        }
    },
    init: {},
    app: {
        accounts: {},
        assistants: {},
        groups: {},
        config: {},
        backups: {},
        upgrade: {},
        muledump: {}
    }
};

//  muledump setuptools server configuration
setuptools.config.keyPrefix = 'muledump:setuptools:';
setuptools.config.hostedDomain = 'jakcodex.github.io';
setuptools.config.url = 'https://jakcodex.github.io/muledump';
setuptools.config.errorColor = '#ae0000';
setuptools.config.devForcePoint = '';
setuptools.config.reloadDelay = 3;
setuptools.config.actoken = 'jcmd';
setuptools.config.regex = {
    email: new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
    guid: new RegExp(/^((steamworks|kongregate|kabam):[a-zA-Z0-9]*)$/i),
    accountsJS: new RegExp(/^(?:(rowlength|testing|prices|mulelogin|nomasonry|debugging) ?= ?([a-z0-9]*).*?|.*?(?:'|")((?:(?:[^<>()\[\]\\.,;:\s@"]+(?:\.[^<>()\[\]\\.,;:\s@"]+)*)|(?:".+"))@(?:(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(?:(?:steamworks|kongregate|kabam):[a-zA-Z0-9]*))(?:'|"): ?(?:'|")(.*?)(?:'|").*?)$/, 'i'),
    helpdocsBaseHref: new RegExp(/<!-- ([a-zA-Z]*) (.*?) -->/m),
    backupId: new RegExp(/^muledump-backup-.*$/)
};
setuptools.config.muledump = {
    corsMaxAttempts: 2
};

//  update server config for muledump online preview release
if ( window.location && window.location.pathname.match(/^\/muledump-preview/) ) {
    setuptools.config.keyPrefix += 'preview:';
    setuptools.config.url += '-preview';
}

//  determine if muledump online or local
if ( window.location && window.location.hostname === setuptools.config.hostedDomain ) setuptools.state.hosted = true;

//  muledump setuptools client configuration defaults
setuptools.data.config.enabled = false;
setuptools.data.config.preventAutoDownload = true;
setuptools.data.config.maximumBackupCount = 5;
setuptools.data.config.automaticBackups = true;
setuptools.data.config.rowlength = 7;
setuptools.data.config.testing = 0;
setuptools.data.config.prices = 0;
setuptools.data.config.mulelogin = 0;
setuptools.data.config.nomasonry = 0;
setuptools.data.config.accountLoadDelay = 0;
setuptools.data.config.debugging = false;
setuptools.data.config.alertNewVersion = 1;
setuptools.data.config.menuPosition = 2;
setuptools.data.config.backupAssistant = 14;
setuptools.data.config.corsAssistant = 1;
setuptools.data.config.accountAssistant = 1;
setuptools.data.config.longpress = 1000;
setuptools.data.config.accountsPerPage = 5;
setuptools.data.config.groupsMergeMode = 2;
setuptools.data.config.autoReloadDays = 1;
setuptools.data.config.tooltip = 500;
setuptools.data.muledump = {
    chsortcustom: {
        format: 1,
        accounts: {}
    }
};

//  copy the default client configuration settings (for settings reset)
setuptools.copy.config = $.extend(true, {}, setuptools.data.config);
setuptools.copy.config.enabled = true;

//  copy the default client configuration
setuptools.copy.data = $.extend(true, {}, setuptools.data);

//  prepare accounts manager state
setuptools.app.accounts.state = {
    accountList: []
};

//  handle setuptools button click
setuptools.click = function() {

    //  if local storage isn't supported then setup tools is completely bypassed
    if ( setuptools.state.error === true ) {

        setuptools.lightbox.error('SetupTools cannot run because your browser does not presently support local storage.', 1);

        //  load the app index
    } else setuptools.app.index();

};

(function($, window) {

    //  dom loaded
    $(function() {

        //  jquery bindings
        $('#setuptools').click(setuptools.click);

        //  track document clicks
        $(document).click(function(e) {
            setuptools.tmp.previousClick = setuptools.tmp.activeClick;
            setuptools.tmp.activeClick = e;
        });

        $(document).keydown(function(e) {
            if ( e.keyCode === 17 ) setuptools.state.ctrlKey = true;
        });

        $(document).keyup(function(e) {
            if ( e.keyCode === 17 ) setuptools.state.ctrlKey = false;
        });

    });

})($, window);

//  I'd like to add a personal thank you to Atomizer and everyone who contributed to Muledump before Jakcodex/Muledump.
//  There is some code in Muledump prior to my contributions and I've learned a lot by studying it.
