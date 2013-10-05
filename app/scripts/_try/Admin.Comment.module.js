/**
 * Testing only, data object Comment, Blog
 */

;(function(app){

	app.Factory.AdminModule.create({
		name: 'Comment',
        //type: 'complex',
		menuPath: 'Test -> Comments',
		fields: {
            title: {
                editor: "Text",
                column: true,
            },
            body: {
                editor: "TextArea",
                title: "Content",
                column: {
                	label: "Content Body",
                }
            },
		},

        // dataUnitOpt: {
        //     backboneOpts: {
        //         collection: {
        //             pagination: {
        //                 mode: 'server'
        //             }
        //         }
        //     }
        // }
	});

})(Application);