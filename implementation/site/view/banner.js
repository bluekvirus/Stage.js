;(function(app){

    //Shared - Regionals
    app.view('Banner', {
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
            showSubMenu: function($tag, e){
                //app.notify('Action Detected!', 'Banner menu item ' + $tag.find('> a').text() + ' is ' + e.type + '-ed');
                $tag.toggleClass('open', true);
            },
            closeSubMenu: function($tag, e){
                $tag.toggleClass('open', false);
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
                '<li context="Home"><a href="#navigate/Home">HOME</a></li>',
                '<li context="Document"><a href="#navigate/Document">DOCUMENT</a></li>',
                '<li context="Mockups"><a href="#navigate/Mockups">TEMPLATES</a></li>',
                '<li context="Demo" class="dropdown" action-mouseenter="showSubMenu" action-mouseleave="closeSubMenu">',
                  '<a data-toggle="dropdown" class="dropdown-toggle" href="#">DEMO <b class="caret"></b></a>',
                  '<ul class="dropdown-menu">',
                    '<li class="dropdown-header">Ready-made Widgets</li>',                    
                    '<li><a href="#navigate/Demo/Demo.Datatable">Datagrid</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Datatable">Paginator</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Trees"">Tree</a></li>',
                    '<li class="divider"></li>',
                    '<li class="dropdown-header">View Plus</li>',
                    '<li><a href="#navigate/Demo/Demo.Templating">Templating</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Layout">Layout</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Activation">Activations</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Tabs">Tabs</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Effect">In & Out Effects</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Action">Actions</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Lock">Lock</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Selectable">Selectables</a></li>',
                    '<li><a href="#navigate/Demo/Demo.DND">Drag & Drop</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Coop">Co-op</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Popover">Popover</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Notify">Notifications</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Overlay">Overlay</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Datahandling">Data Handling</a></li>',
                    '<li><a href="#navigate/Demo/Demo.MoreData">More Data</a></li>',
                    '<li><a href="#navigate/Demo/Demo.Editors">Editors/Form</a></li>',
                    // '<li><a href="#">Terminal</a></li>',
                  '</ul>',
                '</li>',
              '</ul>',

              // '<form class="navbar-form navbar-left">', //2
              //   '<input type="text" placeholder="Search" class="form-control col-lg-8">',
              // '</form>',

              '<ul class="nav navbar-nav navbar-right">', //3
                '<li class="dropdown" action-mouseenter="showSubMenu" action-mouseleave="closeSubMenu">',
                    '<a data-toggle="dropdown" class="dropdown-toggle" href="#">DOWNLOAD <b class="caret"></b></a>',
                    '<ul class="dropdown-menu">',

                        '<li><a href="static/resource/default/download/stagejs-starter-kit.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> Start New (project-kit)</a></li>',
                        '<li><a href="static/resource/default/download/stagejs-edge.tar.gz"><i class="fa fa-arrow-circle-o-down"></i> Update (edge build)</a></li>',

                    '</ul>',
                '</li>',
                '<li><a href="https://github.com/bluekvirus/Client_">VIEW ON GITHUB</a></li>',
              '</ul>',

            '</div>',//<!-- /.nav-collapse -->
        ]
    });

})(Application);