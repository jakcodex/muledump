//  so it begins
setuptools.app.groups.manager = function(manual, group) {

    /*setuptools.lightbox.build('groups-manager', 'Feature coming soon!');
    setuptools.lightbox.settitle('groups-manager', 'Groups Manager');
    setuptools.lightbox.goback('groups-manager', setuptools.app.index);
    setuptools.lightbox.drawhelp('groups-manager', 'docs/setuptools/help/accounts-manager/groups', 'Groups Manager Help');
    setuptools.lightbox.display('groups-manager', {variant: 'setuptools-tiles'});*/

    if ( typeof manual != 'boolean' ) manual = false;
    if ( typeof group != 'string' ) group = '';
    var draggable = false;
    setuptools.lightbox.build('groups-manager', ' \
        <h3>Available Actions</h3> \
        <a href="#" class="setuptools link groups add">Create Group</a> | \
        <a href="#" class="setuptools link groups enableAll">Enable All</a> | \
        <a href="#" class="setuptools link groups disableAll">Disable All</a> \
        <div class="setuptools div groups container"> \
        <br><strong>Existing Groups</strong> \
        <br> \
    ');

    //  display existing groups
    //
    if ( Object.keys(setuptools.data.groups).length === 0 ) {

        setuptools.lightbox.build('groups-manager', 'There are no groups.');

    } else {

        //  advanced manager
        if ( !manual ) {

            setuptools.lightbox.build('groups-manager', ' \
                <div class="setuptools div groupControls"> \
                    <div class="groupMenu" title="Group Menu">M</div> \
                    <div class="groupSort" title="Enable Group Sorting">C</div> \
                    <div class="groupSelect" title="Select Menu">S</div> \
                </div> \
                <div class="setuptools div groupList"> \
                    <div class="dragbox"> \
            ');

            for ( var i in setuptools.data.groups ) {
                if ( setuptools.data.groups.hasOwnProperty(i) ) {

                    var selected = ( group === i ) ? ' selected' : '';
                    setuptools.lightbox.build('groups-manager', '<div class="setuptools groupMember cell' + selected + '" data-groupName="' + i + '">' + i + '</div>');

                }
            }

            setuptools.lightbox.build('groups-manager', ' \
                    </div> \
                </div> \
            ');

        //  basic manager
        } else {

            setuptools.lightbox.build('groups-manager', ' \
                <select name="groupName" class="setuptools app">\
            ');

            for ( var i in setuptools.data.groups )
                setuptools.lightbox.build('groups-manager', '<option>' + i + '</option>');

            setuptools.lightbox.build('groups-manager', ' \
                </select> \
            ');

        }

    }

    setuptools.lightbox.build('groups-manager', ' \
        <div class="setuptools div groupEditor container noselect"> \
            <br><h3>Group Editor</h3> \
            <div class="setuptools div groups editor">Select a group or create a new one.</div> \
            </div> \
        </div>\
    ');

    var variant = ( !manual && typeof group === 'string' ) ? 'setuptools-tiles-fixed' : 'setuptools-tiles';

    setuptools.lightbox.settitle('groups-manager', 'Groups Manager');
    setuptools.lightbox.goback('groups-manager', setuptools.app.index);
    setuptools.lightbox.drawhelp('groups-manager', 'docs/setuptools/help/groups-manager/manager', 'Groups Manager Help');
    setuptools.lightbox.display('groups-manager', {variant: 'setuptools-tiles'});

    $('.setuptools.link.groups.add').click(setuptools.app.groups.add);

    /* begin group list controls */

    if ( !manual ) {

        //  display the group editor
        function OpenEditor(groupName, self) {

            //  generate a list of account tiles and paginate
            var ListAccountTiles = function(groupName, page) {

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

            function availableAccountsUpdate(close) {

                if ( close === true ) setuptools.lightbox.menu.context.close();
                availableAccountContext();

            }

            //  manage the availableAccounts context menu
            function availableAccountsContext() {

                function addToCurrent(account) {

                    groupMembersList = $.extend(true, [], [account], groupMembersList);
                    availableAccountsList = $.extend(true, [], availableAccountsList.remove(account));

                }

                function addToTop(account) {

                    console.log('Add to current', account);

                }

                function addToBottom(account) {

                    console.log('Add to current', account);

                }

                function addToPosition(account) {

                    console.log('Add to current', account);

                }

                function addToSpecified(account) {

                    console.log('Add to current', account);

                }

                $('div.availableAccounts > div.dragbox > div.cell').click(function() {

                    var self = this;
                    if ( $(this).hasClass('selected') === false ) {

                        $(this).siblings().removeClass('selected');
                        $(this).addClass('selected');

                        //  default position is inline with the next sibling
                        var position = $(this).next();

                        //  if this is the last sibling then we anchor on the account search div
                        if ( position.length === 0 ) {
                            position = $('div.availableAccounts div.pageControls > div.editor.control.searchName');
                        }

                        var options = [
                            {
                                option: 'header',
                                value: 'Account Menu'
                            },
                            {
                                class: 'addToCurrent',
                                name: 'Add to Current Page',
                                callback: addToCurrent,
                                callbackArg: $(this).text()
                            },
                            {
                                class: 'addToTop',
                                name: 'Add to Top',
                                callback: addToTop,
                                callbackArg: $(this).text()
                            },
                            {
                                class: 'addToBottom',
                                name: 'Add to Bottom',
                                callback: addToBottom,
                                callbackArg: $(this).text()
                            },
                            {
                                class: 'addToPosition',
                                name: 'Add at Position ...',
                                callback: addToPosition,
                                callbackArg: $(this).text()
                            },
                            {
                                class: 'addToSpecified',
                                name: 'Add After Account ...',
                                callback: addToSpecified,
                                callbackArg: $(this).text()
                            },
                            {
                                class: 'copyText',
                                name: 'Copy to Clipboard',
                                callback: function() {}
                            },
                            {
                                class: 'addCancel',
                                name: 'Cancel',
                                callback: function() {}
                            }
                        ];

                        setuptools.lightbox.menu.context.create(position, options, self);

                    } else {

                        setuptools.lightbox.menu.context.close();
                        $(this).removeClass('selected');

                    }

                });

            }

            function groupMembersContext() {

                $('div.groupMembers > div.dragbox > div.cell:not(.nocontext)').click(function() {

                    var self = this;
                    if ( $(this).hasClass('selected') === false ) {

                        $(this).siblings().removeClass('selected');
                        $(this).addClass('selected');

                        //  default position is inline with the next sibling
                        var position = $(this).next();

                        //  if this is the last sibling then we anchor on the account search div
                        if ( position.length === 0 ) {
                            position = $('div.groupMembers div.pageControls > div.editor.control.searchName');
                        }

                        var options = [
                            {
                                option: 'header',
                                value: 'Account Menu'
                            },
                            {
                                class: 'moveUp',
                                name: 'Move Up',
                                callback: function() {
                                    console.log('Move up');
                                }
                            },
                            {
                                class: 'moveDown',
                                name: 'Move Down',
                                callback: function() {
                                    console.log('Move down');
                                }
                            },
                            {
                                class: 'moveToTopGroup',
                                name: 'Move to Top of Group',
                                callback: function() {
                                    console.log('Move to top group');
                                }
                            },
                            {
                                class: 'moveToBottomGroup',
                                name: 'Move to Bottom of Group',
                                callback: function() {
                                    console.log('Move to bottom group');
                                }
                            },
                            {
                                class: 'moveToPosition',
                                name: 'Move to Position ...',
                                callback: function() {
                                    console.log('Move to position');
                                }
                            },
                            {
                                class: 'moveToSpecified',
                                name: 'Move After Account ...',
                                callback: function() {
                                    console.log('Move to specified');
                                }
                            },
                            {
                                class: 'copyText',
                                name: 'Copy to Clipboard',
                                callback: function() {}
                            },
                            {
                                class: 'addCancel',
                                name: 'Cancel',
                                callback: function() {}
                            }
                        ];

                        setuptools.lightbox.menu.context.create(position, options, self);

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
                    if ( setuptools.data.groups[groupName].members.indexOf(i) === -1 ) {
                        availableAccountsList.push(i);
                    } else {
                        groupMembersList.push(i);
                    }

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

            //  disable text selection
            setuptools.lightbox.disableSelect();

            if ( self ) $(self).addClass('selected');
            var editor = $('.setuptools.div.groups.editor');
            editor.addClass('active');
            $('.setuptools.groupMember.cell[data-groupName!="' + groupName + '"]').removeClass('selected');
            $('.setuptools.div.groupEditor.container > h3').append(' - ' + groupName);

            //  build the editor
            var editorHeight = ((setuptools.data.config.accountsPerPage+1)*41)+26;

            //  display the editor
            editor.html(' \
                <div class="availableAccounts" style="height: ' + editorHeight + 'px;">\
                    <div><strong>Available Accounts</strong></div> \
                    ' + availableAccountsPaginate.html.menu + ' \
                    <div class="dragbox">' + ListAccountTiles(groupName) + '</div> \
                    ' + availableAccountsPaginate.html.search + ' \
                </div> \
                <div class="groupMembers" style="height: \' + editorHeight + \'px;">\
                    <div><strong>Group Members</strong></div> \
                    ' + groupMembersPaginate.html.menu + ' \
                    <div id="dropzone" class="dragbox">' + ListGroupMembers(groupName) + '</div> \
                    ' + groupMembersPaginate.html.search + ' \
                </div> \
            ');

            //  re-enable text selection
            setuptools.lightbox.enableSelect();

            //  bind editor buttons
            availableAccountsPaginate.bind();
            groupMembersPaginate.bind();

            //  bind draggable actions

        }

        //  close the group editor
        function CloseEditor() {

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
            for ( var i in setuptools.data.groups )
                if ( setuptools.data.groups.hasOwnProperty(i) )
                    if ( setuptools.data.groups[i].enabled === true )
                        $('.setuptools.groupMember.cell[data-groupName="' + i + '"]').addClass('selected');

        }

        //  select all disabled groups
        function SelectAllDisabled() {

            SelectNone();
            for ( var i in setuptools.data.groups )
                if ( setuptools.data.groups.hasOwnProperty(i) )
                    if ( setuptools.data.groups[i].enabled === false )
                        $('.setuptools.groupMember.cell[data-groupName="' + i + '"]').addClass('selected');

        }

        //  enable selected groups
        function EnableSelected() {

            $('.setuptools.groupMember.cell.selected').each(function(index, element) {

                var groupName = $(element).text();
                if ( setuptools.data.groups[groupName] ) setuptools.data.groups[groupName].enabled = true;

            });

        }

        //  disable selected groups
        function DisableSelected() {

            $('.setuptools.groupMember.cell.selected').each(function(index, element) {

                var groupName = $(element).text();
                if ( setuptools.data.groups[groupName] ) setuptools.data.groups[groupName].enabled = false;

            });

        }

        //  display group menu
        $('.setuptools.div.groupControls div.groupMenu').click(function (e) {

            //  deselect other menu options
            $('.setuptools.div.groupControls div:not(.groupMenu)').each(function(index, element) {
                $(element).removeClass('selected');
            });

            var selectedClass = $('.setuptools.div.groupList div.dragbox div.cell.selected');
            var selectedCount = selectedClass.length;
            var self = this;

            //  single group menu
            if (selectedCount === 1) {

                //  enable/disable, edit, delete

                if ( $('.setuptools.div.groupControls div.groupMenu').hasClass('selected') === false ) {

                    //  base info
                    $(self).addClass('selected');
                    var groupName = selectedClass.text();
                    var position = $('.setuptools.div.groupList div.dragbox div.cell:first-child');
                    var options = [
                        {
                            option: 'header',
                            value: 'Group - ' + groupName
                        },
                        {
                            class: 'edit',
                            name: 'Edit',
                            callback: function() {
                                OpenEditor(groupName);
                            }
                        },
                        {
                            class: 'disable',
                            name: 'Disable',
                            callback: DisableSelected
                        },
                        {
                            class: 'delete',
                            name: 'Delete',
                            callback: function() {
                                setuptools.lightbox.close('groups-manager');
                                setuptools.app.groups.delete(groupName);
                            }
                        }
                    ];

                    if ( setuptools.data.groups[groupName].enabled === false ) {

                        options[1] = {
                            class: 'enable',
                            name: 'Enable',
                            callback: EnableSelected
                        };

                    }

                    setuptools.lightbox.menu.context.create(position, options, self);

                } else {

                    setuptools.lightbox.menu.context.close(self);

                }

                //  multi group menu
            } else {

                //  enable/disable all, delete, add/remove specific account
                if ( $('.setuptools.div.groupControls div.groupMenu').hasClass('selected') === false ) {

                    //  base info
                    $(self).addClass('selected');
                    var position = $('.setuptools.div.groupList div.dragbox div.cell:first-child');
                    var options = [
                        {
                            option: 'header',
                            value: 'Group - ' + groupName
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
                        },
                        {
                            class: 'delete',
                            name: 'Delete',
                            callback: function() {
                                setuptools.lightbox.close('groups-manager');
                                setuptools.app.groups.delete(selectedClass);
                            }
                        }
                    ];

                    setuptools.lightbox.menu.context.create(position, options, self);

                } else {

                    setuptools.lightbox.menu.context.close(self);

                }


            }

        });

        //  toggle group sorting
        $('.setuptools.div.groupControls div.groupSort').click(function () {

            //  deselect other menu options
            $('.setuptools.div.groupControls div:not(.groupSort)').each(function(index, element) {
                $(element).removeClass('selected');
            });

            //  remove any existing context menu
            $('.setuptools.div.menu').remove();

            //  mark this menu option as selected
            $(this).toggleClass('selected');

            //  enable dragging
            if (draggable === false) {

                $(this).attr('title', 'Disable Group Sorting');
                draggable = new Draggable.Sortable(document.querySelectorAll('.setuptools.div.groupList div.dragbox'), {
                    draggable: '.setuptools.div.groupList div.cell'
                });

            //  disable dragging
            } else {

                draggable.destroy();
                draggable = false;
                $(this).attr('title', 'Enable Group Sorting');

            }

        });

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

                setuptools.lightbox.menu.context.create(position, options, self);

            } else {

                setuptools.lightbox.menu.context.close(self);

            }

        });

    }

    /* end group list controls */

    //  group selection
    var start;
    var timer;
    var triggered;

    //  single click - toggle selection
    //  long click - open group in editor
    $('.setuptools.groupMember.cell').on('mousedown', function() {

        var self = this;
        triggered = false;
        start = new Date().getTime();
        timer = setTimeout(function() {

            OpenEditor($(self).text(), self);
            triggered = true;

        }, setuptools.data.config.longpress);

    }).on('mouseleave', function() {

        start = 0;
        clearTimeout(timer);

    }).on('mouseup', function() {

        clearTimeout(timer);
        if ( triggered === true ) return;
        if ( new Date().getTime() >= ( start + setuptools.data.config.longpress )  ) {
            OpenEditor($(this).text(), this);
        } else {
            $(this).toggleClass('selected');
        }

    });

    /* begin group accounts management */

    if ( !manual ) {



    }

    /* end group accounts management */

    //  provide switch for basic/advanced modes
    $('.setuptools.bottom.container').append(' \
        <div style="clear: right; float: right; height: 100%;"> \
            <br>Switch to <a href="#" class="setuptools link groups manager switchModes">' + ( (manual === true) ? 'Advanced' : 'Basic' ) + ' Mode</a> \
            <span style="font-weight: bold;">&#10095;</span> \
        </div> \
    ');

    $('.setuptools.link.groups.manager.switchModes').click(function() {
        var mode = ( manual != true );
        var groupName = $('input[name="groupName"]').val();
        setuptools.lightbox.menu.context.close();
        setuptools.app.groups.manager(mode, groupName);
    });

};

//  facilitate deletion of the specified group or groups
setuptools.app.groups.delete = function(groupName) {

    setuptools.lightbox.menu.context.close();

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
        <br><br><a href="#" class="setuptools link confirm">Yes, delete</a> or <a href="#" class="setuptools link cancel">No, cancel</a>\
    ');

    setuptools.lightbox.settitle('groups-delete', 'Delete Group');
    setuptools.lightbox.goback('groups-delete', setuptools.app.groups.manager);
    setuptools.lightbox.drawhelp('groups-delete', 'docs/setuptools/help/groups-manager/delete', 'Delete Group Help');
    setuptools.lightbox.display('groups-delete');

    $('.setuptools.link.confirm').click(function() {

        groupList = groupList.split(', ');
        for ( i = 0; i < groupList.length; i++ )
            delete setuptools.data.groups[groupList[i]];

        setuptools.app.groups.manager();

    });

    $('.setuptools.link.cancel').click(setuptools.app.groups.manager);

};

//  assist user in creating a new group
setuptools.app.groups.add = function(manual) {

    setuptools.lightbox.menu.context.close(self);
    setuptools.lightbox.build('groups-add', ' \
        <div class="setuptools div groups error"></div> \
        <div class="setuptools div app groups">\
            <div><strong>Group Name</strong></div> \
            <input name="groupName"> \
        </div> \
        <div class="setuptools div app groups">\
            <div><strong>Enabled</strong></div> \
            <select name="enabled"> \
                <option value="0">No</option> \
                <option value="1" selected>Yes</option> \
            </select> \
        </div> \
        <div class="setuptools div app groups">\
            <div><strong>Priority</strong></div> \
            <select name="priority"> \
    ');

    for ( i = 20; i > 0; i-- ) {

        setuptools.lightbox.build('groups-add', ' \
            <option ' + ( (i === 10) ? 'selected' : '' ) + '>' + i + '</option> \
        ');

    }

    setuptools.lightbox.build('groups-add', ' \
            </select> \
        </div> \
        <div style="float: left; width: 100%;"> \
            <br><a href="#" class="setuptools app save">Create Group</a> \
        </div> \
    ');

    setuptools.lightbox.settitle('groups-add', 'Create New Group');
    setuptools.lightbox.goback('groups-add', setuptools.app.groups.manager);
    setuptools.lightbox.drawhelp('groups-add', 'docs/setuptools/help/groups-manager/add', 'New Group Help');
    setuptools.lightbox.display('groups-add');

    //  take focus on display
    $('input[name="groupName"]').focus();

    //  handle saving
    function GroupSave(doClose) {

        var groupName = $('input[name="groupName"]').val();
        var enabled = ( $('select[name="enabled"]').val() === "1" );
        var priority = Number($('select[name="priority"]').val());

        //  create the default group object if none exists
        if ( !setuptools.data.groups[groupName] ) setuptools.data.groups[groupName] = $.extend(true, {}, setuptools.objects.group);

        //  merge into existing config
        $.extend(true, setuptools.data.groups[groupName], {enabled: enabled, priority: priority});

        //  manually close the old lightbox
        if ( doClose === true ) setuptools.lightbox.close('groups-add');

        //  back to groups manager
        setuptools.app.groups.manager(manual, groupName);

    }

    $('.setuptools.div.app select, .setuptools.div.app input').keyup(function(e) {
        if ( e.keyCode === 13 ) GroupSave(true);
    });

    $('.setuptools.app.save').click(GroupSave);


};
