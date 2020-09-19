# SetupTools Object Reference

Last Updated: 2018-03-21

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

<a href="#setuptools.app.groups">setuptools.app.groups</a>

<a href="#setuptools.app.backups">setuptools.app.backups</a>

<a href="#setuptools.app.config">setuptools.app.config</a>

<a href="#setuptools.init">setuptools.init</a>

<a href="#setuptools.lightbox">setuptools.lightbox</a>

<a href="#setuptools.storage">setuptools.storage</a>

<a href="#setuptools.other">setuptools.*</a>

#### <a href="#muledump.code.reference">Muledump Code Reference</a>

#### <a href="#jquery.event.namespaces">jQuery Event Namespaces</a>

## <a id="serverstate" href="#"></a>SetupTools State Information - setuptools.state

These are keys which report state information about SetupTools current runtime. All values are boolean.

#### setuptools.state.assistant
Various assistant states.

#### setuptools.state.ctrlKey
Whether or not the control key is being pressed.

#### setuptools.state.error
Whether or not SetupTools has entered an error state.

#### setuptools.state.extension
Whether or not the user has been detected as having or not having the Muledump CORS Adapter.

#### setuptools.state.firsttime
Whether or not the user is detected as being a first time user.

#### setuptools.state.hosted
Whether or not the user is running local or hosted Muledump

#### setuptools.state.loaded
Whether or not SetupTools has successfully loaded client configuration.

#### setuptools.state.notifier
Whether or not any notifier is running.

#### setuptools.state.preview
Whether or not the system has detected we're in preview mode.

## <a id="serverconfigkeys" href="#"></a>Server Configuration Keys - setuptools.config

#### setuptools.config.actoken
`[default: string|jcmd]`

An identifier placed in certain local storage keys to identify the specific Muledump fork generating the data.

#### setuptools.config.appspotProd
`[default: string|https://realmofthemadgodhrd.appspot.com/]`

Full URL for Appspot production server endpoint.

#### setuptools.config.appspotTesting
`[default: string|https://rotmgtesting.appspot.com/]`

Full URL for Appspot testing server endpoint.

#### setuptools.config.backupAssistantDelay
`[default: number|30000]`

Delay before Backup Assistant will popup on screen.

#### setuptools.config.compressionMinimum
`[default:number|1000]`

Minimum size in bytes a string must be before it gets compressed for SetupTools Compression.

#### setuptools.config.compressionFormat
`[default:number|0]`

Compression format to utilize. Presently supports SnappyJS with id 0.

#### setuptools.config.compressionLibraries
`[default:object|{snappy: {}}]`

Each compression algorithm should be defined as an key with an empty object for its data. The key order determines the ids used in `compressionFormat`.

#### setuptools.config.corsURL
`[default:object|{...}]`

Browser-specific URLs to their respective Muledump CORS Adapter browser extension page.

#### setuptools.config.defaultSlotOrder
`[default: object|...]`

Default order of item group IDs when displaying totals.

#### setuptools.config.devForcePoint
`[default: string|empty]`

Used for forcing redirection within code. For example, setuptools.storage.test() listens for devForcePoint='storage-test' and will always force a test failure if present.

Basically, if you want to test alternative paths such as errors and fallbacks, this will let you simulate those events.

#### setuptools.config.disqualifiedItemIds
`[default: array|...]`

List of item IDs that are disqualified from Muledump.

#### setuptools.config.encryption
`[default: boolean|false]`

Whether or not Mulecrypt is enabled.

#### setuptools.config.errorColor
`[default: string|#ae0000]`

Hex color used for error texts outside of css

#### setuptools.config.exporterStoredLinks
`[default: number|10]`

How many recent links to store in history when uploading to Jakcodex/Paste.

#### setuptools.config.ga
`[default: string|empty]`

The Google Analytics site ID.

#### setuptools.config.gaFuncName
`[default: string|analytics]`

The function name to assign Google Analytics.

#### setuptools.config.gaInterval
`[default: number|300000]`

The analytics background ping rate in milliseconds.

#### setuptools.config.gaOptions
`[default: object|...]`

The default options for Google Analytics

#### setuptools.config.giftsWarningThreshold
`[default: number|6500]`

