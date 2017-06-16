/**
 * This a "messenger" worker. It takes data from the main thread and then package it in its way and send back.
 * Main thread and worker thread can send data to each other by using postMessage/worker.receive function.
 * Also, both main thread and worker thread can catch the message send by the other one in "onmessage" callback.
 * The data transferred are in the event.data of onmessage = function(e){ e.data..... };
 *
 * In the main thread you could initiate a worker by using var w = app.worker('MessengerWorker', coop e or cb for onmessage);
 * You can transfer message to the worker by using w.receive(data of any type);
 * 
 * NOTE: The data transferred is a COPY, serialized and NOT the original object.
 */
onmessage = function(e){
	postMessage([e.data, e.data]);
	console.log('worker[messenger-worker.js]:', 'message received...', JSON.stringify(e.data));
};