(function($, window) {

var VERSION = '0.7.5';

// version check

function cmpver(v1, v2) {
	v1 = v1.split('.'); v2 = v2.split('.');
	for (var i = 0; i < v1.length && i < v2.length; i++) {
		var r = v1[i] - v2[i];
		if (r) return r;
	}
	return v1.length - v2.length;
}

function checkversion() {
	function checkupd(data) {
		if (data.meta.status != 200) return;
		var d = data.data, topver = VERSION, url;
		for (var i = 0; i < d.length; i++) {
			if (cmpver(d[i].name, topver) > 0) {
				topver = d[i].name;
				url = d[i].zipball_url;
			}
		}
		var $u = $('#update');
		if (!url) {
			$u.text('latest version').delay(1000).hide(0);
			return;
		}
		var link = $('<a>').attr('href', url).text('download ' + topver);
		$u.replaceWith(link);
	}
	$.ajax({
		dataType: 'jsonp',
		url: 'https://api.github.com/repos/jakcodex/muledump/tags',
		complete: function(xhr) {
			xhr.done(checkupd);
		}
	});
}

function techlog(msg, type='string') {
	//  debug logging to console
	if ( (window.debugging === true && type === 'string') || type === 'force' ) console.log(msg);

	//  process tech report if enabled
	if ( window.techreport === true ) {

		//  strip sensitive data from messages
        msg = msg.replace(/<PaymentData>{"token": "(.*?)"/g, '<PaymentData>{"token": "***"');
        msg = msg.replace(/"PaymentData":"{\\"token\\": \\"(.*?)\\"/g, '"PaymentData":"{\\"token\\": \\"***\\"');
        msg = msg.replace(/"Name":".*?"/g, '{"Name":"***"}');
        msg = msg.replace(/<Name>.*?<\/Name>/g, "<Name>***</Name>");
        msg = msg.replace(/guid=(.*?)&(password|secret)=(.*?)&/g, '***hidden***&');
        msg = msg.replace(/(((steamworks|kongregate):[a-zA-Z0-9]*)|([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}))/g, function(match) {
        	return $.sha256(match);
		});

        //  make it html friendly
        msg = msg.replace(/</g, "&lt;");
        msg = msg.replace(/>/g, "&gt;");
		$("#techreport").append("<div>" + msg + "<br><br></div>\n");

	}
}

var mules = window.mules = {}
var techreport = window.techreport = false;
var techlog = window.techlog = techlog;

// document load

var accounts = window.accounts
var Mule = window.Mule
function MQObject(mules) {
	return {running: false, busy: false, active: '', done: 0, total: Object.keys(mules).length, startTime: new Date().toISOString(), mules: {}};
};

if ( window.debugging == true ) setInterval(function() {
	window.techlog("MQ Status --");
	window.techlog(window.MuleQueue);
}, 5000);

$(function() {

	$.ajaxSetup({
		cache: false,
		timeout: 5000
	});

	$('body').delegate('.item', 'click', window.toggle_filter);
	$('body').delegate('.guid', 'click', function(){ this.select(); });

	$('#reloader').click(function() {
		//  create our base queue object
        if ( typeof window.MuleQueue === 'undefined' ) window.MuleQueue = new MQObject(mules);
        if ( window.MuleQueue.running === true ) {

        	//  cancel the queue
            for ( var i in window.MuleQueue.mules ) {

				//  clear the timeout to stop pending tasks
                if ( window.MuleQueue.mules[i].status == 'queue') clearTimeout(window.MuleQueue.mules[i].timer);
                mules[i].queueFinish(i, 'cancelled');

                //  remove the overlay
				mules[i].query(false, true);

            }

            window.MuleQueue.running = false;
            window.MuleQueue.busy = false;
            window.techlog("MQ/QueueCancelled (running requests will finish)", 'force');
            $(this).html("reload all");

		} else {

            //  increment the reload counter
            window.ReloadCount++;

			//  load items into the queue
            window.MuleQueue = new MQObject(mules);
            for (var i in mules) mules[i].queueStart(i, false, 'reload');
            $(this).html("cancel reload");

        }
	});

	$('#options').prev().click(function() {
		var $o = $('#options');
		if ($o.attr('style')) $o.attr('style', ''); else $o.css('display', 'block');
	});

	$('#update').one('click', function() {
		$(this).text('loading...').css('cursor', 'default');
		checkversion();
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

	for (var i in accounts) {
		mules[i] = new Mule(i);
	}

    //  mule queries are now ran in serial instead of in parallel to account for Deca rate limiting
    window.MuleQueue = new MQObject(mules);

	//  Mule.queue is a new feature that rate limits querying to avoid the Deca block
	for (i in mules) mules[i].queueStart(i, false, 'query');

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
