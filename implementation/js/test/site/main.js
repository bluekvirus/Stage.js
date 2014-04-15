;Application.setup({

    //You can override other production config vars if wanted.
    //fullScreen: true,
    template: '<div region="banner" view="Banner"></div><div region="center"></div><div region="footer" view="Footer"></div>',
    contextRegion: 'center',
    defaultContext: 'Document'

}).run();


;(function(){

    //Shared - Regionals
    Application.area('Banner', {
        // effect: {
        //     name: 'fade',
        //     duration: 500
        // },
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
                  '<a href="#navigate/Home" class="navbar-brand">Stage.js</a>',//2
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
                    // '<li class="dropdown">',
                    //     '<a data-toggle="dropdown" class="dropdown-toggle" href="#"><i class="fa fa-download"></i> Download <b class="caret"></b></a>',
                    //     '<ul class="dropdown-menu">',
                    //         '<li class="dropdown-header" >Client</li>',
                    //         '<li><a href="#" action="download" target="stagejs.1.0.0-rc2.starter-kit.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> stage.js (starter-kit)</a></li>',
                    //         '<li><a href="#" action="download" target="stagejs.1.0.0-rc2.framework-only.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> stage.js (js only)</a></li>',
                    //         '<li class="divider"></li>',
                    //         '<li class="dropdown-header">Server</li>',
                    //         '<li><a href="#" action="download" target="ajax-box.0.10.1.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> ajax-box</a></li>',
                    //     '</ul>',
                    // '</li>',
                    '<li><a href="https://github.com/bluekvirus/Client_"><i class="fa fa-github-alt"></i></a></li>',
                  '</ul>',

                '</div>',//<!-- /.nav-collapse -->
            '</div>'
        ]
    });


})();