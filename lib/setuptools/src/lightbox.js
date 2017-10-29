//
//  lightbox tools
//

//  create a lightbox
setuptools.lightbox.create = function(data, config, title, page) {

    if ( typeof title === 'undefined' ) title = 'Muledump Setup';
    if ( typeof page === 'undefined' ) page = 'default';
    if ( typeof data === 'string' ) {

        if ( !config ) config = {};
        if ( typeof config === 'string' ) config = {variant: config};
        if ( typeof config !== 'object' ) {

            setuptools.lightbox.error('Supplied Featherlight config is invalid', 2);
            return;

        } else {

            if ( setuptools.app.checknew() === true ) {
                if ( typeof config.closeOnEsc === 'undefined' ) config.closeOnEsc = false;
                if ( typeof config.closeIcon === 'undefined' ) config.closeIcon = '';
                if ( typeof config.closeOnClick === 'undefined' ) config.closeOnClick = false;
            }

            if ( typeof config.otherClose === 'undefined' ) config.otherClose = 'a.setuptools:not(.noclose), .setuptools.error';
            if ( typeof config.variant === 'undefined' ) config.variant = 'setuptools';
            if ( typeof config.openSpeed === 'undefined' ) config.openSpeed = 0;
            if ( typeof config.closeSpeed === 'undefined' ) config.closeSpeed = 0;
            if ( typeof config.closeOnClick === 'undefined' ) config.closeOnClick = 'background';

        }

        setuptools.lightbox.active[page] = $.featherlight(' \
            <p class="setuptools block"> \
            ' + ( (title !== false) ? '<h1>' + title + '</h1> ' : '' ) + ' \
            <span>' + data + '</span> \
            </p> \
        ', config);

    }

};

//  manually close a lightbox
setuptools.lightbox.close = function(page) {

    if ( !setuptools.lightbox.active[page] ) return;
    setuptools.lightbox.active[page].close();

};

//  create a context menu
setuptools.lightbox.menu.context.create = function(title, position, options, self) {

    //  build the menu
    $('.setuptools.div.menu').remove();
    var menu = $('<div class="setuptools div menu">');
    $('body').append(menu);
    menu.css({'left': position.left, 'top': position.top});
    var html = '<div class="setuptools"><strong>' + title + '</strong></div>\n';

    //  load options into menu
    for ( var i in options )
        if ( options.hasOwnProperty(i) )
            html += '<div><a href="#" class="setuptools ' + options[i].class + '">' + options[i].name + '</a></div>\n';

    menu.html(html);

    //  process options clicks
    $('.setuptools.div.menu div').click(function() {

        var MenuItem = $(this).find('a');
        for ( var i in options )
            if ( options.hasOwnProperty(i) )
                if ( MenuItem.hasClass(options[i].class) )
                    options[i].callback();

    });

    //  close the menu with interaction
    $('.setuptools.div.menu:not(a)').click(function() {
        setuptools.lightbox.menu.context.close(self);
    });

};

//  close a context menu
setuptools.lightbox.menu.context.close = function(self) {

    if ( typeof self === 'object' ) $(self).removeClass('selected');
    $('.setuptools.div.menu').remove();

};

