/*/ concepts
//
//  Mules should be returned to their original state with most of the MuleQueue code stripped from them.
//  If Mule.query() is called, it should always run its intended task instead of enforcing the queue upon itself.
//
//  On startup, a Mule will go through several steps taking one of multiple possible paths.
//  The first order of business is to display the Mule as soon as possible. If there is data cache available for the Mule, it should be rendered.
//  The second order of business is to check for cache freshness and send the request to the reload queue if necessary.
//
//  While the queue is running, it should be possible to add to, rearrange, and modify the queue as desired.
//  It should also be possible for an instant reload request to be sent (completely bypassing MuleQueue).
//
//  Calling queue on a GUID will push it to the queue with any supplied config. This does not actually run the request.
//  Calling queue multiple times on a GUID in the queue will result in the task configuration being updated if it isn't already running.
//  All queue items are processed by the MuleQueue background task. This task runs inside a timer generally every second and checks the queue for new object.
//  The background task will run up to mqConcurrent queue tasks at the same time until the queue is finished.
/*/

//  define this block
setuptools.app.mulequeue = {
    task: {},               //  task methods
    ui: {},                 //  ui-related methods
    state: {
        active: false,                          //  whether or not the background task is actively doing something
        running: false,                         //  whether or not a queue or task is running
        paused: false,                          //  whether or not a queue is paused
        busy: 0,                                //  number of running tasks (caps at mqConcurrent)
        bgTask: undefined,                      //  interval reference for background task
        bgPing: false,                          //  last ping from the background task at its start
        bgHealth: false,                        //  health state of background task
        rateLimited: false,                     //  whether or not we are rate limited (Date.now() of rate limit detection)
        lastTaskFinished: new Date(2017, 0, 1), //  most recently finished tasks's timestamp
        queuePeak: 0,                           //  maximum size seen of a running queue
    },
    queue: [],              //  list of guids in queue (corresponds to tasks)
    tasks: {},              //  task configuration data
    history: [],            //  history of queue tasks
};

//  initialize mulequeue
setuptools.app.mulequeue.main = function() {

    //  some config sanity
    if ( $.isNumeric(setuptools.data.config.mqConcurrent) === false || setuptools.data.config.mqConcurrent > 30 ) setuptools.data.config.mqConcurrent = 1;

    //  check if we're already rate limited
    setuptools.app.mulequeue.state.rateLimitExpiration = setuptools.storage.read('ratelimitexpiration');
    if ( setuptools.app.mulequeue.state.rateLimitExpiration > new Date ) setuptools.app.mulequeue.task.rateLimit(true);

    //  start the background task
    setuptools.app.mulequeue.task.background();

    //  start the background task health checker
    setInterval(setuptools.app.mulequeue.task.bgHealth, setuptools.config.mqBGHealthDelay);

};

/*/
// mulequeue background tasks
/*/

//  background tasks health checker
setuptools.app.mulequeue.task.bgHealth = function() {

    //  check how long it has been since the background task last ran
    if ( (setuptools.app.mulequeue.state.rateLimited === false && setuptools.app.mulequeue.state.paused === false) && new Date > (Number(setuptools.app.mulequeue.state.bgPing)+(setuptools.data.config.mqBGTimeout*1000)) ) {

        window.techlog('MuleQueue/bgHealth starting background task', 'force');
        setuptools.app.mulequeue.state.active = false;
        setuptools.app.mulequeue.state.bgHealth = false;
        clearInterval(setuptools.app.mulequeue.state.bgTask);
        setuptools.app.mulequeue.state.bgTask = undefined;
        setuptools.app.mulequeue.task.background();

    }

};

//  update the background health state
setuptools.app.mulequeue.task.ping = function() {

    setuptools.app.mulequeue.state.bgPing = new Date;
    setuptools.app.mulequeue.state.bgHealth = true;

};

//  create a task promise and run the task
setuptools.app.mulequeue.task.createPromise = function(guid) {

    return new Promise(function (MuleQueue) {

        var task = setuptools.app.mulequeue.tasks[guid];
        window.techlog('MuleQueue/TaskStart - ' + guid, 'force');
        mules[guid].query(task.ignore_cache, task.cache_only, false, MuleQueue);

    });

};

