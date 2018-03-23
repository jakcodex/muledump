(function($, window) {

    var options = window.options;
    var accounts = window.accounts;
    var items = window.items;
    var classes = window.classes;

// max width of an account box in columns
    var ROW = ( window.rowlength ) ? window.rowlength : 7;
    var vaultlayout = ( window.vaultlayout ) ? window.vaultlayout : 0;

//  we'll prepare this later
    VAULTORDER = [];
    vaultwidth = ROW;

// dom snippet generators

    function stat(where, type, text) {
        return $('<strong class="stat">').addClass(type).text(text).appendTo(where);
    }

    function item(id) {
        id = +id;
        var ids = '0x' + id.toString(16);
        var $r = $('<div class="item">').data('id', id).append($('<div>').text('0').hide());
        var it = items[id];
        if (!it) {
            it = items[id] = ['item ' + ids, 0, -1, 0, 0, 0, 0, 0, false, 0]
        }
        if (id !== -1 && it[1] === 0) {
            $r.append($('<span>').text(ids))
        }
        /*var title = it[0];
        if (~it[2] && it[1] !== 10 && it[1] !== 9) title += ' (T' + it[2] + ')';
        if (it[6]) title += '\nFeed Power: ' + it[6];*/

        $r.attr('data-itemId', id).css('background-position', '-' + it[3] + 'px -' + it[4] + 'px');
        setuptools.app.muledump.tooltip($r);
        return $r;
    }
    window.item = item;


    function item_listing(arr, classname) {
        var $r = $('<div class="itemsc">');
        for (var i = 0; i < arr.length; i++) {
            item(arr[i]).appendTo($r);
        }
        if (classname) $r.addClass(classname);
        return $r;
    }

    function maketable(classname, items, row) {
        row = row || ROW;
        var $t = $('<table>').addClass(classname);
        var $row;
        for (var i = 0; i < items.length; i++) {
            if (i % row === 0) {
                if ($row) $t.append($row);
                $row = $('<tr>');
            }
            $('<td class="cont">').append(items[i]).appendTo($row);
        }
        if ($row) $t.append($row);
        var cols = items.length >= row ? row : items.length;
        cols = cols || 1;
        $t.css('width', '' + (184 * cols + 14 * (cols - 1)) + 'px');
        return $t;
    }

    var NUMCLASSES = 0;
    for (var i in classes) NUMCLASSES++;

    var STARFAME = [20, 150, 400, 800, 2000];
    var STARCOLOR = ['#8a98de', '#314ddb', '#c1272d', '#f7931e', '#ffff00', '#ffffff'];
    function addstar($t, d) {
        var r = 0;
        if (!d.Account.Stats || !d.Account.Stats.ClassStats) return;
        var s = d.Account.Stats.ClassStats;
        if (!s.length) s = [s];
        for (var i = 0; i < s.length; i++) {
            var b = +s[i].BestFame || 0;
            for (var j = 0; b >= STARFAME[j] && j < 5; j++);
            r += j;
        }
        if (r < 1) return;
        var $s = $('<span>').addClass('scont');
        $('<span>').text(r).appendTo($s);
        var $st = $('<span>').text('\u2605').addClass('star');
        $st.css('color', STARCOLOR[Math.floor(r / NUMCLASSES)] || 'lime');
        $st.appendTo($s);
        $s.appendTo($t);
        setuptools.app.ga('send', 'event', {
            eventCategory: 'stars',
            eventAction: r
        });
    }

    function addreloader(mule, target) {
        var button = $('<div class="button reloader">');
        button.text('\u21bb');
        if (mule.data) {
            var updated = new Date(mule.data.query.created);
            button.attr('title', 'last updated: ' + updated.toLocaleString())
        }
        button.on('click.muledump.reloader', function(){
            setuptools.app.mulequeue.task.start(mule.guid);
        });
        button.appendTo(target);
    }

    function addmainbutton(mule, target) {

        //  reload button
        addreloader(mule, target);

        //  one-click login
        if ( mule.guid.indexOf('steamworks:') === -1 && window.mulelogin ) {

            var l = $('<a>').addClass('button');
            l.text('\u21d7');
            l.attr('href', setuptools.app.muledump.mulelink(mule.guid));
            l.attr('title', 'Open Account');
            l.appendTo(target);

        }

    }

    function addmulemenu(mule) {

        var menu = $('<div class="button muleMenu noselect" title="Mule Menu">');
        menu.html('&#8801;');
        menu.off('click.muledump.mulemenu').on('click.muledump.mulemenu', function(e) {
            setuptools.app.muledump.mulemenu(e, mule.guid, menu, menu, {
                option: 'pos',
                vpx: 26
            });
        });
        menu.appendTo(mule.dom);
        $('div.mule > div.name').off('contextmenu.muledump.mulemenu').on('contextmenu.muledump.mulemenu', function(e) {
            setuptools.app.muledump.mulemenu(e, mule.guid, menu);
        });
        mule.dom.off('contextmenu.muledump.mulemenu').on('contextmenu.muledump.mulemenu', function(e) {
            setuptools.app.muledump.mulemenu(e, mule.guid, menu);
        });

    }

    function arrangevaults(v) {
        //  this doesn't seem necessary presently
        //while(VAULTORDER.length < v.length){
        //	var a = VAULTORDER[0] + 2;
        //	VAULTORDER.splice(0, 0, a+5, a+3, a+1, a, a+2, a+4, a+6);
        //}
        var r = [], i, j;
        for (i = 0; i < VAULTORDER.length; i++) {
            if (i % vaultwidth === 0 && r.length) {
                for (j = 0; j < r.length; j++) if (r[j]) break;
                if (j >= r.length) r = [];
            }
            var c = v[VAULTORDER[i] - 1];
            if (typeof c !== 'undefined') r.push(c); else r.push(0);
        }
        var w = vaultwidth;
        for (i = (vaultwidth-1); i >= 0; i--) {
            for (j = i; j < r.length; j+=w) if (r[j]) break;
            if (j < r.length) continue;
            w--;
            for (j = i; j < r.length; j+=w) r.splice(j, 1);
        }
        if (vaultwidth < w) return [0, v];
        return [w, r];
    }

    //  xml to json
    function xmlToJson(xml) {

        // Create the return object
        var obj = {};

        //  element
        if (xml.nodeType === 1) {


            //  attributes are treated as keys
            if (xml.attributes.length > 0) {
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj[attribute.nodeName] = attribute.nodeValue;
                }
            }

            //  text
        } else if (xml.nodeType === 3) {
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) === "undefined") {
                    obj[nodeName] = xmlToJson(item);
                    if ( nodeName === '#text' ) obj = obj[nodeName];
                } else {
                    if (typeof(obj[nodeName].push) === "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                    if ( nodeName === '#text' ) obj = obj[nodeName];
                }
            }
        }

        return obj;
    }

