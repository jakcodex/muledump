## Welcome

This is a fork of Atomizer's [Muledump](https://github.com/atomizer) made to address the required changes since the most recent upstream release.

You can read about the reasoning for a new fork in the [upstream notes](UPSTREAM.md).

## Synopsis

This tool allows you to list contents of all your accounts in a single page (characters, their stats and items, items in vaults). Also it generates a summary of all the items - you probably saw screenshots of these in trading forum ([example](http://i755.photobucket.com/albums/xx195/Ind3sisiv3/Ilovemuledump.png)).

The point of playing the game is to have fun. Muling is not fun. I am trying to increase overall fun ratio by decreasing amount of time spent fussing with mules and storagekeeping.

## Release Information

A hosted version on Github is available [here](https://jakcodex.github.io/muledump/muledump.html).

All released versions are available for download [here](https://github.com/jakcodex/muledump/releases).

## Requirements

Currently due to how Deca handles requests to ROTMG servers a browser extension is required to use this Muledump.

See the [Requirements](REQUIERMENTS.MD) page for more information.

## Local Download Version

- Unzip the latest muledump release
- Open **`muledump.html`**
- First time users will be guided thru Muledump setup
- Returning users are ready to go immediately

## Online Hosted Version

- Open **```https://jakcodex.github.io/muledump/muledump.html```**
- Returning users can upload a backup or import their existing accounts.js file
- New users will be guided through first time setup
- This version runs entirely on your local computer and is updated automatically with new releases
- All data submitted and stored in this version never leave your computer

## Main Features

- Manage all of your ROTMG accounts from a single interface
- [SetupTools](/docs/setuptools/index.html) - An easy to use, browser-based user interface for managing Muledump
- MuleQueue - Task queuing to control the flow of requests from Muledump
- Vault display is now fully customizable and comes with three pre-defined layouts
- Exporting works with the following modes: text, csv, json, image, imgur
- Fully compliant with Deca rate limiting

## Not so obvious features

- click on item to filter accounts that hold it
- click on account name for individual options menu
- ctrl-click account name to temporarily hide it from totals
- logins thru muledump count towards daily login calendar

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
