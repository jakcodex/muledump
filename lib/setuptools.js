//  muledump setup tools - ui-based accounts.js management

//  setuptools object layout
var setuptools = {
    error: false,
    loaded: false,
    config: {},
    data: {
        config: {}
    },
    init: {},
    storage: {},
    app: {
        initsetup: {},
        config: {}
    },
    lightbox: {builds: {}}
};

//  setuptools configuration
setuptools.config.keyPrefix = 'muledump:setuptools:';
setuptools.config.errorColor = '#ae0000';
setuptools.config.devForcePoint = '';

//  muledump setuptools configuration defaults
setuptools.data.config.preventAutoDownload = true;
setuptools.data.config.maximumBackupCount = 5;
setuptools.data.accounts = {};

//
//  storage tools
//

//  write to localStorage
setuptools.storage.write = function(key, value) {

    try {
        localStorage[setuptools.config.keyPrefix + key] = value;
    } catch(e) {
        return false;
    }

    return true;

};

//  read from localStorage
setuptools.storage.read = function(key) {

    result = '';
    try {
        result = localStorage[setuptools.config.keyPrefix + key];
    } catch (e) {}
    return result;

};

//  delete from localStorage
setuptools.storage.delete = function(key) {

    try {
        localStorage.removeItem(key);
    } catch (e) { return false; }
    return true;

};

//  check if localStorage is available
setuptools.storage.test = function() {

    //return false;
    setuptools.storage.write('test', 'test');
    if ( setuptools.storage.read('test') === 'test' ) {
        return true;
    } else return false;

};

//
//  lightbox tools
//

//  create a lightbox
setuptools.lightbox.create = function(data, config) {

    if ( typeof data === 'string' ) {

        if ( !config ) config = {};
        if ( typeof config === 'string' ) config = {variant: config};
        if ( typeof config !== 'object' ) {

            setuptools.lightbox.error('Supplied Featherlight config is invalid', 2);
            return;

        } else {

            if ( !config.variant ) config.variant = 'setuptools';
            if ( !config.openSpeed ) config.openSpeed = 0;
            if ( config.closeOnClick === undefined ) config.closeOnClick = 'anywhere';
            if ( setuptools.app.checknew() === true ) {
                config.closeOnClick = false;
                config.otherClose = 'a.setuptools';
            }
        }

        //console.log(config);
        $.featherlight(' \
            <p> \
            <h1>Muledump Setup</h1> \
            <span>' + data + '</span> \
            </p> \
        ', config);

    }

};

//  store pieces to a lightbox build
setuptools.lightbox.build = function(id, message) {

    //  create the build's array and store the message
    if ( !setuptools.lightbox.builds[id] ) setuptools.lightbox.builds[id] = [];
    setuptools.lightbox.builds[id].push(message);

};

//  display a built lightbox
setuptools.lightbox.display = function(id, config=false) {

    //  check if the build exists
    if ( !setuptools.lightbox.builds[id] ) {

        setuptools.lightbox.error('Build ID ' + id + ' does not exist.', 3);

        //  create the lightbox from the build data
    } else {

        if ( typeof config !== 'object' ) config = {};

        //  check for goback data
        gobackData = false;
        if ( setuptools.lightbox.builds[id][10000] ) {

            //  copy data, remove key, and insert message at end of build
            gobackData = setuptools.lightbox.builds[id][10000];
            setuptools.lightbox.builds[id].splice(10000, 1);
            setuptools.lightbox.builds[id].push(gobackData.message);

        }

        //  create the lightbox and delete the temporary build data
        setuptools.lightbox.create(setuptools.lightbox.builds[id].join(' '), config);
        setuptools.lightbox.builds[id].splice(0);

        //  bind any goback click
        if ( typeof gobackData === 'object' ) $('.setuptools.goback').click(function(e) { e.preventDefault(); gobackData.callback(); });

    }

};

