/**
 * 
 * Base Editor Example. [Modified]
 * Based on [https://github.com/powmedia/backbone-forms#custom-editors]
 *
 * @author Tim.Liu
 * @update 2013.04.18
 * 
 */
(function(){

    var ViewWrap = Backbone.Marionette.Layout.extend({
        template: '#custom-tpl-widget-editor-resource-control-wrap',
        className: 'custom-form-editor-resource-control',

        regions: {
            header: '.header',
            body: '.body',
            footer: '.footer'
        },

        events: {
            'click li[token]' : 'chainSelectHelper',
        },

        initialize: function(options){
            this._options = options;
        },

        onRender: function(){
            this.body.show(new ResourcesView({model: new Resources(), parentCt: this}));
        },

        recoverFromSelection: function(val){
            this.selectionVal = val;
            //delegates to onRender in ResourcesView object.       
        },

        /**
         * If 'modify' is assigned then 'read' will automatically be added
         */
        chainSelectHelper: function(e){
            var $target = $(e.target);
            switch($target.html()){
                case 'modify': //select 'modify' will also select 'read'
                    if(!$target.hasClass('active')) $target.prev().addClass('active');
                break;
                case 'read': //un-select 'read' will also cancel 'modify'
                    if($target.hasClass('active')) $target.next().removeClass('active');
                break;
                default:
                break;
            }
        },

    });

    var Resources = Backbone.Model.extend({
        urlRoot: 'logic/Resources/list',
        parse: function(resp){
            return resp.payload;
        }
    });

    var ResourcesView = Backbone.Marionette.ItemView.extend({
        template: '#custom-tpl-widget-editor-resource-control-items',

        initialize: function(options){
            this.parentCt = options.parentCt;
        },

        onShow: function(){
            this.model.fetch({
                success: _.bind(function(resp){
                    this.render();
                }, this)
            });
        },

        onRender: function(){
            //recover selections only upon render so the tags can be found.
            _.each(this.parentCt.selectionVal, _.bind(function(tokens, model){
                this.$el.find('[model='+model+']').each(function(index, el){
                    var $model = $(this);
                    _.each(tokens, function(affects, token){
                        if(affects === true)
                            //data-self tokens
                            $model.find('[token='+token+']').addClass('active');
                        else{
                            //data-ref, file, logic tokens
                            _.each(affects, function(_true, affected){
                                $model.find('[token='+token+'][affects='+affected+']').addClass('active');
                            });
                        }
                    });
                });
            }, this));
        }

    });


    Backbone.Form.editors['ResourceControl'] = Backbone.Form.editors.Base.extend({

        //tagName: 'input',

        events: {
            'change': function() {
                // The 'change' event should be triggered whenever something happens
                // that affects the result of `this.getValue()`.
                this.trigger('change', this);
            },
            'focus': function() {
                // The 'focus' event should be triggered whenever an input within
                // this editor becomes the `document.activeElement`.
                this.trigger('focus', this);
                // This call automatically sets `this.hasFocus` to `true`.
            },
            'blur': function() {
                // The 'blur' event should be triggered whenever an input within
                // this editor stops being the `document.activeElement`.
                this.trigger('blur', this);
                // This call automatically sets `this.hasFocus` to `false`.
            }
        },

        initialize: function(options) {
            // Call parent constructor
            Backbone.Form.editors.Base.prototype.initialize.call(this, options);

            // Custom setup code.
            //if (this.schema.customParam) this.doSomething();
        },

        render: function() {

            this.delegatedEditor = new ViewWrap({form:this.form, editor:this});
            this.delegatedEditor.listenTo(this.form, 'close', this.delegatedEditor.close);
            this.setValue(this.value);
            this.$el.html(this.delegatedEditor.render().el);
            
            return this;
        },

        getValue: function() {
            var memo = {};
            this.$el.find('li.active,[token=]').each(function(index, selected){
                var $selected = $(selected);
                var model = $selected.parentsUntil('.data-obj-list', '[model]').attr('model');
                memo[model] = memo[model] || {};
                var affectedItem = $selected.attr('affects');
                var token = $(selected).attr('token');
                if(!affectedItem)
                    //data-self 
                    memo[model][token] = true;
                else {
                    //data-ref, file, logic
                    memo[model][token] = memo[model][token] || {};
                    memo[model][token][affectedItem] = true;
                }
            });

            //console.log(memo);
            return memo; 
        },

        setValue: function(value) {
            this.delegatedEditor.recoverFromSelection(value);
        },

        focus: function() {
            if (this.hasFocus) return;

            // This method call should result in an input within this edior
            // becoming the `document.activeElement`.
            // This, in turn, should result in this editor's `focus` event
            // being triggered, setting `this.hasFocus` to `true`.
            // See above for more detail.
            this.$el.focus();
        },

        blur: function() {
            if (!this.hasFocus) return;

            this.$el.blur();
        }
    });
})();


