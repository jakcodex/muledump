# MuleQueue Manager

The MuleQueue manager shows you the current state of running account tasks. Any time you have accounts loading their data they will show up here.

Each task has a countdown timer telling you how long you will need to wait for it to be finished. If you get rate limited the time will be adjusted.

If you reload Muledump while in the middle of a queue it will resume where it left off.

### Task Menu

#### ```Run Task Immediately```

The task is ran immediately skipping the account load delay wait time.

#### ```Run Task Next```

The task is placed at the front of the queue and will run next.

#### ```Cancel Task```

The task is cancelled and removed from the queue.
