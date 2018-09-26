# White Bag Tracker

Welcome to the White Bag Tracker! This tool is designed to let you keep track of your white bags with several different ways to go about the task.

In the Totals mode, the White Bag Tracker shows your owned white bags and a quantity. You can change the quantity if desired to set the data however you want.

In the Owned mode, the White Bag Tracker shows your owned skins without the quantity.

#### Notice

Importing white bag counts should be done with Custom Character Sorting Lists turned off unless you want to import the white bag data from just those characters.

## UI Usage

[Actions](#act)

[Exporter](#exp)

[Controls](#ctrl)

## <a href="#" id="act"></a>Actions

### Enable / Disable Totals

Whether to be in Totals or Owned Mode.

### Save

Save current changes immediately. An auto-save occurs when closing the white bag tracker.

### Clear

Erases all White Bag Tracker data. This implies a save and cannot be undone.

### Import

Import White Bag Tracker data by scanning the account's inventory.

#### Import Modes

##### Keep Existing Data
The discovered white bags in inventory are added to the existing counters.

##### Reset Counters
Counters are reset to zero while owned white bag data remains before importing.

##### Reset Counters and Owned
Counters and owned white bag data is reset before importing.

### Reset

Undoes any recent changes since the last save.

### Cancel

Closes the UI and skips the auto save.

## <a href="#" id="exp"></a>Exporter

A modified version of the Totals Export, it supports the same output formats.

## <a href="#" id="ctrl"></a>Controls

### Totals Mode

1. Shift+Click on an unowned item or item of zero quantity to add or remove it from the owned list.
1. Click on an item to increase its value by 1. Automatically adds new items to owned list.
1. Ctrl+Click on an item to decrease its value by 1.

### Owned Mode

1. Shift+Click on an item to add or remove it from the owned list.
