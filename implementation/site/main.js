NProgress.configure({showSpinner: false});

;(function(app){

    app.setup({

        //You can override other production config vars if wanted.
        //fullScreen: true,
        template: '<div region="banner" view="Banner"></div><div region="center"></div><div region="footer" view="Footer"></div>',
        contextRegion: 'center',
        defaultContext: 'Home'

    }).run();

    //Shared - Regionals
    app.area('Banner', {
        // effect: {
        //     name: 'fade',
        //     duration: 500
        // },
        initialize: function(){
            this.listenTo(app, 'app:context-switched', function(name){
                this.$el.find('[context]').each(function(index, el){
                    var $this = $(this);
                    if($this.attr('context') === name)
                        $this.addClass('active');
                    else
                        $this.removeClass('active');
                });
                if(name !== 'Home') this.$el.removeClass('hidden');
                else this.$el.addClass('hidden');
            });
        },
        actions: {
            // download: function($btn, e){
            //     e.preventDefault();
            //     var base = 'static/resource/default/download/';
            //     app.Util.download(base + $btn.attr('target'));  
            // },
            themePreview: function($btn, e){
                e.preventDefault();
                location.href = ['themes', app.currentTheme, 'index.html'].join('/') ;
            }
        },
        className: 'navbar navbar-default hidden',
        template: [
            '<div class="navbar-header">',//A
              '<button data-target=".navbar-responsive-collapse" data-toggle="collapse" class="navbar-toggle" type="button">',//1
                '<span class="icon-bar"></span>',
                '<span class="icon-bar"></span>',
                '<span class="icon-bar"></span>',
              '</button>',
              // '<a href="#navigate/Home" class="navbar-brand">Stage.js</a>',//2
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
                    '<li><a href="#navigate/Demo/Datatable">Data Table</a></li>',
                    '<li><a href="#navigate/Demo/Trees"">Tree</a></li>',
                    '<li class="divider"></li>',
                    '<li class="dropdown-header">Accessories</li>',
                    '<li><a href="#">Notifications</a></li>',
                    // '<li><a href="#">Terminal</a></li>',
                  '</ul>',
                '</li>',
              '</ul>',

              // '<form class="navbar-form navbar-left">', //2
              //   '<input type="text" placeholder="Search" class="form-control col-lg-8">',
              // '</form>',

              '<ul class="nav navbar-nav navbar-right">', //3
                '<li class="dropdown">',
                    '<a data-toggle="dropdown" class="dropdown-toggle" href="#"><i class="fa fa-download"></i> Download <b class="caret"></b></a>',
                    '<ul class="dropdown-menu">',

                        '<li><a href="static/resource/default/download/stagejs-starter-kit.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> Start New (project-kit)</a></li>',
                        '<li><a href="static/resource/default/download/stagejs-edge.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> Update (edge build)</a></li>',

                    '</ul>',
                '</li>',
                '<li><a href="https://github.com/bluekvirus/Client_"><i class="fa fa-github-alt"></i></a></li>',
              '</ul>',

            '</div>',//<!-- /.nav-collapse -->
        ]
    });


})(Application);