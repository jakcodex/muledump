/*/ mulecrypt concepts

    //  mulecrypt gotcha's
    -

    //  mulecrypt entry points
    new user setup
    - New users are traditionally given three setup options (new user, restore backup, import accounts.js)
    - Fourth option is added for New Encrypted Installation
    - User is directed to mulecrypt setup with a callback to new user setup with only the three original options
    - User continues on a normal setup path of their choice with the results being fully encrypted

    existing user setup
    - User is directed to setuptools.app.mulecrypt.ui.setup() with a callback sending them to mulecrypt migration service
    - No reload should be necessary

    existing user startup
    - User is directed to setuptools.app.mulecrypt.ui.startup() with a callback sending them to muledump main init

    existing user decrypt
    - User is directed to mulecrypt migration service
    - No reload should be necessary

    backup encryption
    - When encrypted is enabled and loaded, all backups will be encrypted with that keychain in local storage
    - User can download encrypted or decrypted backups

    encrypted backup restoration
    - If keychain is loaded, attempt to use it to decrypt the backup
    - If keychain is not loaded, send user to setuptools.app.mulecrypt.ui.setup() with a callback to backup decryption
    - Allow user to pick if encryption will be used or not with restoration
    - Restore decrypted backup file

    //  mulecrypt setup service
    setuptools.app.mulecrypt.ui.setup(callback)

        - Takes input from the user to generate a new keychain.
        - Loads keychain into storage API (all storage io is now encrypted)
        - Redirects user to callback

    //   mulecrypt startup service
    setuptools.app.mulecrypt.ui.startup(callback)

        - Takes input from the user and attempts to locate a matching keychain
        - User can optionally provide a secret box or restore a backup
        - Loads keychain into storage API (all storage io is now encrypted)
        - Mulecrypt installation whose keys match the keychain are now accessible
        - User is directed to Muledump main init

        Cannot provide password
        - If a user cannot remember their password, they can choose to destroy the encrypted installation

    //  mulecrypt migration service
    setuptools.app.mulecrypt.ui.migrate(encrypt, callback)

        - Will either encrypt or decrypt all data with the loaded keychain
        - Must validate current state before migration
        - Should keep a log of all migration tasks in case it needs to resume
        - any user with multiple encrypted muledump installations cannot decrypt one installation without destroying the others

        encryption
        - existing decrypted muledump installation is verified
        - keychain is verified
        - all non-encrypted muledump storage keys are read, stored as encrypted, and queued for deletion
        - once encryption task finishes and is verified the original keys are deleted

        decryption
        - existing encrypted muledump installation is verified
        - all encrypted muledump storage keys are checked against the keychain
        - all valid encrypted muledump storage keys are read and stored as decrypted
        - all remaining encrypted keys are deleted
        - keychain is destroyed


/*/

//  initialize encryption
setuptools.app.mulecrypt = {
    config: {
        keychain: undefined,
        hashedPassword: undefined
    },
    ui: {}
};

