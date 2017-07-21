/**
 * This util function takes a schema object and produces mock data.
 *
 * Config
 * ------
 * app.config.mockProvider: faker (default with I18N.locale)
 *
 * Schema
 * ------
 * {
 *    'key [ | number of record]' : '@gen.fn.from.provider [ | arg1, ..., argN]',
 *    'key [ | number of record]' : '@gen.fn.from.provider [ | {{ ... }} tpl {{ ... }}]',
 *    'key [ | number of record]' : '@gen.fn.from.provider [ | {JSON} or [JSON]]',
 *    'key [ | number of record]' : {
 *    	...sub schema..
 *    }
 * }
 *
 * URL
 * ---
 * <url> -- this means all http methods use the schema if ?mock=true
 * GET <url> 
 * POST <url>
 * PUT <url>
 * PATCH <url>
 * DELETE <url>
 *
 * @author Tim Lauv
 * @created 2017.06.14
 */

;(function(app){

	//global mock schema registery (consulted by app.remote() if app.param('mock') is true)
	app._mockSchema = app._mockSchema || {};	

	function mock(schema, provider, url){
		//check whether provider is a string, then url is provider and provider is undefined.
		if(_.isString(provider)){
			url = provider;
			provider = undefined;
		}

		provider = provider || app.config.mockProvider || (faker && (faker.locale = I18N.locale.replace('-', '_')) && faker);

		if(!provider) throw new Error('DEV::Util.mock() you have to specify a mock data provider...');

		//check whether url is provided, if yes store the schema and provider into global object
		if(url){
			//check whether the type of url is a string
			if(_.isString(url)){
				
				//check http method
				var tmp = url.split(' '), method = '*';
				if(tmp.length == 2){
					method = tmp[0].toUpperCase();
					url = tmp[1];
				}
				app._mockSchema[url] = app._mockSchema[url] || {};
				app._mockSchema[url][method] = {
					provider: provider,
					schema: schema
				};

			}else{
				console.warn('DEV::Util.mock() the third argument(url) must be a string...');
			}
		}

		var result = {}, q = [{parent: result, index: 'return', schema: schema}];
		while(q.length){
			var job = q.pop();

			//schema is a single val or gen-fn, can be resolved directly;
			var args = undefined, hit = undefined; //reset hit gen-fn or it will hold last know provider fn!
			if(!_.isPlainObject(job.schema)){
				//generate data using provider (@dotted.key.path... as gen-fn pointer)
				if((_.isString(job.schema) && _.string.startsWith(job.schema, '@'))){
					var tmp = _.map(job.schema.split('|'), function(v){return _.string.trim(v);});
					args = tmp[1];
					if(args){
						//{{ ... }} tpl {{ ... }}
						if (/{{.*?}}/.test(args))
							args = [args];
						//{JSON}
						else if(/^{.*}$/.test(args))
							args = [JSON.parse(args)];
						else if(/^\[.*\]$/.test(args))
							args = [JSON.parse(args)];
						//[, , ,]
						else
							args = _.map(args.split(','), function(v){
								v = _.string.trim(v);
								if(_.isNaN(Number(v))){
									if(v == 'true' || v == 'false')
										return JSON.parse(v);
									return v;
								}
								else
									return Number(v);
							});
					}
					hit = app.extract(tmp[0].slice(1), provider);
				}

				//use data as is (gen-fn or data or fn result)
				job.parent[job.index] = _.isFunction(hit)? hit.apply(provider, args) : _.result({val: job.schema}, 'val');

				continue;

			}

			job.parent[job.index] = job.parent[job.index] || {};
			//schema is an obj or real schema obj
			_.each(job.schema, function(sub, key){
				var tmp = _.map(key.split('|'), function(v){return _.string.trim(v);});
				if(tmp[1]) tmp[1] = parseInt(tmp[1]); // e.g 'key|50'

				//generate an array
				if(tmp[1] > 0){
					job.parent[job.index][tmp[0]] = new Array(tmp[1]);
					while(tmp[1] > 0){
						q.push({parent:job.parent[job.index][tmp[0]], index: tmp[1] - 1, schema: sub});
						tmp[1]--;
					}
					return;
				}

				//generate an object
				q.push({parent:job.parent[job.index], index: tmp[0], schema: sub});

			});
		}

		return result.return;

	}

	app.Util.mock = mock;

})(Application);
