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

	var webWorker = function(name/*web worker's name*/, coopEvent/*or callback function*/, workerEventListener/*object {onmessage: fn, onerror: fn}*/){
		
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

			//after successfully created worker trigger a app.coop event or trigger a callback function
			if(coopEvent){
				//callback function
				if(_.isFunction(coopEvent)){
					coopEvent(worker);
				}
				//coop event
				else if(_.isString(coopEvent)){
					//trigger coop event with worker as data
					app.coop('web-worker-' + coopEvent, worker);
				}
				//plain object, then consider coopEvent is actucally workerEventListener
				else if(_.isPlainObject(coopEvent)){
					//make workerEventListener equals to coopEvent
					workerEventListener = coopEvent;
				}
				//type is not right
				else{
					console.warn('DEV::Application::Util::worker(): The coopEvent or callback function you give is not right.');
				}
			}

			//register onmessage and onerror callback here if user chooses to do so
			if(workerEventListener){

				//onmessage event listener
				if(workerEventListener.onmessage){
					//check whether callback is a function, otherwise issue warning
					if(_.isFunction(workerEventListener.onmessage))
						worker.onmessage = workerEventListener.onmessage;
					else
						console.warn('DEV::Application::Util::worker(): The onmessage callback is not a function!!');
				}

				//onerror event listener
				if(workerEventListener.onerror){
					//check whether callback is a function, otherwise issue warning
					if(_.isFunction(workerEventListener.onerror))
						worker.onerror = workerEventListener.onerror;
					else
						console.warn('DEV::Application::Util::worker(): The onerror callback is not a function!!');
				}
			}

		}catch(e){
			throw Error('DEV::Application::Util::worker(): Web worker create error. Please check your worker name and workerSrc!');
		}
		
		return worker;

	};

	//assign to app.Util.worker
	app.Util.worker = webWorker;

})(Application);