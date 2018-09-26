//  so it begins
setuptools.app.groups.manager = function(group, open) {

    if ( typeof group === 'string' ) group = [group];
    if ( typeof group !== 'object' ) group = [];
    if ( typeof group.length === 'undefined' ) group = [];

    setuptools.lightbox.build('groups-manager', ' \
        <div class="Groups-ManagerMenu fleft cboth">\
            <div class="setuptools link groups add menuStyle cfleft">Create Group</div> \
            <div class="setuptools link groups enableAll toggle noclose menuStyle fleft">Enable All</div> \
            <div class="setuptools link groups disableAll toggle noclose menuStyle fleft">Disable All</div> \
        </div>\
        <div class="setuptools div groups container cfleft"> \
        <br><strong>Existing Groups</strong> \
        <br> \
    ');

    //  display existing groups
    //
    if ( typeof setuptools.data.groups.format === 'undefined' ||  Object.keys(setuptools.data.groups.groupList).length === 0 ) {

        setuptools.lightbox.build('groups-manager', 'There are no groups.');

    } else {

        setuptools.lightbox.build('groups-manager', ' \
            <div class="setuptools div groupControls"> \
                <div class="groupMenu" title="Group Menu">&#8801;</div> \
                <div class="groupSelect" title="Select Menu">&#10967;</div> \
            </div> \
            <div class="setuptools div groupList"> \
                <div class="dragbox"> \
        ');

        for ( i = 0; i < setuptools.data.groups.groupOrder.length; i++ ) {

            var selected = '';

            if ( group.indexOf(open) === -1 && group.indexOf(setuptools.data.groups.groupOrder[i]) > -1 ) {

                selected = ' selected';

            } else {

                for ( x = 0; x < group.length; x++ ) {
                    if ( (!open || group.indexOf(open) > -1 ) && group[x] === setuptools.data.groups.groupOrder[i]) {
                        selected = ' selected';
                        break;
                    }
                }

            }

            setuptools.lightbox.build('groups-manager', ' \
                <div class="setuptools groupMember cell' + selected + '" \
                data-groupName="' + setuptools.data.groups.groupOrder[i] + '">' + setuptools.data.groups.groupOrder[i] + '</div> \
            ');

        }

        setuptools.lightbox.build('groups-manager', ' \
                </div> \
            </div> \
        ');

    }

    setuptools.lightbox.build('groups-manager', ' \
        <div class="setuptools div groupEditor container noselect"> \
            <br><h3>Group Editor</h3> \
            <div class="setuptools div groups editor">Select a group or create a new one.</div> \
            </div> \
        </div>\
    ');

    setuptools.lightbox.settitle('groups-manager', 'Groups Manager');
    setuptools.lightbox.goback('groups-manager', setuptools.app.index);
    setuptools.lightbox.drawhelp('groups-manager', 'docs/setuptools/help/groups-manager/manager', 'Groups Manager Help');
    setuptools.lightbox.display('groups-manager', {variant: 'fl-GroupsManager'});

    $('.setuptools.link.groups.add').click(setuptools.app.groups.add);

    $('.setuptools.link.groups.toggle').click(function() {

        var self = $(this);
        var label = self.text();

        //  switch groups status
        for ( var i in setuptools.data.groups.groupList )
            if ( setuptools.data.groups.groupList.hasOwnProperty(i) )
                setuptools.data.groups.groupList[i].enabled = ( self.hasClass('enableAll') === true );

        //  save and report changes
        if ( setuptools.app.config.save('GroupsManager/Toggle') === true ) {

            $(this).html('<span class="success">Saved!</span>');
            $(this).find('span').fadeOut(2500, function () {
                $(this).remove();
                self.html(label);
            });

        } else {

            $(this).html('<span class="error">Error!</span>');
            $(this).find('span').fadeOut(2500, function() {
                $(this).remove();
                self.html(label);
            });

        }

    });

    //
    //  advanced editor
    //

    /* begin group list controls */

    //  display the group editor
    function OpenEditor(groupName, self) {

        setuptools.tmp.GroupOpenState = groupName;

        //  generate a list of account tiles and paginate
        var ListAccountTiles = function(groupName, page) {

            var availableAccountsList = setuptools.lightbox.menu.paginate.state.availableAccounts.PageList;
            if ( page > setuptools.lightbox.menu.paginate.state.availableAccounts.lastPage ) page = setuptools.lightbox.menu.paginate.state.availableAccounts.lastPage;
            $('div.availableAccounts div.customPage input[name="customPage"]').val(page+1);
            if ( typeof groupName !== 'string' ) setuptools.lightbox.error('Supplied groupName was not a string.', 28);
            if ( typeof page !== 'number' ) page = 0;

            //  determine our boundary
            var minIndex = setuptools.data.config.accountsPerPage*page;
            var maxIndex = (setuptools.data.config.accountsPerPage*page)+setuptools.data.config.accountsPerPage;
            if ( maxIndex > availableAccountsList.length ) maxIndex = availableAccountsList.length;
            if ( availableAccountsList.length <= setuptools.data.config.accountsPerPage ) {
                minIndex = 0;
                maxIndex = availableAccountsList.length;
            }

            //  display the tiles
            var html = '';
            for ( i = minIndex; i < maxIndex; i++ )
                html += '<div class="cell noselect">' + availableAccountsList[i] + '</div>'

            if ( html.length === 0 ) {
                html += '<div class="cell noselect nocontext">No available accounts</div>';
            }

            return html;

        };

        //  generate a list of group members and paginate
        var ListGroupMembers = function(groupName, page) {

            var groupMembersList = setuptools.lightbox.menu.paginate.state.groupMembers.PageList;
            if ( page > setuptools.lightbox.menu.paginate.state.groupMembers.lastPage ) page--;
            $('div.groupMembers div.customPage input[name="customPage"]').val(page+1);
            if ( typeof groupName !== 'string' ) setuptools.lightbox.error('Supplied groupName was not a string.', 28);
            if ( typeof page !== 'number' ) page = 0;

            //  determine our boundary
            var minIndex = setuptools.data.config.accountsPerPage*page;
            var maxIndex = (setuptools.data.config.accountsPerPage*page)+setuptools.data.config.accountsPerPage;
            if ( maxIndex > groupMembersList.length ) maxIndex = groupMembersList.length;
            if ( groupMembersList.length <= setuptools.data.config.accountsPerPage ) {
                minIndex = 0;
                maxIndex = groupMembersList.length;
            }

            //  display the tiles
            var html = '';
            for ( i = minIndex; i < maxIndex; i++ )
                html += '<div class="cell noselect">' + groupMembersList[i] + '</div>'

            if ( html.length === 0 ) {
                html += '<div class="cell noselect nocontext">No group members</div>';
            }

            return html;

        };

        //  update the availableAccounts column
        function availableAccountsUpdate(direction, account) {

            if ( direction === 'add' && typeof account !== 'string' ) setuptools.lightbox.error('A valid account must be provided when adding', 30);
            if ( direction === 'add' ) setuptools.lightbox.menu.paginate.findPage(account, 'availableAccounts');
            if ( direction === 'reset' ) setuptools.lightbox.menu.paginate.findPage(0, 'availableAccounts');
            var data = setuptools.lightbox.menu.paginate.state.availableAccounts;

            //  generate the pagination data
            var availableAccountsPaginate = setuptools.lightbox.menu.paginate.create(
                data.PageList,
                data.ActionItem,
                'availableAccounts',
                data.ActionSelector,
                data.ActionCallback,
                data.ActionContext
            );

            $('div.setuptools.groups.editor > div.availableAccounts.list').html(' \
                <div><strong>Available Accounts</strong></div> \
                ' + availableAccountsPaginate.html.menu + ' \
                <div class="dragbox">' + data.ActionCallback(data.ActionItem, data.currentPage) + '</div> \
            ');

            availableAccountsPaginate.bind();

        }

        //  update the groupMembers column
        function groupMembersUpdate(direction, account) {

            if ( direction === 'add' && typeof account !== 'string' ) setuptools.lightbox.error('A valid account must be provided when adding', 30);
            if ( direction === 'add' ) setuptools.lightbox.menu.paginate.findPage(account, 'groupMembers');
            if ( direction === 'reset' ) setuptools.lightbox.menu.paginate.findPage(0, 'groupMembers');
            var data = setuptools.lightbox.menu.paginate.state.groupMembers;

            //  validate lastPage/currentPage boundary
            if ( ['remove','reset'].indexOf(direction) > -1 ) {

                var newLastPage = Math.ceil(data.PageList.length/setuptools.data.config.accountsPerPage);
                if ( newLastPage > 0 ) newLastPage--;
                if ( data.currentPage > newLastPage ) setuptools.lightbox.menu.paginate.findPage(data.PageList.length-1, 'groupMembers');

            }

            //  generate the pagination data
            var groupMembersPaginate = setuptools.lightbox.menu.paginate.create(
                data.PageList,
                data.ActionItem,
                'groupMembers',
                data.ActionSelector,
                data.ActionCallback,
                data.ActionContext
            );

            $('div.setuptools.groups.editor > div.groupMembers.list').html(' \
                <div><strong>Group Members</strong></div> \
                ' + groupMembersPaginate.html.menu + ' \
                <div class="dragbox">' + data.ActionCallback(data.ActionItem, data.currentPage) + '</div> \
            ');

            groupMembersPaginate.bind();

        }

        //  bindings to execute when availableAccounts div is updated
        function availableAccountsContext() {

            function addToBottom(account) {

                var state = setuptools.lightbox.menu.paginate.state;
                state.groupMembers.PageList.push(account);
                state.availableAccounts.PageList.splice(state.availableAccounts.PageList.indexOf(account), 1);
                availableAccountsUpdate();
                groupMembersUpdate('add', account);

            }

            function addToCurrent(account) {

                var state = setuptools.lightbox.menu.paginate.state;
                var index = state.groupMembers.currentPage*setuptools.data.config.accountsPerPage;
                state.groupMembers.PageList.splice(index, 0, account);
                state.availableAccounts.PageList.splice(state.availableAccounts.PageList.indexOf(account), 1);
                availableAccountsUpdate();
                groupMembersUpdate('add', account);

            }

            function addToTop(account) {

                var state = setuptools.lightbox.menu.paginate.state;
                state.groupMembers.PageList.unshift(account);
                state.availableAccounts.PageList.splice(state.availableAccounts.PageList.indexOf(account), 1);
                availableAccountsUpdate();
                groupMembersUpdate('add', account);

            }

            function AddAll() {

                var state = setuptools.lightbox.menu.paginate.state;
                setuptools.lightbox.menu.paginate.state.groupMembers.PageList = setuptools.lightbox.menu.paginate.state.groupMembers.PageList.concat(state.availableAccounts.PageList);
                state.availableAccounts.PageList = [];

                groupMembersUpdate('add', setuptools.lightbox.menu.paginate.state.groupMembers.PageList[0]);
                availableAccountsUpdate('reset');

            }

            //  select all accounts from the displayed list
            var cell = $('div.availableAccounts > div.dragbox > div.cell:not(.nocontext)');

            //  left click runs 'add' command
            cell.click(function() {

                //  left clicking to close a context menu is very common
                if ( typeof setuptools.tmp.contextMenuOpen === 'object' && Object.keys(setuptools.tmp.contextMenuOpen).length > 0 ) {
                    setuptools.lightbox.menu.context.close();
                    return;
                }

                addToBottom($(this).text());

            });

            //  right click opens context menu
            cell.contextmenu(function(e) {

                e.preventDefault();
                var self = this;

                //  user is selecting this account
                if ( $(this).hasClass('selected') === false ) {

                    //  deselect all other accounts and select this one
                    $(this).siblings().removeClass('selected');
                    $(this).addClass('selected');

                    //
                    //  context menu build and display
                    //

                    //  default position is inline with the next sibling
                    var position = $(this);

                    var callbackArg = $(this).text();
                    var options = [
                        {
                            option: 'hover',
                            action: 'close',
                            timer: 'groupsMenu'
                        },
                        {
                            option: 'header',
                            value: callbackArg
                        },
                        {
                            class: 'addToBottom',
                            name: 'Add',
                            callback: addToBottom,
                            callbackArg: callbackArg
                        },
                        {
                            class: 'addToCurrent',
                            name: 'Add to Current Page',
                            callback: addToCurrent,
                            callbackArg: callbackArg
                        },
                        {
                            class: 'addToTop',
                            name: 'Add to Top',
                            callback: addToTop,
                            callbackArg: callbackArg
                        },
                        {
                            option: 'input',
                            class: 'addToSpecified',
                            value: groupMembersPaginate.html.search.replace('Search by Name', 'Add After Account...'),
                            binding: function() {

                                //  update css
                                var searchCell = $('div.setuptools.menu > div.input > div.pageControls > div.searchName > input[name="searchName"]');
                                searchCell.parent().parent().parent().css({'padding-top': '5px', 'padding-bottom': '5px'});

                                //  update search binding for custom usage of pagination tools
                                var searchName = new setuptools.lightbox.menu.search.bind(
                                    setuptools.lightbox.menu.paginate.state.groupMembers,
                                    true,
                                    'input',
                                    searchCell,
                                    {
                                        h: 'right',
                                        v: 'bottom',
                                        hpx: -17,
                                        vpx: 31
                                    },
                                    addToSpecified,
                                    'availableAccountsAdd'
                                );

                                function addToSpecified(account) {

                                    var state = setuptools.lightbox.menu.paginate.state;

                                    //  find the index of the searched account
                                    var index = state.groupMembers.PageList.indexOf(account);
                                    if ( index === -1 ) return;

                                    //  move the account there
                                    state.groupMembers.PageList.splice(index+1, 0, callbackArg);
                                    state.availableAccounts.PageList.splice(state.availableAccounts.PageList.indexOf(callbackArg), 1);

                                    //  update page display
                                    availableAccountsUpdate();
                                    groupMembersUpdate('add', callbackArg);

                                }

                                $('div.input div.setuptools.div.pageControls div.search').click(function() {
                                    addToSpecified(searchName.val());
                                    setuptools.lightbox.menu.context.close();
                                });

                                searchName.keyup(function(e) {

                                    var value = $(this).val();
                                    if ( e.keyCode === 13 ) {
                                        addToSpecified(value);
                                        setuptools.lightbox.menu.context.close();
                                    }

                                });

                            }
                        },{
                            class: 'copySelection',
                            name: 'Copy to Clipboard',
                            attributes: {
                                'data-clipboard-text': callbackArg
                            }
                        },
                        {
                            option: 'pos',
                            vpx: 44,
                            hpx: 2
                        }
                    ];

                    if ( $(this).siblings().length > 0 ) options.push({
                        class: 'addAll',
                        name: 'Add All to Group',
                        callback: AddAll
                    });

                    options.push({
                        class: 'addCancel',
                        name: 'Cancel',
                        callback: function() {}
                    });

                    setuptools.lightbox.menu.context.create('availableAccountsAdd', false, position, options, self);

                }
                //  user is deselecting the account
                else {

                    setuptools.lightbox.menu.context.close();
                    $(this).removeClass('selected');

                }

            });

        }

        //  bindings to execute when groupMembers div is updated
        function groupMembersContext() {

            function MoveUp(account) {

                var state = setuptools.lightbox.menu.paginate.state.groupMembers;
                var index = state.PageList.indexOf(account);
                if ( [-1,0].indexOf(index) > -1 ) return;
                state.PageList.splice(index, 1);
                state.PageList.splice(index-1, 0, account);
                groupMembersUpdate('add', account);

            }

            function MoveDown(account) {

                var state = setuptools.lightbox.menu.paginate.state.groupMembers;
                var index = state.PageList.indexOf(account);
                if ( index === -1 ) return;
                if ( index+1 >= state.PageList.length ) return;
                state.PageList.splice(index, 1);
                state.PageList.splice(index+1, 0, account);
                groupMembersUpdate('add', account);

            }

            function MoveToTop(account) {

                var state = setuptools.lightbox.menu.paginate.state.groupMembers;
                var index = state.PageList.indexOf(account);
                if ( [-1,0].indexOf(index) > -1 ) return;
                state.PageList.splice(index, 1);
                state.PageList.splice(0, 0, account);
                groupMembersUpdate('add', account);

            }

            function MoveToBottom(account) {

                var state = setuptools.lightbox.menu.paginate.state.groupMembers;
                var index = state.PageList.indexOf(account);
                if ( index === -1 ) return;
                if ( index+1 >= state.PageList.length ) return;
                state.PageList.splice(index, 1);
                state.PageList.splice(state.PageList.length, 0, account);
                groupMembersUpdate('add', account);

            }

            function RemoveAccount(account) {

                var state = setuptools.lightbox.menu.paginate.state.groupMembers;
                var index = state.PageList.indexOf(account);
                if ( index === -1 ) return;
                state.PageList.splice(index, 1);
                setuptools.lightbox.menu.paginate.state.availableAccounts.PageList.push(account);
                availableAccountsUpdate('add', account);
                groupMembersUpdate('remove', account);

            }

            function RemoveAll() {

                var state = setuptools.lightbox.menu.paginate.state;
                setuptools.lightbox.menu.paginate.state.availableAccounts.PageList = setuptools.lightbox.menu.paginate.state.availableAccounts.PageList.concat(state.groupMembers.PageList);
                state.groupMembers.PageList = [];

                availableAccountsUpdate('add', setuptools.lightbox.menu.paginate.state.availableAccounts.PageList[0]);
                groupMembersUpdate('reset');

            }

            //  generate context menu
            var cell = $('div.groupMembers > div.dragbox > div.cell:not(.nocontext)');

            //  left click removes a member from a group
            cell.click(function() {

                //  left clicking to close a context menu is very common
                if ( typeof setuptools.tmp.contextMenuOpen === 'object' && Object.keys(setuptools.tmp.contextMenuOpen).length > 0 ) {
                    setuptools.lightbox.menu.context.close();
                    return;
                }

                RemoveAccount($(this).text());

            });

            //  right click opens a context menu
            cell.contextmenu(function(e) {

                e.preventDefault();
                var self = this;
                if ( $(this).hasClass('selected') === false ) {

                    $(this).siblings().removeClass('selected');
                    $(this).addClass('selected');

                    //  default position is inline with the next sibling
                    var position = $(this);

                    //  if this is the last sibling then we anchor on the account search div
                    if ( position.length === 0 ) {
                        position = $('div.groupMembers div.pageControls > div.editor.control.searchName');
                    }

                    var callbackArg = $(this).text();
                    var options = [
                        {
                            option: 'hover',
                            action: 'close',
                            timer: 'groupsMenu'
                        },
                        {
                            option: 'header',
                            value: callbackArg
                        },
                        {
                            class: 'moveUp',
                            name: 'Move Up',
                            callback: MoveUp,
                            callbackArg: callbackArg
                        },
                        {
                            class: 'moveDown',
                            name: 'Move Down',
                            callback: MoveDown,
                            callbackArg: callbackArg
                        },
                        {
                            class: 'moveToTopGroup',
                            name: 'Move to Top of Group',
                            callback: MoveToTop,
                            callbackArg: callbackArg
                        },
                        {
                            class: 'moveToBottomGroup',
                            name: 'Move to Bottom of Group',
                            callback: MoveToBottom,
                            callbackArg: callbackArg
                        },
                        {
                            option: 'input',
                            class: 'addToSpecified',
                            value: groupMembersPaginate.html.search.replace('Search by Name', 'Move After Account...'),
                            binding: function() {

                                //  update css
                                var searchCell = $('div.setuptools.menu > div.input > div.pageControls > div.searchName > input[name="searchName"]');
                                searchCell.parent().parent().parent().css({'padding-top': '5px', 'padding-bottom': '5px'});

                                //  update search binding for custom usage of pagination tools
                                var searchName = new setuptools.lightbox.menu.search.bind(
                                    setuptools.lightbox.menu.paginate.state.groupMembers,
                                    true,
                                    'input',
                                    searchCell,
                                    {
                                        h: 'right',
                                        v: 'bottom',
                                        hpx: -17,
                                        vpx: 31
                                    },
                                    addToSpecified,
                                    'groupMembersAdd'
                                );

                                function addToSpecified(account) {

                                    var state = setuptools.lightbox.menu.paginate.state;

                                    //  find the index of the searched account
                                    var OldIndex = state.groupMembers.PageList.indexOf(callbackArg);
                                    if ( state.groupMembers.PageList.indexOf(account) === -1 ) return;

                                    //  move the account there
                                    state.groupMembers.PageList.splice(OldIndex, 0, callbackArg);
                                    state.groupMembers.PageList.splice(state.groupMembers.PageList.indexOf(account)+1, 0, callbackArg);

                                    //  update page display
                                    groupMembersUpdate('add', callbackArg);

                                }

                                $('div.input div.setuptools.div.pageControls div.search').click(function() {
                                    addToSpecified(searchName.val());
                                    setuptools.lightbox.menu.context.close();
                                });

                                searchName.keyup(function(e) {

                                    var value = $(this).val();
                                    if ( e.keyCode === 13 ) {
                                        addToSpecified(value);
                                        setuptools.lightbox.menu.context.close();
                                    }

                                });

                            }
                        },
                        {
                            class: 'copySelection',
                            name: 'Copy to Clipboard',
                            attributes: {
                                'data-clipboard-text': callbackArg
                            }
                        },
                        {
                            class: 'removeAccount',
                            name: 'Remove from Group',
                            callback: RemoveAccount,
                            callbackArg: callbackArg
                        },
                        {
                            option: 'pos',
                            vpx: 44,
                            hpx: 2
                        }
                    ];

                    if ( $(this).siblings().length > 0 ) options.push({
                        class: 'removeAll',
                        name: 'Remove All from Group',
                        callback: RemoveAll
                    });

                    options.push({
                        class: 'addCancel',
                        name: 'Cancel',
                        callback: function() {}
                    });

                    setuptools.lightbox.menu.context.create('groupMembersAdd', false, position, options, self);

                } else {

                    setuptools.lightbox.menu.context.close();
                    $(this).removeClass('selected');

                }

            });

        }

        //  we need an array of accounts for pagination (non-members only)
        var availableAccountsList = [];
        var groupMembersList = [];
        for ( var i in setuptools.data.accounts.accounts )
            if ( setuptools.data.accounts.accounts.hasOwnProperty(i) )
                if ( setuptools.data.groups.groupList[groupName].members.indexOf(i) === -1 ) {
                    availableAccountsList.push(i);
                } else {
                    groupMembersList.push(i);
                }

        //  clean up any old pagination data
        setuptools.lightbox.menu.paginate.clear();

        //  generate the pagination data
        var availableAccountsPaginate = setuptools.lightbox.menu.paginate.create(
            availableAccountsList,
            groupName,
            'availableAccounts',
            'div.availableAccounts div.dragbox',
            ListAccountTiles,
            availableAccountsContext
        );

        var groupMembersPaginate = setuptools.lightbox.menu.paginate.create(
            groupMembersList,
            groupName,
            'groupMembers',
            'div.groupMembers div.dragbox',
            ListGroupMembers,
            groupMembersContext
        );

        if ( self ) $(self).addClass('selected');
        var editor = $('.setuptools.div.groups.editor');
        editor.addClass('active');
        if ( group.indexOf(open) > -1 ) $('.setuptools.groupMember.cell[data-groupName!="' + groupName + '"]').removeClass('selected');
        $('.setuptools.div.groupEditor.container > h3').text('Group Editor - ' + groupName + ' (' + ( (setuptools.data.groups.groupList[groupName].enabled === true) ? 'Enabled' : 'Disabled' ) + ')');

        //  display the editor
        editor.html(' \
            <br>\
            <div class="availableAccounts list">\
                <div><strong>Available Accounts</strong></div> \
                ' + availableAccountsPaginate.html.menu + ' \
                <div class="dragbox">' + ListAccountTiles(groupName) + '</div> \
            </div> \
            <div class="groupMembers list">\
                <div><strong>Group Members</strong></div> \
                ' + groupMembersPaginate.html.menu + ' \
                <div class="dragbox">' + ListGroupMembers(groupName) + '</div> \
            </div> \
            \
            <div class="availableAccounts">\
                ' + availableAccountsPaginate.html.search + ' \
            </div>\
            \
            <div class="groupMembers">\
                ' + groupMembersPaginate.html.search + ' \
            </div>\
            \
            <div class="setuptools groupSaveControls fleft w100 cboth" style="margin-top: 34px;"> \
                <div class="setuptools save group menuStyle cfleft mr5"> \
                    Save Changes \
                    <div class="save result"></div> \
                </div> \
                <div class="setuptools revert group menuStyle negative fright mr0">Revert Changes</div> \
                \
                <div class="controller notifier empty saveNotice menuStyle cfleft">&nbsp;</div> \
                <div class="setuptools close group menuStyle negative fright mt5 mr0">Close Editor</div> \
            </div>\
        ');

        //  bind editor buttons
        availableAccountsPaginate.bind();
        groupMembersPaginate.bind();

        $('.setuptools.close.group').click(CloseEditor);

        $('.setuptools.revert.group').click(function() {

            setuptools.lightbox.close('groups-manager');
            setuptools.app.groups.manager(groupName, true);

        });

        $('.setuptools.save.group').click(function() {

            setuptools.data.groups.groupList[groupName].members = setuptools.lightbox.menu.paginate.state.groupMembers.PageList;
            if ( setuptools.app.config.save('GroupsManager/Save') === true ) {

                $('div.save.result').html('<div>Saved!</div>');
                $('div.save.result > div').fadeOut(2500, function () {
                    $(this).remove();
                });

                $('.controller.notifier.saveNotice').removeClass('empty').addClass('notice').text('Reload Muledump to Apply').css({cursor: 'pointer'}).click(function() {
                    setTimeout(function() {
                        window.location.reload();
                    }, 0);
                });

            } else {

                $('div.save.result').html('<div class="error">Error!</div>');
                $('div.save.result > div').fadeOut(2500, function() {
                    $(this).remove();
                });

            }

        });

    }

    //  close the group editor
    function CloseEditor() {

        delete setuptools.tmp.GroupOpenState;
        $('.setuptools.div.groups.editor').removeClass('active');
        $('.setuptools.div.groupEditor.container > h3').text('Group Editor');
        $('.setuptools.div.groups.editor').text('Select a group or create a new one.');

    }

    //  select all groups
    function SelectAll() {

        $('.setuptools.groupMember.cell').addClass('selected');

    }

    //  deselect all groups
    function SelectNone() {

        $('.setuptools.groupMember.cell').removeClass('selected');

    }

    //  select all enabled groups
    function SelectAllEnabled() {

        SelectNone();
        for ( var i in setuptools.data.groups.groupList )
            if ( setuptools.data.groups.groupList.hasOwnProperty(i) )
                if ( setuptools.data.groups.groupList[i].enabled === true )
                    $('.setuptools.groupMember.cell[data-groupName="' + i + '"]').addClass('selected');

    }

    //  select all disabled groups
    function SelectAllDisabled() {

        SelectNone();
        for ( var i in setuptools.data.groups.groupList )
            if ( setuptools.data.groups.groupList.hasOwnProperty(i) )
                if ( setuptools.data.groups.groupList[i].enabled === false )
                    $('.setuptools.groupMember.cell[data-groupName="' + i + '"]').addClass('selected');

    }

    //  enable selected groups
    function EnableSelected() {

        $('.setuptools.groupMember.cell.selected').each(function(index, element) {

            var groupName = $(element).text();
            if ( setuptools.data.groups.groupList[groupName] ) setuptools.data.groups.groupList[groupName].enabled = true;
            setuptools.app.config.save('GroupsManager/EnableSelected');

        });

    }

    //  disable selected groups
    function DisableSelected() {

        $('.setuptools.groupMember.cell.selected').each(function(index, element) {

            var groupName = $(element).text();
            if ( setuptools.data.groups.groupList[groupName] ) setuptools.data.groups.groupList[groupName].enabled = false;
            setuptools.app.config.save('GroupsManager/DisableSelected');

        });

    }

    function GroupMenu(e) {

        //  maybe we're in context mode?
        if ( typeof e === 'object' && e.preventDefault ) e.preventDefault();

        //  move selected groups to start of list
        function MoveToStart() {

            //  rearrange the selected classes to the front of the list
            var groupList = [];
            for ( i = 0; i < selectedClass.length; i++ ) {

                setuptools.data.groups.groupOrder.splice(setuptools.data.groups.groupOrder.indexOf($(selectedClass[i]).text()), 1);
                setuptools.data.groups.groupOrder.splice(i, 0, $(selectedClass[i]).text());
                groupList.push($(selectedClass[i]).text());

            }

            setuptools.app.config.save('GroupsManager/MoveToStart');
            setuptools.lightbox.close('groups-manager');
            setuptools.app.groups.manager(groupList, setuptools.tmp.GroupOpenState);

        }

        //  move selected groups to end of list
        function MoveToEnd() {

            //  rearrange the selected classes to the front of the list
            var groupList = [];
            for ( i = 0; i < selectedClass.length; i++ ) {

                setuptools.data.groups.groupOrder.splice(setuptools.data.groups.groupOrder.indexOf($(selectedClass[i]).text()), 1);
                setuptools.data.groups.groupOrder.push($(selectedClass[i]).text());
                groupList.push($(selectedClass[i]).text());

            }

            setuptools.app.config.save('GroupsManager/MoveToEnd');
            setuptools.lightbox.close('groups-manager');
            setuptools.app.groups.manager(groupList, setuptools.tmp.GroupOpenState);

        }

        //  move selected groups one spot to the left of the first selected group
        function MoveLeft() {

            //  rearrange the selected classes to the front of the list
            var groupList = [];
            var index = setuptools.data.groups.groupOrder.indexOf($(selectedClass[0]).text())-1;
            if ( index < 0 ) index = 0;
            for ( i = 0; i < selectedClass.length; i++ ) {

                setuptools.data.groups.groupOrder.splice(setuptools.data.groups.groupOrder.indexOf($(selectedClass[i]).text()), 1);
                setuptools.data.groups.groupOrder.splice(index+i, 0, $(selectedClass[i]).text());
                groupList.push($(selectedClass[i]).text());

            }

            setuptools.app.config.save('GroupsManager/MoveLeft');
            setuptools.lightbox.close('groups-manager');
            setuptools.app.groups.manager(groupList, setuptools.tmp.GroupOpenState);

        }

        //  move selected groups one spot to the right of the last selected group
        function MoveRight() {

            //  rearrange the selected classes to the front of the list
            var groupList = [];
            var index = setuptools.data.groups.groupOrder.indexOf($(selectedClass[$(selectedClass).length-1]).text())+1;
            if ( index > setuptools.data.groups.groupOrder.length ) index = setuptools.data.groups.groupOrder;
            for ( i = 0; i < selectedClass.length; i++ ) {

                setuptools.data.groups.groupOrder.splice(setuptools.data.groups.groupOrder.indexOf($(selectedClass[i]).text()), 1);
                setuptools.data.groups.groupOrder.splice(index+i, 0, $(selectedClass[i]).text());
                groupList.push($(selectedClass[i]).text());

            }

            setuptools.app.config.save('GroupsManager/MoveRight');
            setuptools.lightbox.close('groups-manager');
            setuptools.app.groups.manager(groupList, setuptools.tmp.GroupOpenState);

        }

        //  deselect other menu options
        $('.setuptools.div.groupControls div:not(.groupMenu)').each(function(index, element) {
            $(element).removeClass('selected');
        });

        var selectedClass = $('.setuptools.div.groupList div.dragbox div.cell.selected');
        var selectedCount = selectedClass.length;
        var self = this;

        //  nothing selected so we should close the menu to reset it
        if ( selectedCount === 0 ) {

            setuptools.lightbox.menu.context.close();

        }
        //  single group menu
        else if (selectedCount === 1) {

            //  enable/disable, edit, delete

            if ( $('.setuptools.div.groupControls div.groupMenu').hasClass('selected') === false ) {

                //  base info
                $(self).addClass('selected');
                var groupName = selectedClass.text();
                var position = $('.setuptools.div.groupList div.dragbox div.cell:first-child');
                var options = [
                    {
                        option: 'hover',
                        action: 'close',
                        timer: 'groupsMenu'
                    },
                    {
                        option: 'pos',
                        vpx: 2,
                        hpx: 2
                    },
                    {
                        option: 'header',
                        value: groupName
                    },
                    {
                        class: 'edit',
                        name: 'Edit',
                        callback: function() {
                            OpenEditor(groupName);
                        }
                    },
                    {
                        class: 'copy',
                        name: 'Copy',
                        callback: function() {
                            setuptools.lightbox.close('groups-manager');
                            setuptools.app.groups.copy(groupName);
                        }
                    },
                    {
                        class: 'rename',
                        name: 'Rename',
                        callback: function() {
                            setuptools.lightbox.close('groups-manager');
                            setuptools.app.groups.rename(groupName);
                        }
                    }
                ];

                if ( setuptools.data.groups.groupList[groupName].enabled === false ) {

                    options.push({
                        class: 'enable',
                        name: 'Enable',
                        callback: EnableSelected
                    });

                } else {

                    options.push({
                        class: 'disable',
                        name: 'Disable',
                        callback: DisableSelected
                    });

                }

                //  group ordering options if at least one unselected group remains
                if ( $('.setuptools.div.groupList div.dragbox div.cell:not(.selected)').length > 0 ) {

                    options.push({
                        class: 'moveToStart',
                        name: 'Move to Start',
                        callback: MoveToStart
                    });

                    options.push({
                        class: 'moveLeft',
                        name: 'Move Left',
                        callback: MoveLeft
                    });

                    options.push({
                        class: 'moveRight',
                        name: 'Move Right',
                        callback: MoveRight
                    });

                    options.push({
                        class: 'moveToEnd',
                        name: 'Move to End',
                        callback: MoveToEnd
                    });

                }

                options.push({
                    class: 'delete',
                    name: 'Delete',
                    callback: function() {
                        setuptools.lightbox.close('groups-manager');
                        setuptools.app.groups.delete(groupName);
                    }
                });

                setuptools.lightbox.menu.context.create('groupMenu', false, position, options, self);

            } else {

                setuptools.lightbox.menu.context.close();

            }

        }
        //  multi group menu
        else if ( selectedCount > 1 ) {

            //  enable/disable all, delete, add/remove specific account
            if ( $('.setuptools.div.groupControls div.groupMenu').hasClass('selected') === false ) {

                //  base info
                $(self).addClass('selected');
                var position = $('.setuptools.div.groupList div.dragbox div.cell:first-child');
                var options = [
                    {
                        option: 'hover',
                        action: 'close',
                        timer: 'groupsMenu'
                    },
                    {
                        option: 'pos',
                        vpx: 2,
                        hpx: 2
                    },
                    {
                        option: 'header',
                        value: 'Groups Menu '
                    },
                    {
                        class: 'enable',
                        name: 'Enable Selected',
                        callback: EnableSelected
                    },
                    {
                        class: 'disable',
                        name: 'Disable Selected',
                        callback: DisableSelected
                    }
                ];

                //  group ordering options if at least one unselected group remains
                if ( $('.setuptools.div.groupList div.dragbox div.cell:not(.selected)').length > 0 ) {

                    options.push({
                        class: 'moveToStart',
                        name: 'Move to Start',
                        callback: MoveToStart
                    });

                    options.push({
                        class: 'moveLeft',
                        name: 'Move Left',
                        callback: MoveLeft
                    });

                    options.push({
                        class: 'moveRight',
                        name: 'Move Right',
                        callback: MoveRight
                    });

                    options.push({
                        class: 'moveToEnd',
                        name: 'Move to End',
                        callback: MoveToEnd
                    });

                }

                options.push({
                    class: 'mergeSelected',
                    name: 'Merge',
                    callback: function() {
                        setuptools.lightbox.close('groups-manager');
                        setuptools.app.groups.merge(selectedClass);
                    }
                });

                options.push({
                    class: 'delete',
                    name: 'Delete',
                    callback: function() {
                        setuptools.lightbox.close('groups-manager');
                        setuptools.app.groups.delete(selectedClass);
                    }
                });

                setuptools.lightbox.menu.context.create('groupMenu', false, position, options, self);

            } else {

                setuptools.lightbox.menu.context.close();

            }

        }

    }

    //  display group menu
    $('.setuptools.div.groupControls div.groupMenu').unbind('click').click(GroupMenu);

    //  selection menu
    $('.setuptools.div.groupControls div.groupSelect').click(function (e) {

        var self = this;

        //  deselect other menu options
        $('.setuptools.div.groupControls div:not(.groupSelect)').each(function(index, element) {
           $(element).removeClass('selected');
        });

        //  display the menu
        if ( $('.setuptools.div.groupControls div.groupSelect').hasClass('selected') === false ) {

            //  base info
            $(self).addClass('selected');
            var position = $('.setuptools.div.groupList div.dragbox div.cell:first-child');
            var options = [
                {
                    option: 'hover',
                    action: 'close',
                    timer: 'groupsMenu'
                },
                {
                    option: 'header',
                    value: 'Select Menu'
                },
                {
                    class: 'selectAll',
                    name: 'Select All',
                    callback: SelectAll
                },
                {
                    class: 'selectNone',
                    name: 'Deselect All',
                    callback: SelectNone
                },
                {
                    class: 'selectEnabled',
                    name: 'Select Enabled Groups',
                    callback: SelectAllEnabled
                },
                {
                    class: 'selectDisabled',
                    name: 'Select Disabled Groups',
                    callback: SelectAllDisabled
                }
            ];

            setuptools.lightbox.menu.context.create('groupSelect', false, position, options, self);

        } else {

            setuptools.lightbox.menu.context.close();

        }

    });

    if ( typeof open === 'string' && setuptools.data.groups.groupOrder.indexOf(open) > -1 ) OpenEditor(open, $('.div[data-groupName="' + open + '"]'));
    if ( open === true && group.length === 1 && setuptools.data.groups.groupOrder.indexOf(group[0]) > -1 ) OpenEditor(group[0], $('.div[data-groupName="' + group[0] + '"]'));

    /* end group list controls */

    //  group selection
    var start;
    var finish;
    var timer;
    var triggered;
    var firstSelected;
    var lastSelected = false;
    var mouseDown = false;
    var mouseOver = false;
    var mouseLeave = false;
    var mouseUp = false;
    var direction = false;
    var touched = [];

    //  single click - toggle single selection
    //  control click - toggle multiple selections
    //  long click - open group in editor
    //  click and drag - select all between start/finish
    //  right click - open group menu
    $('.setuptools.groupMember.cell').on('mousedown', function(e) {

        if ( e.buttons > 1 ) return;
        setuptools.lightbox.menu.context.close();

        mouseDown = true;
        mouseOver = false;
        mouseLeave = false;
        mouseUp = false;

        var self = this;
        finish = undefined;

        direction = $(this).hasClass('selected');
        $(this).addClass('selected');
        if ( setuptools.app.muledump.keys('ctrl', e) === false ) $(this).siblings().removeClass('selected');
        firstSelected = $(self).text();
        lastSelected = false;
        triggered = false;
        start = new Date().getTime();
        timer = setTimeout(function() {

            OpenEditor($(self).text(), self);
            triggered = true;

        }, setuptools.data.config.longpress);

    }).on('mouseleave', function() {

        mouseOver = false;
        mouseLeave = true;

        if ( mouseDown === false ) return;
        start = 0;
        clearTimeout(timer);

    }).on('mouseup', function(e) {

        if ( e.buttons > 1 ) return;
        mouseOver = false;
        mouseLeave = false;
        mouseUp = true;

        if ( mouseDown === false ) return;
        var self = this;
        finish = new Date().getTime();
        lastSelected = $(self).text();
        clearTimeout(timer);
        if ( triggered === true ) return;

        //  select everything in between
        if ( firstSelected !== lastSelected ) {

            var cells = $('.setuptools.groupMember.cell');
            var firstIndex = setuptools.data.groups.groupOrder.indexOf(firstSelected);
            var lastIndex = setuptools.data.groups.groupOrder.indexOf(lastSelected);
            if ( setuptools.app.muledump.keys('ctrl', e) === false ) $(this).siblings().removeClass('selected');

            //  ascending selection
            if ( firstIndex < lastIndex )
                for ( i = firstIndex; i <= lastIndex; i++ )
                    $(cells.get(i)).addClass('selected');

            //  descending selection
            if ( firstIndex > lastIndex )
                for ( i = lastIndex; i <= firstIndex; i++ )
                    $(cells.get(i)).addClass('selected');

        } else {

            if ( direction === true ) {
                $(this).removeClass('selected');
                return;
            }

            $(this).addClass('selected');
            if ( setuptools.app.muledump.keys('ctrl', e) === false ) $(this).siblings().removeClass('selected');

        }

        mouseDown = false;
        touched = [];

    }).on('contextmenu', function(e) {

        //  go away browser context menu
        e.preventDefault();

        //  prepare groupMenu
        var groupMenu = $('.setuptools.div.groupControls div.groupMenu');
        if ( groupMenu.hasClass('selected') === true ) groupMenu.click();

        //  reselect if this class isn't apart of the already selected group
        if ( $(this).hasClass('selected') === false ) {

            $(this).addClass('selected');
            $(this).siblings().removeClass('selected');

        }

        //  open the groupMenu
        groupMenu.click();

    });

    /* begin group accounts management */

    //  skipping for now

    /* end group accounts management */

};

