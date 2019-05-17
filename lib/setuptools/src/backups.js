/**
 * @function
 * Backups management menu
 */
setuptools.app.backups.index = function() {

    //  display a varying menu based on if setuptools is loaded or not
    if ( setuptools.state.loaded === true ) {

        //  for another time - <a href="#" class="setuptools app backups createdeep">Deep Backup</a> | \
        setuptools.lightbox.build('backups-index', ' \
            <div class="flex-container" style="justify-content: space-between; margin-bottom: 16px;">\
                <div class="setuptools link backups create menuStyle menuSmall textCenter mr5">Create Backup</div> \
                <div class="setuptools link backups archive menuStyle menuSmall notice textCenter mr5">Create Archive</div> \
                <div class="setuptools link backups upload menuStyle menuSmall textCenter mr0">Upload Backup</div> \
            </div>\
        ');

    } else {

        //  when setuptools is not loaded the user will only have the ability to restore backups
        setuptools.lightbox.build('backups-index', ' \
            <div class="setuptools link backups upload menuStyle menuSmall cboth textCenter fleft" style="margin-bottom: 16px;">Upload Backup</div> \
        ');

    }

    setuptools.lightbox.build('backups-index', ' \
        <div class="fleft cboth w100">\
    ');

    var BackupList = setuptools.app.backups.listAll();

    if ( BackupList.length === 0 ) {

        setuptools.lightbox.build('backups-index', ' \
                <h3>No stored backups located.</h3> \
            </div>\
        ');

    } else {

        setuptools.lightbox.build('backups-index', ' \
                <h3 class="fleft cboth" style="margin: 0 0 10px 0;">Stored Backups</h3> \
                <div class="cfleft w100">\
                    <div class="cfleft w100 mr5">\
                        <select name="BackupName" class="setting w100">\
        ');

        for (i = BackupList.length - 1; i >= 0; i--) {

            if (BackupList.hasOwnProperty(i)) {

                var optionText = BackupList[i][3];
                var found = false;
                var BackupData = JSON.parse(setuptools.storage.read(BackupList[i][1]));
                if ( typeof BackupData === 'object' && BackupData.meta ) {

                    if ( typeof BackupData.meta.name === 'string' ) {

                        optionText = BackupData.meta.name + ' - ' + BackupList[i][3];
                        BackupList[i].push(BackupData.meta.name);

                    }

                    if ( BackupData.meta.protected === true ) {
                        if (found === false) optionText += ' (';
                        optionText += 'p, ';
                        found = true;
                    }

                    if ( BackupData.meta.auto === true ) {
                        if (found === false) optionText += ' (';
                        optionText += 'a, ';
                        found = true;
                    }

                    if ( found === true ) {
                        optionText = optionText.slice(0, optionText.length-2);
                        optionText += ')';
                    }

                }

                setuptools.lightbox.build('backups-index', ' \
                            <option \
                                value="' + BackupList[i][1] + '" \
                                data-BackupName="' + BackupList[i][3] + '" \
                                data-filename="' + BackupList[i][4] + '" \
                                data-CustomName="' + ( ( typeof BackupList[i][5] === 'string' && BackupList[i][5].length > 0) ? BackupList[i][5] : '' ) + '" \
                                ' + ( (BackupList[i][1] === setuptools.tmp.SelectedBackupID) ? 'selected' : '' ) + '>\
                                ' + optionText + ' \
                            </option> \
                ');

            }

        }

        setuptools.lightbox.build('backups-index', ' \
                        </select> \
                    </div>\
                    <div class="cfleft Backups-BackupOptions mt10"> \
                        <div class="setuptools link backups download menuStyle" title="Download Backup">Download</div> \
                        <div class="setuptools link backups rename menuStyle" title="Rename Backup">Rename</div> \
                        <div class="setuptools link backups restore menuStyle" title="Restore Backup">Restore</div> \
                        <div class="setuptools link backups protect menuStyle" title="">&nbsp;</div> \
                        <div class="setuptools link backups delete menuStyle negative noclose" title="Delete Backup">Delete</div> \
                    </div> \
                </div>\
            </div> \
        ');

    }

    setuptools.lightbox.settitle('backups-index', 'Backups Manager');
    setuptools.lightbox.goback('backups-index', setuptools.app.index);
    setuptools.lightbox.drawhelp('backups-index', 'docs/setuptools/help/backups-manager/backups', 'Backups Manager Help');
    setuptools.lightbox.display('backups-index', {variant: 'fl-BackupsManager'});

    //  jquery bindings
    $('.setuptools.link.backups.upload').click(setuptools.app.backups.upload);

    //  create and autoBackups only work for loaded users
    if ( setuptools.state.loaded === true ) {

        //  these don't require any special arguments
        $('.setuptools.link.backups.create').click(function() {
            setuptools.app.backups.create();
        });

        $('.setuptools.link.backups.archive').click(function() {
            setuptools.app.backups.createarchive();
        });

    }

    $('.setuptools.link.backups.rename').click(function() {
        setuptools.app.backups.rename($('select[name="BackupName"]').val());
    });

    //  bind restore click
    $('.setuptools.link.backups.restore').click(function() {
        var BackupID = $('select[name="BackupName"]').val();
        var BackupName = $('select[name="BackupName"] option:selected').attr('data-BackupName');
        var BackupCustomName = $('select[name="BackupName"] option:selected').attr('data-CustomName');
        var SuppliedName = ( typeof BackupCustomName === 'string' && BackupCustomName.length > 0 ) ? BackupCustomName : BackupName;
        setuptools.app.backups.restoreConfirm(BackupID, SuppliedName);
    });

    //  bind download click
    $('.setuptools.link.backups.download').click(function() {
        var BackupID = $('select[name="BackupName"]').val();
        var BackupName = $('select[name="BackupName"] option:selected').text();
        var BackupFileName = $('select[name="BackupName"] option:selected').attr('data-filename');
        var BackupCustomName = $('select[name="BackupName"] option:selected').attr('data-CustomName');
        setuptools.app.backups.download(BackupID, BackupName, BackupFileName, BackupCustomName);
    });

    //  deletion option
    function bindDelete() {

        $('.setuptools.link.backups.delete').unbind('click').click(function() {

            if ( setuptools.tmp.lightboxStatus && setuptools.tmp.lightboxStatus.indexOf('backup-delete') > -1 ) return;
            var BackupSelected = $('select[name="BackupName"] option:selected');
            var NextBackup = ( BackupSelected.next().length > -1 ) ? BackupSelected.next() : BackupSelected.prev();
            var BackupID = BackupSelected.val();
            var BackupData = setuptools.storage.read(BackupID);
            if ( BackupData === false ) {

                setuptools.lightbox.status(this, 'Error!', 'backup-delete');

            } else {

                BackupData = JSON.parse(BackupData);
                if ( BackupData && typeof BackupData.meta === 'object' ) {

                    //  if the backup isn't protected, delete it
                    if ( typeof BackupData.meta.protected === 'undefined' || BackupData.meta.protected === false ) {

                        if ( setuptools.storage.delete(BackupID) === true ) {

                            setuptools.lightbox.status(this, 'Ok!', 'backup-delete');
                            NextBackup.prop('selected', 'selected');
                            BackupSelected.remove();
                            updateProtection();

                        } else setuptools.lightbox.status(this, 'Error', 'backup-delete');

                    } else setuptools.lightbox.status(this, 'Protected!', 'backup-delete');

                } else {

                    //  invalid backup data detected
                    if ( setuptools.storage.delete(BackupID) === true ) {

                        setuptools.lightbox.status(this, 'Ok', 'backup-delete');
                        NextBackup.prop('selected', 'selected');
                        BackupSelected.remove();
                        updateProtection();

                    } else setuptools.lightbox.status(this, 'Warning!', 'backup-delete');

                }

            }


        });

    }

    //  protection options
    function updateProtection() {

        var SelectedBackupID = $('select[name="BackupName"] option:selected').val();
        var SelectedBackupName = $('select[name="BackupName"] option:selected').text();
        var SelectedBackupData = JSON.parse(setuptools.storage.read(SelectedBackupID));
        setuptools.tmp.SelectedBackupID = SelectedBackupID;
        $('.setuptools.link.backups.protect').unbind('click');

        if ( typeof SelectedBackupData === 'object' && SelectedBackupData.meta ) {

            var protectButton = $('.setuptools.link.backups.protect');
            if ( typeof SelectedBackupData.meta.protected === 'undefined' ) SelectedBackupData.meta.protected = false;
            if ( SelectedBackupData.meta.protected === false ) {

                $('.setuptools.link.backups.protect').removeClass('negative');
                $('.setuptools.link.backups.delete').removeClass('deleteDisabled disabled truly').attr('title', 'Delete Backup');
                bindDelete();

                protectButton.text('Protect').attr('title', 'Enable Backup Protection');
                protectButton.click(function() { setuptools.app.backups.protect(SelectedBackupID, SelectedBackupName, true); });

            } else {

                $('.setuptools.link.backups.protect').addClass('negative');
                $('.setuptools.link.backups.delete').addClass('deleteDisabled disabled truly')
                    .unbind('click')
                    .attr('title', 'Protected Backup - Expose First');

                protectButton.text('Expose').attr('title', 'Disable Backup Protection');
                protectButton.click(function() { setuptools.app.backups.protect(SelectedBackupID, SelectedBackupName, false); });

            }

        } else {

            $('.setuptools.link.backups.protect').text('Examine').attr('title', 'Problem detected with backup');
            $('.setuptools.link.backups.protect').click(function() {  });

        }

    }

    if ( BackupList.length > 0 ) updateProtection();
    $('select[name="BackupName"]').change(updateProtection);

};

