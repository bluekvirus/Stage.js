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

	_.extend(module, {

		defaultAdminPath: "Test->EditorDemo",

		View: {
			Default: Backbone.Marionette.Layout.extend({
				template: '#custom-module-Admin-EditorDemo-tpl',
				className: 'form ',

				initialize: function(options){
					//activate some view enhancements or coop events listening here.
					this.enableActionTags('Test.EditorDemo');
				},

				onShow: function(){
					//some code here...
					this.activateEditors({
						editors: {
							abc: {
								type: 'text',
								label: 'Abc',
								help: 'This is abc',
								tooltip: 'Hey Abc here!',
								fieldname: 'newfield'

							},
							ab: {
								label: 'Ab',
								help: 'This is ab',
								tooltip: 'Hey Ab here!',
								placeholder: 'abc...'
							},
							efg: {
								label: 'Ha Ha',
								type: 'password'
							},
							xyz: {
								label: 'File',
								type: 'file',
								help: 'Please choose your image to upload.'
							},
							radios: {
								label: 'Radios',
								type: 'radio',
								help: 'choose the one you like',
								tooltip: {
									title: 'hahahaha'
								},
								options: {
									inline: true,
									//data: ['a', 'b', 'c', 'd']
									data: [
										{label: 'Haha', value: 'a'},
										{label: 'Hb', value: 'b'},
										{label: 'Hc', value: 'c'},
										{label: 'Hd', value: 'd'}
									]
								}
							},
							checkboxes: {
								label: 'Checkboxes',
								type: 'checkbox',
								help: 'choose more than you like',
								fieldname: 'haha',
								options: {
									//data: ['a', 'b', 'c', 'd']
									data: [
										{key: 'abc1', val: '1231', other: 'bbb1'},
										{key: 'abc2', val: '1232', other: 'bbb2'},
										{key: 'abc3', val: '1233', other: 'bbb3'},
										{key: 'abc4', val: '1234', other: 'bbb4'},
										{key: 'abc5', val: '1235', other: 'bbb5'},
									],
									labelField: 'other',
									valueField: 'val'
								}
							}							

						}
					});
					this.editors.abc.status('success', 'Yes!');
					this.editors.radios.status('error', 'something wrong!');
					//console.log(this.editors.abc.parentCt);
				},

				actions: {
					//action func here...
					getValues: function($action){
						console.log(this.$el.serializeForm());
						//or use _.reduce() to iterate through this.editors.
						_.each(this.editors, function(editor, field){
							console.log(field, editor.getVal());
						});
					},

					setValues: function($action){
						var vals = {
							abc: '123',
							radios: 'a',
							checkboxes: ['1231', '1233']
						};
						_.each(vals, function(v, editor){
							this.editors[editor].setVal(v, true);
						},this);
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
			'<span class="btn" action="getValues">Submit</span>',
			'<span class="btn" action="setValues">Test</span>',
		'</div>'
	]
);
