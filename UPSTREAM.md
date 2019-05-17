##  Important Changes from Upstream Muledump

Prior to Jakcodex/Muledump's first release, Muledump has traditionally used Yahoo's YQL service to process game account data. 

In July 2016, Deca added a rate limiting policy on all Appspot connections which restricted how often an IP address could access game account data. The result of this effectively blocked Yahoo YQL as they only used a handful of IPs to connect.

As of January 1, 2019, Yahoo YQL is discontinued and no longer functioning.

Jakcodex/Muledump solves this problem by enabling direct requests to Deca's game servers via a browser extension.

## Account Load Rate Limiting

Deca servers will now block you for 10 minutes if you make too many requests at once. Users with many accounts are finding themselves unable to use Muledump because of this.

This version of Muledump rate limits how fast you hit Deca's servers in an attempt to prevent you getting blocked. By default Muledump will automatically determine the delay necessary based how many accounts you have enabled. You can change this by updating the 'Account Load Delay' setting in the SetupTools Settings Manager.