/**
 * @function
 * Provide a user an archive backup and explain what it is
 */
setuptools.app.backups.createarchive = function() {

    setuptools.lightbox.build('backups-archive-init', ' \
        Generating archive backup. This may take a moment... \
    ');
    setuptools.lightbox.settitle('backups-archive-init', false);
    setuptools.lightbox.display('backups-archive-init', {
        afterOpen: function() {

            setuptools.app.backups.archive.create(function(content, name) {

                setuptools.lightbox.close('backups-archive-init');
                setuptools.lightbox.build('backups-archive-download', ' \
                    <div class="flex-container" style="flex-flow: column; align-items: flex-start;">\
                        <div>Your Muledump Archive backup is ready!</div> \
                        <div>&nbsp;</div>\
                        <div><a href="#" class="setuptools link download noclose">Click here</a> to manually download the file if it doesn\'t start automatically.</div> \
                        ' +
                        (
                            ( setuptools.state.hosted === false && setuptools.browser === 'chrome' ) ? ' \
                                <div>&nbsp;</div>\
                                <div><strong>Warning:</strong> Your browser may flag zip downloads from local apps as being potentially malicious.</div>\
                            ' : ''
                        )
                        + '\
                    </div>\
                ');
                setuptools.lightbox.goback('backups-archive-download', setuptools.app.backups.index);
                setuptools.lightbox.settitle('backups-archive-download', 'Create Archive Backup');
                setuptools.lightbox.display('backups-archive-download');

                $('a.setuptools.link.download').on('click.setuptools.backup.download', function(e) {

                    e.preventDefault();
                    clearTimeout(autodownload);
                    saveAs(content, name + ".zip");

                });

                var autodownload = setTimeout(function() {
                    saveAs(content, name + ".zip");
                }, 3000);

            });

        }
    });

};

/**
 * @function
 * @param {string} BackupID
 * Rename a backup
 */
