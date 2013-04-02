/**
 * =====================
 * This is the menu module that takes in a .json file and renders 
 * the menu items using Backbone.Marionette.CompositeView.
 *
 * Note that the CompositeView(s) are rendering recursively if there
 * is no ItemView defined for the collections.
 *
 *
 * [Design Decisions]
 * Although we can generate the .json map from the module.json files (used to 
 * generate module codes), it requires us to read all the modules before getting
 * this map output-ed, also it requires the module.json files to take on extra
 * key-value pairs just to accommodate this change. This adds another layer
 * between you and modifying the menu order or grouping. We don't like the sound
 * of "Every time I'm changing the menu I'll have to go through every involved 
 * module.json files again..."
 * =====================
 *
 * @author Yan Zhu (yanzhu@fortinet.com), Tim Liu (zhiyuanliu@fortinet.com)
 * @update 2013.03.31
 */
(function(app) {

    /**
     * ================================
     * [*REQUIRED*] 
     * 
     * Module Name 
     * ================================
     */
    var module = app.module("Menu");

    /**
     * ================================
     * Module Data Sources
     * [Model/Collection]
     * ================================
     */
    module.Model = Backbone.Model.extend({});
    module.Collection = Backbone.Collection.extend({
        model: module.Model,
    });
    var _dataURL = './data/menu/menu.json';

    /**
     * ================================
     * Module Views(+interactions)
     * [Widgets]
     * ================================
     */
    module.View = {};

    /**
     * The recursive tree view
     */
    module.View.TreeView = Backbone.Marionette.CompositeView.extend({

        template: '#menu-tree-tpl',

        tagName: 'ul',

        events: {
            'click li:first': 'toggle',
            'click .menu-item': 'asClickingAnchor',
        },

        isLeaf : false,

        collapsible: true,

        collapsed: true,

        initialize: function(options) {

            if (this.model.get('items')) {

                this.collection = new module.Collection(this.model.get('items'));

                this.isLeaf = false;

                this.className = 'menu-tree';

            } else {

                this.isLeaf = true;

                this.className = 'menu-tree-leaf';
            }

            this.$el.addClass(this.className);
        },

        onRender: function() {

            var li = this.$el.children('li');

            if (this.isLeaf) {

                li.find('.menu-group').remove();

                li.attr('module', this.model.get('module'));

            } else {

                li.find('.menu-item').remove();

                if (this.collapsible && this.collapsed) {

                    this.$el.children('ul').hide();
                }
            }
            
        },

        toggle: function(event) {

            event.stopPropagation();

            if (!this.isLeaf && this.collapsible) {

                this.$el.children('ul').toggle();
            }
        },

        asClickingAnchor: function(e){
            //Do NOT use .currentTarget since it will
            //always be the current obj that this event passes.
            //We need the original target to be '.menu-item'
            //click event will pop-up from <a> causing a infinite loop.
            //TODO:: refine this...
            var anchor = $(e.target).find('> a');
            if(anchor.length > 0)
                window.location = anchor.attr('href');
            //else skip, this must be clicked from inner <a>
        },

    });

    /**
     * The single accordion item view
     */
    module.View.AccordionItemView = Backbone.Marionette.CompositeView.extend({

        template: "#menu-accordion-item-tpl",

        tagName: "div",

        className: 'menu-accordion-item',

        itemViewContainer: '.menu-accordion-item-content',

        itemView: module.View.TreeView,

        initialize: function() {

            if (this.model.get('items')) {

                this.collection = new module.Collection(this.model.get('items'));
            }
        }
    });
     
    /**
     * The whole accordion view
     */
    module.View.AccordionView = Backbone.Marionette.CollectionView.extend({

        className: 'menu-accordion',

        itemView: module.View.AccordionItemView,

        initialize: function(){
            // Listen to Application 'navigateToModule' event
            this.listenTo(app, 'navigateToModule', this.changeSelected);
        },

        onRender: function() {
            // Activate the accordion after rendered
            this.$el.accordion({
                header: '.menu-accordion-item-header',
                event: 'click',
                heightStyle: 'content'
            });

        },

        changeSelected: function(moduleName) {
            this._selectModule(moduleName);
        },

        _selectModule: function(moduleName) {

            this.$el.find('[module]').removeClass('selected');
            var li = this.$el.find('[module="'+moduleName+'"]');

            li.addClass('selected');

            // If this menu item is hidden, show its ancestor menu group and siblings(ancestor uncles)
            // Also show the accordion item it is in
            if (li.is(':hidden')) {
                li.parents('.menu-tree').show().children('ul').show();
                li.parents('.menu-accordion-item').find('.menu-accordion-item-header').click();
            }

        }

    });


    /**
     * 
     * Private worker, for fetching pre-set menu structure
     * and register the modules if they have the defaultAdminPath set.
     *
     * **NOTE** that async data fetching might screw up the init seq, thus making
     * the first 'navigateToModule' event lost.
     * 
     * @param  {[String]} url this would be the server path to fetch menu.json.
     * 
     */
    var _prepareMenuData = function(url, cb){
        $.ajax({
            url: url,
            async: false,
            success: function(data, textStatus, xhr) {
          
            //register module pre-set path to the menu data object:
            _.each(app.submodules, function(sMod, name){
                if(sMod.defaultAdminPath){
                    _mergePath(data, sMod.defaultAdminPath.split('->'), name);
                }
            })

            //console.log(data);
            //call the cb to render the menu view.
            cb(new module.Collection(data));

            }
        });
        
    }

    //No order atm...just append.
    var _mergePath = function(originalPathArray, newPathDescriptor, moduleName){
        if(!newPathDescriptor || newPathDescriptor.length === 0) return;

        if(newPathDescriptor.length === 1){
            originalPathArray.push({
                label: newPathDescriptor[0],
                module: moduleName
            })
            return;
        }

        var nodeLabel = newPathDescriptor.shift();
        var target = _.findWhere(originalPathArray, {label: nodeLabel});
        if(target){
            target.items = target.items || [];
            _mergePath(target.items, newPathDescriptor, moduleName);
        }else{
            var node = {
                label: nodeLabel,
                items: []
            }
            originalPathArray.push(node);
            _mergePath(node.items, newPathDescriptor, moduleName);
        }
        
    }

    /**
     * ================================
     * [*REQUIRED*]
     *  
     * Module Layout
     * Opt.[+interactions] 
     * ================================
     */ 
    module.View.AccordionLayout = Backbone.Marionette.Layout.extend({

        template: "#custom-tpl-layout-menu-accordion",            
        
        className: "custom-tpl-layout-wrapper",

        regions: {
            header: '.menu-header',
            body: '.menu-body',
            footer: '.menu-footer'
        },
        
        meta: {

        },

        initialize:function(options){
            if(!options || !options.model)
                this.model = new Backbone.Model({meta:this.meta});
        },

        onRender:function(){
            var that = this;
            _prepareMenuData(_dataURL, function(mCollection){
                that.body.show(new module.View.AccordionView({collection: mCollection}));
            })
            
        }


    });

    /**
     * ================================
     * [*REQUIRED*] 
     * 
     * Module's default menu view
     * (Points to a layout view above)
     * ================================
     */
    module.View.Default = module.View.AccordionLayout;

})(Application);

/**
 * ==========================================
 * Module Specific Tpl
 * [Generic tpls go to templates/generic/...]
 * ==========================================
 */

 /**
  * Menu accordion item template
  */
Template.extend(
    'menu-accordion-item-tpl',
    [
        '<div class="menu-accordion-item-header">{{label}}</div>',
        '<div class="menu-accordion-item-content"></div>'       
    ]
);


/**
 * Menu tree template
 */
Template.extend(
    'menu-tree-tpl',
    [
        '<li>',
            '<div class="menu-group">',
                '<span>{{label}}</span>',
            '</div>',
            '<div class="menu-item">',
                '<a href="#config/{{module}}">{{label}}</a>',
            '</div>',
        '</li>'
    ]
);

/**
 * Accordion Layout Wrapper tpl
 */
Template.extend(
    'custom-tpl-layout-menu-accordion',
    [
        '<div class="menu-header"></div>',
        '<div class="menu-body"></div>',
        '<div class="menu-footer"></div>'

    ]
);


