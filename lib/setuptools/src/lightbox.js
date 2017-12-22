//
//  lightbox tools
//

//  create a context menu
setuptools.lightbox.menu.context.create = function(name, nested, track, options, self) {

    //  close any open context menu
    if ( nested === true ) setuptools.lightbox.menu.context.close(name);
    if ( nested === false ) setuptools.lightbox.menu.context.close();
    if ( typeof setuptools.tmp.contextMenuOpen === 'object' && setuptools.tmp.contextMenuOpen[name] === true ) setuptools.lightbox.menu.context.close(name);

    //  build the menu
    var doKeyup = true;
    var bindings = [];
    var menu = $('<div class="setuptools div menu noselect ' + name + '">');
    var html = '';
    var customPos = {
        h: 'left',
        v: 'top',
        hpx: 0,
        vpx: 0
    };

    //  load options into menu
    for ( var i in options ) {

        if (options.hasOwnProperty(i)) {

            //  build a list of supplied attributes
            var attributes = '';
            if ( typeof options[i].attributes === 'object' ) {

                for ( var x in options[i].attributes )
                    if ( options[i].attributes.hasOwnProperty(x) )
                        attributes += x + '="' + options[i].attributes[x] + '" ';

            }

            //  default format is a link and it includes no option key
            if (!options[i].option) {

                html += '<div class="link"><a href="#" class="setuptools ' + options[i].class + '" ' + attributes + '>' + options[i].name + '</a></div>\n';

            } else {

                //  insert additional headers
                if (options[i].option === 'header') {

                    html += '<div class="setuptools header noselect"><strong>' + options[i].value + '</strong></div>\n';

                }
                else if (options[i].option === 'sizing' ) {

                    if ( options[i].width ) menu.css({width: options[i].width});

                }
                //  modify default positioning parameters
                else if (options[i].option === 'pos') {

                    if (options[i].h) customPos.h = options[i].h;
                    if (options[i].v) customPos.v = options[i].v;
                    if (options[i].hpx) customPos.hpx = options[i].hpx;
                    if (options[i].vpx) customPos.vpx = options[i].vpx;

                }
                //  override keyup bindings
                else if ( options[i].option === 'keyup' ) {

                    doKeyup = options[i].value;

                }
                //  support input options
                else if ( options[i].option === 'input' ) {

                    html += '<div class="input">' + options[i].value + '</div>\n';
                    if ( typeof options[i].binding === 'function' ) options[i].binding = [options[i].binding];
                    if ( typeof options[i].binding === 'object' ) bindings = options[i].binding;

                }

            }

        }

    }

    //  display the menu
    menu.html(html);
    $('body').append(menu);

    //  record the menu
    if ( menu.find('.copySelection').length > 0 ) new Clipboard('.copySelection');
    if ( typeof setuptools.tmp.contextSelf !== 'object' ) setuptools.tmp.contextSelf = {};
    if ( typeof setuptools.tmp.contextMenuOpen !== 'object' ) setuptools.tmp.contextMenuOpen = {};
    setuptools.tmp.contextSelf[name] = self;
    setuptools.tmp.contextMenuOpen[name] = true;

    //  process custom bindings
    if ( typeof bindings === 'object' )
        for ( var i in bindings )
            if ( bindings.hasOwnProperty(i) )
                bindings[i]();

    //  if the bottom of the menu is below the window we should adjust its position
    function findPosition() {

        //  get positioning information
        var position = track.offset();
        var height = menu.outerHeight(true);
        var width = menu.outerWidth(true);
        var w = $(window);

        //  build css adjustments
        var css = {};
        css[customPos.h] = position.left+customPos.hpx;
        css[customPos.v] = position.top+customPos.vpx;
        if ( customPos.v === 'top' ) css.bottom = 'initial';
        if ( customPos.v === 'bottom' ) css.bottom = w.outerHeight(true)-css.bottom;
        if ( customPos.h === 'right' ) css.right = w.outerWidth(true)-css.right;

        //  adjust menu position if this is going to render below the window
        if ( customPos.v !== 'bottom' && (position.top+height >= w.outerHeight(true)) ) {

            css.top = 'initial';
            css.bottom = w.outerHeight(true)-position.top;

        }
        //  adjust menu position if this is going to render right of the window (untested)
        else if ( customPos.h !== 'right' && (position.left+width >= w.outerWidth(true)) ) {

            css.left = 'initial';
            css.right = w.outerWidth(true)-position.left;

        }

        //  apply the css adjustments
        css[customPos.h] += 'px';
        css[customPos.v] += 'px';

        menu.css(css);

        // automatically adjusts the position of the menu with any window changes/scrolling/etc
        // setuptools.lightbox.menu.context.close will clear this interval
        if ( !setuptools.tmp.intervalContext ) setuptools.tmp.intervalContext = {};
        if ( !setuptools.tmp.intervalContext[name] ) setuptools.tmp.intervalContext[name] = setInterval(findPosition);

    }

    findPosition();

    //  process options clicks
    $('.setuptools.div.menu.' + name + ' > div').click(function() {

        var MenuOptions = {
            LinkOption: 'a',
            SelectOption: 'select',
            InputOption: 'input'
        };

        //  build menu options
        for ( var option in MenuOptions )
            if ( MenuOptions.hasOwnProperty(option) ) {

                var MenuOption = $(this).find(MenuOptions[option]);
                if (MenuOption.length > 0)
                    for (var a in options)
                        if (options.hasOwnProperty(a))
                            if (MenuOption.hasClass(options[a].class)) {

                                //  handle link clicks
                                if ( option === 'LinkOption' ) {

                                    //  not our guy if the names don't match
                                    if ( $(MenuOption).html() !== options[a].name ) continue;

                                    //  close the menu and route the action
                                    setuptools.lightbox.menu.context.close();

                                    if (typeof options[a].callback !== 'function') return;
                                    if (options[a].callbackArg) {

                                        options[a].callback(options[a].callbackArg);
                                        return;

                                    }

                                    options[a].callback();
                                    return;

                                }

                            }

            }

    });

    //  close the menu with interaction
    /*menu.click(function() {
        if ( $(this).find('input').length === 0 ) setuptools.lightbox.menu.context.close();
    });*/

    if ( nested === false && doKeyup === true ) $(window).unbind('keyup').keyup(function(e) {
        setuptools.lightbox.menu.context.keyup(name, e);
    });

};

