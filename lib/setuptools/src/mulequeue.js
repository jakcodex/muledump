//  mulequeue base object
setuptools.app.mulequeue = {
    task: {},               //  task methods
    ui: {},                 //  ui-related methods
    state: {
        active: false,                          //  whether or not the background task is actively doing something
        bgHealth: false,                        //  health state of background task
        bgPing: false,                          //  last ping from the background task at its start
        bgTask: undefined,                      //  interval reference for background task
        busy: 0,                                //  number of running tasks (caps at mqConcurrent)
        displayIgn: false,                      //  whether or not to display user ign in Mulequeue History
        estimateFinishTime: 0,                  //  estimated time a queue will finish
        lastTaskFinished: 0,                    //  most recently finished tasks's timestamp
        paused: false,                          //  whether or not a queue is paused
        rateLimited: false,                     //  whether or not we are rate limited (Date.now() of rate limit detection)
        queuePeak: 0,                           //  maximum size seen of a running queue
        running: false,                         //  whether or not a queue or task is running
        timePerTaskAverage: 2000,               //  average time it takes to run each task in milliseconds
        topListPos: 0,                          //  current top listPos for mulequeue manager paging,
    },
    queue: [],              //  list of guids in queue (corresponds to tasks)
    tasks: {},              //  task configuration data
    history: {data: []},    //  history of queue tasks
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

        window.techlog('MuleQueue/bgHealth starting background task');
        setuptools.app.mulequeue.state.active = false;
        setuptools.app.mulequeue.state.bgHealth = false;
        setuptools.app.mulequeue.state.running = false;
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
        window.techlog('MuleQueue/TaskStart - ' + guid);
        if ( mules[guid] instanceof Mule ) {
            mules[guid].query(task.ignore_cache, task.cache_only, false, MuleQueue);
        } else setuptools.app.mulequeue.task.cancel(guid);

    });

};

//  background tasks processes queue items
setuptools.app.mulequeue.task.background = function() {

    //  start the background task if it isn't already running
    if ( !setuptools.app.mulequeue.state.bgTask ) {

        setuptools.app.mulequeue.state.bgTask = setInterval(
            setuptools.app.mulequeue.task.background,
            setuptools.config.mqBGDelay
        );

    }

    //  general tasks
    if (
        setuptools.app.mulequeue.state.running === true &&
        setuptools.app.mulequeue.state.paused === false &&
        typeof setuptools.lightbox.active['mulequeue-manager'] === 'object' &&
        typeof setuptools.app.mulequeue.queuemanager === 'object'
    ) setuptools.app.mulequeue.queuemanager.Modifiers.callbacks.update();

    //  check for rate limiting
    if ( setuptools.app.mulequeue.state.rateLimited === true ) {
        setuptools.app.mulequeue.task.ping();
        return;
    }

    //  don't run if background task is already active or paused
    if ( setuptools.app.mulequeue.state.active === true ) return;

    //  ping
    setuptools.app.mulequeue.task.ping();

    //  check if the queue is paused
    if ( setuptools.app.mulequeue.state.paused === true ) return;

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

            window.techlog('MuleQueue/TaskWait - ' + Math.ceil(window.accountLoadDelay-lastRunDifference) + ' seconds until next cycle', 'aggregate');
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
                if ( typeof guid === 'string' && !(mules[guid] instanceof Mule) ) {
                    setuptools.app.mulequeue.task.cancel(guid);
                    continue;
                }
                if ( setuptools.app.mulequeue.tasks[guid].state === 'queue' ) break;

            }

            //  execute the task if a guid was found
            //  if all tasks are running/paused we won't run
            setuptools.app.mulequeue.task.start(guid);

        }

    }

};

/*/
// mulequeue mule tasks
/*/

//  save mulequeue cache data to local storage
setuptools.app.mulequeue.task.saveConfig = function(returnData) {

    var Config = {
        date: Date.now(),
        state: {
            paused: setuptools.app.mulequeue.state.paused,
            queuePeak: setuptools.app.mulequeue.state.queuePeak,
            timePerTaskAverage: setuptools.app.mulequeue.state.timePerTaskAverage,
            lastTaskFinished: setuptools.app.mulequeue.state.lastTaskFinished
        },
        queue: []
    };

    if ( returnData === true ) return Config;

    for ( var guid in setuptools.app.mulequeue.tasks )
        if (setuptools.app.mulequeue.tasks.hasOwnProperty(guid))
            if ( setuptools.app.mulequeue.tasks[guid].action === 'reload' )
                if ( setuptools.app.mulequeue.tasks[guid].state === 'queue' )
                    Config.queue.push(guid);

    setuptools.storage.write('mulequeue:config', Config);

};

//  load mulequeue history and cache data and import it if necessary
setuptools.app.mulequeue.task.loadConfig = function() {

    //  import any mulequeue cache data
    var ConfigJson = setuptools.storage.read('mulequeue:config');
    var Config;
    try {
        Config = JSON.parse(ConfigJson);
    } catch(e) {}
    if (
        typeof Config === 'object' &&
        Config !== null
    ) {

        if ( Config.queue.length === 0 ) Config.state.paused = false;
        $.extend(true, setuptools.app.mulequeue.state, Config.state);

        //  load queue cache if it isn't stale
        if ( (Date.now()-Config.date) < setuptools.config.mqStaleCache && Array.isArray(Config.queue) && Config.queue.length > 0 ) {

            //  filter out disabled or banned accounts
            var count = 0;
            if ( setuptools.state.loaded === true ) Config.queue = Config.queue.filter(function(item) {

                if (
                    typeof setuptools.data.accounts.accounts[item] === 'object' &&
                    setuptools.data.accounts.accounts[item].enabled === true &&
                    (
                        typeof setuptools.data.accounts.accounts[item].banned === 'undefined' ||
                        setuptools.data.accounts.accounts[item].banned === false
                    ) &&
                    typeof window.accounts[item] === 'string'
                ) return true;

                //  count non-matching items
                count++;
                return false;

            });

            setuptools.app.mulequeue.state.lastTaskFinished = new Date(setuptools.app.mulequeue.state.lastTaskFinished);
            setuptools.app.mulequeue.task.reload(Config.queue);
            if ( Config.state.paused === true ) $('#mulequeue').addClass('paused');
            setuptools.app.mulequeue.state.running = true;

            //  save any cleanup changes
            if ( count > 0 ) setuptools.app.mulequeue.task.saveConfig();

        }

    }

    var HistoryJson = setuptools.storage.read('mulequeue:history');
    var History;
    try {
        History = JSON.parse(HistoryJson);
    } catch (e) {}
    if (
        typeof History === 'object' &&
        History !== null
    ) {

        setuptools.app.mulequeue.history = History;

    }

};

