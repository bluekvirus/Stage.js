/**
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
 *
 * 
 *
 * @author Yan Zhu (yanzhu@fortinet.com), Tim Liu (zhiyuanliu@fortinet.com)
 * @update 2013.03.14
 * 
 */
(function(app) {

    var module = app.module("Menu");

    module.Model = Backbone.Model.extend({});

    module.Collection = Backbone.Collection.extend({
        model: module.Model,
        url: '/data/menu.json'
    });

    module.collection = new module.Collection();

    module.View = {};

    // The recursive tree view
    module.View.TreeView = Backbone.Marionette.CompositeView.extend({

        template: '#menu-tree-tpl',

        tagName: 'ul',

        events: {
            'click li:first': 'toggleOrGoTo',
        },

        collapsible: true,

        collapsed: true,

        initialize: function(options) {

            if (this.model.get('items')) {
                this.collection = new module.Collection(this.model.get('items'));
                this.className = 'menu-tree';
            } else {
                this.className = 'menu-tree-leaf';
            }
        },

        onBeforeRender: function() {
            this.$el.addClass(this.className);
        },

        onRender: function() {
            this.subMenus = this.$el.children('ul');
            if (this.collapsible && this.collapsed
                && this.subMenus.length > 0) {
                this.subMenus.hide();
            }
        },

        toggleOrGoTo: function(event) {
            if (this.subMenus.length > 0) {
                if (this.collapsible) {
                    this.subMenus.toggle();
                }
            } else {
                var module = this.$el.find('li:first').attr('module');
            }
        }
    });

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
     
    module.View.AccordionView = Backbone.Marionette.CollectionView.extend({

        className: 'menu-accordion',

        itemView: module.View.AccordionItemView,

        initialize: function(){

            this.collection = module.collection;

            var that = this;

            this.collection.fetch({

                success: function(collection, response, options) {
                    collection.dataChanged = true;
                    that.render();
                },

                error: function(collection, xhr, options) {
                    var errorHtml = [
                        '<div style="color:red;font-weight:bold;">',
                            'Load Menu Data Error!',
                        '</div>',
                        '<div style="color:red;">',
                            xhr.responseText,
                        '</div>'
                    ].join('');
                    that.$el.html(errorHtml);
                    // console.log(xhr);
                }

            });

        },

        onRender: function() {

            if (this.collection.dataChanged) {

                this.$el.accordion({
                    header: '.menu-accordion-item-header',
                    heightStyle: 'content'
                });

                this.collection.dataChanged = false;

            }

        }

    });

})(Application);

//menu accordion item template
Template.extend(
    'menu-accordion-item-tpl',
    [
        '<div class="menu-accordion-item-header">{{label}}</div>',
        '<div class="menu-accordion-item-content"></div>'       
    ]
);


//menu tree template
Template.extend(
    'menu-tree-tpl',
    [
        '<li module="{{module}}"><div class="menu-item-wrapper"><a href="#config/{{module}}">{{label}}</a></div></li>'
    ]
);