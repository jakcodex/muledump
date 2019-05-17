# Muledump Vault Builder

Periodically the game's vault layout changes and you need to determine the new ID map. Or maybe you just want to make a custom vault layout.

The Vault Builder is a drag and drop vault layout editor. You can clone and modify existing layouts or create new layouts entirely from scratch. You can display only vaults you wish to see.

## Create Layout

### Name

Name of the vault layout; keep it short.

### Width

How many vaults per row?

### Rows

How many rows in the layout?

## Load Layout

Load an existing layout into the vault editor.

## Options

### Save

Save custom vault layout changes.

Note: Preconfigured vault layouts cannot be edited; instead, you should save them under a new name.

### Save as ...

Save custom layout changes to a new vault layout.

### Reset

Undo any changes to the opened layout.

### Rename ...

Rename the current vault layout.

Note: Preconfigured vault layouts cannot be renamed; instead, choose `Save as...`.

### Delete

Delete the current vault layout.

Note: Preconfigured vault layouts cannot be deleted.

### Duplicate

Create a duplicate of a chosen vault layout.

### Account View ...

Display vaults in editor as opened or closed based on the vault ownership of a specific account.

### Import / Export ...

Import or Export a backup of custom vault layouts.

## Show Empty Vaults

Show empty vaults when displaying in Muledump.

## Width Compression

Automatically compacts empty/closed vaults when displayed in Muledump.

## Import / Export

### Import

1. Select the zip file(s) containing the layout(s) you wish to import.
1. All detected layouts will be displayed with their name and layout ID
   * Preconfigured layouts in backups can be imported but you must set a new ID above 1000
   * Select the layouts you wish to import and adjust their layout IDs if desired
1. Layouts should now be available in the "Load Layout" menu.
1. Refresh Muledump to update Muledump Options menu with new layouts.

### Export

1. Select the layout(s) you wish to export.
1. Download the zip file.

