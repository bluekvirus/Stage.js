/**
 * This is a "counter" worker. It increases its counter by 1 for every 500ms.
 * You can catch its counter inside onmesssage callback of the worker handler in the main thread.
 *
 * NOTE: this kind of worker will not stop posting message until user terminate it.
 *
 * You could terminate a worker as follow:
 * var w = app.worker('CounterWorker');
 * w.terminate();
 */

var i = 0;

function timedCount() {
    i = i + 1;
    postMessage(i);
    setTimeout("timedCount()",500);
}

timedCount(); 