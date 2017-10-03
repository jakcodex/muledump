## Settings Manager

### Manageable Settings

#### ```SetupTools Enabled```
Whether or not to utilize SetupTools features or fallback on the traditional accounts.js format.

#### ```Prevent Auto Download```
When downloading data from SetupTools, this feature prevents you from accidentally downloading a backup of sensitive account information to your Downloads folder.

#### ```Maximum Backups in Local Storage```
SetupTools stores backups in your browser's local storage. This utilizes disk space on your computer. This feature limits the maximum number of exposed backups to keep before auto-deleting the oldest.

#### ```Automatic Daily Backups```
Automatically create a daily backup of your configuration stored in browser local storage.

#### ```Account Load Delay in Seconds```
Delay between account load times when contacting Deca servers. For people with fewer than 5 accounts this can be set to 1 or 2. For people with numerous accounts it is recommended to set this to 10.

Setting this to 0 will utilize adaptive load delay. This will automatically vary the load time based on number of accounts.

#### ```Characters Displayed per Row```
The maximum numbers of characters to be displayed in on the webpage per row. 

#### ```Testing```
Whether or not you're connecting to the production or testing ROTMG servers.

#### ```Price Display in Tooltips```
Show pricing information on screen.

#### ```Enable One-click Login```
Whether or not to enable the support of muledump:// links.

#### ```Use Smart Layout```
Whether or not to use Masonry to generate the page layout.

#### ```Enable Debug Logging```
Whether or not to output the debug log to the console.

#### ```Alert on New Version```
Whether or not to display a notice on a new version or patch release.

### Optional Actions

#### ```Reset to Default Settings```
Restore all settings to the default SetupTools configuration.

#### ```Erase Configuration```
Erases SetupTools configuration, and optionally stored backups. If you have an accounts.js file in the folder you will resume using it on reload; otherwise, you will enter the first run prompt.