The number of items in a single gift chest required to trigger the Gift Chests vault bug.

#### setuptools.config.giftChestsBugHelp
`[default: string|https://github.com/jakcodex/muledump/wiki/Gift+Chests+Bug]`

The URL to link users for explaining the Gift Chests bug.

#### setuptools.config.githubArchive
`[default: string|https://github.com/jakcodex/muledump/archive/]`

The URL to the Muledump Github archive (for linking release downloads).

#### setuptools.config.githubRawUrl
`[default: string|https://raw.githubusercontent.com/jakcodex/muledump]`

The URL to the Muledump Github raw archive (for linking single-file downloads).

#### setuptools.config.goHomeSkip
`[default: array|...]`

A list of lightbox pages which will not have the goHome button drawn.

#### setuptools.config.hostedDomain
`[default: string|jakcodex.github.io]`

Hostname for Muledump Online.

#### setuptools.config.httpErrorHelp
`[default: string|https://github.com/jakcodex/muledump/wiki/Frequently+Asked+Questions#http-error-was-returned-by-rotmg-servers]`

The URL for help regarding generic HTTP errors received by RealmAPI.

#### setuptools.config.keyPrefix
`[default: string|muledump:setuptools:]`

Prefix used for all local storage objects accessed in SetupTools

#### setuptools.config.masonryOptions
`[default: object|...]`

Masonry configuration options.

#### setuptools.config.mcMinimumEntropy
`[default: number|6]`

Minimum unique characters in user-provided password.

#### setuptools.config.mcMinimumKeyLength
`[default: number|12]`

Minimum user-provided password length.

#### setuptools.config.mcMinimumKeyStrength
`[default: number|2]`

Minimum user-provided password strength.

#### setuptools.config.muledump
`[default: object]`

An object for storing Muledump-specific feature server configuration data.

This currently consists of a single key. `setuptools.config.muledump.corsAttempts` which determines how many failed preflight requests may occur before triggering CORS Assistant.

#### setuptools.config.mqBGDelay
`[default: number|1000]`

Time in milliseconds to run the background task.

#### setuptools.config.mqBGHealthDelay
`[default: number|5000]`

Time in milliseconds to run the background task health checker.

#### setuptools.config.mqDefaultConfig
`[default: object|{action: 'query', ignore_cache: false, cache_only: false]`

The base config object to use when creating MuleQueue requests.

#### setuptools.config.mqRateLimitExpiration
`[default: number|300000]`

Time in milliseconds that a rate limit lasts for.

#### setuptools.config.mqStaleCache
`[default: number|86400000]`

Time in milliseconds after which mulequeue cache data is considered stale.

#### setuptools.config.noEncryptKeys
`[default: array|['mulecrypt:keychain']]`

Which storage keys Mulecrypt should not encrypt.


#### setuptools.config.noticesMonitorMaxAge
`[default: number|60]`

The number of seconds the notices monitor will run before exiting.

#### setuptools.config.oclAdmin
`[default: boolean|false]`

Default OCL admin setting.

#### setuptools.config.oclAllPaths
`[default: array|["localhost", "www.realmofthemadgod.com", "test.realmofthemadgod.com"]]`

All possible OCL update paths.

#### setuptools.config.oclClient
`[default: string|https://www.realmofthemadgod.com/client]`

Default OCL client URL (used with Flash Projector mode).

#### setuptools.config.oclDebug
`[default: boolean|false]`

Default OCL debug setting.

#### setuptools.config.oclDefault
`[default: string|Browser]`

Default OCL mode setting.

#### setuptools.config.oclPath
`[default: string|https://www.realmofthemadgod.com/]`

Default OCL game path URL (in Browser mode) or Flash Projector exe path.

#### setuptools.config.oclPaths
`[default: string|www.realmofthemadgod.com]`

Ddefault OCL path for file updates.

#### setuptools.config.oneclickHelp
`[default: string|https://github.com/jakcodex/muledump/wiki/One-Click-Login]`

URL to the One-click login wiki page.

#### setuptools.config.perfLoadTime
`[default: number|3000]`

Time in milliseconds after which to consider load time a performance issue.

