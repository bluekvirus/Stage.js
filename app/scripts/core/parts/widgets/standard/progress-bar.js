/**
 * Progress Bar Widget to display progress value
 *
 * @author Yan Zhu
 * @date 2013-08-06
 */

Application.Widget.register('ProgressBar', function() {

	var ProgressBar = Backbone.Marionette.ItemView.extend({

		template: '#custom-tpl-progressbar',

		initialize: function(options) {
			
			this.options = _.extend({
				value: 0,
				width: '200px',
				backClass: 'default-progress-back',
				barClass: 'default-progress-bar'
			}, options);

			this.value = this.options.value;

			this.model = new Backbone.Model({
				progress: this.value,
				width: this.options.width,
				backClass: this.options.backClass,
				barClass: this.options.barClass
			});
		}
	});

	return ProgressBar;
});

Template.extend(
	'custom-tpl-progressbar',
	[
		'<div class="{{backClass}}" style="width: {{width}};">',
			'<div class="{{barClass}}" style="width: {{progress}}%;">',
				'{{progress}}%',
			'</div>',
		'</div>'
	]
);