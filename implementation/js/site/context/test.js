;(function(app){

	app.context('Test', {
		template: [
			'<h3>Unit Test for Stage.js APIs</h3>',
			'<div id="mocha" style="position:relative;"></div>', //add mocha div for framework request
			'<div region="sse-hidden-view-1" class="hidden"></div>',
			'<div region="sse-hidden-view-2" class="hidden"></div>',
		],
		attributes: {
			style: 'padding:15px;',
		},
		onClose: function(){
			mocha.suite.suites = []; //caveat: clean up the test suites on close, otherwise mocha will load the same tests for multiple times.
		},
		onReady: function(){
			var that = this,
				expect = chai.expect;

			//setup mocha to 'bdd' mode
			mocha.setup('bdd');

			//test for app.sse
			describe('app.sse (Server-Sent Event)', function(){

				//raw
				it('raw use of app.sse', function(done){
					var flag = true;

					var sse = app.sse('/sample/sse', ['topic1'], function(data){
						//expecting a string returns from server
						expect(data).to.be.a('string');

						//only catch once to pass the test
						if(flag){
							flag = false;
							sse.close();
							done();
						}
					});
				});

				//view.topics
				it('use view.topcis', function(done){
					//
					var View1 = app.view({
						name: 'sse-test-view-1',
						template: 'first topic view',
						flag: true,
						topics: {
							'some-topic-1': {
								'sse': '/sample/sse',
								'callback': function(data){
									//expecting a string returns from server
									expect(data).to.be.a('string');

									if(this.flag){
										this.flag = false;
										this.close(); //close connection by closing view
									}
								}
							}
						},
					});

					//
					var View2 = app.view({
						name: 'sse-test-view-2',
						template: 'second topic view',
						flag: true,
						topics: {
							'some-topic-2': {
								'sse': '/sample/sse',
								'callback': {
									'customEvent': function(data){
										expect(data).to.have.property('data');
										
										if(this.flag){
											this.flag = false;
											done();
											this.close(); //close connection by closing view
										}
									},
									'onmessage': function(data){
										expect(data).to.have.property('data');
									}
								}
							}
						},
					});

					that.show('sse-hidden-view-1', View1);
					that.show('sse-hidden-view-2', View2);
				
				}).timeout(10000);//change timeout to 5000

			});

			//kick start mocha here
			mocha.run();

			//restyle the test status panel
			this.$el.find('#mocha-stats').css({'position': 'absolute', 'top': 0});
			
		},
	});

})(Application);