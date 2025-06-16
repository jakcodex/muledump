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
