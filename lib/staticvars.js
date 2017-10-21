//  support switching between multiple vault layouts
var vaultorders = [
    //  vaultlayout=0; compact view
    {
        layoutname: "compact",
        vaultwidth: 7,
        vaultorder:
            [
                0, 26, 21, 17, 22, 27, 0,
                0, 14, 12, 11, 13, 15, 0,
                0, 9, 6, 4, 7, 10, 0,
                0, 5, 2, 1, 3, 8, 0,
                0, 0, 0, 0, 0, 0, 0,
                0, 83, 69, 57, 45, 33, 19,
                93, 81, 67, 55, 43, 29, 16,
                95, 84, 70, 58, 46, 34, 20,
                97, 87, 75, 63, 49, 37, 25,
                99, 89, 77, 65, 53, 41, 30,
                0,  91, 79, 71, 61, 51, 39,
                0, 0, 0, 0, 0, 0, 0,
                23, 36, 47, 60, 73, 86, 0,
                18, 32, 44, 56, 68, 82, 94,
                24, 35, 48, 59, 74, 85, 96,
                28, 38, 50, 64, 76, 88, 98,
                31, 42, 54, 66, 78, 90, 100,
                40, 52, 62, 72, 80, 92, 0
            ]
    },
    //  vaultlayout=1; full view
    {
        layoutname: "full",
        vaultwidth: 15,
        vaultorder:
            [
                0, 0, 0, 0, 0, 26,21,17,22,27, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 14,12,11,13,15, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 9, 6, 4, 7, 10, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 5, 2, 1, 3, 8, 0, 0, 0, 0, 0,
                0, 83,69,57,45,33,19, 0, 23,36,47,60,73,86, 0,
                93,81,67,55,43,29,16, 0, 18,32,44,56,68,82,94,
                95,84,70,58,46,34,20, 0, 24,35,48,59,74,85,96,
                97,87,75,63,49,37,25, 0, 28,38,50,64,76,88,98,
                99,89,77,65,53,41,30, 0, 31,42,54,66,78,90,100,
                0, 91,79,71,61,51,39, 0, 40,52,62,72,80,92, 0
            ]

    },
    //  vaultlayout=3; full view, wide
    {
        layoutname: "wide",
        vaultwidth: 19,
        vaultorder:
            [
                0, 0, 0, 0, 0, 0, 0, 26,21,17,22,27, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 14,12,11,13,15, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 9, 6, 4, 7, 10, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 5, 2, 1, 3, 8, 0, 0, 0, 0, 0, 0, 0,
                0, 83,69,57,45,33,19, 0, 0, 0, 0, 0, 23,36,47,60,73,86, 0,
                93,81,67,55,43,29,16, 0, 0, 0, 0, 0, 18,32,44,56,68,82,94,
                95,84,70,58,46,34,20, 0, 0, 0, 0, 0, 24,35,48,59,74,85,96,
                97,87,75,63,49,37,25, 0, 0, 0, 0, 0, 28,38,50,64,76,88,98,
                99,89,77,65,53,41,30, 0, 0, 0, 0, 0, 31,42,54,66,78,90,100,
                0, 91,79,71,61,51,39, 0, 0, 0, 0, 0, 40,52,62,72,80,92, 0
            ]
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

//  optional value; can be a url or base64 image source; if omitted, master/lib/renders.png is used from Github
//  note: I'm choosing to use the Github URL instead of a base64 string here because renders.png is huuuuuuuge in base64
//  I should store the renders.png download in localstorage. Another time. Probably 0.7.6.
//  var RemoteRendersURL = "";