#### setuptools.config.perfMinCPUs
`[default: number|4]`

Minimum number of recommended CPU cores.

#### setuptools.config.rateLimitHelp
`[default: string|https://github.com/jakcodex/muledump/wiki/Rate-Limiting]`

URL to the Rate Limiting information wiki page.

#### setuptools.config.remotePasteUrl
`[default: string|https://paste.jakcodex.io/api/create]`

URL to the remote Paste REST API endpoint.

#### setuptools.config.realmApiParams
`[default: object|...]`

Default request parameters added to all RealmAPI requests.

#### setuptools.config.realmApiTimeout
`[default: number|10000]`

Request timeout in milliseconds for all RealmAPI AJAX calls.

#### setuptools.config.realmeyeUrl
`[default: string|https://www.realmeye.com]`

URL to use for linking to Realmeye.

#### setuptools.config.realmeyeOfferIds
`[default: array]`

An array of item ids of items currently tradable on Realmeye. A better solution will be implemented at a later time.

#### setuptools.config.recordConsoleMinimum
`[default: number|15]`

Minimum number of records to store for the history console.

#### setuptools.config.recordConsolePerPage
`[default: number|15]`

Number of records to display per page in the history console.

#### setuptools.config.regex
A list of RegExp objects used throughout the program

#### setuptools.config.reloadDelay
`[default: number|3]`

How many seconds to wait before triggering automatic window reloads

#### setuptools.config.remotePasteUrl
`[default: string|https://paste.jakcodex.io/api/create]`

URL for remote Paste service API.

#### setuptools.config.timesyncTtl
`[default: number|2500]`

Time in milliseconds before the Time Sync API request times out.

#### setuptools.config.timesyncUrl
`[default: string|https://time.jakcodex.io/api/time]`

URL to the remote Time REST API endpoint.

#### setuptools.config.totalsDefaultIcon
`[default: array|[880, 40]]`

Default icon position for Totals Settings Manager - Item Group Sorting menu.

#### setuptools.config.totalsItemWidth
`[default: number|0]`

Width of each item in the totals block.

#### setuptools.config.totalsFilterKeysIndex
`[default: number|11]`

Position on setuptools.config.totalsSaveKeys where totalsFilter keys begins (typically setuptools.config.totalsSaveKeys.length)

#### setuptools.config.totalsSaveKeys
`[default: array|...]`

List of primary totals options keys (sbfilter, stfilter, fpfilter, fbfilter, etc).

#### setuptools.config.totalsKeyObjects
`[default: object|...]`

List of default values for various totals configuration keys.

#### setuptools.config.updatecheckTTL
`[default: number|600000]`

The length of time in milliseconds to cache Github Tags API response data.

#### setuptools.config.updatecheckURL
`[default: string|https://api.github.com/repos/jakcodex/muledump/tags]`

The Github API URL for accessing Muledump repo tags.

#### setuptools.config.url
`[default: string|https://jakcodex.github.io/muledump]`

URL for Muledump Online

#### setuptools.config.vaultbuilderMinimumId
`[default: number|1000]`

Minimum ID for user-created vaults.

#### setuptools.config.vstIndex
`[default: number|10]`

Index on constants data identifying the item group number.

#### setuptools.config.wikiUrl
`[default: string|https://github.com/jakcodex/muledump/wiki]`

The URL to the Github wiki.

## <a id="clientconfigkeys" href="#"></a>Client Configuration Keys - setuptools.data.config

#### setuptools.data.config.accountAssistant
`[default: number|1]`

Whether or not the account assistant is enabled.

#### setuptools.data.config.accountLoadDelay
`[default: number|0]`

How many seconds to delay between account loads with Deca. Supports two automatic modes which set a time based on number of accounts:

##### Automatic (Throttled)
Seconds set to 0 - Targets 30 requests per 5 minutes on the high end.

##### Automatic (Aggressive)
Seconds set to -1 - Targets 50 requests per 5 minutes on the high end.

#### setuptools.data.config.accountsPerPage
`[default: number|10]`

How many accounts to display per page during pagination.

#### setuptools.data.config.alertNewVersion
`[default: number|1]`

Whether or not to alert on new versions (0=off, 1=releases, 2=all versions).

