(function($, window) {

function render_totals(callback, override) {

    var totals = window.totals;
    var ids = window.ids;
    var items = window.items;
    var filter = window.filter;
    var $totals = $('#totals');

    //  set items value if provided
    if ( typeof override !== 'object' && setuptools.data.config.totalsExportWidth > 0 ) override = {
        items: setuptools.data.config.totalsExportWidth
    };

    //  set items value to match totalswidth
    if ( typeof override !== 'object' && setuptools.data.config.totalsExportWidth === -1 && setuptools.data.config.totalswidth > 0 ) override = {
    	items: setuptools.data.config.totalswidth
	};

    //  create a default object
	if ( typeof override !== 'object' ) override = {};

	//  automatically determine export width and height if items is set
	if ( $.isNumeric(override.items) ) {

		override.w = override.items*44;
		override.h = Math.ceil(Object.keys(totals).length/override.items)*44;

	}

	//  set the width and height
    var w = override.w || $totals.innerWidth(), h = override.h || $totals.innerHeight();

    //  prepare our image
    var img = new Image();
    	img.src = renders,
    	c = document.createElement("canvas"),
        ct = c.getContext("2d");

    //  draw the image
    function render() {

		c.width = w; c.height = h;
		ct.font = 'bold 15px Arial,sans-serif';
		ct.textBaseline = 'bottom';
		ct.textAlign = 'right';
		ct.shadowColor = 'black';
		ct.fillStyle = '#363636';
		ct.fillRect(0, 0, c.width, c.height);
		ct.fillStyle = '#545454';
		ct.strokeStyle = '#fefe8e';
		ct.lineWidth = 2;
		var m = (h - Math.floor(h / 44) * 44 + 4) / 2;
		var x = m, y = m;
		for (var i = 0; i < ids.length; i++) {
			var id = ids[i], it = items[id];
			if (!totals[id]) continue;
			ct.save();
			ct.translate(x, y);
			if (id in filter) ct.fillStyle = '#ffcd57';
			ct.fillRect(0, 0, 40, 40);
			if (id in filter) ct.strokeRect(0, 0, 40, 40);
			ct.drawImage(img, it[3], it[4], 40, 40, 0, 0, 40, 40);
			if (totals[id] > 1) {
				ct.save();
				ct.fillStyle = 'white';
				ct.shadowBlur = 3;
				for (var k = 0; k < 4; k++) {
					ct.shadowOffsetX = k % 2 ? k - 2 : 0;
					ct.shadowOffsetY = k % 2 ? 0 : k - 1;
					ct.fillText(totals[id], 36, 38);
				}
				ct.restore();
			}
			ct.restore();
			x += 44;
			if (w - x < 40) { x = m; y += 44; }
		}

		if ( callback ) callback(c.toDataURL());

	}

	img.onload = render;

    img.onerror = function() {

		$.featherlight('<p>There was an error while loading the renders.png file. <br><br>Please make sure you have a working Internet connection and try again.</p>');
        setuptools.app.ga('send', 'event', {
            eventCategory: 'detect',
            eventAction: 'export-img-loadError'
        });

    };

}

window.render_totals = render_totals;

})($, window);