setuptools.app.mulecrypt.init = function(callback) {

    if ( typeof callback !== 'function' ) setuptools.lightbox.error(0, 'Encryption init callback must be a function');
    window.sodium = {

        //  libsodium loads async
        onload: function () {

            setuptools.runtimeId = (new SeaSalt_Tools()).randomString({
                length: 16,
                pools: {
                    symbols: '#-'
                },
                min: {
                    symbols: 2
                },
                max: {
                    symbols: 3
                }
            });

            //  create our generic seasalt object
            setuptools.seasalt = new SeaSalt({
                minimumEntropy: setuptools.config.mcMinimumEntropy,
                minimumKeyLength: setuptools.config.mcMinimumKeyLength,
                minimumStrength: setuptools.config.mcMinimumKeyStrength,
                logger: function(message, level) {
                    setuptools.app.techlog(message, level);
                }
            });

            //  test libsodium and seasalt
            var secret = setuptools.seasalt.hash.sha512(Date.now().toString());
            var secretbox = new SeaSalt_AEAD_SecretBox(secret, setuptools.seasalt.aead.xchacha.key('aead'), {
                logger: setuptools.app.techlog
            });
            var ciphertext = setuptools.seasalt.encrypt('test', secret, secretbox);
            var decrypted = setuptools.seasalt.decrypt(ciphertext, secret, secretbox);

            //  test libsodium support
            if ( decrypted === 'test' ) {
                setuptools.app.techlog('Crypto/Init - libsodium test success');
                setuptools.state.encryption.sodium = true;
            } else setuptools.app.techlog('Crypto/Init - libsodium test failure', 'force');

            //  test for an encrypted installation
            var keychain = setuptools.storage.read('mulecrypt:keychain');
            try {
                setuptools.app.mulecrypt.config.keychain = JSON.parse(keychain);
            } catch (e) {}

            //  an object here means encryption is detected
            if (
                setuptools.config.encryption === true &&
                typeof setuptools.app.mulecrypt.config.keychain === 'object' &&
                setuptools.app.mulecrypt.config.keychain !== null
            ) {

                //  prompt the user for their password
                sodium.memzero(keychain);
                setuptools.app.mulecrypt.ui.startupPrompt(function(callback) {

                    /*

                        var keychain = {
                            meta: {
                                created: Date,
                                modified: Date,
                                version: Number
                            },
                            secretbox: SeaSalt_AEAD_SecretBox,
                            recovery: [oldboxcopies],
                            history: [boxcopies]
                        }

                        - recovery boxes are boxes from before a password reset held for a set amount of time before getting deleted
                        - history boxes are boxes from the current password as the primary box repackages
                        - user password is checked against secretbox, then history.length->0, then recovery.length->0 until a match is found

                    */

                    var keychain = setuptools.app.mulecrypt.config.keychain;

                    //  record the current secretbox to history
                    keychain.history.push(keychain.secretbox);

                    //  repackage a new secret box
                    keychain.secretbox = setuptools.seasalt.secretbox.repackage(keychain.secretbox, userPassword, userPassword);

                    callback();

                }, callback);
            }
            //  no encryption; run the callback to load muledump
            else
                callback();  //  honestly, it's formatted this way to see if Batman is paying attention (turns out he's not)

        }

    }

};

//  find a known secretbox matching the supplied password
setuptools.app.mulecrypt.getSecretBox = function(userPassword) {

    var keychain = setuptools.app.mulecrypt.config.keychain;
    if ( typeof keychain === 'undefined' ) return false;

    setuptools.app.mulecrypt.config.userPassword = setuptools.seasalt.hash.sha256(userPassword);

    //  build a list of boxes to check
    var boxes = [].concat(
        ((typeof keychain === 'object' ) ? keychain.secretbox : []),
        keychain.history,
        keychain.recovery
    );

    //  look for a valid secretbox
    for ( var i = 0; i < boxes.length; i++ ) {

        if ( setuptools.seasalt.secretbox.check(boxes[i], setuptools.app.mulecrypt.config.userPassword) ) {

            setuptools.secretbox = setuptools.seasalt.secretbox.repackage(boxes[i], setuptools.app.mulecrypt.config.userPassword, setuptools.app.mulecrypt.config.userPassword);
            if ( typeof setuptools.secretbox === 'string' ) break;

        }

    }

};

//  initialize system encryption
setuptools.app.mulecrypt.system = function(callback) {

    if ( typeof callback !== 'function' ) setuptools.lightbox.error(0, 'Encryption init callback must be a function');

    if (setuptools.state.loaded === true) {

        if ( setuptools.config.encryption === true && setuptools.data.config.encryption === true ) {

            setuptools.app.mulecrypt.ui.init(callback);

        } else callback();

    } else callback();

};

//  display a mulecrypt usage error
setuptools.app.mulecrypt.error = function(message, title, variant) {

    if ( !message ) return;
    if ( !title ) title = 'MuleCrypt Error';
    if ( typeof variant === 'string' ) variant = {variant: variant};
    if ( typeof variant !== 'object' ) variant = undefined;
    setuptools.lightbox.build('mulecrypt-error', message);
    setuptools.lightbox.settitle('mulecrypt-error', title);
    setuptools.lightbox.goback('mulecrypt-error', setuptools.app.mulecrypt.ui.index);
    setuptools.lightbox.display('mulecrypt-error', variant);

};