#### setuptools.data.config.animations
`[default: number|1]`

Whether or not to show full (1), reduced (0), or minimal (-1) animations where applicable.

#### setuptools.data.config.automaticBackups
`[default: boolean|true]`

Enable creation of an automatic backup if more than 24 hours has past since the last backup by any method.

#### setuptools.data.config.autoReloadDays
`[default: number|0]`

How old cache data can be before it is considered stale (only applies to accounts with autoReload=true).

#### setuptools.data.config.backupAssistant
`[default: number|14]`

How many days between backup assistant alerts.

#### setuptools.data.config.badaccounts
`[default: number|-1]`

How to create to accounts that are detected as being bad.

##### -1
The feature is disabled

##### 0
Disable invalid accounts

##### 1
Disable banned accounts

##### 2
Delete invalid accounts

##### 3
Delete banned accounts

##### 4
Disable both invalid and banned accounts

##### 5
Delete both invalid and banned accounts

#### setuptools.data.config.compression
`[default: boolean|false]`

Whether or not the SetupTools Compression feature is enabled.

#### setuptools.data.config.corsAssistant
`[default: number|1]`

Whether or not the CORS assistant is enabled.

#### setuptools.data.config.debugging
`[default: boolean|false]`

Whether or not to log debugging information to the browser console.

#### setuptools.data.config.enabled
`[default: boolean|false]`

Whether or not SetupTools is enabled.

#### setuptools.data.config.equipSilhouettes
`[default: boolean|true]`

Whether or not empty equipment slots have item type silhouettes displayed.

#### setuptools.data.config.exportDefault
`[default: number|4]`

Default action when clicking the Export button.

##### 0
None, just open the Muledump Exporter menu

##### 1
Text

##### 2
CSV

##### 3
JSON

##### 4
Image

##### 5
Imgur

#### setuptools.data.config.errors
`[default: boolean|true]`

Whether or not to display account errors instead of just logging them.

#### setuptools.data.config.ga
`[default: boolean|false]`

Whether or not Usage Analytics is enabled (Muledump Online only). If disabled, all enabled GA settings are disabled at runtime.

#### setuptools.data.config.gaErrors
`[default: boolean|true]`

Whether or not to participate in Usage Analytics error reporting.

#### setuptools.data.config.gaOptions
`[default: boolean|true]`

Whether or not to participate in Usage Analytics feature usage reporting.

#### setuptools.data.config.gaPing
`[default: boolean|true]`

Whether or not to participate in Usage Analytics background ping.

#### setuptools.data.config.gaTotals
`[default: boolean|true]`

Whether or not to participate in Usage Analytics totals usage reporting.

#### setuptools.data.config.giftChestWidth
`[default: number|0]`

Number of gift chests to display per row. If set to zero it will match the row length.

#### setuptools.data.config.groupsMergeMode
`[default: number|1]`

How to merge accounts configured in the groups manager (0=off, 1=parallel, 2=serial).

#### setuptools.data.config.hideHeaderText
`[default: boolean|false]`

Whether or not to hide the Muledump product information from the top bar.

#### setuptools.data.config.keyBindings
`[default: number|0]`

Which keyboard key binding map to utilize.

##### 0
Standard - compatible with Windows and Linux

##### 1
Mac OS - replaces Ctrl with Command key

#### setuptools.data.config.lazySave
`[default: number|10000]`

The time in miliseconds between lazySave cycles.

#### setuptools.data.config.longpress
`[default: number|1000]`

How long a long left click must last to register as a longpress.

#### setuptools.data.config.lowStorageSpace
`[default: boolean|true]`

Whether or not to display a notice when low storage space is detected.

#### setuptools.data.config.maximumBackupCount
`[default: number|10]`

Number of non-protected backups to keep in local storage before automatically removing old backups

#### setuptools.data.config.menuPosition
`[default: number|2]`

Position of the menu between left, center, and right.

#### setuptools.data.config.mqBGTimeout
`[default: number|180]`

Maximum amount of time in seconds the background task can run without pinging before being considered stale (presently not user changeable).

#### setuptools.data.config.mqConcurrent
`[default: number|1]`

