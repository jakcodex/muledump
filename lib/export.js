(function($, window) {

var EXPORTS = 'txt csv json image imgur'.split(' ');

$(function() {
	var $ex = $('#export');
	for (var i = 0; i < EXPORTS.length; i++) {
		$ex.append($('<div>').text(EXPORTS[i].toUpperCase()));
	}
	$ex.on('click', 'div', export_totals);
});

function export_totals() {
	var ids = window.ids;
	var totals = window.totals;
	var items = window.items;

	function txtaggr(type) {
		var e = {txt: [], csv: [], json: {}};
		for (var i = 0; i < ids.length; i++) {
			var id = ids[i];
			if (!totals[id]) continue;
			var name = items[id][0], amt = totals[id];
			e.txt.push(amt + '\t' + name);
			e.csv.push('"' + name + '",' + amt);
			e.json[name] = amt;
		}
		e.txt = e.txt.join('\n');
		e.csv = e.csv.join('\n');
		e.json = JSON.stringify(e.json);
		return e[type];
	}
	var $this = $(this);
	var type = $this.text().toLowerCase();
	if (!~EXPORTS.indexOf(type)) return;

	//  produce the text export
	if ( type == 'txt' || type == 'csv' || type == 'json' ) {
		text = txtaggr(type);
        text = text.replace(/\n/g, "<br>");
        $.featherlight("<p>" + text + "</p>", {"variant": "lightbox"});
		return;
	}

	//  produce a local savable image
	if ( type == 'image' ) {

		render_totals(function(r) {

			$.featherlight('<p>Right click and choose "Save image as..." <br><br><img src="data:image/png;base64,' + r.split(',')[1] + '"></p>');

		});
		return;
	}

	//  process imgur upload
	render_totals(function(r) {

        $this.text('Uploading...');
        var req = imgur(r.split(',')[1]);

        req.always(function() {
            $this.text('IMGUR');
        }).done(function(data) {
            if (!data.success || !data.data) {
                $.featherlight('<p>imgur upload failed. received following:<br><br>' + JSON.stringify(data) + '</p>');
                return
            }
            $.featherlight('<p>Your image link: <a href="' + data.data.link + '">' + data.data.link + '</a><br><br><a href="' + data.data.link + '" target="_blank"><img src="' + data.data.link + '"></a></p>');
        }).fail(function(xhr, err, errDesc) {
        	if ( errDesc == 'timeout' ) {
        		$.featherlight('<p>Imgur upload failed due to a network timeout. Please try again later.</p>');
			} else $.featherlight('<p>imgur upload failed: ' + xhr.status + (errDesc ? ' ' + errDesc : '') + '</p>');
        });

	});

}

function render_totals(callback) {
    var totals = window.totals;
    var ids = window.ids;
    var items = window.items;
    var filter = window.filter;
    var $totals = $('#totals');

    //  generating the image from the local renders is getting met by security violations
    //  let's load renders from github instead to satisfy cors
    if (!sourceImage) {

        var sourceImage = new Image();
        sourceImage.src = ( window.RemoteRendersURL ) ? window.RemoteRendersURL : "https://raw.githubusercontent.com/jakcodex/muledump/master/lib/renders.png";
        sourceImage.crossOrigin = "anonymous";
        window.techlog("Export using URL: " + sourceImage.src);

    }

    //  we'll clone the source image to prevent another cors issue from popping up
    var img = sourceImage.cloneNode(),
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

	var w = $totals.innerWidth(), h = $totals.innerHeight();
	img.onload = render;

    img.onerror = function() {
		$.featherlight('<p>There was an error while loading the renders.png file. <br><br>Please make sure you have a working Internet connection and try again.</p>');
	};

}

function imgur(data) {
	var ImgurClientID = ( window.ImgurClientID ) ? window.ImgurClientID : 'd1697f30e7e4c5c';
	window.techlog("Imgur Client ID - " + ImgurClientID);
	return $.ajax({
		type: 'POST',
		url: 'https://api.imgur.com/3/upload.json',
		data: {
			image: data,
			type: 'base64'
		},
		headers: {
			'Authorization': 'Client-ID ' + ImgurClientID
		},
		dataType: 'json'
	});
}

})($, window);