//  facilitate deletion of the specified group or groups
setuptools.app.groups.delete = function(groupName) {

    //  this should be a jquery object
    if ( typeof groupName === 'object' ) {

        if ( groupName.length > 0 ) {

            newGroupName = [];
            for ( i = 0; i < groupName.length; i++ )
                if ( groupName.hasOwnProperty(i) )
                    newGroupName.push($(groupName[i]).text());

            setuptools.app.groups.delete(newGroupName.join(','));
            return;

        }

    } else {

        var groupNames = groupName.split(',');
        if ( groupNames.length === 0 && typeof groupName !== 'string') setuptools.lightbox.error('Either groupName was not a string or was not provided', 27);

    }

    if ( groupNames.length < 2 ) setuptools.lightbox.build('groups-delete', 'Are you sure you wish to delete the following group?');
    if ( groupNames.length > 1 ) setuptools.lightbox.build('groups-delete', 'Are you sure you wish to delete the following groups?');

    var groupList = groupName;
    if ( groupNames.length > 0 ) groupList = groupNames.join(', ');

    setuptools.lightbox.build('groups-delete', ' \
        <br><br>' + groupList + ' \
        <br><br><div class="setuptools link confirm menuStyle menuSmall cfleft">Yes, delete</div> <div class="setuptools link cancel menuStyle menuSmall negative cfright">No, cancel</div>\
    ');

    setuptools.lightbox.settitle('groups-delete', 'Delete Group');
    setuptools.lightbox.goback('groups-delete', setuptools.app.groups.manager);
    setuptools.lightbox.drawhelp('groups-delete', 'docs/setuptools/help/groups-manager/delete', 'Delete Group Help');
    setuptools.lightbox.display('groups-delete');

    $('.setuptools.link.confirm').click(function() {

        //  parse the provided group list
        groupList = groupList.split(', ');
        for ( i = 0; i < groupList.length; i++ ) {

            delete setuptools.data.groups.groupList[groupList[i]];
            setuptools.data.groups.groupOrder.splice(setuptools.data.groups.groupOrder.indexOf(groupList[i]), 1);

        }

        setuptools.app.config.save('GroupsManager/Delete');
        setuptools.lightbox.close('groups-delete');
        setuptools.app.groups.manager();

    });

    $('.setuptools.link.cancel').click(setuptools.app.groups.manager);

};

