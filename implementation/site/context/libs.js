;(function(app){

	app.context('Libs', {
		tagName: 'ul',
		className: 'list-group wrapper-full',
		template:[ 
		    '<h3>Dependencies.js</h3>',
		    '<p class="small text-muted">These open-source projects can be found in dependencies.js in case you want to use them directly.</p>',   
		    '{{#list}}',
		        '<li class="list-group-item">',
		            '{{#if url}}<a href="{{url}}">{{name}}</a>',
		            '{{else}}{{name}}',
		            '{{/if}}',
		            '<span class="badge">{{version}}</span></li>',
		    '{{/list}}',
		    '<li class="list-group-item text-center panel-footer"><small>{{created}}</small></li>',
		    '<h5 class="text-center"><small>Package manager: <a href="http://bower.io/">bower</a></small></h5>',
		],
		onShow: function(){
		    var that = this;
		    $.get('js/lib/dependencies.json').done(function(data){
		        //add update timestamp
		        _.extend(data, {
		            created: moment(data.created).fromNow()
		        });
		        //rename
		        var renamed = {
		            'jquery-ui': {
		                name: 'jquery-ui-core',
		                url: 'http://jqueryui.com/download/#!version=1.10.4&components=1111111110000000000011111111111111'
		            },
		            'marionette': {
		                name: 'marionette-core',
		                url: 'https://github.com/bluekvirus/marionette-core'
		            }
		        };
		        _.each(data.list, function(lib){
		            if(renamed[lib.name])
		                _.extend(lib, renamed[lib.name]);
		        });
		        //render
		        that.trigger('view:render-data', data);
		        var versionBadges = that.$('.badge');
		        versionBadges.css({
		            background: 'transparent',
		            color: versionBadges.css('backgroundColor'),
		            border: '1px solid'
		        });
		    });                
		}
	});

})(Application);