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
 * ************
 * Init Options
 * ************
 * collection
 * columns
 * mode
 * parentCt
 * formWidget (TBI: optional, inferred from model's name or schema in Admin meta module)
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
 * Extension (high-lighted ones)
 * *******
 * actionColumnTagOverride
 * actionColumnTags
 * afterRender()
 * 
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

	var DataGrid = Backbone.Marionette.Layout.extend({
        template: '#widget-datagrid-view-wrap-tpl',
        className: 'basic-datagrid-view-wrap',

        regions: {
            header: '.datagrid-header-container',
            body: '.datagrid-body-container',
            footer: '.datagrid-footer-container'
        },

        cells: {},//extend cells in .extension.js (Do NOT DELETE this empty block here!!)
        initialize: function(options) {

            //a. columns, mode, parent container $el:
            this.columns = options.columns || this.columns;
            this.mode = options.mode; //subDoc or refDoc
            this.parentCt = options.parentCt; //for event relay and collaboration with sibling wigets.
            this.formWidget = options.formWidget || this.formWidget;// needed for editing/create records.

            var that = this;
            //b. cells
            _.each(this.columns, function(col) {
            	//turn off editor/sort by default
                col.editable = col.editable || false;
                col.sortable = false;
                //allow cell definition overriden in _extension.js
                col.cell = (that.cells && that.cells[col.name]) || col.cell;
                if(col.cell === 'action' && that.actionColumnTags && that.actionColumnTags.length > 0){
                    if(that.actionColumnTagOverride)
                        col.actions = that.actionColumnTags || [];
                    else {//extend on default
                        col.actions = col.actions.concat(that.actionColumnTags.splice(0, that.actionColumnTags.length) || []);
                        
                    }
                }
            });

            //c. the grid instance 'mod_backgrid'******************************************
            this.grid = new Backgrid.Grid({
                columns: this.columns,
                collection: this.collection, //automatically assigned by Marionette.ItemView.
                //customized header TBI (local sorting, before/after filtering op)
                //customized body.row (row data-attribute by record, cell class per column)
                row: Backgrid.Extension.CustomRow,
                //body: Backgrid.Extension.CustomBody,
                //customized footer (pagination, statistics, date/versions)
            });
            //******************************************************************************

            //d. listen to the 'mod_backgrid''s render event for once and plugin our sorter & filters.
            this.grid.listenTo(this.grid,'backgrid:rendered', _.bind(function(){
            	//the grid's global filter (top-right)
            	this._hookupGlobalFilter();
            	this._hookupColumnSorter();
                this._registerFooter();
            }, this));

            this.listenTo(this.grid, 'show', this.afterRender);
            
            //e. hook up with 'backgrid:refresh' see this._hookupColumnSorter()
            this.grid.listenTo(this.grid.collection,'backgrid:refresh', this.afterRefresh/*triggered by sort, reset event (see Backgrid.Body)*/);
            /*WARNING:: a fetch() will screw up the UI tableSorter, need to fire update/updateAll event*/        
        },

        _lock: false, //the UI lock, if true, no interaction will be responsed.
        isRefMode: function(){
            return this.mode !== 'subDoc';
        },

        /*======Private Helper Functions======*/
        _hookupGlobalFilter: function(){
			this.grid.$el.sieve({
				itemSelector: '.data-row',
				textSelector: '.filterable',
				searchInput: this.header.getEl('.local-filter-box input')
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
            if(!this.isRefMode()) return;
            this.infoBar = new Backgrid.Extension.InfoBar({
                model: new Backbone.Model({
                    lastSynced: new Date().toString(),
                    recordCount: this.collection.length
                })
            });
            this.footer.show(this.infoBar);            
            this.listenTo(this.collection, 'add remove', _.bind(function(e){
                this.infoBar.model.set('recordCount', this.collection.length);
            }, this));
            this.listenTo(this.collection, 'sync destroy', _.bind(function(e){
                this.infoBar.model.set('lastSynced', new Date().toString());
            }, this));
        },
        //====================================

        /*======Renderring Related Hooks======*/
        //Add a backgrid.js grid into the body 
        onShow: function() {
            //if it is not in subDoc mode, we let the collection to fetch data itself.
            //this will trigger the 'reset' event which in turn will trigger 'backgrid:rendered' on backgrid
            this.body.show(this.grid);
            if (this.isRefMode()){ 
            	this.grid.$el.trigger('event_RefreshRecords');
            }

            //Do **NOT** register any event listeners here.
            //It might get registered again and again. 
        },
        //Empty Stub. override in extension
        afterRender: $.noop,
        afterRefresh: $.noop,
        //====================================
        
        //*============Events & Actions===============*/
        events: {
            'click [action]': '_actionCalled',
            'dblclick .data-row': 'editRecordDbClick',
            'event_SaveRecord': 'saveRecord',
            'event_RefreshRecords': 'refreshRecords',
            'event_FormClose': 'closeForm',
        },
        //Action listeners - through _actionCalled():

        actions: {
        	new: 'newRecord',
        	edit: 'editRecord',
        	delete: 'deleteRecord'
        },

        //------------------Workers-------------------
        _showForm: function(recordId) {
            if (recordId) { //edit mode.
                var m = this.collection.get(recordId);
            } else //create mode.
            var m = new this.collection.model();

            //TBI : need to change this so the datagrid won't know its parentCt's layout.
            if(this.formWidget){
            	//create and show it
	            var formView = new this.formWidget({
	                model: m,
	                recordManager: this
	            });
	            this.parentCt.detail.show(formView);
                return formView;
            }else {
            	//trigger an event so the parentCt can act accordingly
            	this.parentCt.$el.trigger('showForm', {
            		model: m,
            		grid: this
            	});
            }

        },

        _applyToNewSortData: function(){
            this.grid.$el.trigger('updateAll', [true]);
        },

        //---------------Action Workers---------------
        newRecord: function($actionBtn){
        	this._animateFormUp(this.grid.$el.find('thead'), this.grid.$el.find('tbody'));
        },
        editRecord: function($actionBtn){
        	this._animateFormUp($actionBtn.parentsUntil('tbody', 'tr.data-row'));
        },
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
            $actionBtn.parentsUntil('tbody', 'tr.data-row').addClass('data-row-focused');
            Application.prompt('Are you sure?', 'error', function() {
                if (that.isRefMode()) m.destroy();
                else that.collection.remove(m);
            }, $.noop, function(){
                $actionBtn.parentsUntil('tbody', 'tr.data-row').removeClass('data-row-focused');
            })
        },

        //-----------Event Listeners-------------------
        _actionCalled: function(e){
            e.stopPropagation();
            if(this._lock) return;

            var $el = $(e.currentTarget);
            //dispatch
            var action = $el.attr('action');
            if(this.actions[action]){
                if(_.isFunction(this.actions[action]))
                    this.actions[action]($el);
                else {
                    if(_.isFunction(this[this.actions[action]])){
                        this[this.actions[action]]($el);
                    }else {
                        Application.error('DataGrid Action Error', 'Action Listener [', this.actions[action], '] is registered but not implemented yet!');
                    }
                }
                    
            }else {
                Application.error('DataGrid Action Error', 'Action [', action, '] is not implemented yet!');
            }
        },
        editRecordDbClick: function(e){
            e.stopPropagation()
        	var $el = $(e.currentTarget);
            $el.find('[action=edit]').click();
        },

        saveRecord: function(e, sheet) {
            e.stopPropagation();
            //1.if this grid is used as top-level record holder:
            var that = this;
            if (this.isRefMode()) {
                var options = {
                    notify: true,
                    success: function(model, res) {
                        that._applyToNewSortData();
                        that.$el.trigger('event_FormClose', sheet);
                    }
                };
                if(!sheet.model.isNew()){//update
                    //save only the changed attr to server
                    var changed = sheet.model.changedAttributes();
                    if(!changed) {
                        this.$el.trigger('event_FormClose', sheet);
                        return;
                    }

                    var id = {};
                    id[sheet.model.idAttribute] = sheet.model.id;
                    sheet.model.attributes = changed;
                    sheet.model.set(id, {silent:true});
                    sheet.model.save({}, options); //save the model to server
                }
                else {
                    //create
                    this.collection.create(sheet.model.attributes, options);
                }
            } else { //2.else if this grid is used in subDoc mode for sub-field:
                //add or update the model into the referenced collection:
                this.collection.add(sheet.model, {
                    merge: true
                });
                this.$el.trigger('event_FormClose', sheet);
            }
        },
        refreshRecords: function(e) {
            if(e) e.stopPropagation();
            if (this.isRefMode()) {
                this.collection.fetch({reset: true});
            }
        },        
        closeForm: function(e, $form){
            $form.close();
        },        
        //--------------------------------------------
        
        //----------Animation Related----------
        _lockUI: function(){
            this._lock = true;
            this.grid.$el.addClass('form-overlay');
        },
        _unlockUI: function(){
            this._lock = false;
            this.grid.$el.removeClass('form-overlay');
        },
            //------: Form Slide-up-----------
        _animateFormUp: function($toRow, $hideFormParts){
            var formView = this._showForm($toRow.find('[action="edit"]').attr('target'));
            var followingRecords = $hideFormParts || $toRow.nextAll('tr.data-row');        	
            //scroll up the form
            formView.$el.position({
                my: 'center top',
                at: 'center bottom+2',
                of: $toRow,
                collision: 'none none',
                using: _.bind(function(prop, ref){
                    this._lockUI();
                    followingRecords.animate({opacity: 0.1});
                    formView.$el.animate(prop);
                }, this)
            });
            //recover
            formView.once('close', _.bind(function(){
                followingRecords.animate({
                    opacity: 1
                });
                this._unlockUI();
            }, this));
        }
        //--------------------------------------------

    });

	return DataGrid;

});


