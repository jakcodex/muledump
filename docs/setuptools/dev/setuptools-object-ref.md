# SetupTools Object Reference

SetupTools started off large and will only get larger. This document outlines all the methods and keys found in SetupTools in an effort to make understanding it easier on future development and new devs.

For the method reference, arguments contained in brackets [...] are optional.

## Table of Contents

<a href="#serverstate">SetupTools State Information</a>

#### SetupTools and Muledump Configuration

<a href="#serverconfigkeys">Server Configuration Keys</a>

<a href="#clientconfigkeys">Client Configuration Keys</a>

<a href="#muledumpaccounts">Muledump Accounts Configuration</a>

#### SetupTools Code Reference

<a href="#setuptools.app">setuptools.app</a>

<a href="#setuptools.app.accounts">setuptools.app.accounts</a>

<a href="#setuptools.app.backups">setuptools.app.backups</a>

<a href="#setuptools.app.config">setuptools.app.config</a>

<a href="#setuptools.init">setuptools.init</a>

<a href="#setuptools.lightbox">setuptools.lightbox</a>

<a href="#setuptools.storage">setuptools.storage</a>

<a href="#setuptools.other">setuptools.*</a>

#### Muledump Code Reference

## <a id="serverstate" href="#"></a>SetupTools State Information - setuptools.state

These are keys which report state information about SetupTools current runtime. All values are boolean.

#### setuptools.state.error
Whether or not SetupTools has entered an error state.

#### setuptools.state.loaded
Whether or not SetupTools has successfully loaded client configuration.

#### setuptools.state.firsttime
Whether or not the user is detected as being a first time user.

#### setuptools.state.hosted
Whether or not the user is running local or hosted Muledump

## <a id="serverconfigkeys" href="#"></a>Server Configuration Keys - setuptools.config

#### setuptools.config.keyPrefix
`[default: string|muledump:setuptools:]`

Prefix used for all local storage objects accessed in SetupTools

#### setuptools.config.hostedDomain
`[default: string|jakcodex.github.io]`

Hostname for Muledump Online

#### setuptools.config.url
`[default: string|https://jakcodex.github.io/muledump]`

URL for Muledump Online

#### setuptools.config.errorColor
`[default: string|#ae0000]`

Hex color used for error texts outside of css

#### setuptools.config.devForcePoint
`[default: string|empty]`

Used for forcing redirection within code. For example, setuptools.storage.test() listens for devForcePoint='storage-test' and will always force a test failure if present.

Basically, if you want to test alternative paths such as errors and fallbacks, this will let you simulate those events.

#### setuptools.config.reloadDelay
`[default: number|3]`

How many seconds to wait before triggering automatic window reloads

#### setuptools.config.drawhelpUrlPrefix - deprecated
An array containing setuptools.config.url

#### setuptools.config.regex
A list of RegExp objects used throughout the program

## <a id="clientconfigkeys" href="#"></a>Client Configuration Keys - setuptools.data.config

#### setuptools.data.config.enabled
`[default: boolean|false]`

Whether or not SetupTools is enabled

#### setuptools.data.config.preventAutoDownload
`[default: boolean|true]`

