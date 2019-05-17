/**
 * @function
 * @description Display the compression utility UI
 */
setuptools.app.devtools.compressionUtility = function() {

    function syncReport(done, total) {

        var html = ' \
                <div class="flex-container" style="justify-content: space-between;">\
                    <div class="flex-container" style="padding: 2px 4px; width: 50%; justify-content: flex-start; background-color: #111;">Compression State</div>\
                    <div class="flex-container" style="padding: 2px 4px; width: 50%; justify-content: center; background-color: #333;">' + ( (setuptools.data.config.compression === true) ? 'On' : 'Off' ) + '</div>\
                </div>\
            ';

        if ( typeof done === 'number' && typeof total === 'number' ) html += ' \
                <div class="flex-container" style="justify-content: space-between;">\
                    <div class="flex-container" style="padding: 2px 4px; width: 50%; justify-content: flex-start; background-color: #333;">Synchronize Progress</div>\
                    <div class="flex-container" style="padding: 2px 4px; width: 50%; justify-content: center; background-color: #111;">' + done + ' of ' + total + ' objects</div>\
                </div>\
            ';

        if ( typeof done === 'number' && typeof total !== 'number' ) html += ' \
                <div class="flex-container" style="justify-content: space-between;">\
                    <div class="flex-container" style="padding: 2px 4px; width: 50%; justify-content: flex-start; background-color: #333;">Analysis Complete</div>\
                    <div class="flex-container" style="padding: 2px 4px; width: 50%; justify-content: center; background-color: #111;">' + done + ' objects out of sync</div>\
                </div>\
            ';

        return html;

    }

    setuptools.lightbox.build('compression-utility', ' \
            Synchronize the state of compression with this utility.\
            <div class="flex-container" style="margin: 15px 0; justify-content: space-evenly;">\
                <div class="flex-container noFlexAutoWidth setuptools link analyze menuStyle menuTiny noclose mr0">Analyze</div>\
                <div class="flex-container noFlexAutoWidth setuptools link synchronize menuStyle menuTiny notice noclose mr0">Synchronize</div>\
            </div>\
            <div class="flex-container syncReport" style="flex-wrap: wrap;">' + syncReport() + '</div>\
        ');
    setuptools.lightbox.settitle('compression-utility', 'Compression Utility');
    setuptools.lightbox.goback('compression-utility', setuptools.app.devtools.ui);
    setuptools.lightbox.drawhelp('compression-utility', 'docs/setuptools/help/compression-utility', 'Compression Utility Help');
    setuptools.lightbox.display('compression-utility', {variant: 'fl-Index'});

    //  analyze files and report how many are out of sync
    $('.setuptools.link.analyze').on('click.setuptools.link.analyze', function() {

        $('div.syncReport').html(syncReport(setuptools.storage.compression.analyze().length));

    });

    //  synchronize all objects
    $('.setuptools.link.synchronize').on('click.setuptools.link.synchronize', function() {

        var outOfSync = setuptools.storage.compression.analyze();

        if ( outOfSync.length === 0 ) {

            $('div.syncReport').html(syncReport(0));
            return;

        }

        outOfSync.filter(function(key) {
            setuptools.app.techlog('CompressionUtility/Synchronize object: ' + key);
            $('div.syncReport').html(syncReport(outOfSync.indexOf(key)+1, outOfSync.length));
            setuptools.storage.write(key, setuptools.storage.read(key, true), true);
        });

    });

}

/**
 * @function
 * @description Displays the local storage report UI
 */