Maximum number of concurrent requests to run in MuleQueue (presently not user changeable).

#### setuptools.data.config.mqKeepHistory
`[default: number|100]`

Maximum number of MuleQueue history records to keep.

#### setuptools.data.config.mulelogin
`[default: number|0]`

Whether or not one-click login is enabled

#### setuptools.data.config.muleloginCopyLinks
`[default: number|0]`

Enable copying Mule link source from the launch button.

#### setuptools.data.config.muleMenu
`[default: boolean|true]`

Whether or not to display the Mule Menu icon in the UI.

#### setuptools.data.config.nomasonry
`[default: number|0]`

Whether or not to disable Masonry page layout

#### setuptools.data.config.pagesearch
`[default: number|2]`

Whether or not to display the full Page Search bar (2), expanding bar (1), or no bar (0).

#### setuptools.data.config.pagesearchMode
`[default: number|0]`

*Not released yet*

#### setuptools.data.config.preventAutoDownload
`[default: boolean|true]`

Whether or not to prevent browser automatic, no-confirm downloads (dangerous given our usage; sensitive files don't belong in Downloads)

#### setuptools.data.config.recordConsole
`[default: number|2000]`

Number of console entries to keep in the history console. 

#### setuptools.data.config.recordConsoleTtl
`[default: number|10000]`

Interval of time in milliseconds to store new records to the history console.

#### setuptools.data.config.rowlength
`[default: number|7]`

Number of items to display in a single row in Muledump (combo of chars+accounts)

#### setuptools.data.config.timesync
`[default: boolean|false]`

Whether or not to use the Time Sync feature to check the correctness of the system clock using a remote REST API service.

#### setuptools.data.config.tooltip
`[default: number|500]`

Time to wait in milliseconds before displaying a tooltip on hover.

#### setuptools.data.config.tooltipClothing
`[default: number|1]`

Enable the clothing tooltip.

#### setuptools.data.config.tooltipItems
`[default: number|1]`

Enable the items tooltip.

#### setuptools.data.config.tooltipXPBoost
`[default: number|1]`

Enable the XPBoost tooltip.

#### setuptools.data.config.totalsExportWidth
`[default: number|0]`

Size of the Totals export image. Values -1 and 0 are special.

##### -1
Set to `setuptools.data.config.totalswidth`

##### 0
Whole screen width

#### setuptools.data.config.totalswidth
`[default: number|0]`

Number of items to display per row in totals. A value of 0 will default to whole screen usable width.

#### setuptools.data.config.vaultbuilderAccountViewLimit
`[default: number|10]`

Number of accounts to show in vault builder account view menu before scrolling.

#### setuptools.data.config.wbTotals
`[default: boolean|true]`

Whether or not the White Bag Tracker is in Totals or Owned mode.

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
            loginOnly: false,
            cacheEnabled: true,
            autoReload: false
        },
        'email2@test2.com': {
            password: 'pass2',
            enabled: true,
            loginOnly: false,
            cacheEnabled: true,
            autoReload: false
        }
    }
}
```

##### setuptools.data.accounts.accounts[guid].autoReload
`[default: boolean|false]`

Accounts marked as auto reload will reload account data whose cache is determined to be too old.

##### setuptools.data.accounts.accounts[guid].banned
`[default: boolean|false]`

Whether or not the specified account is detected as being banned.

##### setuptools.data.accounts.accounts[guid].cacheEnabled
`[default: boolean|true]`

Disabling the data cache forces an account to reload its account data every time Muledump is ran.

##### setuptools.data.accounts.accounts[guid].enabled
`[default: boolean|true]`

Whether or not the specified account is enabled.

##### setuptools.data.accounts.accounts[guid].giftBugsAck
`[default: boolean|false]`

Whether or not the user has acknowledged a detected gift chests bug event.

##### setuptools.data.accounts.accounts[guid].loginOnly
`[default: boolean|false]`

Accounts marked as login only will connect to Deca to reload account data but will not display in Muledump.

##### setuptools.data.accounts.accounts[guid].testing
`[default: boolean|false]`

Whether or not the account connects to the testing server endpoint.

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

#### setuptools.lightbox.drawHelp(object e, object drawhelpData, object self [, boolean net=false])

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
$('.setuptools.link.somehelpdoc').click(function(e) { setuptools.lightbox.drawHelp(e, {title: 'My help title'}, this); });
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

#### setuptools.lightbox.menu.context.keyup(string name, eventObject e[, string selectorSuffix])

Binds up and down arrows for menu navigation and enter for menu selection.

#### setuptools.lightbox.menu.context.isOpen(string name)

Returns true or false for the status of the specified context menu.

#### setuptools.lightbox.menu.context.close([string name, boolean keep])

Closes any open context menu and will removed selected class from any provided jQuery object. 

If keep is true, it will close all menus except the specified menu.

#### setuptools.lightbox.menu.paginate.create(array PageList, string ActionItem, string ActionContainer, string ActionSelector, function ActionCallback, function ActionContext[, object Modifiers])

Creates and managed a paginated display (think accounts manager or either column in the group editor).

##### PageList
Format A: 
```js
var PageList = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 100"];
```

Format B:
```js
var PageList = [{item: 1}, {item: 2}, {item: 3}, {item: 4}, {item: 5}];
```

##### ActionItem

Any constant that might be used in this pagination system (e.g. groupName). This argument belongs in the optional section.

Use "undefined" if none.

##### ActionContainer

Pagination assumes you are attaching to a div with this class (e.g. div.ActionContainer).

##### ActionSelector

Full selector value for the location page updates are stored.

##### ActionCallback

Action to perform when the page needs to be updated. Received arguments: ActionItem, currentPage.

##### ActionContext

Action to perform after the page HTML has been updated (JQuery bindings, etc).

##### Modifiers

Modifies aspects of the pagination system.

You can add extra buttons next to the 'Next Page' button:
```js
var Modifiers = {
    'pageButtons': ' \
        <div \
        class="editor control massSwitch noselect" \
        title="Mass Switch" \
        style="font-weight: normal; font-size: 12px; padding-top: 3px !important;">\
            &#8801;\
        </div>\
    '};
