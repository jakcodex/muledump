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
    var customClasses = '';
    var doAfterClose = false;
    var doAfterCloseArgs = [track];
    var doHoverCloseTimer;
    var doHoverClose = false;
    var doKeyup = true;
    var doClose = {};
    var doContext;
    var doScrollLock;
    var doAppend;
    var skipOption = {
        reposition: false
    };
    var bindings = [];
    var menu = $('<div class="setuptools div menu noselect scrollbar ' + name + '">');
    var html = '';
    var customPos = {
        h: 'left',
        v: 'top',
        hpx: 0,
        vpx: 0
    };
    var absPos = {};
    var reposition;
    var watch;
    var channel = {};

    //  get positioning information
    var position = track.offset();

    //  load options into menu
    for ( var i in options ) {

        if (options.hasOwnProperty(i)) {

            //  build a list of supplied attributes
            var attributes = '';
            if ( typeof options[i].attributes === 'object' ) {

                for ( var x in options[i].attributes )
                    if ( options[i].attributes.hasOwnProperty(x) )
                        attributes += x + '=\'' + options[i].attributes[x] + '\' ';

            }

            if ( typeof options[i].override === 'string' ) options[i].override = [options[i].override];
            if ( Array.isArray(options[i].override) === false ) options[i].override = [];

            //  default format is a link and it includes no option key
            if (!options[i].option) {

                html += '<div class="link"><a href="#" class="setuptools ' + options[i].class + '" ' + attributes + '>' + options[i].name + '</a></div>\n';

            } else {

                //  insert additional headers
                if (options[i].option === 'header') {

                    var style = '';
                    var ns = 'noselect';
                    if (typeof options[i].callback === 'function') {
                        style = "cursor: pointer;";
                        ns = '';
                    }

                    html += '<div class="setuptools header ' + ns + '" style="' + style + '"><div class="' + (options[i].class || '') + '"><strong>' + options[i].value + '</strong></div></div>\n';

                }
                //  create an actual link

                else if ( options[i].option === 'link' ) {

                    var featherlightAttr = '';
                    //  at some point  // if ( options[i].featherlight ) featherlightAttr =
                    html += '<div class="link"><a href="' + options[i].href + '" class="setuptools menuLink ' + options[i].class + '" ' + ( (options[i].target) ? 'target="' + options[i].target + '"' : '' ) + ' ' + featherlightAttr + '>' + options[i].name + '</a></div>\n';

                }
                //  apply custom css modifications to the menu
                else if (options[i].option === 'css' ) {

                    if ( options[i].css ) menu.css(options[i].css);

                }
                //  modify default positioning parameters
                else if (options[i].option === 'pos') {

                    if (options[i].h) customPos.h = options[i].h;
                    if (options[i].v) customPos.v = options[i].v;
                    if (options[i].hpx) customPos.hpx = options[i].hpx;
                    if (options[i].vpx) customPos.vpx = options[i].vpx;

                }
                //  modify default positioning parameters
                else if (options[i].option === 'customPos') {

                    if ( options[i].vpx && options[i].hpx ) {

                        if ( !options[i].v ) options[i].v = 'top';
                        if ( !options[i].h ) options[i].h = 'left';

                        position = {
                            top: 'initial',
                            bottom: 'initial',
                            left: 'initial',
                            right: 'initial'
                        };

                        if ( typeof position[options[i].v] === 'string' && typeof options[i].vpx !== 'undefined' ) position[options[i].v] = options[i].vpx;
                        if ( typeof position[options[i].h] === 'string' && typeof options[i].hpx !== 'undefined' ) position[options[i].h] = options[i].hpx;

                    }

                }
                //  absolute positioning
                else if ( options[i].option === 'absPos' ) {

                    if ( options[i].h ) absPos.h = options[i].h;
                    if ( options[i].v ) absPos.v = options[i].v;
                    if ( options[i].hpx ) absPos.hpx = options[i].hpx;
                    if ( options[i].vpx ) absPos.vpx = options[i].vpx;

                }
                //  append menu instead of hovering over dom
                else if ( options[i].option === 'append' ) {

                    if ( typeof options[i].hook !== 'string' ) continue;
                    doAppend = options[i].hook;

                }
                //  override keyup bindings
                else if ( options[i].option === 'keyup' ) {

                    doKeyup = options[i].value;

                }
                //  allow an option for closing on mouseleave
                else if ( options[i].option === 'hover' ) {

                    if ( options[i].action === 'close' ) {
                        doHoverClose = ( typeof options[i].delay === 'number' ) ? options[i].delay : 500;
                        doHoverCloseTimer = ( typeof options[i].timer === 'string' ) ? options[i].timer : 'menuHoverClose';
                    }

                }

                else if ( options[i].option === 'close' ) {

                    if ( typeof options[i].callback === 'function' ) doClose.callback = options[i].callback;
                    doClose.delay = ( typeof options[i].delay === 'number' ) ? options[i].delay : 0;

                }
                //  allow skipping actions
                else if ( options[i].option === 'skip' ) {

                    if ( typeof options[i].value === 'string' ) {

                        if ( skipOption[options[i].value] === false ) skipOption[options[i].value] = true;

                    }

                }
                //  allow for integrating scrollLock
                else if ( options[i].option === 'scrollLock' ) {

                    if ( typeof options[i].hook !== 'string' ) continue;
                    doScrollLock = options[i].hook;

                }
                //  allow adding custom classes
                else if ( options[i].option === 'class' ) {

                    if ( typeof options[i].value === 'string' ) customClasses = options[i].value;

                }
                //  side channel additions
                else if ( options[i].option === 'channel' ) {

                    if ( typeof options[i].keyup === 'function' ) channel.keyup = options[i].keyup;

                }
                //  support input options
                else if ( options[i].option === 'input' ) {

                    html += '<div class="input">' + options[i].value + '</div>\n';
                    if ( typeof options[i].binding === 'function' ) options[i].binding = [options[i].binding];
                    if ( typeof options[i].binding === 'object' ) bindings = bindings.concat(options[i].binding);

                }
                //  support select options
                else if ( options[i].option === 'select' ) {

                    if ( typeof options[i].options !== 'object' ) continue;
                    html += '<div class="select">\n';
                    html += '<div class="mb5" style="color: #0094ff; font-weight: bold; z-index: 5000;">' + options[i].name + '</div>';
                    html += '<select name="stmenu-' + options[i].name + '" class="' + ( (options[i].class) ? options[i].class : '' ) + '">\n';
                    var selected;

                    for ( var value in options[i].options ) {

                        if ( options[i].options.hasOwnProperty(value) ) {

                            selected = undefined;
                            if ( typeof options[i].selected !== 'undefined' ) selected = options[i].selected;
                            if ( selected === false ) selected = '-1';
                            selected = ( value === selected ) ? 'selected' : '';
                            html += '<option value="' + value + '" ' + selected + '>' + options[i].options[value] + '</option>';

                        }

                    }

                    html += '</select>\n';
                    html += '</div>\n';

                    if ( typeof options[i].binding === 'function' ) options[i].binding = [options[i].binding];
                    if ( typeof options[i].binding === 'object' ) bindings = bindings.concat(options[i].binding);

                }
                //  handle repositioning persistent menus on page updates
                else if ( options[i].option === 'reposition' ) {

                    if (
                        typeof options[i].parentClass === 'string' &&
                        typeof options[i].menuClass === 'string' &&
                        typeof options[i].attr === 'string' &&
                        typeof options[i].value === 'string'
                    ) {

                        reposition = {
                            parentClass: options[i].parentClass,
                            menuClass: options[i].menuClass,
                            attr: options[i].attr,
                            value: options[i].value
                        };

                    }

                }
                //  watch for content state
                else if ( options[i].option === 'watch' ) {

                    if (
                        typeof options[i].class === 'string' &&
                        typeof options[i].attr === 'string' &&
                        typeof options[i].value === 'string'
                    ) {

                        //  the default action is to close this menu
                        watch = {
                            class: options[i].class,
                            attr: options[i].attr,
                            value: options[i].value,
                            callback: ( ( typeof options[i].callback === 'function' ) ? options[i].callback : function() {
                                setuptools.lightbox.menu.context.close(name);
                                return false;
                            })
                        };

                    }

                }
                //  override the default action of closing the menu on interaction
                else if ( options[i].option === 'afterClose' ) {

                    if ( typeof options[i].callback === 'function' ) doAfterClose = options[i].callback;
                    if ( typeof options[i].callbackArg === 'string' ) doAfterCloseArgs = [options[i].callbackArg];
                    if ( Array.isArray(options[i].callbackArg) === true ) doAfterCloseArgs = options[i].callbackArg;

                }
                //  context menus on menu items
                else if ( options[i].option === 'context' ) {

                    if ( typeof options[i].callback === 'function' ) doContext = options[i].callback;

                }

            }

        }

    }

    //  display the menu
    if ( typeof customClasses === 'string' && customClasses.match(/smallMenuCells/) === null ) customClasses += ' smallMenuCells';
    if ( customClasses.length > 0 ) menu.addClass(customClasses);
    menu.html(html);
    if ( !doAppend ) {
        $('body').append(menu);
    } else menu.appendTo($(doAppend));

    //  record the menu
    if ( menu.find('.copySelection').length > 0 ) new ClipboardJS('.copySelection');
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

        //  watch for content and react
        if ( typeof watch === 'object' ) {

            //  set default watch for
            if ( typeof watch.for !== 'string' ) watch.for = 'missing';

            //  select the element
            watch.track = $('.' + watch.class + '[' + watch.attr + '="' + watch.value + '"]');

            //  watch for: missing
            if ( watch.for === 'missing' && watch.track.length === 0 ) {

                window.techlog('Lightbox/ContextMenu - findPosition - executing watch callback', 'force');
                if ( watch.callback() === false ) return;

            }

        }

        //  reposition or abort if track is 0,0
        if ( typeof position === 'object' && position.top === 0 && position.left === 0 ) {

            //  99.999% certainty our tracked dom got erased leading to this
            if ( !reposition ) {
                window.techlog('Lightbox/ContextMenu - findPosition - closing on reposition init', 'force');
                setuptools.lightbox.menu.context.close(name);
                return;
            }

            //  attempt to locate the track position
            track = $('.' + reposition.parentClass + '[' + reposition.attr + '="' + reposition.value + '"]').find('.' + reposition.menuClass);
            position = track.offset();
            if ( typeof position !== 'object' ) {
                window.techlog('Lightbox/ContextMenu - findPosition - closing on reposition failure', 'force');
                setuptools.lightbox.menu.context.close(name);
                return;
            }

        }

        var height = menu.outerHeight(true);
        var width = menu.outerWidth(true);
        var w = $(window);

        //  absolute positioning specified overrides track
        if ( Object.keys(absPos).length > 0 ) {

            if ( absPos.h ) customPos.h = absPos.h;
            if ( absPos.v ) customPos.v = absPos.v;
            if ( absPos.hpx ) position[absPos.h] = absPos.hpx;
            if ( absPos.vpx ) position[absPos.v] = absPos.vpx;

        }

        //  build css adjustments
        var css = {};
        css[customPos.h] = position.left+customPos.hpx;
        css[customPos.v] = position.top+customPos.vpx;
        if ( customPos.v === 'top' ) css.bottom = 'initial';
        if ( customPos.v === 'bottom' ) css.bottom = w.outerHeight(true)-css.bottom;
        if ( customPos.h === 'right' ) css.right = w.outerWidth(true)-css.right;

        //  handle automatic repositioning
        if ( skipOption.reposition === false ) {

            //  adjust menu position if this is going to render below the window
            if (customPos.v !== 'bottom' && (position.top + height >= (w.pageYOffset-w.outerHeight(true)))) {

                css.top = 'initial';
                css.bottom = w.outerHeight(true) - position.top;

            }
            //  adjust menu position if this is going to render right of the window
            else if (customPos.h !== 'right' && (position.left + width >= (w.pageXOffset-w.outerWidth(true)))) {

                css.left = 'initial';
                css.right = w.outerWidth(true) - position.left;

            }

        }

        //  apply the css adjustments
        css[customPos.h] += 'px';
        css[customPos.v] += 'px';
        menu.css(css);

        // automatically adjusts the position of the menu with any window changes/scrolling/etc
        // setuptools.lightbox.menu.context.close will clear this interval
        if ( !setuptools.tmp.intervalContext ) setuptools.tmp.intervalContext = {};
        if ( skipOption.reposition !== true && !setuptools.tmp.intervalContext[name] ) setuptools.tmp.intervalContext[name] = setInterval(findPosition);

    }

    findPosition();

    //  the link option needs special treatment to autoclose the menu
    $('.setuptools.div.menu.' + name + ' a.menuLink').click(function() {
        if ( typeof doClose.callback === 'function' ) {
            if ( !setuptools.tmp.doCloseSkip || (Array.isArray(setuptools.tmp.doCloseSkip) && setuptools.tmp.doCloseSkip.indexOf(name) === -1) ) {
                if ( typeof doClose.delay !== 'number' ) doClose.delay = 0;
                ( doClose.delay === 0 ) ?
                    doClose.callback() :
                    setTimeout(doClose.callback, doClose.delay);
            } else delete setuptools.tmp.doCloseSkip[setuptools.tmp.doCloseSkip.indexOf(name)];
        } else setuptools.lightbox.menu.context.close(name);

    });

    //  links with callbacks when clicked cause the page to reset to top
    //  this will prevent that
    $('.setuptools.div.menu.' + name + ' > div > a').click(function(e) {
        if ( $(this).attr('href') === '#' ) e.preventDefault();
    });

    var cell = $('.setuptools.div.menu.' + name + ' > div');

    //  process context clicks
    if ( typeof doContext === 'function' ) cell.contextmenu(function(e) {
        doContext(this, e);
    });

    //  bind scrollLock
    if ( typeof doScrollLock === 'string' ) doScrollLock = new Muledump_ElementScrollLock('.setuptools.div.menu.' + name, doScrollLock, name);

    //  process options clicks
    cell.click(function() {

        var MenuOptions = {
            LinkOption: 'a',
            SelectOption: 'select',
            InputOption: 'input',
            DivOption: 'div'
        };

        //  build menu interaction bindings
        for ( var option in MenuOptions ) {

            if (MenuOptions.hasOwnProperty(option)) {

                var MenuOption = $(this).find(MenuOptions[option]);

                if (MenuOption.length > 0) {

                    for (var a in options) {

                        if (options.hasOwnProperty(a)) {

                            if (MenuOption.hasClass(options[a].class)) {

                                //  handle link clicks
                                if (option === 'LinkOption') {

                                    //  not our guy if the names don't match
                                    if ($(MenuOption).html() !== options[a].name) continue;

                                    //  execute callback
                                    if ( typeof options[a].callback === 'function' ) options[a].callback(options[a].callbackArg);

                                    //  preform all menu close tasks
                                    if ( typeof doClose.callback === 'function' ) {
                                        if ( !setuptools.tmp.doCloseSkip || (Array.isArray(setuptools.tmp.doCloseSkip) && setuptools.tmp.doCloseSkip.indexOf(name) === -1) ) {
                                            if ( typeof doClose.delay !== 'number' ) doClose.delay = 0;
                                            ( doClose.delay === 0 ) ?
                                                doClose.callback() :
                                                setTimeout(doClose.callback, doClose.delay);
                                        } else delete setuptools.tmp.doCloseSkip[setuptools.tmp.doCloseSkip.indexOf(name)];
                                    } else setuptools.lightbox.menu.context.close(name);
                                    if ( typeof doAfterClose === 'function' && options[a].override.indexOf('afterClose') === -1 ) doAfterClose.apply(null, doAfterCloseArgs);
                                    return;

                                //  handle header clicks
                                } else if ( option === "DivOption" ) {

                                    //  this area requires a callback
                                    if (typeof options[a].callback !== 'function') continue;

                                    //  not our guy if the names don't match
                                    if ($(MenuOption).text() !== options[a].value) continue;

                                    //  preform all menu close tasks
                                    if ( typeof doClose.callback === 'function' ) {
                                        if ( !setuptools.tmp.doCloseSkip || (Array.isArray(setuptools.tmp.doCloseSkip) && setuptools.tmp.doCloseSkip.indexOf(name) === -1) ) {
                                            if ( typeof doClose.delay !== 'number' ) doClose.delay = 0;
                                            ( doClose.delay === 0 ) ?
                                                doClose.callback() :
                                                setTimeout(doClose.callback, doClose.delay);
                                        } else delete setuptools.tmp.doCloseSkip[setuptools.tmp.doCloseSkip.indexOf(name)];
                                    } else setuptools.lightbox.menu.context.close(name);
                                    if ( typeof doAfterClose === 'function' && options[a].override.indexOf('afterClose') === -1 ) doAfterClose.apply(null, doAfterCloseArgs);

                                    //  execute callback
                                    options[a].callback(options[a].callbackArg);

                                    return;

                                }

                            }

                        }

                    }

                }

            }

        }

    });

    //  handle hover detection
    if ( doHoverClose ) {

        $('.setuptools.div.menu.' + name)
            .on('mouseleave', function(e) {

                //  select and input fields trigger hover close in firefox
                if ( ['select', 'input'].indexOf($(e.target)[0].localName) > -1 ) return;

                setuptools.tmp.muleMenuMouseLeaveTimer = setTimeout(function() {
                    setuptools.lightbox.menu.context.closeSkip(name);
                    setuptools.lightbox.menu.context.close();
                    if ( typeof doClose.callback === 'function' ) doClose.callback();
                }, doHoverClose);
            })
            .on('mouseenter', function() { clearTimeout(setuptools.tmp.muleMenuMouseLeaveTimer); });

    }

    //  close the menu with interaction
    /*menu.click(function() {
        if ( $(this).find('input').length === 0 ) setuptools.lightbox.menu.context.close();
    });*/

    if ( nested === false && doKeyup === true ) $(window).unbind('keyup').keyup(function(e) {
        setuptools.lightbox.menu.context.keyup(name, e);
        if ( typeof channel.keyup === 'function' ) channel.keyup(name, e);
    });

};

