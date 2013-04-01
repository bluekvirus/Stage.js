/**
 * New Backbone.Form editor 'CUSTOM_GRID'
 *
 * [Req: backgrid.js]
 *
 * @author Tim.Liu
 * @update 2013.03.11
 */
(function(){
    Backbone.Form.editors['CUSTOM_GRID'] = Backbone.Form.editors.Base.extend({

        className: 'custom-form-editor-datagrid',

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
            // Need to delegate the EditorLayout(Datagrid) view to the module later in render.
            this.moduleRef = Application[options.schema.moduleRef];
            this.datagridMode = options.schema.mode;
        },

        render: function() {
            //this.setValue(this.value);

            if(this.model.id){
            //delegating the datagrid display
            	this.delegatedEditor = new this.moduleRef.View.EditorLayout({
    	        	data: this.value, //this is the subDoc/refDoc array [NOT YET a collection].
    	        	apiUrl: this.model.urlRoot+'/'+this.model.id+'/'+this.key, //collection url.
    	        	datagridMode: this.datagridMode,
    	        });
    	        this.delegatedEditor.listenTo(this.form, 'close', this.delegatedEditor.close);
    	        this.$el.html(this.delegatedEditor.render().el);
    	    }else {
    	    	this.$el.addClass('alert alert-info edit-later-info');
    	    	this.$el.html("Once you've created this record, you can come back to edit this field.");
    	    }

            return this;
        },

        getValue: function() {
        	if(this.delegatedEditor && this.datagridMode === 'subDoc')
        		return this.delegatedEditor.collectionRef.toJSON(); //return the collection.
        },

        setValue: function(value) {
            //this.$el.val(value);
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