//  create a pagination object
setuptools.lightbox.menu.paginate.create = function(PageList, ActionItem, ActionContainer, ActionSelector, ActionCallback) {

    var response = {
        currentPage: 0,
        lastPage: Number(Number(PageList.length/setuptools.data.config.accountsPerPage).toFixed(0)),
        html: {}
    };

    if ( response.lastPage > 1 ) response.lastPage++;

    response.html.menu = ' \
        <div class="setuptools div pageControls"> \
            <div class="editor control firstPage" title="First Page">&#171;</div> \
            <div class="editor control previousPage" title="Previous Page">&#8249;</div> \
            <div class="editor control customPage"><input name="customPage" value="1"><span> of ' + (response.lastPage) + ' page' + ( ((response.lastPage) > 1) ? 's' : '' ) + '</span></div> \
            <div class="editor control gotoPage" title="Go to Page">&#x1F50E</div> \
            \
            <div class="editor control lastPage" title="Last Page">&#187;</div> \
            <div class="editor control nextPage" title="Next Page">&#8250;</div> \
        </div> \
    ';

    response.html.search = ' \
        <div class="setuptools div pageControls">\
            <div class="editor control searchName" title=""><input name="searchName" placeholder="Search by Name"></div> \
            <div class="editor control search" title="Find Account">&#x1F50E</div> \
        </div>\
    ';

    response.bind = function() {

        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.search').click(function() {

            var searchTerm = $('div.' + ActionContainer + ' div.searchName input[name="searchName"]').val();
            var searchIndex = PageList.indexOf(searchTerm);

            //  no matches; do nothing
            if ( searchIndex === -1 ) return;

            //  locate which page it would be on
            response.currentPage = Number((Number(PageList.length/setuptools.data.config.accountsPerPage).toFixed(0)*(searchIndex/PageList.length)).toFixed(0));
            $(ActionSelector).html(ActionCallback(ActionItem, response.currentPage));

        });

        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.gotoPage').click(function() {
            var inputSelector = 'div.' + ActionContainer + ' div.customPage input[name="customPage"]';
            var customPage = Number($(inputSelector).val())-1;
            if ( customPage >= response.lastPage ) customPage = response.lastPage-1;
            if ( customPage < 0 ) customPage = 0;
            if ( customPage !== response.currentPage ) {
                response.currentPage = customPage;
                $(inputSelector).val(response.currentPage);
                $(ActionSelector).html(ActionCallback(ActionItem, response.currentPage));
            }
        });

        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.firstPage').click(function() {
            if ( response.currentPage > 0 ) {
                response.currentPage = 0;
                $(ActionSelector).html(ActionCallback(ActionItem, response.currentPage));
            }
        });

        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.lastPage').click(function() {
            if ( (response.lastPage-1) > response.currentPage ) {
                response.currentPage = response.lastPage-1;
                $(ActionSelector).html(ActionCallback(ActionItem, response.currentPage));
            }
        });

        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.nextPage').click(function() {
            var lastPage = Number(Number(PageList.length/setuptools.data.config.accountsPerPage).toFixed(0));
            if ( (response.currentPage+1) <= lastPage ) var nextPage = response.currentPage+1;
            if ( nextPage <= response.lastPage ) {
                response.currentPage = nextPage;
                $(ActionSelector).html(ActionCallback(ActionItem, response.currentPage));
            }
        });

        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.previousPage').click(function() {
            if ( response.currentPage-1 >= 0 ) var previousPage = response.currentPage-1;
            if ( previousPage >= 0 ) {
                response.currentPage = previousPage;
                $(ActionSelector).html(ActionCallback(ActionItem, response.currentPage));
            }
        });

    };

    return response;

};

//  provide an interface to override default actions on pages
setuptools.lightbox.override = function(targetPage, targetAction, callback, data) {

    if ( typeof setuptools.lightbox.overrides[targetPage] === 'undefined' ) setuptools.lightbox.overrides[targetPage] = {};
    setuptools.lightbox.overrides[targetPage][targetAction] = {
        callback: callback,
        data: data
    };

};

//  store pieces to a lightbox build
setuptools.lightbox.build = function(page, message) {

    //  create the build's array and store the message
    if ( !setuptools.lightbox.builds[page] ) setuptools.lightbox.builds[page] = [];
    setuptools.lightbox.builds[page].push(message);

};

