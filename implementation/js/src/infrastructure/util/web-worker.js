/**
 * Application Web Worker
 *
 * Usage
 * -----
 * app.worker(name, fn(data, e, worker)/coop event/object{onmessage/onerror: fn(data, e, worker)...) => worker.receive(data)
 * app.worker(false) to terminate all workers
 *
 *
 * Giving onmessage cb upon app.worker() call?
 * -------------------------------------------
 * Yes, since your worker can be a long running one with intervals and loops emitting data already.
 * (without calling .receive() to start per request msg)
 * 
 * 
 * @author Patrick Zhu, Tim Lauv
 * @created 2017.06.14
 */

;(function(app){

	app._workers = {};
	var webWorker = function(name/*web worker's name*/, coopEvent/*or onmessage callback function or object contains both onmessage and onerror callback*/){
		
		//check whether browser supports webworker
		if(!Modernizr.webworkers)
			throw Error('DEV::Application::Util::worker(): Web Worker is not supported by your browser!');

		//cleanup: use .worker(false) to stop all
		if(name === false)
			return _.each(_.keys(app._workers), function(k){
				app._workers[k].terminate();
				delete app._workers[k];
			});

		//check whether name is valid
		if(!name || !_.isString(name))
			throw Error('DEV::Application::Util::worker(): Web Worker\'s name is not a string or is not provided.');

		//consult the root path for web workers js files
		var path = app.config.workerSrcs,
		//translate name to the file name by using app.nameToPath()
			fileName = app.nameToPath(name),
			_worker;

		//try to create a new worker
		try{
			//fetch javascript from given path and name
			_worker = new Worker(path + '/' + fileName + '.js?_=' + Date.now());
		}catch(e){
			throw Error('DEV::Application::Util::worker(): Web worker create error. Please check your worker name and workerSrc!');
		}
		

		var worker = {
			_worker: _worker,
		};

		//honor coopEvent based on the type of the argument
		if(coopEvent) {
			//onmessage callback function
			if(_.isFunction(coopEvent)){
				worker._worker.onmessage = function(e){
					coopEvent(e.data, e, worker);
				};
			}
			//object, contains both onmessage callback function and onerror callback function
			else if(_.isPlainObject(coopEvent)){
				//traverse through object to register callback events
				_.each(coopEvent, function(fn, eventName){
					worker._worker[eventName] = function(e){
						fn(e.data, e, worker);
					};
				});
			}
			//coop event
			else if(_.isString(coopEvent)){
				//trigger coop event with worker as data
				worker._worker.onmessage = function(e){
					app.coop('worker-data-' + coopEvent, e.data, e, worker);
				};
				
			}
			//type is not right
			else
				console.warn('DEV::Application::Util::worker(): The coopEvent or callback function or callbacks\' object you give is not right.');
		}

		//function to inform worker thread with data
		worker.receive = function(data/*data send to worker through postMessage*/){			
			this._worker.postMessage(data);
			return this;
		};

		worker.terminate = function(){
			this._worker.terminate();
		};

		worker._key = _.uniqueId('worker-');
		app._workers[worker._key] = worker;
		return worker;

	};

	//assign to app.Util.worker
	app.Util.worker = webWorker;

})(Application);