setuptools.lightbox.goback = function(page, id) {

    //  picking an arbitrarily large number
    setuptools.lightbox.builds[id][10000] = {
        callback: page,
        message: '<div style="clear: both;"><br>Go back to the <a href="#" class="setuptools goback">previous page</a></div>'
    };

};

//  display an error message
setuptools.lightbox.error = function(message, code=0) {

    setuptools.lightbox.create(' \
        <p><span class="setuptools error">Error ' + code + '</span> - ' + message + '</p> \
        <span>See <a href="https://github.com/jakcodex/muledump/wiki/Setup+Tools" target="_blank">Setup Tools</a> in the wiki for more help.</span> \
    ');

};

//
//  application
//

//  start page for setup tools
setuptools.app.index = function(config) {

    setuptools.lightbox.build('main', 'Welcome to Muledump Account Setup Tools!');

    if ( typeof config !== 'object' ) config = {};

    //  look for a fresh configuration
    if ( setuptools.app.checknew() === true ) {

        setuptools.lightbox.build('main', ' \
            <br><br>It looks like you are new here. Setup Tools will help you get started with Muledump. Whether you\'re a new user or returning user it is easy to get up and running. \
            <br><br>New users can <a href="#" class="setuptools initsetup index">click here</a> to begin. \
            <br><br>Returning users can <a href="#" class="setuptools config restore">restore a backup</a>. \
        ');

    } else {

        setuptools.lightbox.build('main', ' \
            <br><br>What would you like to do? \
            <br><br><a href="#" class="setuptools accounts manage">Manage your accounts</a> \
            <br><br><a href="#" class="setuptools config backup">Create a configuration backup</a> \
            <br><br><a href="#" class="setuptools config restore">Restore a backup</a> \
        ');

    }

    //  display the built lightbox and register click action
    setuptools.lightbox.display('main', $.extend(true, {}, config, {'variant': 'setuptools-small'}));
    $('.setuptools.initsetup.index').click(setuptools.app.initsetup.index);
    $('.setuptools.config.restore').click(setuptools.app.config.restore);
    $('.setuptools.config.backup').click(setuptools.app.config.backup);

};

//  check if this is a new user
setuptools.app.checknew = function() {

    return (
        //  check if force point set for this position
        setuptools.config.devForcePoint === 'newuser' ||

        //  accounts object missing
        !setuptools.window.accounts ||

        //  accounts object present and in the default state
        (typeof setuptools.window.accounts === 'object' &&
        Object.keys(setuptools.window.accounts).length < 3 &&
        setuptools.window.accounts.email && setuptools.window.accounts.email2) ||

        //  accounts variable present but not an object
        typeof setuptools.window.accounts !== 'object'
    ) ? true : false;

};

//  cleanup config backups by enforcing the maximumBackupCount setting
setuptools.app.config.cleanup = function() {

    var backups = [];

    //  find all backups in local storage
    for ( var i in localStorage ) {
        if ( localStorage.hasOwnProperty(i) ) {
            regex = new RegExp('^' + setuptools.config.keyPrefix + 'muledump-backup-([0-9]*)$');
            if ( matches = i.match(regex) ) backups.push([i, matches[1]]);
        }
    }

    //  now sort them by date in descending order
    backups.sort(function(a, b) {
        return a[1] + b[1];
    });

    //  if backup length exceeds the maximum then let's clean up
    if ( backups.length > setuptools.data.config.maximumBackupCount ) {
        window.techlog("SetupTools/Backups Cleaning up " + (backups.length-setuptools.data.config.maximumBackupCount) + " backups", 'force');
        for ( i = setuptools.data.config.maximumBackupCount; i < backups.length; i++ ) {
            window.techlog("SetupTools/Backups Deleting " + backups[i][0], 'force');
            setuptools.storage.delete(backups[i][0]);
        }
    }

};

//  restore account configuration
setuptools.app.config.restore = function() {

};

