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
            'click li:first': 'toggleTree'
        },

        collapsible: true,

        collapsed: true,

        initialize: function() {
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

        toggleTree: function(event) {
            if (this.subMenus.length > 0) {
                if (this.collapsible) {
                    this.subMenus.toggle();
                }
            } else {
                var module = this.$el.find('li:first').attr('module');
                console.log(module);
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
        },

        onRender: function() {
            // console.log('AccordionItemView '+this.model.get('label')+' rendered');

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