//  first time setup walk-through; no longer in use; but this started it all
setuptools.app.accounts.start = function() {

    setuptools.lightbox.build('accounts-start', '<span>Do you have <a href="#" class="setuptools initsetup page2">one or a few accounts</a> or <a href="#" class="setuptools initsetup page3">many accounts</a>?</span>');
    setuptools.lightbox.goback('accounts-start', setuptools.app.index);
    setuptools.lightbox.drawhelp('accounts-start', 'docs/setuptools/help/accounts-manager/index', 'Account Setup Help');
    setuptools.lightbox.display('accounts-start');
    $('.setuptools.initsetup.page2').click(setuptools.app.accounts.manager);
    $('.setuptools.initsetup.page3').click(setuptools.app.accounts.massImport);

};

//  new accounts manager
setuptools.app.accounts.manager = function() {

    setuptools.app.accounts.state.accountList = [];

    //  generate the html for any given page on the accounts list
    function ListAccounts(dummy, page) {

        if ( typeof page !== 'number' ) page = 0;
        var AccountsList = setuptools.lightbox.menu.paginate.state.AccountsList.PageList;

        //  prepare an empty row if no accounts exist
        if ( AccountsList.length === 0 ) AccountsList.push($.extend(true, {}, setuptools.objects.account, {username: '', password: ''}));

        if ( page > setuptools.lightbox.menu.paginate.state.AccountsList.lastPage ) page = setuptools.lightbox.menu.paginate.state.AccountsList.lastPage;
        $('div.AccountsList div.customPage input[name="customPage"]').val(page+1);

        //  determine our boundaries
        var minIndex = setuptools.data.config.accountsPerPage*page;
        var maxIndex = (setuptools.data.config.accountsPerPage*page)+setuptools.data.config.accountsPerPage;
        if ( maxIndex > AccountsList.length ) maxIndex = AccountsList.length;
        if ( AccountsList.length <= setuptools.data.config.accountsPerPage ) {
            minIndex = 0;
            maxIndex = AccountsList.length;
        }

        //  generate the page html
        var html = '';
        for ( i = minIndex; i < maxIndex; i++ ) html += createRow(i);
        return html;

    }

    //  return html for an account row
    function createRow(listPos) {

        var autocomplete = ( setuptools.data.config.autocomplete === true ) ? 'autocomplete="on"' : 'autocomplete="negative"';
        return ' \
            <div class="cell noselect" data-listPos="' + listPos + '"> \
                <div><input class="text" name="username" type="text" placeholder="Account Email or ID" value="' + AccountsList[listPos].username + '" ' + autocomplete + '></div> \
                <div><input class="text" name="password" type="password" placeholder="Account Password" value="' + AccountsList[listPos].password + '" data-reveal="false" ' + autocomplete + '></div> \
                <div><div class="setuptools div accountControls">\
                    <div data-option="accountMenu" title="Account Menu">&#8801;</div> \
                    <div data-option="toggleEnable" class="' + (( AccountsList[listPos].enabled === true ) ? ' selected" title="Account Enabled' : '" title="Account Disabled') + '" style="padding-top: 1px;">&#9733;</div> \
                    <div data-option="delete" title="Delete Account" style="padding-top: 1px;">&#10006;</div>\
                </div></div> \
            </div>\
        ';

    }

    //  update our displayed position within the accounts list
    function AccountsListUpdate(direction) {

        var data = setuptools.lightbox.menu.paginate.state.AccountsList;
        if ( direction === 'add' ) setuptools.lightbox.menu.paginate.findPage(data.PageList.length-1, 'AccountsList');
        if ( direction === 'reset' ) setuptools.lightbox.menu.paginate.findPage(0, 'AccountsList');

        //  validate lastPage/currentPage boundary
        if ( ['remove','reset'].indexOf(direction) > -1 ) {

            var newLastPage = Math.ceil(data.PageList.length/setuptools.data.config.accountsPerPage);
            if ( newLastPage > 0 ) newLastPage--;
            if ( data.currentPage > newLastPage ) setuptools.lightbox.menu.paginate.findPage(data.PageList.length-1, 'AccountsList');

        }

        var AccountsPaginate = setuptools.lightbox.menu.paginate.create(
            data.PageList,
            data.ActionItem,
            'AccountsList',
            data.ActionSelector,
            data.ActionCallback,
            data.ActionContext,
            data.Modifiers
        );

        $('div.AccountsList.list').html(' \
            ' + AccountsPaginate.html.menu + ' \
            <div class="setuptools app list">\
                ' + ListAccounts(undefined, setuptools.lightbox.menu.paginate.state.AccountsList.currentPage) + ' \
            </div> \
        ');

        AccountsPaginate.bind();

    }

    //  accounts list context management
    function AccountsContext() {

        //  mass switch editor
        $('div.editor.control.massSwitch').unbind('click').click(function() {

            setuptools.lightbox.menu.context.close();
            setuptools.lightbox.build('accounts-massSwitch', ' \
                Enable or disable settings on all accounts with this menu. <br><br>\
                \
                <div class="massSwitch w100">\
                    <div class="cfleft"><h3>All Accounts</h3></div> \
                    <div class="setuptools link menuStyle negative menuTiny cfright noclose" data-key="enabled" data-value="false">Disable All</div> \
                    <div class="setuptools link menuStyle menuTiny fright noclose" data-key="enabled" data-value="true">Enable All</div> \
                    \
                    <div class="cfleft"><h3>Account Data Cache</h3></div> \
                    <div class="setuptools link menuStyle negative menuTiny cfright noclose" data-key="cacheEnabled" data-value="false">Disable All</div> \
                    <div class="setuptools link menuStyle menuTiny fright noclose" data-key="cacheEnabled" data-value="true">Enable All</div>  \
                    \
                    <div class="cfleft"><h3>Account Auto Reload</h3></div> \
                    <div class="setuptools link menuStyle negative menuTiny cfright noclose" data-key="autoReload" data-value="false">Disable All</div> \
                    <div class="setuptools link menuStyle menuTiny fright noclose" data-key="autoReload" data-value="true">Enable All</div>  \
                    \
                    <div class="cfleft"><h3>Login Only Mode</h3></div> \
                    <div class="setuptools link menuStyle negative menuTiny cfright noclose" data-key="loginOnly" data-value="false">Disable All</div> \
                    <div class="setuptools link menuStyle menuTiny fright noclose" data-key="loginOnly" data-value="true">Enable All</div> \
                    \
                    <div class="cfleft"><h3>Testing Server</h3></div> \
                    <div class="setuptools link menuStyle negative menuTiny cfright noclose" data-key="testing" data-value="false">Disable All</div> \
                    <div class="setuptools link menuStyle menuTiny fright noclose" data-key="testing" data-value="true">Enable All</div> \
                    \
                    <div class="cfleft"><h3>Reset One Click Login</h3></div> \
                    <div class="setuptools link menuStyle negative menuTiny cfright noclose" data-key="oclProfile" data-value="false">Reset All</div> \
                \
                </div>\
            ');

            setuptools.lightbox.settitle('accounts-massSwitch', 'Mass Switch');
            setuptools.lightbox.display('accounts-massSwitch', {variant: 'fl-AccountsSmall nobackground'});

            $('div.massSwitch > div.link').click(function() {

                //  gather data
                if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('accounts-ms') > -1 ) return;
                var AccountsList = setuptools.lightbox.menu.paginate.state.AccountsList.PageList;
                var validKeys = Object.keys(setuptools.objects.account);
                var key = $(this).attr('data-key');
                var value = $(this).attr('data-value');
                var type = $(this).attr('data-type') || 'boolean';

                //  if it's not in the default object then it is an invalid key
                if ( validKeys.indexOf(key) === -1 ) setuptools.lightbox.error('Specified key for massSwitch is not valid.', 33);

                //  determine our new value
                var newValue;
                if ( type === 'boolean' ) newValue = ( value === "true" );

                //  no matching value would be a problem
                if ( typeof newValue === 'undefined' ) setuptools.lightbox.error('Specified type for massSwitch is not valid.', 33);

                //  process the action
                for ( var i in AccountsList )
                    if ( AccountsList.hasOwnProperty(i) )
                        AccountsList[i][key] = newValue;

                //  let user know action completed
                setuptools.lightbox.status(this, 'Ok!', 'accounts-ms');

                //  update the page
                AccountsListUpdate();

                //  remind the user to save
                $('.controller.notifier.saveNotice').removeClass('empty').addClass('notice saveAccounts').css({"margin-top": "5px"}).text('Don\'t forget to save changes').css({'cursor': 'initial'});
                if ( setuptools.data.config.animations === 1 ) $('.controller.saveAccounts:not(.saveNotice)').addClass('savePulse');

            });

        });

        //  close open context menus when an input takes focus
        $('div.setuptools.app.list input').focus(setuptools.lightbox.menu.context.close);

        //  save input changes to the temporary object in realtime
        $('div.setuptools.app.list > div.cell > div > input').unbind('keyup').keyup(function(e) {

            var AccountsList = setuptools.lightbox.menu.paginate.state.AccountsList.PageList;
            var cell = $(this).parent().parent();
            var listPos = cell.attr('data-listPos');
            var field = $(this).attr('name');
            AccountsList[listPos][field] = $(this).val();

        });

        //  process account control clicks
        $('div.setuptools.accountControls > div').unbind('click').click(function() {

            function SaveReminder() {

                //  remind the user to save
                $('.controller.notifier.saveNotice').removeClass('empty').addClass('notice saveAccounts').css({"margin-top": "5px"}).text('Don\'t forget to save changes').css({'cursor': 'initial'});
                if ( setuptools.data.config.animations === 1 ) $('.controller.saveAccounts:not(.saveNotice)').addClass('savePulse');

            }

            var AccountsList = setuptools.lightbox.menu.paginate.state.AccountsList.PageList;
            var name = $(this).attr('data-option');
            var cell = $(this).parent().parent().parent(); // yeah, this is nested fairly deep
            var listPos = cell.attr('data-listPos');

            //  account menu
            if ( name === 'accountMenu' ) {

                if ( $(this).hasClass('selected') === true ) {

                    $(this).removeClass('selected');
                    setuptools.lightbox.menu.context.close();
                    return;

                } else {

                    $(this).siblings().each(function(index, element) {
                        if ( $(element).attr('data-option') === 'accountMenu' ) $(element).removeClass('selected');
                    });

                }

                $(this).addClass('selected');

                //
                //  context menu build and display
                //

                //  default position is inline with the next sibling
                var position = $(this);

                var options = [
                    {
                        option: 'header',
                        value: 'Account Options'
                    },
                    {
                        option: 'hover',
                        action: 'close',
                        timer: 'accountMenuHoverClose'
                    }
                ];

                if ( setuptools.data.config.mulelogin === 1 && AccountsList[listPos].username.match(setuptools.config.regex.guid) === null ) options.push({
                    class: 'OCLMenuOpen',
                    name: "OCL: " + ( ( setuptools.app.muledump.ocl.get(AccountsList[listPos].oclProfile) !== false ) ? AccountsList[listPos].oclProfile : 'Default' ),
                    callback: function() {

                        setuptools.app.muledump.ocl.accountMenu($('div.setuptools.menu.accountMenu'), AccountsList[listPos]);

                    }
                });

                options.push({
                    class: 'revealPassword',
                    name: ( (cell.find('input[name="password"]').attr('data-reveal') === 'true') ? 'Hide' : 'Reveal' ) + ' Password',
                    callback: function() {

                        var pwInput = cell.find('input[name="password"]');
                        if ( pwInput.attr('data-reveal') === 'true' ) {

                            pwInput.attr('type', 'password');
                            pwInput.attr('data-reveal', 'false');

                        } else {

                            pwInput.attr('type', 'text');
                            pwInput.attr('data-reveal', 'true');

                        }

                    }

                },
                {
                    class: 'autoReload',
                    name: ( (AccountsList[listPos].autoReload === true) ? 'Disable' : 'Enable' ) + ' Auto Reload',
                    callback: function(listPos) {
                        AccountsList[listPos].autoReload = !( AccountsList[listPos].autoReload === true );
                    },
                    callbackArg: listPos
                },
                {
                    class: 'cacheEnabled',
                    name: ( (AccountsList[listPos].cacheEnabled === true) ? 'Disable' : 'Enable' ) + ' Data Cache',
                    callback: function(listPos) {
                        AccountsList[listPos].cacheEnabled = !( AccountsList[listPos].cacheEnabled === true );
                    },
                    callbackArg: listPos
                },
                {
                    class: 'loginOnly',
                    name: ( (AccountsList[listPos].loginOnly === true) ? 'Disable' : 'Enable' ) + ' Login Only',
                    callback: function(listPos) {
                        AccountsList[listPos].loginOnly = !( AccountsList[listPos].loginOnly === true );
                    },
                    callbackArg: listPos
                },
                {
                    class: 'testingAccount',
                    name: ( (AccountsList[listPos].testing === true) ? 'Disable' : 'Enable' ) + ' Testing Server',
                    callback: function(listPos) {
                        AccountsList[listPos].testing = !( AccountsList[listPos].testing === true );
                    },
                    callbackArg: listPos
                });

                if ( setuptools.state.firsttime === false ) options.push({
                    class: 'exportDeepCopy',
                    name: 'Export Deep Copy...',
                    callback: function(listPos) {
                        setuptools.app.accounts.ExportDeepCopy(AccountsList[listPos].username);
                    },
                    callbackArg: listPos
                });

                options.push({
                    class: 'copyMenuOpen',
                    name: "Copy...",
                    callback: setuptools.app.muledump.copymenu,
                    callbackArg: AccountsList[listPos].username
                });

                options.push({
                    option: 'pos',
                    h: 'right',
                    hpx: -7,
                    vpx: 2
                });

                setuptools.lightbox.menu.context.create('accountMenu', false, position, options, this);

            }
            //  enable/disable switch
            else if ( name === 'toggleEnable' ) {

                setuptools.lightbox.menu.context.close();
                AccountsList[listPos].enabled = !( AccountsList[listPos].enabled === true );
                $(this).toggleClass('selected');
                SaveReminder();

            }
            //  delete switch
            else if ( name === 'delete' ) {

                setuptools.lightbox.menu.context.close();
                AccountsList.splice(listPos, 1);
                if ( listPos > 0 ) listPos--;
                setuptools.lightbox.menu.paginate.findPage(listPos, 'AccountsList');
                AccountsListUpdate('remove');
                SaveReminder();

            }

        });

    }

    /* accounts editor */

    //  grab the accounts list if it already exists
    var AccountsList = setuptools.app.accounts.state.accountList;

    //  build the list from any available accounts data
    if ( AccountsList.length === 0 ) {

        //  this could for format 0 or 1 depending on if the user went back or not
        if ( setuptools.app.config.validateFormat(setuptools.data.accounts, 0) === true ) {

            //  load accounts into the list and merge them with format 1 default values
            for ( var i in setuptools.data.accounts )
                if ( setuptools.data.accounts.hasOwnProperty(i) )
                    AccountsList.push($.extend(
                        true,
                        {},
                        setuptools.objects.account,
                        {
                            username: i,
                            password: setuptools.data.accounts[i]
                        }
                    ));

        } else {

            //  load accounts into the list as-is
            for ( var i in setuptools.data.accounts.accounts )
                if ( setuptools.data.accounts.accounts.hasOwnProperty(i) )
                    AccountsList.push($.extend(
                        true,
                        {},
                        {username: i},
                        setuptools.data.accounts.accounts[i]
                    ));

        }

    }

    if ( setuptools.tmp.userAccounts && setuptools.tmp.userAccounts.length > 0 ) {

        AccountsList = AccountsList.concat(setuptools.tmp.userAccounts);
        delete setuptools.tmp.userAccounts;

    }

    //  reset pagination for AccountsList
    setuptools.lightbox.menu.paginate.clear('AccountsList', 'reset');

    //  paginate accounts list
    var pageButtonsHtml = '';
    if ( setuptools.state.firsttime === false ) pageButtonsHtml = ' \
        <div class="editor control massSwitch noselect" title="Mass Switch" style="font-weight: normal; font-size: 12px; padding-top: 3px !important;">&#8801;</div> \
    ';

    var AccountsPaginate = setuptools.lightbox.menu.paginate.create(
        AccountsList,
        undefined,
        'AccountsList',
        'div.AccountsList div.list',
        ListAccounts,
        AccountsContext,
        {
            search: {key: ['ign', 'username']},
            pageButtons: {html: pageButtonsHtml}
        }
    );

    //  build our lightbox data
    setuptools.lightbox.build('accounts-manager', ' \
        <div class="setuptools accounts editor">\
            <div class="AccountsList list">\
                ' + AccountsPaginate.html.menu + ' \
                <div class="setuptools app list">\
                    ' + ListAccounts() + ' \
                </div> \
            </div>\
            <div class="AccountsList"> \
                ' + AccountsPaginate.html.search + ' \
                <div class="controller newAccount formStyle">Add New Account</div> \
                \
                <div class="controller saveAccounts menuStyle">Save Accounts <span id="changeStatus"></span></div> \
                <div class="controller importAccountsJS menuStyle">Import Accounts.js...</div> \
                \
                <div class="controller notifier empty saveNotice menuStyle cfleft">&nbsp;</div> \
                ' + ( ( setuptools.state.loaded === true ) ? '<div class="controller exportAccountsJS menuStyle cfright">Export Accounts.js...</div>' : '' ) + ' \
            </div>\
        </div> \
    ');

    setuptools.lightbox.override('accounts-accountsjs-index', 'goback', setuptools.app.accounts.manager);
    setuptools.lightbox.goback('accounts-manager', setuptools.app.index);
    setuptools.lightbox.drawhelp('accounts-manager', 'docs/setuptools/help/accounts-manager/manager', 'Accounts Manager Help');
    setuptools.lightbox.settitle('accounts-manager', 'Accounts Manager');
    setuptools.lightbox.display('accounts-manager', {variant: 'fl-AccountsManager'});

    AccountsPaginate.bind();

    //  add new account
    $('div.AccountsList > div.newAccount').click(function() {

        //  check if there's already an empty row
        var data = setuptools.lightbox.menu.paginate.state.AccountsList;
        if ( AccountsList.length > 0 && AccountsList[AccountsList.length-1].username === '' && AccountsList[AccountsList.length-1].password === '' ) {

            AccountsListUpdate('add');
            $('div.setuptools.app.list > div.cell:last-child > div > input[name="username"]').focus();
            return;

        }

        //  create new row and move to its page
        AccountsList.push($.extend(true, {}, setuptools.objects.account, {username: '', password: ''}));
        var newPos = data.PageList.length-1;
        AccountsListUpdate('add');
        $('div.setuptools.app.list > div.cell[data-listPos="' + newPos + '"] > div > input[name="username"]').focus();

    });

    //  bind outside control buttons
    $('div.AccountsList > div.controller').click(function() {

        //  save account changes
        if ( $(this).hasClass('saveAccounts') === true ) {

            //  convert the object to format 1
            if ( setuptools.app.config.validateFormat(setuptools.data.accounts, 0) === true )
                setuptools.data.accounts = setuptools.app.config.convert(setuptools.data.accounts, 1);

            //  loop through proposed accounts
            var badEntries = [];
            for ( i = 0; i < AccountsList.length; i++ ) {

                //  validate keys
                var username = AccountsList[i].username;
                var password = AccountsList[i].password;

                //  if either is provided and the other is empty then this is a bad record
                if ( (username === '' || password === '') && !(username === '' && password === '') ) {

                    badEntries.push(AccountsList[i]);

                } else {

                    //  if neither are provided then it can be ignored
                    if ( username.length > 0 && password.length > 0 ) {

                        //  if a username is provided we should validate it's contents a bit
                        if ( username.length > 0 ) {

                            //  is it an email address, steam, kongregate, or kabam?
                            if ( username.match(setuptools.config.regex.email) || username.match(setuptools.config.regex.guid) ) {

                                //  create the user account in the accounts object
                                setuptools.app.config.createUser(username, AccountsList[i], 'set', 1);

                            } else badEntries.push(AccountsList[i]);

                        }

                    }

                }

            }

            //  look for deletions
            var keys = Object.keys(setuptools.data.accounts.accounts);
            function keySearch(element) {
                return element.username === keys[i];
            }
            for ( var i = 0; i < keys.length; i++ )
                if ( !AccountsList.find(keySearch) )
                    delete setuptools.data.accounts.accounts[keys[i]];

            //  no valid accounts detected
            if ( Object.keys(setuptools.data.accounts.accounts).length === 0 ) {

                setuptools.lightbox.build('accounts-manager-emptySave', 'No valid accounts were located!');
                setuptools.lightbox.settitle('accounts-manager-emptySave', 'Error');
                setuptools.lightbox.display('accounts-manager-emptySave');
                return;

            } else {

                if ( setuptools.app.config.save('AccountsManager/Save') === false ) {

                    setuptools.lightbox.build('accounts-manager-saveError', 'There was an error saving your configuration.');
                    setuptools.lightbox.settitle('accounts-manager-saveError', 'Error');
                    setuptools.lightbox.display('accounts-manager-saveError');
                    return;

                } else {

                    setuptools.app.muledump.ocl.regenerate();
                    $('.controller.notifier.saveNotice').removeClass('saveAccounts');
                    $('span#changeStatus').html('<span class="success">Saved!</span>');
                    $('span#changeStatus > span').fadeOut(2500, function () {
                        $(this).remove();
                    });

                    $('.controller.notifier.saveNotice').removeClass('empty').addClass('notice').text('Reload Muledump to Apply').css({cursor: 'pointer'}).click(function() {
                        setTimeout(function() {
                            window.location.reload();
                        }, 0);
                    });

                }

            }

            //  first time users when they save will be taken to a special confirmation page
            if ( setuptools.state.firsttime === true ) {
                setuptools.lightbox.close('accounts-manager');
                setuptools.app.accounts.saveConfirm();
            }

            return;

        }

        //  import accounts.js file
        if ( $(this).hasClass('importAccountsJS') === true ) {
            setuptools.lightbox.close('accounts-manager');
            setuptools.app.accounts.AccountsJSImport();
        }

        //  export accounts.js file
        if ( $(this).hasClass('exportAccountsJS') === true ) {
            setuptools.lightbox.close('accounts-manager');
            setuptools.app.accounts.AccountsJSExport();
        }

    });

};

