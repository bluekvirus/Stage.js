    Application.page('Document', {
        className: 'container',
        template: [
            '<div class="row">',
                '<div class="col-sm-3">',
                    '<div region="toc" ></div>',
                    '<hr/>',
                    '<div region="libinfo"></div>',
                '</div>',
                '<div class="col-sm-9" style="padding-left:60px;">',
                    '<div region="breadcrumbs" view="Doc.Breadcrumbs" style="position: fixed; top: 0; right: 0; display:none"></div>',
                    '<div region="doc" md="HOWTO.md" action="refresh"></div>',
                '</div>',
            '</div>',
        ],
        initialize: function(){
            this.listenTo(Application, 'app:scroll', function(offset){
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

                //hilight this header and its parents in breadcrumbs
                var path = [{title: $result.data('title'), id: $result.data('id')}];
                $parent = $('#' + $result.data('parent').id);
                while($parent.length){
                    var info = $parent.data();
                    path.unshift({
                        title: info.title,
                        id: info.id
                    });
                    $parent = $('#' + info.parent.id);
                }
                this.breadcrumbs.$el.show();
                this.breadcrumbs.currentView.trigger('view:render-data', {path: path});
            })
        },
        actions: {
            refresh: function($region, e){
                if(e.altKey !== true) return; //both Unix and Windows
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
                        headerHTML: '<div class="h4" style="margin-top:48px"><i class="fa fa-book"></i> Table of Content</div>'
                    });
                    that.toc.show(Application.regional({
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

            this.trigger('view:reload-doc');
            this.libinfo.show(Application.regional({
                tagName: 'ul',
                className: 'list-group',
                template:[ 
                    '<h4 class="text-center panel-heading"><i class="fa fa-cogs"></i> Included Libraries</h4>',    
                    '{{#each list}}<li class="list-group-item" ui="libitem">{{#if url}}<a href="{{url}}">{{name}}</a>{{else}}{{name}}{{/if}}<span class="badge">{{version}}</span></li>{{/each}}',
                    '<li class="list-group-item text-center panel-footer"><small>{{created}}</small></li>',
                    '<h5 class="text-center"><small>Learn more about <a href="http://bower.io/">bower</a> js package manager</small></h5>',
                ],
                onShow: function(){
                    var that = this;
                    Application.remote('js/lib/dependencies.json').done(function(data){
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
        }
    });

    //Document - Regionals
    Application.area('Doc.Breadcrumbs', {
        tagName: 'ol',
        className: 'breadcrumb',
        template: [
            '<li><i class="btn btn-primary btn-xs fa fa-arrow-up" action="goTop"></i></li>',
            '{{#each path}}',
                '<li><a href="#" action="goTo" data-id="{{id}}">{{ title }}</a></li>',
            '{{/each}}',
        ],
        actions: {
            goTop: function(){
                $window.scrollTop(0);
            },
            goTo: function($btn, e){
                e.preventDefault();
                this.parentCt.trigger('view:go-to-topic', $btn.data('id'));
            }
        }

    });