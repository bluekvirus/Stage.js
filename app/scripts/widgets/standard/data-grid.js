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
 * The client side sorting mech can be done (unchanged) by the underlying collection (backgone.pageable-collection), triggers a re-render event on the <tbody>
 * if necessary if not fired by the sorting operation. e.g under 'server mode' but we want to sort on the client side:
 *
 * 	collection.setSorting('title',-1,{side:'client', full:false});
 * 	collection.sort();
 *
 * @author Tim.Liu
 * @created 2013.07.27
 */