//  background tasks processes queue items
setuptools.app.mulequeue.task.background = function() {

    //  start the background task if it isn't already running
    if ( !setuptools.app.mulequeue.state.bgTask ) {

        setuptools.app.mulequeue.state.bgTask = setInterval(
            setuptools.app.mulequeue.task.background,
            (setuptools.config.mqBGDelay*1000)
        );

    }

    //  don't run if background task is already active or paused
    if ( setuptools.app.mulequeue.state.active === true ) return;

    //  ping
    setuptools.app.mulequeue.task.ping();

    //  check if the queue is paused
    if ( setuptools.app.mulequeue.state.paused === true ) return;

    //  check for rate limiting
    if ( setuptools.app.mulequeue.state.rateLimited === true ) return;

    //  check for queue items
    if (
        setuptools.app.mulequeue.state.rateLimited === false &&
        setuptools.app.mulequeue.queue.length > 0 &&
        setuptools.app.mulequeue.state.busy < setuptools.data.config.mqConcurrent &&
        setuptools.app.mulequeue.state.busy < setuptools.app.mulequeue.queue.length
    ) {

        $('#mulequeue').addClass('running');

        //  log queue size if larger than peak
        if ( setuptools.app.mulequeue.queue.length > setuptools.app.mulequeue.state.queuePeak ) setuptools.app.mulequeue.state.queuePeak = setuptools.app.mulequeue.queue.length;

        //  if this is the top of a cycle, check if the minimum cycle delay has passed
        var lastRunDifference = ((new Date)-setuptools.app.mulequeue.state.lastTaskFinished)/1000;
        if (
            setuptools.app.mulequeue.state.busy === 0 &&
            lastRunDifference < window.accountLoadDelay
        ) {

            window.techlog('MuleQueue/TaskWait - ' + Math.ceil(setuptools.data.config.accountLoadDelay-lastRunDifference) + ' seconds until next cycle');
            return;

        }

        //  set our activity states
        setuptools.app.mulequeue.state.active = true;
        setuptools.app.mulequeue.state.running = true;

        //  run up to a specified number of concurrent tasks
        while ( setuptools.app.mulequeue.state.busy < setuptools.data.config.mqConcurrent ) {

            //  find the first task in queue state
            var queueIndex = setuptools.app.mulequeue.state.busy;
            for ( var i = 0; i < setuptools.app.mulequeue.queue.length; i++ ) {

                var guid = setuptools.app.mulequeue.queue[queueIndex];
                if ( setuptools.app.mulequeue.tasks[guid].state === 'queue' ) break;

            }

            //  execute the task if a guid was found
            //  if all tasks are running/paused we won't run
            if ( typeof guid === 'string' ) setuptools.app.mulequeue.task.start(guid);

        }

    }

};

/*/
// mulequeue mule tasks
/*/

