/**
 * ==============================
 * User Session Utils
 *
 * 1. Touch 
 * 2. Login ?
 * 3. Logout ?
 * 4. Privilege Eval() ?
 *
 * Usage:
 * app.Util.touch(url, yes(), no()).done().error()...
 *
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 * ==============================
 */
;(function(){

 Application.Util.touch = function(url, yes, no){
	/**
	 * This check with application server to see if the user is logged in or not...
	 * @return {Boolean}
	 */
	return $.ajax({
		url: url || '/login',
		notify: false,
	}).done(yes || function(res){
		Application.user = res.user;
		Application.trigger('app:user-changed');
	}).error(no || function(){
		delete Application.user;
	});		
 }

})();