setuptools.app.mulequeue.task.rateLimitCancel = function() {

    clearInterval(setuptools.app.mulequeue.state.rateLimitTimer);
    delete setuptools.app.mulequeue.state.rateLimitExpiration;
    delete setuptools.app.mulequeue.state.rateLimitTimer;
    setuptools.storage.delete('ratelimitexpiration');
    setuptools.app.mulequeue.state.rateLimited = false;
    $('div.mulequeue.progress > div.bar').removeClass('rateLimited nopulse');
    if ( setuptools.data.config.animations === 1 ) $('#stickynotice').removeClass('rateLimited nopulse');

    //  reset spinners
    for ( var task in setuptools.app.mulequeue.tasks ) {

        if ( setuptools.app.mulequeue.tasks.hasOwnProperty(task) ) {

            if ( setuptools.app.mulequeue.tasks[task].state === 'queue' && setuptools.data.config.animations === 1 ) {

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
    setuptools.app.mulequeue.ui.progressBar();
    window.techlog('MuleQueue/RateLimit expired', 'force');

};

//  rate limit all tasks
setuptools.app.mulequeue.task.rateLimit = function(soft) {

    function RateLimitTimer() {

        var RateLimitRemaining = ((setuptools.app.mulequeue.state.rateLimitExpiration - Date.now()) / 1000 / 60).toFixed(2);
        if (RateLimitRemaining <= 0) {

            setuptools.app.mulequeue.task.rateLimitCancel();

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
            $('#mulequeue').addClass('rateLimited');
            $('#stickynotice').html(' \
                <div class="flex-container">\
                    <div>Warning: Your account is <a href="' + setuptools.config.ratelimitHelp + '" class="rateLimited nopulse orange" target="_blank">rate limited</a> by Deca. \
                    You must wait ' + RateLimitTime + ' before you can reload your account.</div> \
                    <div class="flex-container noFlexAutoWidth nohover muledump setuptools link resetratelimit noclose menuStyle negative ml5" title="Reset Rate Limiter" style="width: auto; background: rgba(0, 0, 0, 0.4);"><div style="font-weight: normal; ">&#9735; Reset</div></div>\
                </div> \
            ');
            $('div.mulequeue.progress > div.percentage').html(' \
                <div class="flex-container">\
                    <div>You are <a href="' + setuptools.config.ratelimitHelp + '" class="rateLimited nopulse" target="_blank">rate limited</a> and must wait ' + RateLimitTime + ' before continuing.</div>\
                    <div class="flex-container noFlexAutoWidth nohover muledump setuptools link resetratelimit noclose menuStyle negative ml5" title="Reset Rate Limiter" style="width: auto; background: rgba(0, 0, 0, 0.4);"><div style="font-weight: normal; ">&#9735; Reset</div></div> \
                </div>\
            ');
            $('div.muledump.resetratelimit').off('click.muledump.resetratelimit').on('click.muledump.resetratelimit', function() {
                setuptools.app.mulequeue.task.rateLimitCancel();
            });

        }

    }

    //  prepare the rate limit
    window.techlog('MuleQueue/RateLimit detected', 'force');
    setuptools.app.mulequeue.state.rateLimited = true;
    if ( soft !== true ) {

        setuptools.app.mulequeue.state.rateLimitExpiration = Date.now()+setuptools.config.mqRateLimitExpiration;

        //  write it to storage
        setuptools.storage.write('ratelimitexpiration', setuptools.app.mulequeue.state.rateLimitExpiration);

        setuptools.app.ga('send', 'event', {
            eventCategory: 'rateLimited',
            eventAction: 'hard'
        });

    } else {

        setuptools.app.ga('send', 'event', {
            eventCategory: 'rateLimited',
            eventAction: 'soft'
        });

    }

    //  reset state for any tasks that encountered rate limiting
    if ( setuptools.app.mulequeue.queue.length > 0 ) {
        for (var index = (setuptools.app.mulequeue.state.busy - 1); index >= 0; index--) {

            setuptools.app.mulequeue.tasks[setuptools.app.mulequeue.queue[index]].state = 'queue';

            if ( setuptools.data.config.animations === 1 ) {

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
    setuptools.app.mulequeue.state.active = false;
    //setuptools.app.mulequeue.state.queuePeak = 0;
    $('div.mulequeue.progress > div.bar').addClass('rateLimited nopulse');
    if ( setuptools.data.config.animations === 1 ) $('#stickynotice').addClass('rateLimited nopulse');

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
        if ( setuptools.data.config.animations === 1 ) config.reloader.empty().append(setuptools.app.mulequeue.spinner.running()).attr('title', 'Task is waiting in MuleQueue');

        setuptools.app.mulequeue.queue.push(guids[i]);                          //  sets queue order
        setuptools.app.mulequeue.tasks[guids[i]] = $.extend(true, {}, config);  //  sets queue config data
        window.techlog('MuleQueue/AddTask queuing ' + guids[i]);

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

    setuptools.app.mulequeue.state.running = true;

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
    var taskIndex = setuptools.app.mulequeue.task.reorder(guid);

    //  we won't run the request if we're rate limited
    if ( setuptools.app.mulequeue.state.rateLimited === true ) return;

    //  run the task
    setuptools.app.mulequeue.state.busy++;
    $('#mulequeue').addClass('running');

    //  update task state
    setuptools.app.mulequeue.tasks[guid].state = 'running';
    setuptools.app.mulequeue.tasks[guid].startTime = new Date;
    if ( setuptools.data.config.animations === 1 ) setuptools.app.mulequeue.tasks[guid].reloader.empty().append(setuptools.app.mulequeue.spinner.running('running')).attr('title', 'Mule data request running...');
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
            task.finishTime = new Date;
            task.runTime = task.finishTime-task.startTime;
            setuptools.app.mulequeue.state.timePerTaskAverage = Math.round((setuptools.app.mulequeue.state.timePerTaskAverage+task.runTime)/2);
            task.response = response;

            if ( response.status === 'error' ) {

                if ( setuptools.data.config.animations === 1 ) task.reloader.empty().append(setuptools.app.mulequeue.spinner.running('error')).attr('title', 'Error loading account: ' + response.errorMessage);

            } else {

                /*  now redundant  ///
                //  remove any errors
                var errors = $('#errors');
                var error = errors.find('div[data-guid="' + response.guid + '"]');
                error.remove();
                if ( errors.html() === '' ) errors.remove();
                */

                //  replace the reloader
                task.reloader.empty().text('\u21bb').attr('title', 'last updated: ' + (new Date(mules[response.guid].data.query.created)).toLocaleString());

            }

            setuptools.app.mulequeue.state.lastTaskFinished = task.finishTime;

            window.techlog(
                'MuleQueue/TaskFinish ' +
                '- ' + response.guid +
                ' \'' + response.status + '\'' + ((response.errorMessage) ?
                ' - \'' + response.errorMessage + '\'' :
                ' - runtime ' + (task.runTime/1000).toFixed(2) + ' seconds') +
                ' - waited ' + Math.floor((task.finishTime-task.creation)/1000) + ' seconds' +
                ' - remaining tasks ' + (setuptools.app.mulequeue.queue.length-1),
                'force'
            );

            //  log the history message
            setuptools.app.mulequeue.task.history({
                action: task.action,
                cache_only: task.cache_only,
                ignore_cache: task.ignore_cache,
                time: new Date,
                creation: task.creation,
                finish: task.finishTime,
                state: task.state,
                guid: response.guid,
                ign: ( (
                    setuptools.state.loaded === true &&
                    setuptools.app.config.determineFormat(setuptools.data.accounts) === 1
                ) ? (setuptools.data.accounts.accounts[response.guid] && setuptools.data.accounts.accounts[response.guid].ign) : undefined ),
                status: response.status,
                errorMessage: response.errorMessage || undefined,
                runtime: (task.runTime / 1000).toFixed(2),
                waited: Math.floor((task.finishTime - task.creation) / 1000)
            });

            setuptools.app.ga('send', 'event', {
                eventCategory: 'detect',
                eventAction: 'mqAccountFinish'
            });

            //  update mulequeue history if it is open
            if (
                typeof setuptools.lightbox.active['mulequeue-history'] === 'object' &&
                typeof setuptools.lightbox.menu.paginate.state.QueueHistory === 'object'
            ) setuptools.lightbox.menu.paginate.state.QueueHistory.Modifiers.callbacks.update();

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

            //  save the queue cache to resume later if any accounts remain in queue
            setuptools.app.mulequeue.task.saveConfig();

        }

    });

};

setuptools.app.mulequeue.task.history = function(record) {

    if ( Array.isArray(setuptools.app.mulequeue.history.data) === false ) setuptools.app.mulequeue.history.data = [];
    if ( typeof setuptools.app.mulequeue.history.stats === 'undefined' ) setuptools.app.mulequeue.history.stats = {
        ok: 0,
        error: 0,
        cors: 0,
        accountInUse: 0,
        banned: 0,
        cache: 0,
        rateLimited: 0,
        otherError: 0
    };
    setuptools.app.mulequeue.history.data.splice(0, 0, record);
    setuptools.app.mulequeue.history.data.splice(setuptools.data.config.mqKeepHistory);

    //  parse the record
    if ( record.status === 'ok' ) setuptools.app.mulequeue.history.stats.ok++;
    if ( record.status === 'cache' ) setuptools.app.mulequeue.history.stats.cache++;
    if ( record.status === 'error' ) {

        setuptools.app.mulequeue.history.stats.error++;
        if ( record.errorMessage.match(/CORS/) ) {
            setuptools.app.mulequeue.history.stats.cors++;
        }
        else if ( record.errorMessage.match(/rate limited/) ) {
            setuptools.app.mulequeue.history.stats.rateLimited++;
        }
        else if ( record.errorMessage.match(/banned/) ) {
            setuptools.app.mulequeue.history.stats.banned++;
        }
        else if ( record.errorMessage.match(/Account in use/) ) {
            setuptools.app.mulequeue.history.stats.accountInUse++;
        } else setuptools.app.mulequeue.history.stats.otherError++;

    }

    setuptools.storage.write('mulequeue:history', setuptools.app.mulequeue.history);

};

//  pause tasks and update the ui
setuptools.app.mulequeue.task.pause = function(callback) {

    if ( setuptools.app.mulequeue.state.rateLimited === false ) $('#mulequeue').removeClass('running').addClass('paused');
    setuptools.app.mulequeue.state.paused = true;
    setuptools.app.mulequeue.task.saveConfig();
    var pauseList = setuptools.app.mulequeue.queue;

    for ( var i = 0; i < pauseList.length; i++ ) {

        var task = setuptools.app.mulequeue.tasks[pauseList[i]];
        if ( task.state === 'queue' ) {

            if ( setuptools.data.config.animations === 1 ) task.reloader.empty().append(setuptools.app.mulequeue.spinner.running('pause')).attr('title', 'Task paused in MuleQueue');
            $('div.queuetask[data-listPos="' + i + '"] > div:first-child').html(setuptools.app.mulequeue.spinner.running('pause', true)).attr('title', 'Task paused in MuleQueue');

        }


    }

    if ( typeof callback === 'function' ) callback();
    window.techlog('MuleQueue/TaskPause');

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

        if ( setuptools.app.mulequeue.state.rateLimited === false ) $('#mulequeue').removeClass('paused').addClass('running');
        setuptools.app.mulequeue.state.paused = false;
        pauseList = setuptools.app.mulequeue.queue;

    }

    if ( pauseList.length === 0 ) return;
    for ( var i = 0; i < pauseList.length; i++ ) {

        var task = setuptools.app.mulequeue.tasks[pauseList[i]];
        if ( task.state === 'queue' ) {

            if ( setuptools.data.config.animations === 1 ) task.reloader.empty().append(setuptools.app.mulequeue.spinner.running('queue')).attr('title', 'Task is waiting in MuleQueue');
            $('div.queuetask[data-listPos="' + i + '"] > div:first-child').html(setuptools.app.mulequeue.spinner.running('queue', true)).attr('title', 'Task is waiting in MuleQueue');

        }

    }

    setuptools.app.mulequeue.state.running = true;
    setuptools.app.mulequeue.state.lastTaskFinished = ((new Date)-(window.accountLoadDelay*1000));
    if ( typeof callback === 'function' ) callback();
    window.techlog('MuleQueue/TaskResume');

};

//  cancel task on all or specified guids
setuptools.app.mulequeue.task.cancel = function(guids, callback) {

    if ( typeof guids === 'function' ) {

        callback = guids;
        guids = [];

    }

    //  parse guids
    var cancelAll = false;
    if ( !guids ) guids = [];
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);
    if ( guids.length === 0 ) {
        cancelAll = true;
        guids = setuptools.app.mulequeue.queue;
    }
    window.techlog('MuleQueue/TaskCancel clearing ' + guids.length + ' tasks', 'force');

    //  cancel and remove all queued tasks
    for ( var i = (guids.length-1); i >= 0; i-- ) {

        var guid = guids[i];
        var task = setuptools.app.mulequeue.tasks[guid];
        if ( ['queue', 'error'].indexOf(task.state) > -1 ) {

            if ( mules[guid] instanceof Mule && mules[guid].loginOnly !== true ) setuptools.app.mulequeue.tasks[guid].reloader.empty().text('\u21bb').attr('title', 'last updated: ' + ( (typeof mules[guid].data === 'object') ?
                (Date(mules[guid].data.query.created)).toLocaleString() :
                'Unknown'
            ));
            delete setuptools.app.mulequeue.tasks[guid];
            setuptools.app.mulequeue.queue.splice(setuptools.app.mulequeue.queue.indexOf(guid), 1);
            setuptools.app.mulequeue.queue.filter(function (item) {
                return item !== undefined
            }).join();

        }

    }

    setuptools.app.mulequeue.task.saveConfig();
    if ( cancelAll === false ) return;

    //  clean up if we cancelled all tasks
    setuptools.app.mulequeue.state.paused = false;
    setuptools.app.mulequeue.state.running = false;
    setuptools.app.mulequeue.state.active = false;
    setuptools.app.mulequeue.state.busy = 0;
    setuptools.app.mulequeue.state.queuePeak = 0;
    $('#mulequeue').removeClass('running paused');
    if ( typeof callback === 'function' ) callback();

};

//  reorder task position specified guids
setuptools.app.mulequeue.task.reorder = function(guids, position) {

    if ( typeof guids === 'undefined' ) setuptools.lightbox.error('Argument "guids" is required.', 1000);

    //  parse guids
    guids = setuptools.app.mulequeue.task.guidsCheck(guids);

    if ( typeof position !== 'number' ) position = 0;
    for ( var i = 0; i < guids.length; i++ ) {

        var guid = guids[i];
        var taskIndex = setuptools.app.mulequeue.queue.indexOf(guid);
        var taskPosition = setuptools.app.mulequeue.state.busy+position;
        if (taskIndex !== taskPosition) {

            window.techlog('MuleQueue/Start pushing ' + guids[i] + ' to position ' + taskPosition);
            setuptools.app.mulequeue.queue.splice(taskIndex, 1);
            setuptools.app.mulequeue.queue.splice(taskPosition, 0, guid);
            setuptools.app.mulequeue.queue.filter(function (item) {
                return item !== undefined
            }).join();

        }

        if ( guids.length === 1 ) return taskPosition;

    }

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
            option: 'hover',
            action: 'close',
            timer: 'muleMenuMouseLeaveTimer'
        },
        {
            option: 'afterClose',
            callback: setuptools.app.mulequeue.menu
        },
        {
            option: 'skip',
            value: 'reposition'
        },
        {
            option: 'pos',
            v: 'top',
            h: 'left',
            vpx: MuleQueueButton.outerHeight(true) + 4
        },
        {
            option: 'customPos',
            vpx: MuleQueueButton[0].offsetTop,
            hpx: MuleQueueButton[0].offsetLeft
        },
        {
            option: 'class',
            value: 'smallMenuCells mulequeue-topMenu'
        },
        {   option: 'css',
            css: {
                position: 'fixed'
            }
        },
        {
            class: 'openManager',
            name: setuptools.app.mulequeue.queue.length + ' Task' + YesIAmSplittingHairs + ' ' + ( (setuptools.app.mulequeue.state.paused === false) ? 'Running' : 'Paused' ),
            callback: function() {
                setuptools.lightbox.menu.context.closeSkip('mulequeue-menu');
                setuptools.app.mulequeue.ui.manager();
            },
            override: ['afterClose']
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

        if ( MuleQueueButton.hasClass('running') === true || MuleQueueButton.hasClass('paused') === true ) {

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

    new setuptools.lightbox.menu.context.create('mulequeue-menu', false, MuleQueueButton, options);

};

//  draw ui buttons reflecting the current state
setuptools.app.mulequeue.ui.drawButtons = function() {

    var html = '';

    if ( setuptools.app.mulequeue.state.running === false ) {

        html += ' \
            <div class="setuptools menuStyle buttonStyle positive mulequeue main menu reload noselect fright flex-container" title="Reload All Accounts">\
                &#9658;\
            </div> \
        ';

    } else {

        if ( setuptools.app.mulequeue.state.paused === false ) {

            html += ' \
                <div class="setuptools menuStyle buttonStyle mulequeue main menu pause noselect fright flex-container" title="Pause Queue">&#10073;&#10073;</div> \
            ';

        } else {

            //  reload &#8634;
            html += ' \
                <div class="setuptools menuStyle buttonStyle mulequeue main menu resume noselect fright flex-container" title="Resume Queue">&#9658;</div> \
            ';

        }

        html += ' \
            <div class="setuptools menuStyle buttonStyle negative mulequeue main menu cancel noselect fright flex-container" title="Cancel Queue">&#10060;</div> \
        ';

    }

    html += ' \
        <div class="fleft flex-container nohover mulequeue queueCount">' + setuptools.app.mulequeue.queue.length + ' Accounts in Queue</div>\
        <div class="fleft flex-container nohover mulequeue setuptools link history menuStyle buttonStyle" title="View Task History"><div style="font-weight: normal; overflow: hidden; margin-top: -2px;">&#9732;</div></div> \
        ' + ( (setuptools.state.loaded === true) ? '<div class="fleft flex-container nohover mulequeue setuptools link nameswap noclose menuStyle buttonStyle" title="Switch Account Name Display"><div style="font-weight: normal; overflow: hidden;">&#9788;</div></div>' : '' ) + ' \
        ' + ( (setuptools.app.mulequeue.state.rateLimited === true) ? '<div class="fleft flex-container nohover mulequeue setuptools link resetratelimit noclose menuStyle negative buttonStyle" title="Reset Rate Limiter"><div style="font-weight: normal; overflow: hidden;">&#9735;</div></div>' : '' ) + ' \
    ';

    return html;

};

setuptools.app.mulequeue.ui.secondsToHms = function(d) {
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
};

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
        if ( html === '' ) html = ' \
            <div class="flex-container queuetask noselect" style="justify-content: flex-start;"> \
                <div style="flex-basis: 100%; justify-content: space-between; border: 0;" class="menuStyle buttonStyle neutral textLeft w100 select mr0">\
                    No accounts in queue \
                </div> \
            </div>\
        ';
        return html;

    }

    function createRow(listPos) {

        //  determine estimated wait time in seconds and account for next runtime
        var AccountLoadDelay = window.accountLoadDelay;
        var TimePerTask = Math.round(setuptools.app.mulequeue.state.timePerTaskAverage/1000);
        var LastRunDiff = ( setuptools.app.mulequeue.state.lastTaskFinished === 0 ) ? 0 : Math.ceil((Date.now()-setuptools.app.mulequeue.state.lastTaskFinished)/1000);
        if ( LastRunDiff > AccountLoadDelay ) LastRunDiff = AccountLoadDelay;

        var NextRun = AccountLoadDelay-LastRunDiff;
        if ( NextRun < 0 ) NextRun = 0;
        var WaitTime = {
            estimation: (((listPos+1)*(AccountLoadDelay+TimePerTask))-LastRunDiff)
        };
        if ( listPos === 0 ) WaitTime.estimation = (NextRun+TimePerTask);
        if ( WaitTime.estimation < 0 ) WaitTime.estimation = 0;
        if ( setuptools.app.mulequeue.state.rateLimited === true ) WaitTime.estimation = (WaitTime.estimation+Math.ceil((setuptools.app.mulequeue.state.rateLimitExpiration-Date.now())/1000)+( (listPos > 0) ? AccountLoadDelay : 0 ));
        WaitTime.length = setuptools.app.mulequeue.ui.secondsToHms(WaitTime.estimation);

        if ( listPos === (setuptools.app.mulequeue.queue.length-1) ) setuptools.app.mulequeue.state.estimateFinishTime = WaitTime.estimation;

        return ' \
            <div class="flex-container queuetask noselect" style="justify-content: flex-start;" data-listPos="' + listPos + '" data-guid="' + QueueList[listPos] + '"> \
                <div class="flex-container textCenter" style="justify-content: flex-start;" title="Queue Position: ' + (listPos+1) + '">' + (
            ( setuptools.data.config.animations === -1 ) ?
                '<div class="menuStyle buttonStyle neutral textCenter mr0">' + (listPos+1) + '</div>' :
                setuptools.app.mulequeue.spinner.running(undefined, true)
            ) + '</div> \
                <div class="menuStyle buttonStyle neutral textLeft w100 select mr0">\
                    <div class="select">' + ( (
                        setuptools.state.loaded === true &&
                        setuptools.data.config.mqDisplayIgn === true &&
                        typeof setuptools.data.accounts.accounts[QueueList[listPos]].ign === 'string'
                    ) ? setuptools.data.accounts.accounts[QueueList[listPos]].ign : QueueList[listPos] ) + '</div> \
                    <div class="flex-container noFlexAutoJustify">\
                        ' + WaitTime.length + ' \
                    </div> \
                </div> \
                <div class="flex-container">\
                    <div class="flex-container setuptools menuStyle buttonStyle link taskMenu noclose mr0">&#8801;</div> \
                </div>\
            </div>\
        ';

    }

    function QueueManagerContext() {

        $('div.setuptools.link.taskMenu').unbind('click').click(function() {

            var listPos = $(this).parent().parent().attr('data-listpos');

            if ( setuptools.lightbox.menu.context.isOpen('taskMenu') === true ) {

                setuptools.lightbox.menu.context.close('taskMenu');
                if ( listPos === setuptools.tmp.taskMenuListPos ) return;

            }

            setuptools.tmp.taskMenuListPos = listPos;
            var options = [{
                option: 'reposition',
                parentClass: 'queuetask',
                menuClass: 'taskMenu',
                attr: 'data-listpos',
                value: listPos
            },
            {
                option: 'watch',
                class: 'queuetask',
                attr: 'data-guid',
                value: QueueList[listPos]
            },
            {
                option: 'hover',
                action: 'close',
                timer: 'mulequeueMenuHoverClose'
            },
            {
                option: 'css',
                css: {
                    width: 'auto',
                }
            },
            {
                option: 'pos',
                h: 'right',
                hpx: 25,
                vpx: 30
            },
            {
                option: 'header',
                value: QueueList[listPos]
            },
            {
                class: 'runTask',
                name: 'Run Task Immediately',
                callback: function(guid) {
                    setuptools.app.mulequeue.task.start(guid);
                    QueueManagerUpdate();
                },
                callbackArg: QueueList[listPos]
            },
            {
                class: 'moveTaskToStart',
                name: 'Run Task Next',
                callback: function(guid) {
                    setuptools.app.mulequeue.task.reorder(guid);
                    QueueManagerUpdate();
                },
                callbackArg: QueueList[listPos]
            },
            {
                class: 'cancelTask',
                name: 'Cancel Task',
                callback: function(guid) {
                    setuptools.app.mulequeue.task.cancel(guid);
                    QueueManagerUpdate();
                },
                callbackArg: QueueList[listPos]
            },
            {
                class: 'copyMenuOpen',
                name: "Copy...",
                callback: setuptools.app.muledump.copymenu,
                callbackArg: QueueList[listPos]
            }];


            new setuptools.lightbox.menu.context.create('taskMenu', false, $(this), options, $(this));

        });

        $('div.mulequeue.main.menu').unbind('click').click(function() {

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
        $('div.mulequeue.menu.refresh').unbind('click').click(function() {

            setuptools.lightbox.close();
            setuptools.app.mulequeue.ui.manager();

        });

        $('div.setuptools.link.history').unbind('click').click(function() {
            setuptools.app.mulequeue.ui.history();
        });

        $('div.setuptools.link.nameswap').unbind('click').click(function() {
            setuptools.data.config.mqDisplayIgn = !(setuptools.data.config.mqDisplayIgn);
            setuptools.app.config.save('MuleQueue display format update', true);
            QueueManagerUpdate();
        });

        $('div.setuptools.link.resetratelimit').off('click.setuptools.resetratelimit').on('click.setuptools.resetratelimit', function(e) {

            setuptools.app.mulequeue.task.rateLimitCancel();

        });

    }

    //  update our displayed position within the accounts list
    function QueueManagerUpdate(page) {

        if ( !page && typeof setuptools.lightbox.menu.paginate.state.QueueList === 'object' ) page = setuptools.lightbox.menu.paginate.state.QueueList.currentPage;
        if ( ['string', 'number', 'undefined'].indexOf(typeof page) === -1 ) return;

        //  reset page state
        setuptools.app.mulequeue.queuemanager = new setuptools.lightbox.menu.paginate.create(
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
            <div class="setuptools app list w100 cboth">\
                ' + ListQueue(undefined, QueueManagerPaginate.currentPage) + ' \
            </div> \
        ');

        //  update the customPage value
        if ( customPageFocus ) customPage.focus().val('').val(customPageNumber);

        setuptools.app.mulequeue.ui.progressBar();
        QueueManagerPaginate.bind();

    }

    setuptools.lightbox.close('mulequeue-manager');

    //  create our pagination object
    var QueueList = setuptools.app.mulequeue.queue;
    setuptools.app.mulequeue.queuemanager = new setuptools.lightbox.menu.paginate.create(
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
            search: {
                container: 'div.QueueSearch',
                keys: ['ign', 'username']
            }
        }
    );
    var QueueManagerPaginate = setuptools.app.mulequeue.queuemanager;

    var currentPage = 0;
    if ( typeof guid === 'string' ) {

        setuptools.lightbox.menu.paginate.findPage(guid, 'QueueList');
        currentPage = setuptools.lightbox.menu.paginate.state.QueueList.currentPage;

    }

    var AReduced = '';
    var rateLimited = '';
    if ( setuptools.data.config.animations < 1 ) AReduced = 'AReduced';
    if ( setuptools.app.mulequeue.state.rateLimited === true ) rateLimited = 'rateLimited';
    setuptools.lightbox.build('mulequeue-manager', ' \
        <div class="mulequeue progress w100 flex-container ' + AReduced + '">\
            <div class="percentage">No Tasks</div> \
            <div class="bar ' + rateLimited + ' nopulse">\
                <div class="w100 h100">&nbsp;</div>\
            </div>\
        </div>\
        <div class="setuptools mulequeue manager">\
            <div class="QueueList list w100">\
                <div class="fleft cboth mb5 w100">' + QueueManagerPaginate.html.menu + '</div> \
                <div class="setuptools app list w100 cboth">\
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
    setuptools.lightbox.drawhelp('mulequeue-manager', 'docs/setuptools/help/mulequeue/manager', 'MuleQueue Help');
    setuptools.lightbox.display('mulequeue-manager', {variant: 'fl-MuleQueueManager'});

    setuptools.app.mulequeue.ui.progressBar();
    QueueManagerPaginate.bind();

};

//  update any mulequeue progress bar
setuptools.app.mulequeue.ui.progressBar = function(jobsRemaining, jobsTotal) {

    if ( setuptools.app.mulequeue.state.rateLimited === true ) {
        return;
    }
    if ( setuptools.app.mulequeue.state.queuePeak === 0 ) {

        jobsRemaining = 0;
        jobsTotal = 1;

    }

    if ( !jobsRemaining ) jobsRemaining = setuptools.app.mulequeue.queue.length;
    if ( !jobsTotal ) jobsTotal = setuptools.app.mulequeue.state.queuePeak;
    var jobsCompleted = jobsTotal-jobsRemaining;
    var percentage = Math.floor((jobsCompleted/jobsTotal)*100);
    if ( percentage < 0 ) percentage = 0;

    if ( jobsRemaining !== 0 ) {

        $('.ldBar').attr('data-value', percentage);
        $('.mulequeue.progress > .bar').css({width: percentage + '%'});
        $('.mulequeue.progress > .percentage').text(percentage + '% Complete');

    } else {

        $('.ldBar').attr('data-value', 0);
        $('.mulequeue.progress > .bar').css({width: 0 + '%'});
        $('.mulequeue.progress > .percentage').text('No Tasks');

    }

};

//  display mulequeue history
setuptools.app.mulequeue.ui.history = function() {

    var Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    var Widths = ['17%', '54%', '11%', '9%', '9%'];

    var ListRecord = function(dummy, page) {

        if ( typeof page !== 'number' ) page = 0;
        var QueueHistory = setuptools.lightbox.menu.paginate.state.QueueHistory.PageList;

        if ( page > setuptools.lightbox.menu.paginate.state.QueueHistory.lastPage ) page = setuptools.lightbox.menu.paginate.state.QueueHistory.lastPage;
        $('div.QueueHistory div.customPage input[name="customPage"]').val(page+1);

        //  determine our boundaries
        var minIndex = setuptools.data.config.accountsPerPage*page;
        var maxIndex = (setuptools.data.config.accountsPerPage*page)+setuptools.data.config.accountsPerPage;
        if ( maxIndex > QueueHistory.length ) maxIndex = QueueHistory.length;
        if ( QueueHistory.length <= setuptools.data.config.accountsPerPage ) {
            minIndex = 0;
            maxIndex = QueueHistory.length;
        }

        //  generate the page html
        var html = '';
        for ( var i = minIndex; i < maxIndex; i++ ) html += createRow(i);
        if ( html === '' ) {
            html = ' \
                <div class="flex-container history noselect" style="justify-content: flex-start;"> \
                    <div style="flex-basis: 100%; justify-content: space-between; border: 0;" class="menuStyle buttonStyle neutral textLeft w100 select mr0">\
                        No history recorded \
                    </div> \
                </div>\
            ';
        } else {

            html = ' \
                <div class="flex-container historyitem noselect menuStyle buttonStyle neutral textLeft w100 select mr0" style="font-weight: bold; justify-content: space-between; border: 0;">\
                    <div style="width: ' + Widths[0] + ';">Time</div> \
                    <div style="width: ' + Widths[1] + ';">Account</div> \
                    <div style="width: ' + Widths[2] + ';" class="textCenter">Waited</div> \
                    <div style="width: ' + Widths[3] + ';" class="textCenter">Runtime</div> \
                    <div style="width: ' + Widths[4] + ';" class="textCenter">Status</div> \
                </div>\
            ' + html;

        }
        return html;

    };

    var createRow = function(listPos) {

        var QueueHistory = setuptools.lightbox.menu.paginate.state.QueueHistory.PageList;
        var QueueRecord = QueueHistory[listPos];
        var date = new Date(QueueRecord.finish);
        var hour = ( date.getHours() > 12 ) ? (date.getHours()-12).toString() : date.getHours().toString();
        var minutes = date.getMinutes().toString();
        var seconds = date.getSeconds().toString();
        if ( hour.length === 1 ) hour = '0' + hour;
        if ( minutes.length === 1 ) minutes = '0' + minutes;
        if ( seconds.length === 1 ) seconds = '0' + seconds;
        var ampm = ( date.getHours() > 12 ) ? 'PM' : 'AM';
        var record = {
            date: Months[date.getMonth()] + ' ' + date.getDate() + ', ' + hour + ':' + minutes + ':' + seconds + ' ' + ampm,
            guid: setuptools.app.muledump.getName(QueueRecord.guid),
            waittime: setuptools.app.mulequeue.ui.secondsToHms(QueueRecord.waited),
            runtime: QueueRecord.runtime + 's',
            status: ( ( typeof QueueRecord.errorMessage === 'string' ) ?
                '<a href="#" class="mulequeue link viewError rateLimited nopulse noclose" data-recordId="' + listPos + '">' + QueueRecord.status + '</a>' :
                QueueRecord.status
            )
        };

        var html = '';
        html += ' \
            <div class="flex-container historyitem noselect menuStyle buttonStyle neutral textLeft w100 select mr0 mt5" style="justify-content: space-between; border: 0;" data-listPos="' + listPos + '"> \
        ';

        for ( var column in record) {

            if (record.hasOwnProperty(column)) {

                var index = Object.keys(record).indexOf(column);
                var divClass = '';
                if ( index > 1 ) divClass = 'textCenter';
                html += '<div style="width: ' + Widths[index] + ';" class="' + divClass + '">' + record[column] + '</div>\n';

            }

        }

        html += ' \
            </div>\
        ';

        return html;

    };

    var QueueHistoryContext = function() {

        $('a.mulequeue.link.viewError').unbind('click').click(function() {
            ViewError($(this).attr('data-recordId'));
        });

        $('div.mulequeue.link.manager').unbind('click').click(function() {
            setuptools.lightbox.close();
            setuptools.app.mulequeue.ui.manager();
        });

        $('div.mulequeue.link.nameswap').unbind('click').click(function() {
            setuptools.data.config.mqDisplayIgn = !(setuptools.data.config.mqDisplayIgn);
            setuptools.app.config.save('MuleQueue display format update', true);
            QueueHistoryUpdate();
        });

        $('div.mulequeue.link.refeshHistory').unbind('click').click(function() {
            if ( typeof setuptools.lightbox.menu.paginate.state.QueueHistory === 'object' )
                setuptools.lightbox.menu.paginate.state.QueueHistory.Modifiers.callbacks.update();

        });

    };

    var QueueHistoryUpdate = function(page) {

        if ( !page && typeof setuptools.lightbox.menu.paginate.state.QueueHistory === 'object' ) page = setuptools.lightbox.menu.paginate.state.QueueHistory.currentPage;
        if ( ['string', 'number', 'undefined'].indexOf(typeof page) === -1 ) return;
        var QueueHistoryPaginate = setuptools.lightbox.menu.paginate.state.QueueHistory;
        QueueHistoryPaginate = new setuptools.lightbox.menu.paginate.create(
            setuptools.app.mulequeue.history.data,
            QueueHistoryPaginate.ActionItem,
            QueueHistoryPaginate.ActionContainer,
            QueueHistoryPaginate.ActionSelector,
            QueueHistoryPaginate.ActionCallback,
            QueueHistoryPaginate.ActionContext,
            QueueHistoryPaginate.Modifiers
        );

        //  update currentPage
        if ( typeof page === 'undefined' ) setuptools.lightbox.menu.paginate.findPage(0, 'QueueHistory');
        if ( typeof page === 'string' ) setuptools.lightbox.menu.paginate.findPage(page, 'QueueHistory');
        if ( typeof page === 'number' ) setuptools.lightbox.menu.paginate.state.QueueHistory.currentPage = page;

        //  validate lastPage/currentPage boundary
        var newLastPage = Math.ceil(QueueHistoryPaginate.PageList.length/setuptools.data.config.accountsPerPage);
        if ( newLastPage > 0 ) newLastPage--;
        if ( QueueHistoryPaginate.currentPage > newLastPage ) setuptools.lightbox.menu.paginate.findPage(QueueHistoryPaginate.PageList.length-1, 'QueueHistory');

        //  get the customPage value
        var customPage = $('div.QueueHistory input[name="customPage"]');
        var customPageNumber = customPage.val();
        var customPageFocus = customPage.is(':focus');

        $('div.QueueHistory.list').html(' \
            <div class="fleft cboth mb5 w100">' + QueueHistoryPaginate.html.menu + '</div> \
            <div class="setuptools app list w100 cboth">\
                ' + ListRecord(undefined, QueueHistoryPaginate.currentPage) + ' \
            </div> \
        ');

        //  update the customPage value
        if ( customPageFocus ) $('div.QueueList input[name="customPage"]').focus().val('').val(customPageNumber);

        QueueHistoryPaginate.bind();

    };

    var ViewError = function(listPos) {

        var QueueHistory = setuptools.lightbox.menu.paginate.state.QueueHistory.PageList;
        var QueueRecord = QueueHistory[listPos];
        setuptools.lightbox.build('mulequeue-history-viewError', QueueRecord.errorMessage);
        setuptools.lightbox.settitle('mulequeue-history-viewError', 'Error Message');
        setuptools.lightbox.display('mulequeue-history-viewError', {variant: 'fl-Notice'});

    };

    var pageButtonsHtml = ' \
        <div class="flex-container nohover mulequeue link manager menuStyle buttonStyle noFlexAutoWidth mt5" title="Return to MuleQueue Manager"><div style="font-weight: normal; overflow: hidden; margin-top: -2px;">&#9732;</div></div> \
        ' + ( (setuptools.state.loaded === true) ? '<div class="flex-container nohover mulequeue link nameswap menuStyle buttonStyle noFlexAutoWidth mt5" title="Switch Account Name Display"><div style="font-weight: normal; overflow: hidden;">&#9788;</div></div>' : '' ) + '  \
        <div class="flex-container nohover mulequeue link refeshHistory menuStyle buttonStyle noFlexAutoWidth mt5 fright" title="Refresh"><div style="font-weight: normal; ">&#8634;</div></div>\
    ';

    var QueueHistoryPaginate = new setuptools.lightbox.menu.paginate.create(
        setuptools.app.mulequeue.history.data,
        undefined,
        'QueueHistory',
        'div.QueueHistory div.list',
        ListRecord,
        QueueHistoryContext,
        {
            pageButtons: {html: pageButtonsHtml},
            search: {
                container: false, // disabled for now
                keys: ['guid', 'ign', 'status', 'errorMessage'],
                returnKey: 'guid',
                placeholder: 'Search Records'
            },
            callbacks: {
                update: QueueHistoryUpdate
            }
        }
    );

    setuptools.lightbox.build('mulequeue-history', ' \
        <div class="setuptools mulequeue manager">\
            <div class="QueueHistory list w100">\
                <div class="fleft cboth mb5 w100">' + QueueHistoryPaginate.html.menu + '</div> \
                <div class="setuptools app list w100 cboth">\
                    ' + ListRecord(undefined, 0) + ' \
                </div> \
            </div>\
        </div> \
    ');
    setuptools.lightbox.settitle('mulequeue-history', 'MuleQueue History');
    setuptools.lightbox.display('mulequeue-history', {variant: 'fl-MuleQueueHistory'});
    QueueHistoryPaginate.bind();

};

setuptools.app.mulequeue.spinner = {};
setuptools.app.mulequeue.spinner.running = function(type, returnHtml) {

    if ( typeof returnHtml !== 'boolean' ) returnHtml = false;
    if ( typeof type !== 'string' ) type = 'queue';
    if ( type === 'queue' && setuptools.app.mulequeue.state.paused === true ) type = 'pause';
    if ( type === 'queue' && setuptools.app.mulequeue.state.rateLimited === true ) type = 'error';

    var html = '<img class="spinner" src="lib/media/spinner-' + type + '.svg">';
    var spinner = $('<div>').html(html);
    if ( returnHtml === true ) return spinner.html();
    return spinner;

};
