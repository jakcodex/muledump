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
