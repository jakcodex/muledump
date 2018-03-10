//
//  storage tools
//

//  write to localStorage
setuptools.storage.write = function(key, value, skipPrefix) {

    //  check if storage encryption is enabled
    if ( setuptools.state.encryption.storage === true && setuptools.config.noEncryptKeys.indexOf(key) === -1 ) {

        key = setuptools.config.keyPrefix + ':encrypted:' + setuptools.seasalt.hash.sha512(key);
        skipPrefix = true;

    }

    var data = value;
    if ( Array.isArray(data) === true || typeof data === 'object' ) data = JSON.stringify(data, true, 5);

    //  encrypt the data
    if ( setuptools.state.encryption.storage === true && setuptools.config.noEncryptKeys.indexOf(key) === -1 ) {

        data = setuptools.seasalt.encrypt(
            data,
            setuptools.app.mulecrypt.getSecret(),
            setuptools.data.secretbox
        );

        //  error!
        if ( data === undefined ) return false;

    }

    key = ( skipPrefix === true ) ? key : setuptools.config.keyPrefix + key;
    try {
        localStorage[key] = data;
    } catch(e) {
        return false;
    }

    return true;

};

//  read from localStorage
setuptools.storage.read = function(key, skipPrefix) {

    //  check if storage encryption is enabled
    if ( setuptools.state.encryption.storage === true && setuptools.config.noEncryptKeys.indexOf(key) === -1 ) {

        key = setuptools.config.keyPrefix + ':encrypted:' + setuptools.seasalt.hash.sha512(key);
        skipPrefix = true;

    }

    key = ( skipPrefix === true ) ? key : setuptools.config.keyPrefix + key;
    var result = '';
    try {
        result = localStorage[key];
    } catch (e) {}

    //  decrypt data
    if ( setuptools.state.encryption.storage === true && setuptools.config.noEncryptKeys.indexOf(key) === -1 ) {

        result = setuptools.seasalt.decrypt(
            result,
            setuptools.app.mulecrypt.getSecret(),
            setuptools.data.secretbox
        );

    }

    return result;

};

//  delete from localStorage
setuptools.storage.delete = function(key, skipPrefix) {

    //  check if storage encryption is enabled
    if ( setuptools.state.encryption.storage === true && setuptools.config.noEncryptKeys.indexOf(key) === -1 ) {

        key = setuptools.config.keyPrefix + ':encrypted:' + setuptools.seasalt.hash.sha512(key);
        skipPrefix = true;

    }

    key = ( skipPrefix === true ) ? key : setuptools.config.keyPrefix + key;
    try {
        localStorage.removeItem(setuptools.config.keyPrefix + key);
    } catch (e) { return false; }
    return true;

};

//  check if localStorage is available
setuptools.storage.test = function() {

    if ( setuptools.config.devForcePoint === 'storage-test' ) return false;
    setuptools.storage.write('test', 'test');
    return ( setuptools.storage.read('test') === 'test' );

};

/*
setuptools.forage = {
    bucket: {}
};

//  build forage options
setuptools.forage.options = function(options, defaultOptions) {

    if ( typeof defaultOptions !== 'object' ) defaultOptions = {};
    if ( typeof options !== 'object' ) options = {};
    return $.extend(true, {
        bucket: undefined,
        skipPrefix: false
    }, defaultOptions, options);

};

//  initialize a bucket
setuptools.forage.init = function(options) {

    options = setuptools.forage.options(options);
    if ( typeof options.bucket !== 'string' ) setuptools.lightbox.error('Forage requires a bucket name', 0);
    if ( options.skipPrefix !== true) options.bucket = setuptools.config.keyPrefix + options.bucket;
    if ( typeof setuptools.forage.bucket[options.bucket] === 'undefined' ) setuptools.forage.bucket[options.bucket] = localForage.createInstance({
        name: options.bucket
    });
    return setuptools.forage.bucket[options.bucket];

};

//  read data from a bucket
setuptools.forage.read = function(bucket, key, callback, options) {

    options = setuptools.forage.options(options, {
        key: undefined,
        callback: undefined
    });
    bucket = setuptools.forage.init(options);
    bucket.getItem(key, callback);

};
*/