//  add a lightbox context menu to the doClose skip list
setuptools.lightbox.menu.context.closeSkip = function(name) {

    if ( typeof setuptools.tmp.doCloseSkip === 'undefined' ) setuptools.tmp.doCloseSkip = [];
    if ( setuptools.tmp.doCloseSkip.indexOf(name) === -1 ) setuptools.tmp.doCloseSkip.push(name);

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
            if ( menuSelected.hasClass('menuLink') === true ) {

                if ( menuSelected.attr('target') !== '_blank' ) {
                    location.href = menuSelected.attr('href');
                } else {
                    var win = window.open(menuSelected.attr('href'));
                    win.focus();
                }

            } else menuSelected.parent().trigger('click');

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

//  check if a named context menu is open
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
        if ( !keep && ( setuptools.tmp.intervalContext[name] || setuptools.tmp.contextMenuOpen[name] === true )) {
            CloseMenu(name);
            return;
        }

        //  shouldn't get this far
        if ( !keep && typeof name === 'string' ) return;

        //  close all menus
        for (var i in setuptools.tmp.contextMenuOpen)
            if (setuptools.tmp.contextMenuOpen.hasOwnProperty(i))
                if ( !keep || ( keep === true && i !== name ) )
                    CloseMenu(i);

    }

};