Template.extend(
	'widget-datagrid-view-wrap-tpl',
	[
		'<div class="datagrid-header-container">',
			'<a class="btn btn-success btn-action-new" action="new"><i class="icon-plus-sign icon-white"></i> New</a>',
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

/*===================Info Bar=====================*/
Backgrid.Extension.InfoBar = Backbone.Marionette.ItemView.extend({
    //show some info and prepare a space for paginator
    className: 'datagrid-infobar clearfix',
    template: '#widget-tpl-grid-info-bar',
    initialize: function(options){
        this.listenTo(this.model, 'change', _.bind(function(){
            this.render();
        }, this))
    },

});

Template.extend(
    'widget-tpl-grid-info-bar',
    [
        '<div class="info-bar-datetime pull-right">',
            '<small>Last Synchronized: <span class="sync-time-indicator">{{lastSynced}}</span></small>',
        '</div>',
        '<div class="info-bar-count pull-left">',
            '<small>Record Count: <span class="total-visible-record">{{recordCount}}</span></small>',
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

// Backgrid.Extension.CustomBody = Backgrid.Body.extend({
//   render: function () {
//     this.$el.empty();

//     var fragment = document.createDocumentFragment();
//     for (var i = 0; i < this.rows.length; i++) {
//       var row = this.rows[i];
//       fragment.appendChild(row.render().el);
//     }

//     this.el.appendChild(fragment);

//     this.delegateEvents();

//     this.trigger('backgrid:rowRendered', this);

//     return this;
//   },
// });

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

