//  support displaying gift chests in the correct order; we'll mimick vaultorders just in case
//  not currently used, but here for reference for the time being
var giftorders = [
    //  giftlayout=0; default view
    {
        layoutname: "Default",
        vaultwidth: 5,
        vaultorder:
            [
                4,  2,  1,  3,  5,
                9,  7,  6,  8,  10,
                14, 12, 11, 13, 15,
                19, 17, 16, 18, 20,
                24, 22, 21, 23, 25,
                29, 27, 25, 28, 30
            ]
    }
];

//  predefined vault layouts
//  see https://github.com/jakcodex/muledump/wiki/Vault+Builder for usage information and warnings
var vaultorders = [
    //  vaultlayout=0; compact view
    {
        layoutname: "Compact",
        vaultshowempty: false,
        vaultcompressed: true,
        vaultwidth: 9,
        vaultorder:
            [
                0,  0, 94, 88, 83, 89, 95,  0,  0,
                0,  0, 77, 70, 66, 71, 78,  0,  0,
                0,  0, 58, 53, 49, 54, 59,  0,  0,
                0,  0, 41, 36, 31, 37, 42,  0,  0,
                0,  0, 26, 21, 17, 22, 27,  0,  0,
                0,  0, 14, 12, 11, 13, 15,  0,  0,
                0,  0,  9,  6,  4,  7, 10,  0,  0,
                0,  0,  5,  2,  1,  3,  8,  0,  0,
                0,  0,  0,  0,  0,  0,  0,  0,  0,
                0,  127,115,103,85, 68, 51, 34, 19,
                0,  125,113,101,82, 65, 48, 29, 16,
                137,128,116,104,86, 69, 52, 35, 20,
                139,131,119,107,93, 76, 57, 40, 25,
                0,  133,121,109,97, 80, 63, 46, 30,
                0,  135,123,111,99, 87, 74, 61, 44,
                0,  0,  0,  0,  0,  0,  0,  0,  0,
                23, 38, 55, 72, 91, 105,118,130,0,
                18, 33, 50, 67, 84, 102,114,126,0,
                24, 39, 56, 73, 92, 106,117,129,138,
                28, 43, 60, 79, 96, 108,120,132,140,
                32, 47, 64, 81, 98, 110,122,134,0,
                45, 62, 75, 90, 100,112,124,136,0
            ]
    },
    //  vaultlayout=1; full view
    {
        layoutname: "Full",
        vaultshowempty: false,
        vaultcompressed: true,
        vaultwidth: 19,
        vaultorder:
            [
                0,     0,   0,  0,   0,  0,  0, 94,  88, 83, 89, 95,  0,  0,  0,  0,    0,   0,   0,
                0,     0,   0,  0,   0,  0,  0, 77,  70, 66, 71, 78,  0,  0,  0,  0,    0,   0,   0,
                0,     0,   0,  0,   0,  0,  0, 58,  53, 49, 54, 59,  0,  0,  0,  0,    0,   0,   0,
                0,     0,   0,  0,   0,  0,  0, 41,  36, 31, 37, 42,  0,  0,  0,  0,    0,   0,   0,
                0,     0,   0,  0,   0,  0,  0, 26,  21, 17, 22, 27,  0,  0,  0,  0,    0,   0,   0,
                0,     0,   0,  0,   0,  0,  0, 14,  12, 11, 13, 15,  0,  0,  0,  0,    0,   0,   0,
                0,     0,   0,  0,   0,  0,  0,  9,   6,  4,  7, 10,  0,  0,  0,  0,    0,   0,   0,
                0,     0,   0,  0,   0,  0,  0,  5,   2,  1,  3,  8,  0,  0,  0,  0,    0,   0,   0,
                0,   127,  115, 103, 85, 68, 51, 34, 19,  0, 23, 38, 55, 72, 91, 105, 118, 130,   0,
                0,   125,  113, 101, 82, 65, 48, 29, 16,  0, 18, 33, 50, 67, 84, 102, 114, 126,   0,
                137, 128,  116, 104, 86, 69, 52, 35, 20,  0, 24, 39, 56, 73, 92, 106, 117, 129, 138,
                139, 131,  119, 107, 93, 76, 57, 40, 25,  0, 28, 43, 60, 79, 96, 108, 120, 132, 140,
                0,   133,  121, 109, 97, 80, 63, 46, 30,  0, 32, 47, 64, 81, 98, 110, 122, 134,   0,
                0,   135,  123, 111, 99, 87, 74, 61, 44,  0, 45, 62, 75, 90, 100,112, 124, 136,   0
            ]

    },
    //  vaultlayout=2; full view, wide
    {
        layoutname: "Wide",
        vaultshowempty: false,
        vaultcompressed: true,
        vaultwidth: 23,
        vaultorder:
            [
                0,   0,     0,   0,  0,  0,  0,  0,  0, 94, 88, 83, 89, 95, 0,  0,  0,  0,   0,   0,   0,   0,   0,
                0,   0,     0,   0,  0,  0,  0,  0,  0, 77, 70, 66, 71, 78, 0,  0,  0,  0,   0,   0,   0,   0,   0,
                0,   0,     0,   0,  0,  0,  0,  0,  0, 58, 53, 49, 54, 59, 0,  0,  0,  0,   0,   0,   0,   0,   0,
                0,   0,     0,   0,  0,  0,  0,  0,  0, 41, 36, 31, 37, 42, 0,  0,  0,  0,   0,   0,   0,   0,   0,
                0,   0,     0,   0,  0,  0,  0,  0,  0, 26, 21, 17, 22, 27, 0,  0,  0,  0,   0,   0,   0,   0,   0,
                0,   0,     0,   0,  0,  0,  0,  0,  0, 14, 12, 11, 13, 15, 0,  0,  0,  0,   0,   0,   0,   0,   0,
                0,   0,     0,   0,  0,  0,  0,  0,  0,  9,  6,  4,  7, 10, 0,  0,  0,  0,   0,   0,   0,   0,   0,
                0,   0,     0,   0,  0,  0,  0,  0,  0,  5,  2,  1,  3,  8, 0,  0,  0,  0,   0,   0,   0,   0,   0,
                0,   127, 115, 103, 85, 68, 51, 34, 19,  0,  0,  0,  0,  0, 23, 38, 55, 72, 91, 105, 118, 130,   0,
                0,   125, 113, 101, 82, 65, 48, 29, 16,  0,  0,  0,  0,  0, 18, 33, 50, 67, 84, 102, 114, 126,   0,
                137, 128, 116, 104, 86, 69, 52, 35, 20,  0,  0,  0,  0,  0, 24, 39, 56, 73, 92, 106, 117, 129, 138,
                139, 131, 119, 107, 93, 76, 57, 40, 25,  0,  0,  0,  0,  0, 28, 43, 60, 79, 96, 108, 120, 132, 140,
                0,   133, 121, 109, 97, 80, 63, 46, 30,  0,  0,  0,  0,  0, 32, 47, 64, 81, 98, 110, 122, 134,   0,
                0,   135, 123, 111, 99, 87, 74, 61, 44,  0,  0,  0,  0,  0, 45, 62, 75, 90, 100,112, 124, 136,   0
            ]
    },
    //  vaultlayout=3; simple view
    {
        layoutname: "Simple",
        vaultshowempty: false,
        vaultcompressed: true,
        vaultwidth: 5,
        vaultorder: []
    }
];

//  populate simple view vaultorder
for ( var i = 1; i <= 140; i++ ) vaultorders[3].vaultorder.push(i);

//  used for rate limiting management
var RateLimitExpiration = '';
try {
    RateLimitExpiration = localStorage['muledump:ratelimitexpiration']
} catch(e) {}
if ( !RateLimitExpiration ) RateLimitExpiration = 0;

var RateLimitTimer = false;

//  optional value; can be a url or base64 image source; if omitted, master/lib/renders.png is used from Github
//  note: I'm choosing to use the Github URL instead of a base64 string here because renders.png is huuuuuuuge in base64
//  var RemoteRendersURL = "";
