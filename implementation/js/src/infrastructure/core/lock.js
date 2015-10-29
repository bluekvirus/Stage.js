/**
 * Application locking mech for actions, events and <a href> navigations ...
 *
 * Usage
 * -----
 * create (name, number) -- topic and allowance;
 * lock (name) -- 	return true for locking successfully, false otherwise;
 * 					default on creating a (name, 1) lock for unknown name;
 * 					no name means to use the global lock;
 * unlock (name) -- unlock topic, does nothing by default;
 * 					no name means to use the global lock;
 * get(name) -- get specific lock topic info;
 * 				no name means to return all info;
 *
 * @author Tim Lauv
 * @created 2014.08.21
 */

;(function(app){

	var definition = app.module('Core.Lock');
	var locks = {},
	global = false; //true to lock globally, false otherwise.

	_.extend(definition, {
		create: function(topic, allowance){
			if(!_.isString(topic) || !topic) throw new Error('DEV::Core.Lock::create() You must give this lock a name/topic ...');
			if(locks[topic]) return false;

			allowance = _.isNumber(allowance)? (allowance || 1) : 1;
			locks[topic] = {
				current: allowance,
				allowance: allowance
			};
			return true;
		},

		get: function(topic){
			if(!topic || topic === '*') return {
				global: global,
				locks: locks
			};
			else
				return locks[topic];
		},

		//return true/false indicating op successful/unsuccessful
		lock: function(topic){
			if(global) return false;

			if(!topic || topic === '*') {
				//global
				if(!global){ //not locked
					global = true;
					return true;
				}else //locked already
					return false;
			}else {
				if(_.isUndefined(locks[topic])){
					this.create(topic, 1);
					return this.lock(topic);
				}else{
					if(locks[topic].current > 0){
						locks[topic].current --;
						return true;
					}else 
						return false;
				}
			}
		},

		//return nothing...
		unlock: function(topic){
			if(!topic || topic === '*') {
				//global
				if(global){ //locked
					global = false;
				}
			}else {
				if(!_.isUndefined(locks[topic])){
					if(locks[topic].current < locks[topic].allowance)
						locks[topic].current ++;
				}
			}
		},

		available: function(topic){
			if(global) return false;
			
			if(!topic || topic === '*')
				return global === false;
			else {
				var status = this.get(topic);
				if(status) return status.current > 0;
				else return true;
			} 
				
		}
	});



})(Application);