//  copy specified group
setuptools.app.groups.copy = function(groupName, newGroupName) {

    if ( typeof setuptools.data.groups.groupList[groupName] === 'undefined' ) {

        setuptools.lightbox.build('groups-copy', 'The specified group "' + groupName + '" does not exist.');

    } else {

        if (newGroupName) setuptools.lightbox.build('groups-copy', ' \
            The new group name provided already exists.<br><br> \
        ');

        if (!newGroupName) newGroupName = '';

        setuptools.lightbox.build('groups-copy', ' \
            Provide a name for the new group. <br><br> \
            <div class="w400px">\
                <div class="setuptools div app groups">\
                    <div><strong>Group Name</strong></div> \
                    <input name="groupName" value="' + newGroupName + '"> \
                </div> \
                <div class="setuptools link save cfright formStyle mt15">Create Group</div> \
            </div>\
        ');

    }

    setuptools.lightbox.settitle('groups-copy', 'Create Group Copy');
    setuptools.lightbox.goback('groups-copy', setuptools.app.groups.manager);
    setuptools.lightbox.display('groups-copy', {variant: 'setuptools-medium'});

    $('input[name="groupName"]').focus();

    function Process() {

        var newGroupName = $('input[name="groupName"]').val();
        if ( typeof setuptools.data.groups.groupList[newGroupName] === 'object' ) {
            setuptools.lightbox.close('groups-copy');
            setuptools.app.groups.copy(groupName, newGroupName);
            return;
        }

        setuptools.data.groups.groupList[newGroupName] = $.extend(true, {}, setuptools.data.groups.groupList[groupName]);
        setuptools.data.groups.groupOrder.push(newGroupName);

        setuptools.app.config.save('GroupsManager/Copy');
        setuptools.lightbox.close('groups-copy');
        setuptools.app.groups.manager();

    }

    $('input[name="groupName"]').keyup(function(e) {
        if ( e.keyCode === 13 ) Process();
    });

    $('.setuptools.link.save').click(Process);

};

