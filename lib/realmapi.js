(function($, window) {

var BASEURL = window.BASEURL = [
	'https://realmofthemadgodhrd.appspot.com/',
	'https://rotmgtesting.appspot.com/'
];

var _cnt = 0;
function queue_request(obj) {
	var oc = obj.complete;
	obj.complete = function() {
		if (oc) oc.apply(this, arguments);
		_cnt = $(document).queue('ajax').length;
		update_counter();
		$(document).dequeue('ajax');
	}
	if (_cnt) {
		$(document).queue('ajax', function(){ $.ajax(obj) });
	} else {
		$.ajax(obj);
	}
	_cnt++;
	update_counter();
}

function update_counter() {
	$('#counter').text(_cnt).parent().toggle(!!_cnt);
}


function realmAPI(path, opts, extraopts, callback) {
	opts.ignore = Math.floor(1e3 + 9e3 * Math.random());
    var url = window.BASEURL + path + '?' + $.param(opts) + '&muleDump=true';

	if (typeof extraopts == 'function') {
		callback = extraopts;
		extraopts = {}
	}

	//  account assistant helps with migration, tos verification, and kongregate age verification
    if (extraopts.url && setuptools.data.config.accountAssistant === true ) {
        setuptools.app.assistants.account(url, extraopts, callback);
        return;
    }

	window.techlog("RealmAPI call to - " + url.replace(/&(password|secret)=(.*?)&/g, '&***hidden***&'));

    queue_request({
        dataType: 'text',
        url: url,
		cors: true,
        complete: callback
    })
}

window.realmAPI = realmAPI

})($, window);