//  create a pagination object
setuptools.lightbox.menu.paginate.create = function(PageList, ActionItem, ActionContainer, ActionSelector, ActionCallback, ActionContext, Modifiers) {

    if ( typeof ActionContext === 'function' ) ActionContext = [ActionContext];
    if ( typeof ActionContext !== 'object' ) ActionContext = [];
    if ( typeof Modifiers === 'undefined' ) Modifiers = {};
    if ( typeof Modifiers.search === 'undefined' ) Modifiers.search = {};
    if ( typeof Modifiers.search.key === 'undefined' )
        if ( Array.isArray(Modifiers.search.keys) === true )
            Modifiers.search.key = Modifiers.search.keys;
    if ( typeof Modifiers.search.key === 'undefined' ) Modifiers.search.key = ['username']
    if ( typeof Modifiers.search.placeholder === 'undefined' ) Modifiers.search.placeholder = 'Search by Name';

    var lastPageRaw = Number(PageList.length/(Modifiers.recordsPerPage || setuptools.data.config.accountsPerPage));
    var currentPage = ( typeof setuptools.lightbox.menu.paginate.state[ActionContainer] === 'object' ) ? setuptools.lightbox.menu.paginate.state[ActionContainer].currentPage : 0;
    setuptools.lightbox.menu.paginate.state[ActionContainer] = {
        PageList: PageList,
        ActionItem: ActionItem,
        ActionContainer: ActionContainer,
        ActionSelector: ActionSelector,
        ActionCallback: ActionCallback,
        ActionContext: ActionContext,
        currentPage: currentPage,
        Modifiers: Modifiers,
        lastPage: Math.ceil(lastPageRaw),
        html: {}
    };

    //  this method needs a shortened name :)
    var state = setuptools.lightbox.menu.paginate.state[ActionContainer];

    //  update on boundaries
    if ( state.lastPage > 0 ) state.lastPage--;
    if ( state.currentPage > state.lastPage ) state.currentPage = state.lastPage;
    if (
        typeof state.Modifiers.pageButtons === 'object' &&
        typeof state.Modifiers.pageButtons.callback === 'function'
    ) state.Modifiers.pageButtons.html = state.Modifiers.pageButtons.callback();

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
            <div class="editor control searchName" title=""><input name="searchName" placeholder="' + state.Modifiers.search.placeholder + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div> \
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
        if ( state.Modifiers.search.container !== false ) new setuptools.lightbox.menu.search.bind(state, skip);

    };

    return state;

};

