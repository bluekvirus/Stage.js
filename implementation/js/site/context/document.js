;(function(app){

    app.context('Document', {
        className: 'wrapper container-fluid',
        template: [
            '<div class="row">',
                '<div class="col-sm-offset-1 col-sm-3">',
                    '<div region="toc"></div>',
                    '<div region="libinfo"></div>',
                '</div>',
                '<div class="col-sm-7">',
                    '<div region="breadcrumbs" view="Doc.Breadcrumbs" style="background-color:#eee; padding: 0 1em;position: fixed; top: 0; right: 0; display:none"></div>',
                    '<i class="project-title"></i><hr/>',
                    '<span class="h6 text-primary">'+ app.stagejs + '</span> ',
                    '(<a href="http://semver.org/">M.m.p@semver</a>-<a href="https://github.com/bluekvirus/Stage.js/commits/master">commits@github</a> and timestamp)',
                    '<div region="doc" data-url="HOWTO.md"></div>',
                '</div>',
            '</div>'
        ],
        initialize: function(){
            this.listenTo(app, 'app:scroll', function(offset, $viewport){
                if(!this.$headers || offset < 150) {
                    this.breadcrumbs.$el.hide();
                    return;
                }
                this.$viewport = $viewport;
                var stop = false, $result, viewportH = this.$viewport.height();

                _.each(this.$headers, function($h, index){
                    if(stop) return;
                    if($h.offset().top > viewportH * 0.1) { //$el.offset() is always relative to edge of screen, not parent $el top.
                        $result = this.$headers[index-1];
                        stop = true;
                    }
                }, this);
                if(!$result) return;

                $result = $result.data('toc-node');
                //hilight this header and its parents in breadcrumbs
                var path = [];
                while($result){
                    var info = $result.data();
                    if(_.isEmpty(info)) break; //root

                    path.unshift({
                        title: info.title,
                        id: info.id,
                        sibling: _.map($result.$parent.$children.data('children'), function($topic){
                            var i = $topic.data();
                            if(i.title !== info.title) return {
                                title: i.title,
                                id: i.id
                            };
                        })
                    });

                    $result = $result.$parent;
                }
                this.breadcrumbs.$el.show();
                this.breadcrumbs.currentView.trigger('view:render-data', {path: path});
                //app.debug(path);
            });
        },
        actions: {
            refresh: function($region, e){
                //if(e.altKey !== true) return; //both Unix and Windows
                this.trigger('view:reload-doc');
            }
        },
        onReady: function(){
            //inject the highlight js configure to markdown $anchor.
            this.getRegion('doc').$el.data('hljs', {
                languages: ['javascript', 'html']
            });
            this.trigger('view:reload-doc'); 
        },
        onReloadDoc: function(){ //meta:event programming
            var that = this;
            app.remote(this.doc.$el.data('url')).done(function(md){
                //render markdown
                app.markdown(md, that.doc.$el, {headerPrefix: function(opt){return _.uniqueId('topic-') + '-';}});
                //generate table-of-content
                that.doc.$el.toc({
                    ignoreRoot: true,
                    headerHTML: '<div class="text-muted">Table of Content</div><hr/>'
                });
                that.toc.show(app.view({
                    template: that.doc.$el.data('toc').html,
                    actions: {
                        goTo: function($btn, e){
                            that.trigger('view:go-to-topic', $btn.data('id'));
                        }
                    }
                }));
                that.$headers = that.doc.$el.data('toc').$headers;

            });
        },
        onGoToTopic: function(id){
            if(!id) {
                return this.$viewport.scrollTop(0);
            }
            var $topic = this.doc.$el.find('#' + id);
            this.$viewport.scrollTop(this.$viewport.scrollTop() + $topic.offset().top); //$el.offset() is relative to current viewport.
        },
    });

    //Document - Regionals
    app.view('Doc.Breadcrumbs', {
        tagName: 'ol',
        className: 'breadcrumb',
        template: [
            '<li>',
                '<i class="btn btn-primary btn-xs fa fa-arrow-up" action="goTo"></i> ', //goTo nothing means go top!
                '<i class="btn btn-warning btn-xs fa fa-refresh" action="refresh"></i> ',
            '</li>',
            '{{#each path}}',
                '<li class="breadcrumb-item" action-mouseenter="showSubItems">',
                    '<a href="#" action="goTo" data-id="{{id}}">{{ title }}</a>',

                    //put sibling topics under this level here in a <ul>
                    '<ul class="dropdown-menu" action-mouseleave="hideSubItems">',
                        '{{#each sibling}}',
                            '{{#if this}}',
                            '<li><a href="#" action="goTo" data-id="{{id}}">{{title}}</a></li>',
                            '{{/if}}',
                        '{{/each}}',
                    '</ul>',
                    
                '</li>',
            '{{/each}}',
            '<li><i class="fa fa-hand-pointer-o"></i> '
        ],
        actions: {
            _bubble: true,

            goTo: function($btn, e){
                this.parentCt.trigger('view:go-to-topic', $btn.data('id'));
            },
            showSubItems: function($item){
                this.$el.find('.breadcrumb-item').removeClass('open');
                $item.addClass('open');
            },
            hideSubItems: function($item){
                this.$el.find('.breadcrumb-item').removeClass('open');
            }

        },

    });

})(Application);