//  rate limit all tasks
setuptools.app.mulequeue.task.rateLimit = function(soft) {

    function RateLimitTimer() {

        var RateLimitRemaining = ((setuptools.app.mulequeue.state.rateLimitExpiration - Date.now()) / 1000 / 60).toFixed(2);
        if (RateLimitRemaining <= 0) {

            clearInterval(setuptools.app.mulequeue.state.rateLimitTimer);
            setuptools.app.mulequeue.state.rateLimitTimer = false;
            setuptools.app.mulequeue.state.rateLimited = false;

            //  reset spinners
            for ( var task in setuptools.app.mulequeue.tasks ) {

                if ( setuptools.app.mulequeue.tasks.hasOwnProperty(task) ) {

                    if ( setuptools.app.mulequeue.tasks[task].state === 'queue' )
                        setuptools.app.mulequeue.tasks[task].reloader
                            .empty()
                            .append(setuptools.app.mulequeue.spinner.running())
                            .attr('title', 'Mule added to reload queue...');

                }

            }

            $('#stickynotice').empty();
            $('#mulequeue').removeClass('rateLimited');
            window.techlog('MuleQueue/RateLimit expired', 'force');

        } else {

            var Time = RateLimitRemaining.match(/^([0-9]*?)\.([0-9]*?)$/);
            var Minutes = '00';
            var Seconds = 0;
            if ( typeof Time === 'object' ) {
                Minutes = Time[1];
                Seconds = (Number('0.'+Time[2])*60).toFixed(0);
            }
            if ( Seconds < 10 ) Seconds = '0' + Seconds;
            var RateLimitTime = Minutes + ':' + Seconds;
            $('#mulequeue').addClass('rateLimited').removeClass('running');
            $('#stickynotice').html("<div>Warning: Your account is rate limited by Deca. Please wait " + RateLimitTime + " before trying to reload accounts.</div>");

        }

    }

    //  prepare the rate limit
    window.techlog('MuleQueue/RateLimit detected', 'force');
    setuptools.app.mulequeue.state.rateLimited = true;
    if ( soft !== true ) {

        setuptools.app.mulequeue.state.rateLimitExpiration = Date.now()+300000;

        //  write it to storage
        setuptools.storage.write('ratelimitexpiration', setuptools.app.mulequeue.state.rateLimitExpiration);

    }

    //  reset state for any tasks that encountered rate limiting
    if ( setuptools.app.mulequeue.queue.length > 0 ) {
        for (var index = (setuptools.app.mulequeue.state.busy - 1); index >= 0; index--) {

            setuptools.app.mulequeue.tasks[setuptools.app.mulequeue.queue[index]].state = 'queue';
            setuptools.app.mulequeue.tasks[setuptools.app.mulequeue.queue[index]].reloader
                .empty()
                .append(setuptools.app.mulequeue.spinner.running('error'))
                .attr('title', 'Error: You are presently rate limited by Deca.');

        }
    }

    //  reset the busy counter to 0
    setuptools.app.mulequeue.state.busy = 0;
    setuptools.app.mulequeue.state.queuePeak = 0;

    //  start the rate limit timer
    setuptools.app.mulequeue.state.rateLimitTimer = setInterval(RateLimitTimer, 1000);

};

//  parse provided guids list into correct format
setuptools.app.mulequeue.task.guidsCheck = function(guids) {

    if ( !guids ) guids = [];
    if ( typeof guids === 'string' ) guids = [guids];
    if ( Array.isArray(guids) === false ) setuptools.lightbox.error('Data type for argument "guids" not valid.', 1000);
    return guids;

};

//  queue task on all or specified guids
setuptools.app.mulequeue.task.queue = function(guids, config) {

    //  parse guids
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);

    //  set a default config object if none provided or invalid
    if ( typeof config === 'function' ) {
        callback = config;
        config = {};
    } else if ( typeof config !== 'object' || Array.isArray(config) === true ) config = {};

    //  merge supplied config into default config
    config = $.extend(true, {}, setuptools.data.config.mqDefaultConfig, config);

    //  remove reserved config keys
    delete config.state;
    delete config.creation;

    //  add guid to the queue
    for ( var i = 0; i < guids.length; i++ ) {

        //  check if guid is already in the queue
        if ( typeof setuptools.app.mulequeue.tasks[guids[i]] === 'object' ) {

            //  do not interfere if the queue item is already running
            if ( setuptools.app.mulequeue.tasks[guids[i]].state === 'running' ) continue;

            //  update the queue item's configuration
            $.extend(true, setuptools.app.mulequeue.tasks[guids[i]], config);
            continue;

        }

        //  apply madatory config keys
        config.state = 'queue';
        config.creation = new Date;
        config.reloader = $('div.mule[data-guid="' + guids[i] + '"] > div.button.reloader');
        config.reloader.empty().append(setuptools.app.mulequeue.spinner.running()).attr('title', 'Mule added to reload queue...');

        setuptools.app.mulequeue.queue.push(guids[i]);                          //  sets queue order
        setuptools.app.mulequeue.tasks[guids[i]] = $.extend(true, {}, config);  //  sets queue config data
        window.techlog('MuleQueue/AddTask queuing ' + guids[i], 'force');

    }

};



//  reload (ignore_cache) task on all or specified guids
setuptools.app.mulequeue.task.reload = function(guids) {

    //  parse guids
    if ( !guids ) guids = Object.keys(window.accounts);
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);

    //  force account data reload
    setuptools.app.mulequeue.task.queue(guids, {
        action: 'reload',
        ignore_cache: true,
        cache_only: false
    });

};

