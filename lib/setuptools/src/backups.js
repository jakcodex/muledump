//  backups management menu
setuptools.app.backups.index = function() {

    setuptools.lightbox.build('backups-index', ' \
        <h3>Available Actions</h3> \
    ');

    //  display a varying menu based on if setuptools is loaded or not
    if ( setuptools.state.loaded === true ) {

        //  for another time - <a href="#" class="setuptools app backups createdeep">Deep Backup</a> | \
        setuptools.lightbox.build('backups-index', ' \
            <a href="#" class="setuptools app backups create">Create New Backup</a> | \
            <a href="#" class="setuptools app backups autobackups noclose">' + ( (setuptools.data.config.automaticBackups === true) ? 'Disable' : 'Enable' ) + ' Auto Backups</a> | \
        ');

    }

    //  when setuptools is not loaded the user will only have the ability to restore backups
    setuptools.lightbox.build('backups-index', ' \
        <a href="#" class="setuptools app backups upload">Upload Backup</a> <br><br> \
    ');

    setuptools.lightbox.build('backups-index', ' \
        <div class="setuptools app backups container"> \
            <div class="setuptools app backups options"> \
    ');

    var BackupList = setuptools.app.backups.listAll();

    if ( BackupList.length === 0 ) {

        setuptools.lightbox.build('backups-index', ' \
                    <div><strong>No stored backups located.</strong></div> \
                </div>\
            </div>\
        ');

    } else {

        setuptools.lightbox.build('backups-index', ' \
            <div><strong>Stored Backups</strong></div> \
            <select name="BackupName" class="setting">\
        ');

        for ( i = BackupList.length-1; i >= 0; i-- )
            if ( BackupList.hasOwnProperty(i) )
                setuptools.lightbox.build('backups-index', ' \
                    <option value="' + BackupList[i][1] + '" data-filename="' + BackupList[i][4] + '" ' + ( (BackupList[i][1] === setuptools.tmp.SelectedBackupID) ? 'selected' : '' ) + '>' + BackupList[i][3] + '</option>\
                ');

        setuptools.lightbox.build('backups-index', ' \
                </select> \
                </div> \
            </div> \
            <div class="setuptools app backups container" style="float: right;"> \
                <br>\
                <div style="margin-right: 5px;"> \
                    <a href="#" class="setuptools app backups download" title="Download Backup">Download</a> | \
                    <a href="#" class="setuptools app backups restore" title="Restore Backup">Restore</a> | \
                    <a href="#" class="setuptools app backups protect" title="">&nbsp;</a> | \
                    <a href="#" class="setuptools app backups delete" title="Delete Backup">Delete</a> \
                </div> \
            </div> \
        ');

    }

    setuptools.lightbox.settitle('backups-index', 'Muledump Backup Manager');
    setuptools.lightbox.goback('backups-index', setuptools.app.index);
    setuptools.lightbox.drawhelp('backups-index', 'docs/setuptools/help/backups-manager/backups', 'Backup Manager Help');
    setuptools.lightbox.display('backups-index');

    //  jquery bindings
    $('.setuptools.app.backups.upload').click(setuptools.app.backups.upload);

    //  create and autoBackups only work for loaded users
    if ( setuptools.state.loaded === true ) {

        //  these don't require any special arguments
        $('.setuptools.app.backups.create').click(setuptools.app.backups.create);
        $('.setuptools.app.backups.autobackups').click(function() {

            setuptools.data.config.automaticBackups = ( setuptools.data.config.automaticBackups !== true );
            if ( setuptools.app.config.save() === true ) {

                $(this).text((setuptools.data.config.automaticBackups === true) ? 'Disable Auto Backups' : 'Enable Auto Backups');

            } else $(this).text('Error saving settings!').unbind('click');


        });
        //  another time - $('.setuptools.app.backups.createdeep').click(setuptools.app.backups.createDeep);

    }

    //  bind restore click
    $('.setuptools.app.backups.restore').click(function() {
        var BackupID = $('select[name="BackupName"]').val();
        var BackupName = $('select[name="BackupName"] option:selected').text();
        setuptools.app.backups.restoreConfirm(BackupID, BackupName);
    });

    //  bind download click
    $('.setuptools.app.backups.download').click(function() {
        var BackupID = $('select[name="BackupName"]').val();
        var BackupName = $('select[name="BackupName"] option:selected').text();
        var BackupFileName = $('select[name="BackupName"] option:selected').attr('data-filename');
        setuptools.app.backups.download(BackupID, BackupName, BackupFileName);
    });

    //  deletion option
    function bindDelete() {

        $('.setuptools.app.backups.delete').unbind('click');
        $('.setuptools.app.backups.delete').click(function() {
            var SelectedBackupID = $('select[name="BackupName"] option:selected').val();
            var SelectedBackupName = $('select[name="BackupName"] option:selected').text();
            setuptools.app.backups.delete(SelectedBackupID, SelectedBackupName);
        });

    }

    //  protection options
    function updateProtection() {

        var SelectedBackupID = $('select[name="BackupName"] option:selected').val();
        var SelectedBackupName = $('select[name="BackupName"] option:selected').text();
        var SelectedBackupData = JSON.parse(setuptools.storage.read(SelectedBackupID));
        setuptools.tmp.SelectedBackupID = SelectedBackupID;
        $('.setuptools.app.backups.protect').unbind('click');

        if ( typeof SelectedBackupData === 'object' && SelectedBackupData.meta ) {

            var protectButton = $('.setuptools.app.backups.protect');
            if ( typeof SelectedBackupData.meta.protected === 'undefined' ) SelectedBackupData.meta.protected = false;
            if ( SelectedBackupData.meta.protected === false ) {

                $('.setuptools.app.backups.delete').removeClass('deleteDisabled').attr('title', 'Delete Backup');
                bindDelete();

                protectButton.text('Protect').attr('title', 'Enable Backup Protection');
                protectButton.click(function() { setuptools.app.backups.protect(SelectedBackupID, SelectedBackupName, true); });

            } else {

                $('.setuptools.app.backups.delete').addClass('deleteDisabled')
                    .unbind('click')
                    .addClass('noclose')
                    .attr('title', 'Protected Backup - Expose First');

                protectButton.text('Expose').attr('title', 'Disable Backup Protection');
                protectButton.click(function() { setuptools.app.backups.protect(SelectedBackupID, SelectedBackupName, false); });

            }

        } else {

            $('.setuptools.app.backups.protect').text('Examine').attr('title', 'Problem detected with backup');
            $('.setuptools.app.backups.protect').click(function() { setuptools.app.backups.examine(SelectedBackupID); });

        }

    }

    if ( BackupList.length > 0 ) updateProtection();
    $('select[name="BackupName"]').change(updateProtection);

};

