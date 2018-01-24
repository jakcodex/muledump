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
        lastTaskFinished: 0,                    //  most recently finished tasks's timestamp
        queuePeak: 0,                           //  maximum size seen of a running queue
        topListPos: 0,                          //  current top listPos for mulequeue manager paging
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
    if ( !setuptools.app.mulequeue.state.rateLimitExpiration ) setuptools.app.mulequeue.state.rateLimitExpiration = Date.now();
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

    //  general tasks
    if (
        setuptools.app.mulequeue.state.running === true &&
        setuptools.app.mulequeue.state.paused === false &&
        typeof setuptools.lightbox.active['mulequeue-manager'] === 'object' &&
        typeof setuptools.app.mulequeue.queuemanager === 'object'
    ) setuptools.app.mulequeue.queuemanager.Modifiers.callbacks.update();

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

                    if ( setuptools.app.mulequeue.tasks[task].state === 'queue' && setuptools.data.config.mqAnimations === true ) {

                        setuptools.app.mulequeue.tasks[task].reloader
                            .empty()
                            .append(setuptools.app.mulequeue.spinner.running())
                            .attr('title', 'Task is waiting in MuleQueue');

                    }

                    $('div.queuetask[data-listPos="' + setuptools.app.mulequeue.queue.indexOf(task) + '"] > div:first-child')
                        .html(setuptools.app.mulequeue.spinner.running())
                        .attr('title', 'Task is waiting in MuleQueue');

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

        setuptools.app.mulequeue.state.rateLimitExpiration = Date.now()+setuptools.config.mqRateLimitExpiration;

        //  write it to storage
        setuptools.storage.write('ratelimitexpiration', setuptools.app.mulequeue.state.rateLimitExpiration);

    }

    //  reset state for any tasks that encountered rate limiting
    if ( setuptools.app.mulequeue.queue.length > 0 ) {
        for (var index = (setuptools.app.mulequeue.state.busy - 1); index >= 0; index--) {

            setuptools.app.mulequeue.tasks[setuptools.app.mulequeue.queue[index]].state = 'queue';

            if ( setuptools.data.config.mqAnimations === true ) {

                setuptools.app.mulequeue.tasks[setuptools.app.mulequeue.queue[index]].reloader
                    .empty()
                    .append(setuptools.app.mulequeue.spinner.running('error'))
                    .attr('title', 'Error: You are presently rate limited by Deca.');

            }

            $('div.queuetask[data-listPos="' + index + '"] > div:first-child')
                .html(setuptools.app.mulequeue.spinner.running('error', true))
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

        if ( i === 0 ) setuptools.app.mulequeue.state.running = true;

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
        if ( setuptools.data.config.mqAnimations === true ) config.reloader.empty().append(setuptools.app.mulequeue.spinner.running()).attr('title', 'Task is waiting in MuleQueue');

        setuptools.app.mulequeue.queue.push(guids[i]);                          //  sets queue order
        setuptools.app.mulequeue.tasks[guids[i]] = $.extend(true, {}, config);  //  sets queue config data
        window.techlog('MuleQueue/AddTask queuing ' + guids[i], 'force');

    }

};



