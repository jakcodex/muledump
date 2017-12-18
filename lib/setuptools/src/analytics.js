//  load analytics if enabled
//  does not run at all on Muledump Local users
if ( setuptools.state.hosted === true && setuptools.data.config.ga === true) {

    (function(i, s, o, g, r, a, m) {
        i["GoogleAnalyticsObject"] = r;
        (i[r] =
            i[r] ||
            function() {
                (i[r].q = i[r].q || []).push(arguments);
            }), (i[r].l = 1 * new Date());
        (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
    })(
        window,
        document,
        "script",
        "https://www.google-analytics.com/analytics.js",
        setuptools.config.gaFuncName
    );

    setuptools.app.ga('userId');
    setuptools.app.ga('create', setuptools.config.ga);
    setuptools.app.ga('send', 'pageview');
    setuptools.tmp.gaInterval = setInterval(setuptools.app.ga, setuptools.config.gaInterval, 'send', {hitType: 'pageview', page: '#ping'});

}