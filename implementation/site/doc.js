;(function(app){

    app.page('Document', {
        className: 'wrapper container-fluid',
        template: [
            '<div class="row">',
                '<div class="col-sm-offset-1 col-sm-3">',
                    '<div region="toc"></div>',
                    '<div region="libinfo"></div>',
                '</div>',
                '<div class="col-sm-7">',
                    '<div region="breadcrumbs" view="Doc.Breadcrumbs" style="position: fixed; top: 0; right: 0; display:none"></div>',
                    '<div region="doc" data-url="HOWTO.md"></div>',
                '</div>',
            '</div>'
        ],
        initialize: function(){
            this.listenTo(app, 'app:scroll', function(offset){
                if(!this.$headers || offset < 150) {
                    this.breadcrumbs.$el.hide();
                    return;
                }
                var stop = false, $result, viewportH = $window.height();

                _.each(this.$headers, function($h, index){
                    if(stop) return;
                    if($h.offset().top > offset + viewportH * 0.35) {
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
                //console.log(path);
            });
        },
        actions: {
            refresh: function($region, e){
                //if(e.altKey !== true) return; //both Unix and Windows
                this.trigger('view:reload-doc');
            }
        },
        onReloadDoc: function(){ //meta:event programming
            var that = this;
            this.doc.$el.md({
                hljs: {
                    languages: ['js', 'html']
                },
                cb: function($el){
                    $el.toc({
                        ignoreRoot: true,
                        headerHTML: '<div class="text-muted">Table of Content</div><hr/>'
                    });
                    that.toc.show(app.regional({
                        //no name means to use it anonymously, which in turn creates it right away. 
                        template: $el.data('toc').html,
                        actions: {
                            goTo: function($btn, e){
                                e.preventDefault();
                                that.trigger('view:go-to-topic', $btn.data('id'));
                            }
                        }
                    }));
                    that.$headers = that.doc.$el.data('toc').$headers;
                }
            });
        },
        onGoToTopic: function(id){
            if(!id) return;
            var $topic = this.doc.$el.find('#' + id);
            $window.scrollTop($topic.offset().top - window.innerHeight*0.16);
        },
        onShow: function(){

            this.libinfo.show(app.regional({
                tagName: 'ul',
                className: 'list-group',
                template:[ 
                    '<div class="text-muted">Included Libraries</div><hr/>',    
                    '{{#each list}}',
                        '<li class="list-group-item" ui="libitem">',
                            '{{#if url}}<a href="{{url}}">{{name}}</a>',
                            '{{else}}{{name}}',
                            '{{/if}}',
                            '<span class="badge">{{version}}</span></li>',
                    '{{/each}}',
                    '<li class="list-group-item text-center panel-footer"><small>{{created}}</small></li>',
                    '<h5 class="text-center"><small>Package manager: <a href="http://bower.io/">bower</a></small></h5>',
                ],
                onShow: function(){
                    var that = this;
                    $.get('js/lib/dependencies.json').done(function(data){
                        _.extend(data, {
                            created: moment(data.created).fromNow()
                        });
                        that.trigger('view:render-data', data);
                        that.$el.css({
                            padding: '0 6px'
                        });
                        var versionBadges = that.$('.badge');
                        versionBadges.css({
                            background: 'transparent',
                            color: versionBadges.css('backgroundColor'),
                            border: '1px solid'
                        });
                        //console.log(that.ui.libitem);
                    });                
                }
            }));

            this.doc.$el.data('md', store.get('doc'));
            this.trigger('view:reload-doc'); 
        },

        onNavigateAway: function(){
            store.set('doc', this.doc.$el.data('md')); //use localStorage to cache the context state;
        }
    });

    //Document - Regionals
    app.area('Doc.Breadcrumbs', {
        tagName: 'ol',
        className: 'breadcrumb',
        template: [
            '<li><i class="btn btn-primary btn-xs fa fa-arrow-up" action="goTop"></i> <i class="btn btn-warning btn-xs fa fa-refresh" action="refresh"></i></li>',
            '{{#each path}}',
                '<li class="breadcrumb-item" ui="breadcrumb-item">',
                    '<a href="#" action="goTo" data-id="{{id}}">{{ title }}</a>',

                    //put sibling topics under this level here in a <ul>
                    '<ul class="dropdown-menu">',
                        '{{#each sibling}}',
                            '{{#if this}}',
                            '<li><a href="#" action="goTo" data-id="{{id}}">{{title}}</a></li>',
                            '{{/if}}',
                        '{{/each}}',
                    '</ul>',
                    
                '</li>',
            '{{/each}}',
        ],
        actions: {
            _bubble: true,

            goTop: function(){
                $window.scrollTop(0);
            },
            goTo: function($btn, e){
                e.preventDefault();
                this.parentCt.trigger('view:go-to-topic', $btn.data('id'));
            }

        },
        events: {
            'mouseenter .breadcrumb-item' : function(e){
                var $this = $(e.currentTarget);
                this.ui['breadcrumb-item'].removeClass('open');
                $this.addClass('open');
            },

            'mouseleave .breadcrumb-item .dropdown-menu' : function(e){
                this.ui['breadcrumb-item'].removeClass('open');
            }
        }

    });

})(Application);