//  display a built lightbox
setuptools.lightbox.display = function(page, config) {

    //  check if the build exists
    if ( !setuptools.lightbox.builds[page] ) {

        setuptools.lightbox.error('Build page ' + page + ' does not exist.', 3);

        //  create the lightbox from the build data
    } else {

        if ( typeof config !== 'object' ) config = {};

        //  search build data for drawhelp and goback data
        var gobackData;
        var drawhelpData;
        for ( var i in setuptools.lightbox.builds[page] )
            if ( setuptools.lightbox.builds[page].hasOwnProperty(i) )
                if ( typeof setuptools.lightbox.builds[page][i] === 'object' ) {

                    //  check for goback data
                    if ( setuptools.lightbox.builds[page][i].iam === 'goback' ) {

                        //  build the gobackData and check for overrides
                        gobackData = setuptools.lightbox.builds[page][i];
                        if ( setuptools.lightbox.overrides[page] && setuptools.lightbox.overrides[page]['goback'] ) {

                            gobackData.text1 = ( typeof setuptools.lightbox.overrides[page]['goback'].data === 'object' && setuptools.lightbox.overrides[page]['goback'].data.text1 ) ? setuptools.lightbox.overrides[page]['goback'].data.text1 : gobackData.text1;
                            gobackData.text2 = ( typeof setuptools.lightbox.overrides[page]['goback'].data === 'object' && setuptools.lightbox.overrides[page]['goback'].data.text2 ) ? setuptools.lightbox.overrides[page]['goback'].data.text2 : gobackData.text2;
                            gobackData.callback = setuptools.lightbox.overrides[page]['goback'].callback;

                        }

                        //  build the message
                        setuptools.lightbox.builds[page][i] = ' \
                            <div style="width: width: 100%; clear: both;" class="setuptools bottom container"> \
                                <div style="clear: left; float: left; height: 100%;"> \
                                    <br><span style="font-weight: 900;">&#10094;&nbsp;</span> \
                                    ' + gobackData.text1 + ' <a href="#" class="setuptools goback">' + gobackData.text2 + '</a> \
                                </div> \
                            </div> \
                        ';

                        //  check for drawhelp data
                    } else if ( setuptools.lightbox.builds[page][i].iam === 'drawhelp' ) {

                        drawhelpData = setuptools.lightbox.builds[page][i];
                        setuptools.lightbox.builds[page][i] = '';

                        //  about this; if I send it to any full-html url, this permanently break $.featherlight
                        //  I wasted 3 hours of my life trying to figure out that bug. What a waste of time.

                        //  for dev we'll just default to a placeholder
                        //data-featherlight="' + setuptools.config.drawhelpUrlPrefix[1] + drawhelpData.link + '" \
                        //data-featherlight-type="ajax" \
                        //data-featherlight="' + url + ' section, div:not(#title)" \
                        //data-featherlight-open-speed="0" \
                        //data-featherlight-close-speed="0" \

                        var url = setuptools.config.url + '/' + drawhelpData.link.replace(/.md$/i, '');
                        setuptools.lightbox.builds[page].push(' \
                            <a class="drawhelp' + (( setuptools.state.firsttime === true ) ? ' noclose' : '') + '" \
                            title="' + drawhelpData.title + '" \
                            href="' + url + '" \
                            target="_blank" \
                            >?</a>\
                        ');

                        //  check for new header title
                    } else if ( setuptools.lightbox.builds[page][i].iam === 'title' ) {

                        var title = setuptools.lightbox.builds[page][i].title;
                        setuptools.lightbox.builds[page][i] = '';

                    }

                }

        //  create the lightbox and delete the temporary build data
        setuptools.lightbox.create(setuptools.lightbox.builds[page].join(' '), config, title, page);
        setuptools.lightbox.builds[page].splice(0);

        //  bind any goback click
        if ( typeof gobackData === 'object' ) $('.setuptools.goback').click(function(e) { e.preventDefault(); gobackData.callback(); });

        //  bind any help button
        if ( typeof drawhelpData === 'object' ) $('.drawhelp').click(function(e) {
            setuptools.lightbox.ajax(e, drawhelpData, this);
        });

    }

};

