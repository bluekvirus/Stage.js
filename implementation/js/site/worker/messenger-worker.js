/**
 * This a "messenger" worker. It takes data from the main thread and then package it in its way and send back to main thread.
 * Main thread and worker thread can send data to each other by using postMessage/worker.postMessage function.
 * Also, both main thread and worker thread can catch the message send by the other one in "onmessage" callback.
 * The data transferred are in the event.data of onmessage = function(e){ e.data..... };
 *
 * In the main thread you could initiate a worker by using var w = app.worker('MessengerWorker');
 * You can transfer message to the worker by using w.run(data of any type, 'app-coop-event' or onmessage callback function);
 * 
 * NOTE: The data transferred is a copy. NOT the original instance.
 */
onmessage = function(e){
	postMessage([e.data, e.data]);
	console.log('on message in worker.js. received...', JSON.stringify(e.data));
};