/**
 * App debug helpers, extracted from api.js
 *
 * @author Tim Lauv, Patrick Zhu
 * @created 2017.06.22
 */

;(function(app){

	app.Util.debugHelper = {
		
		//Note: debug() will always return the last argument as return val. (for non-intrusive inline debug printing)
		debug: function(){
			var fn = console.debug || console.log;
			if(app.param('debug') === 'true')
				fn.apply(console, arguments);
			return arguments.length && arguments[arguments.length - 1];
		},

		//find a view instance by name or its DOM element.
		locate: function(name /*el or $el*/){
			//el, $el for *contained* view names only
			if(!_.isString(name)){
				var all;
				if(name)
					all = $(name).find('[data-view-name]');
				else
					all = $('[data-view-name]');

				all = all.map(function(index, el){
					return $(el).attr('data-view-name');
				}).get();
				return all;
			}

			//name string, find the view instance and sub-view names
			//now app.locate can return all the instances with given view name
			var $els = $('[data-view-name="' + name + '"]'), views;
			if($els.length){//proceed only if found at least one of coressponding <div>
				views = _.map($els, function(el){
					return $(el).data('view');
				});
			}
			return views && _.map(views, function(view){ return {view: view, 'sub-views': app.locate(view.$el)}; });
		},

		//output performance related meta info so far for a view by name or its DOM element.
		profile: function(name /*el or $el*/){
			//el, $el for *contained* views total count and rankings
			if(!_.isString(name)){
				var all;
				if(name)
				 	all = $(name).find('[data-render-count]');
				else
					all = $('[data-render-count]');

				all = all.map(function(index, el){
					var $el = $(el);
					return {name: $el.data('view-name'), 'render-count': Number($el.data('render-count')), $el: $el};
				}).get();
				return {total: _.reduce(all, function(memo, num){ return memo + num['render-count']; }, 0), rankings: _.sortBy(all, 'render-count').reverse()};
			}

			//name string, profile the specific view and its sub-views
			var results = app.locate(name), views;
			if(results) views = _.map(results, function(result){ return result.view; });
			return views && _.map(views, function(view){ return {name: view.$el.data('view-name'), 'render-count': view.$el.data('render-count'), $el: view.$el, 'sub-views': app.profile(view.$el)};});
		},

		//mark views on screen. (hard-coded style, experimental with no clean-up upon navigate)
		mark: function(name /*el or $el*/){
			var nameTagPairing = [], $body;
			if(_.isString(name)){
				var results = app.locate(name);
				if(!results) return;
				$body = _.map(results, function(result){ return result.view.parentRegion && result.view.parentRegion.$el; });
			}else if(name){
				$body = $(name);
			}else
				$body = $('body');
			//else abort
			if(!$body) return;

			//round-1: generate border and name tags
			if(_.isArray($body)){//generated by app.locate
				_.each($body, function($region, index){
					//clear all name tag
					$region.find('.dev-support-view-name-tag').remove();
					//borders and name tag
					genBorderTag($region, index);
				});
			}else{
				//clear all name tag
				$body.find('.dev-support-view-name-tag').remove();
				//borders and name  tag
				genBorderTag($body, 0);
			}
			//round-2: position the name tags
			$window.trigger('resize');//trigger a possible resizing globally.
			_.defer(function(){
				_.each(nameTagPairing, function(pair){
					pair.$tag.position({
						my: 'left top',
						at: 'left top',
						of: pair.$ct
					});
					pair.view.on('close', function(){
						pair.$tag.remove();
					});
				});
			});

			//function for generating border and nameTags
			//Note: add index for avoiding nested views with same name
			function genBorderTag($region, index){
				_.each(app.locate($region), function(v){
					var result = app.locate(v)[index],
						$container;

					//add a container style
					if(result.view.category !== 'Editor')
						$container = result.view.parentRegion && result.view.parentRegion.$el;
					else
						$container = result.view.$el;
					//else return;
					if(!$container) return;

					$container.css({
						'padding': '1.5em', 
						'border': '1px dashed black'
					});
					//add a name tag (and live position it to container's top left)
					var $nameTag = $('<span class="label label-default dev-support-view-name-tag" style="position:absolute;">' + result.view.$el.data('view-name') + '</span>');
					//add click event to $nameTag
					$nameTag.css({cursor: 'pointer'})
					.on('click', function(){
						app.reload(result.view.$el.data('view-name'), true);
					});
					$region.append($nameTag);
					nameTagPairing.push({$tag: $nameTag, $ct: $container, view: result.view});
				});
			}
		},

		//reload everything, or override a view with newer version.
		reload: function(name, override/*optional*/){
			//reload globally
			if(!name)
				return window.location.reload();

			var results = app.locate(name);
			if(!results){
				app.mark();//highlight available views.
				throw new Error('DEV::app.reload():: Can NOT find view with given name: ' + name);
			}

			//traverse through results from app.locate
			_.each(results, function(result){
				reloadView(result);
			});

			//main function for reloading a view
			function reloadView(result){
				var v = result.view,
					region = v.parentRegion,
					category;
				//get type of the named object
				_.each(app.get(), function(data, key){
					if(data.indexOf(name) >= 0){
						category = key;
						return;
					}
				});
				if(!category)
					throw new Error('DEV::app.reload():: No category can be found with given view: ' + name);
				override = override || false;
				//override old view
				if(override){
					//re-show the new view
					try{
						var view = app.get(name, category, {override: true}).create();
						view.once('ready', function(){
							app.mark(name);
						});
						region.show(view);
					}catch(e){
						console.warn('DEV::app.reload()::Abort, this', name, 'view is not defined alone, you need to find its source.', e);
					}
				}else{
					//re-render the view
					v.refresh();
				}
			}
		},
	};

})(Application);