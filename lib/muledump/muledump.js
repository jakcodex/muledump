setuptools.app.mulecrypt.init(function() {

    setuptools.app.timesync(function() {

        (function ($, window) {

            //  stop the script init timer
            timing.scriptInit.stop();
            timing.mdInit = new JTimer({name: 'mdInit'});

            var mules = window.mules = {};
            var VERSION = setuptools.version.major + '.' + setuptools.version.minor + '.' + setuptools.version.patch;
            window.VERSION = VERSION;
            setuptools.tmp.corsAttempts = 0;
            window.techlog = setuptools.app.techlog;

            $(function () {

                //  process items
                setuptools.tmp.itemNameIDMap = {};
                Object.keys(items).filter(function(id) {

                    //  populate virtualSlotType data
                    items[id].push(setuptools.app.muledump.itemsSlotTypeMapper(+id));

                    //  generate item name map
                    setuptools.tmp.itemNameIDMap[items[id][0]] = id;

                });

                //  items that are removed from game are identifiable in constants; make a list of them
                setuptools.tmp.constantsRemovedItems = [];
                setuptools.tmp.accountUnknownItems = {};
                Object.filter(items, function(itemid, item) {
                    if ( item[3] === 40 && item[4] === 0 ) setuptools.tmp.constantsRemovedItems.push(Number(itemid));
                });

                //  insert generated totals save keys
                Object.keys(window.itemsSlotTypeMap).filter(function(element) {
                    setuptools.config.totalsSaveKeys.push('totalsFilter-' + element);
                });

                setuptools.init.main(window);

                $.ajaxSetup({
                    cache: false,
                    timeout: 5000
                });

                //  update Muledump intro
                if ( setuptools.state.preview === false ) {
                    $('#intro > .version').html('Jakcodex / Muledump ' + ( ( setuptools.state.hosted === false ) ? 'Local' : 'Online' ) + ' <span style="color: #90ccff;">v' + setuptools.version.major + '.' + setuptools.version.minor + '.' + setuptools.version.patch + '</span>');
                } else {
                    $('#intro > .version').text('Muledump is Ready');
                }

                //  bind itemFilter interactions
                $('body').on('click.muledump.itemFilter', '.item:not(.noselect)', function(e) {

                    if ( setuptools.app.muledump.keys('shift', e) === true ) {
                        setuptools.app.muledump.totals.toggleHideItem($(this).attr('data-itemid'));
                        return;
                    }

                    if ( setuptools.app.muledump.keys('ctrl', e) === false ) {
                        window.toggle_filter(this);
                    } else {
                        setuptools.app.muledump.realmeye.itemSelection(this);
                    }

                })

                //  bind mule guid interactions
                .on('click.muledump.guidFilter', '.guid', function() {
                    this.select();
                })

                //  bind body context menu
                .on('contextmenu.muledump.bodymenu', function(e) {
                    var target = $(e.target);
                    if ( ['main', 'stage', 'top'].indexOf(target.attr('id')) === -1 && target[0].localName !== 'body' ) return;
                    setuptools.app.muledump.bodymenu(e);
                });

                $('html').on('contextmenu.muledump.bodymenu', function(e) {
                    if ( $(e.target)[0].localName !== 'html' ) return;
                    setuptools.app.muledump.bodymenu(e);
                });

                //  check for updates if auto check is enabled
                if (setuptools.config.devForcePoint !== 'online-versioncheck' && setuptools.state.hosted === false) {
                    setuptools.app.muledump.checkupdates();
                } else {
                    setuptools.app.upgrade.version();
                }

                $('#vaultbuilderButton').on('click.vaultbuilderButton', setuptools.app.muledump.vaultbuilder.ui);

                var modes = ['account', 'items'];
                $('#pagesearchButton > div').addClass(modes[setuptools.data.config.pagesearchMode]);

                $('#pagesearchButton')
                    .on('mouseover.muledump.pagesearchButton', function() {
                        setuptools.app.muledump.pagesearch.menu();
                    });

                //  bind totalsMenu button
                $('#totalsMenu')
                    .on('click.muledump.totalsMenu', function() {
                        setuptools.app.muledump.totals.menu.settings();
                    })
                    .on('mouseover.muledump.totalsMenu', function() {
                        setuptools.app.muledump.totals.menu.main();
                    });

                //  bind mulequeue button
                $('#mulequeue')
                    .on('click.muledump.mulequeue', setuptools.app.mulequeue.ui.manager)
                    .on('mouseover.muledump.mulequeue', setuptools.app.mulequeue.menu);

                //  bind exporter button (replacing export)
                $('#exporter')
                    .on('click.muledump.exporter', function() { setuptools.app.muledump.exporter.ui.main(); })
                    .on('mouseover.muledump.exporter', setuptools.app.muledump.exporter.ui.menu);

                //  bind about button
                $('#about').on('click.muledump.about', setuptools.app.muledump.about);

                //  bind help button
                $('#help').on('click.muledump.help', setuptools.app.help);

                //  display any generated notices
                setuptools.app.muledump.notices.monitor();

                //  initialize accounts
                setuptools.init.accounts();

                //  initialize AffaSearch(tm)
                setuptools.app.muledump.pagesearch.mode.account.init();

                //  initialize masonry
                if ( !window.nomasonry ) setuptools.tmp.masonry = new Masonry('#stage', setuptools.config.masonryOptions);

                timing.mdInit.stop(function(self) {
                    setuptools.app.ga('timing', {
                        category: 'script',
                        key: 'mdInit',
                        value: self.runtime
                    });
                });

                relayout();

            });

            var mtimer;

            function relayout(doTotals) {
                if (mtimer) return;
                mtimer = setTimeout(function (doTotals) {
                    if ( doTotals !== false ) {
                        window.update_totals();
                        window.update_filter();
                    }
                    if (!window.nomasonry) setuptools.tmp.masonry.layout();
                    mtimer = 0;
                }, 0, doTotals);
            }

            window.relayout = relayout;


        })($, window);

    });

});
