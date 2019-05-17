# Error Codes and Messages

> This page is very outdated

## Code Usage Errors
These errors should only be present during development and are meant to aid in debugging. Appears of these error codes in production should be considered a serious bug.

#### Error 1 - Global
Browser does not support local storage

#### Error 2 - setuptools.lightbox.create
Invalid Featherlight configuration provided

#### Error 3 - setuptools.lightbox.display
The specified lightbox build ID was not located.

#### Error 4 - setuptools.app.config.convert
Invalid or missing arguments

#### Error 5 - setuptools.app.config.convert
Specified conversion format does not exist

#### Error 6 - setuptools.app.config.convert
Provided configuration cannot be converted to the requested format

#### Error 7 - setuptools.app.config.convert
Provided configuration format could not be determined
       
#### Error 8 - setuptools.app.config.create
Provided configuration format does not match the required format
       
#### Error 9 - setuptools.app.config.create
Provided configuration format does not exist
       
#### Error 10 - setuptools.lightbox.goback
Invalid or missing arguments
        
#### Error 11 - setuptools.lightbox.drawhelp
Invalid or missing arguments

#### Error 12 - setuptools.app.config.createUser
Specified format does not match account data format

#### Error 13 - setuptools.app.config.createUser
Specified conversion format does not exist

#### Error 14 - setuptools.app.config.userExists
Could not determine format of account data

#### Error 15 - setuptools.app.backups.protect
Arguments missing from call

#### Error 16 - setuptools.app.backups.protect
Could not find a backup matching the supplied BackupID

#### Error 17 - setuptools.app.backups.delete
Arguments missing from call

#### Error 18 - setuptools.app.backups.*
Supplied BackupID did not begin with the prefix muledump-backup-

#### Error 19 - setuptools.app.backups.restore
Arguments missing from call

#### Error 20 - setuptools.app.backups.restore
RestoreMethod supplied was invalid (accepts: local, upload)

#### Error 21 - setuptools.app.backups.restore
Failed to read localStorage with the supplied BackupID

#### Error 22 - setuptools.app.backups.restore
Backup data located in localStorage is not in valid JSON format 

#### Error 23 - setuptools.app.backups.restore
Failed to upload backup to program due to FileReader error

#### Error 24 - setuptools.app.config.settings
Located setting on page does not exist in the configuration structure

#### Error 25 - setuptools.app.muledump.chsortcustom
No mule object was provided

#### Error 26 - setuptools.app.config.listUsers
Users who have not migrated to SetupTools configuration cannot utilize this feature

#### Error 27 - setuptools.app.groups.delete
Required argument groupName was invalid

#### Error 28 - setuptools.app.groups.manager
Supplied groupName does not exist in client configuration or was an invalid name
