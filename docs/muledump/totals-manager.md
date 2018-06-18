# Totals Management

[Totals Settings Manager](#tsm)

[Display Mode](#dm)

[Filter Options](#fo)

[Sorting Mode](#sm)

## <a href="#" id="tsm"></a>Totals Settings Manager

The Totals Settings Manager is a simple tool to allow you to manage the bulkier side of totals.

Many of these new features require that you be running Muledump SetupTools. This means you are not using an accounts.js file.

You can read a general overview about this at <a href="https://github.com/jakcodex/muledump/wiki/Totals" target="blank">Muledump Totals</a> in the wiki.

### Configuration Sets

Configuration sets allow you to create custom totals configurations that you can quickly switch between. Each list has its own item and account filters as well as its own settings for all available totals options.

Configuration sets that are favorited will appear in the Favorite Filters dropdown menu in the Totals Menu.

The Default configuration set does not save any changes made to it.

### Item Group Sorting

Click and drag item groups to sort their display order.

Shift+Click to toggle the item group's enabled status (enabled is highlighted).

Double Click to open the item group's subsorting menu to view and sort items in each group.

This feature is only used when Sorting Mode is set to Standard.

### Account Filter Members

When the Account Filter is active only accounts listed in the filter are displayed in totals.

Shift+Click the account to remove it. Removing all accounts disabled the filter.

### Permanently Hidden Items

Items in Muledump totals display can be permanently hidden by Shift+Clicking it in the display.

All hidden items can be seen here and selectively removed with another Shift+Click.

## <a href="#" id="dm"></a>Display Mode

By default, Muledump Totals will only display the items that are displayed on your mules.

Enabling Global Totals will display all matching items found over all enabled accounts.

## <a href="#" id="fo"></a>Filter Options

Muledump Totals supports a wide variety of configurable filters that you can use to determine what gets displayed.

### Standard Filters

Standard Filters are the original filters to come with Muledump. When enabled only items matching the enabled filter will be displayed.

There are available item filters for: Feed Power, Fame Bonus, Soulbound, Not Soulbound, UT, and ST items.

#### Feed Power Filter

The Feed Power filter will show only items whose feed power is greater than the value chosen.

Supported values are: >0, >100, >250, >500, >1000, >2500, Disabled

#### Fame Bonus Filter

The Fame Bonus filter will show only items whose fame bonus is greater than the value chosen.

Supported values are: >0%, >1%, >2%, >3%, >4%, >5%, Disabled

### Basic and Advanced Filters

Basic filters include all consumable, single-use, and other items in the game.

Advanced filters allow you more granular control over what gets displayed. There are categories for each weapon, ability, and armor type as well as rings.

### Account Filter

The Account Filter allows you to select one or more displayed accounts and show only items from those accounts in Totals.

Shift+Click on a mule to add and remove it from the Account Filter. Accounts in this filter will have a cyan border.

You can reset the Account Filter by opening the Totals Menu and choosing 'Reset Account Filter'.

### Disabled Account Filter

The Disabled Account Filter allows you to select one or more displayed accounts and disable them from being included in Totals.

Ctrl+Click on a mule to add or remove it from the Disabled Account Filter. Disabled accounts will be darkened.

### Hidden Item Filter

The Hidden Item Filter is a list of items that are not displayed at all in Totals. Any item on this list will be permanently hidden from display until it is removed.

## <a href="#" id="sm"></a>Sorting Mode

Muledump Totals can be set to sort in different modes.

#### Standard Mode

Items are sorted by Item Group and can be customized to meet your liking.

#### Alphabetical

Items are sorted alphabetically.

#### Fame Bonus

Items are sorted by fame bonus (highest to lowest).

#### Feed Power

Items are sorted by feed power (highest to lowest).