//  bind context menu keyup tracking
setuptools.lightbox.menu.context.keyup = function(name, e, selectorSuffix) {

    //  if keypress was escape we exit
    if ( e.keyCode === 27 ) {
        setuptools.lightbox.menu.context.close(name);
        return;
    }

    if ( typeof selectorSuffix === 'undefined' ) selectorSuffix = '';
    var menuSelected = $('.setuptools.div.menu.' + name + ' > div.link.menuSelected > a' + selectorSuffix);

    //  submit on enter
    if ( e.keyCode === 13 ) {

        if ( menuSelected.length === 1 ) {
            menuSelected.parent().trigger('click');
            setuptools.lightbox.menu.context.close(name);
        }
        return;

    }

    //  navigate context menu
    if ( e.keyCode === 38 || e.keyCode === 40 ) {

        if ( setuptools.tmp.contextMenuOpen[name] === true ) {

            var menuSelector = $('.setuptools.div.menu.' + name + ' > div.link > a' + selectorSuffix);
            if ( menuSelected.length === 0 ) {

                menuSelected = ( e.keyCode === 38 ) ? menuSelector.last() : menuSelector.first();
                menuSelected.parent().addClass('menuSelected');
                menuSelected.parent().siblings().removeClass('menuSelected');

            } else {

                var busy = false;
                menuSelector.each(function(index, element) {

                    if ( busy === false && $(element).parent().hasClass('menuSelected') ) {

                        busy = true;

                        //  up arrow
                        if ( e.keyCode === 38 ) {

                            if ( index === 0 ) {
                                menuSelected = menuSelector.get(menuSelector.length-1);
                            } else {
                                menuSelected = menuSelector.get(index-1);
                            }

                        }
                        //  down arrow
                        else {

                            if ( index === (menuSelector.length-1) ) {
                                menuSelected = menuSelector.get(0);
                            } else {
                                menuSelected = menuSelector.get(index+1);
                            }

                        }

                        menuSelected = $(menuSelected);
                        menuSelected.parent().addClass('menuSelected');
                        menuSelected.parent().siblings().removeClass('menuSelected');

                    }

                });

            }

        }

    }

};