//  perform automatic backups
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

            setuptools.app.config.backup(false, true);
            window.techlog('setuptools.app.backups.auto - created automatic backup', 'force');

        }

    }

};

//  process a user-provided upload
setuptools.app.backups.upload = function(manual) {

    function ParseUploadedFile(FileContents) {

        //  ready for final click
        var UploadFileJSON = false;
        try {
            UploadFileJSON = JSON.parse(FileContents);
        } catch(e) {}

        if (typeof UploadFileJSON === 'object' && UploadFileJSON.meta) {

            $('.setuptools.app.backups.uploadData.save').html('Restore Backup').removeClass('noclose').click(function () {

                setuptools.app.backups.restore('upload', FileContents, 'User-Uploaded', $('input[name="restoreSaveExisting"]').prop('checked'), true, true);

            });

            $('.setuptools.app.backups.uploadResults').html(' \
                <br>Found ' + Object.keys(UploadFileJSON.accounts.accounts).length + ' accounts, \
                ' + Object.keys(UploadFileJSON.config).length + ' settings, and \
                ' + Object.keys(UploadFileJSON.options).length + ' options \
            ');

        } else {

            $('.setuptools.app.backups.uploadData.save').html('Invalid file');
            $('.setuptools.app.backups.uploadResults').html('File could not be processed.');

        }

    }

    var DoFiles = false;
    if ( setuptools.config.devForcePoint != 'backups-upload' && manual !== true && window.File && window.FileReader && window.FileList && window.Blob ) {

        setuptools.tmp.FileReaderCapable = true;
        DoFiles = true;
        setuptools.lightbox.build('backups-upload', ' \
            Please select the backup file you wish to restore. \
            <br><br><input type="file" id="files" name="files[]" class="setuptools app backups uploadFile" style="width: 475px;"> \
        ');

        if ( setuptools.state.loaded === true ) {

            setuptools.lightbox.build('backups-upload', ' \
                <br><br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
            ');

        }

        setuptools.lightbox.build('backups-upload', ' \
            <br> \
        ');

    } else {

        if ( typeof setuptools.tmp.FileReaderCapable === 'undefined' && manual !== true ) {

            setuptools.lightbox.build('backups-upload', 'File uploads are not supported by your browser. Please instead paste the contents of the backup file below.');

        } else {

            setuptools.lightbox.build('backups-upload', 'Please paste the contents of the backup file below.');

        }

        setuptools.lightbox.build('backups-upload', ' \
            <br><br><div class="setuptools app backups uploadData"><textarea name="uploadData" spellcheck="false" class="setuptools scrollbar"></textarea></div> \
        ');

        if ( setuptools.state.loaded === true ) {

            setuptools.lightbox.build('backups-upload', ' \
                <br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
            ');

        }

        setuptools.lightbox.build('backups-upload', ' \
            <br> \
        ');

    }

    setuptools.lightbox.build('backups-upload', ' \
        <div class="setuptools app backups uploadResults" style="margin-top: 6px; margin-bottom: 6px; float: left;"></div> \
        <br><a href="#" class="setuptools app backups uploadData save noclose" style="font-size: 14px; font-weight: bold;">Select a File</a> \
    ');

    if ( DoFiles === false ) {
        if (manual === true) setuptools.lightbox.goback('backups-upload', setuptools.app.backups.upload);
        if (manual !== true) setuptools.lightbox.goback('backups-upload', setuptools.app.backups.index);
    } else setuptools.lightbox.goback('backups-upload', setuptools.app.backups.index);
    setuptools.lightbox.drawhelp('backups-upload', 'docs/setuptools/help/backups-manager/upload', 'Backup Upload Help');
    setuptools.lightbox.settitle('backups-upload', 'Muledump Backup Upload');
    setuptools.lightbox.display('backups-upload', {variant: 'setuptools-large'});

    if ( DoFiles === true ) {

        $('.setuptools.bottom.container').append(' \
            <div style="clear: right; float: right; height: 100%; margin-top: 3px; margin-right: 5px;"> \
                <br><a href="#" class="setuptools app backups switchToUpload">Switch to Manual Upload</a> \
            </div> \
        ');

        $('.setuptools.app.backups.switchToUpload').click(function() {
            setuptools.app.backups.upload(true);
        });

        $('input[id="files"]').change(function(e) {

            $('.setuptools.app.backups.uploadData.save').html('Loading File...');
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {

                if ( reader.error ) {

                    $('.setuptools.app.backups.uploadData.save').html('Upload failed');
                    setuptools.lightbox.error('Failed to upload file with error: ' + reader.error, 23);

                } else {

                    ParseUploadedFile(reader.result);

                }

            }

        });

    } else {

        $('.setuptools.app.backups.uploadData.save').html('Paste in File');
        $('textarea[name="uploadData"]').change(function() {

            $('.setuptools.app.backups.uploadData.save').html('Loading file...');
            ParseUploadedFile($(this).val());

        })

    }

};

//  restore a backup
setuptools.app.backups.restore = function(RestoreMethod, BackupID, BackupName, SaveExisting, BadEntriesForce, BadSaveForce) {

    //  this function supports restoring both local and uploaded backups
    if ( RestoreMethod === 'local' || RestoreMethod === 'upload' ) {

        if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' ) setuptools.lightbox.error('Required arguments BackupID or BackupName are missing.', 19);
        if ( RestoreMethod === 'local' && !BackupID.match(setuptools.config.regex.backupId) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

        //  when RestoreMethod is upload, BackupID will contain the data
        var BackupFile = ( RestoreMethod === 'local' ) ? setuptools.storage.read(BackupID) : BackupID;

        if ( BackupFile ) {

            //  does it parse
            var BackupData;
            if ( BackupData = JSON.parse(BackupFile) ) {

                //  does meta data exist, and loosely check if it is valid
                if ( typeof BackupData.meta != 'object' || (typeof BackupData.meta === 'object' && typeof BackupData.meta.BackupDate === 'undefined') )
                    setuptools.lightbox.error('Parsed data is not a valid backup object.', 23);

                setuptools.lightbox.drawhelp('backups-restore-confirmed', 'docs/setuptools/help/backups-manager/restore', 'Backup Restoration Help');
                setuptools.lightbox.settitle('backups-restore-confirmed', 'Muledump Backup Manager');

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
                if ( badEntries.length > 0 && BadEntriesForce !== true ) {

                    setuptools.lightbox.build('backups-restore-confirmed', ' \
                        Warning: There were ' + badEntries.length + ' invalid accounts in your backup. They have been removed. <br><br> \
                        Proceed with restoration? <br><br>\
                        <a href="#" class="setuptools app backups restoreConfirmed">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
                    ');

                    setuptools.lightbox.display('backups-restore-confirmed');
                    $('.setuptools.app.backups.restoreCancelled').click(setuptools.app.backups.index);
                    $('.setuptools.app.backups.restoreConfirmed').click(function() {
                        setuptools.app.backups.restore(RestoreMethod, BackupID, BackupName, SaveExisting, true, true);
                    });

                } else {

                    //  create a protected backup of the current configuration
                    if ( setuptools.state.loaded === true && SaveExisting === true ) ExistingBackupObject = setuptools.app.config.backup(true);
                    if ( setuptools.state.loaded === true && SaveExisting === true && ExistingBackupObject.status === false && BadSaveForce !== true ) {

                        setuptools.lightbox.build('backups-restore-confirmed', ' \
                            Warning: Failed to create a backup of the existing configuration.<br><br> \
                            Proceed with restoration? <br><br>\
                            <a href="#" class="setuptools app backups restoreConfirmed">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
                        ');

                        setuptools.lightbox.display('backups-restore-confirmed');
                        $('.setuptools.app.backups.restoreCancelled').click(setuptools.app.backups.index);
                        $('.setuptools.app.backups.restoreConfirmed').click(function() {
                            setuptools.app.backups.restore(RestoreMethod, BackupID, BackupName, SaveExisting, true, true, true);
                        });

                    } else {

                        //  remove the metadata set options and version number
                        window.options = BackupData.options;
                        delete BackupData.meta;
                        if ( setuptools.state.loaded === true ) BackupData.accounts.meta.version = setuptools.data.accounts.meta.version+1;

                        //  update our local data
                        setuptools.data = BackupData;
                        if ( setuptools.app.config.save() === true) {

                            //  update options storage
                            setuptools.storage.write('muledump:options', JSON.stringify(BackupData.options), true);

                            //  done
                            setuptools.lightbox.build('backups-restore-confirmed', 'Backup ' + BackupName + ' has been restored. <br><br>This window will reload in a few seconds.');
                            setuptools.lightbox.display('backups-restore-confirmed');
                            setuptools.tmp.SelectedBackupID = BackupID;

                            setTimeout(function () {
                                location.reload();
                            }, 3000);

                        } else {

                            setuptools.lightbox.build('backups-restore-confirmed', 'Failed to save restored configuration.');
                            setuptools.lightbox.display('backups-restore-confirmed');

                        }


                    }

                }

            } else setuptools.lightbox.error("Failed to parse backup data.", 22);

        } else setuptools.lightbox.error("Failed to read backup data with ID " + BackupID, 21);

    } else setuptools.lightbox.error('Restore method ' + RestoreMethod + ' is not a valid option.', 20);

};

//  confirm backup restoration
setuptools.app.backups.restoreConfirm = function(BackupID, BackupName) {

    if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' ) setuptools.lightbox.error('Required arguments BackupID or BackupName are missing.', 19);
    if ( !BackupID.match(setuptools.config.regex.backupId) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

    setuptools.lightbox.build('backups-restore-confirm', ' \
        Are you sure you wish to restore the backup ' + BackupName + '? \
        <br><br><a href="#" class="setuptools app backups restoreConfirmed" style="transform: ">Yes, restore</a> or <a href="#" class="setuptools app backups restoreCancelled">Cancel</a> \
    ');

    if ( setuptools.state.loaded === true ) {

        setuptools.lightbox.build('backups-restore-confirm', ' \
            <br><br><input type="checkbox" name="restoreSaveExisting" checked title="Save Backup of Existing Configuration"> Save backup of any existing configuration \
        ');

    }

    setuptools.lightbox.build('backups-restore-confirm', ' \
        <br> \
    ');

    setuptools.lightbox.goback('backups-restore-confirm', setuptools.app.backups.index);
    setuptools.lightbox.drawhelp('backups-restore-confirm', 'docs/setuptools/help/backups-manager/restore', 'Backup Restoration Help');
    setuptools.lightbox.settitle('backups-restore-confirm', 'Muledump Backup Manager');
    setuptools.lightbox.display('backups-restore-confirm');

    $('.setuptools.app.backups.restoreCancelled').click(setuptools.app.backups.index);
    $('.setuptools.app.backups.restoreConfirmed').click(function() {
        setuptools.app.backups.restore('local', BackupID, BackupName, $('input[name="restoreSaveExisting"]').prop("checked"));
    });

};

//  delete the specified backup
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
    setuptools.lightbox.settitle('backup-delete', 'Muledump Backup Manager');
    setuptools.lightbox.display('backup-delete');

};

//  change the protection state of a backup
setuptools.app.backups.protect = function(BackupID, BackupName, BackupProtected) {

    if ( typeof BackupID === 'undefined' || typeof BackupName === 'undefined' || typeof BackupProtected === 'undefined' ) setuptools.lightbox.error('Required arguments BackupID, BackupName, or protection state are missing.', 15);
    if ( !BackupID.match(setuptools.config.regex.backupId) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);

    var BackupData = JSON.parse(setuptools.storage.read(BackupID));
    if ( typeof BackupData === 'object' && BackupData.meta ) {

        //  if this key is missing let's add it with the default value
        if ( typeof BackupData.meta.protected === 'undefined' ) BackupData.meta.protected = false;

        ProtectionState = ( BackupProtected === true ) ? 'Protected' : 'Exposed';
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
        setuptools.lightbox.settitle('backup-protect', 'Muledump Backup Manager');
        setuptools.lightbox.display('backups-protect');

    } else setuptools.lightbox.error("Supplied BackupID was not located.", 16);

};

//  download a backup
setuptools.app.backups.download = function(BackupID, BackupName, BackupFileName) {

    if ( !BackupID.match(setuptools.config.regex.backupId) ) setuptools.lightbox.error("BackupID was tainted with an unrelated key name", 18);
    var BackupData = false;
    var ParseError = false;
    try {
        BackupData = JSON.stringify(JSON.parse(setuptools.storage.read(BackupID)), null, 4);
    } catch (e) {}
    if ( !BackupData ) ParseError = true;
    if ( BackupData ) {

        setuptools.lightbox.build('backups-download', ' \
            Backup ' + BackupFileName + ' is ready for download. \
            <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
            <br><br><a download="' + BackupFileName + '.json" href="data:text/json;base64,' + btoa(BackupData) + '" class="setuptools config download noclose">Download Backup</a> \
        ');

    } else {

        if ( ParseError === true ) {
            setuptools.lightbox.build('backups-download', 'There was a problem decoding the backup from ' + BackupName + '.');
        } else setuptools.lightbox.build('backups-download', 'No backup exists with the name ' + BackupName + '.');

    }

    //  display the download box
    setuptools.lightbox.goback('backups-download', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backups-download', 'Muledump Backup Manager');
    setuptools.lightbox.display('backups-download');
    if ( BackupData ) setuptools.app.config.downloadAck();

};

//  create a backup
setuptools.app.backups.create = function(silent) {

    var BackupObject = setuptools.app.config.backup();

    if ( BackupObject.status === false ) setuptools.lightbox.build('backups-createbackup-', '<br><br><span class="setuptools error">Warning</span>: Failed to save backup to browser storage');

    setuptools.lightbox.build('backups-create', ' \
        Backup has been created with name ' + BackupObject.BackupName + '. \
        <br><br><span class="setuptools config download acknowledge">Right click and choose \'Save link as...\' to download.</span> \
        <br><br><a download="' + BackupObject.BackupName + '.json" href="data:text/json;base64,' + btoa(BackupObject.BackupData) + '" class="setuptools config download noclose">Download Backup</a> \
    ');

    //  display the download box
    if ( setuptools.state.firsttime === true ) setuptools.lightbox.build('backups-create', '<br><br>Welcome to Jakcodex/Muledump :)<br><br>Once ready you must <a href="#" class="setuptools link reload noclose">reload</a> Muledump.');
    if ( setuptools.state.firsttime === false ) setuptools.lightbox.goback('backups-create', setuptools.app.backups.index);
    setuptools.lightbox.settitle('backups-create', 'Muledump Backup Manager');
    setuptools.lightbox.display('backups-create');
    setuptools.app.config.downloadAck();
    setuptools.tmp.SelectedBackupID = BackupObject.BackupID;
    if ( setuptools.state.firsttime === true ) $('.setuptools.link.reload').click(function() { location.reload(); });

};

//  list all available backups
setuptools.app.backups.listAll = function() {

    //  find all backups in local storage
    var backups = [];
    for ( var i in localStorage ) {
        if ( localStorage.hasOwnProperty(i) ) {
            regex = new RegExp('^' + setuptools.config.keyPrefix + '(muledump-backup-([0-9]*))$');
            if ( matches = i.match(regex) ) {
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

//  cleanup config backups by enforcing the maximumBackupCount setting
setuptools.app.backups.cleanup = function() {

    var backups = setuptools.app.backups.listAll();

    var Candidates = [];
    for ( i = backups.length-1; i >= 0; i-- )
        if ( backups.hasOwnProperty(i) ) {

            var BackupData = JSON.parse(setuptools.storage.read(backups[i][1]));
            if (typeof BackupData.meta.protected === 'undefined' || BackupData.meta.protected === false ) Candidates.push(backups[i]);

        }

    //  if backup length exceeds the maximum then let's clean up
    if ( Candidates.length > setuptools.data.config.maximumBackupCount ) {
        window.techlog("SetupTools/Backups Cleaning up " + (Candidates.length-setuptools.data.config.maximumBackupCount) + " backups", 'force');
        for ( var i = setuptools.data.config.maximumBackupCount; i < Candidates.length; i++ ) {
            window.techlog("SetupTools/Backups Deleting " + Candidates[i][1], 'force');
            setuptools.storage.delete(Candidates[i][1]);
        }
    }

};