//  rename specified group (copy+delete)
setuptools.app.groups.rename = function(groupName, newGroupName) {

    if ( typeof setuptools.data.groups.groupList[groupName] === 'undefined' ) {

        setuptools.lightbox.build('groups-rename', 'The specified group "' + groupName + '" does not exist.');

    } else {

        if ( typeof newGroupName === 'string' ) {

            if ( newGroupName.length < 1 ) {
                setuptools.lightbox.build('groups-rename', ' \
                    Group names cannot be empty.<br><br> \
                ');
            } else {
                setuptools.lightbox.build('groups-rename', ' \
                    The new group name provided already exists.<br><br> \
                ');
            }
        }

        if ( !newGroupName ) newGroupName = '';

        setuptools.lightbox.build('groups-rename', ' \
            Provide the name you wish to rename group "' + groupName + '" as. <br><br> \
            <div class="w400px">\
                <div class="setuptools div app groups">\
                    <div><strong>New Group Name</strong></div> \
                    <input name="groupName" value="' + newGroupName + '"> \
                </div> \
                <div class="setuptools link save cfright formStyle mt15">Rename Group</div> \
            </div>\
        ');


    }

    setuptools.lightbox.settitle('groups-rename', 'Rename Group');
    setuptools.lightbox.goback('groups-rename', setuptools.app.groups.manager);
    setuptools.lightbox.display('groups-rename', {variant: 'setuptools-medium'});

    $('input[name="groupName"]').focus();

    function Process() {

        var newGroupName = $('input[name="groupName"]').val();

        if ( typeof setuptools.data.groups.groupList[newGroupName] === 'object' || newGroupName.length < 1 ) {
            setuptools.lightbox.close('groups-rename');
            setuptools.app.groups.rename(groupName, newGroupName);
            return;
        }

        //  create copy
        var index = setuptools.data.groups.groupOrder.indexOf(groupName);
        setuptools.data.groups.groupList[newGroupName] = $.extend(true, {}, setuptools.data.groups.groupList[groupName]);

        //  delete old group
        delete setuptools.data.groups.groupList[groupName];

        //  update groupOrder
        setuptools.data.groups.groupOrder.splice(index, 1, newGroupName);

        setuptools.app.config.save('GroupsManager/Rename');
        setuptools.lightbox.close('groups-rename');
        setuptools.app.groups.manager();

    }

    $('input[name="groupName"]').keyup(function(e) {
        if ( e.keyCode === 13 ) Process();
    });

    $('.setuptools.link.save').click(Process);

};

