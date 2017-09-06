//  support switching between multiple vault layouts
var vaultorders = [
    //  vaultlayout=0; compact view
    {
        layoutname: "compact",
        vaultwidth: 5,
        vaultorder:
            [26, 21, 17, 22, 27,
                14, 12, 11, 13, 15,
                9, 6, 4, 7, 10,
                5, 2, 1, 3, 8,
                0, 0, 0, 0, 0,
                69, 57, 45, 33, 19,
                67, 55, 43, 29, 16,
                70, 58, 46, 34, 20,
                75, 63, 49, 37, 25,
                77, 65, 53, 41, 30,
                79, 71, 61, 51, 39,
                0, 0, 0, 0, 0,
                23, 35, 47, 60, 73,
                18, 32, 44, 56, 68,
                24, 36, 48, 59, 74,
                28, 38, 50, 64, 76,
                31, 42, 54, 66, 78,
                40, 52, 62, 72, 80]
    },
    //  vaultlayout=1; full view
    {
        layoutname: "full",
        vaultwidth: 11,
        vaultorder:
            [0, 0, 0,26,21,17,22,27, 0, 0, 0,
            0, 0, 0, 14,12,11,13,15, 0, 0, 0,
            0, 0, 0, 9, 6, 4, 7, 10, 0, 0, 0,
            0, 0, 0, 5, 2, 1, 3, 8, 0, 0, 0,
            69,57,45,33,19, 0, 23,35,47,60,73,
            67,55,43,29,16, 0, 18,32,44,56,68,
            70,58,46,34,20, 0, 24,36,48,59,74,
            75,63,49,37,25, 0, 28,38,50,64,76,
            77,65,53,41,30, 0, 31,42,54,66,78,
            79,71,61,51,39, 0, 40,52,62,72,80]
    },
    //  vaultlayout=3; full view, wide
    {
        layoutname: "wide",
        vaultwidth: 15,
        vaultorder:
            [0, 0, 0, 0, 0, 26,21,17,22,27, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 14,12,11,13,15, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 9, 6, 4, 7, 10, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 5, 2, 1, 3, 8, 0, 0, 0, 0, 0,
            69,57,45,33,19, 0, 0, 0, 0, 0, 23,35,47,60,73,
            67,55,43,29,16, 0, 0, 0, 0, 0, 18,32,44,56,68,
            70,58,46,34,20, 0, 0, 0, 0, 0, 24,36,48,59,74,
            75,63,49,37,25, 0, 0, 0, 0, 0, 28,38,50,64,76,
            77,65,53,41,30, 0, 0, 0, 0, 0, 31,42,54,66,78,
            79,71,61,51,39, 0, 0, 0, 0, 0, 40,52,62,72,80]
    },
];

//  tracking state of reload all button
var ReloadCount = 0;

//  used for rate limiting management
var RateLimitExpiration = '';
try {
    RateLimitExpiration = localStorage['muledump:ratelimitexpiration']
} catch(e) {}
if ( !RateLimitExpiration ) RateLimitExpiration = 0;

var RateLimitTimer = false;

var RemoteRendersURL = "https://raw.githubusercontent.com/jakcodex/muledump/vaultorder1/lib/renders.png";