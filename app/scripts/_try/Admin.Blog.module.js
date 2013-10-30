/**
 * Testing only, data object Comment, Blog
 */

;(function(app){

	app.Context.get('Admin').factory.create({
		name: 'Blog',
        //type: 'complex',
		menuPath: 'Test->Blog',
        actions: ['edit', 'delete'],
        alterTools: function(tools){
            tools.push({
                group: 'services',
                buttons: [
                    {
                        label: 'Sync',
                        icon: 'icon-circle-arrow-down',
                        action: 'fetchFromServices'
                    }
                ]
            });
        },
		fields: {
            title: {
                title: "Title",
                editor: "Text",
                editorOpt: {
                    editOnce: "true"
                },
                column: true
            },
            body: {
                editor: "TextArea",
                title: "Content"
            },
            comments: {
                editor: "CUSTOM_PICKER",
                title: "Comments",
                editorOpt: {
                    dataSrc: "Admin.Comment",
                    valueField: "title",
                    dndNS: "blog-comments"
                }
            },
            comments2: {
                editor: "Select",
                title: "Comments List",
                editorOpt: {
                    dataSrc: "Admin.Comment",
                    valueField: "title",
                    options: function(cb, editor) {
                        Application.DataCenter.resolve(editor.schema.dataSrc, editor.form, function(data) {
                            cb(data.map(function(d) {
                                return {
                                    val: d[editor.schema.valueField || 'name'],
                                    label: d[editor.schema.labelField || editor.schema.valueField || 'name']
                                };
                            }));
                        });
                    }
                }
            },
            comment3: {
                editor: "CUSTOM_GRID",
                title: "Comments Ref",
                editorOpt: {
                    moduleRef: "Admin.Comment",
                    mode: "refDoc",
                    template: "gridField"
                }
            },   
            comment4: {
                editor: "CUSTOM_GRID",
                title: "Comment Sub",
                editorOpt: {
                    moduleRef: "Admin.Comment",
                    mode: "subDoc",
                    template: "gridField"
                }
            },
            titleimage: {
                editor: "File",
                title: "Title Image",
                editorOpt: {
                    hostType: "table",
                    hostName: "Blog"
                }
            },
            // filelists: {
            //     editor: "File",
            //     title: "Content Images",
            //     editorOpt: {
            //         hostType: "table",
            //         hostName: "Blog"
            //     }
            // }
		}
	});

})(Application);