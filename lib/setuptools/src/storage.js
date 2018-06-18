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
        localStorage.removeItem(key);
    } catch (e) { return false; }
    return true;

};

//  check if localStorage is available
setuptools.storage.test = function() {

    if ( setuptools.config.devForcePoint === 'storage-test' ) return false;
    setuptools.storage.write('test', 'test');
    return ( setuptools.storage.read('test') === 'test' );

};

/**
 * @function
 * @param {*} [options]
 * Reports localStorage usage statistics in pretty or JSON format
 */
setuptools.storage.report = function(options){

    var verbose;
    var artificial = 0;
    if ( typeof options === 'boolean' ) verbose = options;
    if ( typeof options === 'number' ) artificial = options;
    var maximum = 10240;
    var warn = {};
    var used = 0;
    var keys = {};
    if ( typeof artificial === 'number' && artificial > 0 ) {
        keys.artificial = artificial;
        used += artificial;
    }
    if ( verbose === true ) console.log('---------------------------------------------\nLocal Storage Items\n---------------------------------------------\n');
    for( var key in window.localStorage ){

        if(window.localStorage.hasOwnProperty(key)){
            keys[key] = Number(((window.localStorage[key].length * 2)/1024).toFixed(2));
            used += keys[key];
            if ( verbose === true ) console.log(key + ':', keys[key] + ' KB');
        }

    }

    used = Number(used.toFixed(2));
    var remaining = Number((maximum - used).toFixed(2));

    var data = {
        'muledump-accountDataCache': 0,
        'setuptools-config': 0,
        'setuptools-all': 0,
        'setuptools-backups': 0,
        'setuptools-mulequeue': 0,
        'setuptools-cache': 0,
        'all': 0
    };

    for ( var key2 in keys ) {
        if ( keys.hasOwnProperty(key2) ) {

            if (
                key2.match(/^muledump:(.*?@.*|(?:steamworks|kongregate|kabam):.+)$/i) !== null &&
                key2.indexOf('muledump:setuptools') === -1
            ) data['muledump-accountDataCache'] += keys[key2];
            if ( key2.match(/^muledump:setuptools:(?:preview:)?.+$/i) !== null ) data['setuptools-all'] += keys[key2];
            if ( key2.match(/^muledump:setuptools:(?:preview:)?configuration$/i) !== null ) data['setuptools-config'] += keys[key2];
            if ( key2.match(/^muledump:setuptools:(?:preview:)?muledump-backup-.+$/i) !== null ) data['setuptools-backups'] += keys[key2];
            if ( key2.match(/^muledump:setuptools:(?:preview:)?mulequeue:.+$/i) !== null ) data['setuptools-mulequeue'] += keys[key2];
            if ( key2.match(/^muledump:setuptools:(?:preview:)?cache:.+$/i) !== null ) data['setuptools-cache'] += keys[key2];
            data.all += keys[key2];

        }
    }

    for ( var key3 in data )
        if ( data.hasOwnProperty(key3) )
            data[key3] = Number(data[key3].toFixed(2));

    data.other = Number((data.all-data['setuptools-all']-data['muledump-accountDataCache']).toFixed(2));

    data.free = Number(((1-(data.all/maximum))*100).toFixed(2));
    if ( data.all >= (maximum*0.8) ) warn.storageSpace = 'Local Storage is low on free space (' + data.free + '% free)';
    if ( data.all >= (maximum*0.93) ) warn.storageSpace = 'Local Storage is very low on free space (' + data.free + '% free)';
    if ( data.all >= (maximum*0.95) ) warn.storageSpace = 'Local Storage is full (' + data.free + '% free)';

    var percentFree = data.free;
    delete data.free;

    if ( verbose === true ) {

        console.log('\
---------------------------------------------\n\
Local Storage Usage Summary\n\
---------------------------------------------\n\
Muledump Account Data:         ' + data['muledump-accountDataCache'] + ' KB\n\
SetupTools Configuration:      ' + data['setuptools-config'] + ' KB\n\
SetupTools Backups:            ' + data['setuptools-backups'] + ' KB\n\
SetupTools MuleQueue:          ' + data['setuptools-mulequeue'] + ' KB\n\
SetupTools Cache:              ' + data['setuptools-cache'] + ' KB\n\
SetupTools Total Data Usage:   ' + data['setuptools-all'] + ' KB\n\
Other Usage:                   ' + data.other + ' KB\n\
---------------------------------------------\n\
Local Storage Space Used:      ' + data.all + ' KB\n\
Local Storage Space Free:      ' + remaining + ' KB\n\
---------------------------------------------\n\
' + ( ( warn.storageSpace ) ? 'Warning: ' + warn.storageSpace + '\n---------------------------------------------\n' : '' ) + ' \
        ');

        return undefined;
    }

    return {used: used, remaining: remaining, percentFree: percentFree, keys: keys, summary: data, warning: ( typeof warn.storageSpace === 'string' ), warningText: warn.storageSpace};

};