setuptools.app.backups.rename = function(BackupID) {

    var BackupDataJSON = setuptools.storage.read(BackupID);

    if ( typeof BackupDataJSON === 'string' ) {

        setuptools.lightbox.build('backups-rename', ' \
            Enter a new name.\
        ');
        var backupRenameBind = setuptools.app.backups.renameHtml('backups-rename', BackupID, BackupDataJSON, setuptools.app.backups.index);

    } else {

        setuptools.lightbox.build('backups-rename', 'Backup ' + BackupID + ' does not exist.');

    }

    setuptools.lightbox.goback('backups-rename', setuptools.app.backups.index);
    setuptools.lightbox.drawhelp('backups-rename', 'docs/setuptools/help/backups-manager/upload', 'Backup Upload Help');
    setuptools.lightbox.settitle('backups-rename', 'Rename Backup');
    setuptools.lightbox.display('backups-rename', {variant: 'fl-BackupsModify'});
    if ( typeof backupRenameBind === 'function' ) backupRenameBind();

};

/**
 * @function
 * Perform automatic backups
 */
setuptools.app.backups.auto = function() {

    if ( setuptools.data.config.automaticBackups === true ) {

        var FirstRun = false;
        var Backups = setuptools.app.backups.listAll();
        if ( Backups.length > 0 ) {
            var LatestBackup = Backups[Backups.length - 1];
            var LatestDate = new Date(Number(LatestBackup[2]));
            var CurrentDate = new Date();
        } else {
            FirstRun = true;
        }

        //  if a.date > b.date or a.month > b.month we can assume it's time for an automatic backup
        if ( FirstRun === true || (CurrentDate.getDate() > LatestDate.getDate()) || (CurrentDate.getMonth() > LatestDate.getMonth()) ) {

            //  clean up first
            setuptools.app.backups.cleanup();

            //  then backup
            setuptools.app.config.backup(false, true);
            window.techlog('setuptools.app.backups.auto - created automatic backup', 'force');

        }

    }

};

/**
 * @function
 * @param {boolean} [manual]
 * Process a user-provided upload
 */
setuptools.app.backups.upload = function(manual) {

    function ParseUploadedFile(reader) {

        var FileContents;
        try {
            FileContents = sodium.to_string(reader.result);
        } catch(e) {};

        //  ready for final click
        var UploadFileJSON = false;
        try {
            UploadFileJSON = JSON.parse(FileContents);
        } catch(e) {}

        //  was this a setuptools backup json file?
        if (typeof UploadFileJSON === 'object' && UploadFileJSON.meta) {

            $('.setuptools.link.backups.uploadData.save').html('Restore Backup').removeClass('noclose').click(function () {

                setuptools.app.backups.restore({
                    method: 'upload',
                    data: UploadFileJSON,
                    backupName: (typeof UploadFileJSON.meta.name === 'string') ? UploadFileJSON.meta.name : 'User-Uploaded',
                    saveExisting: $('input[name="restoreSaveExisting"]').prop('checked')
                });

            });

            $('.setuptools.app.backups.uploadResults').html(' \
                Found ' + Object.keys(UploadFileJSON.accounts.accounts).length + ' accounts, \
                ' + Object.keys(UploadFileJSON.config).length + ' settings, and \
                ' + Object.keys(UploadFileJSON.options).length + ' options \
            ');

            $('div.secondaryOptions > div').hide();

        }
        //  was it a backup archive file?
        else {

            setuptools.app.backups.archive.read(reader.result, function(files) {

                if ( files && files.meta && files.meta.format === 1 ) {

                    $('.setuptools.link.backups.uploadData.save').html('Restore Backup').removeClass('noclose');

                    $('.setuptools.app.backups.uploadResults').html(' \
                        Found ' + Object.keys(files.setuptools && files.setuptools.accounts.accounts || {}).length + ' accounts, \
                        ' + Object.keys(files.accounts || {}).length + ' data files, \
                        ' + Object.keys(files.setuptools && files.setuptools.config || {}).length + ' settings, and \
                        ' + Object.keys(files.setuptools && files.setuptools.options || {}).length + ' options \
                    ');

                    if ( Object.keys(files.accounts || {}).length === 0 || !files.setuptools ) $('div.secondaryOptions > div').hide();

                    if (
                        typeof files.setuptools === 'object' ||
                        (
                            typeof files.accounts === 'object' &&
                            Object.keys(files.accounts).length > 0
                        )
                    ) {

                        if ( files.accounts && files.setuptools ) $('div.secondaryOptions > div').show();

                        $('.setuptools.link.backups.uploadData').on('click.setuptools.restore.archive', function () {

                            var options = {
                                method: 'upload',
                                backupName: files.meta.name || 'User-Uploaded',
                                saveExisting: $('input[name="restoreSaveExisting"]').prop('checked')
                            };

                            if ( $(this).hasClass('save') || $(this).hasClass('restoreSetupTools') ) {
                                options.data = files.setuptools;
                                if ( !$(this).hasClass('restoreSetupTools') ) options.archive = files;
                            }
                            if ( $(this).hasClass('restoreData') ) {
                                delete files.setuptools;
                                options.archive = files;
                            }
                            setuptools.app.backups.restore(options);

                        });

                    }

                } else {

                    $('div.secondaryOptions > div').hide();
                    $('.setuptools.link.backups.uploadData.save').html('Invalid file');
                    $('.setuptools.app.backups.uploadResults').html('File could not be processed.');

                }

            });

        }

    }

    var DoFiles = false;
    if ( setuptools.config.devForcePoint !== 'backups-upload' && manual !== true && window.File && window.FileReader && window.FileList && window.Blob ) {

        setuptools.tmp.FileReaderCapable = true;
        DoFiles = true;
        setuptools.lightbox.build('backups-upload', ' \
            Please select the backup file you wish to restore. \
            <br><br><input type="file" id="files" name="files[]" class="setuptools app backups uploadFile" style="width: 100%"> \
        ');

        if ( setuptools.state.loaded === true ) {

            setuptools.lightbox.build('backups-upload', ' \
                <br><br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration" style="width: auto;"> Save backup of any existing configuration \
            ');

        }

        setuptools.lightbox.build('backups-upload', ' \
            <br> \
        ');

    } else {

        if ( typeof setuptools.tmp.FileReaderCapable === 'undefined' && manual !== true ) {

            setuptools.lightbox.build('backups-upload', 'File uploads are not supported by your browser. Please instead paste the contents of the backup file below. This can only be used with a SetupTools JSON backup.');

        } else {

            setuptools.lightbox.build('backups-upload', 'Please paste the contents of the backup file below. This can only be used with a SetupTools JSON backup.');

        }

        setuptools.lightbox.build('backups-upload', ' \
            <br><br><div class="setuptools app backups uploadData"><textarea name="uploadData" spellcheck="false" class="setuptools scrollbar"></textarea></div> \
        ');

        if ( setuptools.state.loaded === true ) {

            setuptools.lightbox.build('backups-upload', ' \
                <br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration" style="width: auto;"> Save backup of any existing configuration \
            ');

        }

        setuptools.lightbox.build('backups-upload', ' \
            <br> \
        ');

    }

    setuptools.lightbox.build('backups-upload', ' \
        <div class="flex-container">&nbsp;</div>\
        <div class="flex-container" style="justify-content: space-between;">\
            <div class="setuptools app backups uploadResults mr5">&nbsp;</div> \
            <div class="setuptools link backups uploadData save menuStyle menuSmall textCenter noclose mr0 ml5">Select a File</div> \
        </div>\
        <div class="flex-container secondaryOptions mt10" style="justify-content: flex-end;">\
            <div class="setuptools link backups uploadData restoreSetupTools menuStyle notice menuSmall textCenter ml5 mr0" style="display: none;">Restore SetupTools</div>\
            <div class="setuptools link backups uploadData restoreData menuStyle notice menuSmall textCenter ml5 mr0" style="display: none;">Restore Data Files</div>\
        </div>\
    ');

    if ( DoFiles === false ) {
        if (manual === true) setuptools.lightbox.goback('backups-upload', setuptools.app.backups.upload);
        if (manual !== true) setuptools.lightbox.goback('backups-upload', setuptools.app.backups.index);
    } else setuptools.lightbox.goback('backups-upload', setuptools.app.backups.index);
    setuptools.lightbox.drawhelp('backups-upload', 'docs/setuptools/help/backups-manager/upload', 'Backup Upload Help');
    setuptools.lightbox.settitle('backups-upload', 'Backup Upload');
    setuptools.lightbox.display('backups-upload', {variant: 'fl-BackupUpload'});

    if ( DoFiles === true ) {

        $('.setuptools.bottom.container').append(' \
            <div class="cfright h100" style="margin-top: 3px;"> \
                <br><a href="#" class="setuptools app backups switchToUpload">Switch to Manual Upload</a> \
            </div> \
        ');

        $('.setuptools.app.backups.switchToUpload').click(function() {
            setuptools.app.backups.upload(true);
        });

        $('input[id="files"]').change(function(e) {

            $('.setuptools.link.backups.uploadData.save').html('Loading File...');
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function() {

                if ( reader.error ) {

                    $('.setuptools.link.backups.uploadData.save').html('Upload failed');
                    setuptools.lightbox.error('Failed to upload file with error: ' + reader.error, 23);

                } else {

                    ParseUploadedFile(reader);

                }

            }

        });

    } else {

        $('.setuptools.link.backups.uploadData.save').html('Paste in File');
        $('textarea[name="uploadData"]').change(function() {

            $('.setuptools.link.backups.uploadData.save').html('Loading file...');
            ParseUploadedFile($(this).val());

        })

    }

};