setuptools.app.devtools.viewSystemsReport = function() {

    var report = setuptools.storage.report();
    setuptools.lightbox.build('settings-viewSystemsReport', ' \
            <div class="flex-container systemsReport">\
                <div>Muledump Account Data</div>\
                <div>' + report.summary['muledump-accountDataCache'].toFixed(2) + ' KB</div>\
            </div>\
            <div class="flex-container systemsReport">\
                <div>SetupTools Configuration</div>\
                <div>' + report.summary['setuptools-config'].toFixed(2) + ' KB</div>\
            </div>\
            <div class="flex-container systemsReport">\
                <div>SetupTools Backups</div>\
                <div>' + report.summary['setuptools-backups'].toFixed(2) + ' KB</div>\
            </div>\
            <div class="flex-container systemsReport">\
                <div>SetupTools MuleQueue</div>\
                <div>' + report.summary['setuptools-mulequeue'].toFixed(2) + ' KB</div>\
            </div>\
            <div class="flex-container systemsReport">\
                <div>SetupTools Cache</div>\
                <div>' + report.summary['setuptools-cache'].toFixed(2) + ' KB</div>\
            </div>\
            <div class="flex-container systemsReport">\
                <div>SetupTools Total Data Usage</div>\
                <div>' + report.summary['setuptools-all'].toFixed(2) + ' KB</div>\
            </div>\
            <div class="flex-container systemsReport">\
                <div>Other Usage</div>\
                <div>' + report.summary.other.toFixed(2) + ' KB</div>\
            </div>\
            <div class="flex-container systemsReport" style="padding-top: 10px; margin-top: 7px; border-top: 2px solid #333;">\
                <div>Local Storage Space Used</div>\
                <div>' + report.summary.all.toFixed(2) + ' KB</div>\
            </div>\
            <div class="flex-container systemsReport">\
                <div>Local Storage Space Remaining</div>\
                <div>' + report.remaining.toFixed(2) + ' KB</div>\
            </div>\
            <div class="flex-container systemsReport">\
                <div>Local Storage Compression Rate</div>\
                <div>' + report.ratio.toFixed(2) + '%</div>\
            </div>\
            <div class="flex-container systemsReport" style="padding-top: 10px; margin-top: 7px; border-top: 2px solid #333;">\
                <div>CPU Time Used</div>\
                <div>' + setuptools.app.calculateCpuTime(true) + '</div>\
            </div>\
        ');

    if ( report.warning === true ) setuptools.lightbox.build('settings-viewSystemsReport', ' \
        <div class="flex-container" style="justify-content: flex-start; padding-top: 10px; margin-top: 7px; border-top: 2px solid #333;">\
            <span style="color: red;">Warning:</span>&nbsp;' + report.warningText + ' \
        </div>\
    ');

    setuptools.lightbox.settitle('settings-viewSystemsReport', 'Systems Report');
    setuptools.lightbox.goback('settings-viewSystemsReport', function() {
        setuptools.app.config.settings(undefined, 'system');
    });
    setuptools.lightbox.drawhelp('settings-viewSystemsReport', 'docs/muledump/systems-report', 'Systems Report Help');
    setuptools.lightbox.display('settings-viewSystemsReport', {variant: 'fl-Index select'});

};

/**
 * @function
 * @description Display the dev tools selection UI
 */
setuptools.app.devtools.ui = function() {

    setuptools.lightbox.build('devtools', ' \
        <div class="flex-container" style="justify-content: space-evenly; flex-wrap: wrap;">\
            <div class="setuptools link renders noclose menuStyle menuSmall bright textCenter m5">Renders Info</div>\
            <div class="setuptools link vaultbuilder menuStyle menuSmall bright textCenter m5">Vault Builder</div>\
            <div class="setuptools link systemsreport menuStyle menuSmall bright textCenter m5">Systems Report</div>\
            <div class="setuptools link consoleviewer menuStyle menuSmall bright textCenter m5">Console Viewer</div>\
            <div class="setuptools link configviewer menuStyle menuSmall bright textCenter m5">Configuration Viewer</div>\
            <div class="setuptools link compressionutility menuStyle menuSmall bright textCenter m5">Compression Utility</div>\
        </div>\
    ');
    setuptools.lightbox.settitle('devtools', 'Muledump Dev Tools');
    setuptools.lightbox.goback('devtools', setuptools.app.index);
    setuptools.lightbox.display('devtools', {variant: 'fl-Index'});

    $('div.setuptools.link.renders').on('click.devtools.renders', function() {
        setuptools.lightbox.override('rendersupdate-assistant', 'goback', setuptools.app.devtools.ui);
        setuptools.app.muledump.checkupdates(true, true);
    });
    $('div.setuptools.link.vaultbuilder').on('click.devtools.vaultbuilder', setuptools.app.muledump.vaultbuilder.ui);
    $('div.setuptools.link.systemsreport').on('click.devtools.vaultbuilder', setuptools.app.devtools.viewSystemsReport);
    $('div.setuptools.link.configviewer').on('click.devtools.configviewer', setuptools.app.devtools.configViewer);
    $('div.setuptools.link.consoleviewer').on('click.devtools.consoleviewer', setuptools.app.devtools.consoleViewer);
    $('div.setuptools.link.compressionutility').on('click.devtools.compressionutility', setuptools.app.devtools.compressionUtility);
    setuptools.lightbox.override('settings-viewSystemsReport', 'goback', setuptools.app.devtools.ui);

};

/**
 * @function
 * @description Display the console viewer UI
 */