//  refresh (cache_only) task on all or specified guids (bypasses queue)
setuptools.app.mulequeue.task.refresh = function(guids) {

    //  parse guids
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);

    for ( var x = 0; x < guids.length; x++ ) mules[guids[x]].query(false, true, true);

};

//  attempt a cache_only load of guids and send stale guids to reload
setuptools.app.mulequeue.task.load = function(guids) {

    //  parse guids
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);
    if ( guids.length === 0 ) guids = Object.keys(window.accounts);

    //  first loop: cache_only load on all provided guids
    setuptools.app.mulequeue.task.refresh(guids);

    //  second loop: check for freshness and queue stale mules
    for (var y = 0; y < guids.length; y++)
        if (mules[guids[y]].fresh === false)
            setuptools.app.mulequeue.task.reload(guids[y]);

};

//  start task on specified guid
setuptools.app.mulequeue.task.start = function(guid) {

    //  require a guid be provided
    if ( !guid ) return;

    //  check if a task exists and insert it into the queue if not
    if ( typeof setuptools.app.mulequeue.tasks[guid] === 'undefined' ) setuptools.app.mulequeue.task.reload(guid);

    //  check if a task exists and make sure it is in the proper state
    if ( typeof setuptools.app.mulequeue.tasks[guid] === 'object' && setuptools.app.mulequeue.tasks[guid].state !== 'queue' ) return;

    //  reorder the queue if this item isn't in its position
    var taskIndex = setuptools.app.mulequeue.queue.indexOf(guid);
    if ( taskIndex !== setuptools.app.mulequeue.state.busy ) {

        window.techlog('MuleQueue/Start pushing ' + guid + ' to position ' + setuptools.app.mulequeue.state.busy, 'force');
        setuptools.app.mulequeue.queue.splice(taskIndex, 1);
        setuptools.app.mulequeue.queue.splice(setuptools.app.mulequeue.state.busy, 0, guid);
        setuptools.app.mulequeue.queue.filter(function (item) {
            return item !== undefined
        }).join();

    }

    //  we won't run the request if we're rate limited
    if ( setuptools.app.mulequeue.state.rateLimited === true ) return;

    //  run the task
    setuptools.app.mulequeue.state.busy++;
    $('#mulequeue').addClass('running');

    //  update task state
    setuptools.app.mulequeue.tasks[guid].state = 'running';
    setuptools.app.mulequeue.tasks[guid].runtime = new Date;
    setuptools.app.mulequeue.tasks[guid].reloader.empty().append(setuptools.app.mulequeue.spinner.running('running')).attr('title', 'Mule data request running...');

    //  create the promise to run the task
    setuptools.app.mulequeue.tasks[guid].promise = setuptools.app.mulequeue.task.createPromise(guid).then(function(response) {

        //  handle responses from the task
        var task = setuptools.app.mulequeue.tasks[response.guid];
        if (response.state === 'finished' && task.state === 'running' ) {

            //  handle rate limit detection
            if ( response.status === 'rateLimited' ) {

                setuptools.app.mulequeue.task.rateLimit();
                return;

            }

            //  update the task data for task history
            task.state = 'finished';
            task.finish = new Date;
            task.response = response;

            if ( response.status === 'error' ) {

                task.reloader.empty().append(setuptools.app.mulequeue.spinner.running('error')).attr('title', 'Error loading account: ' + response.errorMessage);

            } else {

                //  remove any errors
                var errors = $('#errors');
                var error = errors.find('div[data-guid="' + response.guid + '"]');
                error.remove();
                if ( errors.html() === '' ) errors.remove();

                //  replace the reloader
                task.reloader.empty().text('\u21bb').attr('title', 'last updated: ' + (Date(mules[response.guid].data.query.created)).toLocaleString());

            }

            setuptools.app.mulequeue.state.lastTaskFinished = task.finish;
            setuptools.app.mulequeue.history.push(setuptools.app.mulequeue.tasks[response.guid]);

            window.techlog(
                'MuleQueue/TaskFinish ' +
                '- ' + response.guid +
                ' \'' + response.status + '\'' + ((response.errorMessage) ?
                ' - \'' + response.errorMessage + '\'' :
                ' - runtime ' + ((task.finish-task.runtime)/1000).toFixed(2) + ' seconds') +
                ' - waited ' + Math.floor((task.finish-task.creation)/1000) + ' seconds' +
                ' - remaining tasks ' + (setuptools.app.mulequeue.queue.length-1),
                'force'
            );

            //  clean up the task and remove it from the queue list
            setuptools.app.mulequeue.state.busy--;
            delete setuptools.app.mulequeue.tasks[response.guid];
            setuptools.app.mulequeue.queue.splice(setuptools.app.mulequeue.queue.indexOf(response.guid), 1);
            setuptools.app.mulequeue.queue.filter(function (item) {
                return item !== undefined
            }).join();

            setuptools.app.mulequeue.ui.progressBar();

            //  no tasks are active anymore
            if ( setuptools.app.mulequeue.state.busy === 0 ) setuptools.app.mulequeue.state.active = false;

            //  if the queue is now empty we can switch the running state to false
            if ( setuptools.app.mulequeue.queue.length === 0 ) {

                $('#mulequeue').removeClass('running');
                setuptools.app.mulequeue.state.running = false;
                setuptools.app.mulequeue.state.queuePeak = 0;

            }

        }

    });

};