//  export account data in json format to user
setuptools.app.accounts.ExportDeepCopy = function(guid, returnData) {

        var storageKey = setuptools.storage.read('muledump:' + guid, true);
        if ( typeof storageKey === 'undefined' ) {

            setuptools.lightbox.build('accounts-deepcopy-download', 'No account data for ' + guid + ' is stored locally. <br><br>Please load this account in Muledump and try again');
            setuptools.lightbox.settitle('accounts-deepcopy-download', 'Deep Copy Download');
            setuptools.lightbox.display('accounts-deepcopy-download', {variant: 'nobackground'});
            setuptools.app.config.downloadAck();
            return;

        }

        var DeepCopyData = JSON.stringify(JSON.parse(storageKey), null, 5);
        if ( returnData === true ) return DeepCopyData;
        var date = new Date();
        var FileName = 'deep-copy-' + guid + '-' +
            date.getFullYear() +
            ('0' + (Number(date.getMonth())+1)).slice(-2) +
            ('0' + date.getDate()).slice(-2) + '-' +
            ('0' + date.getHours()).slice(-2) +
            ('0' + date.getMinutes()).slice(-2) +
            ('0' + date.getSeconds()).slice(-2);

        setuptools.lightbox.build('accounts-deepcopy-download', ' \
            Deep Copy for ' + guid + ' is ready for download. \
            <br><br><a download="' + FileName + '.json" href="data:text/json;base64,' + btoa(DeepCopyData) + '" class="setuptools config download noclose">Download Deep Copy</a> \
        ');

        setuptools.lightbox.settitle('accounts-deepcopy-download', 'Deep Copy Download');
        setuptools.lightbox.display('accounts-deepcopy-download', {variant: 'nobackground'});
        setuptools.app.config.downloadAck();


};

