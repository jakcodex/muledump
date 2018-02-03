//  muledump setup tools - ui-based accounts.js management

//  setuptools object layout
var setuptools = {
    version: {
        major: 9,
        minor: 1,
        patch: 0
    },
    state: {
        error: false,
        loaded: false,
        firsttime: false,
        hosted: false,
        preview: false,
        ctrlKey: false,
        notifier: false,
        extension: undefined,
        assistant: {
            cors: false,
            ageVerify: false,
            tos: false,
            migration: false,
            backup: false
        }
    },
    browser: 'other',
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
        muledump: {
            notices: {
                queue: []
            }
        },
        mulequeue: {}
    }
};

//  muledump setuptools server configuration
setuptools.config.actoken = 'jcmd';
setuptools.config.devForcePoint = '';
setuptools.config.errorColor = '#ae0000';
setuptools.config.ga = 'UA-111254659-2';
setuptools.config.gaFuncName = 'analytics';
setuptools.config.gaInterval = 300000;
setuptools.config.githubArchive = 'https://github.com/jakcodex/muledump/archive/';
setuptools.config.githubRawUrl = 'https://raw.githubusercontent.com/jakcodex/muledump';
setuptools.config.hostedDomain = 'jakcodex.github.io';
setuptools.config.keyPrefix = 'muledump:setuptools:';
setuptools.config.muledump = {corsMaxAttempts: 2};
setuptools.config.mqBGDelay = 1000;
setuptools.config.mqBGHealthDelay = 5000;
setuptools.config.mqDefaultConfig = {
    action: 'query',
    ignore_cache: false,
    cache_only: false
};
setuptools.config.mqRateLimitExpiration = 300000;
setuptools.config.mqStaleCache = 86400000;
setuptools.config.noticesMonitorMaxAge = 300;
setuptools.config.oneclickHelp = 'https://github.com/jakcodex/muledump/wiki/One-Click-Login';
setuptools.config.perfLoadTime = 3000;
setuptools.config.perfMinCPUs = 4;
setuptools.config.ratelimitHelp = 'https://github.com/jakcodex/muledump/wiki/Rate-Limiting';
setuptools.config.reloadDelay = 3;
setuptools.config.totalsItemWidth = 44;
setuptools.config.updatecheckURL = 'https://api.github.com/repos/jakcodex/muledump/tags';
setuptools.config.updatecheckTTL = 30000;
setuptools.config.url = 'https://jakcodex.github.io/muledump';

//  update server config for muledump online preview
if ( window.location && window.location.pathname.match(/^\/muledump-preview/) ) {

    setuptools.state.preview = true;
    setuptools.config.keyPrefix += 'preview:';
    setuptools.config.url += '-preview';
    setuptools.config.ga = 'UA-111254659-3';
    setuptools.config.githubArchive = setuptools.config.githubArchive.replace('muledump', 'muledump-preview');
    setuptools.config.githubRawUrl = setuptools.config.githubRawUrl.replace('muledump', 'muledump-preview');
    setuptools.config.updatecheckURL = setuptools.config.updatecheckURL.replace('muledump', 'muledump-preview');

}

