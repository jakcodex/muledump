//  muledump setup tools - ui-based accounts.js management

//  setuptools object
var setuptools = {error: false, config: {}, init: {}, storage: {}, app: {initsetup: {}}, lightbox: {builds: {}}};

//  setuptools configuration
setuptools.config.keyPrefix = 'muledump:setuptools:';
setuptools.config.devForcePoint = 'newuser';

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

        if ( !config ) config = {variant: 'setuptools'};
        if ( typeof config === 'string' ) config = {variant: config};
        if ( typeof config !== 'object' ) {

            setuptools.lightbox.error('Supplied Featherlight config is invalid', 2);
            return;

        } else {
            if ( !config.variant ) config.variant = 'setuptools';
            if ( !config.openSpeed ) config.openSpeed = 0;
        }

        $.featherlight(' \
            <p> \
            <h1>Setup Tools</h1> \
            ' + data + ' \
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
setuptools.lightbox.display = function(id, config) {

    //  check if the build exists
    if ( !setuptools.lightbox.builds[id] ) {

        setuptools.lightbox.error('Build ID ' + id + ' does not exist.', 3);

        //  create the lightbox from the build data
    } else {

        //  create the lightbox and delete the temporary build data
        setuptools.lightbox.create(setuptools.lightbox.builds[id].join(' '), config);
        setuptools.lightbox.builds[id] = [];

    }

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
setuptools.app.index = function() {

    setuptools.lightbox.build('main', 'Welcome to Muledump Account Setup Tools!');

    //  look for a fresh configuration
    if (
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
    ) {

        setuptools.lightbox.build('main', '<br><br><span>It looks like you are new here. Click <a href="#" class="setuptools initsetup index">here</a> to get started.</span>')

    }

    setuptools.lightbox.display('main', {closeOnClick: 'anywhere'});
    $('.setuptools.initsetup.index').click(setuptools.app.initsetup.page1);

};

//  first time setup walk-through
setuptools.app.initsetup.page1 = function() {

    window.techlog('SetupTools First Time Setup running', 'force');
    setuptools.lightbox.create('<span>Do you have <a href="#" class="setuptools initsetup page2">one account</a> or <a href="#" class="setuptools initsetup page3">multiple accounts</a></span>', {closeOnClick: 'anywhere'});
    $('.setuptools.initsetup.page2').click(setuptools.app.initsetup.page2);
    $('.setuptools.initsetup.page3').click(setuptools.app.initsetup.page3);

};

setuptools.app.initsetup.page2 = function() {

    setuptools.lightbox.create('Okay. This will be real quick then.');

};

setuptools.app.initsetup.page3 = function() {

    setuptools.lightbox.create('Sounds good! Let\'s gather some information.');

};

//
//  root tools
//

//  initialize accounts
setuptools.init.main = function(window) {

    setuptools.window = window;

    //  check if we should bypass
    if ( setuptools.storage.test() === false ) {

        //  when we bypass, accounts.js is allowed to populate the accounts var and we won't touch it
        window.techlog('SetupTools - LocalStorage not supported', 'force');
        setuptools.error = true;

    }

};

//  load account data
setuptools.init.accounts = function(account=false) {

    if ( setuptools.error === false ) {

        return window.accounts;

    } else {

        //  return the data straight from accounts.js
        if ( account === false ) {
            return window.accounts;
        } else {
            return ( window.accounts[account] ) ? window.accounts[account] : {};
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