```

If you PageList is a Format B (see above) you can attach the search feature to specified keys:
```js
var PageList = [
    {user: 'blah', someoption: true}, 
    {user: 'ick', someoption: true}, 
    {user: 'oof', someoption: true}, 
    {user: 'doh', someoption: true}
];
var Modifiers = {search: {key: 'user'}};
```

#### setuptools.lightbox.menu.search.searchExecute(object state, string searchTerm[, boolean skip])

Locates the specified searchTerm and updates state.currentPage to reflect it. If skip=true it will skip automatically updating the page.

#### setuptools.lightbox.menu.search.bind(object state[, boolean skip, string altContainer, JQuery altPosition, object altAdjustments, function altBinding, boolean keepName])

Binds the search menu to the state and can be modified in a variety of ways.

##### altContainer

Overrides the ActionContainer setting for the page.

##### altPosition

Overrides the JQuery selector used to position the menu.

##### altBinding

Overrides the bindings to execute after search execution.

##### keepName

Name of the search menu to keep when taking focus.

#### setuptools.lightbox.menu.paginate.clear([string ActionContainer, boolean reset])

Resets all or specified pagination data back to a clear state. If reset=true, ActionContainer is reset to page 0.

#### setuptools.lightbox.menu.paginate.findPage(string searchIndex, string ActionContainer)
 
Locates page of specified searchIndex and updates state.currentPage.

#### setuptools.lightbox.menu.paginate.pageUpdate(boolean close, function ActionContext, object ActionContextOptions)

Refreshes page bindings after the page has been updated.

##### close

If true, any open context menus are closed.

##### ActionContext 

Function or array of functions to execute.

##### ActionContextOptions

Object passed to ActionContext functions.

#### setuptools.lightbox.tooltip(jQuery parent, html content[, object modifiers])

Displays a tooltip above the parent element. 

##### Possible Modifiers 

```js
var Modifiers = {
    classes: 'string',      // classes to insert into the tooltip div
    heightFrom: 'string'    // where to get height data from; options are: tooltip, parent (default: parent)
}
```

#### setuptools.lightbox.status(object self, string string, number duration)

Replaces provided self with supplied string for the specified duration before resetting the label.

### <a id="setuptools.app" href="#"></a>Main Application - setuptools.app

#### setuptools.app.introduction()

Display the introduction page for new users

#### setuptools.app.index([object config])

Display the application index page (or first time user page for new users)

#### setuptools.app.checknew()

Determine if the user is completely new or not

#### setuptools.app.hashnav()

Reads the location.hash to direct users to specified pages on request.

##### Supported Hashes

* about
* accounts
* accounts-export
* accounts-mass
* accounts-massSwitch
* accountsjs
* backups
* backups-create
* backups-restore
* backups-upload
* groups
* groups-create
* groups-select-all
* groups-select-disabled
* groups-select-enabled
* groups-disableAll
* groups-enableAll
* help-cors
* settings
* settings-<ClientConfigKeyName>
* settings-assistants
* settings-setuptools
* settings-system

#### setuptools.app.ga(string command[, mixed action, mixed value1, mixed value2, mixed value3, mixed value4, mixed value5])

Handles all commands for Usage Analytics. Blocks commands when Usage Analytics is disabled. If command!==init then action is required.

The first value is checked against a list of approved values to sort them into categories that users can enable/disable.

This is a wrapper for the Universal Analytics function.

#### setuptools.app.gaReview()

Provided to users new to Usage Analytics to explain to them what it is and offer them the option to opt-out.

### <a id="setuptools.app.accounts" href="#"></a>Accounts Management Utilities - setuptools.app.accounts

#### setuptools.app.accounts.start()

An early prototype for the first time user walk through. A relic of old.

#### setuptools.app.accounts.manager()

Displays the Accounts Manager page and facilitates all modifications.

#### setuptools.app.accounts.ExportDeepCopy(string guid)

Displays a download link for the specified GUID's account data if any exists.

#### setuptools.app.accounts.saveConfirm()

A save confirmation screen shown to first-time users upon finishing setup.

#### setuptools.app.accounts.AccountsJSExport()

Generates an accounts.js file using setuptools.app.accounts.AccountsJSExport() and provide a download link.

#### setuptools.app.accounts.AccountsJSImport()

Display a page offering users the choices available for importing an Accounts.js file.

#### setuptools.app.accounts.AccountsJSImportLocal()

Facilitates importing from an accounts.js detected in the Muledump installation.

#### setuptools.app.accounts.AccountsJSImportUpload([boolean manual=false])

Facilitates importing by uploading an accounts.js file to SetupTools.

### <a id="setuptools.app.groups" href="#"></a>Groups Management Utilities - setuptools.app.groups

#### setuptools.app.groups.manager([string group, boolean open])

Displays the Groups Manager page. A string or array of groups provided will be automatically selected. If open=true, the first group is opened in the group editor.

#### setuptools.app.groups.delete(mixed groupName)

Displays a confirmation page to delete the specified list og groups.

Accepts a JQuery selector of selected groups from the groups list or a comma-separated string of groups.

#### setuptools.app.groups.copy(string groupName[, string newGroupName]) 

Displays a page to facilitate copying a group to a new group. Calling with newGroupName will alert the user that the name is a duplicate.

#### setuptools.app.groups.rename(string groupName[, newGroupName])

Displays a page to facilitate the renaming of a group. Calling with newGroupName will alert the user that the name is a duplicate.

#### setuptools.app.groups.merge(JQuery selectedClass[, newGroupName])

Displays a page to facilitate the merging of two or more selected groups. Calling with newGroupName will alert the user that the name is a duplicate.

#### setuptools.app.groups.add([string groupName])

Displays a page to facilitate creating a new group.

#### setuptools.app.groups.load(object accounts)

Returns a sorted list of group accounts based on the provided list of available accounts.

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

#### setuptools.app.backups.rename(string BackupID)

Display a page providing the user a form to change a backup's name.

#### setuptools.app.backups.renameHtml(string page, string BackupID, string BackupDataJSON[, function callback, boolean noclose])

Inserts a backup custom name input to the provided page and returns a context binding. When the form is executed, it will update the backup and any download link filename on display.

#### setuptools.app.backups.create()

Create a backup and display a page with a download link for the new backup.

#### setuptools.app.backups.listAll()

Returns an array listing all backup metadata found in local storage.

#### setuptools.app.backups.cleanup()

Enforces the maximum backup count by finding all non-protected backups and deleting any whose position is larger than the maximum allowed limit.

### <a id="setuptools.other" href="#"></a>Other Methods - setuptools.*

#### setuptools.click()

Captures clicks on #setup button

#### setuptools.app.upgrade.version()

Checks if a new Muledump version has been loaded and applies it to the client configuration. Also notifies Muledump Online users of changes.

#### setuptools.app.upgrade.seek()

Performs all SetupTools client configuration upgrades necessary to bring the user up to current configuration format.

#### setuptools.originalAccountsJS
If an accounts.js file was successfully loaded into Muledump then the accounts var is cloned here; otherwise, its value is false.

## <a id="muledump.code.reference" href="#"></a>Muledump Code Reference

#### setuptools.app.muledump.chsortcustomDedupAndValidate(string CustomList, object mule)

Process a CustomList and validate its char ids against the Mule's char id list.

#### setuptools.app.muledump.chsortcustom(object mule)

Displays a page for management custom character sorting lists.

## <a id="jquery.event.namespaces" href="#"></a>jQuery Event Namespaces

Event namespaces are used to allow multiple identical events to be bound to the same elements.

The following is a basic list of event namespaces and their associated selectors.

This list is presently not exhaustive and not all event handlers have been converted to use namespaces yet.

### lib/muledump/muledump.js Events

#### click.muledump.itemFilter
```js
$('body')
```

#### click.muledump.guidFilter
```js
$('body')
```

#### click.muledump.totalsMenu
```js
$('#totalsMenu')
```

#### mouseover.muledump.totalsMenu
```js
$('#totalsMenu')
```

#### click.muledump.mulequeue
```js
$('#mulequeue')
```

#### mouseover.muledump.mulequeue
```js
$('#mulequeue')
```

#### click.muledump.about
```js
$('#about')
```

#### click.muledump.aboutdocs
```js
$('.drawhelp.docs')
```

### lib/muledump/export.js Events

#### click.muledump.exportMenu
```js
$('#export')
```

### lib/muledump/mule.js Events

#### click.muledump.reloader
```js
$('.button.reloader')
```

#### click.muledump.mulemenu
```js
$('.button.muleMenu')
```

#### contextmenu.muledump.mulemenu
```js
$('div.mule > div.name')
$('.mule')
```

#### click.muledump.errorAck
```js
$('div.mule[data-guid="guid"] > div.setuptools.link.errorAck')
```

#### click.muledump.muleAccountName
```js
$('div.mule[data-guid="guid"] > div.name')
```

#### mouseenter.muledump.boostTooltip
```js
$('div.boost')
```

#### mouseleave.muledump.boostTooltip
```js
$('div.boost')
```

### lib/muledump/options.js Events

#### change.muledump.options
```js
$('div#options input');
```

#### change.muledump.options.radio
```js
$('div#options input');
```

#### change.muledump.options.radioContainer
```js
$('div#options input');
```

#### mouseenter.muledump.options.accopts
```js
$('#accopts')
```

#### mouseleave.muledump.options.accopts
```js
$('#accopts')
```

#### mouseenter.options.display
```js
$('#options')
```

#### mouseleave.options.display
```js
$('#options')
```

#### mouseenter.options.menuButton
```js
$('.handle.options')
```

#### mouseleave.options.menuButton
```js
$('.handle.options')
```

### lib/setuptools/src/setuptools.js Events

#### mouseover.muledump.mainMenu
```js
$('#top > div:not(.notice)')
```

#### mouseenter.muledump.mainMenu
```js
$('#top > div:not(.handle.options)')
```

#### resize.muledump.totalsWidth
```js
$('window')
```

#### click.muledump.clickTrack
```js
$('document')
```

#### keydown.muledump.keydownTrack
```js
$('document')
```

#### keyup.muledump.keyupTrack
```js
$('document')
```

#### click.setuptools.corsAssistant
```js
$('.setuptools.link.cors')
```

#### click.setuptools.menuButton
```js
$('#setuptools')
```

### `lib/setuptools/src/accounts.js` Events