//  reload (ignore_cache) task on all or specified guids
setuptools.app.mulequeue.task.reload = function(guids, callback) {

    if ( typeof guids === 'function' ) {

        callback = guids;
        guids = undefined;

    }

    //  parse guids
    if ( !guids ) guids = Object.keys(window.accounts);
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);

    //  force account data reload
    setuptools.app.mulequeue.task.queue(guids, {
        action: 'reload',
        ignore_cache: true,
        cache_only: false
    });

    if ( typeof callback === 'function' ) callback();

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
setuptools.app.mulequeue.task.start = function(guid, callback) {

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
        taskIndex = setuptools.app.mulequeue.state.busy;

    }

    //  we won't run the request if we're rate limited
    if ( setuptools.app.mulequeue.state.rateLimited === true ) return;

    //  run the task
    setuptools.app.mulequeue.state.busy++;
    $('#mulequeue').addClass('running');

    //  update task state
    setuptools.app.mulequeue.tasks[guid].state = 'running';
    setuptools.app.mulequeue.tasks[guid].runtime = new Date;
    if ( setuptools.data.config.mqAnimations === true ) setuptools.app.mulequeue.tasks[guid].reloader.empty().append(setuptools.app.mulequeue.spinner.running('running')).attr('title', 'Mule data request running...');
    $('div.queuetask[data-listPos="' + taskIndex + '"] > div:first-child').html(setuptools.app.mulequeue.spinner.running('running', true)).attr('title', 'Mule data request running...');

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

                if ( setuptools.data.config.mqAnimations === true ) task.reloader.empty().append(setuptools.app.mulequeue.spinner.running('error')).attr('title', 'Error loading account: ' + response.errorMessage);

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
            if ( setuptools.lightbox.menu.context.isOpen('mulequeue-menu') === true ) setuptools.app.mulequeue.menu();
            if (
                typeof setuptools.lightbox.active['mulequeue-manager'] === 'object' &&
                typeof setuptools.lightbox.menu.paginate.state.QueueList === 'object'
            ) setuptools.lightbox.menu.paginate.state.QueueList.Modifiers.callbacks.update();

            //  no tasks are active anymore
            if ( setuptools.app.mulequeue.state.busy === 0 ) setuptools.app.mulequeue.state.active = false;

            //  if the queue is now empty we can switch the running state to false
            if ( setuptools.app.mulequeue.queue.length === 0 ) {

                $('#mulequeue').removeClass('running');
                setuptools.app.mulequeue.state.running = false;
                setuptools.app.mulequeue.state.queuePeak = 0;
                if(
                    typeof setuptools.lightbox.active['mulequeue-manager'] === 'object' &&
                    typeof setuptools.app.mulequeue.queuemanager === 'object'
                ) setuptools.app.mulequeue.queuemanager.Modifiers.callbacks.update();

            }

        }

    });

};

//  pause task on all or specified guids
setuptools.app.mulequeue.task.pause = function(guids, callback) {

    if ( typeof guids === 'function' ) {

        callback = guids;
        guids = [];

    }

    //  parse guids
    if ( !guids ) guids = [];
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);
    var pauseList = guids;
    if ( guids.length === 0 ) {
        setuptools.app.mulequeue.state.paused = true;
        pauseList = setuptools.app.mulequeue.queue;
    }

    for ( var i = 0; i < pauseList.length; i++ ) {

        var task = setuptools.app.mulequeue.tasks[pauseList[i]];
        if ( task.state === 'queue' ) {

            if ( setuptools.data.config.mqAnimations === true ) task.reloader.empty().append(setuptools.app.mulequeue.spinner.running('pause')).attr('title', 'Task paused in MuleQueue');
            $('div.queuetask[data-listPos="' + i + '"] > div:first-child').html(setuptools.app.mulequeue.spinner.running('pause', true)).attr('title', 'Task paused in MuleQueue');

        }


    }

    if ( typeof callback === 'function' ) callback();
    window.techlog('MuleQueue/TaskPause', 'force');

};

//  return task on all or specified guids
setuptools.app.mulequeue.task.resume = function(guids, callback) {

    if ( typeof guids === 'function' ) {

        callback = guids;
        guids = [];

    }

    //  parse guids
    if ( !guids ) guids = [];
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);
    var pauseList = guids;
    if ( guids.length === 0 ) {

        setuptools.app.mulequeue.state.paused = false;
        pauseList = setuptools.app.mulequeue.queue;

    }

    for ( var i = 0; i < pauseList.length; i++ ) {

        var task = setuptools.app.mulequeue.tasks[pauseList[i]];
        if ( task.state === 'queue' ) {

            if ( setuptools.data.config.mqAnimations === true ) task.reloader.empty().append(setuptools.app.mulequeue.spinner.running('queue')).attr('title', 'Task is waiting in MuleQueue');
            $('div.queuetask[data-listPos="' + i + '"] > div:first-child').html(setuptools.app.mulequeue.spinner.running('queue', true)).attr('title', 'Task is waiting in MuleQueue');

        }

    }

    setuptools.app.mulequeue.state.lastTaskFinished = ((new Date)-setuptools.data.config.accountLoadDelay);
    if ( typeof callback === 'function' ) callback();
    window.techlog('MuleQueue/TaskResume', 'force');

};

