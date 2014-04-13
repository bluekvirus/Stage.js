;Application.setup({

    //You can override other production config vars if wanted.
    //fullScreen: true,
    template: '<div region="banner" view="Banner"></div><div region="center"></div><div region="footer" view="Footer"></div>',
    contextRegion: 'center',
    defaultContext: 'Document'

}).run();


;(function(){

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
            this.listenTo(Application, 'app:scroll', function(offset, viewportH){
                if(!this.$headers || offset < 150) {
                    this.breadcrumbs.$el.hide();
                    return;
                }
                var stop = false, $result;
                _.each(this.$headers, function($h, index){
                    if(stop) return;
                    if($h.offset().top > offset + viewportH * 0.35) {
                        $result = this.$headers[index-1];
                        stop = true;
                    }
                }, this);
                if(!$result) throw new Error('document headers error!');

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
                    Application.remote('js/libs/tracked/built/selected.json').done(function(data){
                        _.extend(data, {
                            created: moment(data.created).fromNow()
                        });
                        //push additional lib info
                        var additionals = [
                            {
                                name: 'highlight.js',
                                version: '8.0',
                                url: 'http://highlightjs.org/'
                            },
                            {
                                name: 'font-awesome',
                                version: '4.0.3',
                                url: 'http://fontawesome.io/'
                            }
                        ]
                        _.each(additionals, function(add){
                            var target = _.findWhere(data.list, {name: add.name});
                            if(!target) data.list.push(add);
                            else _.extend(target, add);
                        });
                        //------------------------
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
    Application.create('Area', {
        name: 'Doc.Breadcrumbs',
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

    Application.create('Page', {
        name: 'Demo',
        //debug: true,
        template: [
            '<div region="center"></div>',
        ],
        onNavigateTo: function(subPath){
            this.layout.center.trigger('region:load-view', subPath);
        }

    });

    //Demo - Regionals
    Application.create('Area', {
        name: 'Editors',
        className: 'container',
        template: [
            '<div class="row">',
                '<div class="form form-horizontal"></div>',
            '</div>', //the class form form-horizontal is required for the editor layout class config to work in bootstrap 3
            '<div class="row">',
                '<div class="col-sm-10 col-sm-offset-2">',
                    '<span class="btn btn-primary" action="submit">Submit</span> ',
                    '<span class="btn btn-warning" action="validate">Validate</span> ',
                    '<span class="btn btn-default" action="test">Test</span> ',
                    '<span class="btn btn-default" action="test2">Test(Disable/Enable)</span> ',
                    '<span class="btn btn-info" action="info">Inform</span> ',
                    '<span class="btn btn-info" action="clearinfo">Clear Info</span> ',
                '</div>',
            '</div>'
        ],
        onShow: function(){
            this.getEditor('ab').disable();
            this.getEditor('radios').disable();
        }
        ,
        actions: {
            validate: function($btn){
                this.validate(true);
            },
            submit: function(){
                console.log(this.getValues());
            },
            test: function(){
                this.setValues({
                    checkboxes: [1231, 1233],
                    readonly2: 'Hello!',
                    singlecheckbox: 'enabled'
                });
            },
            test2: function(){
                var editor = this.getEditor('checkboxes');
                if(editor.isEnabled()) editor.disable(true);
                else {
                    editor.disable(false);
                    this.getEditor('ab').disable(false);
                    this.getEditor('radios').disable(false);
                }
            },
            info: function(){
                this.status('success', {
                    singlecheckbox: 'passed!',
                    efg: {
                        status: 'error',
                        message: 'another server error!'
                    }
                });
            },

            clearinfo: function(){
                this.status();
            }
        },
        editors: {

            _global: {
                layout: {
                    label: 'col-sm-2',
                    field: 'col-sm-10'
                },
                appendTo: 'div.form',
            },

            abc: {
                type: 'text',
                label: 'Abc',
                help: 'This is abc',
                tooltip: 'Hey Abc here!',
                fieldname: 'newfield',
                validate: {
                    required: {
                        msg: 'Hey input something!'
                    },
                    fn: function(val, parentCt){
                        if(!_.string.startsWith(val, 'A')) return 'You must start with an A';
                    }
                }

            },
            ab: {
                label: 'Ab',
                help: 'This is ab',
                tooltip: 'Hey Ab here!',
                placeholder: 'abc...',
                value: 'default',
                validate: function(val, parentCt){
                    console.log(val);
                    if(val !== '123') return 'You must enter 123';
                }
            },
            efg: {
                label: 'Ha Ha',
                type: 'password',
                validate: {
                    checkitout: true
                }
            },
            area: {
                label: 'Codes',
                type: 'textarea',
                validate: {
                    required: true
                }
            },
            readonly: {
                label: 'RO',
                html: '<p class="text-success">Nothing...but HTML</p>'
            },

            readonly2: {
                label: 'RO 2',
                type: 'ro',
                value: 'Unchange-able'
            },

            xyz: {
                label: 'File',
                type: 'file',
                help: 'Please choose your image to upload.',
                upload: {
                    url: function(){ return '/file/Blog2/';}
                }
            },
            radios: {
                label: 'Radios',
                type: 'radios',
                help: 'choose the one you like',
                tooltip: {
                    title: 'hahahaha'
                },
                options: {
                    inline: true,
                    //data: ['a', 'b', 'c', 'd']
                    data: [
                        {label: 'Haha', value: 'a'},
                        {label: 'Hb', value: 'b'},
                        {label: 'Hc', value: 'c'},
                        {label: 'Hd', value: 'd'}
                    ]
                }
            },
            checkboxes: {
                label: 'Checkboxes',
                type: 'checkboxes',
                help: 'choose more than you like',
                fieldname: 'haha',
                options: {
                    //inline: true,
                    //data: ['a', 'b', 'c', 'd']
                    data: [
                        {key: 'abc1', val: '1231', other: 'bbb1'},
                        {key: 'abc2', val: '1232', other: 'bbb2'},
                        {key: 'abc3', val: '1233', other: 'bbb3'},
                        {key: 'abc4', val: '1234', other: 'bbb4'},
                        {key: 'abc5', val: '1235', other: 'bbb5'},
                    ],
                    labelField: 'other',
                    valueField: 'val'
                }
            },
            singlecheckbox: {
                label: 'Check?',
                type: 'checkbox',
                boxLabel: 'Select this one if you are smart...:D',
                checked: 'enabled',
                unchecked: 'disabled',
            },

            select: {
                label: 'Select',
                type: 'select',
                help: 'choose 1 you like',
                multiple: true,
                options: {
                    //data: ['a', 'b', 'c', 'd']
                    data: [
                        {key: 'abc1', val: '1231', other: 'bbb1'},
                        {key: 'abc2', val: '1232', other: 'bbb2'},
                        {key: 'abc3', val: '1233', other: 'bbb3'},
                        {key: 'abc4', val: '1234', other: 'bbb4'},
                        {key: 'abc5', val: '1235', other: 'bbb5'},
                    ],
                    labelField: 'other',
                    valueField: 'val'
                }
            },

            selectgroup: {
                label: 'Group',
                type: 'select',
                options: {
                    data: {
                        group1: [{label: 'abc', value: '123'}, {label: '4555', value: '1111'}],
                        group2: [{label: 'abcx', value: '123x'}, {label: '4555x', value: '1111x'}],
                    }
                }
            }  
        }
    });             

    //Shared - Regionals
    Application.create('Regional', {
        name: 'Banner',
        effect: {
            name: 'fade',
            duration: 500
        },
        initialize: function(){
            this.listenTo(Application, 'app:context-switched', function(name){
                this.$el.find('[context]').removeClass('active');
                this.$el.find('[context="' + name + '"]').addClass('active');
            });
        },
        actions: {
            download: function($btn, e){
                e.preventDefault();
                var base = 'static/resource/default/download/';
                Application.Util.download(base + $btn.attr('target'));  
            },
            themePreview: function($btn, e){
                e.preventDefault();
                location.href = ['themes', Application.currentTheme, 'index.html'].join('/') ;
            }
        },
        template: [
            '<div class="navbar navbar-default">',

                '<div class="navbar-header">',//A
                  '<button data-target=".navbar-responsive-collapse" data-toggle="collapse" class="navbar-toggle" type="button">',//1
                    '<span class="icon-bar"></span>',
                    '<span class="icon-bar"></span>',
                    '<span class="icon-bar"></span>',
                  '</button>',
                  '<a href="#navigate/Home" class="navbar-brand">PM.js</a>',//2
                '</div>',

                '<div class="navbar-collapse collapse navbar-responsive-collapse">',//B

                  '<ul class="nav navbar-nav">',//1
                    '<li context="Home"><a href="#navigate/Home">Home</a></li>',
                    '<li context="Document"><a href="#navigate/Document">Document</a></li>',
                    '<li context="Demo" class="dropdown">',
                      '<a data-toggle="dropdown" class="dropdown-toggle" href="#">Demo <b class="caret"></b></a>',
                      '<ul class="dropdown-menu">',
                        '<li><a href="#" action="themePreview">Theme Preview</a></li>',
                        '<li class="divider"></li>',
                        '<li class="dropdown-header">Basics</li>',
                        '<li><a href="#navigate/Demo/Editors">Editors</a></li>',
                        '<li><a href="#">Data Table</a></li>',
                        '<li><a href="#">Tree</a></li>',
                        '<li class="divider"></li>',
                        '<li class="dropdown-header">Accessories</li>',
                        '<li><a href="#">Notifications</a></li>',
                        '<li><a href="#">Terminal</a></li>',
                      '</ul>',
                    '</li>',
                  '</ul>',

                  '<form class="navbar-form navbar-left">', //2
                    '<input type="text" placeholder="Search" class="form-control col-lg-8">',
                  '</form>',

                  '<ul class="nav navbar-nav navbar-right">', //3
                    '<li class="dropdown">',
                        '<a data-toggle="dropdown" class="dropdown-toggle" href="#"><i class="fa fa-download"></i> Download <b class="caret"></b></a>',
                        '<ul class="dropdown-menu">',
                            '<li class="dropdown-header" >Client</li>',
                            '<li><a href="#" action="download" target="projs.1.0.0-rc2.starter-kit.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> pm.js (starter-kit)</a></li>',
                            '<li><a href="#" action="download" target="projs.1.0.0-rc2.framework-only.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> pm.js (js only)</a></li>',
                            '<li class="divider"></li>',
                            '<li class="dropdown-header">Server</li>',
                            '<li><a href="#" action="download" target="ajax-box.0.10.1.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> ajax-box</a></li>',
                        '</ul>',
                    '</li>',
                    '<li><a href="https://github.com/bluekvirus/Client_"><i class="fa fa-github-alt"></i></a></li>',
                  '</ul>',

                '</div>',//<!-- /.nav-collapse -->
            '</div>'
        ]
    });


})();