/**
 * This is the multi-selector editor 'Double-Picker'
 *
 * It needs a 'src' option to get the available selections and a 'namespace'
 * to distinguish from other 'Drag-n-Drop' zones.
 *
 * Options:
 *     dataSrc: [see below],
 *     dndNS:   [String] just a name for the dnd zone link,
 *     valueField: [String] to indicate what's shown in the dnd listing],
 *
 * 'dataSrc' can be of 3 types: (it talks to a data manager to resolve the src resource)
 * 1. data url; ['/api/Abc']
 * 2. module name; ['Abc']
 * 3. fieldname; ['fff'] which indicates a field on the same form. (without data-refreshing)
 *
 * After fetching data from the 'src', it will need to be filtered with what's already selected.
 * Only to highlight what's still available.
 *
 * Utilizing the 'Sortable' jQuery-UI interaction helper.
 *
 * @author Tim.Liu
 * @update 2013.04.07
 * 
 */
(function(){

    var DataEleView = Backbone.Marionette.ItemView.extend({
        template: '#custom-tpl-widget-editor-double-picker-item',
        tagName: 'li',
        className: 'dnd-zone-list-item'
    });

    var DataListView = Backbone.Marionette.CompositeView.extend({
        template: '#custom-tpl-widget-editor-double-picker-list-wrapper',
        itemView: DataEleView,
        itemViewContainer: '.dnd-zone-list',
        className: 'double-picker-list-wrapper',

        initialize: function(options){
            this.ns = options.ns;
        },

        onShow: function(){
            if(this.ns)
                this.$el.find('.dnd-zone-list').addClass('target-dnd-list-'+this.ns);
        }
    });

    var EditorView = Backbone.Marionette.Layout.extend({
        template: '#custom-tpl-widget-editor-double-picker',
        className: 'custom-form-editor-double-picker',

        regions: {
            header: '.double-picker-header',
            footer: '.double-picker-footer',
            src: '.src-dnd-zone',
            target: '.target-dnd-zone'
        },

        initialize: function(options){
            this._options = options;
            this._options.labelField = this._options.labelField || this._options.valueField || 'name';
        },

        onShow: function(){
            this.reloadSrc();
        },

        //TBI: let reloadSrc send option query params to server through DataCenter module.
        reloadSrc: function(){
            var that = this;
            Application.DataCenter.resolve(this._options.dataSrc, this._options.form, function(data){
                //filtered with already selected data.
                var selected = _.reduce(that._options.selectedVal, function(memo, v, index){
                    memo[v] = index+1;
                    return memo;
                },{});
                //_.object(that._options.selectedVal, that._options.selectedVal); - deprecated selected array.
                var srcData = [], targetData = [];
                _.each(data, function(item){
                    var displayItem = {
                        label: item[that._options.labelField],
                        val: item[that._options.valueField]
                    };
                    if(!selected[item[that._options.valueField]])
                        srcData.push(displayItem);
                    else
                        targetData.push(displayItem);
                });
                //recover selected value order:
                targetData = _.sortBy(targetData, function(item){
                    return selected[item.val];
                });

                that.src.show(new DataListView({
                    collection: new Backbone.Collection(srcData),
                    ns: that._options.dndNS,
                    model: new Backbone.Model({
                        meta: {
                            title: 'Available Selections',
                            titleType: 'info',
                        }
                    })
                }));

                that.target.show(new DataListView({
                    collection: new Backbone.Collection(targetData),
                    ns: that._options.dndNS,
                    model: new Backbone.Model({
                        meta: {
                            title: 'Selected',
                        }
                    })                    
                }))

                //enable dnd
                that.$el.find('.dnd-zone-list').sortable({
                    connectWith: '.target-dnd-list-'+that._options.dndNS,
                    placeholder: 'dnd-item-placeholder',
                    //cursor: 'move',
                }).disableSelection();
            });
        },

        getValue: function(){
            var result = [];
            this.target.$el.find('.dnd-zone-list-item .dnd-zone-list-item-val').each(function(index, el){
                result.push($(el).attr('val'));
            });
            return result;
        }
    });


    Template.extend(
        'custom-tpl-widget-editor-double-picker-item',
        [
            '<span class="dnd-zone-list-item-val" val="{{val}}">{{label}}</span>'
        ]
    );

    Template.extend(
        'custom-tpl-widget-editor-double-picker-list-wrapper',
        [
            '<div class="double-picker-list-header label {{#if meta.titleType}}label-{{meta.titleType}}{{/if}}"><span>{{meta.title}}</span></div>',
            '<div class="double-picker-list-body"><ul class="dnd-zone-list clear-margin-left"></ul></div>',
            '<div class="double-picker-list-footer"></div>'
        ]
    );

    Template.extend(
        'custom-tpl-widget-editor-double-picker',
        [
            '<div class="double-picker-header"></div>',
            '<div class="double-picker-body row-fluid">',
                '<div class="target-dnd-zone dnd-zone span4"></div>',
                '<div class="between-dnd-zone span1"><i class="icon-hand-left"></i></div>',//for dnd indicator icons
                '<div class="src-dnd-zone dnd-zone span4"></div>',
            '</div>',
            '<div class="double-picker-footer"></div>',
        ]
    );


    Backbone.Form.editors['CUSTOM_PICKER'] = Backbone.Form.editors.Base.extend({

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
            this._options = options.schema.options || options.schema;
        },

        render: function() {
            //this.setValue(this.value);
            this.delegatedEditor = new EditorView({
                form: this.form,
                selectedVal: this.value,
                dataSrc: this._options.dataSrc,
                dndNS: this._options.dndNS,
                valueField: this._options.valueField,
                labelField: this._options.labelField,
            });
            this.delegatedEditor.listenTo(this.form, 'close', this.delegatedEditor.close);
            this.$el.html(this.delegatedEditor.render().el);
        
            return this;
        },

        onShow: function(){
            this.delegatedEditor.onShow();
        },

        getValue: function() {
            //return this.$el.val();
            return this.delegatedEditor.getValue();
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