/**
 * @function
 * @param {object} options
 * Restore a SetupTools backup
 */
setuptools.app.backups.restore = function(options) {

    options = $.extend(true, {
        method: undefined,
        backupId: undefined,
        backupName: undefined,
        saveExisting: undefined,
        badEntriesForce: undefined,
        badSaveForce: undefined,
        archive: undefined,
        data: undefined
    }, options);

    if ( options.data && !options.backupId ) {
        options.backupId = JSON.stringify(options.data);
        delete options.data;
    }

    //  if an archive is provided let's read the setuptools data from it
    if (
        options.backupId === undefined &&
        typeof options.archive === 'object' &&
        typeof options.archive.setuptools === 'object'
    ) options.backupId = JSON.stringify(options.archive.setuptools);

    //  this function supports restoring both local and uploaded backups
    if ( options.method === 'local' || options.method === 'upload' ) {

        //  when RestoreMethod is upload, BackupID will contain the data
        var BackupFile = ( options.method === 'local' ) ? setuptools.storage.read(options.backupId) : options.backupId;
        var count = 0;
        var methods = 1;
        if ( BackupFile && options.archive ) methods = 2;

        setuptools.lightbox.drawhelp('backups-restore-confirmed', 'docs/setuptools/help/backups-manager/restore', 'Backup Restoration Help');
        setuptools.lightbox.settitle('backups-restore-confirmed', 'Backup Restore Confirmed');

        //  process setuptools restoration
        if ( BackupFile ) {

            //  does the setuptools backup parse
            var BackupData;
            try {
                BackupData = JSON.parse(BackupFile);
            } catch(e){}

            //  restore setuptools
            if ( BackupData && typeof BackupData === 'object' ) {

                //  does meta data exist, and loosely check if it is valid
                if (
                    typeof BackupData.meta !== 'object' ||
                    (
                        typeof BackupData.meta === 'object' &&
                        typeof BackupData.meta.BackupDate === 'undefined'
                    )
                ) setuptools.lightbox.error('Parsed data is not a valid backup object.', 23);

                //  is the accounts data valid
                var badEntries = [];
                for ( var i in BackupData.accounts.accounts ) {

                    if (BackupData.accounts.accounts.hasOwnProperty(i)) {

                        var username = i;
                        var password = BackupData.accounts.accounts[i].password;

                        //  if either is provided and the other is empty then this is a bad record
                        if ((username === '' || password === '') && !(username === '' && password === '')) {

                            badEntries.push(BackupData.accounts.accounts[i]);
                            delete BackupData.accounts.accounts[i];

                        } else {

                            //  if neither are provided then it can be ignored
                            if (username.length > 0 && password.length > 0) {

                                //  if a username is provided we should validate it's contents a bit
                                if (username.length > 0) {

                                    //  is it an email address, steam, kongregate, or kabam?
                                    if (!username.match(setuptools.config.regex.email) && !username.match(setuptools.config.regex.guid)) {

                                        BackupData.accounts.accounts[i].username = username;
                                        badEntries.push(BackupData.accounts.accounts[i]);
                                        delete BackupData.accounts.accounts[i];

                                    }

                                }

                            }

                        }

                    }

                }

                //  if there were any bad accounts let's confirm once again
                if ( badEntries.length > 0 && options.badEntriesForce !== true ) {

                    setuptools.lightbox.build('backups-restore-confirmed', ' \
                        Warning: There were ' + badEntries.length + ' invalid accounts in your backup. They have been removed. <br><br> \
                        Proceed with restoration? <br><br>\
                        <a href="#" class="setuptools link backups restoreConfirmed menuStyle menuSmall cfleft">Yes, restore</a> \
                        <a href="#" class="setuptools link backups restoreCancelled menuStyle menuSmall negative cfright mr0">Cancel</a> \
                    ');

                    setuptools.lightbox.display('backups-restore-confirmed', {variant: 'fl-BackupRestore'});
                    $('.setuptools.link.backups.restoreCancelled').click(setuptools.app.backups.index);
                    $('.setuptools.link.backups.restoreConfirmed').click(function() {
                        options.badEntriesForce = true;
                        setuptools.app.backups.restore(options);
                    });

                    return;

                }

                //  create a protected backup of the current configuration
                var ExistingBackupObject;
                if ( setuptools.state.loaded === true && options.saveExisting === true ) ExistingBackupObject = setuptools.app.config.backup(true);
                if ( setuptools.state.loaded === true && options.saveExisting === true && ExistingBackupObject.status === false && options.badSaveForce !== true ) {

                    setuptools.lightbox.build('backups-restore-confirmed', ' \
                        Warning: Failed to create a backup of the existing configuration.<br><br> \
                        Proceed with restoration? <br><br>\
                        <div class="setuptools link backups restoreConfirmed menuStyle cfleft">Yes, restore</div> \
                        <div class="setuptools link backups restoreCancelled menuStyle negative cfright">Cancel</div> \
                    ');

                    setuptools.lightbox.display('backups-restore-confirmed', {variant: 'fl-BackupRestore'});
                    $('.setuptools.link.backups.restoreCancelled').click(setuptools.app.backups.index);
                    $('.setuptools.link.backups.restoreConfirmed').click(function() {
                        options.badEntriesForce = true;
                        options.badSaveForce = true;
                        setuptools.app.backups.restore(options);
                    });

                    return;

                }

                //  restore branches of setuptools configuration
                if ( typeof BackupData.options === 'object' ) window.options = BackupData.options;
                if ( typeof BackupData.additional === 'object' ) {

                    if (typeof BackupData.additional.options === 'object') window.options = BackupData.additional.options;

                    if (typeof BackupData.additional.mulequeue === 'object') {

                        $.extend(true, setuptools.app.mulequeue.state, BackupData.additional.mulequeue.state);
                        setuptools.app.mulequeue.history = BackupData.additional.mulequeue.history;

                    }

                }

                //  remove all non-setuptools.data keys
                delete BackupData.meta;
                delete BackupData.options;
                delete BackupData.additional;
                if ( setuptools.state.loaded === true ) BackupData.accounts.meta.version = setuptools.data.accounts.meta.version+1;

                //  update our local data
                setuptools.data = BackupData;
                if ( setuptools.app.config.save('BackupsManager/Restore') === true) {

                    //  save other configs
                    setuptools.storage.write('muledump:options', window.options, true);
                    setuptools.app.mulequeue.task.saveConfig();
                    setuptools.storage.write('mulequeue:history', setuptools.app.mulequeue.history);
                    count++;

                } else {

                    setuptools.lightbox.build('backups-restore-confirmed', 'Failed to save restored configuration.');
                    setuptools.lightbox.display('backups-restore-confirmed');
                    return;

                }

            }

        }
        //  else setuptools.lightbox.error("Failed to read backup data with ID " + options.backupId, 21);

        //  archive backup
        var bytes = 0;
        var restored = 0;
        if ( typeof options.archive === 'object' ) {

            if ( options.archive.accounts && Object.keys(options.archive.accounts).length > 0 ) {

                Object.keys(options.archive.accounts).filter(function(guid) {

                    if ( options.archive.accounts[guid] === null ) return;
                    var data = JSON.stringify(options.archive.accounts[guid]);
                    bytes += data.length;
                    if ( setuptools.storage.write('muledump:' + guid, data, true) === true ) restored++;

                });

            }

            count++;

        }

        if ( count === methods ) {

            //  done
            setuptools.lightbox.build('backups-restore-confirmed', 'Backup ' + options.backupName + ' has been restored. <br><br>This window will reload in a few seconds.');
            setuptools.lightbox.display('backups-restore-confirmed');
            setuptools.tmp.SelectedBackupID = options.backupId;
            setuptools.app.reload();
            return;

        }

        setuptools.lightbox.build('backups-restore-confirmed', 'Backup ' + options.backupName + ' restored no data.');
        setuptools.lightbox.display('backups-restore-confirmed');

    } else setuptools.lightbox.error('Restore method ' + options.method + ' is not a valid option.', 20);

};

