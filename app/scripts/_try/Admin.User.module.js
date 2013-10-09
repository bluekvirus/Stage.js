/**
 * This is the User UI module under context 'Admin'
 *
 * @author Tim.Liu
 * @created 2013.10.09
 */

;(function(app){

	app.Context.get('Admin').factory.create({

		name: 'User',
		menuPath: 'System->User Management->User',
		actions: ['edit', 'delete', 'duplicate'],
		fields: {
            username: {
                editor: "Text",
                editorOpt: {
                    itemType: "email"
                },
                column: true
            },
            password: {
                editor: "Password"
            },
            password_check: {
                editor: "Password",
                title: "Comfirm Password"
            },
            name: {
                editor: "Text",
                title: "Real Name"
            },
            birthday: {
                editor: "Date"
            },
            roles: {
                editor: "CUSTOM_PICKER",
                editorOpt: {
                    dataSrc: "Admin.Role",
                    dndNS: "user-roles",
                    valueField: "name"
                },
                column: true
            }
		}

	});

})(Application)