setuptools.lightbox.menu.context.isOpen = function(name) {

    if ( typeof setuptools.tmp.contextMenuOpen === 'undefined' ) return false;
    return setuptools.tmp.contextMenuOpen[name];

};

//  close a context menu
setuptools.lightbox.menu.context.close = function(name, keep) {

    function CloseMenu(name) {

        clearInterval(setuptools.tmp.intervalContext[name]);
        delete setuptools.tmp.intervalContext[name];
        delete setuptools.tmp.contextMenuOpen[name];
        $('.setuptools.div.menu.' + name).remove();
        $(setuptools.tmp.contextSelf[name]).removeClass('selected');

    }

    if ( setuptools.tmp.contextSelf ) {

        //  close a specific menu
        if ( !keep && setuptools.tmp.intervalContext[name]) {
            CloseMenu(name);
            return;
        }

        //  shouldn't get this far
        if ( !keep && typeof name === 'string' ) return;

        //  close all menus
        for (var i in setuptools.tmp.intervalContext)
            if (setuptools.tmp.intervalContext.hasOwnProperty(i))
                if ( !keep || ( keep === true && i !== name ) )
                    CloseMenu(i);

    }

};

//  create a pagination object
setuptools.lightbox.menu.paginate.create = function(PageList, ActionItem, ActionContainer, ActionSelector, ActionCallback, ActionContext, Modifiers) {

    if ( typeof ActionContext === 'function' ) ActionContext = [ActionContext];
    if ( typeof ActionContext !== 'object' ) ActionContext = [];

    var lastPageRaw = Number(PageList.length/setuptools.data.config.accountsPerPage);
    var currentPage = ( typeof setuptools.lightbox.menu.paginate.state[ActionContainer] === 'object' ) ? setuptools.lightbox.menu.paginate.state[ActionContainer].currentPage : 0;
    setuptools.lightbox.menu.paginate.state[ActionContainer] = {
        PageList: PageList,
        ActionItem: ActionItem,
        ActionContainer: ActionContainer,
        ActionSelector: ActionSelector,
        ActionCallback: ActionCallback,
        ActionContext: ActionContext,
        currentPage: currentPage,
        Modifiers: (typeof Modifiers === 'object') ? Modifiers : {},
        lastPage: Math.ceil(lastPageRaw),
        html: {}
    };

    //  this method needs a shortened name :)
    var state = setuptools.lightbox.menu.paginate.state[ActionContainer];

    //  update on boundaries
    if ( state.lastPage > 0 ) state.lastPage--;
    if ( state.currentPage > state.lastPage ) state.currentPage = state.lastPage;

    state.html.menu = ' \
        <div class="setuptools div pageControls full"> \
            <div class="editor control firstPage noselect" title="First Page">&#171;</div> \
            <div class="editor control previousPage noselect" title="Previous Page">&#8249;</div> \
            <div class="editor control customPage"><input name="customPage" value="' + ( (state.currentPage > -1) ? state.currentPage+1 : 1 ) + '"><span class="noselect"> of ' + (state.lastPage+1) + ' page' + ( ((state.lastPage+1) > 1) ? 's' : '' ) + '</span></div> \
            <div class="editor control gotoPage noselect" title="Go to Page">&#x1F50E</div> \
            \
            <div class="editor control lastPage noselect" title="Last Page">&#187;</div> \
            <div class="editor control nextPage noselect" title="Next Page">&#8250;</div> \
            ' + ( (typeof state.Modifiers.pageButtons === 'object' && typeof state.Modifiers.pageButtons.html === 'string' ) ? state.Modifiers.pageButtons.html : '' ) + ' \
        </div> \
    ';

    state.html.search = ' \
        <div class="setuptools div pageControls">\
            <div class="editor control searchName" title=""><input name="searchName" placeholder="Search by Name" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div> \
            <div class="editor control search noselect" title="Find Account">&#x1F50E</div> \
        </div>\
    ';

    //  bind all pagination ui button actions
    state.bind = function(ActionContextOptions, skip) {

        state.ActionContextOptions = ActionContextOptions;
        setuptools.lightbox.menu.paginate.pageUpdate(false, ActionContext, ActionContextOptions);

        //  goto page
        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.gotoPage').click(function() {
            var inputSelector = 'div.' + ActionContainer + ' div.customPage input[name="customPage"]';
            var customPage = Number($(inputSelector).val())-1;
            if ( customPage > state.lastPage ) customPage = state.lastPage;
            if ( customPage < 0 ) customPage = 0;
            if ( customPage !== state.currentPage ) {
                state.currentPage = customPage;
                $(inputSelector).val(state.currentPage);
                $(ActionSelector).html(ActionCallback(ActionItem, state.currentPage));
                setuptools.lightbox.menu.paginate.pageUpdate(true, ActionContext, ActionContextOptions);
            }
        });

        //  first page
        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.firstPage').click(function() {
            if ( state.currentPage > 0 ) {
                state.currentPage = 0;
                setuptools.lightbox.menu.context.close();
                $(ActionSelector).html(ActionCallback(ActionItem, state.currentPage));
                setuptools.lightbox.menu.paginate.pageUpdate(true, ActionContext, ActionContextOptions);
            }
        });

        //  last page
        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.lastPage').click(function() {
            if ( state.lastPage > state.currentPage ) {
                state.currentPage = state.lastPage;
                setuptools.lightbox.menu.context.close();
                $(ActionSelector).html(ActionCallback(ActionItem, state.currentPage));
                setuptools.lightbox.menu.paginate.pageUpdate(true, ActionContext, ActionContextOptions);
            }
        });

        //  next page
        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.nextPage').click(function() {
            if ( state.currentPage < state.lastPage ) var nextPage = state.currentPage+1;
            if ( nextPage <= state.lastPage ) {
                state.currentPage = nextPage;
                setuptools.lightbox.menu.context.close();
                $(ActionSelector).html(ActionCallback(ActionItem, state.currentPage));
                setuptools.lightbox.menu.paginate.pageUpdate(true, ActionContext, ActionContextOptions);
            }
        });

        //  previous page
        $('div.' + ActionContainer + ' div.setuptools.div.pageControls div.previousPage').click(function() {
            if ( state.currentPage-1 >= 0 ) var previousPage = state.currentPage-1;
            if ( previousPage >= 0 ) {
                state.currentPage = previousPage;
                setuptools.lightbox.menu.context.close();
                $(ActionSelector).html(ActionCallback(ActionItem, state.currentPage));
                setuptools.lightbox.menu.paginate.pageUpdate(true, ActionContext, ActionContextOptions);
            }
        });

        //  search by name ui bindings
        setuptools.lightbox.menu.search.bind(state, skip);

    };

    return state;

};

