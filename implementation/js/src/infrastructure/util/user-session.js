/**
 * ==============================
 * User Session Utils
 *
 * 1. Touch 
 * 2. Login ?
 * 3. Logout ?
 * 4. Privilege Eval() ?
 *
 *
 * @author Tim.Liu
 * @created 2013.04.01
 * @updated 2013.11.08
 * ==============================
 */
;(function(){

 Application.touch = function(){
	/**
	 * This check with application server to see if the user is logged in or not...
	 * @return {Boolean} see application server routes/landing/page.js
	 */
	var result = false;
	$.ajax({
		url: '/login',
		notify: false,
		async: false,
		success: function(res){
			result = true;
			Application.user = res.user;
			Application.trigger('app:user-changed');
		},
		error: function(){
			delete Application.user;
		}
	});
	return result;			
 }

})();