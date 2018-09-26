(function($, window) {

	//  handle ajax calls
	function queue_request(obj) {

		var oc = obj.complete;
		obj.complete = function() {
			if (oc) oc.apply(this, arguments);
			$(document).dequeue('ajax');
		};
		$.ajax(obj);

	}

	//  build and send requests to rotmg servers
	function realmAPI(path, opts, extraopts, callback) {

        if (typeof extraopts === 'function') {
            callback = extraopts;
            extraopts = {}
        }

        //  have encountered both being set for unknown reasons under certain situations
        if ( typeof opts.secret === 'string' && opts.password ) {
        	delete opts.password;
		}

		//  merge supplied options over default options and add random token
		opts = $.extend(true, {}, setuptools.config.realmApiParams, opts);
        opts.ignore = Math.floor(1e3 + 9e3 * Math.random());

        //  provide a default hostname and build the full request uri
		if ( extraopts.url === true ) delete extraopts.url;
        if ( !extraopts.url ) extraopts.url = setuptools.config.appspotProd;
        var url = extraopts.url + path + '?' + $.param(opts);

        //  account assistant helps with migration, tos verification, and kongregate age verification
        if (extraopts.url && extraopts.type && setuptools.data.config.accountAssistant === 1 ) {
        	if ( setuptools.state.assistant[extraopts.type] === true ) return;
        	if ( extraopts.type === 'tos' ) callback = function() {
                setuptools.state.assistant.tos = false;
			};
        	extraopts.guid = opts.guid;
            setuptools.app.assistants.account(url, extraopts, callback);
            return;
        }

        //  send the request to rotmg and route the response
		window.techlog('Muledump/RealmAPI requesting account - ' + opts.guid);
		queue_request({
			dataType: 'text',
			url: url,
			complete: callback,
			error: setuptools.app.assistants.xhrError,
            timeout: setuptools.config.realmApiTimeout
		})
	}

	window.realmAPI = realmAPI

})($, window);

