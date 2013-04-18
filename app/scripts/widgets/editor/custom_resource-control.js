/**
 * 
 * This is the Resource Control Editor used for User privilege 
 * assignment. It is used in the Role entity and the same concept
 * can be used for any resource control mech. 
 *
 * Concept: (type here is not the mapping type, but a meta describing resource type)
 * register>> 
 *     Resource <- Signatures <- Mappings
 * assign>>
 *     Role <- (Resource.(type).Mappings) <- Signatures (yes/no)
 * resolve>>
 *     (req.path) -> (/:type/:Resource/...) -> User.Role.Privileges[Resource.(type).Mappings]
 *
 * For performance reason it is better to re-group the Mappings inside a Resource
 * to be grouped with types e.g /:type/:Resource when saved in a Role. Specifically,
 * 
 *     mapping.split('/') =>   [0]: should always be "";
 *                             [1]: type;
 *                             [2]: Resource name; [null] means "Index Page";
 *
 * Note:: We still use the full mappings(+mapping type) when try to match with req.path
 * in authorization middleware.
 *                             
 *
 * @author Tim.Liu
 * @created 2013.04.18
 * 
 */
(function(){

    var ResourceCollection = Backbone.Collection.extend({
        model: Backbone.Model.extend({}),
    });

    var ResourceItem = Backbone.Marionette.ItemView.extend({
        template: '#custom-tpl-widget-editor-resource-item',
        className: 'custom-form-editor-resource-control-item',
        tagName: 'tr',

        events: {
            'click li': 'toggleSelection',
            'recover': 'recoverSelection',
        },

        toggleSelection: function(e){
            var target = $(e.target);
            target.toggleClass('btn-success selected');
        },

        recoverSelection: function(e){
            var target = $(e.target);
            target.toggleClass('btn-success selected active');
        },

    });

    var ViewWrap = Backbone.Marionette.CompositeView.extend({
        template: '#custom-tpl-widget-editor-resource-control-wrap',
        className: 'custom-form-editor-resource-control custom-editor-wrap',
        itemView: ResourceItem,
        itemViewContainer: '.body tbody',

        ui: {
            header: '.header',
            body: '.body',
            footer: '.footer'
        },

        events: {
            'click .custom-form-editor-resource-control-item li': 'markSelection'
        },

        initialize: function(options){
            this._options = options;
        },

        onRender: function(){
            //TODO::
            this.$el.find('.btn').button().popover({
                placement: 'top',
                trigger: 'hover',
                html: 'true',
                container: 'body'
            });
        },

        getValue: function(){
            return this.privileges;
        },

        setValue: function(val){
            this.privileges = val || {} ;
            var that = this;
            _.each(val, function(signatures, resouce){
                //mark
                _.each(signatures, function(bool, sig){
                    that.$el.find('.btn[resource="'+resouce+'"][signature="'+sig+'"]').trigger('recover');
                });
            });
        },

        markSelection: function(e){
            var target = $(e.target);
            var r = target.attr('resource'), s = target.attr('signature');
            if(target.hasClass('selected')){
                this.privileges[r] = this.privileges[r] || {};
                this.privileges[r][s] = true;
            }else{
                try{
                    delete this.privileges[target.attr('resource')][target.attr('signature')];
                }catch(e){
                    console.log('omit deletion privilege...');
                }
                
            }
        }
    });

    Template.extend('custom-tpl-widget-editor-resource-item', [

        '<td><span class=""><i class="icon-cog"></i> {{name}}</span></td>',
        '<td><ul class="btn-group" data-toggle="buttons-checkbox">',
            ' {{#each signatures}}',
                '<li class="btn" resource="{{../name}}" signature="{{this.name}}" data-title="Mappings" data-content="{{#if mappings}}{{#each mappings}}{{showSignatureMapping this}}{{/each}}{{else}}<p class=\'label label-important\'>N/A</p>{{/if}}">{{this.name}}</li>',
            '{{/each}}',
        '</ul></td>'

    ]);

    Template.extend('custom-tpl-widget-editor-resource-control-wrap',[
        '<div class="header"></div>',
        '<div class="body"><table class="table table-striped"><thead><tr><th>Resources</th><th>Signatures</th></tr></thead><tbody></tbody></table></div>',
        '<div class="footer"></div>'
    ]);


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
            Application.DataCenter.resolve('Resource', this.form, _.bind(function(data){
                this.delegatedEditor = new ViewWrap({form:this.form, editor:this, collection: new ResourceCollection(data)});
                this.delegatedEditor.listenTo(this.form, 'close', this.delegatedEditor.close);
                this.$el.html(this.delegatedEditor.render().el); 
                this.setValue(this.value);               
            }, this));

        
            return this;
        },

        getValue: function() {
            return this.delegatedEditor.getValue();
        },

        setValue: function(value) {
            this.delegatedEditor.setValue(value);
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
