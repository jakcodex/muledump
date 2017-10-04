(function($, window) {

    var VERSION = '0.' + setuptools.version.major + '.' + setuptools.version.minor;
    var PATCHVERSION = setuptools.version.patch;
    setuptools.tmp.corsAttempts = 0;

// version check

    function cmpver(v1, v2) {
        v1 = v1.split('.'); v2 = v2.split('.');
        for (var i = 0; i < v1.length && i < v2.length; i++) {
            var r = v1[i] - v2[i];
            if (r) return r;
        }
        return v1.length - v2.length;
    }

//  check for updates and display a lightbox with the results
    function checkupdates(force) {

        function BaseMessage() {

            setuptools.lightbox.build('muledump-about', ' \
			You are on the latest release. \
			<br><br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp nostyle" target="_blank">v' + VERSION + ' Changelog</a> | \
			<a href="' + setuptools.config.url + '/" target="_blank">Muledump Homepage</a> \
			<br><br>Did you know Muledump can be loaded from Github now? \
			<br><br>Check out <a href="' + setuptools.config.url + '/muledump.html" target="_blank">Muledump Online</a> to see it in action. \
		');

            if ( setuptools.loaded === true && setuptools.data.config.enabled === true ) {

                setuptools.lightbox.build('muledump-about', ' \
				<br><br>Create and download a <a href="#" class="setuptools app backups noclose">backup</a> from here to get online fast. \
			');

            }

        }

        function DisplayMessage() {

            //  this override will cause goback to simply close the backup manager and return to the open update screen
            //  basically we're trying to keep github api calls to a minimum
            setuptools.lightbox.override('backups-index', 'goback', function() { });
            setuptools.lightbox.settitle('muledump-about', '<strong>Muledump Local v' + VERSION + ( (PATCHVERSION !== false) ? '-' + PATCHVERSION : '' ) + '</strong>');
            setuptools.lightbox.display('muledump-about', {variant: 'setuptools-small', closeSpeed: 0, openSpeed: 0});
            $('.setuptools.app.backups').click(setuptools.app.backups.index);
            $('.drawhelp').click(function(e) {
                setuptools.lightbox.ajax(e, {title: 'About Muledump', url: $(this).attr('href')}, this);
            });

        }

        var DoDisplayMessage = false;

        if (force === true || (!force && options.updatecheck === true)) {

            var xhr = $.ajax({
                dataType: 'jsonp',
                url: 'https://api.github.com/repos/jakcodex/muledump/tags'
            });

            xhr.then(function() {
                if ( DoDisplayMessage === true ) DisplayMessage();
            });

            xhr.fail(function() {
                BaseMessage();
                DoDisplayMessage = true;
            });

            xhr.done(function (data) {

                if (data.meta.status != 200 && force === true) {
                    BaseMessage();
                    DoDisplayMessage = true;
                    return;
                }
                var d = data.data, topver = VERSION, url;
                for (var i = 0; i < d.length; i++) {
                    if (cmpver(d[i].name, topver) > 0) {
                        topver = d[i].name;
                        url = 'https://github.com/jakcodex/muledump/archive/' + topver + '.zip';
                    }
                }

                //  display the lightbox if a url is provided
                window.techlog("Update found: " + url, 'hide');

                if (url) {
                    DoDisplayMessage = true;
                    setuptools.lightbox.build('muledump-about', ' \
					Release ' + topver + ' is now available: \
					<br><a href="' + url + '">' + url + '</a> \
					<br><br>The changelog can be viewed here: \
					<br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp nostyle" target="_blank">https://jakcodex.github.io/muledump/CHANGELOG</a> \
					<br><br>You can disable this startup check in the options menu. \
				');
                }

                if (force === true && !url) {

                    DoDisplayMessage = true;
                    BaseMessage();

                }

            });

        } else window.techlog("Skipping auto update check", 'hide');

    }

    function techlog(msg, type) {

        if ( !type ) type = "string";

        //  prepare debug settings
        if ( window.verbosity ) verbosity = window.verbosity;

        //  debug logging to console
        if ( (window.debugging === true && type === 'string') || type === 'force' ) console.log(msg);

        //  process tech report if enabled
        if ( type !== 'hide' && options.techreport === true ) {

            //  strip sensitive data from messages
            if ( typeof msg === 'object' ) msg = JSON.stringify(msg);
            msg = msg.replace(/<PaymentData>{"token": "(.*?)"/g, '<PaymentData>{"token": "***"');
            msg = msg.replace(/"PaymentData":"{\\"token\\": \\"(.*?)\\"/g, '"PaymentData":"{\\"token\\": \\"***\\"');
            msg = msg.replace(/"Name":".*?"/g, '{"Name":"***"}');
            msg = msg.replace(/<Name>.*?<\/Name>/g, "<Name>***</Name>");
            msg = msg.replace(/guid=(.*?)&(password|secret)=(.*?)&/g, '***hidden***&');
            msg = msg.replace(/(((steamworks|kongregate|kabam):[a-zA-Z0-9]*)|([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}))/g, function(match) {
                return $.sha256(match);
            });

            //  make it html friendly
            msg = msg.replace(/</g, "&lt;");
            msg = msg.replace(/>/g, "&gt;");
            $("#techreport").append("<div>" + msg + "<br><br></div>\n");

        }
    }

    var mules = window.mules = {};
    var techreport = window.techreport = false;
    var techlog = window.techlog = techlog;

// document load

    var accounts;
    var Mule = window.Mule;
    var MQObject = function(mules) {
        return {running: false, busy: false, pause: false, active: '', paused: 0, cancelled: 0, done: 0, total: Object.keys(mules).length, startTime: new Date().toISOString(), mules: {}};
    };
    window.MQObject = MQObject;

    if ( window.debugging == true ) setInterval(function() {
        window.techlog("MQ Status --", 'hide');
        window.techlog(window.MuleQueue, 'hide');
    }, 5000);

    $(function() {

        setuptools.init.main(window);

        $.ajaxSetup({
            cache: false,
            timeout: 5000
        });

        $('body').delegate('.item', 'click', window.toggle_filter);
        $('body').delegate('.guid', 'click', function(){ this.select(); });

        //  check for updates if auto check is enabled
        if ( setuptools.config.devForcePoint !== 'online-versioncheck' && setuptools.state.hosted === false ) {
            checkupdates();
        } else {

            $('#update').html('about');

            function alertNewVersion() {

                if ( setuptools.state.loaded === true ) {

                    //  display the message
                    setuptools.lightbox.build('muledump-alertNewVersion', ' \
                        Muledump Online has been updated to a new ' + ( (setuptools.data.config.alertNewVersion === 2) ? 'version' : 'release' ) + '. \
                        <br><br>The changelog can be viewed here: \
                        <br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp nostyle" target="_blank">https://jakcodex.github.io/muledump/CHANGELOG</a> \
                        <br><br>You can disable this startup check in the <a href="#" class="setuptools app link settingsmanager">Settings Manager</a>. \
                    ');
                    setuptools.lightbox.settitle('muledump-alertNewVersion', '<strong>Muledump Online v' + VERSION + ( (PATCHVERSION !== false) ? '-' + PATCHVERSION : '' ) + '</strong>');
                    setuptools.lightbox.display('muledump-alertNewVersion', {
                        variant: 'setuptools-small',
                        closeSpeed: 0,
                        openSpeed: 0
                    });
                    $('.drawhelp').click(function (e) {
                        setuptools.lightbox.ajax(e, {title: 'Muledump Changelog', url: $(this).attr('href')}, this);
                    });
                    $('.setuptools.app.link.settingsmanager').click(setuptools.app.config.settings);

                }

                //  update the configuration
                setuptools.data.version = setuptools.version;
                if ( setuptools.state.loaded === true ) setuptools.app.config.save();

            }

            //  we need to know when to save
            if ( Object.keys(setuptools.data.version).length === 0 ) alertNewVersion();

            //  notify on all version changes
            if ( setuptools.data.config.alertNewVersion === 2 ) {

                if ( setuptools.version.major > setuptools.data.version.major || setuptools.version.minor > setuptools.data.version.minor || PATCHVERSION > setuptools.data.version.patch ) alertNewVersion();

                //  notify on new releases only
            } else if ( setuptools.data.config.alertNewVersion === 1 ) {

                if ( setuptools.version.major > setuptools.data.version.major || setuptools.version.minor > setuptools.data.version.minor ) alertNewVersion();

            }

            //  always save on new versions
            if ( setuptools.version.major > setuptools.data.version.major || setuptools.version.minor > setuptools.data.version.minor || PATCHVERSION > setuptools.data.version.patch ) {

                setuptools.data.version = setuptools.version;
                if ( setuptools.state.loaded === true ) setuptools.app.config.save();

            }

        }

        $('#reloader').click(function() {
            //  create our base queue object
            if ( typeof window.MuleQueue === 'undefined' ) window.MuleQueue = new MQObject(mules);

            //  pause the queue
            if ( window.MuleQueue.running === true && window.MuleQueue.pause === false ) {

                for ( var i in window.MuleQueue.mules ) {

                    if (window.MuleQueue.mules.hasOwnProperty(i)) {

                        //  clear the timeout to stop pending tasks
                        if (window.MuleQueue.mules[i].status == 'queue') {

                            clearTimeout(window.MuleQueue.mules[i].timer);
                            window.MuleQueue.paused++;
                            window.MuleQueue.mules[i].status = 'paused';

                        }

                    }

                }

                window.MuleQueue.running = false;
                window.MuleQueue.pause = true;
                $(this).html("cancel reload");
                $('#resume').show();
                $('#resume').unbind('click').click(function() {

                    window.MuleQueue.pause = false;
                    window.MuleQueue.paused = 0;
                    var isFirst = 0;
                    for ( var i in window.MuleQueue.mules ) {

                        if (window.MuleQueue.mules.hasOwnProperty(i)) {

                            if ( window.MuleQueue.mules[i].status === 'paused' ) {

                                window.MuleQueue.mules[i].status = 'queue';
                                mules[i].queueWait(i, false, 'nocache', isFirst);
                                isFirst = false;

                            }

                        }

                    }

                    $('#reloader').html('pause reload');
                    $('#resume').hide();

                });

                window.techlog("MQ/QueuePause " + window.MuleQueue.paused + " requests (running requests will finish)", 'force');

                //  cancel the queue
            } else if ( window.MuleQueue.running === false && window.MuleQueue.pause === true && $(this).text() !== 'can\'t reload' ) {

                window.MuleQueue.running = true;
                for ( var i in window.MuleQueue.mules ) {

                    if ( window.MuleQueue.mules.hasOwnProperty(i) ) {

                        //  clear the timeout to stop pending tasks
                        if (window.MuleQueue.mules[i].status == 'paused') {

                            clearTimeout(window.MuleQueue.mules[i].timer);
                            mules[i].queueFinish(i, 'cancelled');
                            window.MuleQueue.cancelled++;

                        }

                        //  remove the overlay
                        if (window.MuleQueue.mules[i].status !== 'ok' || window.MuleQueue.mules[i].status !== 'error') mules[i].query(false, true);

                    }

                }

                window.MuleQueue.pause = false;
                window.MuleQueue.running = false;
                window.MuleQueue.busy = false;
                window.techlog("MQ/QueueCancelled " + window.MuleQueue.cancelled + " requests (running requests will finish)", 'force');
                $('#resume').hide();
                $(this).html("reload all");

            } else if ( typeof window.MuleQueue === 'undefined' || (window.MuleQueue.running === false && window.MuleQueue.pause === false) ) {

                //  only if there are loaded accounts
                if ( typeof mules === 'object' && Object.keys(mules).length > 0 && $(this).text() !== 'can\'t reload' ) {

                    //  increment the reload counter
                    window.ReloadCount++;

                    //  load items into the queue
                    setuptools.tmp.corsAttempts = 0;
                    window.MuleQueue = new MQObject(mules);
                    for (var i in mules) mules[i].queueStart(i, false, 'nocache');
                    $(this).html("pause reload");

                }

            }
        });

        $('#options').prev().click(function() {
            var $o = $('#options');
            if ($o.attr('style')) $o.attr('style', ''); else $o.css('display', 'block');
        });

        $('#update').bind('click', function() {
            if ( setuptools.state.hosted === false ) {
                checkupdates(true);
            } else {

                setuptools.lightbox.build('muledump-checkupdates', ' \
				You are on the latest version. \
				<br><br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp nostyle" target="_blank">v' + VERSION + ' Changelog</a> | \
				<a href="' + setuptools.config.url + '/" target="_blank">Muledump Homepage</a> \
				<br><br>Muledump Online is updated automatically with new versions. \
			');

                setuptools.lightbox.settitle('muledump-checkupdates', '<strong>Muledump Online v' + VERSION + ( (PATCHVERSION !== false) ? '-' + PATCHVERSION : '' ) + '</strong>');
                setuptools.lightbox.display('muledump-checkupdates');

                $('.drawhelp').click(function(e) {
                    setuptools.lightbox.ajax(e, {title: 'About Muledump', url: $(this).attr('href')}, this);
                });

            }
        });

        $('#techtoggle').click(function() {
            if ( window.techreport === false ) {

                $(this).html('disable debugging');
                window.techreport = true;

            } else {

                $(this).html('enable debugging');
                window.techreport = false;
                $('#techreport').empty();

            }
        });

        window.init_totals();

        setuptools.init.accounts();

        if (!window.nomasonry) {
            $('#stage').masonry({
                itemSelector : '.mule',
                columnWidth : 198,
                transitionDuration: 0
            });
        }

        relayout();
    });

    var mtimer;

    function relayout() {
        if (mtimer) return;
        mtimer = setTimeout(function() {
            window.update_totals();
            window.update_filter();
            if (!window.nomasonry) $('#stage').masonry('layout');
            mtimer = 0;
        }, 0);
    }

    window.relayout = relayout


})($, window)