//  create account configuration backup
setuptools.app.config.backup = function() {

    date = new Date();
    BackupID = "muledump-backup-" + Date.now();
    BackupName = "muledump-backup-" +
        date.getFullYear() +
        ('0' + date.getMonth()).slice(-2) +
        ('0' + date.getDate()).slice(-2) + '-' +
        ('0' + date.getHours()).slice(-2) +
        ('0' + date.getMinutes()).slice(-2) +
        ('0' + date.getSeconds()).slice(-2);

    //  build our backup data object with meta data, setuptool.data, and muledump options
    BackupData = JSON.stringify($.extend(true, {},
        {meta: {BackupDate: new Date().toISOString()}},
        setuptools.data,
        {options: window.options}
    ));

    setuptools.lightbox.build('download', ' \
        Backup has been created with name ' + BackupName + '. \
        <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
        <br><br><a download="' + BackupName + '.json" href="data:text/json;base64,' + btoa(BackupData) + '" class="setuptools config download">Download Backup</a> \
    ');

    //  write to local storage
    if ( setuptools.storage.write(BackupID, BackupData) === false ) {
        setuptools.lightbox.build('download', '<br><br><span class="setuptools error">Warning</span>: Failed to save backup to browser storage');
    } else setuptools.app.config.cleanup();

    //  display the download box
    setuptools.lightbox.display('download', {'closeOnClick': 'background'});

    //  in case the user fails to read instructions we can get their attention
    var AckCount = Number(0);
    $('.setuptools.config.download').click(function(e) {

        //  if autoDownload is disabled then we should remind the user what they need to do
        if ( setuptools.data.config.preventAutoDownload === true ) {

            //  stop the automatic download
            e.preventDefault();

            //  visual response
            css = false;
            if (AckCount % 1 == 0) css = {'color': setuptools.config.errorColor};
            if (AckCount % 2 == 0) css = {'color': 'red'};
            if (AckCount == Number(0)) css = {'font-weight': 'bold'};
            if (typeof css === 'object') $('.setuptools.config.download.acknowledge').css(css);

            //  this is a bonafide easter egg
            if (AckCount == Number(50)) $('.setuptools.config.download.acknowledge').html('You\'re really having fun with this, aren\'t you?');
            if (AckCount == Number(100)) $('.setuptools.config.download.acknowledge').html('Yeah I thought so. <a href="#" data-featherlight="http://3.bp.blogspot.com/_D_Z-D2tzi14/S8TTPQCPA6I/AAAAAAAACwA/ZHZH-Bi8OmI/s400/ALOT2.png">I care about this Alot more</a>.');
            AckCount++;

        }

    });

};

//  first time setup walk-through
setuptools.app.initsetup.index = function() {

    window.techlog('SetupTools First Time Setup running', 'force');
    setuptools.lightbox.build('initsetup-index', '<span>Do you have <a href="#" class="setuptools initsetup page2">one or a few accounts</a> or <a href="#" class="setuptools initsetup page3">many accounts</a>?</span>');
    setuptools.lightbox.goback(setuptools.app.index, 'initsetup-index');
    setuptools.lightbox.display('initsetup-index');
    $('.setuptools.initsetup.page2').click(setuptools.app.initsetup.page2);
    $('.setuptools.initsetup.page3').click(setuptools.app.initsetup.page3);

};

//  manual input of account data
setuptools.app.initsetup.page2 = function() {

    var rowId = Number(0);
    function createRow(username, password) {

        rowId = rowId+Number(1);
        if ( !username ) username = '';
        if ( !password ) password = '';
        $('.setuptools.app.initsetup.container').append(' \
            <div class="setuptools app initsetup accounts" id="row-' + rowId + '"> \
                <input name="username" value="' + username + '"> \
                <input name="password" type="password" value="' + password + '"> \
                <div class="add controller" rowId="row-' + rowId + '">+</div> \
                <div class="reveal controller" rowId="row-' + rowId + '" state="reveal">&#9679;</div> \
            </div> \
        ');

        bindAdd();

    }

    function bindRemove() {

        //  unbind first to register new elements
        $('.setuptools.app.initsetup.accounts .remove').unbind('click');
        $('.setuptools.app.initsetup.accounts .remove').click(function() {

            RemoveRowId = $(this).attr('rowId');
            $('#' + RemoveRowId).remove();

        });

    }

    function bindAdd() {

        bindReveal();
        $('.setuptools.app.initsetup.accounts .add').click(function() {

            $(this).removeClass('add').addClass('remove').html('-');
            $(this).unbind('click');
            createRow();
            bindRemove();
            bindReveal();

        })

    }

    function bindReveal() {

        $('.setuptools.app.initsetup.accounts .reveal').unbind('click');
        $('.setuptools.app.initsetup.accounts .reveal').click(function() {
            state = $(this).attr('state');
            rowId = $(this).attr('rowId');
            if ( state === 'reveal' ) {
                input = $('#' + rowId + ' input:nth-child(2)');
                newinput = $('<input name="password">').val(input.val()).insertBefore(input);
                input.remove();
                $(this).attr('state', 'hide');
            } else {
                input = $('#' + rowId + ' input:nth-child(2)');
                newinput = $('<input name="password" type="password">').val(input.val()).insertBefore(input);
                input.remove();
                $(this).attr('state', 'reveal');
            }
        });

    }

    setuptools.lightbox.build('initsetup-page2', ' \
        Enter your account information in the lines below. Click the + to add more accounts.<br><br>\
        <div class="setuptools app initsetup container"> \
            <div class="setuptools app initsetup accounts"> \
                <div style="font-weight: bold">Account Email or ID</div> \
                <div style="font-weight: bold">Account Password</div> \
            </div> \
    ');

    setuptools.lightbox.build('initsetup-page2', '</div>');
    setuptools.lightbox.goback(setuptools.app.initsetup.index, 'initsetup-page2');
    setuptools.lightbox.display('initsetup-page2');

    createRow();

};

//  pasting a list that is well-formatted
setuptools.app.initsetup.page3 = function() {

    setuptools.lightbox.build('initsetup-page2', 'Sounds good! Let\'s gather some information.');

};

//
//  root tools
//

//  initialize accounts
setuptools.init.main = function(window, callback) {

    setuptools.window = window;

    //  check if we should bypass
    if ( setuptools.storage.test() === false ) {

        //  when we bypass, accounts.js is allowed to populate the accounts var and we won't touch it
        window.techlog('SetupTools - LocalStorage not supported', 'force');
        setuptools.error = true;

    } else {

        //  new users can't load muledump so we'll help them get started
        if ( setuptools.app.checknew() === true ) {

            setuptools.callback = callback;
            setuptools.app.index();

        } else {

            setuptools.loaded = true;
            setuptools.data.accounts = ( window.accounts ) ? window.accounts : {};
            if ( callback ) callback(setuptools.data.accounts);

        }

    }

};

//  load account data
setuptools.init.accounts = function(account=false, callback) {

    if ( setuptools.error === false && setuptools.loaded === true ) {

        if ( accounts !== false && setuptools.data.accounts[account] ) {
            AccountObject = {};
            AccountObject[account] = setuptools.data.accounts[account];
            callback(AccountObject);
        } else callback(setuptools.data.accounts);

    } else {

        //  return the data straight from accounts.js
        if ( account === false ) {
            callback(setuptools.data.accounts);
        } else {
            callback(( setuptools.data.accounts[account] ) ? setuptools.data.accounts[account] : {});
        }

    }

};

//  handle setuptools button click
setuptools.click = function() {

    //  if local storage isn't supported then setup tools is completely bypassed
    if ( setuptools.error === true ) {

        setuptools.lightbox.error('Your browser does not presently support local storage.', 1);

    //  load the app index
    } else setuptools.app.index();

};

(function($, window) {

    //  dom loaded
    $(function() {

        //  jquery bindings
        $('#setuptools').click(setuptools.click);

    });

})($, window);
