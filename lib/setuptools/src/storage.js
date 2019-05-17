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
    /*if ( setuptools.state.encryption.storage === true && setuptools.config.noEncryptKeys.indexOf(key) === -1 ) {

        data = setuptools.seasalt.encrypt(
            data,
            setuptools.app.mulecrypt.getSecret(),
            setuptools.data.secretbox
        );

        //  error!
        if ( data === undefined ) return false;

    }*/

    key = ( skipPrefix === true ) ? key : setuptools.config.keyPrefix + key;
    try {
        localStorage.setItem(key, setuptools.storage.compression.deflate(data));
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
        result = setuptools.storage.compression.inflate(localStorage.getItem(key));
    } catch (e) {}

    //  decrypt data
    /*if ( setuptools.state.encryption.storage === true && setuptools.config.noEncryptKeys.indexOf(key) === -1 ) {

        result = setuptools.seasalt.decrypt(
            result,
            setuptools.app.mulecrypt.getSecret(),
            setuptools.data.secretbox
        );

    }*/

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
    var dcused = 0;
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
            var decompressed = setuptools.storage.compression.inflate(window.localStorage[key]);
            var dcsize = Number(((decompressed.length * 2)/1024).toFixed(2));
            var dcp = ((1-(keys[key]/dcsize))*100).toFixed(2);
            if ( typeof decompressed === 'string' ) dcused += dcsize;
            if ( verbose === true ) console.log(key + ':', keys[key] + ' KB (' + dcsize + ' KB / ' + dcp + '%)');
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
            ) data['muledump-accountDataCache'] += Number(keys[key2].toFixed(2));
            if ( key2.match(/^muledump:setuptools:(?:preview:)?.+$/i) !== null ) data['setuptools-all'] += Number(keys[key2].toFixed(2));
            if ( key2.match(/^muledump:setuptools:(?:preview:)?configuration$/i) !== null ) data['setuptools-config'] += Number(keys[key2].toFixed(2));
            if ( key2.match(/^muledump:setuptools:(?:preview:)?muledump-backup-.+$/i) !== null ) data['setuptools-backups'] += Number(keys[key2].toFixed(2));
            if ( key2.match(/^muledump:setuptools:(?:preview:)?mulequeue:.+$/i) !== null ) data['setuptools-mulequeue'] += Number(keys[key2].toFixed(2));
            if ( key2.match(/^muledump:setuptools:(?:preview:)?cache:.+$/i) !== null ) data['setuptools-cache'] += Number(keys[key2].toFixed(2));
            data.all += Number(keys[key2].toFixed(2));

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

    data.dcused = dcused;
    data.ratio = Number(((1-(used/dcused))*100).toFixed(2));

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
Compression Rate:              ' + data.ratio + '% \n\
---------------------------------------------\n\
' + ( ( warn.storageSpace ) ? 'Warning: ' + warn.storageSpace + '\n---------------------------------------------\n' : '' ) + ' \
        ');

        return undefined;
    }

    return {used: used, remaining: remaining, percentFree: percentFree, ratio: data.ratio, keys: keys, summary: data, warning: ( typeof warn.storageSpace === 'string' ), warningText: warn.storageSpace};

};

/*/
///  SetupTools Mulecrypt
/*/

/**
 * @function
 * @param {boolean} f
 * Perform a crypto test
 */
setuptools.storage.crypto.test = function() {

    if (
        setuptools.config.encryption === false ||
        setuptools.state.encryption.sodium !== true ||
        typeof setuptools.app.mulecrypt.config.keychain !== 'object'
    ) {
        setuptools.storage.crypto.selfTest = false;
        return;
    }

    var string = (new Date).toISOString();
    var encrypted = setuptools.storage.crypto.encrypt(string, 'testing');
    var decrypted = setuptools.storage.crypto.decrypt(encrypted, 'testing');
    setuptools.storage.crypto.selfTest = ( string === decrypted );
    return setuptools.storage.crypto.selfTest;

};

/**
 * @function
 * @param string
 * @param key
 */
setuptools.storage.crypto.encrypt = function(string, key) {

    if ( setuptools.storage.crypto.selfTest !== true ) return string;
    if ( typeof key === 'undefined' ) key = setuptools.app.mulecrypt.config.keychain.active;
    if ( typeof key !== 'string' ) return string;
    return setuptools.app.mulecrypt.encrypt

};

/**
 * @function
 * @param string
 * @param key
 */
setuptools.storage.crypto.decrypt = function(string, key) {

    if ( setuptools.storage.crypto.selfTest !== true ) return string;

};

/*/
///  SetupTools Compression
/*/

/**
 * @var
 * current state of compression selfTest
 */
setuptools.storage.compression.selfTest = undefined;

/**
 * @var
 * base object for compression plugins
 */
setuptools.storage.compression.formats = $.extend(true, {}, setuptools.config.compressionLibraries);

/**
 * @function
 * @returns {boolean}
 * provide a simple read/write test function
 */