//  merge selected groups
setuptools.app.groups.merge = function(selectedClass, newGroupName) {

    if ( selectedClass.length === 0 ) {

        setuptools.lightbox.build('groups-merge', 'No selected groups were included to be merged.');

    } else {

        if (newGroupName) setuptools.lightbox.build('groups-merge', ' \
            The new group name provided already exists.<br><br> \
        ');

        if (!newGroupName) newGroupName = '';

        setuptools.lightbox.build('groups-merge', ' \
            <div class="w400px">\
                <div class="setuptools div app groups">\
                    <div><strong>Merged Group Name</strong></div> \
                    <input name="groupName" value="' + newGroupName + '"> \
                </div> \
                <div class="setuptools div app groups"> \
                    <div><strong>Keep Source Groups</strong></div> \
                    <select name="keepGroups"> \
                        <option value="0">No</option> \
                        <option value="1">Yes</option> \
                    </select>\
                </div> \
                <div class="setuptools link save cfright formStyle mt15">Merge Groups</div> \
            </div>\
        ');

    }

    setuptools.lightbox.settitle('groups-merge', 'Merge Groups');
    setuptools.lightbox.goback('groups-merge', setuptools.app.groups.manager);
    setuptools.lightbox.drawhelp('groups-merge', 'docs/setuptools/help/groups-manager/merge', 'Merge Groups Help');
    setuptools.lightbox.display('groups-merge', {variant: 'setuptools-medium'});

    $('input[name="groupName"]').focus();

    function Process() {

        var newGroupName = $('input[name="groupName"]').val();
        var keepGroups = ( $('select[name="keepGroups"]').val() === "1" );
        var nameAsExisting = false;

        for ( i = selectedClass.length-1; i >= 0; i-- )
            if ( $(selectedClass[i]).text() === newGroupName )
                nameAsExisting = true;

        if ( typeof setuptools.data.groups.groupList[newGroupName] === 'object' && nameAsExisting === false ) {
            setuptools.lightbox.close('groups-merge');
            setuptools.app.groups.merge(selectedClass, newGroupName);
            return;
        }

        //  process merger in order of least priority
        setuptools.data.groups.groupList[newGroupName] = {};
        var newMemberList = [];
        for ( i = selectedClass.length-1; i >= 0; i-- ) {

            var currentGroup = $(selectedClass[i]).text();
            var lastIndex = setuptools.data.groups.groupOrder.indexOf(currentGroup);

            //  merge currentGroup into new group
            newMemberList = newMemberList.concat(setuptools.data.groups.groupList[currentGroup].members);

            //  delete old groups after merger unless specified
            if ( keepGroups === false ) {

                delete setuptools.data.groups.groupList[currentGroup];
                setuptools.data.groups.groupOrder.splice(lastIndex, 1);

            }

        }

        //  create the new group
        setuptools.data.groups.groupList[newGroupName] = $.extend(
            true,
            {},
            setuptools.data.groups.groupList[$(selectedClass[lastIndex]).text()]
        );
        setuptools.data.groups.groupList[newGroupName].members = newMemberList;

        //  update groupOrder and place it at the position of the highest priority merge member
        setuptools.data.groups.groupOrder.splice(lastIndex, 0, newGroupName);

        setuptools.app.config.save('GroupsManager/Merge');
        setuptools.lightbox.close('groups-merge');
        setuptools.app.groups.manager();

    }

    $('input[name="groupName"]').keyup(function(e) {
        if ( e.keyCode === 13 ) Process();
    });

    $('.setuptools.link.save').click(Process);

};