setuptools.app.devtools.consoleViewer = function() {

    var ListRecord = function(dummy, page) {

        if ( typeof page !== 'number' ) page = 0;
        var ConsoleHistory = setuptools.lightbox.menu.paginate.state.ConsoleHistory.PageList;
        if ( page > setuptools.lightbox.menu.paginate.state.ConsoleHistory.lastPage ) page = setuptools.lightbox.menu.paginate.state.ConsoleHistory.lastPage;
        $('div.ConsoleHistory div.customPage input[name="customPage"]').val(page+1);

        //  determine our boundaries
        var minIndex = setuptools.config.recordConsolePerPage*page;
        var maxIndex = (setuptools.config.recordConsolePerPage*page)+setuptools.config.recordConsolePerPage;
        if ( maxIndex > ConsoleHistory.length ) maxIndex = ConsoleHistory.length;
        if ( ConsoleHistory.length <= setuptools.config.recordConsolePerPage ) {
            minIndex = 0;
            maxIndex = ConsoleHistory.length;
        }

        var html = '';
        for ( var i = minIndex; i < maxIndex; i++ ) html += createRow(i);
        if ( html === '' ) {
            html = ' \
                <div class="flex-container history noselect mt5 p5" style="justify-content: flex-start; padding-bottom: 0;"> \
                    <div>\
                        No console history recorded \
                    </div> \
                </div>\
            ';
        } else {

            html = ' \
                <div class="flex-container muledump consoleviewer m5 p5">\
                    <div style="width: 14%;">Date</div>\
                    <div style="width: 14%;">RuntimeID</div>\
                    <div style="width: 8%;">Type</div>\
                    <div style="width: 64%;">Message</div>\
                </div>\
            ' + html;

        }

        return html;

    };

    var createRow = function(listPos) {

        var ConsoleHistory = setuptools.lightbox.menu.paginate.state.ConsoleHistory.PageList;
        var ConsoleRecord = ConsoleHistory[listPos];

        return ' \
            <div class="flex-container muledump consoleviewer m5 p5" data-listPos="' + listPos + '">\
                <div style="width: 14%;" class="mr5">' + ConsoleRecord[0] + '</div>\
                <div style="width: 14%;" class="mr5">' + ConsoleRecord[1] + '</div>\
                <div style="width: 8%;" class="mr5">' + ConsoleRecord[2] + '</div>\
                <div style="width: 64%;">' + ConsoleRecord[3] + '</div>\
            </div>\
        ';

    };

    var ConsoleHistoryContext = function() {

    };

    var ConsoleHistoryUpdate = function(page) {

        if ( !page && typeof setuptools.lightbox.menu.paginate.state.ConsoleHistory === 'object' ) page = setuptools.lightbox.menu.paginate.state.ConsoleHistory.currentPage;
        if ( ['string', 'number', 'undefined'].indexOf(typeof page) === -1 ) return;
        var ConsoleHistoryPaginate = setuptools.lightbox.menu.paginate.state.ConsoleHistory;
        ConsoleHistoryPaginate = new setuptools.lightbox.menu.paginate.create(
            data,
            ConsoleHistoryPaginate.ActionItem,
            ConsoleHistoryPaginate.ActionContainer,
            ConsoleHistoryPaginate.ActionSelector,
            ConsoleHistoryPaginate.ActionCallback,
            ConsoleHistoryPaginate.ActionContext,
            ConsoleHistoryPaginate.Modifiers
        );

        //  update currentPage
        if ( typeof page === 'undefined' ) setuptools.lightbox.menu.paginate.findPage(0, 'ConsoleHistory');
        if ( typeof page === 'string' ) setuptools.lightbox.menu.paginate.findPage(page, 'ConsoleHistory');
        if ( typeof page === 'number' ) setuptools.lightbox.menu.paginate.state.ConsoleHistory.currentPage = page;

        //  validate lastPage/currentPage boundary
        var newLastPage = Math.ceil(ConsoleHistoryPaginate.PageList.length/setuptools.config.recordConsolePerPage);
        if ( newLastPage > 0 ) newLastPage--;
        if ( ConsoleHistoryPaginate.currentPage > newLastPage ) setuptools.lightbox.menu.paginate.findPage(ConsoleHistoryPaginate.PageList.length-1, 'ConsoleHistory');

        //  get the customPage value
        var customPage = $('div.ConsoleHistory input[name="customPage"]');
        var customPageNumber = customPage.val();
        var customPageFocus = customPage.is(':focus');

        $('div.ConsoleHistory.list').html(' \
            <div class="flex-container ml5 mb5 mr5">' + ConsoleHistoryPaginate.html.menu + '</div> \
            <div class="setuptools app list flex-container m5 p5">\
                ' + ListRecord(undefined, ConsoleHistoryPaginate.currentPage) + ' \
            </div> \
            <div class="flex-container" style="justify-content: flex-end;">\
                ' + ConsoleHistoryPaginate.html.search + '\
            </div>\
        ');

        //  update the customPage value
        if ( customPageFocus ) $('div.QueueList input[name="customPage"]').focus().val('').val(customPageNumber);

        ConsoleHistoryPaginate.bind();

    };

    var pageButtonsHtml = ' \
        <div class="setuptools link muledump consoleviewer reload" style="cursor: pointer; font-size: 16px;"><strong>&#8634;</strong></div>\
    ';

    var data = JSON.parse(setuptools.storage.read('console'));
    if ( !Array.isArray(data) ) data = [];
    data.reverse();

    var ConsoleHistoryPaginate = new setuptools.lightbox.menu.paginate.create(
        data,
        undefined,
        'ConsoleHistory',
        'div.ConsoleHistory div.list',
        ListRecord,
        ConsoleHistoryContext,
        {
            pageButtons: {html: pageButtonsHtml},
            search: {
                container: true, // disabled for now
                keys: ['0', '1', '2', '3'],
                placeholder: 'Search Records',
                css: {
                    width: 'auto',
                    'max-width': '900px'
                }
            },
            callbacks: {
                update: ConsoleHistoryUpdate
            },
            recordsPerPage: setuptools.config.recordConsolePerPage,
        }
    );

    setuptools.lightbox.build('devtools-consoleViewer', ' \
        <div class="ConsoleHistory list flex-container muledump consoleviewer" style="flex-wrap: wrap; background-color: #222;">\
            <div class="flex-container ml5 mb5 mr5">' + ConsoleHistoryPaginate.html.menu + '</div> \
            <div class="setuptools app list flex-container" style="flex-wrap: wrap;">\
                ' + ListRecord(undefined, 0) + ' \
            </div> \
            <div class="flex-container" style="justify-content: flex-end;">\
                ' + ConsoleHistoryPaginate.html.search + '\
            </div>\
        </div>\
    ');

    setuptools.lightbox.settitle('devtools-consoleViewer', 'Muledump Console Viewer');
    setuptools.lightbox.goback('devtools-consoleViewer', setuptools.app.devtools.ui);
    setuptools.lightbox.display('devtools-consoleViewer', {variant: 'fl-ConsoleViewer select'});

    ConsoleHistoryPaginate.bind();
    $('div.setuptools.link.consoleviewer.reload').on('click.consoleviewer.reload', setuptools.app.devtools.consoleViewer);

};

