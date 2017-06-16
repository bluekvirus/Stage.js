/**
 * Application Web Worker
 *
 * Usage
 * -----
 * app.worker(web worker's name(string), callback function(fn) or coop event(string), workerEventListener(object {onmessage: fn, onerror: fn}))
 *
 * @author Patrick Zhu
 * @created 2017.06.14
 */

;(function(app){

	var webWorker = function(name/*web worker's name*/){
		
		//check whether browser supports webworker
		if(!Modernizr.webworkers)
			throw Error('DEV::Application::Util::worker(): Web Worker is not supported by your browser!');

		//check whether name is valid
		if(!name || !_.isString(name))
			throw Error('DEV::Application::Util::worker(): Web Worker\'s name is not a string or is not provided.');

		//setup the root path for workers
		var path = app.config.workerSrc || 'js/worker',
		//translate name to the file name by using app.nameToPath()
			fileName = app.nameToPath(name),
			worker;

		//try to create a new worker
		try{
			//fetch javascript from given path and name
			worker = new Worker(path + '/' + fileName + '.js');
		}catch(e){
			throw Error('DEV::Application::Util::worker(): Web worker create error. Please check your worker name and workerSrc!');
		}
		
		//function to send message to worker thread
		var run = _.bind(function(data/*data send to worker through postMessage*/, coopEvent/*or onmessage callback function*/){
			
			//NOTE:
			//If there is only one argument, it should be considered as data.
			//Since user might just register one onmessage callback function and reuse it for different data.
			
			//check whether there is a data or not
			if(data){
				this.postMessage(data);
			}

			//honor coopEvent based on the type of the argument
			if(coopEvent) {
				//onmessage callback function
				if(_.isFunction(coopEvent)){
					this.onmessage = coopEvent;
				}
				//coop event
				else if(_.isString(coopEvent)){
					//trigger coop event with worker as data
					app.coop('ww-data-' + coopEvent, this);
				}
				//type is not right
				else
					console.warn('DEV::Application::Util::worker(): The coopEvent or callback function you give is not right.');
			}

		}, worker);

		var terminate = _.bind(function(){
			this.terminate();
		}, worker);

		return {
			_worker: worker,
			terminate: terminate,
			run: run,
		};

	};

	//assign to app.Util.worker
	app.Util.worker = webWorker;

})(Application);