//  pause task on all or specified guids
setuptools.app.mulequeue.task.pause = function(guids) {

    //  parse guids
    if ( !guids ) guids = [];
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);
    if ( guids.length === 0 ) setuptools.app.mulequeue.state.paused = true;
    window.techlog('MuleQueue/TaskPause', 'force');

};

//  return task on all or specified guids
setuptools.app.mulequeue.task.resume = function(guids) {

    //  parse guids
    if ( !guids ) guids = [];
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);
    if ( guids.length === 0 ) setuptools.app.mulequeue.state.paused = false;
    window.techlog('MuleQueue/TaskResume', 'force');

};

//  cancel task on all or specified guids
setuptools.app.mulequeue.task.cancel = function(guids) {

    //  parse guids
    if ( !guids ) guids = [];
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);
    if ( guids.length === 0 ) guids = setuptools.app.mulequeue.queue;
    window.techlog('MuleQueue/TaskCancel clearing ' + guids.length + ' tasks', 'force');

    //  cancel and remove all queued tasks
    for ( var i = (guids.length-1); i >= 0; i-- ) {

        var guid = guids[i];
        var task = setuptools.app.mulequeue.tasks[guid];
        if ( task.state === 'queue' ) {

            setuptools.app.mulequeue.tasks[guid].reloader.empty().text('\u21bb').attr('title', 'last updated: ' + (Date(mules[response.guid].data.query.created)).toLocaleString());
            delete setuptools.app.mulequeue.tasks[guid];
            setuptools.app.mulequeue.queue.splice(setuptools.app.mulequeue.queue.indexOf(guid), 1);
            setuptools.app.mulequeue.queue.filter(function (item) {
                return item !== undefined
            }).join();

        }

    }

    setuptools.app.mulequeue.state.running = false;
    setuptools.app.mulequeue.state.active = false;
    setuptools.app.mulequeue.state.busy = 0;
    setuptools.app.mulequeue.state.queuePeak = 0;
    $('#mulequeue').removeClass('running');

};

//  reorder task position specified guids
setuptools.app.mulequeue.task.reorder = function(guids, callback) {

    if ( typeof guids === 'undefined' ) setuptools.lightbox.error('Argument "guids" is required.', 1000);

    //  parse guids
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);

    if ( typeof callback === 'function' ) callback();

};

/*/
//  menus and interfaces
/*/

