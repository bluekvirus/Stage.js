/**
 * New sub UI Module (of a context) Code Template.
 *
 * =================================================
 * Layout or ItemView/CollectionView/CompositView ?
 * =================================================
 * for View.Default. This concept holds true for both Context/Sub Modules and Widgets.
 * Use a layout when there are sub view items (like widgets) contained in the view object.
 * Use other view classes when there are no sub view regions to show other views on.
 *
 * @author Tim.Liu
 * @create 2013.10.20
 * @version 1.0.1
 * @sublime-snippet
 */

;(function(app){

	var context = app.Context.Admin;
	var module = context.module('EditorDemo');

	app.Editor.addRule('checkitout', function(options, val, form){
		if(val !== 'abc') return app.Editor.errors['checkitout'];
	}, 'Haha you suck! abc');

	_.extend(module, {

		defaultMenuPath: "Test->Form->EditorDemo",

		View: {

			FormPartA: Backbone.Marionette.ItemView.extend({
				template: '#_blank',
				onShow: function(){

				},

				getValues: function(){
					return this.$el.serializeForm();
				}
			}),

			FormPartB: Backbone.Marionette.ItemView.extend({
				template: '#_blank',
				onShow: function(){
					this.activateEditors({
						editors: {
		
						}
					});
				}
			}),

			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-Admin-EditorDemo-tpl',
				className: 'form ',

				initialize: function(options){
					//activate some view enhancements or coop events listening here.
					this.autoDetectRegions();
					this.enableActionTags('Test.EditorDemo');
					this.enableForm()
				},

				onShow: function(){
					//some code here...
					this.activateEditors({
						appendTo: '[region="formeditors"]',
						editors: {
					

						}
					});

					this.addFormPart(new module.View.FormPartA(), {appendTo: '[region=partA]', cb: function(view){
						view.onShow();
					}});
					this.addFormPart(new module.View.FormPartB(), {region: 'partB'});

					this.listenTo(this, 'test:event', function(){
						console.log('hey!');
					});

				},

				actions: {
					//action func here...
					getValues: function($action){
						console.log(this.$el.serializeForm());
						//or
						console.log(this.getValues());
					},

					setValues: function($action){
						var vals = {
							selectgroup: '123x',
							abc: '123',
							radios: 'a',
							checkboxes: ['1231', '1233']
						};
						this.setValues(vals);
					},

					//1 entering error state
					//2 focus on the first error?
					validate: function($action){
						console.log(this.validate(true));
					}
				}
			})
		}

	});

})(Application);

Template.extend(
	'custom-module-Admin-EditorDemo-tpl',
	[
		'<div>',
			'<span style="font-weight: bold; font-size:15px;">Form Part B</span>',
			'<div region="partB" style="padding:20px; border:5px solid #eee"></div>',
			'<span style="font-weight: bold; font-size:15px;">Form Editors</span>',
			'<div region="formeditors"></div>',
			'<span style="font-weight: bold; font-size:15px;">Form Part A</span>',
			'<div region="partA" style="padding:20px; border:5px solid #eee"></div>',

			'<span class="btn" action="getValues">Submit</span>',
			'<span class="btn" action="setValues">Set Vals</span>',
			'<span class="btn" action="validate" erroronly="true">Validate</span>',
			'<span class="btn" action=":test:event">Test Event</span>',
		'</div>'
	]
);
