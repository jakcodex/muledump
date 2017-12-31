**2017-12-31** version 9.0.0

- Bug Fixes
  * Totals counting empty backpack data on chars with no backpacks (#79)
  * Deleted accounts were not being removed from client config (#83)
  * MP Pot div misaligned on wide Mules (#85)
  * Character lists not detecting and removing dead characters (#87)
  * Hover menus (options, export) close prematurely (#100)
  * Options throwing errors (#75, again)
  * Selecting items not including gift chest items (#109)

- New Features
  * Character skins and missing textiles added to portraits (#82) [tuvior]
  * Added active time to character sort options (#88)
  * Added maxed stats to character sort options (#95) [curlip] 
  * Feed power filter added to options for totals (#78)
  * Added ST, UT, and Soulbound filters (#97)
  * Totals display width now adjustable (#89)
  * Create images of Mules (#99)
  * Added Mule Menu button and context menu accessible from anywhere on a mule (#105)
  * Renders update assistant helps Muledump Local users update to latest renders

- Improvements
  * Added maxed stats to char description (#94) [curlip]
  * Muledump menu now always visible at top of window (#98) [curlip]
  * Added notices button for user information notification (#91)
  * Adding displaying Mule IGN to options (#101)
  * Added new vault layout 'Simple' (#76)
  * Version detection improved for Muledump Local users (#86)
  * Various styling changes (#92) [curlip]
  * Cleaned up dungeon portal names
  
- Added hash navigation for linking to Muledump SetupTools pages (#74)
- Added optional usage analytics (#90)
- Various other styling changes
- Renders updated to X20.1.0
- Added html2canvas v1.0.0-alpha.5

**2017-12-01** version 0.8.3.2

- Fixed an issue with totals not adding up properly

**2017-12-01** version 0.8.3.1

- Fixed an issue with loading and saving options
- Updated portrait sheet with a few missing dyes

**2017-11-30** version 0.8.3

- New Features
  * Added Wawawa option (#19)
  * Total living character hours active now displayed in Account Info (#67) 
  * XpBooster and Loot Drop / Tier info added (#56)

- Bug Fixes
  * Verify import data of custom options over default options (#64)
  * Options setting throwing errors (#75)
  * Empty vaults being displayed incorrectly as empty spaces (#77)
  * Gifts chests properly displayed in totals when vaults are disabled (#73)

- Improvements
  * Constants updated with bagType, soulbound, and st/ut data (#69)
  * Item tooltip replaced (#70)
  
- Renders updated to X.20.0
- Meta data added to account data cache (#68)
- Re-enabled text selection in About and CORS Assistant 
- Default Groups Manager Mode changed from Parallel to Serial
- Default Account Reload Days changed from 0 to 1 (conditional client config upgrade)
- Temporarily disabled the Account Reload Days master off setting

**2017-11-20** version 0.8.2

- New Features
  * [Groups Manager](docs/setuptools/groups-manager/index.md) account organization tool (#28)
  * Backup Assistant to remind user to download a backup (#50)
  * Login-Only mode gets daily login for account without displaying the Mule on-screen (#4)
  * Disable account data cache forcing a reload every time Muledump loads (#55)
  * Automatic reload can be enabled to periodically refresh account data (#60)

- Bug Fixes
  * Detect and warn on bad account data (#47)
  * Options menu not displaying correctly in Firefox on Windows (#49)
  * Exporting images should call renders from Muledump Online (#57)
  * Minor IsAgeVerified type issue fixed 

- Improvements
  * Accounts Manager rewritten with a nicer UI (#53)
  * Settings Manager reorganized (#54)
  * Backups Manager reorganized and backups can now be assigned custom names (#58)
  * Added options to erase all account data caches or all local storage data (#51)
  * Gift chests moved to own display block outside and below of vault display (#61)
  * Account info moved below account name
  * Adjusted accountLoadDelay automatic settings to speed requests up

- New Settings
  * accountsPerPage: How many accounts to display per page 
  * autoReloadDays: How old account data can be before getting reloaded automatically
  * groupsMergeMode: Which mode Groups Manager is operating in (off, parallel, or serial)
  * longpress: How long to wait for long left clicks
  
- Renders updated with latest sprites and cleaned up numerous low-quality or old icons
- Clipboard.js 1.7.1 added

**2017-11-06** version 0.8.1-8

- X18 renders/constants added (no tokens)

**2017-10-29** version 0.8.1-7

- Updated renders/constants (does not include Halloween update)
``
**2017-10-12** version 0.8.1-6

- Bug Fixes
  * Muledump: TOS, Migration, and Age Verification actions throwing errors (#42)
  
**2017-10-08** version 0.8.1-5

- Bug Fixes
  * Muledump: Empty vaults weren't always getting displayed (#30)
  * SetupTools: Accounts.js export incorrectly using the default settings instead of user settings (#26)
  * SetupTools: Mulelogin setting would not import correctly (#25)
  * SetupTools: Bypass mode would overwrite accounts.js settings with default settings (#36)
  * SetupTools: Disabling and re-enabling SetupTools overwrites settings imported from accounts.js (#37)
  * SetupTools: Date.getMonth() needs to be incremented before use (#44)
  
- Improvements
  * Muledump: Allow user to choose where to display menu (left, center, right) (#45) 
  * Muledump: Display a problem assistant page for users experiencing network or cors issues (#34)
  * MuleQueue: Automatically resume a queue after rate limiting expires (#41)
  * Muledump Online: Update check replaced with a new version alert (#29)
  
- Updated vaults to new 100-vault layout (#40)
- Options loading moved into SetupTools main execution to enable modifying before display (#32)
- SetupTools can no longer be disabled in the Settings Manager for Muledump Online users (#38)
- Minor updates to lib/pcstats.js
- Dev docs written for SetupTools (#35)
- Added a vendor licenses file
- Muledump Online [Preview Release](https://jakcodex.github.io/muledump-preview/) demos upcoming changes to Muledump before they're released (#39)

**2017-09-28** version 0.8.0-9

Release: 0.8.0

- New feature: [SetupTools](docs/setuptools/index.md) browser-based Muledump configuration and management
  * Accounts Manager for easy configuration of accounts, disable/enable accounts, import accounts.js
  * Backups Manager for backing up and restoring Muledump configurations rapidly
  * Settings Manager for controlling all Muledump settings (including options previously found in accounts.js)
  * Deep Copy Backups of ROTMG account XML data in JSON format
  
- New feature: [Muledump Online](https://jakcodex.github.io/muledump/muledump) loads Muledump to your PC without needing to download and maintain your own install
  * Muledump still runs locally on your computer and does not transmit your data anywhere other than to Deca servers
  
- New feature: Character Sorting by id, base fame, total fame, base exp, class, and custom named lists

- MuleQueue Improvements
  * Pause, resume, and cancel task queues
  * Encountering rate limiting now pauses tasks instead of cancelling
  
- Accounts.js no longer required to run Muledump (see SetupTools)
- Account email returned to its own field (separated from Account Info)
- accountLoadDelay will now determine a best value based on accounts quantity if set to 0
- CORS Extension guidelines added for Firefox, Safari, and Opera
- Updated renders (thanks [/u/wawawa](https://github.com/wawawawawawawa))
- Default enabled options changed up a bit
- Jakcodex/Muledump original source code now distributed under open source BSD License 2.0

**2017-09-08** version 0.7.6

- X17.0.0 updates added (thanks to [/u/Falecon](https://www.reddit.com/user/Falecon))

**2017-09-07** version 0.7.5

- Export to Imgur, CSV, JSON, and text fixed, and added local save option
- VAULTORDER array restructured to support multiple layouts and moved to lib/staticvars.js
- Complete vault layout in full and compact views now available (default: compact)
- Options menu updated to support switching between layouts
- Adding custom vault layouts will automatically update the options menu
- Updated lib/pcstats.js (thanks to [/u/TheSTDman](https://github.com/thestdman/muledump))
- MuleQueue now exits on rate limit detection after alerting the user
- Account reloading disabled for 5 minutes after rate limit detection to prevent resetting the Deca timeout
- Active MuleQueue now provides a 'cancel reload' button
- Email option changed to Account Info and now includes account gold, fame, and gift item count
- Automatic update checking added on startup with option to disable
- Update button changed to use new version checking tool
- Changing options no longer reloads account data
- Non-web users no longer displayed as being unverified
- Debug logging switch moved to global options
- JQuery updated to 3.2.1
- Masonry updated to 4.2.0
- Featherlight 1.7.2 added

**2017-08-29** version 0.7.4

- Vault chests null data bug fixed
- Gift chests empty bug fixed
- Updated recommended CORS settings 

**2017-08-25** version 0.7.3

- Fixed bug in mule localStorage throwing errors when loading chests
- Updated home button

**2017-08-23** version 0.7.2

- RealmApi errors now understood and reported properly (rate limiting, banned, etc)
- Enable Debugging button added which toggles displaying a tech report (with usernames, passwords, etc removed)
- Sha256 library added

**2017-08-23** version 0.7.1

- Loading multiple accounts now slowed down to try and avoid Deca rate limiting
- Updated pseudo-yql response to include created,updated keys
- Version check now uses jakcodex/muledump repo

**2017-08-20** version 0.7.0

- X16.0.0 items
- Yahoo YQL removed due to Deca blocking
- Requires Chrome extension to get around CORS (not ideal, I know)

**2016-10-16** version 0.6.7

- 27.7.X6 items

**2016-08-31** version 0.6.6

- 27.7.X3 items

**2016-07-25** version 0.6.5

- 27.7.DECA (1469395332) items
- combined stat display (base/max) by [JohnBlackburne](https://github.com/JohnBlackburne)

**2015-11-03** version 0.6.4

- [Kabam.com support](https://github.com/atomizer/muledump/wiki/Kabam-tutorial) (thanks to Zaltais333)
- consumable sorting fixes

**2015-09-22** version 0.6.3

- consumables are now sorted by type (thanks to Pfiffel & Nightfirecat)
- further improvements to the one-click login script (thanks to Nightfirecat)
- [Steam support](https://github.com/atomizer/muledump/wiki/Steam-Tutorial)
- a new item??? (27.7.0)

**2015-04-25** version 0.6.2

- one-click login now writes to both possible locations of the flash cookie
- fixed display of the one-click login links

**2015-02-22** version 0.6.1

- 27.3.1 items
- show all errors at the top of the page (as before)

**2015-01-27** version 0.6.0

- automated migration
- better user experience when mass-reloading
- hopefully will show more info in case of errors

**2015-01-18** version 0.5.1

- fixed cache not updating

**2015-01-17** version 0.5.0

- 27.3.0 items
- proper "migration required" warning
- automated ToS accept and age verification
- fixed PNG export (imgur)
- internal: moved stuff around, might break things
- internal: updated jquery

**2014-10-22** version 0.4.26

- 25.0 items

**2014-09-22** version 0.4.25

- 23.2 items

**2014-07-01** version 0.4.24

- 22.3 items
- one-click login script fix for latest version of AutoIt ([Nightfirecat](https://github.com/Nightfirecat))

**2014-06-09** version 0.4.22

- 21.4 items

really sorry for lack of updates recently :/


**2014-03-24** version 0.4.21

- 19.5 items

**2014-03-01** version 0.4.20

- gift chests option
- artemis skin

**2014-02-21** version 0.4.19

- 19.2 items

**2013-12-19** version 0.4.18

- 19.0 items

**2013-12-13** version 0.4.17

- 18.0 items, small ring positioning tweaks

**2013-09-14** version 0.4.16

- 16.4 items (in advance)
- gift chests ([Nightfirecat](https://github.com/Nightfirecat))
- more tolerant to corrupt char data (zub)
- disabled price lookup since the forums are dead
- email not verified warning

**2013-08-28** version 0.4.15

- 16.0 items
- 16.0 vault chest order ([Nightfirecat](https://github.com/Nightfirecat))
- display characters always in same order ([Nightfirecat](https://github.com/Nightfirecat))
- added `rowlength` variable to accounts.js
- better handling of unknown items (separate counters, item id in hex)
- use DarkDaemon's price guide ([aiedail92](https://github.com/aiedail92))
- updated JQuery and masonry
- more attempts to fix masonry-related rendering bugs

**2013-08-01** version 0.4.14

- 15.0 items
- hp/mp pot counters ([SlugKing](https://github.com/SlugKing), [Nightfirecat](https://github.com/Nightfirecat))
- feed power in tooltips
- copyright and license notes

**2013-03-31** version 0.4.13

- 12.1 items

**2013-02-08** version 0.4.12

- 11.0 items

**2013-01-22** version 0.4.11

- 9.0 items

**2012-12-12** version 0.4.10

- 7.0 items
- changed price guide to MustafaD (pull request by [avoxgames](https://github.com/avoxgames))

**2012-11-16** version 0.4.9

- 5.0 items
- added backpacks
- fixed ninja equips position in totals

**2012-11-2** version 0.4.8

- 4.0 items
- item names and tiers now match the in-game tooltips (except dosed items like elixirs)
- fixed char description sometimes spanning more lines than it should

**2012-10-25** version 0.4.7

- 3.1 items
- made achievement progress and additional stats options independent of each other

**2012-10-11** version 0.4.6

- ninja equipment fame bonuses
- fixed star color calculation

**2012-10-05** version 0.4.5

- ninja, 124.0 items

**2012-09-25** version 0.4.4

- new accounts.js option: "nomasonry" - set to 1 to turn off smart layout
- fixed some problems with per-account menus
- ctrl-click on name toggles the account in the totals

**2012-09-16** version 0.4.3

- authentic character portraits
- fixed long names breaking the box

**2012-09-04** version 0.4.1

- 123.5.0 items

**2012-08-25** version 0.4

- 123.4.4 items
- ability to set options for each account individually - click account name for menu (intended use: keep global options to items only and expand the good accounts as needed)
- added achievement progress calculation (thanks to Pfiffel, even though I didnt use your code)
- vault chests are now in their in-game order (thanks to Hals for assistance)
- improved page load time
- added redirect to Kable's video

**2012-08-05** version 0.3.2

- 123.4.1 items
- reduced probability of duplicate error messages

**2012-07-04** version 0.3.1

- 123.3.2 items
- fixed price guide url
- fixed some visual glitches

**2012-06-13** version 0.3: collaboration edition

- 123.3 stats
- export to TXT, CSV, JSON, PNG
- accuracy and god kill ratio
- fixed "sticky" options bug
- new reload symbol
- optional: one-click login -- by [FizzeBu](http://forums.wildshadow.com/user/24488); more info above
- optional: display prices from Kazansky -- by [aiedail92](https://github.com/aiedail92); more info above

**2012-05-08**

version 0.2.3

- fixed star counter
- better Opera compatibility
- various performance optimizations
- update checking is now on-demand

**2012-05-06** version 0.2.2

- stars
- automatic update checker

**2012-05-02** version 0.2.1

- fixed some visual bugs and edge cases introduced in previous update
- back to old method of issuing requests (slow but more stable)
- you can make options to stay open by clicking
- moved additional stats to the bottom
- updated JQuery

**2012-04-29** version 0.2

- using JQuery Masonry plugin to lay out the accounts
- multi-column layout for accounts with several characters / vault chests
- options are now in a hover-menu
- mules are always in the same order
- faster loading
- corrected some problems with totals
- toggle a mule in totals by clicking on account name
- filter by any amount of fame bonus
- fixed bugs with item search, tweaked selected item style
- favicon by BMJ

**2012-04-01**

- build 122.3.2
- fixed incorrect "Well Equipped" calculation with amulet on

**2012-03-20**

- items preemptively updated for build 122.2 (123?)
- new feature - extended character stats and death screen emulation
- rough control to hide "bad" items (currently everything 1% fame or less, controlled by var FAMETHRESHOLD in the main script)
- made stats copypaste-friendlyish by using `<table>`

**2012-02-14**

- items as of build 122.0.1
- "left to max" shows both points and potions for HP/MP

**2012-01-10**

- added new items from build 121
- now you can switch to testing by adding line "`testing = 1`" at the begginning or end of your `accounts.js` file

**2011-11-28**

Updated with the 4 new items (tomb rings and key).

**2011-11-22**

A bunch of bug fixes, thanks joshd19 and Mcbeth for calling my attention to them!

- hopefully fixed errors on unexpected input
- fixed empty vault being empty
- fixed "only first char" regression
- fixed roll calculations for non-lvl20
- added min-width to prevent the boxes from collapsing

**2011-11-15**

- colored distances from average
- option to hide all items (gorzerk-mode)
- names/emails --> emails
- "left to max" now shows amount of potions (thanks zxcv)

**2011-11-12**

Added options to toggle totals, names/emails, only first char.
Also, in Firefox 8 localStorage bug is fixed, so cache will work there too.

**2011-11-1**

- added ability to hide equipped items
- extended stats with roll checks and distances from max
- added options on the right since there are too many of them now
- added tiers in tooltips
- fixed spell vertical position (same as rings, in-game they're shifted 1/2 "pixel" from the "grid"; tell me if you catch more inconsistences in rendering)
- added comments in the sample file since some people had trouble editing it
- switched to local copy of jquery for true offline to be possible