setuptools.storage.compression.test = function(f) {

    //  sanity check the compression format
    var format = Object.keys(setuptools.storage.compression.formats)[f || setuptools.config.compressionFormat];
    if ( typeof setuptools.storage.compression.formats[format] !== 'object' ) {
        setuptools.storage.compression.selfTest = false;
        return false;
    }

    setuptools.app.techlog('Storage/Compression - selfTest is running with format: ' + format);

    //  prepare our text string and make sure it is long
    var string = JSON.stringify(setuptools.copy.options || window.options);
    string = string + string + string + string + string + string;

    //  perform the test
    try {
        var deflated = setuptools.storage.compression.formats[format].deflate(string, null, true);
        var inflated = setuptools.storage.compression.formats[format].inflate(deflated, null, true);
    } catch(e) {
        setuptools.app.techlog('Storage/Compression - selfTest encountered an error: ' + e);
        setuptools.storage.compression.selfTest = false;
        return false;
    }
    setuptools.storage.compression.selfTest = ( string === inflated );
    if ( setuptools.storage.compression.selfTest === false ) {
        setuptools.app.techlog('Storage/Compression - selfTest returned false');
    } else {
        setuptools.app.techlog('Storage/Compression - selfTest returned true: ' + ((1-(deflated.length/string.length))*100).toFixed(2) + '%');
    }
    return setuptools.storage.compression.selfTest;

};

/**
 * @function
 * @param {string} input
 * @param {null} [confirm]
 * @param {boolean} [force]
 * @returns {string}
 * compress an input; passthru on error
 */
setuptools.storage.compression.deflate = function(input, confirm, force) {

    if ( setuptools.data.config.compression === false ) return input;

    //  must be a string
    if ( typeof input !== 'string' ) return input;

    //  these checks may be skipped
    if ( !(confirm === null && force === true) ) {

        if ( force === true ) setuptools.app.techlog('Storage/Compression - this is not the way to bypass selfTest');
        if ( setuptools.storage.compression.selfTest === undefined ) setuptools.storage.compression.test();
        if ( setuptools.storage.compression.selfTest === false ) return input;

        //  string must be a minimum size
        if ( input.length < setuptools.config.compressionMinimum ) {
            return input;
        }

    }

    //  sanity check the compression format
    var format = Object.keys(setuptools.storage.compression.formats)[setuptools.config.compressionFormat];
    if ( typeof setuptools.storage.compression.formats[format] !== 'object' ) {
        return input;
    }

    //  attempt to compress input
    try {
        var compressed = setuptools.storage.compression.formats[format].deflate(input);
    } catch(e) {
        setuptools.app.techlog('Storage/Compression - failed to compress input: ' + e);
        return input;
    }
    return 'mc:' + setuptools.config.compressionFormat + ':' + compressed;

};

/**
 * @function
 * @param {string} deflated
 * @returns {string}
 * decompress an input; passthru on error (empty result on garbage data detection)
 */
setuptools.storage.compression.inflate = function(deflated) {

    //  must be a string
    if ( typeof deflated !== 'string' ) return deflated;

    //  must match a proper format
    var meta = deflated.match(/^mc:(\d*):(?:.*)$/);
    if ( meta === null ) return deflated;

    //  sanity check the compression format
    var format = Object.keys(setuptools.storage.compression.formats)[+meta[1]];
    if ( typeof setuptools.storage.compression.formats[format] !== 'object' ) {

        setuptools.app.techlog('Storage/Compression - supplied input format is not supported: ' + (+meta[1]));

        //  this error is not passthru because the input text is garbage
        return undefined;

    }

    //  we'll skip selfTest here because if the string is deflated and compression is off they need a path back to decompression

    //  attempt to decompress input
    try {
        var decompressed = setuptools.storage.compression.formats[format].inflate(deflated.substr(5));
    } catch (e) {
        setuptools.app.techlog('Storage/Compression - failed to decompress input: ' + e);
        return undefined;
    }
    return decompressed;

};

/**
 * @function
 * @param {string} input
 * @returns {*}
 * Determine the compression state of a supplied input
 */
setuptools.storage.compression.isCompressed = function(input) {

    //  it must be a string
    if ( typeof input !== 'string' ) return false;

    //  it must match a format
    var meta = input.match(/^mc:(\d*):(?:.*)$/);
    if ( meta === null ) return false;

    //  format must be recognized
    var format = Object.keys(setuptools.storage.compression.formats)[+meta[1]];
    if ( typeof setuptools.storage.compression.formats[format] !== 'object' ) return undefined;

    //  validated
    return true;

};

/**
 * @function
 * @returns {Array}
 * Analyzes files in localStorage checking if they are in sync with current storage configuration
 */
setuptools.storage.compression.analyze = function() {

    var outOfSync = [];
    for ( var key in localStorage )
        if ( localStorage.hasOwnProperty(key) )
            if ((
                setuptools.data.config.compression === false &&
                setuptools.storage.compression.isCompressed(localStorage.getItem(key)) === true
            ) || (
                setuptools.data.config.compression === true &&
                setuptools.storage.compression.isCompressed(localStorage.getItem(key)) !== true &&
                localStorage.getItem(key).length >= setuptools.config.compressionMinimum
            )) outOfSync.push(key);
    return outOfSync;

};

/**
 * @function
 * @param {string} input
 * @returns {string}
 * Decompress a string using SnappyJS
 */
setuptools.storage.compression.formats.snappy.inflate = function(input) {

    var compressed = sodium.from_base64(input);
    var decompressed = SnappyJS.uncompress(compressed);
    return sodium.to_string(sodium.from_base64(sodium.to_string(decompressed)));


};

/**
 * @function
 * @param {string} input
 * @returns {string}
 * Compress a string using SnappyJS
 */
setuptools.storage.compression.formats.snappy.deflate = function(input) {

    var buffer = sodium.from_string((sodium.to_base64(input)));
    var compressed = SnappyJS.compress(buffer);
    return sodium.to_base64(compressed);

};
