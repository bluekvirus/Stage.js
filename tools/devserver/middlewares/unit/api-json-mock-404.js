/**
 * custom middleware script, api->[json->mock]->404 expressjs 4.0+
 *
 * @author Tim Lauv
 * @created 2016.01.28
 */
var mockjs = require('mockjs'),
fs = require('fs-extra'),
colors = require('colors');

module.exports = function(server){

	var profile = server.get('profile');

	return function(req, res, next){
				switch(req.params.format){
					case 'xml':
						break;
					case 'yaml':
						break;
					case 'md':
						break;
					default: //case 'json'
						var p = server.resolve((profile.datamock || 'data') + req.path);
						var dataFile = p;
						if(!/\.json$/.test(dataFile))
							dataFile += '.json';
						var check = fs.existsSync(dataFile);
						if(check){
							console.log('[middleware api-json-mock-404]', 'found json'.green, dataFile);
							return res.sendFile(dataFile);
						}
						else
							console.log('[middleware api-json-mock-404]', 'tried json'.grey, dataFile.grey);
						var mockFile = p.replace(/\.json$/, '') + '.mock.js';
						if(fs.existsSync(mockFile)){
							console.log('[middleware api-json-mock-404]', 'found mock'.green, mockFile);
							return res.json(mockjs.mock(require(mockFile)));
						}
						else
							console.log('[middleware api-json-mock-404]', 'tried mock'.grey, mockFile.grey);
						break;
				}
				return next();
			};
};