//  perform the default search box lookup and action
setuptools.lightbox.menu.search.searchExecute = function(state, searchTerm, skip) {

    var searchKeys = state.Modifiers.search.key;
    var searchName = $(( (typeof state.Modifiers.search.container === 'string') ? state.Modifiers.search.container : 'div.' + state.ActionContainer ) + ' div.searchName input[name="searchName"]');
    if ( typeof searchTerm !== 'string' ) searchTerm = searchName.val();
    var searchIndex = -1;

    //  type B format
    if ( typeof state.PageList[0] === 'object' ) {

        for (var i = 0; i < state.PageList.length; i++) {

            for (var x = 0; x < searchKeys.length; x++) {

                if (state.PageList[i][searchKeys[x]] === searchTerm) {

                    searchIndex = i;
                    break;

                }

            }

            if (searchIndex > -1) break;

        }

    }
    //  type A format
    else searchIndex = state.PageList.indexOf(searchTerm);

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
    if ( container.indexOf('.') === -1 && container.indexOf('#') === -1 ) container = 'div.' + container;
    var searchName = $(( (typeof state.Modifiers.search.container === 'string') ? state.Modifiers.search.container : container ) + ' div.searchName input[name="searchName"]');

    //  specify a default search execute method if none provided
    if ( typeof state.Modifiers.search.execute === 'undefined') state.Modifiers.search.execute = setuptools.lightbox.menu.search.searchExecute;

    //  convert PageList format B to A with modifiers if necessary
    var PageList;
    if ( typeof state.PageList[0] === 'object' ) {

        //  we need to convert the complex object to a simple one
        var searchKeys = state.Modifiers.search.key;
        if ( Array.isArray(searchKeys) === true ) {

            PageList = [];
            for (var i = 0; i < state.PageList.length; i++)
                for (var x = 0; x < searchKeys.length; x++)
                    if ( typeof state.PageList[i][searchKeys[x]] !== 'undefined' )
                        PageList.push(state.PageList[i][searchKeys[x]]);

        }

    } else PageList = state.PageList;

    //  search as user types
    searchName.unbind('keyup').keyup(function(e) {

        //  get current search value
        var value = $(this).val();

        //  if empty we exit
        if ( value.length === 0 ) {
            setuptools.lightbox.menu.context.close();
            return;
        }

        if ( !altContainer || state.Modifiers.search.keyup === true) setuptools.lightbox.menu.context.keyup(name, e, '.searchExecuteByName');
        if ( [13,27,38,40].indexOf(e.keyCode) > -1 ) return;

        //  build out matches list
        var hits = {partial: [], exact: []};
        for ( var i in PageList ) {

            if ( PageList.hasOwnProperty(i) ) {

                //  exact match occurring
                var exactRegex = new RegExp('^' + value + '.*?$', 'i');

                if ( value.length > 1 && PageList[i].match(exactRegex) ) hits.exact.push(PageList[i]);

                //  partial match occurring
                var partialRegex = new RegExp('.*?' + value + '.*?', 'i');
                if ( hits.exact.indexOf(PageList[i]) === -1 && value.length > 1 && PageList[i].match(partialRegex) ) hits.partial.push(PageList[i]);

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

            //  apply skip modifiers
            if ( Array.isArray(state.Modifiers.search.skip) === true ) {

                for ( var i = 0; i < state.Modifiers.search.skip.length; i++ ) options.push({
                    option: 'skip',
                    value: state.Modifiers.search.skip[i]
                });

            }

            var optCallback = function(searchTerm) {
                state.Modifiers.search.execute(state, searchTerm, skip, PageList);
                if ( typeof altBinding === 'function' ) altBinding(searchTerm);
            };

            //  add exact matches menu
            if (hits.exact.length > 0) {

                options.push({
                    option: 'header',
                    value: 'Exact Matches'
                });

                //  build exact matches
                for (i = 0; i < hits.exact.length; i++) {

                    if ( state.Modifiers.search.menuItem === 'link' ) {

                        options.push({
                            option: 'link',
                            class: 'searchExecuteByName exact',
                            name: hits.exact[i],
                            href: '#' + hits.exact[i],
                            callback: optCallback,
                            callbackArg: hits.exact[i]
                        });

                    } else options.push({
                        class: 'searchExecuteByName exact',
                        name: hits.exact[i],
                        callback: optCallback,
                        callbackArg: hits.exact[i]
                    });

                }

            }

            //  build partial matches
            if (hits.partial.length > 0) {

                options.push({
                    option: 'header',
                    value: 'Partial Matches'
                });

                for (i = 0; i < hits.partial.length; i++) {

                    if ( state.Modifiers.search.menuItem === 'link' ) {

                        options.push({
                            option: 'link',
                            class: 'searchExecuteByName partial',
                            name: hits.partial[i],
                            href: '#' + hits.partial[i],
                            callback: optCallback,
                            callbackArg: hits.partial[i]
                        });

                    } else options.push({
                        class: 'searchExecuteByName partial',
                        name: hits.partial[i],
                        callback: optCallback,
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
                hpx: ( (typeof altAdjustments.hpx === 'number' ) ? altAdjustments.hpx : -8 ),
                vpx: ( (typeof altAdjustments.vpx === 'number' ) ? altAdjustments.vpx : 21 )
            });

            if ( Array.isArray(state.Modifiers.search.skip) === true && state.Modifiers.search.skip.indexOf('reposition') > -1 ) options.push({
                option: 'skip',
                value: 'reposition'
            });

            //  disable default keyup behavior because it won't work over there for this
            options.push({
                option: 'keyup',
                value: false
            },
            {
                option: 'context',
                callback: state.Modifiers.search.context
            });

            if ( typeof state.Modifiers.search.css === 'object' ) options.push({
                option: 'css',
                css: state.Modifiers.search.css
            });

            if ( typeof state.Modifiers.search.class === 'string' ) options.push({
                option: 'class',
                value: state.Modifiers.search.class
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
    $(container + ' div.search').click(function() {
        state.Modifiers.search.execute(state);
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

//  bind an expansion button for an expandable element
setuptools.lightbox.expander = function(target, button, config) {

    if ( typeof config !== 'undefined' && typeof config !== 'object' ) return;
    config = $.extend(true, {
        transOverflow: 'hidden',
        initialOverflow: 'scroll',
        collapseHeight: undefined,
        initialTitle: 'Expand',
        transTitle: 'Collapse',
        customClass: ''
    }, config);
    $(button).on('click.lightbox.expander', function() {

        var box = $(target);
        var height = box[0].scrollHeight;

        //  expand
        if ( box.hasClass('expanded') === false ) {

            if ( config.collapseHeight === undefined ) config.collapseHeight = box.outerHeight();
            box.animate({height: height}, function() {
                $(this).css({'overflow-y': config.transOverflow}).addClass('expanded ' + config.customClass);
            });
            $(this).attr('title', config.transTitle).html('&#9899;&#9899;&#9899;');

            //  close
        } else {

            box.animate({height: config.collapseHeight}, function() {
                $(this).css({'overflow-y': config.initialOverflow}).removeClass('expanded ' + config.customClass);
            });
            $(this).attr('title', config.initialTitle).html('&#9898;&#9898;&#9898;');

        }

    });

};

//  display a tooltip above the selected content
setuptools.lightbox.tooltip = function(parent, content, modifiers) {

    //  must be a string of length
    if ( !(parent instanceof jQuery) && parent !== false) parent = $(parent);
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
    var position;
    if ( parent !== false ) {
        position = parent.offset();
    } else {
        position = modifiers.position;
    }

    //  this is never good
    if ( position.left === 0 && position.top === 0 ) return;

    //  build css adjustments
    var css = {
        left: position.left,
        top: position.top-domHeight
    };

    if ( typeof modifiers.css === 'object' ) css = $.extend(true, css, modifiers.css);

    //  adjust menu position if this is going to render right of the window
    var parentOuter = ( parent !== false ) ? parent.outerWidth() : 0;
    var width = tooltip.outerWidth(true);
    var height = tooltip.outerHeight(true);
    if ( position.left+width >= window.innerWidth-20 ) css.left = css.left-width+parentOuter;
    if ( css.top < window.pageYOffset ) css.top += (parent && parent.outerHeight(true) || 0)+height;
    if ( css.left+width >= window.innerWidth ) return;

    //  set the css
    tooltip.css(css);

    return tooltip;

};

//  swap an element with a status message and switch it back over time
setuptools.lightbox.status = function(self, string, duration, id, callback) {

    if ( typeof duration === 'function' ) {

        callback = duration;
        duration = undefined;

    }

    if ( typeof duration === 'string' ) {

        id = duration;
        duration = undefined;

    }

    if ( typeof id !== 'string' ) id = (new SeaSalt_Tools()).randomString(16);

    if ( !Array.isArray(setuptools.tmp.lightboxStatus) ) setuptools.tmp.lightboxStatus = [];
    if ( setuptools.tmp.lightboxStatus.indexOf(id) > -1 ) return;
    setuptools.tmp.lightboxStatus.push(id);

    if ( typeof duration !== 'number' ) duration = 2500;
    var origself = self;
    self = $(self);

    var text = self.text();
    self.html('<span>' + string + '</span>');
    self.find('span').fadeOut(duration, function(){

        $(this).remove();
        self.text(text);
        setuptools.tmp.lightboxStatus.splice(setuptools.tmp.lightboxStatus.indexOf(id), 1);
        if ( typeof callback === 'function' ) callback(origself);

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
            if ( typeof config.variant === 'undefined' ) {
                config.variant = 'setuptools';
            } else config.variant += ' setuptools';
            if ( typeof config.openSpeed === 'undefined' ) config.openSpeed = 0;
            if ( typeof config.closeSpeed === 'undefined' ) config.closeSpeed = 0;
            if ( typeof config.closeOnClick === 'undefined' ) config.closeOnClick = 'background';
            var acCallback = config.afterClose;
            config.afterClose = function () {
                if ( typeof acCallback === 'function' ) acCallback();
                setuptools.lightbox.menu.context.close();
                $('body').css({'overflow-y': 'scroll'});
                delete setuptools.lightbox.active[page];
            };
            if ( typeof config.beforeOpen === 'undefined' ) config.beforeOpen = function() {
                setuptools.lightbox.menu.context.close();
            };
            if ( typeof config.afterOpen === 'undefined' ) config.afterOpen = function() {
                $('body').css({'overflow-y': 'hidden'});
            };

        }

        setuptools.lightbox.active[page] = $.featherlight(' \
            <div class="setuptools block"> \
            ' + ( (title !== false) ? '<h1>' + title + '</h1> ' : '' ) + ' \
            <span>' + data + '</span> \
            </div> \
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

        //  apply any insertions
        setuptools.lightbox.inserts = setuptools.lightbox.inserts.filter(function(data) {
            if ( data[0] === page ) setuptools.lightbox[data[1]].apply(null, data[2]);
            return false;
        });

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
                                <div class="cfleft h100"> \
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

                        var url = ( (drawhelpData.link.match(/^https?:\/\/.*$/i) === null) ? setuptools.config.url + '/' : '' ) + drawhelpData.link.replace(/.md$/i, '');
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
        if ( setuptools.config.goHomeSkip.indexOf(page) === -1 ) {
            var widthOffset = 60;
            if ( setuptools.state.firsttime === true ) widthOffset = 30;
            setuptools.lightbox.builds[page].push('<a href="#" class="drawhelp gohome" title="Home"' + (( typeof drawhelpData === 'object' ) ? ' style="right: ' + widthOffset + 'px;"' : '') + '>&#9751;</a>');
        }

        //  create the lightbox and delete the temporary build data
        setuptools.lightbox.create(setuptools.lightbox.builds[page].join(''), config, title, page);
        setuptools.lightbox.builds[page].splice(0);
        setuptools.lightbox.overrides[page] = [];

        //  bind any goback click
        if ( typeof gobackData === 'object' ) $('.setuptools.goback').click(function(e) { e.preventDefault(); gobackData.callback(); });

        //  bind any help button
        if ( typeof drawhelpData === 'object' ) $('.drawhelp.docs').click(function(e) {
            if (
                typeof $(e.target).attr('href') === 'string' &&
                !$(e.target).attr('href').match(new RegExp('^https?:\/\/' + setuptools.config.hostedDomain + '\/.*$', 'i'))
            ) return;
            setuptools.lightbox.drawHelp(e, drawhelpData, this);
        });

        //  bind home button
        $('.drawhelp.gohome').unbind('click').click(function() {

            setuptools.lightbox.close();
            setuptools.app.index();

        });

    }

};


//  manually close a lightbox
setuptools.lightbox.close = function(page, only) {

    if ( only !== true && !setuptools.lightbox.active[page] ) {
        for ( var i in setuptools.lightbox.active )
            if ( setuptools.lightbox.active.hasOwnProperty(i) ) {
                setuptools.lightbox.active[i].close();
                delete setuptools.lightbox.active[i];
            }
        return;
    }

    if ( setuptools.lightbox.active[page] ) {
        setuptools.lightbox.active[page].close();
        delete setuptools.lightbox.active[page];
    }

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

    if ( typeof callback !== 'function' ) setuptools.lightbox.error('The callback value for goback is not valid.', 10);

    if ( !setuptools.lightbox.builds[page] ) setuptools.lightbox.builds[page] = [];
    setuptools.lightbox.builds[page].push({
        iam: 'goback',
        callback: callback,
        text1: text1,
        text2: text2
    });

};

/**
 * @function
 * @param {string} page
 * @param {string} callback
 * @param {array} [args]
 * Insert a page piece for a future page display
 */
setuptools.lightbox.insert = function(page, callback, args) {

    //  check for duplicates
    if ( setuptools.lightbox.inserts.filter(function(data) {
        return !(
            data[0] !== page ||
            (data[0] === page && data[1] !== callback) ||
            (data[0] === page && data[1] === callback && JSON.stringify(data[2]) !== JSON.stringify(args))
        );
    }).length > 0 ) return false;

    return setuptools.lightbox.inserts.push([page, callback, args]);

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
setuptools.lightbox.drawHelp = function(e, drawhelpData, self, options) {

    if ( typeof options === 'boolean' ) options = {net: options};
    if ( typeof options !== 'object' ) options = {};
    if ( !options.goback ) setuptools.tmp.goback = {
        data: drawhelpData,
        self: self
    };

    function AjaxFailure(url, drawhelpData, LightboxConfig) {

        setuptools.lightbox.build('drawhelp-error', 'Failed to load help docs. <br><br><a href="' + url + '" target="_blank">Click here</a> to go to the help doc page.');
        if ( setuptools.state.hosted === false ) setuptools.lightbox.build('drawhelp-error', '<br><br>If all else fails check the docs/ folder in your Muledump install.');
        if ( options.net === true ) setuptools.lightbox.build('drawhelp-error', '<br><br>Finally, the specific error indicates you may be having an Internet connection issue.');
        setuptools.lightbox.settitle('drawhelp-error', drawhelpData.title);
        setuptools.lightbox.display('drawhelp-error', LightboxConfig);

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
                if ( !Href.match(/^(?:http|#)/i) ) {
                    $(this).attr('target', '_blank');
                    $(this).attr('href', setuptools.config.url.replace(/(muledump-preview|muledump)/, '') + Href);
                }

                if ( Href.match(/^\/muledump(?:-preview)?\/docs\/.*$/i) ) {
                    $(this).addClass('drawhelp inner nostyle');
                }

            });

            //  draw the lightbox
            if ( options.goback ) setuptools.lightbox.build('drawhelp', '<a href="#" class="drawhelp goback" title="Start of Help"' + (( typeof options.goback === 'object' ) ? ' style="right: 30px;"' : '') + '>&#9751;</a>');
            setuptools.lightbox.close('drawhelp', true);
            setuptools.lightbox.close('drawhelp-error', true);
            setuptools.lightbox.build('drawhelp', '<div id="drawhelpBox">' + HelpSection.html() + '</div>');
            setuptools.lightbox.settitle('drawhelp', false);
            setuptools.lightbox.display('drawhelp', LightboxConfig);
            $('a.drawhelp.goback').on('click.drawhelp.goback', function(e) {
                setuptools.lightbox.drawHelp(e, setuptools.tmp.goback.data, setuptools.tmp.goback.self)
            });

            $('a.drawhelp.inner').on('click.drawhelp.inner', function(e) {
                setuptools.lightbox.drawHelp(e, drawhelpData, this, {
                    goback: true
                });
            });

        } else {

            AjaxFailure(url, drawhelpData, LightboxConfig);

        }

    }).fail(function() { AjaxFailure(url, drawhelpData, LightboxConfig, true); });

};