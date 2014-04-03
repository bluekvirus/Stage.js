;Application.setup({

    /**
     * ================
     * Development ONLY
     * ================
     */
    
    //CROSSDOMAIN [Warning: Crossdomain Authentication]
    //If you ever need crossdomain development, we recommend that you TURN OFF local server's auth layer/middleware. 
    crossdomain: {
        //enabled: true,
        protocol: '', //https or not? default: '' -> http
        host: '127.0.0.1', 
        port: '5000',
        username: 'admin',
        password: '123'
        /*----------------*/
    },

    //You can override other production config vars if wanted.
    //fullScreen: true,
    theme: '_dev',
    template: '<div region="banner" view="Banner"></div><div region="center"></div><div region="footer" view="Footer"></div>',
    contextRegion: 'center',
    defaultContext: 'Document'

}).run();


;(function(){

    Application.create('Context', {
        //don't name it, if want to define Default context.
        name: 'Document',
        className: 'container',
        template: [
            '<div class="row">',
                '<div class="col-sm-3">',
                    '<div region="toc" ></div>',
                    '<hr/>',
                    '<div region="libinfo"></div>',
                '</div>',
                '<div class="col-sm-9" style="border-left:1px solid">',
                    '<div region="breadcrumbs" view="Doc.Breadcrumbs" style="position: fixed; top: 0; right: 0"></div>',
                    '<div region="doc" md="HOWTO.md" action="refresh"></div>',
                '</div>',
            '</div>',
        ],
        initialize: function(){
            this.enableActionTags();
            this.listenTo(Application, 'app:scroll', function(offset, viewportH){
                if(!this.headerOffsets || offset < 150) {
                    this.breadcrumbs.$el.hide();
                    return;
                }
                var stop = false, result = '';
                _.each(this.headerOffsets, function(ho, index){
                    if(stop) return;
                    if(ho.offset > offset + viewportH * 0.35) {
                        result = this.headerOffsets[index-1];
                        stop = true;
                    }
                }, this);

                //hilight this header and its parents in breadcrumbs
                var path = [result.title];
                $parent = $('#' + $('#' + result.id).data('parent').id);
                while($parent.length){
                    var info = $parent.data();
                    path.unshift(info.title);
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
                        ignoreRoot: true
                    });
                    that.toc.show(Application.create('Regional', {
                        //no name means to use it anonymously, which in turn creates it right away. 
                        template: $el.data('toc').html,
                        initialize: function(){
                            this.enableActionTags();
                        },
                        actions: {
                            goto: function($btn, e){
                                e.preventDefault();
                                var $section = that.doc.$el.find('#' + $btn.data('id'));
                                $window.scrollTop($section.offset().top);
                                //Todo: highlight section
                            }
                        }
                    }));
                    that.headerOffsets = that.doc.$el.data('toc').offsets;
                }
            });
        },
        onShow: function(){

            this.trigger('view:reload-doc');
            this.libinfo.show(Application.create('Regional', {
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
                    Application.remote('js/libs/tracked/dist/selected.json').done(function(data){
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
    Application.create('Regional', {
        name: 'Doc.Breadcrumbs',
        tagName: 'ol',
        className: 'breadcrumb',
        template: [
            '{{#each path}}',
                '<li><a href="#">{{ this }}</a></li>',
            '{{/each}}',
            '<li><i class="fa fa-arrow-up"></i></li>',
        ],
        initialize: function(){
            //TBI - scrollTo (top or parent topic)
        }

    });

    Application.create('Context', {
        name: 'Demo',
        template: [
            '<div region="center"></div>',
        ],
        onNavigateTo: function(subPath){
            this.layout.center.trigger('region:load-view', subPath);
        }

    });

    //Demo - Regionals
    Application.create('Regional', {
        name: 'Editors',
        className: 'well container',
        template: [
            '<div editors="*" class="form form-horizontal"></div>', //the class form form-horizontal is required for the editor layout class config to work in bootstrap 3
            '<div class="row">',
                '<div class="col-sm-10 col-sm-offset-2">',
                    '<span class="btn btn-primary" action="submit">Submit</span> ',
                    '<span class="btn btn-warning" action="validate">Validate</span> ',
                    '<span class="btn btn-default" action="test">Test</span> ',
                    '<span class="btn btn-info" action="info">Inform</span> ',
                    '<span class="btn btn-info" action="clearinfo">Clear Info</span> ',
                '</div>',
            '</div>'
        ],
        initialize: function(){
            this.enableActionTags();
        },
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
        onShow: function(){
            this.activateEditors({
                
                global: {
                    layout: {
                        label: 'col-sm-2',
                        field: 'col-sm-10'
                    },
                    appendTo: 'div[editors]',
                },
                editors: {
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
                        type: 'radio',
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
                        type: 'checkbox',
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
            this.enableActionTags();
            this.listenTo(Application, 'app:context-switched', function(name){
                this.$el.find('[context]').removeClass('active');
                this.$el.find('[context="' + name + '"]').addClass('active');
            });
        },
        actions: {
            download: function($btn, e){
                e.preventDefault();
                var base = '/static/resource/default/download/';
                Application.Util.download(base + $btn.attr('target'));  
            },
            themePreview: function($btn, e){
                e.preventDefault();
                location.href = '/themes/' + Application.currentTheme;
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
                  '<a href="#navigate/Home" class="navbar-brand">Pro.js</a>',//2
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
                            '<li><a href="#" action="download" target="projs.1.0.0-rc2.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> pro.js</a></li>',
                            '<li class="divider"></li>',
                            '<li class="dropdown-header">Server</li>',
                            '<li><a href="#" action="download" target="ajax-box.0.10.1.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> ajax-box</a></li>',
                        '</ul>',
                    '</li>',
                    '<li><a href="#"><i class="fa fa-github-alt"></i></a></li>',
                  '</ul>',

                '</div>',//<!-- /.nav-collapse -->
            '</div>'
        ]
    });


})();