//  mulequeue menu
setuptools.app.mulequeue.menu = function() {

    //  don't redraw if the menu is already open
    if ( setuptools.lightbox.menu.context.isOpen('mulequeue-menu') ) return;
    var MuleQueueButton = $('#mulequeue');

    //  clear the hover close interval if mousing over this menu's button
    MuleQueueButton.mouseover(function() {
        clearInterval(setuptools.tmp.muleMenuMouseLeaveTimer);
    });

    //  set our options
    var options = [
        {
            option: 'keyup',
            value: false
        },
        {
            option: 'hover',
            action: 'close',
            name: 'muleMenuMouseLeaveTimer'
        },
        {
            option: 'skip',
            value: 'reposition'
        },
        {
            option: 'pos',
            vpx: MuleQueueButton.outerHeight(true) + 4
        },
        {
            option: 'class',
            value: 'mulequeue-topMenu'
        },
        {
            class: 'openManager',
            name: 'Manager',
            callback: setuptools.app.mulequeue.ui.manager
        }
    ];

    if ( setuptools.app.mulequeue.state.rateLimited === true ) {

        options.push(
            {
                option: 'class',
                value: 'rateLimitMenu'
            },
            {
                option: 'link',
                class: 'rateLimitHelp',
                name: 'What is rate limiting?',
                href: setuptools.config.ratelimitHelp,
                target: '_blank'
            }
        );

    } else {

        if ( MuleQueueButton.hasClass('running') === true ) {

            if ( setuptools.app.mulequeue.state.paused === false ) {

                options.push({
                    class: 'pauseQueue',
                    name: 'Pause',
                    callback: function () {
                        setuptools.app.mulequeue.task.pause();
                    }
                });

            } else {

                options.push({
                    class: 'resumeQueue',
                    name: 'Resume',
                    callback: function () {
                        setuptools.app.mulequeue.task.resume();
                    }
                });

            }

            options.push({
                class: 'cancelQueue',
                name: 'Cancel',
                callback: function() {
                    setuptools.app.mulequeue.task.cancel();
                }
            });

        } else {

            options.push({
                class: 'startQueue',
                name: 'Reload Accounts',
                callback: function () {
                    setuptools.app.mulequeue.task.reload();
                }
            });

        }

    }

    setuptools.lightbox.menu.context.create('mulequeue-menu', false, MuleQueueButton, options);

};

