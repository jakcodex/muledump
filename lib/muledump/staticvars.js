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

//  support switching between multiple vault layouts
var vaultorders = [
    //  vaultlayout=0; compact view
    {
        layoutname: "Compact",
        vaultwidth: 9,
        vaultorder:
            [
                  0,   0,  26, 21, 17, 22, 27,    0,   0,
                  0,   0,  14, 12, 11, 13, 15,    0,   0,
                  0,   0,   9,  6,  4,  7, 10,    0,   0,
                  0,   0,   5,  2,  1,  3,  8,    0,   0,
                  0,   0,   0,  0,  0,  0,  0,    0,   0,
                  0, 107,  95, 83, 69, 57, 45,   33,  19,
                  0, 105,  93, 81, 67, 55, 43,   29,  16,
                117, 108,  96, 84, 70, 58, 46,   34,  20,
                119, 111,  99, 87, 75, 63, 49,   37,  25,
                  0, 113, 101, 89, 77, 65, 53,   41,  30,
                  0, 115, 103, 91, 79, 71, 61,   51,  39,
                  0,   0,   0,  0,  0,  0,  0,    0,   0,
                 23,  35,  48, 59, 73, 85, 97,  110,   0,
                 18,  32,  44, 56, 68, 82, 94,  106,   0,
                 24,  36,  47, 60, 74, 86, 98,  109, 118,
                 28,  38,  50, 64, 76, 88, 100, 112, 120,
                 31,  42,  54, 66, 78, 90, 102, 114,   0,
                 40,  52,  62, 72, 80, 92, 104, 116,   0
            ]
    },
    //  vaultlayout=1; full view
    {
        layoutname: "Full",
        vaultwidth: 19,
        vaultorder:
            [
                0,     0,   0,  0,  0,  0,  0, 26, 21, 17, 22, 27,  0,  0,  0,  0,   0,   0,   0,
                0,     0,   0,  0,  0,  0,  0, 14, 12, 11, 13, 15,  0,  0,  0,  0,   0,   0,   0,
                0,     0,   0,  0,  0,  0,  0,  9,  6,  4,  7, 10,  0,  0,  0,  0,   0,   0,   0,
                0,     0,   0,  0,  0,  0,  0,  5,  2,  1,  3,  8,  0,  0,  0,  0,   0,   0,   0,
                0,   107,  95, 83, 69, 57, 45, 33, 19,  0, 23, 35, 48, 59, 73, 85,  97, 110,   0,
                0,   105,  93, 81, 67, 55, 43, 29, 16,  0, 18, 32, 44, 56, 68, 82,  94, 106,   0,
                117, 108,  96, 84, 70, 58, 46, 34, 20,  0, 24, 36, 47, 60, 74, 86,  98, 109, 118,
                119, 111,  99, 87, 75, 63, 49, 37, 25,  0, 28, 38, 50, 64, 76, 88, 100, 112, 120,
                0,   113, 101, 89, 77, 65, 53, 41, 30,  0, 31, 42, 54, 66, 78, 90, 102, 114,   0,
                0,   115, 103, 91, 79, 71, 61, 51, 39,  0, 40, 52, 62, 72, 80, 92, 104, 116,   0
            ]

    },
    //  vaultlayout=2; full view, wide
    {
        layoutname: "Wide",
        vaultwidth: 23,
        vaultorder:
            [
                0,     0,   0,  0,  0,  0,  0,  0,  0, 26, 21, 17, 22, 27,  0,  0,  0,  0,  0,  0,   0,   0,   0,
                0,     0,   0,  0,  0,  0,  0,  0,  0, 14, 12, 11, 13, 15,  0,  0,  0,  0,  0,  0,   0,   0,   0,
                0,     0,   0,  0,  0,  0,  0,  0,  0,  9,  6,  4,  7, 10,  0,  0,  0,  0,  0,  0,   0,   0,   0,
                0,     0,   0,  0,  0,  0,  0,  0,  0,  5,  2,  1,  3,  8,  0,  0,  0,  0,  0,  0,   0,   0,   0,
                0,   107,  95, 83, 69, 57, 45, 33, 19,  0,  0,  0,  0,  0, 23, 35, 48, 59, 73, 85,  97, 110,   0,
                0,   105,  93, 81, 67, 55, 43, 29, 16,  0,  0,  0,  0,  0, 18, 32, 44, 56, 68, 82,  94, 106,   0,
                117, 108,  96, 84, 70, 58, 46, 34, 20,  0,  0,  0,  0,  0, 24, 36, 47, 60, 74, 86,  98, 109, 118,
                119, 111,  99, 87, 75, 63, 49, 37, 25,  0,  0,  0,  0,  0, 28, 38, 50, 64, 76, 88, 100, 112, 120,
                0,   113, 101, 89, 77, 65, 53, 41, 30,  0,  0,  0,  0,  0, 31, 42, 54, 66, 78, 90, 102, 114,   0,
                0,   115, 103, 91, 79, 71, 61, 51, 39,  0,  0,  0,  0,  0, 40, 52, 62, 72, 80, 92, 104, 116,   0
            ]
    },
    //  vaultlayout=3; simple view
    {
        layoutname: "Simple",
        vaultwidth: 5,
        vaultorder: []
    }
];

//  populate simple view vaultorder
for ( var i = 1; i <= 120; i++ ) vaultorders[3].vaultorder.push(i);

//  tracking state of reload all button
var ReloadCount = 0;

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
