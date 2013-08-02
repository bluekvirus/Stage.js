/**
 * This is the standard datagrid widget based on backgrid, which was in turn progressively built on a table tag.
 *
 * <table>
 * 	<thead>
 * 		<tr><th></th>...</tr>
 * 	</thead>
 * 	<tbody>
 * 		<tr><td></td>...</tr>
 * 	</tbody>
 * </table>
 *
 * We override the basic classes backgrid has defined, so that additional functionality can be prepared and added.
 *
 * Note that this change will affect the way data modules define their datagrid wrapper views, but shouldn't affect the grid editor. see - custom_grid.js
 * Given that the grid editor is built on the datagrid wrapper views.
 *
 * Since we separated out the datagrid to be a stand-alone widget, it should be available to the whole application at any time, this means that it can be 
 * initialized and shown anywhere by any module. A generalization on the options argument is thus required (We will add in our own in addition to those accepted by 
 * backgrid).
 *
 * *****
 * Note
 * *****
 * We will also use client side filtering mechs other than the one provided by backgrid, since if the data (collection) is not changed there is no need to 
 * change the client side collection's content within a filtering operation.
 *
 * The client side sorting mech can be done (unchanged) by the underlying collection (backbone.pageable-collection), triggers a re-render event on the <tbody>
 * if necessary if not fired by the sorting operation. e.g under 'server mode' but we want to sort on the client side:
 *
 * 	collection.setSorting('title',-1,{side:'client', full:false});
 * 	collection.sort();
 *
 * Note that there isn't multi-column sort yet in backbone.pageable-collection, considering tableSorter (http://mottie.github.io/tablesorter/docs/index.html)
 *
 * *******
 * Options in columns:
 * *******
 * + filterable - all, for making the column appear in the global filter.
 * + sortDisabled - all, replacing the sortable option to control client side sorting.
 * + actions [cell: 'action'] only. [{name: ..., title: ...}].
 *
 * *******
 * Customized
 * *******
 * CustomRow - from Row
 * ActionCell - plain Backbone.Marionette.ItemView
 *
 * @author Tim.Liu
 * @created 2013.07.27
 */