//  perform the search box lookup and action
setuptools.lightbox.menu.search.searchExecute = function(state, searchTerm, skip) {

    //  build our PageList
    var PageList;
    if ( typeof state.Modifiers === 'object' && typeof state.Modifiers.search === 'object' ) {

        //  we need to convert the complex object to a simple one
        PageList = [];
        for ( i = 0; i < state.PageList.length; i++ )
            if ( typeof state.PageList[i][state.Modifiers.search.key] === 'string' )
                PageList.push(state.PageList[i][state.Modifiers.search.key]);

    } else PageList = state.PageList;

    var searchName = $('div.' + state.ActionContainer + ' div.searchName input[name="searchName"]');
    if ( typeof searchTerm !== 'string' ) searchTerm = searchName.val();
    var searchIndex = PageList.indexOf(searchTerm);

    //  no matches; do nothing
    if ( searchIndex === -1 ) return;

    //  locate which page it would be on
    setuptools.lightbox.menu.paginate.findPage(searchIndex, state.ActionContainer);

    //  close and update
    searchName.val('');
    if ( skip === true ) return;
    $(state.ActionSelector).html(state.ActionCallback(state.ActionItem, state.currentPage));
    setuptools.lightbox.menu.paginate.pageUpdate(true, state.ActionContext, state.ActionContextOptions);

};

