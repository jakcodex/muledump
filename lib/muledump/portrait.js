(function () {

    var ready = false;

    var sprites = {};

    var sprc;

    function extract_sprites(img, sx, sy) {
        sx = sx || 8;
        sy = sy || sx;
        sprc = sprc || document.createElement('canvas');
        var c = sprc;
        c.crossOrigin = "anonymous";
        c.width = img.width;
        c.height = img.height;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var i = 0, r = [];
        for (var y = 0; y < c.height; y += sy) {
            for (var x = 0; x < c.width; x += sx, i++) {
                r[i] = ctx.getImageData(x, y, sx, sy)
            }
        }
        return r
    }

    function extract_skins(img, size) {
        size = size || 8;
        sprc = sprc || document.createElement('canvas');
        var c = sprc;
        c.crossOrigin = "anonymous";
        c.width = img.width;
        c.height = img.height;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var i = 0, r = [];
        for (var y = 0; y < c.height; y += size * 3, i++) {
            r[i] = ctx.getImageData(0, y, size, size)
        }
        return r
    }

    function load_img(src, t, s) {
        var i = new Image();
        var d = new $.Deferred();
        i.crossOrigin = 'anonymous';
        i.onload = function () {
            d.resolve(this, t, s)
        };
        i.onerror = function () {
            console.log(src, 'failed to load');
            d.reject(src)
        };
        i.src = src;
        return d.promise()
    }

    function load_sheets() {
        var d = new $.Deferred(), wait = 8;

        var src, i;

        for (i in skinsheets) {
            src = skinsheets[i];
            load_img(src, i, +i).done(function (img, t, _) {
                sprites[t] = extract_skins(img, t.indexOf('16') >= 0 ? 16 : 0);
                if (!--wait) d.resolve()
            })
            .fail(function () {
                d.reject()
            });
        }

        for (i in textiles) {
            src = textiles[i];
            load_img(src, i, +i).done(function (img, t, s) {
                sprites[t] = extract_sprites(img, s);
                if (!--wait) d.resolve()
            })
            .fail(function () {
                d.reject()
            })
        }

        return d.promise()
    }

// helpers for working with imagedata pixel values

// single component
    function p_comp(s, x, y, i) {
        return s.data[((s.width * y + x) << 2) + i]
    }

// single pixel
    function p_dict(s, x, y) {
        var offset = (s.width * y + x) << 2;
        for (var i = 0, d = []; i < 4; i++) d[i] = s.data[offset + i]
        return d
    }

// css-compatible
    function p_css(s, x, y) {
        var d = p_dict(s, x, y);
        d[3] /= 255;
        return 'rgba(' + d.join(',') + ')'
    }

    var fs = {};
    var fsc;

    function makeTexPattern(tex, ratio) {
        if (!fs[ratio]) fs[ratio] = {};
        var dict = fs[ratio];
        tex = +tex || 0;
        if (dict[tex]) return dict[tex];
        var i = (tex & 0xff000000) >> 24;
        var c = tex & 0xffffff;
        if (i === 0) return 'transparent';
        if (i === 1) {
            c = c.toString(16);
            while (c.length < 6) c = '0' + c;
            dict[tex] = '#' + c;
            return dict[tex]
        }
        if (!sprites[i]) return 'transparent';
        var spr = sprites[i][c];
        fsc = fsc || document.createElement('canvas');
        var ca = fsc;
        var scale = ratio / 5;
        ca.width = spr.width;
        ca.height = spr.height;
        var cact = ca.getContext('2d');
        cact.imageSmoothingEnabled = false;
        cact.putImageData(spr, 0, 0);
        var p = cact.createPattern(ca, 'repeat');
        ca.width = scale * spr.width;
        ca.height = scale * spr.height;
        cact.scale(scale, scale);
        cact.fillStyle = p;
        cact.fillRect(0, 0, spr.width, spr.height);
        dict[tex] = cact.createPattern(ca, 'repeat');
        return dict[tex]
    }

    var pcache = {};

    function pCacheId(c, t0, t1) {
        return [c, (+t0 || 0), (+t1 || 0)].join(':')
    }

    var queue = [];

    var st;
    window.portrait = function (img, type, skin, tex1, tex2, adjust) {
        if (!ready) return queue.push(Array.prototype.slice.apply(arguments));

        // fallback to default skin, this happens when loading new skins on outdated renders
        if (!skin || !window.skins[skin]) {
            skin = type
        }

        var skinData = window.skins[skin];

        // try to fallback to default skin again if renders don't match constants
        if ( !skinData || !sprites[skinData[3]][skinData[1]] ) {
            skin = type;
            skinData = window.skins[skin];
        }
        if ( !skinData ) return;

        var c = pcache[pCacheId(skin, tex1, tex2)];

        var x16 = skinData[2];

        //  adjustments
        if ( adjust !== false && x16 && [11,13].indexOf(skinData[1]) > -1 ) img.css({
            "overflow": 'hidden',
            "margin-top": '-7px',
            "margin-right": "7px"
        });

        //  apply texture tooltip
        if ( setuptools.data.config.tooltip > 0 && (textures[tex1] || textures[tex2]) ) {

            var large;
            var small;
            if ( textures[tex1] ) large = items[textures[tex1][1]];
            if ( textures[tex2] ) small = items[textures[tex2][3]];

            if ( setuptools.data.config.tooltipClothing === 1 ) setuptools.app.muledump.tooltip(img, 'mb5 autoHeight', ' \
                <div class="flex-container noFlexAutoWidth" style="color: #fff; flex-flow: column;"> \
                    ' + ( (textures[tex1] ) ?
                        '<div class="flex-container" style="justify-content: flex-start;">\
                            <div class="item noselect mr5" style="background-position: -' + large[3] + 'px -' + large[4] + 'px; border: solid 1px #000;">&nbsp;</div>\
                            <div>' + (textures[tex1][0] || 'Default') + '</div>\
                        </div>' : ''
                    ) + ' \
                    ' + ( (textures[tex2] ) ?
                        '<div class="flex-container" style="justify-content: flex-start;">\
                            <div class="item noselect mr5" style="background-position: -' + small[3] + 'px -' + small[4] + 'px; border: solid 1px #000;">&nbsp;</div>\
                            <div>' + (textures[tex2][2] || 'Default') + '</div>\
                        </div>' : ''
                    ) + '\
                </div>\
            ');

        }

        if (c) return img.attr('src', c);


        // size of the original sprite
        var size = x16 ? 16 : 8;
        // ratio at which the sprite is drawn (2: -> 8x8 -> 16x16)
        var ratio = x16 ? 2 : 4;
        var fs1 = makeTexPattern(tex1, ratio);
        var fs2 = makeTexPattern(tex2, ratio);
        st = st || document.createElement('canvas');
        st.width = 34;
        st.height = 34;
        c = st.getContext('2d');
        c.save();
        c.clearRect(0, 0, st.width, st.height);
        c.translate(1, 1);

        var i = skinData[1];
        var sheetName = skinData[3];
        var spr = sprites[sheetName][i];
        var mask = sprites[sheetName + "Mask"][i];
        img.attr('data-skinSize', size);
        img.attr('data-skinIndex', i);
        img.attr('data-tex1', tex1);
        img.attr('data-tex2', tex2);

        for (var xi = 0; xi < size; xi++) {
            var x = xi * ratio;
            var w = ratio;
            for (var yi = 0; yi < size; yi++) {
                if (p_comp(spr, xi, yi, 3) < 2) continue; // transparent
                var y = yi * ratio;
                var h = ratio;
                // standard
                c.fillStyle = p_css(spr, xi, yi);
                c.fillRect(x, y, w, h);
                // if there is something on mask, paint over
                var vol = 0;

                function dotex(tex) {
                    c.fillStyle = tex;
                    c.fillRect(x, y, w, h);
                    c.fillStyle = 'rgba(0,0,0,' + ((255 - vol) / 255) + ')';
                    c.fillRect(x, y, w, h)
                }

                if (p_comp(mask, xi, yi, 3) > 1) {
                    var red = p_comp(mask, xi, yi, 0);
                    var green = p_comp(mask, xi, yi, 1);

                    if (red > green && tex1) {
                        vol = red;
                        dotex(fs1)
                    } else if (green > red && tex2) {
                        vol = green;
                        dotex(fs2);
                    }
                }
                // outline
                c.save();
                c.globalCompositeOperation = 'destination-over';
                c.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
                c.restore()
            }
        }
        c.restore();
        var r = st.toDataURL();
        pcache[pCacheId(skin, tex1, tex2)] = r;
        img.attr('src', r);

    };

    var preload = load_sheets();

    $(function () {
        preload.done(function () {
            ready = true;
            for (var i = 0; i < queue.length; i++) {
                portrait.apply(null, queue[i])
            }
        })
    })


})();

