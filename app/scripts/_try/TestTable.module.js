/**
 * Testing only, data object Comment, Blog
 */

;(function(app){

	app.Factory.AdminModule.create({
		name: 'Comment',
		menuPath: 'Test -> Comments',
		fields: {
            title: {
                type: "Text",
                column: true,
            },
            body: {
                type: "TextArea",
                title: "Content",
                column: {
                	label: "Content Body",
                }
            },
		}
	});

})(Application);