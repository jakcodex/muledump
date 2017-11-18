## Accounts Manager

Adding new accounts requires only the account username and password. All other settings are optional.

Changes made in Accounts Manager are not automatically saved. Leaving Accounts Manager will revert any changes you may have made.

#### ```Account Email or ID```
The email or ID (such as steamworks) for this account. 

Steam users can go to the [Steam Users Setup Guide](https://github.com/jakcodex/muledump/wiki/Steam-Users-Setup-Guide) for help locating their account information.

### Account Options

#### ```Reveal Password```
[default: disabled]

Displays the password for this account instead of hiding it in the text field.

#### ```Auto Reload```
[default: disabled]

When enabled, upon opening Muledump any accounts whose cached data is considered old will get reloaded automatically.

#### ```Data Cache```
[default: enabled]

Account data is stored on your PC to prevent having to reload it every time you open Muledump.

#### ```Login Only```
[default: disabled]

Accounts set to login only will reload their data from ROTMG but not display in the window.

#### ```Export Deep Copy```
Download the account data stored on your browser for this account.

#### ```Copy to Clipboard```
Copy the account id to your clipboard.

### Mass Switch
All account settings can be mass enabled or disabled using the Mass Switch menu icon left of the Next Page button.

### Import Accounts.js
Upload an accounts.js and add any unknown accounts from it to the Accounts Manager.

### Export Accounts.js
Generates an accounts.js from your Muledump configuration
