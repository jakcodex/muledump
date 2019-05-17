/*
//
//  Muledump Client Configuration Master Config Template
//      
//  1. This file is intended to be used by Muledump configurations that make use of an accounts.js file.
//  2. Copy the desired contents into the bottom of your accounts.js file.
//  3. Remove the // before each setting you wish to enable or provide a list with only desired settings.
//  4. Be aware that the settings offered here may change with new releases.
//  5. Custom Character Sorting and Totals ConfigSets can be set in the config but cannot presently be edited in the UI.
//
//  The client configuration key reference can be found here:
//  https://jakcodex.github.io/muledump/docs/setuptools/dev/setuptools-object-ref#clientconfigkeys
//
*/

/*
//  Required to enable feature
*/
userConfiguration.enabled = true;

/*
//  SetupTools Client Configuration
*/
userConfiguration.config = {
//      "accountAssistant": 1,
//      "accountLoadDelay": 0,
//      "accountsPerPage": 10,
//      "alertNewVersion": 1,
//      "animations": 1,
//      "autocomplete": true,
//      "autoReloadDays": 1,
//      "badaccounts": -1,
//      "compression": false,
//      "corsAssistant": 1,
//      "debugging": true,
//      "equipSilhouettes": true,
//      "exportDefault": 4,
//      "errors": true,
//      "ga": true,
//      "gaErrors": true,
//      "gaOptions": true,
//      "gaPing": true,
//      "gaTotals": true,
//      "giftChestWidth": 0,
//      "groupsMergeMode": 2,
//      "hideHeaderText": false,
//      "keyBindings": 0,
//      "lazySave": 10000,
//      "longpress": 1000,
//      "lowStorageSpace": true,
//      "menuPosition": 2,
//      "mulelogin": 0,
//      "muleloginCopyLinks": 0,
//      "muleMenu": true,
//      "nomasonry": 0,
//      "pagesearch": 2,
//      "preventAutoDownload": true,
//      "recordConsole": 2000,
//      "recordConsoleTtl": 10000,
//      "rowlength": 7,
//      "timesync": false,
//      "tooltip": 500,
//      "tooltipClothing": 1,
//      "tooltipItems": 1,
//      "tooltipXPBoost": 1,
//      "totalsExportWidth": 0,
//      "totalswidth": 0,
//      "vaultbuilderAccountViewLimit": 10,
//      "wbTotals": true
};

/*
//  Muledump Custom Character Sorting Configuration
*/
userConfiguration.muledump.chsortcustom = {
//    "sort": -1,
//    "disabledmode": false,
//    "accounts": {
//        "myemail@gmail.com": {
//            "active": "My favorite list",
//            "data": {
//                "My self-named list 1": [1, 4, 5],
//                "Some different list name": [44, 90, 300, 2],
//                "My favorite list": [900, 339, 22]
//            }
//        }
//    }
};

/*
//  Totals Configuration Sets
*/
userConfiguration.muledump.totals.configSets = {
//    "active": "My set name",
//    "favorites": ["Default", "My set name"],  //  don't remove Default unless you're never using it again
//    "settings": {
//        "My set name": {
//          "totalsGlobal": false,
//          "famefilter": false,
//          "fameamount": "-1",
//          "feedfilter": false,
//          "feedpower": "-1",
//          "sbfilter": false,
//          "nonsbfilter": false,
//          "utfilter": false,
//          "stfilter": false,
//          "disabled": [],  //  account guids in a list (e.g. ["email1@gmail.com", "steamworks:23094839483948", "otheremail@blah.com"])
//          "totalsFilter-empty": true,
//          "totalsFilter-swords": true,
//          "totalsFilter-daggers": true,
//          "totalsFilter-bows": true,
//          "totalsFilter-tomes": true,
//          "totalsFilter-shields": true,
//          "totalsFilter-lightarmor": true,
//          "totalsFilter-heavyarmor": true,
//          "totalsFilter-wands": true,
//          "totalsFilter-rings": true,
//          "totalsFilter-potions": true,
//          "totalsFilter-potionssb": true,
//          "totalsFilter-candies": true,
//          "totalsFilter-portkeys": true,
//          "totalsFilter-textiles": true,
//          "totalsFilter-skins": true,
//          "totalsFilter-petstones": true,
//          "totalsFilter-finespirits": true,
//          "totalsFilter-testing": true,
//          "totalsFilter-keys": true,
//          "totalsFilter-helpfulconsumables": true,
//          "totalsFilter-unlockers": true,
//          "totalsFilter-eventitems": true,
//          "totalsFilter-marks": true,
//          "totalsFilter-tarot": true,
//          "totalsFilter-treasures": true,
//          "totalsFilter-assistants": true,
//          "totalsFilter-petfood": true,
//          "totalsFilter-other": true,
//          "totalsFilter-spells": true,
//          "totalsFilter-seals": true,
//          "totalsFilter-cloaks": true,
//          "totalsFilter-robes": true,
//          "totalsFilter-quivers": true,
//          "totalsFilter-helms": true,
//          "totalsFilter-staves": true,
//          "totalsFilter-poisons": true,
//          "totalsFilter-skulls": true,
//          "totalsFilter-traps": true,
//          "totalsFilter-orbs": true,
//          "totalsFilter-prisms": true,
//          "totalsFilter-scepters": true,
//          "totalsFilter-katanas": true,
//          "totalsFilter-stars": true,
//          "totalsFilter-eggs": true,
//          "accountFilter": [],  //  account guids in a list (e.g. ["email1@gmail.com", "steamworks:23094839483948", "otheremail@blah.com"])
//          "slotOrder": [],  //  see lib/slotmap.js for a list of item groups and their virtualSlotType; skipping this setting uses default sorting order
//          "itemFilter": [],  //  item ids in a comma-separated list
//          "slotSubOrder": {},  //  honestly don't bother attempting this one for now; if you want to the format is {"vst1": [itemid, itemid, itemid], "vst2": [itemid, itemid, itemid]} for each vst you wish to suborder.
//          "sortingMode": "fb"  //  possibilities are: standard, alphabetical, fb, fp, items
//        }
//    }
};
