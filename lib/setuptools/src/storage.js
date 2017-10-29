//
//  storage tools
//

//  write to localStorage
setuptools.storage.write = function(key, value, skipPrefix) {

    try {
        key = ( skipPrefix === true ) ? key : setuptools.config.keyPrefix + key;
        localStorage[key] = value;
    } catch(e) {
        return false;
    }

    return true;

};

//  read from localStorage
setuptools.storage.read = function(key, skipPrefix) {

    result = '';
    try {
        key = ( skipPrefix === true ) ? key : setuptools.config.keyPrefix + key;
        result = localStorage[key];
    } catch (e) {}
    return result;

};

//  delete from localStorage
setuptools.storage.delete = function(key) {

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