/**
 * @function
 * @description Display the configuration viewer UI
 */
setuptools.app.devtools.configViewer = function(mode) {

    if ( typeof mode !== 'string' ) mode = undefined;
    setuptools.lightbox.build('devtools-configViewer', ' \
        <div class="flex-container" style="justify-content: space-evenly; flex-wrap: wrap;">\
            <div class="w100 m5 p5">\
                See the <a href="https://jakcodex.github.io/muledump/docs/setuptools/dev/setuptools-object-ref" target="_blank">SetupTools Object Reference</a> for detailed information. \
            </div>\
            <div class="flex-container m5 p5" style="justify-content: space-between;">\
                <div class="flex-container noFlexAutoWidth setuptools link serverconfig" style="width: 40%; cursor: pointer;"><strong>SetupTools Server Configuration</strong></div>\
                <div class="flex-container noFlexAutoWidth setuptools link clientconfig" style="width: 40%; cursor: pointer;"><strong>SetupTools Client Configuration</strong></div>\
            </div>\
    ');

    //  display server config
    var config = ( !mode || mode === 'server' ) ? setuptools.config : setuptools.data;
    Object.keys(config).forEach(function(key) {

        var data = ( typeof config[key] === 'object' ) ? JSON.stringify(config[key]) : config[key];
        setuptools.lightbox.build('devtools-configViewer', ' \
            <div class="flex-container muledump configviewer m5 p5">\
                <div class="flex-container noFlexAutoWidth" style="width: 40%; margin-right: 15px;">' + ( (!mode || mode === 'server') ? 'setuptools.config' : 'setuptools.data' ) + '.' + key + '</div>\
                <div class="flex-container noFlexAutoWidth" style="width: auto; flex-grow: 1;">\
                ' + ( (data.length > 120) ? ' \
                    <textarea class="setuptools config value w100 scrollbar" rows="6">' + ( ( typeof config[key] === 'object' ) ? JSON.stringify(config[key], null, 5) : config[key] ) + '</textarea>\
                ' : ' \
                    <input class="setuptools input config value w100" value=\'' + ( ( typeof config[key] === 'object' ) ? JSON.stringify(config[key]) : config[key] ) + '\'>\
                ') + '\
                </div>\
            </div>\
        ');

    });

    setuptools.lightbox.build('devtools-configViewer', ' \
        </div>\
    ');
    setuptools.lightbox.settitle('devtools-configViewer', 'Muledump Config Viewer');
    setuptools.lightbox.goback('devtools-configViewer', setuptools.app.devtools.ui);
    setuptools.lightbox.display('devtools-configViewer', {variant: 'select'});
    $('div.setuptools.link.serverconfig').on('click.setuptools.serverconfig', function() {
        setuptools.app.devtools.configViewer('server');
    });
    $('div.setuptools.link.clientconfig').on('click.setuptools.clientconfig', function() {
        setuptools.app.devtools.configViewer('client');
    });

};