//  bind search by name ui elements
setuptools.lightbox.menu.search.bind = function(state, skip, altContainer, altPosition, altAdjustments, altBinding, keepName) {

    var name = 'search';
    var container = altContainer || state.ActionContainer;
    var searchName = $('div.' + container + ' div.searchName input[name="searchName"]');

    //  search as user types
    searchName.unbind('keyup').keyup(function(e) {

        //  get current search value
        var value = $(this).val();

        //  if empty we exit
        if ( value.length === 0 ) {
            setuptools.lightbox.menu.context.close();
            return;
        }

        if ( !altContainer ) setuptools.lightbox.menu.context.keyup(name, e, '.searchExecuteByName');
        if ( [13,27,38,40].indexOf(e.keyCode) > -1 ) return;

        //  build out matches list
        var hits = {partial: [], exact: []};
        var PageList = state.PageList;
        if ( typeof state.PageList[0] === 'object' ) {

            PageList = [];
            for ( var i in state.PageList )
                if ( state.PageList.hasOwnProperty(i) )
                    PageList.push(state.PageList[i].username);

        }

        for ( var i in PageList ) {

            if ( PageList.hasOwnProperty(i) ) {

                //  exact match occurring
                if ( PageList[i].indexOf(value) === 0 ) hits.exact.push(PageList[i]);

                //  partial match occurring
                var regex = new RegExp('.*?' + value + '.*?', 'i');
                if ( hits.exact.indexOf(PageList[i]) === -1 && value.length > 1 && PageList[i].match(regex) ) hits.partial.push(PageList[i]);

                //  total up found results and stop processing after 10 matches
                var total = hits.partial.length+hits.exact.length;
                if ( total >= 10 ) break;

            }

        }

        //  don't build empty context menus
        if ( hits.partial.length > 0 || hits.exact.length > 0 ) {

            //  trim results down to 5 each
            if (hits.partial.length > 5) hits.partial.length = 5;
            if (hits.exact.length > 5) hits.exact.length = 5;

            //  build context menu
            var position = $(this);
            var options = [];

            //  add exact matches menu
            if (hits.exact.length > 0) {

                options.push({
                    option: 'header',
                    value: 'Exact Matches'
                });

                //  build exact matches
                for (i = 0; i < hits.exact.length; i++)
                    options.push({
                        class: 'searchExecuteByName exact',
                        name: hits.exact[i],
                        callback: function(searchTerm) {
                            setuptools.lightbox.menu.search.searchExecute(state, searchTerm, skip);
                            if ( typeof altBinding === 'function' ) altBinding(searchTerm);
                        },
                        callbackArg: hits.exact[i]
                    });

            }

            //  build partial matches
            if (hits.partial.length > 0) {

                options.push({
                    option: 'header',
                    value: 'Partial Matches'
                });

                for (i = 0; i < hits.partial.length; i++) {
                    options.push({
                        class: 'searchExecuteByName partial',
                        name: hits.partial[i],
                        callback: function(searchTerm) {
                            setuptools.lightbox.menu.search.searchExecute(state, searchTerm, skip);
                            if ( typeof altBinding === 'function' ) altBinding(searchTerm);
                        },
                        callbackArg: hits.partial[i]
                    });
                }

            }

            //  adjust positioning
            if ( typeof altAdjustments !== 'object' ) altAdjustments = {};
            options.push({
                option: 'pos',
                h: altAdjustments.h || 'right',
                v: altAdjustments.v || 'bottom',
                hpx: altAdjustments.hpx || -8,
                vpx: altAdjustments.vpx || 21
            });

            //  disable default keyup behavior because it won't work over there for this
            options.push({
                option: 'keyup',
                value: false
            });

            //  display the menu
            var nested = ( altPosition );
            setuptools.lightbox.menu.context.create('search', nested, altPosition || position, options);

            //  bind menu keys

        } else {

            setuptools.lightbox.menu.context.close('search');

        }

    });

    //  find the page the specified user is on
    $('div.' + container + ' div.setuptools.div.pageControls div.search').click(function() {
        setuptools.lightbox.menu.search.searchExecute(state);
    });

    //  if searchName loses focus we will close any potentially open menu if the click is outside the menu
    searchName.unbind('blur').blur(function() {
        var self = $(this);
        setTimeout(function() {
            var child = $(setuptools.tmp.activeClick.target);
            if ( child.hasClass('link') === false && child.parent().hasClass('link') === false) {
                setuptools.lightbox.menu.context.close('search');
                self.val('');
            }
        },
        //  we set a delay here because it conflicts with context menu clicks
        200);
    });

    searchName.unbind('focus').focus(function() {
        setuptools.lightbox.menu.context.close(keepName, true);
    });

    return searchName;

};

