/**
 * Util for adding meta-event programming ability to object
 *
 * Currently applied to: Application, Context and View.
 *
 * @author Tim Lauv
 * @created 2014.03.22
 * @updated 2016.03.31
 */

;(function(app){

	//e as event in meta-event domain:e without the domain: string
	app.Util.metaEventToListenerName = function(e){
		if(!e) throw new Error('DEV::Util::metaEventToListenerName() e an NOT be empty...');
		return _.string.camelize('on-' + e.split(/[\.:-\s\/]/).join('-')); //IMPORTANT e --> fn rule
	};

	app.Util.addMetaEvent = function(target, namespace, delegate){
		if(!delegate) delegate = target;
		target.listenTo(target, 'all', function(eWithNamespace){
			//separate the domain: string
			var tmp = String(eWithNamespace).split(':');
			if(tmp.length !== 2 || tmp[0] !== namespace) return;
			//apply the e --> fn rule
			var listener = app.Util.metaEventToListenerName(tmp[1]);
			if(delegate[listener])
				delegate[listener].apply(target, _.toArray(arguments).slice(1));
		});
	};

})(Application);