setuptools.lightbox.ajax = function(e, drawhelpData, self, net) {

    function AjaxFailure(url, drawhelpData, LightboxConfig) {

        setuptools.lightbox.build('drawhelp', 'Failed to load help docs. <br><br><a href="' + url + '" target="_blank">Click here</a> to go to the help doc page.');
        if ( setuptools.state.hosted === false ) setuptools.lightbox.build('drawhelp', '<br><br>If all else fails check the docs/ folder in your Muledump install.');
        if ( net === true ) setuptools.lightbox.build('<br><br>Finally, the specific error indicates you may be having an Internet connection issue.');
        setuptools.lightbox.settitle('drawhelp', drawhelpData.title);
        setuptools.lightbox.display('drawhelp', LightboxConfig);

    }

    //  they can ctrl+click and right click to open it still, but we're intercepting left click
    e.preventDefault();

    //  gather base information
    var url = $(self).attr('href');
    var LightboxConfig = {variant: 'setuptools-medium', openSpeed: 0, closeSpeed: 0, closeOnClick: 'background', closeIcon: '&#10005;', closeOnEsc: true};

    //  call the help doc url
    $.ajax(url).done(function(data) {

        //  we receive html content in response and it should have two tags: <section> and <div page="title">
        var ParsedData = $(data);
        var HelpSection = ParsedData.find('section');
        if ( setuptools.config.devForcePoint !== 'drawhelp-ajax' && HelpSection.find('div#title') ) {

            //  the title is obnoxious and useless in the help bubble so we remove it
            HelpSection.find('div#title').remove();

            //  github pages vs source request uri's vary a bit which means we need to rebuild any hyperlinks in the responses
            HelpSection.find('a').each(function() {

                var Href = $(this).attr('href').replace('.md', '');
                $(this).attr('target', '_blank');
                if ( !Href.match(/^http/i) ) {
                    $(this).attr('href', setuptools.config.url.replace(/(muledump-preview|muledump)/, '') + Href);
                }

            });

            //  draw the lightbox
            setuptools.lightbox.build('drawhelp', HelpSection.html());
            setuptools.lightbox.settitle('drawhelp', false);
            setuptools.lightbox.display('drawhelp', LightboxConfig);

        } else {

            AjaxFailure(url, drawhelpData, LightboxConfig);

        }

    }).fail(function() { AjaxFailure(url, drawhelpData, LightboxConfig, true); });

};

//  erase build data if it exists
setuptools.lightbox.cancel = function(page) {

    return ( typeof setuptools.lightbox.builds[page] === 'object' && setuptools.lightbox.builds[page].splice(0) );

};

//  add a help icon
setuptools.lightbox.drawhelp = function(page, link, title) {

    if ( !page || !link || !title ) setuptools.lightbox.error('Invalid data supplied to drawhelp.', 11);
    if ( !setuptools.lightbox.builds[page] ) setuptools.lightbox.builds[page] = [];
    setuptools.lightbox.builds[page].push({
        iam: 'drawhelp',
        link: link,
        title: title
    });

};

//  change the lightbox header title
setuptools.lightbox.settitle = function(page, title) {

    if ( !setuptools.lightbox.builds[page] ) setuptools.lightbox.builds[page] = [];
    setuptools.lightbox.builds[page].push({
        iam: 'title',
        title: title
    });

};

//  provide a goback link
setuptools.lightbox.goback = function(page, callback, text1, text2) {

    if ( !text1 && !text2 ) {
        text1 = 'Go back to the';
        text2 = 'previous page';
    }
    if ( typeof callback != 'function' ) setuptools.lightbox.error('The callback value for goback is not valid.', 10);

    if ( !setuptools.lightbox.builds[page] ) setuptools.lightbox.builds[page] = [];
    setuptools.lightbox.builds[page].push({
        iam: 'goback',
        callback: callback,
        text1: text1,
        text2: text2
    });

};

//  display an error message
setuptools.lightbox.error = function(message, code) {

    if ( !code ) code = 0;
    setuptools.lightbox.create(' \
        <p><span class="setuptools error">Error ' + code + '</span> - ' + message + '</p> \
        <span>See <a href="https://github.com/jakcodex/muledump/wiki/Setup+Tools" target="_blank">Setup Tools</a> in the wiki for more help.</span> \
    ');
    throw new Error('Error ' + code + ' - ' + message);

};

setuptools.lightbox.tiles = function(page, TileID) {



};
