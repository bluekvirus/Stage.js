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
    contextRegion: 'center'

}).run();


;(function(){

    Application.create('Context', {
        //don't name it, thus defining the Default context.
        className: 'container',
        template: [
            '<div class="row">',
                '<div region="toc" class="col-sm-3"></div>',
                '<div region="doc" class="col-sm-9" md="static/resource/default/md/how-to-use.md"></div>',
            '</div>',
        ],
        onShow: function(){
            this.doc.$el.md();
        }
    });

    Application.create('Context', {
        name: 'Login',
        template: [
            '<div region="2" view="FormTest"></div>',
            '<div region="3"></div>'
        ],
        onNavigateTo: function(subPath){
            //console.log(subPath);
        }

    });

    Application.create('Regional', {
        name: 'FormTest',
        className: 'well',
        template: [
            '<div editors="*" class="row"></div>',
            '<div class="row">',
                '<div class="col-sm-10 col-sm-offset-2">',
                    '<span class="btn btn-primary" action="test">Submit</span> <span class="btn btn-warning">Validate</span>',
                '</div>',
            '</div>'
        ],
        initialize: function(){
            this.enableActionTags();
        },
        actions: {
            test: function($btn){
                this.validate(true);
            }
        },
        onShow: function(){
            this.activateEditors({
                appendTo: 'div[editors]',
                global: {
                    layout: {
                        label: 'col-sm-2',
                        field: 'col-sm-10'
                    }
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
                        html: '<p class="text-success">Nothing...RO</p>'
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
                        //value: 'enabled',
                        //unchecked: 'disabled',
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

    //Regionals
    Application.create('Regional', {
        name: 'Banner',
        effect: {
            name: 'fade',
            duration: 500
        },
        template: [
            '<div class="navbar navbar-default">',

                '<div class="navbar-header">',//A
                  '<button data-target=".navbar-responsive-collapse" data-toggle="collapse" class="navbar-toggle" type="button">',//1
                    '<span class="icon-bar"></span>',
                    '<span class="icon-bar"></span>',
                    '<span class="icon-bar"></span>',
                  '</button>',
                  '<a href="#" class="navbar-brand">Brand</a>',//2
                '</div>',

                '<div class="navbar-collapse collapse navbar-responsive-collapse">',//B
                  '<ul class="nav navbar-nav">',//1
                    '<li class="active"><a href="#navigate/Default">Active</a></li>',
                    '<li><a href="#">Link</a></li>',
                    '<li class="dropdown">',
                      '<a data-toggle="dropdown" class="dropdown-toggle" href="#">Dropdown <b class="caret"></b></a>',
                      '<ul class="dropdown-menu">',
                        '<li><a href="#">Action</a></li>',
                        '<li><a href="#">Another action</a></li>',
                        '<li><a href="#">Something else here</a></li>',
                        '<li class="divider"></li>',
                        '<li class="dropdown-header">Dropdown header</li>',
                        '<li><a href="#">Separated link</a></li>',
                        '<li><a href="#">One more separated link</a></li>',
                      '</ul>',
                    '</li>',
                  '</ul>',
                  '<form class="navbar-form navbar-left">', //2
                    '<input type="text" placeholder="Search" class="form-control col-lg-8">',
                  '</form>',
                  '<ul class="nav navbar-nav navbar-right">', //3
                    '<li><a href="#navigate/Login">Login</a></li>',
                    '<li class="dropdown">',
                      '<a data-toggle="dropdown" class="dropdown-toggle" href="#">Dropdown <b class="caret"></b></a>',
                      '<ul class="dropdown-menu">',
                        '<li><a href="#">Action</a></li>',
                        '<li><a href="#">Another action</a></li>',
                        '<li><a href="#">Something else here</a></li>',
                        '<li class="divider"></li>',
                        '<li><a href="#">Separated link</a></li>',
                      '</ul>',
                    '</li>',
                  '</ul>',
                '</div>',<!-- /.nav-collapse -->
            '</div>'
        ]
    });


})();