Template.extend('custom-tpl-widget-editor-resource-control-wrap',[
    '<div class="header">',
        '<p class="alert alert-warning edit-later-info">Assign Privileges for this Role below...</p>',
    '</div>',
    '<div class="body"></div>',
    '<div class="footer"></div>'
]);

Template.extend('custom-tpl-widget-editor-resource-control-items', [
    //Data Objects privilege control
    '<div class="data-obj-list">',
        '{{#each models}}',
            '<div class="privilege-entry row-fluid" model="{{name}}">',
                '<div class="span3"><div class="entry-title-ct"><span class="entry-title">{{name}}</span></div></div>',
                '<div class="span9">',
                    //Data api - self
                    '<div class="entry-item clearfix"><span class="entry-item-label">Data Access: </span>',
                    '<ul class="btn-group pull-right" data-toggle="buttons-checkbox">{{#each routes.data.std}}<li token="{{token}}" class="btn">{{@key}}</li>{{/each}}</ul>',
                    '</div>',
                    //Data api - ref [per field]
                    '<div class="entry-item clearfix"><span class="entry-item-label">Reference Data Access: </span>',
                        '{{{showEntryItemFields routes.data.ref}}}',
                    '</div>',
                    //File api - [per file]
                    '<div class="entry-item clearfix"><span class="entry-item-label">File Access: </span>',
                        '{{{showEntryItemFields routes.file}}}',
                    '</div>',
                    //Logic api - [per exposed method]
                    '<div class="entry-item clearfix"><span class="entry-item-label">Logic Access: </span>',
                        '{{{showEntryItemFields routes.logic}}}',
                    '</div>',                    
                '</div>',
            '</div>',
        '{{/each}}',
    '</div>',

    //Meta Objects privilege control
    '<div class="meta-obj-list">',
        '{{#each metaobjs}}',
            '<div class="privilege-entry row-fluid" model="{{name}}">',
                '<div class="span3">',
                    '<span class="pull-left badge">Meta</span>',
                    '<div class="entry-title-ct">',
                        '<span class="entry-title">{{name}}</span>',
                    '</div>',
                '</div>',
                '<div class="span8">',
                    //Logic api - [per exposed method]
                    '<div class="entry-item clearfix"><span class="entry-item-label">Logic Access: </span>',
                        '{{#each methods}}',
                            '<div class="entry-item-field clearfix">',
                                '<span class="label label-info label-data-field">{{@key}}</span> ',
                                '<ul class="btn-group pull-right" data-toggle="buttons-checkbox">',
                                    '<li class="btn" token="{{../token}}" affects="{{@key}}">exec</li>',
                                '</ul>',
                            '</div>',
                        '{{/each}}',
                    '</div>',
                '</div>',
            '</div>',
        '{{else}}',
            '<p class="muted text-center" style="margin-top:10px;">No Meta Object APIs Available</p>',    
        '{{/each}}',
    '</div>',
]);

Handlebars.registerHelper('showEntryItemFields', function(fields){
    var result = '';
    _.each(fields, function(privilegeGroup, fname){
        result+=[
                '<div class="entry-item-field clearfix">',
                    '<span class="label label-info label-data-field">' + fname +'</span> ',
                    '<ul class="btn-group pull-right" data-toggle="buttons-checkbox">'            
        ].join('');
        _.each(privilegeGroup, function(privilege, key){
            result+=     '<li class="btn" token="' + privilege.token + '" affects="' + fname + '">' + key + '</li>';
        });
        result+=[
                    '</ul>',
                '</div>'
        ].join('');

    })
    if(result) return result;
    //empty:
    return '<span class="label label-inverse label-na pull-right">N/A</span>';
});





