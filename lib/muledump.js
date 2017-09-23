(function($, window) {

var VERSION = '0.8.0';
var PREVIEWRELEASE = '5';

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
			You are on the latest version. \
			<br><br><a href="' + setuptools.config.url + '/CHANGELOG" class="drawhelp nostyle" target="_blank">v' + VERSION + ' Changelog</a> | \
			<a href="' + setuptools.config.url + '/" target="_blank">Muledump Homepage</a> \
			<br><br>Did you know Muledump can be loaded from Github now? \
			<br><br>Check out <a href="' + setuptools.config.url + '/muledump.html" target="_blank">Muledump Online</a> to see it in action. \
		');

        if ( setuptools.loaded === true && setuptools.data.config.enabled === true ) {

            setuptools.lightbox.build('muledump-about', ' \
				<br><br>Create and download a <a href="#" class="setuptools app backups">backup</a> from here to get online fast. \
			');

        }

	}

	function DisplayMessage() {

        setuptools.lightbox.settitle('muledump-about', '<strong>Muledump Local v' + VERSION + ( (PREVIEWRELEASE !== false) ? '-' + PREVIEWRELEASE : '' ) + '</strong>');
        setuptools.lightbox.display('muledump-about', {variant: 'setuptools-small'});
        $('.setuptools.app.backups').click(setuptools.app.backups.index);
        $('.drawhelp').click(setuptools.lightbox.ajax);

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
					url = d[i].zipball_url;
				}
			}

			//  display the lightbox if a url is provided
			window.techlog("Update found: " + url, 'hide');

			if (url) {
				DoDisplayMessage = true;
				setuptools.lightbox.build('muledump-about', ' \
					Version ' + topver + ' is now available: <a href="' + url + '">' + url + '</a> \
					<br><br>The changelog can be viewed here: <a href="https://jakcodex.github.io/muledump/CHANGELOG" data-featherlight="ajax">https://jakcodex.github.io/muledump/CHANGELOG</a> \
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
	return {running: false, busy: false, active: '', cancelled: 0, done: 0, total: Object.keys(mules).length, startTime: new Date().toISOString(), mules: {}};
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
	if ( setuptools.hosted === false ) {
		checkupdates();
    } else $('#update').html('about');

	$('#reloader').click(function() {
		//  create our base queue object
        if ( typeof window.MuleQueue === 'undefined' ) window.MuleQueue = new MQObject(mules);
        if ( window.MuleQueue.running === true ) {

        	//  cancel the queue
            for ( var i in window.MuleQueue.mules ) {

            	if ( window.MuleQueue.mules.hasOwnProperty(i) ) {

                    //  clear the timeout to stop pending tasks
                    if (window.MuleQueue.mules[i].status == 'queue') {

                        clearTimeout(window.MuleQueue.mules[i].timer);
                        mules[i].queueFinish(i, 'cancelled');
                        window.MuleQueue.cancelled++;

                    }

                    //  remove the overlay
                    if (window.MuleQueue.mules[i].status !== 'ok' || window.MuleQueue.mules[i].status !== 'error') mules[i].query(false, true);

                }

            }

            window.MuleQueue.running = false;
            window.MuleQueue.busy = false;
            window.techlog("MQ/QueueCancelled " + window.MuleQueue.cancelled + " requests (running requests will finish)", 'force');
            $(this).html("reload all");

		} else {

        	//  only if there are loaded accounts
        	if ( typeof mules === 'object' && Object.keys(mules).length > 0 ) {

                //  increment the reload counter
                window.ReloadCount++;

                //  load items into the queue
                window.MuleQueue = new MQObject(mules);
                for (var i in mules) mules[i].queueStart(i, false, 'nocache');
                $(this).html("cancel reload");

            }

        }
	});

	$('#options').prev().click(function() {
		var $o = $('#options');
		if ($o.attr('style')) $o.attr('style', ''); else $o.css('display', 'block');
	});

	$('#update').bind('click', function() {
        if ( setuptools.hosted === false ) {
        	checkupdates(true);
        } else {

            setuptools.lightbox.build('muledump-checkupdates', ' \
				You are using Muledump Online. \
				 <br><br>The current version is ' + VERSION + ' \
			');

            if ( PREVIEWRELEASE ) setuptools.lightbox.build('muledump-checkupdates', ' preview release ' + PREVIEWRELEASE);

            setuptools.lightbox.build('muledump-checkupdates', ' \
				<br><br>See all version notes in the <a href="https://' + setuptools.config.hostedDomain + '/muledump/CHANGELOG" target="_blank">Changelog</a>. \
				<br><br>This version is updated automatically with new releases. \
			');

            setuptools.lightbox.settitle('muledump-checkupdates', 'Muledump Online');
            setuptools.lightbox.display('muledump-checkupdates');

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
