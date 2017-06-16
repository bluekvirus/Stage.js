// var i = 0;

// function timedCount() {
//     i = i + 1;
//     postMessage(i);
//     setTimeout("timedCount()", 500);
// }

// timedCount(); 

onmessage = function(e){
	postMessage([e.data, e.data]);
	console.log('on message in worker.js. received...', JSON.stringify(e.data));
};