//  cancel task on all or specified guids
setuptools.app.mulequeue.task.cancel = function(guids, callback) {

    if ( typeof guids === 'function' ) {

        callback = guids;
        guids = [];

    }

    //  parse guids
    if ( !guids ) guids = [];
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);
    if ( guids.length === 0 ) guids = setuptools.app.mulequeue.queue;
    window.techlog('MuleQueue/TaskCancel clearing ' + guids.length + ' tasks', 'force');

    //  cancel and remove all queued tasks
    for ( var i = (guids.length-1); i >= 0; i-- ) {

        var guid = guids[i];
        var task = setuptools.app.mulequeue.tasks[guid];
        if ( ['queue', 'error'].indexOf(task.state) > -1 ) {

            setuptools.app.mulequeue.tasks[guid].reloader.empty().text('\u21bb').attr('title', 'last updated: ' + (Date(mules[guid].data.query.created)).toLocaleString());
            delete setuptools.app.mulequeue.tasks[guid];
            setuptools.app.mulequeue.queue.splice(setuptools.app.mulequeue.queue.indexOf(guid), 1);
            setuptools.app.mulequeue.queue.filter(function (item) {
                return item !== undefined
            }).join();

        }

    }

    setuptools.app.mulequeue.state.paused = false;
    setuptools.app.mulequeue.state.running = false;
    setuptools.app.mulequeue.state.active = false;
    setuptools.app.mulequeue.state.busy = 0;
    setuptools.app.mulequeue.state.queuePeak = 0;
    $('#mulequeue').removeClass('running');
    if ( typeof callback === 'function' ) callback();

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
    setuptools.lightbox.menu.context.close('mulequeue-menu');
    var MuleQueueButton = $('#mulequeue');

    //  clear the hover close interval if mousing over this menu's button
    MuleQueueButton.mouseover(function() {
        clearInterval(setuptools.tmp.muleMenuMouseLeaveTimer);
    });

    //  set our options
    var YesIAmSplittingHairs = ( setuptools.app.mulequeue.queue.length === 1 ) ? '' : 's';
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
            option: 'close',
            callback: setuptools.app.mulequeue.menu,
            delay: 250
        },
        {
            option: 'class',
            value: 'mulequeue-topMenu'
        },
        {
            class: 'openManager',
            name: setuptools.app.mulequeue.queue.length + ' Task' + YesIAmSplittingHairs + ' Running'
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

//  draw ui buttons reflecting the current state
setuptools.app.mulequeue.ui.drawButtons = function() {

    var html = '';

    if ( setuptools.app.mulequeue.state.running === false ) {

        html += ' \
            <div class="setuptools menuStyle buttonStyle positive mulequeue main menu reload noselect" title="Reload All Accounts" style="float: right; padding: 0; display: flex; justify-content: center; align-items: center;"><div style="font-size: 14px; font-weight: normal;">&#9654;</div></div> \
                    ';

    } else {

        if ( setuptools.app.mulequeue.state.paused === false ) {

            html += ' \
                <div class="setuptools menuStyle buttonStyle mulequeue main menu pause noselect" title="Pause Queue" style="float: right; font-size: 10px; font-weight: normal;">&#10073;&#10073;</div> \
            ';

        } else {

            //  reload &#8634;
            html += ' \
                <div class="setuptools menuStyle buttonStyle mulequeue main menu resume noselect" title="Resume Queue" style="float: right; font-weight: normal;">&#9654;</div> \
            ';

        }

        html += ' \
            <div class="setuptools menuStyle buttonStyle negative mulequeue main menu cancel noselect" title="Cancel Queue" style="float: right; font-size: 10px; font-weight: normal;">&#10006;</div> \
        ';

    }

    return html;

}

setuptools.app.mulequeue.ui.manager = function(guid) {

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
        if ( html === '' ) html = 'No accounts in queue.';
        return html;

    }

    function createRow(listPos) {

        function secondsToHms(d) {
            //  https://stackoverflow.com/questions/5539028/converting-seconds-into-hhmmss
            //  ^^ thank you for the base work here
            d = Number(d);

            if ( d < 0 ) return "Up next";

            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);

            if ( s === 60 ) {
                m++;
                s = 0;
            }
            if ( m === 60 ) {
                h++;
                m = 0;
            }

            var hDisplay = h > 0 ? ( (h < 10) ? '0' + h.toString() : h.toString() ) + ':' : "00:";
            var mDisplay = m >= 0 ? ( (m < 10 ) ? '0' + m.toString() : m.toString() ) + ':' : "00:";
            var sDisplay = s >= 0 ? ( (s < 10) ? '0' + s.toString() : s.toString() ) : "00";
            return hDisplay + mDisplay + sDisplay;
        }

        //  determine estimated wait time in seconds and account for next runtime
        var AccountLoadDelay = window.accountLoadDelay;
        var TimePerTask = 2;
        var LastRunDiff = ( setuptools.app.mulequeue.state.lastTaskFinished === 0 ) ? 0 : Math.ceil((Date.now()-setuptools.app.mulequeue.state.lastTaskFinished)/1000);
        var NextRun = AccountLoadDelay-LastRunDiff;
        var WaitTime = {
            estimation: (((listPos+1)*(AccountLoadDelay+TimePerTask))-LastRunDiff)
        };
        if ( listPos === 0 ) WaitTime.estimation = (NextRun+TimePerTask);
        if ( WaitTime.estimation < 0 ) WaitTime.estimation = 0;
        if ( setuptools.app.mulequeue.state.rateLimited === true ) WaitTime.estimation = (WaitTime.estimation+Math.ceil((setuptools.app.mulequeue.state.rateLimitExpiration-Date.now())/1000)+( (listPos > 0) ? setuptools.data.config.accountLoadDelay : 0 ));
        WaitTime.length = secondsToHms(WaitTime.estimation);

        var QueueObject = setuptools.app.mulequeue.tasks[QueueList[listPos]];
        return ' \
            <div class="flex-container queuetask noselect" style="justify-content: flex-start;" data-listPos="' + listPos + '"> \
                <div style="flex-basis: 27px; height: 24px;" class="flex-container textCenter" title="Queue Position: ' + (listPos+1) + '">' + setuptools.app.mulequeue.spinner.running(undefined, true) + '</div> \
                <div style="flex-basis: 539px; justify-content: space-between; border: 0;" class="menuStyle buttonStyle neutral textLeft w100 select mr0">\
                    <div style="flex-basis: 439px; overflow: hidden; word-wrap: break-word;">' + QueueList[listPos] + '</div> \
                    <div style="flex-basis: 100px; text-align: right; justify-content: flex-end;" class="flex-container noFlexAutoJustify">\
                        ' + WaitTime.length + ' \
                    </div> \
                </div> \
                <div style="flex-basis: 30px; height: 24px; justify-content: flex-end;" class="flex-container">\
                    <div style="flex-basis: 25px;" class="flex-container setuptools menuStyle buttonStyle link taskMenu noclose mr0" title="This button does nothing yet">&#8801;</div> \
                </div>\
            </div>\
        ';

    }

    function QueueManagerContext() {

        $('div.mulequeue.main.menu').click(function() {

            var self = $(this);
            if ( self.hasClass('reload') === true ) {
                setuptools.app.mulequeue.task.reload(QueueManagerUpdate);
            } else if ( self.hasClass('pause') === true ) {
                setuptools.app.mulequeue.task.pause(QueueManagerUpdate);
            } else if ( self.hasClass('resume') === true ) {
                setuptools.app.mulequeue.task.resume(QueueManagerUpdate);
            } else if ( self.hasClass('cancel') === true ) {
                setuptools.app.mulequeue.task.cancel(QueueManagerUpdate);
            }

        });

        //  unused below
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
    function QueueManagerUpdate(page) {

        if ( !page && typeof setuptools.lightbox.menu.paginate.state.QueueList === 'object' ) page = setuptools.lightbox.menu.paginate.state.QueueList.currentPage;
        if ( ['string', 'number', 'undefined'].indexOf(typeof page) === -1 ) return;

        //  reset page state
        setuptools.app.mulequeue.queuemanager = setuptools.lightbox.menu.paginate.create(
            setuptools.app.mulequeue.queue,
            setuptools.app.mulequeue.queuemanager.ActionItem,
            setuptools.app.mulequeue.queuemanager.ActionContainer,
            setuptools.app.mulequeue.queuemanager.ActionSelector,
            setuptools.app.mulequeue.queuemanager.ActionCallback,
            setuptools.app.mulequeue.queuemanager.ActionContext,
            setuptools.app.mulequeue.queuemanager.Modifiers
        );
        var QueueManagerPaginate = setuptools.app.mulequeue.queuemanager;

        //  update currentPage
        if ( typeof page === 'undefined' ) setuptools.lightbox.menu.paginate.findPage(0, 'QueueList');
        if ( typeof page === 'string' ) setuptools.lightbox.menu.paginate.findPage(page, 'QueueList');
        if ( typeof page === 'number' ) setuptools.lightbox.menu.paginate.state.QueueList.currentPage = page;

        //  validate lastPage/currentPage boundary
        var newLastPage = Math.ceil(QueueManagerPaginate.PageList.length/setuptools.data.config.accountsPerPage);
        if ( newLastPage > 0 ) newLastPage--;
        if ( QueueManagerPaginate.currentPage > newLastPage ) setuptools.lightbox.menu.paginate.findPage(QueueManagerPaginate.PageList.length-1, 'QueueList');

        //  get the customPage value
        var customPage = $('div.QueueList input[name="customPage"]');
        var customPageNumber = customPage.val();
        var customPageFocus = customPage.is(':focus');

        $('div.QueueList.list').html(' \
            <div class="fleft cboth mb5 w100">' + QueueManagerPaginate.html.menu + '</div> \
            <div class="setuptools app list w100 cboth" style="height: ' + editorHeight + 'px;">\
                ' + ListQueue(undefined, QueueManagerPaginate.currentPage) + ' \
            </div> \
        ');

        //  update the customPage value
        if ( customPageFocus ) $('div.QueueList input[name="customPage"]').focus().val('').val(customPageNumber);

        setuptools.app.mulequeue.ui.progressBar();
        QueueManagerPaginate.bind();

    }

    setuptools.lightbox.close('mulequeue-manager');

    //  create our pagination object
    var QueueList = setuptools.app.mulequeue.queue;
    setuptools.app.mulequeue.queuemanager = setuptools.lightbox.menu.paginate.create(
        QueueList,
        undefined,
        'QueueList',
        'div.QueueList div.list',
        ListQueue,
        QueueManagerContext,
        {
            pageButtons: {callback: setuptools.app.mulequeue.ui.drawButtons},
            callbacks: {
                update: QueueManagerUpdate
            },
            searchContainer: 'div.QueueSearch'
        }
    );
    var QueueManagerPaginate = setuptools.app.mulequeue.queuemanager;

    var editorHeight = (29*setuptools.data.config.accountsPerPage)-5;

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
                <div class="setuptools app list w100 cboth" style="height: ' + editorHeight + 'px;">\
                    ' + ListQueue(undefined, currentPage) + ' \
                </div> \
            </div>\
            <div class="QueueSearch w100">\
                ' + QueueManagerPaginate.html.search + '\
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

    if ( setuptools.app.mulequeue.state.queuePeak === 0 ) {
        jobsRemaining = 0;
        jobsTotal = 1;
    };

    if ( !jobsRemaining ) jobsRemaining = setuptools.app.mulequeue.queue.length;
    if ( !jobsTotal ) jobsTotal = setuptools.app.mulequeue.state.queuePeak;
    var jobsCompleted = jobsTotal-jobsRemaining;
    var percentage = Math.floor((jobsCompleted/jobsTotal)*100);
    if ( percentage < 0 ) percentage = 0;

    if ( jobsRemaining !== 0 ) {

        $('.ldBar').attr('data-value', percentage);
        $('.mulequeue.progress > .bar').css({width: percentage + '%'});
        $('.mulequeue.progress > .percentage').text(jobsRemaining + ' Tasks Left (' + percentage + '% complete)');

    } else {

        $('.ldBar').attr('data-value', 0);
        $('.mulequeue.progress > .bar').css({width: 0 + '%'});
        $('.mulequeue.progress > .percentage').text('No Tasks');

    }

};

setuptools.app.mulequeue.spinner = {};
setuptools.app.mulequeue.spinner.running = function(type, returnHtml) {

    if ( typeof returnHtml !== 'boolean' ) returnHtml = false;
    if ( typeof type !== 'string' ) type = 'queue';
    if ( type === 'queue' && setuptools.app.mulequeue.state.paused === true ) type = 'pause';
    if ( type === 'queue' && setuptools.app.mulequeue.state.rateLimited === true ) type = 'error';

    var html = '<img src="lib/' + type + '.apng" style="width: 19px; height: 19px;">';
    var spinner = $('<div>').html(html);

    if ( returnHtml === true ) return spinner.html();
    return spinner;

};