setuptools.app.mulequeue.ui.manager = function(guid) {

    //  draw ui buttons reflecting the current state
    function DrawButtons() {

        //  display the menu buttons
        var html = '';
        html += ' \
            <div class="mulequeue-control-buttons flex-container w100" style="justify-content: initial; align-items: right;">\
            <div class="status menuStyle neutral menuSmall textCenter" style="align-self: left; margin-right: 25px;"> \
                ' + ( (setuptools.app.mulequeue.queue.length === 0) ? 'No Running Tasks' : 'MuleQueue Running' ) + '\
            </div> \
        ';

        if ( setuptools.app.mulequeue.state.running === false ) {

            html += ' \
            <div class="reload menuStyle menuSmall textCenter mr0" style="font-weight: normal;">Reload Accounts</div> \
        ';

        } else {

            if ( setuptools.app.mulequeue.state.paused === false ) {

                html += ' \
                <div class="pause menuStyle disabled menuTiny" style="color: #fff;">Pause</div> \
            ';

            } else {

                html += ' \
                <div class="resume menuStyle positive menuTiny">Resume</div> \
            ';

            }

            html += ' \
            <div class="cancel menuStyle negative menuTiny">Cancel</div> \
        ';

        }

        html += ' \
            </div>\
        ';

        setuptools.lightbox.build('mulequeue-manager', html);

    }

    function ReloadAll() {

    }

    function Pause() {

    }

    function Cancel(guid) {

        if ( guid ) {

            setuptools.app.mulequeue.task.cancel(guid);
            return;

        }

        setuptools.app.mulequeue.task.cancel();
        setuptools.lightbox.close();
        setuptools.app.mulequeue.ui.manager();

    }

    //  display the menu buttons
    //DrawButtons();

    //  begin mulequeue manager pagination layout

    //  draw mulequeue manager pages
    function ListQueue(dummy, page) {

        if ( typeof page !== 'number' ) page = 0;
        var QueueList = setuptools.lightbox.menu.paginate.state.QueueList.PageList;

        if ( page > setuptools.lightbox.menu.paginate.state.QueueList.lastPage ) page = setuptools.lightbox.menu.paginate.state.QueueList.lastPage;
        $('div.QueueList div.customPage input[name="customPage"]').val(page+1);

        //  determine our boundaries
        var minIndex = setuptools.data.config.accountsPerPage*page;
        var maxIndex = (setuptools.data.config.accountsPerPage*page)+setuptools.data.config.accountsPerPage;
        if ( maxIndex > QueueList.length ) maxIndex = QueueList.length;
        if ( QueueList.length <= setuptools.data.config.accountsPerPage ) {
            minIndex = 0;
            maxIndex = QueueList.length;
        }

        //  generate the page html
        var html = '';
        for ( var i = minIndex; i < maxIndex; i++ ) html += createRow(i);
        return html;

    }

    function createRow(listPos) {

        var QueueObject = setuptools.app.mulequeue.tasks[QueueList[listPos]];
        return ' \
            <div class="flex-container queuetask noselect" style="justify-content: flex-start;" data-listPos="' + listPos + '"> \
                <div style="flex-basis: 42px;" class="buttonStyle textCenter">' + (listPos+1) + '</div> \
                <div style="flex-basis: 400px; justify-content: flex-start;" class="menuStyle buttonStyle neutral textLeft w100 select mr0">' + QueueList[listPos] + '</div> \
            </div>\
        ';

        /*
            ' + ( ( QueueObject.state === 'queue' ) ?
                '<div data-option="pause" title="Pause Task" style="flex-grow: 4;" class="menuStyle buttonStyle menuRelative textCenter">Pause</div>' :
                '<div data-option="resume" title="Resume Task" style="flex-grow: 4;" class="menuStyle buttonStyle menuRelative positive textCenter">Resume</div>'
            ) + ' \
            <div data-option="move" title="Move Task" style="flex-grow: 4;" class="menuStyle buttonStyle menuRelative textCenter">Move</div> \
            <div data-option="cancel" title="Cancel Task" style="flex-grow: 4;" class="menuStyle buttonStyle menuRelative negative textCenter mr0">Cancel</div> \
        */

    }

    function QueueManagerContext() {

        $('div.mulequeue.menu.refresh').click(function() {

            setuptools.lightbox.close();
            setuptools.app.mulequeue.ui.manager();

        });

        $('div.QueueList > div.list > div.queuetask > div').click(function() {

            var listPos = $(this).parent().attr('data-listpos');
            var action = $(this).attr('data-option');
            var guid = setuptools.app.mulequeue.queue[listPos];
            if ( typeof guid === 'string' && typeof action === 'string' ) {

                if ( action === 'pause' ) {

                    setuptools.app.mulequeue.task.pause(guid);
                    setuptools.app.mulequeue.ui.manager(guid);

                }

            }

        });

    }

    //  update our displayed position within the accounts list
    function QueueManagerUpdate(direction) {

        var data = setuptools.lightbox.menu.paginate.state.QueueList;
        if ( direction === 'add' ) setuptools.lightbox.menu.paginate.findPage(data.PageList.length-1, 'QueueList');
        if ( direction === 'reset' ) setuptools.lightbox.menu.paginate.findPage(0, 'QueueList');

        //  validate lastPage/currentPage boundary
        if ( ['remove','reset'].indexOf(direction) > -1 ) {

            var newLastPage = Math.ceil(data.PageList.length/setuptools.data.config.accountsPerPage);
            if ( newLastPage > 0 ) newLastPage--;
            if ( data.currentPage > newLastPage ) setuptools.lightbox.menu.paginate.findPage(data.PageList.length-1, 'QueueList');

        }

        var QueueManagerPaginate = setuptools.lightbox.menu.paginate.create(
            setuptools.app.mulequeue.queue,
            data.ActionItem,
            'QueueList',
            data.ActionSelector,
            data.ActionCallback,
            data.ActionContext,
            data.Modifiers
        );

        $('div.QueueList.list').html(' \
            ' + QueueManagerPaginate.html.menu + ' \
            <div class="setuptools app list"' + ( (setuptools.state.firsttime === false || QueueManagerPaginate.lastPage > 0) ? ' style="height: ' + editorHeight + 'px;"' : '' ) + '>\
                ' + ListQueue(undefined, setuptools.lightbox.menu.paginate.state.QueueList.currentPage) + ' \
            </div> \
            ' + QueueManagerPaginate.html.search + ' \
            <br>&nbsp;\
        ');

        QueueManagerPaginate.bind();

    }

    setuptools.lightbox.close('mulequeue-manager');

    //  create our pagination object
    var pageButtonsHtml = ' \
        <div class="setuptools buttonStyle mulequeue menu refresh noselect" title="Refresh" style="float: right; font-weight: normal;">&#8634;</div> \
    ';
    var QueueList = setuptools.app.mulequeue.queue;
    var QueueManagerPaginate = setuptools.lightbox.menu.paginate.create(
        QueueList,
        undefined,
        'QueueList',
        'div.QueueList div.list',
        ListQueue,
        QueueManagerContext,
        {
            pageButtons: {html: pageButtonsHtml}
        }
    );

    //var editorHeight = (29*setuptools.data.config.accountsPerPage)-5;

    var currentPage = 0;
    if ( typeof guid === 'string' ) {

        setuptools.lightbox.menu.paginate.findPage(guid, 'QueueList');
        currentPage = setuptools.lightbox.menu.paginate.state.QueueList.currentPage;

    }

    setuptools.lightbox.build('mulequeue-manager', ' \
        <div class="mulequeue progress w100 flex-container" style="position: relative; border: 2px solid blue; height: 20px; margin: 10px 0; background-color: darkblue; justify-content: center;">\
            <div class="percentage" style="z-index: 5000;">No Tasks</div> \
            <div class="bar" style="position: absolute; left: 0; top: 0; height: 16px; width: 0; background-color: #000;">&nbsp;</div>\
        </div>\
        <div class="setuptools mulequeue manager">\
            <div class="QueueList list w100">\
                <div class="fleft cboth mb5 w100">' + QueueManagerPaginate.html.menu + '</div> \
                <div class="setuptools app list w100 cboth">\
                    ' + ListQueue(undefined, currentPage) + ' \
                </div> \
                <div class="fleft cboth">' + QueueManagerPaginate.html.search + '</div>\
                <br>&nbsp;\
            </div>\
        </div> \
    ');

    setuptools.lightbox.settitle('mulequeue-manager', 'MuleQueue Manager');
    setuptools.lightbox.drawhelp('mulequeue-manager', 'docs/mulequeue/help/manager', 'MuleQueue Help');
    setuptools.lightbox.display('mulequeue-manager', {variant: 'fl-MuleQueueManager nobackground'});

    setuptools.app.mulequeue.ui.progressBar();
    QueueManagerPaginate.bind();

};