//  process supplied accounts from page2
setuptools.app.accounts.saveConfirm = function() {

    setuptools.lightbox.build('accounts-saveConfirm', 'Your changes have been saved. \
        <br><br>It is recommended you download <a href="#" class="setuptools config backup">a backup</a> of your Muledump configuration. \
        <br><br>If you are ready, you may now proceed to <a href="#" class="setuptools app loadaccounts">Muledump</a>. \
    ');

    //  display the box
    setuptools.lightbox.goback('accounts-saveConfirm', setuptools.app.accounts.manager);
    setuptools.lightbox.drawhelp('accounts-saveConfirm', 'docs/setuptools/help/new-user-setup', 'Welcome to Muledump!');
    setuptools.lightbox.display('accounts-saveConfirm', {variant: 'setuptools-medium'});
    $('.setuptools.app.loadaccounts').click(function() {
        location.reload();
    });
    $('.setuptools.config.backup').click(setuptools.app.backups.create);

    if ( setuptools.state.firsttime === true ) setuptools.app.ga('send', 'event', {
        eventCategory: 'detect',
        eventAction: 'newUserSetup',
        eventLabel: 'First-time User Save'
    });

    //  aaaand we're done

};

//  export setuptools accounts to accounts.js file
setuptools.app.accounts.AccountsJSExport = function() {

    var AccountsJSData = setuptools.app.config.generateAccountsJS();
    setuptools.lightbox.build('accounts-accountsjs-export', ' \
        An accounts.js file has been created for you. \
        <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
        <br><br><a download="accounts.js" href="data:text/javascript;base64,' + AccountsJSData + '" class="setuptools export accountsjs noclose">Download Backup</a> \
    ');

    //  display the download box
    setuptools.lightbox.goback('accounts-accountsjs-export', setuptools.app.accounts.manager);
    setuptools.lightbox.settitle('accounts-accountsjs-export', 'Accounts.js Export');
    setuptools.lightbox.display('accounts-accountsjs-export');
    if ( AccountsJSData ) setuptools.app.config.downloadAck();

};

//  assist in account.js import for first-time users
setuptools.app.accounts.AccountsJSImport =  function() {

    setuptools.lightbox.build('accounts-accountsjs-index', ' \
        There are two ways you can import your accounts.js file. \
        <br><br>If there is an accounts.js in the Muledump folder it can be imported; otherwise, you can upload and import from your computer. \
        <br><br>First, SetupTools needs to be enabled. Once enabled you can import or upload an accounts.js. \
        <br><br><div class="setuptools link enable menuStyle menuSmall noclose fleft cboth">' + ( (setuptools.data.config.enabled === true) ? 'SetupTools Enabled' : 'Enable SetupTools' ) + '</div> \
        <div class="Accounts-AccountsJSImport cboth fleft"> \
    ');

    var menuClass = 'menuStyle';
    if ( setuptools.data.config.enabled === false ) menuClass += ' disabled';
    if ( Object.keys(setuptools.originalAccountsJS).length > 0 ) {

        setuptools.lightbox.build('accounts-accountsjs-index', ' \
            <div class="setuptools link import accountsJS ' + menuClass + ' menuSmall fleft mr5 noclose">Import Accounts.js</div> \
            <div class="setuptools link import upload ' + menuClass + ' menuSmall fright noclose">Upload Accounts.js</div> \
        ');

    } else {

        setuptools.lightbox.build('accounts-accountsjs-index', ' \
            <div class="setuptools link import upload ' + menuClass + ' menuSmall fleft noclose">Upload Accounts.js</div> \
        ');

    }

    //  intercept and send straight to upload page if local isn't available
    if ( setuptools.data.config.enabled === true && Object.keys(setuptools.originalAccountsJS).length === 0 ) {
        setuptools.app.accounts.AccountsJSImportUpload();
        return;
    }

    setuptools.lightbox.build('accounts-accountsjs-index', '</div>');
    setuptools.lightbox.goback('accounts-accountsjs-index', setuptools.app.index);
    setuptools.lightbox.drawhelp('accounts-accountsjs-index', 'docs/setuptools/help/accounts-manager/accountsjs-import', 'Accounts.js Import Help');
    setuptools.lightbox.settitle('accounts-accountsjs-index', 'Accounts.js Import');
    if ( setuptools.state.loaded === false ) setuptools.lightbox.override('accounts-accountsjs-import', 'goback', setuptools.app.accounts.AccountsJSImport);
    if ( setuptools.state.loaded === false ) setuptools.lightbox.override('accounts-accountsjs-upload', 'goback', setuptools.app.accounts.AccountsJSImport);
    setuptools.lightbox.display('accounts-accountsjs-index', {variant: 'fl-Index'});

    if ( setuptools.data.config.enabled === false ) {

        $('.setuptools.link.enable').click(function () {
            $('.menuStyle.disabled').each(function() {
               $(this).removeClass('disabled');
            });
            setuptools.data.config.enabled = true;
            $(this).unbind('click').css({'pointer-events': 'none', 'cursor': 'default'}).text('SetupTools Enabled');
            $('.setuptools.link.import').removeClass('noclose');
            $('.setuptools.link.import.accountsJS').click(setuptools.app.accounts.AccountsJSImportLocal);
            $('.setuptools.link.import.upload').click(setuptools.app.accounts.AccountsJSImportUpload);
        });

    } else {

        $('.setuptools.link.enable').unbind('click').css({'pointer-events': 'none', 'cursor': 'default'}).text('SetupTools Enabled');
        $('.setuptools.link.import').removeClass('noclose');
        $('.setuptools.link.import.accountsJS').click(setuptools.app.accounts.AccountsJSImportLocal);
        $('.setuptools.link.import.upload').click(setuptools.app.accounts.AccountsJSImportUpload);

    }

};

//  import accounts.js from existing accounts.js file in folder
setuptools.app.accounts.AccountsJSImportLocal = function() {

    FoundKeys = Object.keys(setuptools.originalAccountsJS).length;
    if ( FoundKeys > 0 ) {

        setuptools.lightbox.build('accounts-accountsjs-import', ' \
            Proceed with import of ' + FoundKeys + ' located accounts in Accounts.js? \
            <br><br><div class="setuptools link accounts importConfirmed menuStyle menuSmall cfleft">Review Import</div> \
            <div class="setuptools link accounts importCancelled menuStyle menuSmall negative cfright">Cancel</div> \
            <div class="fleft cboth">\
                <br><input type="checkbox" name="accountjsMerge" checked> Merge with any existing accounts \
            </div>\
        ');
        setuptools.lightbox.goback('accounts-accountsjs-import', setuptools.app.introduction);

    } else {

        setuptools.lightbox.build('accounts-accountsjs-import', ' \
            Could not locate any accounts in accounts.js. \
        ');
        setuptools.lightbox.goback('accounts-accountsjs-import', setuptools.app.introduction);

    }

    setuptools.lightbox.drawhelp('accounts-accountsjs-import', 'docs/setuptools/help/accounts-manager/accountsjs-import', 'Accounts.js Import Help');
    setuptools.lightbox.settitle('accounts-accountsjs-import', 'Accounts.js Import');
    setuptools.lightbox.display('accounts-accountsjs-import', {variant: 'fl-AccountsJSImport'});

    $('.setuptools.link.accounts.importCancelled').click(function() {
        if ( setuptools.state.loaded === false ) return;
        setuptools.app.accounts.manager();
    });

    $('.setuptools.link.accounts.importConfirmed').click(function() {

        //  this click implies setuptools should be enabled
        setuptools.data.config.enabled = true;

        //  load accounts into configuration
        if ( typeof setuptools.tmp.userAccounts === 'undefined' ) setuptools.tmp.userAccounts = [];

        //  create our temporary user object from located accounts.js data
        for ( var i in setuptools.originalAccountsJS ) {

            if (setuptools.originalAccountsJS.hasOwnProperty(i)) {

                //  if the account already exists then just update then update the password only
                setuptools.tmp.userAccounts.push($.extend(
                    true,
                    {},
                    setuptools.objects.account,
                    {
                        username: i,
                        password: setuptools.originalAccountsJS[i]
                    }
                ));

            }

        }

        //  load settings from accounts.js
        if ( window.rowlength ) setuptools.data.config.rowlength = window.rowlength;
        if ( window.testing ) setuptools.data.config.testing = window.testing;
        if ( window.prices ) setuptools.data.config.prices = window.prices;
        if ( window.mulelogin ) setuptools.data.config.mulelogin = window.mulelogin;
        if ( window.accountLoadDelay ) setuptools.data.config.accountLoadDelay = window.accountLoadDelay;
        if ( window.debugging ) setuptools.data.config.debugging = window.debugging;

        //  send user back to review screen
        setuptools.app.accounts.manager();

    });

};

//  import accounts.js from a user-uploaded file
setuptools.app.accounts.AccountsJSImportUpload = function(manual) {

    //  parse the user-submitted file for accounts and settings
    function ParseUploadedFile(FileContents) {

        var UploadParse = {accounts: {}, settings: {}};
        var UploadFile = FileContents.split(/\r?\n/);
        for ( i = 0; i < UploadFile.length; i++ ) {

            if ( matches = UploadFile[i].match(setuptools.config.regex.accountsJS) ) {

                //  variables occupy matches[1] and matches[2]
                if ( typeof matches[3] === 'undefined' && typeof matches[4] === 'undefined' ) {

                    UploadParse.settings[matches[1]] = matches[2];
                    if ( matches[2].match(/^(true|false)$/) ) UploadParse.settings[matches[1]] = (matches[2] === 'true');
                    if ( matches[2].match(/^([0-9]*?)$/) ) UploadParse.settings[matches[1]] = Number(matches[2]);

                }

                //  accounts occupy matches[3] and matches[4]
                if ( typeof matches[1] === 'undefined' && typeof matches[2] === 'undefined' ) {

                    UploadParse.accounts[matches[3]] = matches[4];

                }

            }

        }

        $('.setuptools.app.initsetup.uploadResults').html('Found ' + Object.keys(UploadParse.accounts).length + ' accounts and ' + Object.keys(UploadParse.settings).length + ' settings');
        if ( Object.keys(UploadParse.accounts).length > 0 ) {
            $('.setuptools.link.uploadData.save').removeClass('noclose');
        } else {
            $('.setuptools.link.uploadData.save').addClass('noclose');
        }

        //  ready for final click
        $('.setuptools.link.uploadData.save').html('Review Import').click(function () {

            if ( Object.keys(UploadParse.accounts).length > 0 ) {

                //  load settings into configuration
                for ( var i in UploadParse.settings )
                    if ( UploadParse.settings.hasOwnProperty(i) )
                        setuptools.data.config[i] = UploadParse.settings[i];

                //  load accounts into configuration
                if ( typeof setuptools.tmp.userAccounts === 'undefined' ) setuptools.tmp.userAccounts = [];

                for ( var i in UploadParse.accounts ) {

                    if (UploadParse.accounts.hasOwnProperty(i)) {

                        setuptools.tmp.userAccounts.push($.extend(
                            true,
                            {},
                            setuptools.objects.account,
                            {
                                username: i,
                                password: UploadParse.accounts[i]
                            }
                        ));

                    }

                }

                //  goback should return here instead of the default
                setuptools.app.accounts.manager();

            } else {

                $('.setuptools.app.initsetup.uploadResults').html('You must load a valid accounts.js first.');

            }

        });

    }

    //  setup our environment to receive the file
    var DoFiles = false;

    //  does this user support FileReader
    if ( setuptools.config.devForcePoint !== 'restorejs-upload' && manual !== true && window.File && window.FileReader && window.FileList && window.Blob ) {

        setuptools.tmp.FileReaderCapable = true;
        DoFiles = true;
        setuptools.lightbox.build('accounts-accountsjs-upload', ' \
            If you have any issues switch to manual upload mode. \
            <br><br>Please select your accounts.js file. \
            <br><br><input type="file" id="files" name="files[]" class="setuptools app initsetup uploadFile w100"> \
            <br> \
        ');

        //  no they do not
    } else {


        if ( typeof setuptools.tmp.FileReaderCapable === 'undefined' && manual !== true ) {

            setuptools.lightbox.build('accounts-accountsjs-upload', 'File uploads are not supported by your browser. Please instead paste the contents of the accounts.js file below.');

        } else {

            setuptools.lightbox.build('accounts-accountsjs-upload', 'Please paste the contents of the accounts.js file below.');

        }

        setuptools.lightbox.build('accounts-accountsjs-upload', ' \
            <br><br><div class="setuptools app initsetup uploadData"><textarea name="uploadData" class="setuptools scrollbar"></textarea></div> \
        ');

    }

    setuptools.lightbox.build('accounts-accountsjs-upload', ' \
        <br><div class="setuptools app initsetup uploadResults fleft mt5" style="margin-bottom: 6px;"></div> \
        <div class="setuptools link uploadData save menuStyle cfright noclose nomargin">Select a File</div> \
    ');

    setuptools.lightbox.drawhelp('accounts-accountsjs-upload', 'docs/setuptools/help/accounts-manager/accountsjs-upload', 'Accounts.js Upload Help');
    setuptools.lightbox.settitle('accounts-accountsjs-upload', 'Accounts.js Import');
    if ( DoFiles === false ) {
        if (manual === true) setuptools.lightbox.goback('accounts-accountsjs-upload', setuptools.app.accounts.AccountsJSImportUpload);
        if (manual !== true) setuptools.lightbox.goback('accounts-accountsjs-upload', setuptools.app.accounts.manager);
    } else setuptools.lightbox.goback('accounts-accountsjs-upload', setuptools.app.accounts.manager);
    setuptools.lightbox.display('accounts-accountsjs-upload', {variant: 'fl-AccountsJSImport'});

    if ( DoFiles === true ) {

        $('.setuptools.bottom.container').append(' \
            <div class="cfright mr5 h100" style="margin-top: 3px;"> \
                <br><a href="#" class="setuptools app initsetup switchToUpload">Switch to Manual Upload</a> \
            </div> \
        ');

        $('.setuptools.app.initsetup.switchToUpload').click(function() {
            setuptools.app.accounts.AccountsJSImportUpload(true);
        });

        $('input[id="files"]').change(function(e) {

            $('.setuptools.link.uploadData.save').html('Loading File...');
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {

                if ( reader.error ) {

                    $('.setuptools.link.uploadData.save').html('Upload failed');
                    setuptools.lightbox.error('Failed to upload file with error: ' + reader.error, 23);

                } else {

                    ParseUploadedFile(reader.result);

                }

            }

        });

    } else {

        $('.setuptools.link.uploadData.save').html('Paste in File');
        $('textarea[name="uploadData"]').change(function() {

            $('.setuptools.link.uploadData.save').html('Loading File...');
            ParseUploadedFile($(this).val());

        });

    }

};