//  regex patterns
setuptools.config.regex = {
    email: new RegExp(/^.*?@.*?\..*$/),
    guid: new RegExp(/^((steamworks|kongregate|kabam):[a-zA-Z0-9]*)$/i),
    accountsJS: new RegExp(/^(?:(rowlength|testing|prices|mulelogin|nomasonry|debugging) ?= ?([a-z0-9]*).*?|.*?(?:'|")((?:(?:[^<>()\[\]\\.,;:\s@"]+(?:\.[^<>()\[\]\\.,;:\s@"]+)*)|(?:".+"))@(?:(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(?:(?:steamworks|kongregate|kabam):[a-zA-Z0-9]*))(?:'|"): ?(?:'|")(.*?)(?:'|").*?)$/i),
    helpdocsBaseHref: new RegExp(/<!-- ([a-zA-Z]*) (.*?) -->/m),
    backupId: new RegExp(/^muledump-backup-.*$/),
    hashnav: new RegExp(/([a-z0-9_]+)/ig),
    renderscheck: new RegExp(/^renders-(?:([0-9]{4})([0-3]{1}[0-9]{1})([0-3]{1}[0-9]{1})-([0-2]{1}[0-9]{1})([0-5]{1}[0-9]{1})([0-5]{1}[0-9]{1}))-(.*)$/),
    backupKey: new RegExp('^' + setuptools.config.keyPrefix + '(muledump-backup-([0-9]*))$'),
    storageKeys: new RegExp('^' + setuptools.config.keyPrefix + '.*$'),
    gaUserId: new RegExp(/^([a-f0-9]{20})$/i)
};

//  muledump setuptools client configuration defaults
setuptools.data.config.accountAssistant = 1;
setuptools.data.config.accountLoadDelay = 0;
setuptools.data.config.accountsPerPage = 5;
setuptools.data.config.alertNewVersion = 1;
setuptools.data.config.animations = 1;
setuptools.data.config.automaticBackups = true;
setuptools.data.config.autoReloadDays = 1;
setuptools.data.config.backupAssistant = 14;
setuptools.data.config.corsAssistant = 1;
setuptools.data.config.debugging = false;
setuptools.data.config.enabled = false;
setuptools.data.config.ga = false;
setuptools.data.config.gaErrors = true;
setuptools.data.config.gaOptions = true;
setuptools.data.config.gaPing = true;
setuptools.data.config.gaTotals = true;
setuptools.data.config.groupsMergeMode = 2;
setuptools.data.config.loginOnlyTotals = true;
setuptools.data.config.longpress = 1000;
setuptools.data.config.maximumBackupCount = 5;
setuptools.data.config.menuPosition = 2;
setuptools.data.config.mulelogin = 0;
setuptools.data.config.mqBGTimeout = 180;
setuptools.data.config.mqConcurrent = 1;
setuptools.data.config.mqKeepHistory = 100;
setuptools.data.muledump = {
    chsortcustom: {
        format: 1,
        accounts: {}
    }
};
setuptools.data.config.nomasonry = 0;
setuptools.data.config.pagesearch = 2;
setuptools.data.config.preventAutoDownload = true;
setuptools.data.config.rowlength = 7;
setuptools.data.config.testing = 0;
setuptools.data.config.tooltip = 500;
setuptools.data.config.totalswidth = 0;

//  by default the userid is false as it will be generated after the first page load
setuptools.data.userid = false;

//  various notices and prompts can be acknowledged and we need to track that in a permanent way
setuptools.data.acknowledge = {
    assistants: {}
};

//  determine if muledump online or local
if ( window.location && window.location.hostname === setuptools.config.hostedDomain ) {

    setuptools.state.hosted = true;

    //  switch default value for online users
    setuptools.data.config.ga = true;

}

//  copy the default client configuration settings (for settings reset) [deprecated]
setuptools.copy.config = $.extend(true, {}, setuptools.data.config);
setuptools.copy.config.enabled = true;

//  copy the default client configuration
setuptools.copy.data = $.extend(true, {}, setuptools.data);

//  prepare accounts manager state
setuptools.app.accounts.state = {
    accountList: []
};

//  basic determine useragent
var isChromium = window.chrome;
if ( window.navigator.userAgent.indexOf("OPR") > -1 ) setuptools.browser = 'opera';
if ( window.navigator.userAgent.indexOf('Firefox') > -1 ) setuptools.browser = 'firefox';
if (
    isChromium !== null &&
    typeof isChromium === 'object' &&
    setuptools.browser === 'other' &&
    !window.navigator.userAgent.match("CriOS")
) setuptools.browser = 'chrome';

//  set a default rendersVersion if none provided
if ( !rendersVersion || rendersVersion.match(setuptools.config.regex.renderscheck) === null ) rendersVersion = 'renders-20170820-221800-X0.0.0';

$(window).resize(function() {
    setuptools.app.muledump.totalsWidth(window.totals);
});

//  handle setuptools button click
setuptools.click = function() {

    //  if local storage isn't supported then setup tools is completely bypassed
    if ( setuptools.state.error === true ) {

        setuptools.app.assistants.browser();

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

        //  control keydown tracking
        $(document).keydown(function(e) {
            if ( e.keyCode === 17 ) setuptools.state.ctrlKey = true;
        });

        $(document).keyup(function(e) {
            if ( e.keyCode === 17 ) setuptools.state.ctrlKey = false;
        });

        //  automatically close any context menus
        $('#top > div:not(#notice)').mouseover(setuptools.lightbox.menu.context.close);
        $('#top > div:not(.handle.options)').mouseenter(function() {
            clearTimeout(setuptools.tmp.optionsMouseLeaveTimer);
            $('#options').hide().css({visibility: 'hidden'});
        });

        //  add some prototypes
        if ( !String.prototype.splice ) {

            String.prototype.splice = function(start, delCount, newSubStr) {
                return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
            };

        }

    });

})($, window);

//  I'd like to add a personal thank you to Atomizer and everyone who contributed to Muledump before Jakcodex/Muledump.
//  There is some amazing code in Muledump prior to my contributions and I've learned a lot by studying it.
