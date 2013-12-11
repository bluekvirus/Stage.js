/**
 * Single Gauge Widget
 * Use justgage (http://justgage.com/) under the hood
 *
 * @author Yan Zhu
 * @date 2013-08-16
 */

Application.Widget.register('SingleGauge', function() {

	var defaults = {
		width: 400,
		height: 320,
		min: 0,
		max: 100,
		value: 0,
		title: 'Gauge',
		url: '',
		valueField: ''
	};

	var SingleGauge = Backbone.Marionette.ItemView.extend({

		template: '#custom-tpl-singlegauge',

		ui: {
			gaugeCt: '.single-gauge'
		},

		initialize: function(options) {
			var gaugeId = _.uniqueId('gauge_');
			this.options = _.extend({id: gaugeId}, defaults, options);
			this.listenTo(this, 'parentCt:shown', this.onShow);
			this.listenTo(this, 'parentCt:resize', this.onResize);
		},

		onRender: function() {
			this.ui.gaugeCt.attr('id', this.options.id);
		},

		onShow: function(parentCt) {
			console.log('SingleGauge onShow');
			
			this.adjustSize(parentCt);

			if (this.options.url) {
				this.fetchValue();
			} else {
				this.setValue(this.options.value);
			}
		},

		onResize: function(parentCt) {
			console.log('SingleGauge onResize');

			this.adjustSize(parentCt);

			this.ui.gaugeCt.find('svg').remove();
			this.gage = new JustGage(this.options);
		},

		adjustSize: function(parentCt) {
			console.log('SingleGauge adjustSize');
			if (parentCt) {
				var parentWidth = parentCt.$el.width();
				this.options.width = parentWidth * 0.8;
				if (this.options.width > defaults.width) {
					this.options.width = defaults.width;
				}
				this.options.height = this.options.width * 0.8;

				// var parentHeight = parentCt.$el.height();
				// console.log('parentHeight', parentHeight);
				// if (this.options.height > parentHeight) {
				// 	this.options.height = parentHeight;
				// 	this.options.width = this.options.height * 1.25;
				// }
			}

			this.ui.gaugeCt.css('width', this.options.width+'px')
							.css('height', this.options.height+'px');
		},

		fetchValue: function() {
			console.log('SingleGauge fetchValue');
			if (this.options.url) {
				$.getJSON(this.options.url, _.bind(function(data, textStatus, jqXHR) {
					var value;
					if (typeof(data) === 'object') {
						if (this.options.valueField) {
							value = data[this.options.valueField];
						} else {
							value = _.values(data)[0];
						}
					} else {
						value = data;
					}
					this.setValue(value);
				}, this));
			} else {
				console.log('SingleGauge fetchValue error: no [url] specified');
			}
		},

		setValue: function(value) {
			this.options.value = value;
			if (this.gage) {
				this.gage.refresh(value);
			} else {
				this.gage = new JustGage(this.options);
			}
		},

		refresh: function(value) {
			console.log('SingleGauge refresh', new Date());
			if (typeof(value) !== 'undefined') {
				this.setValue(value);
			} else {
				this.fetchValue();
			}
		}
	});

	return SingleGauge;
});

Template.extend(
	'custom-tpl-singlegauge',
	[
		'<div class="single-gauge"></div>'
	]
);