# MuleQueue v2

MuleQueue is the account task manager for Muledump. Whenever you load one or more accounts data the request is handled by MuleQueue.

Tasks that are reloading manually get executed immediately. You will not have to wait for the request to run and the data to load.

When you reload all accounts, a queue is created to handle the requests. The rate of requests is controlled in an attempt to prevent you from getting rate limited by Deca. You can read more about [Rate Limiting](https://github.com/jakcodex/muledump/wiki/Rate-Limiting) in the wiki.

While the queue is running you can still reload accounts immediately on-demand.

If you close Muledump or otherwise interrupt MuleQueue, it will resume where it left off upon reload.