//  clear pagination state information
setuptools.lightbox.menu.paginate.clear = function(ActionContainer, reset) {

    if ( ActionContainer && !reset ) {

        delete setuptools.lightbox.menu.paginate.state[ActionContainer];
        return;

    }

    if ( ActionContainer && reset === true ) {

        setuptools.lightbox.menu.paginate.findPage(0, ActionContainer);

    } else {

        for (var i in setuptools.lightbox.menu.paginate.state)
            if (setuptools.lightbox.menu.paginate.state.hasOwnProperty(i))
                delete setuptools.lightbox.menu.paginate.state[i];

    }

};

//  determine the current and last pages
setuptools.lightbox.menu.paginate.findPage = function(searchIndex, ActionContainer) {

    var state = setuptools.lightbox.menu.paginate.state[ActionContainer];
    var PageList = state.PageList;
    if ( typeof searchIndex === 'string' ) searchIndex = PageList.indexOf(searchIndex);
    state.lastPage = PageList.length/setuptools.data.config.accountsPerPage;
    state.currentPage = Math.floor(state.lastPage*(searchIndex/PageList.length));
    state.lastPage = Math.ceil(state.lastPage);
    if ( state.lastPage > 0 ) state.lastPage--;
    if ( state.currentPage < 0 ) state.currentPage = 0;
    if ( state.currentPage > state.lastPage ) state.currentPage = state.lastPage;

};

//  reset and rebind ui state on page updates
setuptools.lightbox.menu.paginate.pageUpdate = function(close, ActionContext, ActionContextOptions) {

    if ( typeof ActionContext === 'undefined' ) ActionContext = [];
    if ( close === true ) setuptools.lightbox.menu.context.close();
    for ( i = 0; i < ActionContext.length; i++ )
        ActionContext[i](ActionContextOptions);

};

//  display a tooltip above the selected content
setuptools.lightbox.tooltip = function(parent, content, modifiers) {

    //  must be a string of length
    if ( !(parent instanceof jQuery) ) parent = $(parent);
    if ( typeof content !== 'string' || content.length === 0 ) return;
    if ( typeof modifiers !== 'object' ) modifiers = {};
    if ( typeof modifiers.classes !== 'string' ) modifiers.classes = '';

    //  prepare the tooltip
    var tooltip = $('<div class="tooltip ' + modifiers.classes + '"></div>');
    tooltip.appendTo($('body'));

    //  set html
    tooltip.html(content);

    //  get positioning data
    var domHeight = ( modifiers.heightFrom === 'tooltip' ) ? tooltip.outerHeight(true) : parent.outerHeight(true);
    var position = parent.offset();

    //  build css adjustments
    var css = {
        left: position.left,
        top: position.top-domHeight
    };

    //  adjust menu position if this is going to render right of the window
    var width = tooltip.outerWidth(true);
    if ( position.left+width >= window.innerWidth-20 ) css.left = css.left-width+parent.outerWidth();
    if ( css.left+width >= window.innerWidth ) return;

    //  set the css
    tooltip.css(css);

};

