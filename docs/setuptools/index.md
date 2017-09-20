# Muledump SetupTools

Muledump SetupTools is designed to make management and usage of Muledump easy on all users from small the very large. At its very basic, SetupTools will guide you through a quick setup of Muledump and get you working without ever needing to touch a config file. It requires no prior knowledge of code structure or concepts.

For new users this means a quick and easy setup of Muledump. For returning users it means restoring all account data, options, and settings with only a few clicks.

## Basic Setup and Usage

#### New Users - First Time Setup

Open ```muledump.html``` and you will be presented with the first time user guide. It will take care of the legwork of getting you up and running.

#### Existing Users - Convert to SetupTools

If you are an existing Muledump user prior to version 0.8, SetupTools is disabled by default when it detects a new user with an accounts.js file. This is because SetupTools is meant to be as minimally invasive as possible.
 
Luckily, enabling SetupTools is easy! Click the ```setup``` button in Muledump to get started.

SetupTools can import your existing or uploaded accounts.js file or restore a backup stored in your browser or on your computer.

## Features

### [Accounts Manager](help/accounts-manager/index)

A very simple interface for rapidly adding and removing ROTMG user accounts from Muledump.

Accounts and [account groups](help/accounts-manager/groups) can be enabled or disabled individually.

Multiple accounts.js files can be imported merging your configurations into one.

Account email addresses and user accounts for Steam, Kongregate, and Kabam are all validated with bad entries removed rather than causing errors.

### [Backups Manager](help/backups-manager/index)

Create, download, and restore backups of your Muledump configuration including all accounts, options, and settings.

Automatic daily backups keep a snapshot of your configuration so you don't need to.

Restoring a backup takes seconds whether its stored in your browser or uploaded to Muledump.

Backup retention policy prevents excessive storage from being used.

Backups can be protected so they cannot be deleted or count towards storage usage.

Deep Copy Backups provide you with your full accounts XML data (in JSON format).

### [Settings Manager](help/settings-manager)

All Muledump settings are manageable in the user interface.

## [Documentation](help/index)
SetupTools is [fully documented](help/index) with many help pages discussing the various menus available. Help screens are available on each page in Muledump SetupTools.

## Uninstalling SetupTools

If you don't like SetupTools and just want to go back to your accounts.js file, click 'Erase Configuration' in Settings Manager.


