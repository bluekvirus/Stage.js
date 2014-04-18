
//all paths are relative to the devserver folder.

module.exports = {

	port: '5000',

	clients: {

		//you don't have to specify the 'implementation' folder as it will always be served under /
		
		deploy: '../build/dist/site' //this will be available under /deploy/...

	},

	//by default all of the themes under 'implementation' will be monitored
	//use -name to exclude
	//use false to turn off LESS monitor.
	lesswatch: ['-_old']

}