setuptools.lightbox.status = function(self, string, duration) {

    if ( typeof duration !== 'number' ) duration = 2500;
    self = $(self);
    var text = self.text();
    self.html('<span>' + string + '</span>');
    self.find('span').fadeOut(duration, function(){

        $(this).remove();
        self.text(text);

    });

};

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
                if ( typeof config.closeIcon === 'undefined' ) config.closeIcon = '';
                if ( typeof config.closeOnClick === 'undefined' ) config.closeOnClick = false;
            }

            if ( typeof config.closeOnEsc === 'undefined' ) config.closeOnEsc = false;
            if ( typeof config.otherClose === 'undefined' ) config.otherClose = 'a.setuptools:not(.noclose), .setuptools.error, .setuptools.link:not(.noclose)';
            if ( typeof config.variant === 'undefined' ) config.variant = 'setuptools';
            if ( typeof config.openSpeed === 'undefined' ) config.openSpeed = 0;
            if ( typeof config.closeSpeed === 'undefined' ) config.closeSpeed = 0;
            if ( typeof config.closeOnClick === 'undefined' ) config.closeOnClick = 'background';
            if ( typeof config.afterClose === 'undefined' ) config.afterClose = function() {
                setuptools.lightbox.menu.context.close();
            }

        }

        setuptools.lightbox.active[page] = $.featherlight(' \
            <p class="setuptools block"> \
            ' + ( (title !== false) ? '<h1>' + title + '</h1> ' : '' ) + ' \
            <span>' + data + '</span> \
            </p> \
        ', config);

        //  send to analytics if enabled
        setuptools.app.ga('send', {
            hitType: 'pageview',
            page: '#' + page
        });

    }

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

    }
    //  create the lightbox from the build data
    else {

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
                            <div class="setuptools bottom container w100 cboth"> \
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
                            <a class="drawhelp docs' + (( setuptools.state.firsttime === true ) ? ' noclose' : '') + '" \
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

        //  add go home button on certain pages
        if ( ['drawhelp', 'main', 'accounts-deepcopy-download', 'settings-eraseAll-complete', 'settings-erase-completed'].indexOf(page) === -1 ) {
            var widthOffset = 60;
            if ( setuptools.state.firsttime === true ) widthOffset = 30;
            setuptools.lightbox.builds[page].push('<a href="#" class="drawhelp gohome" title="Home"' + (( typeof drawhelpData === 'object' ) ? ' style="right: ' + widthOffset + 'px;"' : '') + '>&#9751;</a>');
        }

        //  create the lightbox and delete the temporary build data
        setuptools.lightbox.create(setuptools.lightbox.builds[page].join(' '), config, title, page);
        setuptools.lightbox.builds[page].splice(0);

        //  bind any goback click
        if ( typeof gobackData === 'object' ) $('.setuptools.goback').click(function(e) { e.preventDefault(); gobackData.callback(); });

        //  bind any help button
        if ( typeof drawhelpData === 'object' ) $('.drawhelp.docs').click(function(e) {
            setuptools.lightbox.ajax(e, drawhelpData, this);
        });

        //  bind home button
        $('.drawhelp.gohome').unbind('click').click(function() {

            setuptools.lightbox.close();
            setuptools.app.index();

        });

    }

};


//  manually close a lightbox
setuptools.lightbox.close = function(page) {

    if ( !setuptools.lightbox.active[page] ) {
        for ( var i in setuptools.lightbox.active )
            if ( setuptools.lightbox.active.hasOwnProperty(i) )
                setuptools.lightbox.active[i].close();
        return;
    }

    setuptools.lightbox.active[page].close();

};

//  provide an interface to override default actions on pages
setuptools.lightbox.override = function(targetPage, targetAction, callback, data) {

    if ( typeof setuptools.lightbox.overrides[targetPage] === 'undefined' ) setuptools.lightbox.overrides[targetPage] = {};
    setuptools.lightbox.overrides[targetPage][targetAction] = {
        callback: callback,
        data: data
    };

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

//  perform an ajax call for assisting the lightbox in loading remote content
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
    var LightboxConfig = {variant: 'setuptools-medium nobackground', openSpeed: 0, closeSpeed: 0, closeOnClick: 'background', closeIcon: '&#10005;', closeOnEsc: true};

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