Application.Widget.register('DataGrid', function(){

	var DataGrid = Backbone.Marionette.ItemView.extend({
        template: '#widget-datagrid-view-wrap-tpl',
        className: 'basic-datagrid-view-wrap',

        ui: {
            header: '.datagrid-header-container',
            body: '.datagrid-body-container',
            footer: '.datagrid-footer-container'
        },

        //remember the parent layout. So later on a 'new' or 'modify'
        //event will have a container region to render the form.
        cells: {},
        //[key:cell type] map to be overriden in _extension.js
        initialize: function(options) {

            //a. columns, mode, parent container $el:
            this.columns = options.columns || this.columns;
            this.mode = options.mode; //subDoc or refDoc
            this.parentCt = options.parentCt; //for event relay and collaboration with sibling wigets.
            this.formWidget = options.formWidget;// needed for editing/create records.

            var that = this;
            //b. cells
            _.each(this.columns, function(col) {
            	//turn off editor/sort by default
                col.editable = col.editable || false;
                col.sortable = false;
                //allow cell definition overriden in _extension.js
                col.cell = that.cells[col.name] || col.cell; //necessary ??? TBI
            });

            //c. the grid instance 'mod_backgrid'******************************************
            this.grid = new Backgrid.Grid({
                columns: this.columns,
                collection: this.collection, //automatically assigned by Marionette.ItemView.
                //customized header TBI (local sorting, before/after filtering op)
                //customized body.row (row data-attribute by record, cell class per column)
                row: Backgrid.Extension.CustomRow,
                //customized footer (pagination, statistics, date/versions)
            });
            //******************************************************************************

            //d. listen to the 'mod_backgrid''s render event for once and plugin our sorter & filters.
            this.grid.once('backgrid:rendered', _.bind(function(){
            	//the grid's global filter (top-right)
            	this._hookupGlobalFilter();
            	this._hookupColumnSorter();
            	this.afterRender();
            }, this));
            
            //e. hook up with 'backgrid:refresh' see this._hookupColumnSorter()
            /*WARNING:: a fetch() will screw up the UI tableSorter, need to fire update/updateAll event*/
        },

        /*======Private Helper Functions======*/
        _isRefMode: function(){
        	return this.mode !== 'subDoc';
        },

        _hookupGlobalFilter: function(){
			this.grid.$el.sieve({
				itemSelector: '.data-row',
				textSelector: '.filterable',
				searchInput: this.ui.header.find('.local-filter-box input')
			});
        },

        _hookupColumnSorter: function(){
        	//Not that we don't use the default sorting op provided by backgrid throught backbone.pageable
        	var headers = _.reduce(this.columns, function(memo, column, index){
        		if(column.sortDisabled === true)
        			memo[index] = { sorter: false };
        		return memo;
        	}, {});
        	this.grid.$el.tablesorter({
        		headers: headers,
        		theme: '_default',
        		sortReset: 'true'
        	});
        	//update the sorter if the data in the table are changed
            this.listenTo(this.grid.collection, 'backgrid:refresh', _.bind(function(){
            	this._applyToNewSortData();
            }, this));        	
        },

        _registerFooter: function(){
            this.listenTo(this.collection, 'all', _.bind(function(){
                console.log(arguments);
                // this.ui.footer.show(new Backgrid.Extension.CustomFooter({
                //     model: new Backbone.Model({
                //         lastSynced: new Date().toString(),
                //         recordCount: 
                //     })
                // }));
            }, this));
        },

        _applyToNewSortData: function(){
        	this.grid.$el.trigger('updateAll', [true]);
        },

        _refreshRecords: function(e) {
            if(e) e.stopPropagation();
            if (this._isRefMode()) {
                this.collection.fetch();
            }
        },

        _actionCalled: function(e){
        	e.stopPropagation();
        	var $el = $(e.currentTarget);
        	//dispatch
        	var action = $el.attr('action');
        	if(this.actions[action]){
        		if(_.isFunction(this.actions[action]))
        			this.actions[action]($el);
        		else {
                    try {
                        this[this.actions[action]]($el);
                    }catch(e){
                        Application.error('DataGrid Action Error', 'Action Listener [', this.actions[action], '] is registered but not implemented yet!');
                    }
                }
        			
        	}else {
        		Application.error('DataGrid Action Error', 'Action [', action, '] is not implemented yet!');
        	}
        },
        //====================================

        /*======Renderring Related Hooks======*/
        //Add a backgrid.js grid into the body 
        onRender: function() {

            //if it is not in subDoc mode, we let the collection to fetch data itself.
            //this will trigger the 'reset' event which in turn will trigger 'backgrid:rendered' on backgrid
            if (this._isRefMode()) this.collection.fetch({
            	success: _.bind(function(){
            		//delayed here so we can trigger a 'reset' which in turn triggers a 'backgrid:rendered' event.
            		this.ui.body.html(this.grid.render().el);
            	}, this)
            });
            else
            	this.ui.body.html(this.grid.render().el);

            //Do **NOT** register any event listeners here.
            //It might get registered again and again. 
        },
        //Empty Stub. override in extension
        afterRender: function() {},
        //Clean up zombie views.
        onBeforeClose: function() {
            this.grid.remove();
        },
        //====================================
        
        //*============Events & Actions===============*/
        events: {
            // 'click .btn[action=new]': 'showForm',
            // 'click .action-cell span[action=edit]': 'showForm',
            // 'click .action-cell span[action=delete]': 'deleteRecord',
            'click [action]': '_actionCalled',
            'dblclick .data-row': 'editRecord',
            'event_SaveRecord': 'saveRecord',
            'event_RefreshRecords': '_refreshRecords',
        },
        //General DOM event listener/ action listener:

        actions: {
        	new: 'showForm',
        	edit: 'showForm',
        	delete: 'deleteRecord'
        },

        //-------------Action Workers-----------------
        showForm: function($actionBtn) {
        	var recordId = $actionBtn.attr('target');

            if (recordId) { //edit mode.
                var m = this.collection.get(recordId);
            } else //create mode.
            var m = new this.collection.model({}, {
                url: this.collection.url
            });

            if(this.formWidget){
            	//create and show it
	            var formView = new this.formWidget({
	                model: m,
	                recordManager: this
	            });
	            this.parentCt.detail.show(formView);
	            formView.onRenderPlus(formView, this);
                return formView;
            }else {
            	//trigger an event so the parentCt can act accordingly
            	this.parentCt.$el.trigger('showForm', {
            		model: m,
            		grid: this
            	});
            }

        },
        //--------------------------------------------
        deleteRecord: function($actionBtn) {
        	var recordId = $actionBtn.attr('target');
            //find target
            var m = this.collection.get(recordId);
            if(!m) {
            	Application.error('Collection Error', 'can NOT find target id');
                return;
            }
            //promp user
            var that = this;
            Application.prompt('Are you sure?', 'error', function() {
                if (that._isRefMode()) m.destroy({
                    success: function(model, resp) {
                        //that._refreshRecords();
                    }
                });
                else that.collection.remove(m);
            })
        },

        //-----------Event Listeners-------------------
        editRecord: function(e){
            var $el = $(e.currentTarget);
            var formView = this.showForm($el.find('[action="edit"]'));
            var preRecords = $el.prevAll('.data-row').hide();
            var followingRecords = $el.nextAll('.data-row').hide();
            formView.$el.position({
                my: 'center top',
                at: 'center bottom',
                of: $el,
                collision: 'none none'
            });
            formView.once('close', _.bind(function(){
                preRecords.show();
                followingRecords.show();
            }, this));
            //console.log($el.nextAll().length);
        },

        saveRecord: function(e, sheet) {
            e.stopPropagation();
            //1.if this grid is used as top-level record holder:
            var that = this;
            if (this._isRefMode()) {
                sheet.model.save({}, {
                    notify: true,
                    success: function(model, res) {
                        if (res.payload) {
                            //that._refreshRecords();
                            
                            var locator= {};//locate the model in collection , if not add it manually.
                            locator[model.idAttribute] = model.id;
                            if(that.grid.collection.where(locator).length === 0){
                            	that.grid.collection.add(model, {silent:true});
                            	that.grid.insertRow(model, that.grid.collection);
                            }
                            that._applyToNewSortData();

                            sheet.close();
                        }
                    }
                }); //save the model to server
            } else { //2.else if this grid is used in subDoc mode for sub-field:
                //add or update the model into the referenced collection:
                this.collection.add(sheet.model, {
                    merge: true
                });
                sheet.close();
            }
        }
        //--------------------------------------------

    });

	return DataGrid;

});