setuptools.app.mulecrypt.passwordStrength = function(password) {

    //  check password strength
    var strength = 0;
    var cat = 0;
    var matches = {};

    //  lowercase alpha chars
    if ( matches.alpha = password.match(/[a-z]/g) ) strength++;

    //  uppercase alpha chars
    if ( matches.caps = password.match(/[A-Z]/g) ) strength++;

    //  numeric chars
    if ( matches.numeric = password.match(/[0-9]/g) ) strength++;

    //  symbol chars
    if ( matches.symbol = password.match(/[-!$%^&*()_+|~=`{}\[\]:#";'@<>?,.\/]/g) ) strength++;

    //  calculate entropy
    cat = strength;
    var chars = [];
    for ( var i in matches )
        if ( matches.hasOwnProperty(i) )
            if ( typeof matches[i] === 'object' && matches[i] !== null && matches[i].length )
                for ( var x = 0; x < matches[i].length; x++ )
                    if ( chars.indexOf(matches[i][x].toLowerCase()) === -1 ) chars.push(matches[i][x].toLowerCase());

    //  adjust strength calculation

    //  supplied chars meeting minimum entropy are given a bonus
    if ( chars.length >= setuptools.config.mcMinimumEntropy ) strength = strength++;

    //  supplied chars below minimum entropy are heavily penalized
    if ( chars.length < setuptools.config.mcMinimumEntropy ) strength = strength-3;

    //  weak strength but extremely long is given a bonus
    if ( strength === 1 && password.length >= (setuptools.config.mcMinimumKeyLength*2) ) strength++;

    //  short passwords are penalized
    if ( password.length < (setuptools.config.mcMinimumKeyLength+4) ) strength--;

    //  only one type of charset is penalized
    if ( cat === 1 ) strength--;

    //  passwords shorter than the minimum length are invalid
    if ( password.length < setuptools.config.mcMinimumKeyLength ) strength = 0;

    //  return strength out of a maximum of 4
    if ( strength < 0 ) strength = 0;
    if ( strength > 4 ) strength = 4;
    return strength;

};

//  return a hash for a password (simple sha512 for now)
setuptools.app.mulecrypt.hashKey = function(password) {

    return setuptools.seasalt.hash.sha256(password);

};

//  check if the supplied password can read the test key
setuptools.app.mulecrypt.check = function(password) {

    //  check if we're in a state where we can test encryption
    if ( setuptools.state.encryption.sodium === false || typeof setuptools.data.accounts.meta.encryptionTestKey !== 'string' ) return;

    //  check if we can decrypt the test key
    return ( setuptools.seasalt.aead.xchacha.decrypt(setuptools.data.accounts.meta.encryptionTestKey, setuptools.app.mulecrypt.hashKey(password) ) === 'test' );

};

//  encrypt or re-encrypt data
setuptools.app.mulecrypt.encrypt = function(newPassword, oldPassword) {

    //  obviously the new password is required
    if ( typeof newPassword !== 'string' ) {

        setuptools.app.mulecrypt.error('You must supply a password to encrypt with.');
        return;

    }

    //  if encryption is already enabled then oldPassword is required
    if ( typeof oldPassword !== 'string' && setuptools.data.config.encryption === true ) {

        setuptools.app.mulecrypt.error('You must supply the original password to re-encrypt data.');
        return;

    }

    //  encryption sanity checks
    if (
        (setuptools.data.config.encryption === false && setuptools.data.accounts.meta.encryption === true) ||
        (setuptools.data.config.encryption === true && setuptools.data.accounts.meta.encryption !== true)
    ) {

        setuptools.app.mulecrypt.error('There is a sanity issue between client configuration and accounts configuration.');
        return;

    }

    //  encryption
    if ( setuptools.data.config.encryption === false ) {



    } else {


    }

};

//  initialize encryption for users with it enabled
setuptools.app.mulecrypt.ui.init = function(callback) {

    if ( typeof callback !== 'function' ) setuptools.lightbox.error(0, 'Encryption init callback must be a function');

};

//  display an error if the user does not support encryption
setuptools.app.mulecrypt.ui.error = function() {

    setuptools.lightbox.build('mulecrypt-error', 'Your browser does not support modern encryption. This feature is disabled.');
    setuptools.lightbox.settitle('mulecrypt-error', 'MuleCrypt Error');
    setuptools.lightbox.display('mulecrypt-error');

};

//  mulecrypt main menu
setuptools.app.mulecrypt.ui.index = function() {

    if ( setuptools.config.encryption === false || setuptools.state.encryption.sodium === false ) {

        setuptools.app.mulecrypt.ui.error();
        return;

    }

    //  if encryption isn't enabled send the user to setup
    if ( setuptools.data.config.encryption === false ) {
        setuptools.lightbox.override('encryption-setup', 'goback', function() {
            setuptools.app.config.settings(undefined, 'system');
        });
        setuptools.app.mulecrypt.ui.setup();
        return;
    }

};

setuptools.app.mulecrypt.ui.startupPrompt = function(callback, errorMessage) {

    if ( setuptools.config.encryption === false ) return;
    var keychain = setuptools.app.mulecrypt.config.keychain;

    //  redirect to mulecrypt setup if no keychain is present
    if ( true === false && typeof keychain === 'undefined' ) {

        setuptools.app.mulecrypt.ui.setup();
        return;

    }

    setuptools.lightbox.build('mulecrypt-startupPrompt', ' \
        Mulecrypt has detected an encrypted Muledump installation. \
        <br><br>Please choose from one of the following options:\
        <br><br><strong>Enter Mulecrypt Password</strong>\
        <br>&nbsp;\
        <div class="flex-container" style="justify-content: space-between;">\
            <div style="flex-grow: 8;" class="mr5"><input name="userPassword" type="password" class="setuptools mulecrypt w100" placeholder="Mulecrypt Password" data-reveal="false"></div> \
            <div style="flex-basis: 24px;" class="menuStyle buttonStyle mulecrypt revealPassword mr5" title="Reveal Password">R</div>\
            <div style="flex-grow: 3; width: auto;" class="setuptools link mulecrypt startupGo menuStyle buttonStyle textCenter mr0">Enter Password</div>\
        </div>\
    ');

    if ( typeof errorMessage === 'string' ) setuptools.lightbox.build('mulecrypt-startupPrompt', ' \
        <div class="w100">\
            <br><strong class="negative">Error</strong>\
            <br>' + errorMessage + '\
        </div>\
    ');

    setuptools.lightbox.build('mulecrypt-startupPrompt', ' \
        <div class="flex-container" style="flex-flow: column;">\
            <div>\
                &nbsp;\
                <br><strong>Reset Muledump</strong>\
                <br>If you cannot access your encrypted installation then you can reset Muledump and either start fresh or restore a backup. \
                <br>&nbsp;\
            </div>\
            <div class="setuptools link mulecrypt startupErase negative menuStyle textCenter mr0" style="width: auto; padding: 5px;">Erase Encryption and Reset Muledump</div>\
        </div>\
    ');
    setuptools.lightbox.settitle('mulecrypt-startupPrompt', 'Mulecrypt Startup');
    setuptools.lightbox.drawhelp('mulecrypt-startupPrompt', 'docs/setuptools/help/mulecrypt/startup', 'Mulecrypt Startup Help');
    setuptools.lightbox.display('mulecrypt-startupPrompt', {variant: 'fl-Introduction'});

    //  clean up installation
    $('div.setuptools.link.mulecrypt.startupErase').click(function() {

        setuptools.lightbox.build('mulecrypt-startupPromp-erase', ' \
            <div class="w100" style="text-align: justify;">This will erase all Mulecrypt keys from your local storage. By default this also erases Muledump.<br>&nbsp;</div>\
            <div class="flex-container" style="justify-content: flex-start;">\
                <div class="setuptools option mulecrypt eraseMulecrypt menuStyle buttonStyle disabled selected" style="width: auto; height: auto; padding: 2px 5px;">&#10004;</div>\
                <div>Erase Mulecrypt</div>\
            </div> \
            <div class="flex-container mt5  " style="justify-content: flex-start;">\
                <div class="setuptools option mulecrypt eraseMuledump menuStyle buttonStyle negative selected" style="width: auto; height: auto; padding: 2px 5px;">&#10004;</div>\
                <div>Reset Muledump</div>\
            </div> \
        ');
        setuptools.lightbox.settitle('mulecrypt-startupPromp-erase', 'Reset Muledump');
        setuptools.lightbox.drawhelp('mulecrypt-startupPromp-erase', 'docs/setuptools/help/mulecrypt/reset', 'Mulecrypt Help');
        setuptools.lightbox.display('mulecrypt-startupPromp-erase', {variant: 'fl-Notice'});

    });

    //  process userPassword
    $('div.setuptools.link.mulecrypt.startupGo').click(function() {

        setuptools.app.mulecrypt.getSecretBox($('input[name="userPassword"]').val());
        if ( typeof setuptools.secretbox === 'undefined' ) {
            setuptools.app.mulecrypt.ui.startupPrompt(callback, 'Password did not match any stored keys.');
        } else callback();

    });

};

//  run a user through encryption setup
setuptools.app.mulecrypt.ui.setup = function() {

    if ( setuptools.config.encryption === false || setuptools.state.encryption.sodium === false ) {

        setuptools.app.mulecrypt.ui.error();
        return;

    }

    setuptools.lightbox.build('encryption-setup', ' \
        ' + (
            ( setuptools.data.config.encryption === false ) ?
                'Enabling encryption is quick and easy.' :
                'You can change your encryption password here.'
        ) + ' \
        <br><br>It is <strong>strongly</strong> recommended you download a backup before continuing!\
        <br>&nbsp;\
        <div class="flex-container w100">\
            <div class="setuptools link downloadBackup noclose menuStyle notice textCenter" style="width: 50%; font-size: 14px;">Download Latest Backup</div>\
        </div>\
        ' + (
            ( setuptools.data.config.encryption === true ) ?
                ' \
                    <div class="flex-container w100" style="justify-content: space-between; margin-top: 15px;">\
                        <div style="width: 200px;">Enter the current password</div>\
                        <div style="width: 400px;">\
                            <input class="setuptools w100" type="text" name="currentPassword" spellcheck="false">\
                        </div>\
                    </div>\
                ' :
                ''
        ) + '\
        <div class="flex-container w100" style="justify-content: space-between; margin-top: 15px;">\
            <div style="width: 200px;">Enter a strong password</div>\
            <div style="width: 400px;">\
                <input class="setuptools w100" type="text" name="newPassword" spellcheck="false">\
            </div>\
        </div>\
        <div class="flex-container w100 mt5" style="justify-content: space-between;">\
            <div style="width: 200px;">Enter it again</div>\
            <div style="width: 400px;">\
                <input class="setuptools w100" type="text" name="confirmPassword" spellcheck="false">\
            </div>\
        </div>\
        <div class="flex-container w100 mt5" style="height: 24px; justify-content: space-between; align-content: center;">\
            <div style="width: 200px;">Enable Weak Passwords</div>\
            <div style="width: 400px;" style="justify-content: flex-start;">\
                <div class="mulecrypt passwordWeak buttonStyle negative">X</div>\
            </div>\
        </div>\
        <div class="flex-container w100 mt5" style="height: 24px; justify-content: space-between; align-content: center;">\
            <div style="width: 200px;">Password Strength</div>\
            <div style="width: 400px;" style="justify-content: flex-start;">\
                <div class="mulecrypt passwordStrength" style="width: 0; background: url(lib/media/mulecrypt-strength.svg);" class="flex-container">&nbsp;</div>\
            </div>\
        </div>\
        <div class="w100 mt10">\
            Jakcodex/Muledump believes in strong passwords. You can read more about this in the <a href="https://github.com/jakcodex/muledump/wiki/Mulecrypt#Password-Requirements" target="_blank">wiki</a>.\
            <br><br>Password requirements:\
            <br>&nbsp;\
        </div> \
        <div class="flex-container w100" style="justify-content: center; flex-flow: column;">\
            <div class="flex-container" style="justify-content: flex-start;">\
                <div style="width: 35%;"><span style="letter-spacing: 1px; color: #00a4ff">Minimum Length</span></div>\
                <div style="width: 65%;">' + setuptools.config.mcMinimumKeyLength + ' chars</div>\
            </div>\
            <div class="flex-container mt5" style="justify-content: flex-start;">\
                <div style="width: 35%;"><span style="letter-spacing: 1px; color: #00a4ff">Minimum Uniqueness</span></div>\
                <div style="width: 65%;">' + setuptools.config.mcMinimumEntropy + ' unique chars</div>\
            </div>\
        </div>\
        <div class="flex-container w100 mt5" style="justify-content: space-between; margin-top: 15px;">\
            <div class="setuptools link generateKey noclose menuStyle textCenter">Create Random Password</div>\
            <div class="setuptools link encrypt noclose menuStyle negative textCenter mr0">Passwords Don\'t Match</div>\
        </div>\
    ');

    setuptools.lightbox.goback('encryption-setup', function() { });
    setuptools.lightbox.settitle('encryption-setup', 'Muledump Encryption');
    setuptools.lightbox.display('encryption-setup', {variant: 'fl-MuleCrypt ' + ( (setuptools.data.config.animations === 1) ? 'fl-MuleCryptAnimated' : '' )});

    //  help the user download a backup
    $('.setuptools.link.downloadBackup').click(function() {
        setuptools.lightbox.override('backups-index', 'goback', function() {
            setuptools.lightbox.close('backups-index');
        });
        setuptools.app.backups.latest(setuptools.app.backups.index);
    });

    //  proceed with account encryption
    $('.setuptools.link.encrypt').click(function() {

        if ( $(this).hasClass('positive') === true ) {

            setuptools.lightbox.override('mulecrypt-error', 'goback', setuptools.app.mulecrypt.ui.setup);
            setuptools.app.mulecrypt.encrypt($('input[name="newPassword"]').val());

        }

    });

    //  generate a random password for the user
    $('.setuptools.link.generateKey').click(function() {

        var pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789[];',./<>?:\"{}\\|!@#$%^&*()-=_+`~";
        var key = '';
        for (var i = 0; i < 48; i++) key += pool.shuffle().charAt(Math.floor(Math.random() * pool.length));
        $('input[name="newPassword"]').val(key);

    });

    //  compare the confirmPassword with the original password
    $('input').keyup(function() {

        var password = $('input[name="newPassword"]').val();
        var confirmPassword = $('input[name="confirmPassword"]').val();

        var strength = setuptools.app.mulecrypt.passwordStrength(password);

        //  update password strength meter
        var passDom = $('div.mulecrypt.passwordStrength');
        if ( strength > 0 ) passDom.animate({width: strength*25 + '%'}, 100);
        if ( strength === 0 ) passDom.css({width: '10px'});
        if ( password.length === 0 ) passDom.css({width: 0});

        //  compare passwords
        if ( strength >= setuptools.config.mcMinimumKeyStrength && confirmPassword.length >= setuptools.config.mcMinimumKeyLength && password === confirmPassword ) {

            $('.setuptools.link.encrypt').removeClass('negative').addClass('positive').text('Encrypt Account Data');

        } else {

            if ( strength < setuptools.config.mcMinimumKeyStrength ) {
                $('.setuptools.link.encrypt').removeClass('positive').addClass('negative').text('Insecure Password');
            } else {
                $('.setuptools.link.encrypt').removeClass('positive').addClass('negative').text('Passwords Don\'t Match');
            }
        }

    });

};
