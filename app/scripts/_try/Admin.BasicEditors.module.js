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

		defaultAdminPath: "Test->EditorDemo",

		View: {

			FormPartA: Backbone.Marionette.ItemView.extend({
				template: '#_blank',
				onShow: function(){
					this.activateEditors({
						editors: {
							abc: {
								type: 'text',
								label: 'Abc',
								help: 'This is abc',
								tooltip: 'Hey Abc here!',
								fieldname: 'newfield',
								validate: {
									required: {
										msg: 'Hey input something!'
									},
									fn: function(val, parentCt){
										if(!_.string.startsWith(val, 'A')) return 'You must start with an A';
									}
								}

							},
							ab: {
								label: 'Ab',
								help: 'This is ab',
								tooltip: 'Hey Ab here!',
								placeholder: 'abc...',
								value: 'default',
								validate: function(val, parentCt){
									if(val !== '123') return 'You must enter 123';
								}
							},
							efg: {
								label: 'Ha Ha',
								type: 'password',
								validate: {
									checkitout: true
								}
							},
							area: {
								label: 'Codes',
								type: 'textarea',
								validate: {
									required: true
								}
							},
							readonly: {
								label: 'RO',
								html: '<p class="text-success">Nothing...RO</p>'
							}
						}
					});
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
							},
							singlecheckbox: {
								label: 'Check?',
								type: 'checkbox',
								boxLabel: 'Select this one if you are smart...:D',
								//value: 'enabled',
								//unchecked: 'disabled',
							}		
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
							select: {
								label: 'Select',
								type: 'select',
								help: 'choose 1 you like',
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
							},

							selectgroup: {
								label: 'Group',
								type: 'select',
								options: {
									data: {
										group1: [{label: 'abc', value: '123'}, {label: '4555', value: '1111'}],
										group2: [{label: 'abcx', value: '123x'}, {label: '4555x', value: '1111x'}],
									}
								}
							}							

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