//  assist user in creating a new group
setuptools.app.groups.add = function(groupName) {

    if ( typeof groupName !== 'string' ) groupName = '';
    if ( typeof setuptools.data.groups.groupList[groupName] === 'object' ) {

        setuptools.lightbox.build('groups-add', 'The group name specified already exists.<br><br>');

    }

    setuptools.lightbox.build('groups-add', ' \
        <div class="w400px">\
            <div class="setuptools div groups error"></div> \
            <div class="setuptools div app groups">\
                <div><strong>Group Name</strong></div> \
                <input name="groupName" value="' + groupName + '"> \
            </div> \
            <div class="setuptools div app groups">\
                <div><strong>Enabled</strong></div> \
                <select name="enabled"> \
                    <option value="0">No</option> \
                    <option value="1" selected>Yes</option> \
                </select> \
            </div> \
            <div class="setuptools div app groups">\
                <div><strong>Group Order Position</strong></div> \
                <select name="position"> \
                    <option>1</option>\
        ');

        for ( i = 1; i <= setuptools.data.groups.groupOrder.length; i++ ) {

            setuptools.lightbox.build('groups-add', ' \
                <option ' + ( (i === (setuptools.data.groups.groupOrder.length)) ? 'selected' : '' ) + '>' + Number(i+1) + '</option> \
            ');

        }

        setuptools.lightbox.build('groups-add', ' \
                </select> \
            </div> \
            <div class="setuptools link save cfright formStyle mt15">Create Group</div> \
        </div>\
    ');

    setuptools.lightbox.settitle('groups-add', 'Create New Group');
    setuptools.lightbox.goback('groups-add', setuptools.app.groups.manager);
    setuptools.lightbox.drawhelp('groups-add', 'docs/setuptools/help/groups-manager/add', 'New Group Help');
    setuptools.lightbox.display('groups-add', {variant: 'fl-GroupsManager'});

    //  take focus on display
    $('input[name="groupName"]').focus();

    //  handle saving
    function GroupSave(doClose) {

        var groupName = $('input[name="groupName"]').val();
        var enabled = ( $('select[name="enabled"]').val() === "1" );
        var position = Number($('select[name="position"]').val())-1;

        //  only process unique groups
        if ( typeof setuptools.data.groups.groupList[groupName] !== 'object' ) {

            //  create the default group object if none exists
            setuptools.data.groups.groupList[groupName] = $.extend(true, {}, setuptools.objects.group, {enabled: enabled});

            //  add to groupOrder
            setuptools.data.groups.groupOrder.splice(position, 0, groupName);

            //  manually close the old lightbox
            if ( doClose === true ) setuptools.lightbox.close('groups-add');

            //  back to groups manager
            setuptools.app.config.save('GroupsManager/Add');
            setuptools.lightbox.close('groups-add');
            setuptools.app.groups.manager(groupName);
            return;

        }

        //  group exists
        setuptools.lightbox.close('groups-add');
        setuptools.app.groups.add(groupName);

    }

    $('.setuptools.div.app select, .setuptools.div.app input').keyup(function(e) {
        if ( e.keyCode === 13 ) GroupSave(true);
    });

    $('.setuptools.link.save').click(GroupSave);


};

