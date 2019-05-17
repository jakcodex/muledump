# Settings Manager

[Muledump](#ms)

[SetupTools](#sts)

[Advanced](#advs)

[Assistants](#as)

[Analytics](#al)

[System](#ss)

## <a href="#" id="ms"></a>Muledump Settings

### ```Account Load Delay in Seconds```
Delay between account load times when contacting Deca servers.

### ```Characters Displayed per Row```
The maximum numbers of characters to be displayed in on the webpage per row.

### ```Display Errors```
Display error messages when encountered.

### ```Export Default Mode```
What export mode to utilize if you click the Export button without selecting a format.

### ```Gift Chests Width```
Numbers of gift chests to display per row.

### ```One Click Login```
Whether or not to enable One Click Login mode.

### ```Page Search```
Format to display page search: Full width, shortened, or off.

### ```Totals Display Width```
Number of items to display per row in totals. Whole screen automatically adjusts to current size of the browser window.

### ```Totals Export Width```
Number of items to display per row in totals when exporting an image.

## <a href="#" id="sts"></a>SetupTools Settings

### ```SetupTools Enabled```
Whether or not to utilize SetupTools features or fallback on the traditional accounts.js format.

Setting this to Automatic will determine the value based on number of enabled accounts.

Muledump Local only

### ```Accounts Displayed per Page```
Number of accounts to display per page in UI managers.

### ```Alert on New Version```
Whether or not to display a notice on a new version or patch release.

Muledump Online only

Warning: This setting might get ignored by your browser making the setting useless.

### ```Automatically Reload Account Data```
Whether or not accounts set to Automatic Reload will execute the action.

### ```Bad Account Actions```
How to handle bad accounts (invalid credentials, banned).

### ```Groups Manager Mode```
Which mode Groups Manager is running in. Possible modes are:

#### Off
Groups Manager configuration is not loaded.

#### On, Parallel
Groups Manager accounts are merged with their order preserved 

Example: [a, b, c] + [d, e, f] + [g, h, i] = [a, d, g, b, e, h, c, f, i]

#### On, Serial
Groups Manager accounts are merged with their order arranged by overall order 

Example: [a, b, c] + [d, e, f] + [g, h, i] = [a, b, c, d, e, f, g, h, i]

### ```Maximum Backups in Local Storage```
SetupTools stores backups in your browser's local storage. This utilizes disk space on your computer. This feature limits the maximum number of exposed backups to keep before auto-deleting the oldest.

## <a href="#" id="advs"></a>Advanced Settings

### ```Animations```
Whether or not to display all animations, reduced animations, or minimal animations.

### ```Automatic Backups```
Automatically create daily backups of your configuration stored in browser local storage.

### ```Auto Complete for Password Managers```
When disabled this prevents passwords managers from interfering with username and password fields.

### ```Debug Logging```
Whether or not to output the debug logs to the browser console.

### ```Equipment Silhouettes```
Whether or not to display equipment silhouettes in empty slots.

### ```Hide Muledump Version Text```
Hides the `Jakcodex / Muledump v1.2.3` text in the Muledump header.

### ```Key Bindings```
Sets which key map to use for hotkeys. Offers Windows and MacOS key maps.

### ```Lazily Save Minor Config Changes```
Length of time between lazySave requests (to reduce storage write volume on auto saving features).

### ```Longpress Length in Seconds```
Length of time that a long left click takes to activate.

### ```Low Storage Space Check```
Whether or not to warn you if browser storage space is running out.

### ```Mule Menu```
Whether or not to display the Mule Menu icon on mules.

### ```Menu Position```
Position of the Muledump menu.

### ```Prevent Auto Download```
When downloading data from SetupTools, this feature prevents you from accidentally downloading a backup of sensitive account information to your Downloads folder.

### ```Record Console History```
Records the Muledump debug log and keeps a specified number of entries. 

### ```Storage Compression```
Whether or not to use SetupTools Compression to reduce size of data stored in browser storage.

### ```Time Synchronize```
Whether or not to check if your computer clock's time is correct.

### ```Use Smart Layout```
Whether or not to use Masonry to generate the page layout.

## <a href="#" id="as"></a>Assistants Settings

### ```Account Assistant```
Displays an assistant when account issues are detected (TOS, migration, age verification).

### ```Backup Assistant```
Displays a reminder to download a backup if a certain period of time has gone by since last download.

### ```CORS Assistant```
Displays an assistant to help resolve CORS problems when they are detected. 

### ```Clothing Tooltip Assistant```
Whether or not to show the character clothing and dye information panel.

### ```Items Tooltip Assistant```
Whether or not to show the item information panel.

### ```XP Boosters Tooltip Assistant```
Whether or not to show the XP Boosters information panel.

## <a href="#" id="al"></a>Analytics Settings

### ```Enable Analytics```
Master on/off switch for Usage Analytics.

### ```Activity Ping```
Activity ping tells analytics Muledump is running.

### ```Errors and Bugs```
The types of errors and bugs encountered.

### ```Options and Features```
The options and features that are being used.

## <a href="#" id="ss"></a>System Settings

### ```Reset Muledump Options```
Erases current options and resets it to the default Muledump options.

### ```Erase Account Data Cache```
Erases all cached account data for Muledump. Useful when account data appears to be bad.

### ```Erase Secondary Cache```
Erases all secondary cache data generated by SetupTools (e.g. totals cache).

### ```Erase SetupTools```
Erases all SetupTools-specific configuration and restores Muledump to its original state.

### ```Erase All Data```
Erases all Muledump data including SetupTools, options, accounts, groups, backups, etc.

### ```Reset to Default Settings```
Restore all settings to the default SetupTools configuration.