Template.extend(
	'widget-datagrid-view-wrap-tpl',
	[
		'<div class="datagrid-header-container">',
			'<a class="btn btn-success btn-action-new" action="new">Create</a>',
			//'<a class="btn btn-danger pull-right" action="delete"><i class="icon-trash"></i></a>',
			'<div class="pull-right input-prepend local-filter-box">',
				'<span class="add-on"><i class="icon-filter"></i></span>',
				'<input type="text" class="input input-medium" name="filter" placeholder="Filter...">',
			'</div>',
		'</div>',
		'<div class="datagrid-body-container"></div>',
		'<div class="datagrid-footer-container"></div>'
	]
);

/*===================Footer=====================*/
Backgrid.Extension.CustomFooter = Backbone.Marionette.ItemView.extend({
    //show some info and prepare a space for paginator
    className: 'datagrid-footer clearfix',
    template: '#widget-tpl-grid-info-footer',
    initialize: function(options){

    },

});

Template.extend(
    'widget-tpl-grid-info-footer',
    [
        '<div class="footer-left pull-left">',
            '<span class="sync-time-indicator">{{lastSynced}}</span>',
        '</div>',
        '<div class="footer-right pull-right">',
            '<span class="total-visible-record">{{recordCount}}</span>',
        '</div>'
    ]
);

/*===================Overriden Classes==============*/
Backgrid.Extension.CustomRow = Backgrid.Row.extend({
	className: 'data-row',

	//overriden makeCell to give cells awareness of its column and filters.
	makeCell: function (column) {
		var options  = {
		  column: column,
		  model: this.model
		};
		if(column.get('filterable') !== false) options['className'] = 'column-' + column.get('name') + ' filterable';
		return new (column.get("cell"))(options);
	},	
});

/*===================New Cells==================*/

//1. Action cell-----------------------------------
Backgrid.Extension.ActionCell = Backbone.Marionette.ItemView.extend({
    tagName: 'td',
    className: 'action-cell',
    template: '#widget-tpl-grid-actioncell',
    initialize: function(options) {
        this.column = options.column; //options.column and options.model are both Backbone.Model instances.
        this.data = options.model; //we use part of  options.column as the model to render the action cell with action tags, and save the options.model in .data
        this.model = new Backbone.Model({
        	actions: this.column.get('actions'),
        	target: this.data.id || this.data.cid
        });
    }
});
Template.extend(
	'widget-tpl-grid-actioncell',
	[
		//'<div>',
		'{{#each actions}}',
        	'<span class="label" action="{{name}}" target="{{../target}}">{{title}}</span> ',
        '{{/each}}',
        //'</div>'
	]
);
//-------------------------------------------------