Whether or not to prevent browser automatic, no-confirm downloads (dangerous given our usage; sensitive files don't belong in Downloads)

#### setuptools.data.config.maximumBackupCount
`[default: number|10]`

Number of non-protected backups to keep in local storage before automatically removing old backups

#### setuptools.data.config.automaticBackups
`[default: boolean|true]`

Enable creation of an automatic backup if more than 24 hours has past since the last backup by any method.

#### setuptools.data.config.rowlength
`[default: number|7]`

Number of items to display in a single row in Muledump (combo of chars+accounts)

#### setuptools.data.config.testing
`[default: number|0]`

Whether to use the testing server instead of production

#### setuptools.data.config.prices
`[default: number|0]`

Whether to display pricing in tooltips (this feature was never actually added in original Muledump despite the key)

#### setuptools.data.config.mulelogin
`[default: number|0]`

Whether or not one-click login is enabled

#### setuptools.data.config.nomasonry
`[default: number|0]`

Whether or not to disable Masonry page layout

#### setuptools.data.config.accountLoadDelay
`[default: number|0]`

How many seconds to delay between account loads with Deca (setting to 0 will cause SetupTools to auto-determine the best value for you)

#### setuptools.data.config.debugging
`[default: boolean|false]`

Whether or not to log debugging information to the browser console

## <a id="muledumpaccounts" href="#"></a>Muledump Accounts Configuration - setuptools.data.accounts

SetupTools replaces the need for an accounts.js file by importing that data and restructuring it. Muledump is still provided the original structure for the `accounts` variable by means of `setuptools.app.config.convert()`.

#### Example of Original Accounts.js accounts variable (format=0)

```js
var accounts = {
    'email@test.com': 'pass',
    'email2@test2.com': 'pass2'
}
```

#### Example of SetupTools accounts variable (format=1)

```js
setuptools.data.accounts = {
    meta: {
        created: <timestamp>,
        modified: <timestamp>,
        format: 1,
        version: <modifiycount>
    },
    accounts: {
        'email@test.com': {
            password: 'pass',
            enabled: true,
            group: 0,
            autoReload: false
        },
        'email2@test2.com': {
            password: 'pass2',
            enabled: true,
            group: 0,
            autoReload: false
        }
    }
}
```

##### setuptools.data.accounts.accounts[guid].enabled
`[default: boolean|true]`

Whether or not the specified account is enabled

##### setuptools.data.accounts.accounts[guid].group
`[default: number|0]`

Group which this account belongs to

##### setuptools.data.accounts.accounts[guid].autoReload
`[default: boolean|false]`

Not currently in use anywhere but present for a potential future feature.

#### Converting Formats

Converting from format 0 to format 1 should only occur during an accounts.js import when creating a fresh format 1 configuration.

Going the other direction happens a lot as it's the format in use by Muledump.

##### Converting Format 0 to 1

```js
setuptools.data.accounts = setuptools.app.config.convert(accounts, 1);
```

##### Converting Format 1 to 0

```js
var accounts = setuptools.app.config.convert(setuptools.data.accounts, 0);
```

## Other Properties

#### setuptools.data.options
Reference to window.options

#### setuptools.copy.config
A clone of setuptools.data.config default values and used in restoring default settings

## SetupTools Code Reference

### <a id="setuptools.init" href="#"></a>Initialization - setuptools.init

#### setuptools.init.main()

Begins initialization of SetupTools by determining eligibility to run. 

* Checks for existence of accounts.js file
* Tests for local storage support
* Checks new user state
* When no config is found and accounts.js is present, SetupTools bypasses and Muledump runs like normal
* When no config is found and accounts.js is missing, SetupTools enters first run state by calling setuptools.app.index()
* When no config is found and the storage test fails, an error message is displayed
* When a configuration is found it is loaded on top of the default configuration and setuptools.app.upgrade.seek() scans for any necessary data upgrades

#### setuptools.init.accounts()

If SetupTools is enabled and loaded, this updates the accounts variable with currently enabled accounts; otherwise, it loads from accounts.js.

Mules are then loaded into the mule variable if they don't already exist. Disabled accounts are deleted from the variable.

### <a id="setuptools.storage" href="#"></a>Local Storage - setuptools.storage

#### setuptools.storage.write(string key, string value [, boolean skipPrefix=false])

Stores the value to local storage using setuptools.config.keyPrefix+key for the key name.

If skipPrefix=true then just key is used for the key name.

#### setuptools.storage.read(string key [, skipPrefix=false])

Reads the value from local storage using setuptools.config.keyPrefix+key for the key name.
                                         
If skipPrefix=true then just key is used for the key name.

#### setuptools.storage.delete(key)

Deletes the key from local storage using `setuptools.config.keyPrefix`+`key` for the key name.
 
#### setuptools.storage.test()

Tests whether or not local storage works on the browser.

### <a id="setuptools.lightbox" href="#"></a>Lightbox Management - setuptools.lightbox

This utility uses <a href="https://github.com/noelboss/featherlight" target="_blank">Featherlight</a> to create the lightboxes in use within SetupTools.
 
```js
setuptools.lightbox.create(html data [, object config, string title='Muledump Setup'])
````

Creates a Featherlight lightbox with the supplied HTML data with the specified title and optional configuration.

Configuration object options can be seen in the Featherlight <a href="https://github.com/noelboss/featherlight/#configuration" target="_blank">configuration documentation</a>.

#### setuptools.lightbox.override(string targetPage, string targetAction [, function callback, object data])

Overrides the targetAction of other pages by changing the callback and/or data object. 

For example, say you're sending a user to setuptools.app.accounts.manager() from setuptools.app.myspace.method(). By default, setuptools.app.accounts.manager() will include a goback link to setuptools.app.index(). You can override this behavior with:

```js
setuptools.lightbox.build('myspace-method', ' \
    Hello! This is my page. \ 
    Go to <a href="#" class="setuptools link accountsmanager">Accounts Manager</a> \
');
setuptools.lightbox.settitle('myspace-method', 'My Method Title');
setuptools.lightbox.display('myspace-method');
setuptools.lightbox.override('accounts-manager', 'goback', setuptools.app.myspace.method);
$('.setuptools.link.accountsmanager').click(setuptools.app.accounts.manager);
```

The above example creates a sample page with a link to another page and an override for the other page.

#### setuptools.lightbox.build(string page, html message)

Adds the provided html to the page being built. Build data is stored in an array and is joined on display after being processed.

#### setuptools.lightbox.display(string page [, object config])

Processes and removes all special build data for the specified page (settitle, goback, etc), builds the HTML response data, and sends it to setuptools.lightbox.create().

#### setuptools.lightbox.ajax(object e, object drawhelpData, object self [, boolean net=false])

This method is intended to be bound to a link to the Github Pages hostname. It is primarily bound thru the drawhelp button, but it can be used on custom links as well.
 
Makes an ajax call to the link href and builds a lightbox with the response data. Example:

```js
setuptools.lightbox.build('myspace-method', ' \
    Hello! This is my page. \ 
    Go to <a href="https://jakcodex.github.io/muledump/docs/some/doc" \
        class="setuptools link somehelpdoc noclose">Help Docs</a> for more info \
');
setuptools.lightbox.settitle('myspace-method', 'My Method Title');
setuptools.lightbox.display('myspace-method');
$('.setuptools.link.somehelpdoc').click(function(e) { setuptools.lightbox.ajax(e, {title: 'My help title'}, this); });
```

This creates a lightbox with a link in its message. When the link is clicked the Ajax response data is processed for links and displayed in a lightbox. The class noclose prevents SetupTools from erasing the previous page so when the user closes the help doc they are returned to the original page. 

#### setuptools.lightbox.cancel(string page)

Erases the build data for the specified page.

#### setuptools.lightbox.close(page)

Manually closes a lightbox for the specified page.

#### setuptools.lightbox.drawhelp(string page, string link, string title)

Adds to the page build data a drawhelp object with the format:

```js
var object = {
    iam: 'drawhelp',
    link: link,
    title: title
}
```

#### setuptools.lightbox.settitle(string page, string title)

Changes the default page title for the specified page build

#### setuptools.lightbox.goback(string page [, function callback, string text1, string text2])

Adds to the page build data a goBack object with the format:

```js
var object = {
    iam: 'goback',
    callback: callback,
    text1: text1,
    text2: text2
}
```

#### setuptools.lightbox.error(string message [, number code=0])

Creates and displays an error page with the specified information. Terminates program execution by throwing a new error. 

#### setuptools.lightbox.menu.context.create(string title, object position, object options[, jQuery self])

Creates and displays a context menu at the specified position (pos.left, pos.top).

The following example is taken from Groups Manager group menu controller:

```js
//  selection menu
$('.setuptools.div.groupControls div.groupSelect').click(function (e) {

    var self = this;

    //  deselect other menu options
    $('.setuptools.div.groupControls div:not(.groupSelect)').each(function(index, element) {
       $(element).removeClass('selected');
    });

    //  display the menu
    if ( $('.setuptools.div.groupControls div.groupSelect').hasClass('selected') === false ) {

        //  base info
        $(self).addClass('selected');
        var position = $('.setuptools.div.groupList div.dragbox div.cell:first-child').offset();
        var options = [
            {
                class: 'selectAll',
                name: 'Select All',
                callback: SelectAll
            },
            {
                class: 'selectNone',
                name: 'Deselect All',
                callback: SelectNone
            },
            {
                class: 'selectEnabled',
                name: 'Select Enabled Groups',
                callback: SelectAllEnabled
            },
            {
                class: 'selectDisabled',
                name: 'Select Disabled Groups',
                callback: SelectAllDisabled
            }
        ];

        setuptools.lightbox.menu.context.create('Select Menu', position, options, self);

    } else {

        setuptools.lightbox.menu.context.close(self);

    }

});
```

Clicks to the specified div are captured to toggle the menu on and off. If the menu is presently disabled, setuptools.lightbox.menu.context.create() will be called to create it.

For this context menu, it is supposed to line up with the first div underneath the menu. That position is sent directly to the method.

The options object defines the menu options and what their clicks do. The callback can be a literal callback with no arguments, or you can use `function() { ... }` to use local variables in the callback.

Providing the jQuery self argument will deselect the menu icon when the menu is closed.

#### setuptools.lightbox.menu.context.close([jQuery self])

Closes any open context menu and will removed selected class from any provided jQuery object

### <a id="setuptools.app" href="#"></a>Main Application - setuptools.app

#### setuptools.app.introduction()

Display the introduction page for new users

#### setuptools.app.index([object config])

Display the application index page (or first time user page for new users)

#### setuptools.app.checknew()

Determine if the user is completely new or not

### <a id="setuptools.app.config" href="#"></a>Config Utilities - setuptools.app.config

#### setuptools.app.config.settings()

Display and manage Settings Manager page

#### setuptools.app.config.backup([boolean backupProtected=false, boolean auto=false])

Creates and returns a backup that can be optionally protected at creation.

#### setuptools.app.config.downloadAck()

Intended to be bound to links, it will attempt to get the user's attention when they left click on a link they're supposed to right click on.

#### setuptools.app.config.convert(object accountConfig, number format [, number group, boolean all])

Converts the supplied accountConfig data between formats 0 or 1. If specified, only accounts of a specific group or all accounts can be returned.

See <a href="#muledumpaccounts">Muledump Accounts</a> for more information.

#### setuptools.app.config.validateFormat(object accountConfig, number format)

Determine of the supplied accountConfig format matches the specified format. Returns true or false.

#### setuptools.app.config.determineFormat(object accountConfig)

Determine the format of the supplied accountConfig. Returns 0 or 1. Throws an error if invalid.

#### setuptools.app.config.listUsers([string id, boolean enabled])

Lists all users in the configuration and optionally filters on id (group or guid) and enabled status.

#### setuptools.app.config.userExists(string username)

Checks if the supplied user exists in the accounts variable. Returns true or false.

#### setuptools.app.config.userEnabled(string username)

Checks if the supplied user is enabled in the accounts variable. Returns true always for format 0. Returns true or false for format 1.

#### setuptools.app.config.createUser(string username, string password, boolean enabled, number group, boolean autoReload, string action, number format)

Creates a user user with the supplied username, password, enabled status, group, and autoReload status. Action can either set or return the new user object. Format 0 implies the action is set.

#### setuptools.app.config.create(accountConfig, format)

Takes a format 0 accountConfig and creates a format 1 accountConfig from it.

#### setuptools.app.config.generateAccountsJS(accountConfig)

Generates a new accounts.js file from the supplied accountConfig object and SetupTools client configuration data.

#### setuptools.app.config.saveError()

Generates and displays an error when the SetupTools client configuration fails to save to local storage.

#### setuptools.app.config.save()

Saves the current SetupTools client configuration to local storage and increments setuptools.data.accounts.meta.version.

### <a id="setuptools.app.backups" href="#"></a>Backup Utilities - setuptools.app.backups

#### setuptools.app.backups.index()

Display the Backup Manager page

#### setuptools.app.backups.auto()

Perform the automatic backup policy

#### setuptools.app.backups.upload([boolean manual=false])

Display the backup upload page and optionally specify if it's operating in manual upload mode

#### setuptools.app.backups.restore(string RestoreMethod, string BackupID, string BackupName [, boolean SaveExisting=false, boolean BadEntriesForce=false, boolean BadSaveForce=false])

Restores a backup to the current configuration.

If RestoreMethod=local then BackupID should be the ID of a backup in local storage.

If RestoreMethod=upload then BackupID is the file contents of the upload.

#### setuptools.app.backups.restoreConfirm(string BackupID, string BackupName)

Display a page to confirm if a user wants to restore a local backup.

#### setuptools.app.backups.delete(string BackupID, string BackupName)

Delete the specified backup and display a page showing the results of this task.

#### setuptools.app.backups.protect(string BackupID, string BackupName, boolean BackupProtected)

Change the protection state of the specified backup.

#### setuptools.app.backups.download(BackupID, BackupName, BackupFileName)

Display a page with a download link for the specified backup.

#### setuptools.app.backups.create()

Create a backup and display a page with a download link for the new backup.

#### setuptools.app.backups.listAll()

Returns an array listing all backup metadata found in local storage.

#### setuptools.app.backups.cleanup()

Enforces the maximum backup count by finding all non-protected backups and deleting any whose position is larger than the maximum allowed limit.

### <a id="setuptools.app.accounts" href="#"></a>Accounts Management Utilities - setuptools.app.accounts

#### setuptools.app.accounts.start()

An early prototype for the first time user walk through. A relic of old.

#### setuptools.app.accounts.manager()

Displays the Accounts Manager page and facilitates all modifications.

#### setuptools.app.accounts.ExportDeepCopy()

Displays a page containing all configured accounts. Clicking an account generates a download link for that account's ROTMG XML data in JSON format.

#### setuptools.app.accounts.save()

Processes all accounts located in the Accounts Manager and validates email/guid data. Bad entries are removed and the user alerted. If valid accounts were detected it then saves the changes.

#### setuptools.app.accounts.AccountsJSExport()

Generates an accounts.js file using setuptools.app.accounts.AccountsJSExport() and provide a download link.

#### setuptools.app.accounts.AccountsJSImport()

Display a page offering users the choices available for importing an Accounts.js file.

#### setuptools.app.accounts.AccountsJSImportLocal()

Facilitates importing from an accounts.js detected in the Muledump installation.

#### setuptools.app.accounts.AccountsJSImportUpload([boolean manual=false])

Facilitates importing by uploading an accounts.js file to SetupTools.

### <a id="setuptools.other" href="#"></a>Other Methods - setuptools.*

#### setuptools.click()

Captures clicks on #setup button

#### setuptools.app.upgrade.seek()

Performs all SetupTools client configuration upgrades necessary to bring the user up to current configuration format.

#### setuptools.originalAccountsJS
If an accounts.js file was successfully loaded into Muledump then the accounts var is cloned here; otherwise, its value is false.

## Muledump Code Reference

#### setuptools.app.muledump.chsortcustomDedupAndValidate(string CustomList, object mule)

Process a CustomList and validate its char ids against the Mule's char id list.

#### setuptools.app.muledump.chsortcustom(object mule)

Displays a page for management custom character sorting lists.
