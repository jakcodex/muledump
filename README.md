## Welcome

This is a fork of Atomizer's [Muledump](https://github.com/atomizer) made to address the required changes since the most recent upstream release.

You can read about the reasoning for a new fork in the [upstream notes](UPSTREAM.md).

## Improvements over original Muledump

1. Deca rate limiting has been addressed and Muledump works again
2. Task queuing controls the flow of activity when loading large account lists
3. Vault order is fixed and now offers an easier way to add and switch between custom, user-defined layouts
3. Exports are fixed with the following modes: text, csv, json, image, imgur

## Synopsis

This tool allows you to list contents of all your accounts in a single page (characters, their stats and items, items in vaults). Also it generates a summary of all the items - you probably saw screenshots of these in trading forum ([example](http://i755.photobucket.com/albums/xx195/Ind3sisiv3/Ilovemuledump.png)).

The point of playing the game is to have fun. Muling is not fun. I am trying to increase overall fun ratio by decreasing amount of time spent fussing with mules and storagekeeping.

## Download

All released versions are [here](https://github.com/jakcodex/muledump/releases). The current version is 0.7.5.

## Howto

- unpack
- edit **`accounts_sample.js`**
- rename it to **`accounts.js`**
- add chrome extension **[Allow-Control-Allow-Origin: *](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi)**
- in CORS settings clear any existing Intercepted URLs and add: https://realmofthemadgodhrd.appspot.com/*
- open **`muledump.html`**

## Not so obvious features

- click on item to filter accounts that hold it
- click on account name for individual options menu
- ctrl-click account name to temporarily hide it from totals
- read the `accounts.js` file, it has some variables to play with
- logins thru muledump count towards daily login calendar
- custom vault layouts and more can be defined in [lib/staticvars.js](lib/staticvars.js)

## Head to the [wiki](https://github.com/jakcodex/muledump/wiki) for more information!

And of course, feel free to contribute to it!

## Support and Contributions

You can message me [on Reddit](messagesupport) with any questions, comments, concerns, or other feedback. I will respond as soon as I am able to. I'm glad to help get you up and running or answer any questions.

If you encounter a bug, have a feature request, or have any other feedback then you can check out the [issue tracker](https://github.com/jakcodex/muledump/issues) to see if it's already being discussed. If not then you can [submit a new issue](https://github.com/jakcodex/muledump/issues/new).

If you are interested in helping test new versions of this software before release then check out the [Beta Testing](https://github.com/jakcodex/muledump/wiki/Beta-Testing) wiki page for more information.

Feel free to submit pull requests or patches if you have any Muledump changes you'd like to contribute. See [Contributing](https://github.com/jakcodex/muledump/wiki/Contributing) for more information.

## License

Original Muledump Copyright (c) 2013 [atomizer](https://github.com/atomizer)

Jakcodex/Muledump Copyright (c) 2017 [jakisaurus](https://github.com/jakcodex)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[messagesupport]: https://www.reddit.com/message/compose?to=jakisaurus&subject=Muledump%20support&message= "Message Jakisaurus on Reddit"