/**
 * @function
 * @param {string | undefined} BackupID
 * @param {string} [BackupName]
 * Confirm backup restoration
 */
setuptools.app.backups.restoreConfirm = function(BackupID, BackupName) {

    if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' ) setuptools.lightbox.error('Required arguments BackupID or BackupName are missing.', 19);
    if ( !BackupID.match(setuptools.config.regex.backupId) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

    setuptools.lightbox.build('backups-restore-confirm', ' \
        Are you sure you wish to restore the backup ' + BackupName + '? \
        <br><br>\
            <div class="setuptools link backups restoreConfirmed menuStyle menuSmall cfleft">Yes, restore</div> \
            <div class="setuptools link backups restoreCancelled menuStyle menuSmall negative cfright">Cancel</div> \
    ');

    if ( setuptools.state.loaded === true ) {

        setuptools.lightbox.build('backups-restore-confirm', ' \
            <div class="fleft cboth mt10">\
                <input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
            </div> \
        ');

    }

    setuptools.lightbox.goback('backups-restore-confirm', setuptools.app.backups.index);
    setuptools.lightbox.drawhelp('backups-restore-confirm', 'docs/setuptools/help/backups-manager/restore', 'Backup Restoration Help');
    setuptools.lightbox.settitle('backups-restore-confirm', 'Backup Restore');
    setuptools.lightbox.display('backups-restore-confirm');

    $('.setuptools.link.backups.restoreCancelled').click(setuptools.app.backups.index);
    $('.setuptools.link.backups.restoreConfirmed').click(function() {
        setuptools.app.backups.restore({
            method: 'local',
            backupId: BackupID,
            backupName: BackupName,
            saveExisting: $('input[name="restoreSaveExisting"]').prop("checked")
        });
    });

};

/**
 * @function
 * @param {function} callback
 * Return the latest backup to a callback
 */
setuptools.app.backups.latest = function(callback) {

    var BackupList = setuptools.app.backups.listAll();
    if ( BackupList.length > 0 ) {

        if ( typeof callback === 'function' ) setuptools.lightbox.override('backups-download', 'goback', function() {
            callback();
        });
        BackupList = BackupList[BackupList.length - 1];
        setuptools.app.backups.download(BackupList[1], BackupList[4]);

    } else {

        if ( typeof callback === 'function' ) setuptools.lightbox.override('backups-create', 'goback', function() {
            callback();
        });
        setuptools.app.backups.create();

    }

};

/**
 * @function
 * @param {string | undefined} BackupID
 * @param {string} [BackupName]
 * Delete the specified backup
 */
setuptools.app.backups.delete = function(BackupID, BackupName) {

    if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' ) setuptools.lightbox.error("Required arguments BackupID or BackupName missing.", 17);
    if ( !BackupID.match(setuptools.config.regex.backupId) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

    var BackupData = setuptools.storage.read(BackupID);
    if ( BackupData === false ) {

        setuptools.lightbox.build('backup-delete', 'Specified BackupID ' + BackupID + ' was not located.');

    } else {

        BackupData = JSON.parse(BackupData);
        if ( BackupData && typeof BackupData.meta === 'object' ) {

            //  if the backup isn't protected, delete it
            if ( typeof BackupData.meta.protected === 'undefined' || BackupData.meta.protected === false ) {

                if ( setuptools.storage.delete(BackupID) === true ) {
                    setuptools.lightbox.build('backup-delete', 'Successfully deleted backup ' + BackupName + '.');
                } else setuptools.lightbox.build('backup-delete', 'Failed to delete backup ' + BackupName + '.');

            } else setuptools.lightbox.build('backup-delete', ' \
                Cannot delete backup ' + BackupName + ' because it is protected. <br><br> \
                Go back to the previous page and choose \'Expose\' to enable deletion of this backup. \
            ');

        } else {

            if ( setuptools.storage.delete(BackupID) === true ) {
                setuptools.lightbox.build('backup-delete', 'Invalid backup data located. The object has been removed.');
            } else setuptools.lightbox.build('backup-delete', 'Invalid backup data located and it could not be deleted.');

        }

    }

    setuptools.lightbox.drawhelp('backup-delete', 'docs/setuptools/help/backups-manager/delete', 'Backup Deletion Help');
    setuptools.lightbox.goback('backup-delete', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backup-delete', 'Backup Delete');
    setuptools.lightbox.display('backup-delete');

};

/**
 * @function
 * @param {string | undefined} BackupID
 * @param {string | undefined} [BackupName]
 * @param {boolean} [BackupProtected]
 * Change the protection state of a backup
 */
setuptools.app.backups.protect = function(BackupID, BackupName, BackupProtected) {

    if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' || typeof BackupProtected === 'undefined' ) setuptools.lightbox.error('Required arguments BackupID, BackupName, or protection state are missing.', 15);
    if ( !BackupID.match(setuptools.config.regex.backupId) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

    var BackupData = JSON.parse(setuptools.storage.read(BackupID));
    if ( typeof BackupData === 'object' && BackupData.meta ) {

        //  if this key is missing let's add it with the default value
        if ( typeof BackupData.meta.protected === 'undefined' ) BackupData.meta.protected = false;

        var ProtectionState = ( BackupProtected === true ) ? 'Protected' : 'Exposed';
        if ( BackupData.meta.protected === BackupProtected ) {

            setuptools.lightbox.build('backups-protect', "Protection state is already set to " + ProtectionState + '.');

        } else {

            //  change backup state
            BackupData.meta.protected = BackupProtected;

            //  save changes
            if ( setuptools.storage.write(BackupID, JSON.stringify(BackupData)) === true ) {
                setuptools.lightbox.cancel('backups-protect');
                setuptools.app.backups.index();
                return;
            } else setuptools.lightbox.build('backups-protect', 'Failed to change protection state.');

        }

        setuptools.lightbox.goback('backups-protect', setuptools.app.backups.index);
        setuptools.lightbox.drawhelp('backups-protect', 'docs/setuptools/help/backups-manager/protect', 'Backup Protection Help');
        setuptools.lightbox.settitle('backup-protect', 'Backup Protection');
        setuptools.lightbox.display('backups-protect');

    } else setuptools.lightbox.error("Supplied BackupID was not located.", 16);

};

/**
 * @function
 * @param {string} BackupID
 * @param {string} BackupName
 * @param {string} [BackupFileName]
 * @param {string} [BackupCustomName]
 * Download a backup
 */
setuptools.app.backups.download = function(BackupID, BackupName, BackupFileName, BackupCustomName) {

    if ( !BackupFileName ) BackupFileName = BackupName;
    if ( !BackupID.match(setuptools.config.regex.backupId) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);
    var BackupData = false;
    var ParseError = false;
    try {
        BackupData = JSON.stringify(JSON.parse(setuptools.storage.read(BackupID)), null, 4);
    } catch (e) {}
    if ( !BackupData ) ParseError = true;
    if ( BackupData ) {

        var FileName = ( typeof BackupCustomName === 'string' && BackupCustomName.length > 0 ) ?
            'muledump-' + BackupCustomName :
            BackupFileName;

        setuptools.lightbox.build('backups-download', ' \
            Backup ' + ( (typeof BackupCustomName === 'string' ) ? BackupCustomName : BackupFileName ) + ' is ready for download. \
            <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
            <br><br><a download="' + FileName + '.json" href="data:text/json;base64,' + btoa(BackupData) + '" class="setuptools config download noclose">Download Backup</a> \
        ');

    } else {

        if ( ParseError === true ) {
            setuptools.lightbox.build('backups-download', 'There was a problem decoding the backup from ' + BackupName + '.');
        } else setuptools.lightbox.build('backups-download', 'No backup exists with the name ' + BackupName + '.');

    }

    //  display the download box
    setuptools.lightbox.goback('backups-download', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backups-download', 'Backup Download');
    setuptools.lightbox.display('backups-download');
    if ( BackupData ) {
        setuptools.storage.write('backupAssistant', Date.now());
        setuptools.app.config.downloadAck();
    }

};

/**
 * @function
 * @param {string} page
 * @param {string} BackupID
 * @param {string} BackupDataJSON
 * @param {function} callback
 * @param {boolean} [noclose]
 * @returns {Function}
 * Return a function for generating and binding the backup rename code
 */
setuptools.app.backups.renameHtml = function(page, BackupID, BackupDataJSON, callback, noclose) {

    //  parse the backup data
    var BackupData = JSON.parse(BackupDataJSON);
    if ( !BackupData ) setuptools.lightbox.error('Provided JSON was invalid', 34);

    setuptools.lightbox.build(page, ' \
        <br><br><div class="setuptools app fleft cboth w100"> \
            <input name="BackupCustomName" value="' + ( (typeof BackupData.meta.name === 'string') ? BackupData.meta.name : '' ) + '" placeholder="Custom Backup Name" class="cfleft mr5"> \
            <div class="setuptools link customBackupName formStyle noclose">Set Custom Name</div>\
        </div>\
    ');

    return function() {

        var Process = function(self) {

            var label = self.text();
            var BackupCustomName = $('input[name="BackupCustomName"]').val();
            if ( typeof BackupCustomName !== 'string' || BackupCustomName.length === 0 ) {

                self.html('<span class="Error">Invalid Name!</span>');
                self.find('span').fadeOut(2500, function () {
                    $(this).remove();
                    self.html(label);
                });
                return;

            }

            //  set the name
            BackupData.meta.name = BackupCustomName;
            var BackupDataSON = JSON.stringify(BackupData, null, 4);

            //  update the local storage
            setuptools.storage.write(BackupID, BackupDataSON);

            //  update the download link
            $('a.setuptools.config.download').attr('href', 'data:text/json;base64,' + btoa(BackupDataSON));

            if ( typeof callback === 'function') {

                if ( noclose !== true ) setuptools.lightbox.close();
                callback({BackupCustomName: BackupCustomName});
                if ( noclose !== true ) return;

            }

            self.html('<span class="success nomargin">Saved!</span>');
            self.find('span').fadeOut(2500, function () {
                $(this).remove();
                self.html(label);
            });

        };

        $('input[name="BackupCustomName"]')
            .focus()
            .keyup(function(e) {
                if ( e.keyCode === 13 ) Process($('.setuptools.link.customBackupName'));
            });

        $('.setuptools.link.customBackupName').click(function() {
            Process($(this));
        })

    };

};

/**
 * @function
 * @param {string | array | function | boolean} [guids]
 * @param {function} [callback]
 * Create a backup archive that includes the SetupTools backup and account data cache
 */
setuptools.app.backups.archive.create = function(guids, callback) {

    var scope = false;
    if ( guids === true ) {

        scope = true;
        guids = undefined;

    }

    if ( typeof guids === 'function' ) {
        callback = guids;
        guids = undefined;
    }

    if ( typeof guids === 'undefined' ) guids = Object.keys(scope && setuptools.data.accounts && setuptools.data.accounts.accounts || window.accounts);
    if ( typeof guids === 'string' ) guids = [guids];
    if ( !Array.isArray(guids) ) return;

    //  initiate our zip file
    var zip = new JSZip();

    //  store setuptools config backup
    var backup = {BackupName: 'muledump-archive'};
    if ( setuptools.state.loaded === true ) {

        backup = setuptools.app.config.backup();
        zip.file('setuptools.json', backup.BackupData);

    }

    //  grab account data and insert files
    guids.filter(function(guid) {

        var data = JSON.stringify(JSON.parse(setuptools.storage.read('muledump:' + guid, true)), null, 5);
        if ( typeof data !== 'string' || data.length === 0 ) return;
        zip.file('accounts/' + guid.replace(':', '----') + '.json', data);

    });

    //  generate archive metadata
    zip.file('meta.json', JSON.stringify({
        format: 1,
        timestamp: (new Date).toISOString()
    }, null, 5));

    //  generate and serve the file
    zip.generateAsync({
        type:"blob",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    }).then(function(content) {
        if ( typeof callback === 'function' ) {
            callback(content, backup.BackupName);
            return;
        }
        saveAs(content, backup.BackupName + ".zip");
    });

};

/**
 * @function
 * @param {string} content
 * @param {function} callback
 * Reads a zip file and returns its contents
 */
setuptools.app.backups.archive.read = function(content, callback) {

    if ( typeof callback !== 'function' ) return;
    var zip = new JSZip();
    zip.loadAsync(content).then(function(zip) {

        if ( !(zip instanceof JSZip) ) {
            callback();
            return;
        }

        var files = {};
        var count = 0;
        var expect = Object.keys(zip.files).length;
        var start = Date.now();
        Object.keys(zip.files).filter(function(filename) {

            var matches = filename.match(/^(?:([a-z0-9]*)\/)?(.*?)\.json$/);
            if ( matches === null ) {
                count++;
                return;
            }
            if ( matches[1] && !files[matches[1]] ) files[matches[1]] = {};
            zip.file(filename).async("string").then(function(string) {
                count++;
                try {

                    if (matches[1]) {
                        files[matches[1]][matches[2].replace('----', ':')] = JSON.parse(string);
                    } else files[matches[2]] = JSON.parse(string);

                } catch(e) {}
            });

        });

        //  we need to wait for multiple promises to fulfill
        var interval = setInterval(function() {
            if ( expect === count || (Date.now()-start > 5000) ) {
                clearInterval(interval);
                callback(files);
            }
        },50);

    });

};

/**
 * @function
 * @param {boolean} [silent]
 * Create a backup
 */
setuptools.app.backups.create = function(silent) {

    var BackupObject = setuptools.app.config.backup();

    if ( BackupObject.status === false ) setuptools.lightbox.build('backups-create', '<span class="setuptools error">Warning</span>: Failed to save backup to browser storage.<br>&nbsp;<br>');

    setuptools.lightbox.build('backups-create', ' \
        Backup has been created with name ' + BackupObject.BackupName + '. \
        <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
    ');

    var backupRenameBind = setuptools.app.backups.renameHtml(
        'backups-create',
        BackupObject.BackupID,
        BackupObject.BackupData,
        function(BackupObject) {
            $('a.setuptools.config.download').attr('download', 'muledump-' + BackupObject.BackupCustomName + '.json');
        },
        true
    );

    setuptools.lightbox.build('backups-create', ' \
        <div class="cfleft">\
            <br><a download="' + BackupObject.BackupName + '.json" href="data:text/json;base64,' + btoa(BackupObject.BackupData) + '" class="setuptools config download noclose">Download Backup</a>\
        </div>\
    ');

    //  display the download box
    if ( setuptools.state.firsttime === true ) setuptools.lightbox.build('backups-create', '<br><br>Welcome to Jakcodex/Muledump :)<br><br>Once ready you must <a href="#" class="setuptools link reload noclose">reload</a> Muledump.');
    if ( setuptools.state.firsttime === false ) setuptools.lightbox.goback('backups-create', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backups-create', 'Backup Create');
    setuptools.lightbox.display('backups-create', {variant: 'fl-BackupsModify'});
    setuptools.app.config.downloadAck();
    setuptools.tmp.SelectedBackupID = BackupObject.BackupID;
    if ( setuptools.state.firsttime === true ) $('.setuptools.link.reload').click(function() { location.reload(); });
    setuptools.storage.write('backupAssistant', Date.now());
    backupRenameBind();

};

/**
 * @function
 * @returns {Array}
 * List all available backups
 */
setuptools.app.backups.listAll = function() {

    //  find all backups in local storage
    var backups = [];
    for ( var i in localStorage ) {
        if ( localStorage.hasOwnProperty(i) ) {
            if ( matches = i.match(setuptools.config.regex.backupKey) ) {
                var date = new Date(Number(matches[2]));
                var BackupName = date.getFullYear() + '-' +
                    ('0' + (Number(date.getMonth())+1)).slice(-2) + '-' +
                    ('0' + date.getDate()).slice(-2) + ' at ' +
                    ('0' + date.getHours()).slice(-2) + ':' +
                    ('0' + date.getMinutes()).slice(-2) + ':' +
                    ('0' + date.getSeconds()).slice(-2);
                var BackupFileName = "muledump-backup-" +
                    date.getFullYear() +
                    ('0' + (Number(date.getMonth())+1)).slice(-2) +
                    ('0' + date.getDate()).slice(-2) + '-' +
                    ('0' + date.getHours()).slice(-2) +
                    ('0' + date.getMinutes()).slice(-2) +
                    ('0' + date.getSeconds()).slice(-2);
                backups.push([matches[0], matches[1], matches[2], BackupName, BackupFileName]);

            }
        }
    }

    //  now sort them by date in descending order
    backups.sort(function(a, b) {
        return (a[2] - b[2]);
    });

    return backups;

};

/**
 * @function
 * Cleanup config backups by enforcing the maximumBackupCount setting
 */
setuptools.app.backups.cleanup = function() {

    var backups = setuptools.app.backups.listAll();

    var Candidates = [];
    var Protected = [];
    for ( i = backups.length-1; i >= 0; i-- )
        if ( backups.hasOwnProperty(i) ) {

            var BackupData = JSON.parse(setuptools.storage.read(backups[i][1]));
            if (typeof BackupData.meta.protected === 'undefined' || BackupData.meta.protected === false ) Candidates.push(backups[i]);
            if ( BackupData.meta.protected === true && BackupData.meta.auto === true ) Protected.push(backups[i]);

        }

    //  if backup length exceeds the maximum then let's clean up
    if ( Candidates.length > setuptools.data.config.maximumBackupCount ) {
        window.techlog("SetupTools/Backups Cleaning up " + (Candidates.length-setuptools.data.config.maximumBackupCount) + " backups", 'force');
        for ( var i = setuptools.data.config.maximumBackupCount; i < Candidates.length; i++ ) {
            window.techlog("SetupTools/Backups Deleting " + Candidates[i][1], 'force');
            setuptools.storage.delete(Candidates[i][1]);
        }
    }

    //  protected auto backups need to be kept clean too
    if ( Protected.length > setuptools.data.config.maximumBackupCount ) {
        window.techlog("SetupTools/Backups Cleaning up " + (Protected.length-setuptools.data.config.maximumBackupCount) + " backups", 'force');
        for ( var i = setuptools.data.config.maximumBackupCount; i < Protected.length; i++ ) {
            window.techlog("SetupTools/Backups Deleting " + Protected[i][1], 'force');
            setuptools.storage.delete(Protected[i][1]);
        }
    }

};