// Mule object

    var Mule = function(guid) {
        if (!guid || !(guid in window.accounts)) return;
        this.guid = guid;
        this.fails = 0;
        this.dom = $('<div class="mule">');
        this.dom.appendTo($('#stage')).hide();
    };

    Mule.prototype.opt = function(name) {
        var o = options[this.guid];
        if (o && name in o) {
            return o[name];
        }
        return options[name];
    };

    Mule.prototype.cache_id = function() {
        return 'muledump:' + this.guid
    };

    Mule.prototype.log = function(s, cl) {

        return;

        /* no more overlay /
        if (!this.overlay) {
            this.overlay = $('<div class="overlay">');
            var c = $('<div class="button">').text('X').appendTo(this.overlay);
            c.click(function() {
                $(this).parent().hide()
            });
            this.overlay.append($('<div class="log">'));
            this.overlay.appendTo(this.dom)
        }
        this.overlay.show();
        var log = this.overlay.find('.log');
        cl = cl || 'info';
        $('<div class="line">').html(s).addClass(cl).appendTo(log)
        */
    };

    Mule.prototype.error = function(s, callback) {

        //  don't show if errors are turned off
        if ( setuptools.data.config.errors === false ) return;

        //  build the message
        var self = this;
        if ( this.errorBar instanceof jQuery ) this.errorBar.html(' \
            <div class="flex-container">\
                <div style="margin-right: 5px;">' + s + '</div> \
                <div class="setuptools link errorAck menuStyle ack mr0 ml5" title="Dismiss" style="width: auto; height: auto; opacity: 1; border: 0; box-shadow: 0 0 0px 2px #000000;">Dismiss</div>\
            </div>\
        ');

        //  bind the acknowledgement button
        $('div.mule[data-guid="' + this.guid + '"] div.setuptools.link.errorAck').on('click.muledump.errorAck', function () {

            //  remove the bar
            if ( setuptools.data.config.animations === 1 ) {

                //  custom callback on click
                if ( typeof callback === 'function' ) callback();

                $(this).fadeOut(600, function () {
                    this.remove();
                });

                self.errorBar.slideUp(700, function () {
                    self.errorBar.show().text('');
                });

            } else {

                this.remove();
                self.errorBar.text('');

            }

        });

    };

    //  complete a MuleQueue task
    Mule.prototype.queueFinish = function(guid, status, cache_only, errorMessage) {

        //  return a promise
        if ( typeof this.MuleQueue === 'function' ) {

            this.MuleQueue({
                state: 'finished',
                guid: guid,
                status: status,
                cache_only: cache_only,
                errorMessage: errorMessage
            });

        }

    };

    Mule.prototype.query = function(ignore_cache, cache_only, freshness, MuleQueue) {
        if ( !cache_only ) cache_only = false;
        if ( !freshness ) freshness = false;
        if ( setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true && setuptools.data.accounts.accounts[this.guid].cacheEnabled === false ) {
            ignore_cache = true;
        }
        var self = this;
        if ( typeof MuleQueue === 'function' ) this.MuleQueue = MuleQueue;
        this.loaded = false;
        this.fresh = false;
        $('#accopts').hide().data('guid', '');

        // read from cache if possible
        if (!ignore_cache || ignore_cache === false ) {
            var c = '';
            try {
                c = localStorage[this.cache_id()];
                c = JSON.parse(c);
            } catch(e) {}
            if (c) {

                //  users can specify a maximum age of cache data before reloading automatically
                var cacheStale = false;
                if (
                    (cache_only !== true || freshness === true) &&
                    setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true &&
                    setuptools.data.config.autoReloadDays > 0 &&
                    setuptools.data.accounts.accounts[this.guid].autoReload === true
                ) {

                    //  let's convert the cache date to utc midnight of the same day
                    var date = new Date(c.query.created);
                    var utcCacheDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
                    var cacheDate = utcCacheDate.getTime();
                    var currentDate = Date.now();
                    var cacheAge = Math.floor(((currentDate-cacheDate)/1000)/86400);
                    if ( cacheAge >= setuptools.data.config.autoReloadDays ) {

                        cacheStale = true;
                        window.techlog('MuleQueue/StaleCache found for ' + this.guid, 'string');
                        setuptools.app.ga('send', 'event', {
                            eventCategory: 'detect',
                            eventAction: 'staleCache'
                        });

                    }

                }

                //  users can disable cache data for specific accounts
                if (
                    setuptools.app.config.validateFormat(setuptools.data.accounts, 0) === true ||
                    (setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true && setuptools.data.accounts.accounts[this.guid].cacheEnabled === true )
                ) {

                    //  parse the cache data as-is while we sort out what else to do
                    this.parse(c, true);

                    //  now we will enforce cache freshness
                    if ( cacheStale === false ) {

                        this.fresh = true;
                        if (cache_only === false) this.queueFinish(this.guid, 'cache');
                        return;

                    }

                }

            }

        }

        if ( cache_only === true ) return;

        var CR = { guid: this.guid };
        var pass = window.accounts[this.guid] || '';

        //  don't accept blank passwords
        if ( pass === '' ) {
            this.error("Password is empty");
            this.queueFinish(this.guid, 'error', false, 'Password is empty');
            return;
        }

        var platform = this.guid.split(':')[0];
        if (['kongregate', 'steamworks', 'kabam'].indexOf(platform) >= 0) {
            CR.secret = pass
        } else {
            CR.password = pass
        }

        this.log('loading data');
        var realmApiURL = setuptools.config.appspotProd;
        if (
            setuptools.state.loaded === true &&
            setuptools.data.accounts.accounts[this.guid].testing === true
        ) realmApiURL = setuptools.config.appspotTesting;

        setuptools.app.uaTiming('mule', 'realmAPICharListGet', 'start', this.guid);
        window.realmAPI(
            'char/list',
            CR,
            {url: realmApiURL},
            function(xhr) {
                xhr.done(onResponse).fail(onFail)
            }
        );

        function onFail() {
            setuptools.app.uaTiming('mule', 'realmAPICharListGet', 'cancel', self.guid);
            self.log('failed');
            self.busy = false;
            self.fails++;
            setuptools.tmp.corsAttempts++;
            if (self.fails < setuptools.config.muledump.corsMaxAttempts) {

                setTimeout(function() { self.query(true); }, 1000);

            } else {

                self.queueFinish(self.guid, 'error', false, 'Could not connect to Appspot (CORS error?)');
                self.error('There was a problem connecting to ROTMG servers. <a href="#" class="setuptools link cors">Click here</a> for help.');
                $('.setuptools.link.cors').off('click.setuptools.corsAssistant').on('click.setuptools.corsAssistant', function() { setuptools.app.assistants.cors(true); });

                //  help the user with potential cors issues (maybe network, or otherwise) on first occurrence
                setuptools.app.assistants.cors();

                setuptools.app.ga('send', 'event', {
                    eventCategory: 'detect',
                    eventAction: 'corsError'
                });

            }
        }

        function onResponse(xml, textStatus, request) {

            setuptools.app.uaTiming('mule', 'realmAPICharListGet', 'stop', self.guid);

            //  check for the x-jakcodex-cors response header
            if ( setuptools.state.extension === undefined ) {

                if ( !request.getResponseHeader('X-Jakcodex-CORS') ) {

                    setuptools.state.extension = false;
                    setuptools.app.ga('send', 'event', {
                        eventCategory: 'detect',
                        eventAction: 'nonJakcodexCORS'
                    });
                    if (['chrome', 'opera'].indexOf(setuptools.browser) > -1) setuptools.app.muledump.notices.add('New CORS Extension Available', setuptools.app.assistants.jakcodexcors);

                } else {

                    setuptools.state.extension = true;
                    setuptools.app.ga('send', 'event', {
                        eventCategory: 'detect',
                        eventAction: 'isJakcodexCORS'
                    });

                }

            }

            self.busy = false;
            parser = new DOMParser();
            date = new Date();
            window.techlog("Response from api: " + xml, "api");

            //  check for an error response
            if ( error = xml.match(/^<Error\/?>(.*?)<\/?Error>$/) ) {

                if ( error[1] === 'Internal error, please wait 5 minutes to try again!' ) {

                    self.log("Your IP is being rate limited by Deca. Waiting 5 minutes to retry.");
                    self.queueFinish(self.guid, 'rateLimited', 'Request was rate limited by Appspot');

                    //  we'll not send any xhr requests for 5 minutes
                    window.RateLimitExpiration = Date.now()+300000;

                    try {
                        localStorage['muledump:ratelimitexpiration'] = window.RateLimitExpiration
                    } catch(e) {}

                } else if ( error[1] === 'Account is under maintenance' ) {

                    if ( setuptools.state.loaded === true && setuptools.data.accounts.accounts[self.guid].banned === false ) {
                        setuptools.data.accounts.accounts[self.guid].banned = true;
                        setuptools.app.config.save('Banned, boo!');
                    }
                    self.queueFinish(self.guid, 'error', false, error[1]);
                    self.error("This account is banned - RIP");
                    setuptools.app.ga('send', 'event', {
                        eventCategory: 'detect',
                        eventAction: 'accountBanned'
                    });

                } else if ( error[1].match(/^Account in use/) ) {

                    self.queueFinish(self.guid, 'error', false, error[1]);
                    var regex = error[1].match(/\(([0-9]*) seconds/);
                    var endTime = new Date(Date.now()+(Number(regex[1])*1000)).timeString(false);
                    self.error("Account in use - please try again or wait until " + endTime);
                    setuptools.app.ga('send', 'event', {
                        eventCategory: 'detect',
                        eventAction: 'accountInUse'
                    });

                } else {

                    self.queueFinish(self.guid, 'error', false, error[1]);
                    self.error(error[1]);
                    setuptools.app.ga('send', 'event', {
                        eventCategory: 'detect',
                        eventAction: 'genericServerError'
                    });

                }

                //  no errors, this is a good start
            } else {

                self.queueFinish(self.guid, 'ok');
                if ( setuptools.state.loaded === true && setuptools.data.accounts.accounts[self.guid].banned === true ) {
                    setuptools.data.accounts.accounts[self.guid].banned = false;
                    setuptools.app.config.save('Unbanned, hooray!');
                }
                if ( this.loginOnly === false ) self.errorBar.empty();

                //  let's simulate a YQL response
                setuptools.app.uaTiming('mule', 'xmlToJson', 'start', self.guid, false, setuptools.app.uaTimingAggregate);
                var xmlParse = parser.parseFromString(xml, "text/xml");
                var JSONData = xmlToJson(xmlParse);
                setuptools.app.uaTiming('mule', 'xmlToJson', 'stop', self.guid);
                JSONData.other = {
                    maxCharNum: xmlParse.querySelectorAll('[maxNumChars]')[0].attributes['maxNumChars'].value,
                    nextCharId: xmlParse.querySelectorAll('[nextCharId]')[0].attributes['nextCharId'].value
                };

                data = {
                    query: {
                        created: date.toISOString(),
                        updated: date.toISOString(),
                        results: JSONData
                    },
                    meta: {
                        token: setuptools.config.actoken,
                        version: $.extend(true, {}, setuptools.version)
                    }
                };

                var res = data.query.results;
                window.techlog("Response data for " + self.guid, 'api');
                window.techlog(JSON.stringify(data, null, 5), 'api');

                if (res.Error) {
                    self.error("server error");
                    window.techlog('Server error processing ' + self.guid + ': ' + JSON.stringify(data, null, 5), 'verbose');
                    return;
                }

                function watchProgress(percent) {
                    if (typeof percent !== 'string') {
                        self.error('migration failed');
                        return
                    }
                    if (percent === '100') {
                        self.reload();
                        return
                    }
                    self.log('migration: ' + percent + '%');
                    window.realmAPI('migrate/progress', CR, function (xhr) {
                        xhr.fail(onFail).done(function (data) {
                            date = new Date();
                            data = {
                                query: {
                                    created: date.toISOString(),
                                    updated: date.toISOString(),
                                    results: xmlToJson(parser.parseFromString(data, "text/xml"))
                                }
                            };
                            var res = data && data.query && data.query.results;
                            var per = res.Progress && res.Progress.Percent;
                            watchProgress(per);
                        })
                    })
                }

                if (res.Migrate) {
                    self.log('attempting migration');

                    window.realmAPI('migrate/doMigration', CR, {url: true, type: 'migration'}, function () {
                        watchProgress('0')
                    });
                    return
                }

                if ( !res.Chars ) return;

                res = res.Chars;

                if ('TOSPopup' in res) {
                    window.realmAPI('account/acceptTOS', CR, {url: true, type: 'tos'})
                }

                if (res.Account && res.Account.IsAgeVerified !== "1") {
                    CR.isAgeVerified = 1;
                    window.realmAPI('account/verifyage', CR, {url: true, type: 'ageVerify'})
                }

                self.parse(data)
            }
        }
    };

    Mule.prototype.reload = function() {

        this.fails = 0;
        if (this.overlay) this.overlay.find('.log').empty();
        if (window.RateLimitExpiration >= Date.now()) {
            this.query(false, true);
        } else {
            this.query(true);
        }

    };


    var PROPTAGS = 'ObjectType Level Exp CurrentFame'.split(' ');
    var STATTAGS = 'MaxHitPoints MaxMagicPoints Attack Defense Speed Dexterity HpRegen MpRegen'.split(' ');
    var STATABBR = 'HP MP ATT DEF SPD DEX VIT WIS'.split(' ');
    Mule.prototype.parse = function(data, skipCacheWrite) {

        //  calculate some account statistics
        function calculateStatTotals(data, guid) {

            setuptools.app.uaTiming('mule', 'calculateStatsTotals', 'start', self.guid, false, setuptools.app.uaTimingAggregate);
            var ign = '';
            var char = [];

            result = {
                TotalFame: 0,
                TotalExp: 0,
                TotalGifts: 0,
                TotalChars: 0,
                TotalActive: 0,
                TotalChests: 1,
                CacheAge: 0,
                ign: ( typeof data.Account === 'object' ) ? data.Account.Name : ''
            };

            //  determine cache age
            var date = new Date(q.created);
            var cacheDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
            result.CacheAge = Math.floor(((Date.now()-cacheDate.getTime())/1000)/86400);

            //  count chests
            var chests = d.Account.Vault ? d.Account.Vault.Chest || ['-1'] : ['-1'];
            if ( Array.isArray(chests) ) {
                result.TotalChests = chests.length;
            } else if ( typeof chests === 'object' || typeof chests === 'string' ) {
                result.TotalChests = 1;
            }

            //  single character account
            if (
                typeof data.Char === 'object' &&
                typeof data.Char.Account === 'object' &&
                typeof data.Char.Account.Name === 'string'
            ) {

                char.push(data.Char);

            }
            //  multiple character account
            else if (
                typeof data.Char === 'object' &&
                data.Char.length > 0
            ) {

                char = data.Char;

            }

            //  add up the numbers
            for ( x = 0; x < char.length; x++ ) {
                var stats = readstats(char[x].PCStats); //id 20
                result.TotalActive += Number(stats[20]);
            }

            //  let's reduce this as much as possible
            var TimeActive = result.TotalActive/60;
            var ActiveSuffix = ' hours';
            TimeActive = Math.floor(TimeActive);
            result.TotalActive = TimeActive + ActiveSuffix;

            //  calculate gift stats
            if ( typeof data.Account.Gifts === 'string' ) result.TotalGifts = data.Account.Gifts.split(',').length;

            //  calculate fame and exp stats
            if ( typeof data.Char !== 'undefined' ) {

                //  if the user has multiple characters this will be an array
                if (data.Char.length) {

                    result.TotalChars = data.Char.length;
                    for ( var i = 0; i < data.Char.length; i++ ) {

                        result.TotalFame = Number(result.TotalFame) + Number(data.Char[i].CurrentFame);
                        result.TotalExp = Number(result.TotalExp) + Number(data.Char[i].Exp);

                    }

                    //  otherwise it is an object
                } else {

                    result.TotalChars = Number(1);
                    result.TotalFame = Number(result.TotalFame) + Number(data.Char.CurrentFame);
                    result.TotalExp = Number(result.TotalExp) + Number(data.Char.Exp);

                }

            }

            //  format last gold purchase date
            result.LastGoldPurchase = "N/A";
            if ( typeof data.SalesForce.last_purchase_date === 'string' ) result.LastGoldPurchase = data.SalesForce.last_purchase_date;
            if ( result.LastGoldPurchase.indexOf(':') > -1 ) result.LastGoldPurchase = result.LastGoldPurchase.substr(0, result.LastGoldPurchase.length-3);

            setuptools.app.uaTiming('mule', 'calculateStatsTotals', 'stop', self.guid);
            return result;

        }

        if (this.overlay) this.overlay.hide();

        if ( setuptools.state.loaded === true ) ROW = setuptools.data.config.rowlength;

        function parseQueryString(queryString) {
            var query = {};
            var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split('=');
                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
            return query;
        }

        //  start parse timer
        setuptools.app.uaTiming('mule', 'parse', 'start', this.guid, false, setuptools.app.uaTimingAggregate);

        //  shortcut
        var self = this;
        var d = data.query.results.Chars;
        var q = data.query;

        //  store the updated server list if it is present
        if ( typeof d.Servers === 'object' && typeof d.Servers.Server === 'object' && typeof d.Servers.Server.push === 'function' )
            setuptools.storage.write('ServerList', JSON.stringify(d.Servers.Server, true, 5));

        //  we only need the following information
        //  use this to see full xml contents
        //  console.log(parser.parseFromString(xml, "text/xml"));
        if ( !d.OwnedSkins ) d.OwnedSkins = [];
        if ( !d.SalesForce ) d.SalesForce = {lifetime_spend: "0"};
        d = {
            Char: d.Char,
            Account: d.Account || {},
            OwnedSkins: ( typeof d.OwnedSkins === 'object' && typeof d.OwnedSkins.push === 'function' ) ? d.OwnedSkins : (
                ( typeof d.OwnedSkins === 'object' ) ? [] : d.OwnedSkins.split(',')
            ),
            SalesForce: ( typeof d.SalesForce === 'object' ) ? d.SalesForce : (
                ( d.SalesForce === "undefined" ) ? {} : parseQueryString(atob(d.SalesForce))
            )
        };

        //  reset the cache object for storage
        data.query.results.Chars = d;

        this.data = data;
        this.dom.hide().empty();
        this.overlay = null;

        //  moved up here because we're modifying the structure to add sort keys and such

        var carr = [];
        if (d.Char) { // stupid array/object detection
            if (!d.Char.length) carr = [d.Char]; else carr = d.Char;
        }

        //  add keys for sorting
        for ( var i in carr ) {

            if (carr.hasOwnProperty(i)) {

                if (typeof carr[i].muledump === 'undefined') carr[i].muledump = {};

                //  add ClassName
                carr[i].muledump.ClassName = classes[carr[i].ObjectType][0];

                //  add TotalFame
                var fame = Number(carr[i].CurrentFame);
                for (var k in bonuses) {

                    if (bonuses.hasOwnProperty(k)) {

                        var b = bonuses[k](readstats(carr[i].PCStats), carr[i], d, fame);
                        if (!b || b === -1) continue;
                        var incr = 0;
                        if (typeof b === 'object') {
                            incr += b.add;
                            b = b.mul;
                        }
                        incr += Math.floor(fame * b);
                        fame += incr;

                    }

                }
                carr[i].muledump.TotalFame = fame;

                //  add ?/8
                carr[i].muledump.MaxedStats = 0;
                for (var t = 0; t < STATTAGS.length; t++) {
                    var s = carr[i][STATTAGS[t]] || 0;
                    var cl = classes[carr[i].ObjectType];
                    if(parseInt(s) === cl[3][t]){
                        carr[i].muledump.MaxedStats++;
                    }
                }

            }

        }

        // write cache (even with cacheEnabled===false we'll still write it; just won't use it on reload)
        if ( skipCacheWrite !== true ) {
            try {
                window.techlog('Muledump/DataCache writing to ' + this.cache_id());
                setuptools.app.uaTiming('mule', 'writeAccountDataCache', 'start', this.guid, false, setuptools.app.uaTimingAggregate);
                localStorage[this.cache_id()] = JSON.stringify(data, null, 4);
                setuptools.app.uaTiming('mule', 'writeAccountDataCache', 'stop', this.guid);
            } catch (e) {

            }
        }

        //  add ign to the user account object
        if (
            setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true &&
            setuptools.app.config.userExists(this.guid) === true &&
            typeof d.Account === 'object' &&
            typeof d.Account.Name === 'string' &&
            d.Account.Name.length > 0
        ) setuptools.data.accounts.accounts[this.guid].ign = d.Account.Name;

        //  if this account is marked login-only then we are done
        this.loginOnly = false;
        if ( setuptools.app.config.validateFormat(setuptools.data.accounts, 1) === true && setuptools.data.accounts.accounts[this.guid].loginOnly === true ) this.loginOnly = true;

        this.items = {chars: [], vaults: [], gifts: []};
        var f = false;
        var arr = [];

        if ( this.loginOnly === false ) {

            this.dom.attr('data-guid', this.guid);

            //  display guid
            if (this.opt('email')) {
                $('<input type="text" readonly="readonly">').addClass('guid').val(this.guid).appendTo(this.dom);
                $('<br>').appendTo(this.dom);
            }

            //  error bar
            this.errorBar = $('<div>').addClass('errorBar stickynotice').css({'font-size': '12px'});
            if (setuptools.data.config.animations < 1) this.errorBar.addClass('AReduced');
            this.errorBar.appendTo(this.dom);

            addmainbutton(this, this.dom);
            addmulemenu(this);

            //  check if email address is verified (but skip steamworks/kongregate/etc)
            if (!('VerifiedEmail' in d.Account) && !this.guid.match(/(?:\:)/)) {
                var $warn = $('<span class="button warn">').text('!!');
                $warn.attr('title', 'email not verified').appendTo(this.dom)
            }

            d.Account = d.Account || {};
            if ((this.opt('accountName') === false)) d.Account.Name = '&nbsp;';
            var $name = $('<div>').addClass('name').html(d.Account.Name || '(no name)');
            addstar(this.dom, d);
            $name.on('click.muledump.muleAccountName', function (e) {
                if (e.target !== this) return;
                if (e.ctrlKey) {
                    self.disabled = !self.disabled;
                    self.dom.toggleClass('disabled', self.disabled);
                    window.update_totals();
                    return;
                }
                setuptools.lightbox.menu.context.close();
                var $ao = $('#accopts');
                $ao.css({
                    left: e.pageX - 5 + 'px',
                    top: e.pageY - 5 + 'px'
                });
                window.updaccopts(self.guid);
                $ao.css({
                    'display': 'block',
                    'visibility': 'visible'
                });
            });
            $name.appendTo(this.dom);

            //  display account info
            if (this.opt('accountinfo')) {
                stats = calculateStatTotals(this.data.query.results.Chars, this.guid);
                $('<div class="stats">\
                    <div class="flex-container"><div>Account Data Cache Age</div><div>' + stats.CacheAge + ' ' + ((stats.CacheAge === 1) ? 'day' : 'days') + '</div></div> \
                    <div class="flex-container"><div>Account Fame</div><div>' + this.data.query.results.Chars.Account.Stats.Fame + '</div></div> \
                    <div class="flex-container"><div>Account Gold</div><div>' + this.data.query.results.Chars.Account.Credits + '</div></div> \
                    <div class="flex-container"><div>Gift Items</div><div>' + stats.TotalGifts + '</div></div> \
                    <div class="flex-container"><div>Last Gold Purchase</div><div>' + stats.LastGoldPurchase + '</div></div> \
                    <div class="flex-container"><div>Total Char Exp</div><div>' + stats.TotalExp + '</div></div> \
                    <div class="flex-container"><div>Total Char Fame</div><div>' + stats.TotalFame + '</div></div> \
                    <div class="flex-container"><div>Total Characters</div><div>' + stats.TotalChars + '</div></div> \
                    <div class="flex-container"><div>Total Character Slots</div><div>' + ( (data.query.results.other) ? data.query.results.other.maxCharNum : 'N/A' ) + '</div></div> \
                    <div class="flex-container"><div>Total Lifetime Characters</div><div>' + ( (data.query.results.other) ? (data.query.results.other.nextCharId-1) : 'N/A' ) + '</div></div> \
                    <div class="flex-container"><div>Total Skins Unlocked</div><div>' + this.data.query.results.Chars.OwnedSkins.length + ' of ' + Object.keys(skins).length + ' </div></div> \
                    <div class="flex-container"><div>Total Time Active</div><div>' + stats.TotalActive + '</div></div> \
                    <!-- removed for now due to inaccurate data coming from deca -- <div class="flex-container"><div>Lifetime Gold Purchased</div><div>' + this.data.query.results.Chars.SalesForce.lifetime_spend + '</div></div>--> \
                    <div class="flex-container"><div>Total Unlocked Chests</div><div>' + stats.TotalChests + ' of ' + (vaultorders[0].vaultorder.filter(function (item) {
                        return (item !== 0)
                    })).length + '</div></div> \
            </div>').appendTo(this.dom);
            }

            //  check for gift chests bug
            var TotalGifts = 0;
            if (typeof d.Account.Gifts === 'string') TotalGifts = d.Account.Gifts.split(',').length;
            if (TotalGifts >= setuptools.config.giftsWarningThreshold) {

                //  check if we should alert the user
                if (
                    setuptools.app.config.determineFormat(setuptools.data.accounts) === 0 ||
                    setuptools.data.accounts.accounts[this.guid].giftsBugAck !== true
                ) {

                    this.error('Warning: Account is nearing the <a href="' + setuptools.config.giftChestsBugHelp + '" class="rateLimited nopulse" target="_blank">gift chests bug</a>!', function() {

                        if ( setuptools.app.config.determineFormat(setuptools.data.accounts) === 1 ) {

                            setuptools.data.accounts.accounts[self.guid].giftsBugAck = true;
                            setuptools.app.config.save('Gift Chests Bug Ack');

                        }

                    });

                }

            }
            //  reset the acknowledgement if the issue isn't detected
            else if (
                setuptools.app.config.determineFormat(setuptools.data.accounts) === 1 &&
                setuptools.data.accounts.accounts[self.guid].giftsBugAck === true
            ) setuptools.data.accounts.accounts[self.guid].giftsBugAck = false;

            //  sort the character list
            setuptools.app.uaTiming('mule', 'parseCharacterSorting', 'start', this.guid, false, setuptools.app.uaTimingAggregate);

            //  custom
            if (this.opt('chsort') === '100') {

                var CustomList = setuptools.data.muledump.chsortcustom.accounts[this.guid];
                if (
                    typeof CustomList === 'object' &&
                    typeof CustomList.data === 'object' &&
                    Array.isArray(CustomList.data[CustomList.active])
                ) {

                    var CharList = [];
                    for (var i in d.Char) {

                        if (d.Char.hasOwnProperty(i)) {

                            var index = CustomList.data[CustomList.active].indexOf(d.Char[i].id);
                            if (index > -1) CharList[index] = d.Char[i];

                        }

                    }

                    carr = CharList;

                    setuptools.app.ga('send', 'event', {
                        eventCategory: 'detect',
                        eventAction: 'charSortCustom'
                    });


                } else {

                    if (typeof CustomList === 'object' && CustomList.active) CustomList.active = '';

                    //  use default
                    carr.sort(function (a, b) {
                        return a.id - b.id
                    });

                }

                //  active time
            } else if (this.opt('chsort') === '6') {
                carr.sort(function (a, b) {
                    return b.muledump.MaxedStats - a.muledump.MaxedStats;
                })
            } else if (this.opt('chsort') === '5') {

                carr.sort(function (a, b) {

                    var statsA = readstats(a.PCStats);
                    var statsB = readstats(b.PCStats);
                    return Number(statsB[20]) - Number(statsA[20])

                });

                //  class, by fame
            } else if (this.opt('chsort') === '4') {

                //  sort alphabetically and by current fame
                carr.sort(function (a, b) {
                    if (a.muledump.ClassName < b.muledump.ClassName) return -1;
                    if (a.muledump.ClassName > b.muledump.ClassName) return 1;
                    if (a.muledump.ClassName === b.muledump.ClassName) {
                        return b.CurrentFame - a.CurrentFame;
                    }
                    return 0;
                });

                //  base exp
            } else if (this.opt('chsort') === '3') {

                carr.sort(function (a, b) {
                    return b.Exp - a.Exp
                });

                //  total fame
            } else if (this.opt('chsort') === '2') {

                carr.sort(function (a, b) {
                    return b.muledump.TotalFame - a.muledump.TotalFame
                });

                //  base fame
            } else if (this.opt('chsort') === '1') {

                carr.sort(function (a, b) {
                    return b.CurrentFame - a.CurrentFame
                });

                //  id (default)
            } else {
                carr.sort(function (a, b) {
                    return a.id - b.id
                });
            }
            setuptools.app.uaTiming('mule', 'parseCharacterSorting', 'stop', this.guid);

        }

        //  main character loop
        if ( typeof setuptools.tmp.wawawaTimers === 'undefined' ) setuptools.tmp.wawawaTimers = {};
        if ( typeof setuptools.tmp.mainCharLoopTimers === 'undefined' ) setuptools.tmp.mainCharLoopTimers = {};
        setuptools.tmp.wawawaTimers[this.guid] = 0;
        setuptools.tmp.mainCharLoopTimers[this.guid] = 0;
        for (var i = 0; i < carr.length; i++) {

            setuptools.app.uaTiming('mule', 'mainCharLoopTimer', 'start', this.guid);
            var c = carr[i], $c = $('<div class="char">');
            if (!c) continue;
            var cl = classes[c.ObjectType];
            if (!cl) continue;
            if ( this.loginOnly === false && this.opt('chdesc') ) {
                f = true;

                //  look for ld/lt/xp boost
                var boost = $('<img class="boost hidden" src="lib/media/boost.png">');
                var boosts = [c.XpBoosted, c.XpTimer, c.LDTimer, c.LTTimer];
                var boostHtml = '';
                for ( x = 0; x < boosts.length; x++ ) {
                    if ( boosts[x] !== "0" ) {

                        boost.removeClass('hidden');
                        var length = '';

                        if ( c.XpBoosted !== "0" ) {

                            length = Math.floor(Number(c.XpTimer)/60) + ' minutes';
                            if ( c.XpTimer === "0" ) length = "Until Level 20";
                            boostHtml += '<div class="cfleft ignore">XpBooster</div><div class="cfright ignore">' + length + '</div>';

                        }

                        if ( c.LDTimer !== "0" ) {

                            length = Math.floor(Number(c.LDTimer)/60);
                            boostHtml += '<div class="cfleft ignore">Loot Drop</div><div class="cfright ignore">' + length + ' minutes</div>';

                        }

                        if ( c.LTTimer !== "0" ) {

                            length = Math.floor(Number(c.LTTimer)/60);
                            boostHtml += '<div class="cfleft ignore">Loot Tier</div><div class="cfright ignore">' + length + ' minutes</div>';

                        }

                        break;

                    }
                }

                var portimg = $('<img class="portrait">');
                window.portrait(portimg, c.ObjectType, c.Texture, c.Tex1, c.Tex2);
                var chtext = $('<div>')
                    .append(boost)
                    .append($('<div style="padding-top: 3px;">').text(cl[0] + ' ' + c.Level + ", " + c.muledump.MaxedStats + "/8" + ', #' + c.id))
                    .append($('<div>').text(c.CurrentFame + ' F ' + c.Exp + ' XP'));

                var chdesc = $('<div class="chdesc">')
                    .append(portimg)
                    .append(chtext)

                //  add it to the dom
                chdesc.appendTo($c);

                //  bind lt/ld/xp boost tooltip
                if ( boost.hasClass('hidden') === false ) {

                    boost.on('mouseenter.muledump.boostTooltip', [boost, boostHtml], function (e) {
                        setuptools.lightbox.tooltip(
                            e.data[0].parent().parent(),
                            e.data[1],
                            {
                                classes: 'tooltip-boost',
                                heightFrom: 'tooltip'
                            }
                        );
                    });

                    boost.on('mouseleave.muledump.boostTooltip', function() {
                        $('.tooltip').remove();
                    });

                }

            }
            if ( this.loginOnly === false && this.opt('stats') ) {
                f = true;
                var $stats = $('<table class="stats">');

                for (var t = 0; t < STATTAGS.length; t++) {
                    var $row;
                    if (t % 2 === 0) $row = $('<tr>');
                    $('<td class="sname">').text(STATABBR[t]).appendTo($row);
                    var $s = $('<td>');
                    var s = +c[STATTAGS[t]] || 0;
                    var stt = this.opt('sttype');
                    if (stt === 'base') {
                        stat($s, 'base', s).toggleClass('maxed', s === cl[3][t]);
                    } else if (stt === 'avg') {
                        var avgd = s - Math.floor(cl[1][t] + (cl[2][t] - cl[1][t]) * (+c.Level - 1) / 19);
                        stat($s, 'avg', (avgd > 0 ? '+' : '') + avgd)
                            .addClass(avgd > 0 ? 'good' : (avgd < 0 ? 'bad' : ''))
                            .toggleClass('very', Math.abs(avgd) > 14);
                    } else if (stt === 'max') {
                        var l2m = cl[3][t] - s;
                        if (t < 2) l2m = l2m + ' (' + Math.ceil(l2m / 5) + ')';
                        stat($s, 'max', l2m)
                            .toggleClass('maxed', cl[3][t] <= s);
                    } else if (stt === 'comb') {
                        if (s < cl[3][t]) {
                            var avgd = s - Math.floor(cl[1][t] + (cl[2][t] - cl[1][t]) * (+c.Level - 1) / 19);
                            stat($s, 'small', s + ' / ' + cl[3][t])
                                .addClass(avgd > 0 ? 'good' : (avgd < 0 ? 'bad' : ''))
                                .toggleClass('very', Math.abs(avgd) > 14)
                                .attr('title', avgd + ' from avg');
                        } else {
                            stat($s, 'maxed', s)
                        }
                    }
                    $s.appendTo($row);
                    if (t % 2) $row.appendTo($stats);
                }
                $c.append($stats);
            }

            // items
            var eq = (c.Equipment || '').split(',');
            var tcount = [];
            var dobp = this.opt('backpack') && +c.HasBackpack;
            if (this.opt('equipment') || this.opt('inv') || dobp) {
                f = true;
                if ( this.loginOnly === false ) var itc = $('<div>').addClass('items');
                if (this.opt('equipment')) {
                    tcount = tcount.concat(eq.slice(0, 4));
                    if ( this.loginOnly === false ) itc.append(item_listing(eq.slice(0, 4), 'equipment'));
                }
                if (this.opt('inv')) {
                    tcount = tcount.concat(eq.slice(4, 12));
                    if ( this.loginOnly === false ) itc.append(item_listing(eq.slice(4, 12), 'inv'));
                }
                if (dobp) {
                    tcount = tcount.concat(eq.slice(12, eq.length));
                    if ( this.loginOnly === false ) itc.append(item_listing(eq.slice(12, eq.length), 'backpack'));
                }
                this.items.chars.push(tcount);
                if ( this.loginOnly === false ) itc.appendTo($c);
            }
            if ( this.loginOnly === false && this.opt('hpmp')) {
                var hpmp = $('<div class="w100">');
                var hp = $('<div class="hp cfleft">');
                var mp = $('<div class="mp fleft mr0">');
                hp.append(c.HealthStackCount);
                mp.append(c.MagicStackCount);
                hpmp.append(hp).append(mp);
                $c.append(hpmp);
            }

            //  keeping this separate from the wawawa code
            if ( this.loginOnly === false && this.opt('wawawa')) {

                if (setuptools.tmp.gaSentWawawa !== true) {

                    setuptools.tmp.gaSentWawawa = true;
                    setuptools.app.ga('send', 'event', {
                        eventCategory: 'options',
                        eventAction: 'wawawa'
                    });

                }

            }

            /*
            //  Wawawa Option
            //  https://github.com/wawawawawawawa/muledump
            //  https://github.com/jakcodex/muledump/pull/19
            //  Thank you, Wawawa!
            */
            /////////////////////////
            // WAWAWA PART
            if (this.loginOnly === false && this.opt('wawawa')) {

                setuptools.app.uaTiming('mule', 'parseWawawa', 'start', this.guid);
                function round(value, decimals) {
                    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
                }

                function apply_bonus(value) {
                    for (var k in bonuses) {
                        var b = bonuses[k](st, c, d, value);
                        if (!b) continue;
                        var incr = 0;
                        if (typeof b === 'object') {
                            incr += b.add;
                            b = b.mul; }
                        incr += Math.floor(value * b);
                        value += incr;
                    }
                    return value;
                }

                var st = readstats(c.PCStats); 			//FAME
                var iTotalFame = +c.CurrentFame;
                var fame = +c.CurrentFame;
                var fbonus = [];
                fbonus.push('Base Fame : ' + iTotalFame.toLocaleString() + '\n\n');
                for (var k in bonuses) {
                    var b = bonuses[k](st, c, d, iTotalFame);
                    if (!b) continue;
                    var incr = 0;
                    if (typeof b === 'object') {
                        incr += b.add;
                        b = b.mul; }
                    incr += Math.floor(iTotalFame * b);
                    iTotalFame += incr;
                    fbonus.push(k + ' : +' + incr.toLocaleString() + ' Fame\n');
                }
                fbonus.push('\nTotal Fame : ' + iTotalFame.toLocaleString() + ' Fame' + '\n\nFirst Born : ' + d.Account.Stats.BestCharFame);

                var lower = 0;
                var upper = d.Account.Stats.BestCharFame;
                if (upper - lower === 1) {
                    upper = +c.CurrentFame + 1;
                }
                while (upper - lower > 1) {
                    var middle = lower + Math.floor((upper - lower) / 2);
                    var current = apply_bonus(middle);
                    if (current >= d.Account.Stats.BestCharFame) {
                        upper = middle;
                    } else {
                        lower = middle;
                    }
                }
                if (apply_bonus(+c.CurrentFame) < d.Account.Stats.BestCharFame) {
                    var upperleft = upper - +c.CurrentFame;
                    fbonus.push('\nBase Fame Needed for First Born : ' + upper.toLocaleString() + ' (' + upperleft.toLocaleString() + ' Base Fame Left)');
                }

                var $table = $('<table class="wawawa pcstats">');

                function statOut(stat, value, tooltip, color){
                    $('<tr>').append($(' \
                        <td>' + stat + '</td> \
                        <td class="' + color + ' pcstat"> ' + value + '</td>'
                        ).attr('title', tooltip))
                    .appendTo($table);
                }


                // Total Fame
                var fameColor = "bad";
                if(iTotalFame > 400){ fameColor = "great"; }
                if(iTotalFame > 2000){ fameColor = "perfect"; }
                statOut('Total Fame', iTotalFame.toLocaleString() + ' Fame ', fbonus.join(''), fameColor);

                // Time Active
                var v = st[20], ATime = [];			//TIME
                var FPM = round(fame / v, 2) + ' Base Fame/Minute\n' + round(iTotalFame / v, 2) + ' Total Fame/Minute\nFame Boost : ' + round((iTotalFame / fame) * 100, 2) + ' %';
                var divs = { 'y': 525600, 'm': 43200, 'd': 1440, 'h': 60, 'min': 1 };
                for (var s in divs) {
                    if (ATime.length > 4) break;
                    var t = Math.floor(v / divs[s]);
                    if (t) ATime.push(t + s);
                    v %= divs[s];
                }

                var timeColor = "bad";
                if(st[20] > 10) { timeColor = "good"; }
                if(st[20] > 60){ timeColor = "great"; }
                if(st[20] > 60){ timeColor = "perfect"; }

                if (ATime === "") {
                    statOut('Active Time', ' < 1 min', FPM, "bad")
                } else {
                    statOut('Active Time', ATime.join(' '), FPM, timeColor)
                }

                // Tiles Uncovered
                var TilesDone = st[3].toLocaleString();			// TILES
                var TPM = round(st[3] / st[20], 0);
                var TilesData = [];
                var TilesLeft = 4e6 - st[3] + 1;
                if (TilesLeft <= 0) {
                    TilesLeft = '';
                    TilesData.push(TPM.toLocaleString() + ' Tiles/Minute');
                }
                if (TilesLeft > 0) {
                    var vCart = round((4e6 - st[3] + 1) / round(st[3] / st[20], 0), 0), TilesTime = [];
                    for (var sCart in divs) {
                        if (TilesTime.length > 4) break;
                        var tCart = Math.floor(vCart / divs[sCart]);
                        if (tCart) TilesTime.push(tCart + sCart);
                        vCart %= divs[sCart];
                    }
                    if (TilesLeft > 3e6) {
                        var TilesLeftExpl = TilesLeft - 3e6;
                        var vExpl = round((1e6 - st[3] + 1) / round(st[3] / st[20], 0), 0), TilesTimeExpl = [];
                        for (var sExpl in divs) {
                            if (TilesTimeExpl.length > 4) break;
                            var tExpl = Math.floor(vExpl / divs[sExpl]);
                            if (tExpl) TilesTimeExpl.push(tExpl + sExpl);
                            vExpl %= divs[sExpl];
                        }
                        TilesLeft = 'Explorer : ' + TilesLeftExpl.toLocaleString() + ' Tiles Left\nAverage Time Left : ' + TilesTimeExpl.join(' ') + ' Left\nCartographer : ' + TilesLeft.toLocaleString() + ' Tiles Left\nAverage Time Left : ' + TilesTime.join(' ') + ' Left';
                    }
                    else {
                        TilesLeft = 'Cartographer : ' + TilesLeft.toLocaleString() + ' Tiles Left\nAverage Time Left : ' + TilesTime.join(' ') + ' Left';
                    }
                    TilesData.push(TPM.toLocaleString() + ' Tiles/Minute\n\n' + TilesLeft);
                }

                var tilesColor = "bad";
                if(st[3] > 0) { tilesColor = "good"; }
                if(st[3] > 1e6){ tilesColor = "great"; }
                if(st[3] > 4e6){ tilesColor = "perfect"; }

                statOut('Tiles', TilesDone, TilesData, tilesColor)


                //Tunnel Rat
                var QuestName = {			// TUNNEL RAT
                    13: 'Pirate Caves',
                    14: 'Undead Lairs',
                    15: 'Abysses Of Demons',
                    16: 'Snake Pits',
                    17: 'Spider Dens',
                    18: 'Sprite Worlds',
                    21: 'Tombs',
                    22: 'Trenches',
                    23: 'Jungles',
                    24: 'Manors',
                    25: 'Forest Mazes',
                    26: 'Lair Of Draconis',
                    28: 'Haunted Cemetarys',
                    29: 'Caves Of A Thousand Treasures',
                    30: 'Mad Labs',
                    31: 'Davy Jones Lockers',
                    34: 'Ice Caves',
                    35: 'Deadwater Docks',
                    36: 'Crawling Depths',
                    37: 'Woodland Labyrinths',
                    38: 'Battles for Nexus',
                    39: 'Shatters',
                    40: 'Belladonnas Gardens',
                    41: 'Puppet Masters Theatres',
                    42: 'Sewers',
                    43: 'Hives',
                    44: 'Temples',
                    45: 'Nests',
                    46: 'Lair Of Draconis(Hard)',
                    47: 'Lost Halls',
                    48: 'Cultist Hideouts',
                    49: 'Voids',
                };
                var QuestList = [];
                var QuestMiss = [];
                for (m in QuestName) {
                    if (st[m] !== 0) {
                        if (QuestList === '') {
                            QuestList.push(st[m].toLocaleString() + ' ' + QuestName[m]);
                        }
                        else {
                            QuestList.push('\n' + st[m].toLocaleString() + ' ' + QuestName[m]);
                        }
                    }
                    else {
                        if (QuestMiss === '') {
                            QuestMiss.push(st[m] + ' ' + QuestName[m]);
                        }
                        else {
                            QuestMiss.push('\n' + st[m] + ' ' + QuestName[m]);
                        }
                    }
                }
                var TratQuest = [];
                for (m in shortdungeonnames) {
                    if ( shortdungeonnames.hasOwnProperty(m) ) {
                        if (st[m] === 0) {
                            if (TratQuest === '') {
                                TratQuest.push(st[m] + ' ' + shortdungeonnames[m]);
                            }
                            else {
                                TratQuest.push('\n' + st[m] + ' ' + shortdungeonnames[m]);
                            }
                        }
                    }
                }

                if (TratQuest.length === 0) {
                    if (QuestMiss.length === 0) {
                        statOut('Epic Tunnel Rat', "Complete", QuestMiss.join(' '), "perfect")
                    }
                    else {
                        statOut('Tunnel Rat', "Done", 'Remaining Uncompleted Dungeons\n' + QuestMiss.join(' ').replace(/(0 )/g, ''), "green")
                    }
                }
                else {
                    var tunnelColor = "bad";
                    var tunnelText = "Not Started"

                    if(TratQuest.length < 10) { tunnelColor = "good"; tunnelText = "In Progress" }
                    if(TratQuest.length < 5){ tunnelColor = "great"; tunnelText = "In Progress" }

                    statOut('Tunnel Rat', tunnelText, TratQuest.join(' '), tunnelColor)
                }


                //Oryx Kills
                var OKill = st[11];			// ORYX KILL

                if (OKill < 1) {
                    statOut('Oryx Kills', OKill, '', 'bad')
                }
                else {
                    statOut('Oryx Kills', OKill.toLocaleString(), '', 'perfect')
                }

                //Accuracy
                var ShotData = [];			// ACCURACY
                var iAcc = round(100 * st[1] / st[0], 2);
                var l2Acc = (0.75 * st[0] - st[1]) / 0.25;
                if (Math.ceil(l2Acc) === l2Acc) l2Acc += 1;
                var l2Acc2 = (0.5 * st[0] - st[1]) / 0.5;
                if (Math.ceil(l2Acc2) === l2Acc2) l2Acc2 += 1;
                var l2Acc3 = (0.25 * st[0] - st[1]) / 0.75;
                if (Math.ceil(l2Acc3) === l2Acc3) l2Acc3 += 1;

                l2Acc = 'Accurate : ' + Math.ceil(l2Acc3).toLocaleString() + ' Shots Left\nSharpshooter : ' + Math.ceil(l2Acc2).toLocaleString() + ' Shots Left\nSniper : ' + Math.ceil(l2Acc).toLocaleString() + ' Shots Left';;

                ShotData.push('Shots : ' + st[0].toLocaleString() + '\nHits : ' + st[1].toLocaleString() + '\nAbility : ' + st[2].toLocaleString() + '\n\n' + l2Acc);

                var accColor = "bad";
                if(iAcc > 25) { accColor = "good"; }
                if(iAcc > 50){ accColor = "great"; }
                if(iAcc > 75){ accColor = "perfect"; }

                statOut('Accuracy', iAcc + ' % ', ShotData, accColor)


                //Gods Killed
                var GodKillRatio = round(100 * st[8] / (st[6] + st[8]), 2);			// GOD KILL
                var GodData =[];
                var GodKillLeft = st[6] - st[8] + 1;
                var tenpercent = st[6] / 9 - st[8];
                GodData.push('Monster Kills : ' + st[6].toLocaleString() + '\nGod Kills : ' + st[8].toLocaleString() + '\n\nEnemy of the Gods : ' + Math.ceil(tenpercent).toLocaleString() + ' Kills Left\nSlayer of the Gods : ' + GodKillLeft.toLocaleString() + ' Kills Left');

                var godsColor = "bad";
                if ( $.isNumeric(GodKillRatio) === false ) GodKillRatio = 0;
                if(GodKillRatio > 0) { godsColor = "good"; }
                if(GodKillRatio > 10){ godsColor = "great"; }
                if(GodKillRatio > 50){ godsColor = "perfect"; }

                statOut('God Kill Ratio', GodKillRatio + ' %', GodData, godsColor)

                // Party Level Ups
                var LvlUp = st[19];			// LEVEL UP
                var LvlUpLeft = 1000 - st[19] + 1;
                if (LvlUpLeft > 0) {
                    if (LvlUpLeft > 900) {
                        var LvlUpLeft2 = LvlUpLeft - 900;
                        LvlUpLeft = 'Team Player : ' + LvlUpLeft2.toLocaleString() + ' Level Up Left\nLeader of Men : ' + LvlUpLeft.toLocaleString() + ' Level Up Left';
                    }
                    else {
                        LvlUpLeft = 'Leader of Men : ' + LvlUpLeft.toLocaleString() + ' Level Up Left';
                    }
                }
                if (LvlUpLeft <= 0) LvlUpLeft = '';

                var lvlColor = "bad";
                if(LvlUp > 0) { lvlColor = "good"; }
                if(LvlUp > 100){ lvlColor = "great"; }
                if(LvlUp > 1000){ lvlColor = "perfect"; }

                statOut('Level Up', LvlUp.toLocaleString(), LvlUpLeft, lvlColor)


                // Quests Complete
                var QuestDone = st[12]; 		// QUESTS
                if (QuestDone < 1001) {
                    QuestDone = QuestDone.toLocaleString() + ' / 1000';
                }
                else {
                    QuestDone = QuestDone.toLocaleString();
                }

                var questsColor = "bad";
                if(st[12] > 1) { questsColor = "good"; }
                if(st[12] > 500){ questsColor = "great"; }
                if(st[12] > 1000){ questsColor = "perfect"; }

                statOut('Quests Completed', QuestDone, QuestList.join(' '), questsColor)

                $table.appendTo($c);
                setuptools.app.uaTiming('mule', 'parseWawawa', 'stop', this.guid);

            }
            // WAWAWA PART END
            /////////////////////////

            if (this.opt('pcstats') || this.opt('goals')) {
                f = true;
                $c.append(window.printstats(c, d, this.opt('goals'), this.opt('pcstats'), this));
            }
            arr.push($c);

            setuptools.app.uaTiming('mule', 'mainCharLoopTimer', 'stop', this.guid);

        }

        if (f) {
            this.dom.append($('<hr class="chars">'));
            maketable('chars', arr).appendTo(this.dom);
        }
        arr = [];

        //  record cummulative timing data
        setuptools.app.ga('timing', {
            category: 'mule',
            key: 'parseMainCharacterLoop',
            value: timing.aggregate['mule-mainCharLoopTimer'].mean
        });

        function makechest(items, classname) {
            var il = item_listing(items.slice(0, 8), classname)
            return $('<div class="items">').append(il)
        }

        // select the vault order for this char
        vaultlayout = ( this.opt('vaultlayout') ) ? this.opt('vaultlayout') : window.vaultlayout;
        vaultwidth = ( typeof window.vaultorders[vaultlayout] === 'object' && window.vaultorders[vaultlayout].vaultwidth ) ? window.vaultorders[vaultlayout].vaultwidth : ROW;
        VAULTORDER = window.vaultorders[vaultlayout].vaultorder;

        //  vaults
        if (this.opt('vaults')) {

            setuptools.app.uaTiming('mule', 'parseVaults', 'start', this.guid, false, setuptools.app.uaTimingAggregate);
            if ( this.loginOnly === false ) this.dom.append($('<hr class="vaults">'));

            var chests = d.Account.Vault ? d.Account.Vault.Chest || ['-1'] : ['-1'];
            if (typeof chests === 'string') chests = [chests];
            if ( typeof chests === 'object' && Object.keys(chests).length === 0 ) chests = ['-1'];
            var w = arrangevaults(chests);
            chests = w[1];
            for (x = 0; x < chests.length; x++) {

                //  non-existent chests are skipped
                if ( typeof chests[x] !== "string" ) {

                    //  this is a spacer
                    if ( chests[x] === 0 ) {

                        arr.push(null);
                        continue;

                    }

                    //  empty chests are empty
                    if ( typeof chests[x] === 'object' ) chests[x] = '-1,-1,-1,-1,-1,-1,-1,-1';

                }

                var chest = (chests[x] || '-1').split(',');
                while (chest.length < 8) chest.push('-1');
                this.items.vaults.push(chest);
                arr.push(makechest(chest, 'vaults'));

            }
            if ( this.loginOnly === false ) maketable('vaults', arr, w[0]).appendTo(this.dom);
            setuptools.app.uaTiming('mule', 'parseVaults', 'stop', this.guid);

        }

        // gift chest
        if (this.opt('gifts')) {

            setuptools.app.uaTiming('mule', 'parseGifts', 'start', this.guid, false, setuptools.app.uaTimingAggregate);
            if ( this.loginOnly === false ) this.dom.append($('<hr class="gifts">'));
            var gifts = d.Account.Gifts;
            if ( typeof gifts === 'string' ) {
                var items = gifts.split(',').reverse();
                this.items.gifts.push(items);  // for totals
                var garr = [];
                while (items.length) {
                    while (items.length < 8) items.push(-1);
                    garr.push(makechest(items, 'gifts'));
                    items = items.slice(8);
                }
                if ( this.loginOnly === false ) maketable('gifts', garr, ( (setuptools.data.config.giftChestWidth === 0) ? setuptools.data.config.rowlength : setuptools.data.config.giftChestWidth )).appendTo(this.dom);
            }
            setuptools.app.uaTiming('mule', 'parseGifts', 'stop', this.guid);

        }

        setuptools.app.uaTiming('mule', 'parse', 'stop', this.guid);

        if ( this.loginOnly === false ) {

            this.loaded = true;
            this.dom.css('display', 'inline-block');
            relayout();

        }

    };

    window.Mule = Mule


})($, window);
