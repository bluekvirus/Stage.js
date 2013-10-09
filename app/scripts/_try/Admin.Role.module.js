/**
 * This is the Role UI module under context 'Admin'
 *
 * @author Tim.Liu
 * @created 2013.10.09
 */

;(function(app){

	app.Context.get('Admin').factory.create({

		name: 'Role',
		menuPath: 'System->User Management->Role',
		actions: ['edit', 'delete', 'duplicate'],
		fields: {
            name: {
                editor: 'Text',
                column: true
            },
            description: {
                editor: 'TextArea',
                column: true
            },
            privileges: {
                editor: 'ResourceControl'
            }
		}

	});

})(Application)