//  generate an accounts variable from enabled groups
setuptools.app.groups.load = function(accounts) {

    if ( setuptools.data.groups.format !== 1 ) return;
    var AccountList = {};
    var MasterList = [];
    var FinalList = [];
    var groupAccounts = {};

    //  loop through groups in reverse order and generate our ordered list
    var trigger = false;
    var compact = [];
    for ( i = 0; i < setuptools.data.groups.groupOrder.length; i++ ) {

        //  check if this group is enabled
        var groupName = setuptools.data.groups.groupOrder[i];
        var groupData = setuptools.data.groups.groupList[groupName];

        //  first pass - scan over all groups to deleted accounts
        for ( x = 0; x < groupData.members.length; x++ ) {

            if ( typeof setuptools.data.accounts.accounts[groupData.members[x]] === 'undefined' ) {

                trigger = true;
                groupData.members.splice(x, 1);
                compact.push(groupName);
                x--;

            }

        }

        //  second pass - scan over enabled groups for active accounts
        if ( groupData.enabled === true ) {

            //  groupsMergeMode=1; build a deduplicated list of enabled accounts for each group
            //  groupsMergeMode=2; build the final deduplicated list of enabled accounts for each group
            for ( x = 0; x < groupData.members.length; x++ ) {

                //  just in case we somehow reach this point
                if ( typeof setuptools.data.accounts.accounts[groupData.members[x]] === 'undefined' ) {

                    setuptools.app.techlog('Groups/Load Warning: Found unknown account ' + groupData.members[x], 'force');
                    continue;

                }

                //  load the account if enabled
                if (setuptools.data.accounts.accounts[groupData.members[x]].enabled === true) {

                    if ( setuptools.data.config.groupsMergeMode === 1 ) {

                        if (MasterList.indexOf(groupData.members[x]) === -1) {
                            if ( typeof AccountList[groupName] === 'undefined' ) AccountList[groupName] = [];
                            AccountList[groupName].push(groupData.members[x]);
                            MasterList.push(groupData.members[x]);
                        }

                    }
                    //  perform serial merger
                    else {
                        FinalList.push(groupData.members[x]);
                    }

                }

            }

        }

    }

    //  if triggered we will compact groups
    if ( compact.length > 0 ) {

        for ( var j = 0; j < compact.length; j++ )
            setuptools.data.groups.groupList[compact[j]].members.filter(function (item) {
                return item !== undefined
            }).join();

        setuptools.app.config.save('GroupsManager/InitCleanup');

    }

    //  perform parallel merger
    if ( setuptools.data.config.groupsMergeMode === 1 ) {

        //  find the maximum index we need to seek to
        var maxIndex = 0;
        for ( var i in AccountList )
            if ( AccountList.hasOwnProperty(i) )
                if ( AccountList[i].length > maxIndex )
                    maxIndex = AccountList[i].length;

        //  loop thru each group in parallel
        for ( x = 0; x < maxIndex; x++ )
            for ( var i in AccountList )
                if (AccountList.hasOwnProperty(i))
                    if (typeof AccountList[i][x] === 'string')
                        FinalList.splice(
                            x+Object.keys(AccountList).indexOf(i)+(3*x),
                            0,
                            AccountList[i][x]
                        );

        AccountList = FinalList;

    } else AccountList = FinalList;

    //  build the accounts object
    for ( x = 0; x < AccountList.length; x++ ) {

        var AccountName = AccountList[x];
        if ( typeof accounts[AccountName] === 'string' ) groupAccounts[AccountName] = accounts[AccountName];

    }

    return groupAccounts;

};