//  update any mulequeue progress bar
setuptools.app.mulequeue.ui.progressBar = function(jobsRemaining, jobsTotal) {

    if ( setuptools.app.mulequeue.state.queuePeak === 0 ) return;
    if ( !jobsRemaining ) jobsRemaining = setuptools.app.mulequeue.queue.length;
    if ( !jobsTotal ) jobsTotal = setuptools.app.mulequeue.state.queuePeak;
    var jobsCompleted = jobsTotal-jobsRemaining;
    var percentage = Math.floor((jobsCompleted/jobsTotal)*100);

    if ( jobsRemaining !== 0 ) {

        $('.mulequeue.progress > .bar').css({width: percentage + '%'});
        $('.mulequeue.progress > .percentage').text(jobsRemaining + ' Tasks Left (' + percentage + '% complete)');

    } else {

        $('.mulequeue.progress > .bar').css({width: 0 + '%'});
        $('.mulequeue.progress > .percentage').text('No Tasks');

    }

};

setuptools.app.mulequeue.spinner = {};
setuptools.app.mulequeue.spinner.running = function(type) {

    if ( typeof type !== 'string' ) type = 'queue';
    var html = ' \
        <div class="lds-css ng-scope">\
            <div style="width:100%; height:100%" class="lds-wedges-spinner-' + type + '">\
                <div>\
                  <div>\
                    <div></div>\
                  </div>\
                  <div>\
                    <div></div>\
                  </div>\
                  <div>\
                    <div></div>\
                  </div>\
                  <div>\
                    <div></div>\
                  </div>\
                </div>\
            </div>\
        </div>\
    ';

    var spinner = $('<div>');
    spinner.html(html);
    return spinner;

};