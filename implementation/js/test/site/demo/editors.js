//Demo - Regionals
Application.area('Editors', {
    className: 'container',
    template: [
        '<div class="row">',
            '<div class="form form-horizontal"></div>',
        '</div>', //the class form form-horizontal is required for the editor layout class config to work in bootstrap 3
        '<div class="row">',
            '<div class="col-sm-10 col-sm-offset-2">',
                '<span class="btn btn-primary" action="submit">Submit</span> ',
                '<span class="btn btn-warning" action="validate">Validate</span> ',
                '<span class="btn btn-default" action="test">Test</span> ',
                '<span class="btn btn-default" action="test2">Test(Disable/Enable)</span> ',
                '<span class="btn btn-info" action="info">Inform</span> ',
                '<span class="btn btn-info" action="clearinfo">Clear Info</span> ',
            '</div>',
        '</div>'
    ],
    onShow: function(){
        this.getEditor('ab').disable();
        this.getEditor('radios').disable();
    }
    ,
    actions: {
        validate: function($btn){
            this.validate(true);
        },
        submit: function(){
            console.log(this.getValues());
        },
        test: function(){
            this.setValues({
                checkboxes: [1231, 1233],
                readonly2: 'Hello!',
                singlecheckbox: 'enabled'
            });
        },
        test2: function(){
            var editor = this.getEditor('checkboxes');
            if(editor.isEnabled()) editor.disable(true);
            else {
                editor.disable(false);
                this.getEditor('ab').disable(false);
                this.getEditor('radios').disable(false);
            }
        },
        info: function(){
            this.status('success', {
                singlecheckbox: 'passed!',
                efg: {
                    status: 'error',
                    message: 'another server error!'
                }
            });
        },

        clearinfo: function(){
            this.status();
        }
    },
    editors: {

        _global: {
            layout: {
                label: 'col-sm-2',
                field: 'col-sm-10'
            },
            appendTo: 'div.form',
        },

        abc: {
            type: 'text',
            label: 'Abc',
            help: 'This is abc',
            tooltip: 'Hey Abc here!',
            fieldname: 'newfield',
            validate: {
                required: {
                    msg: 'Hey input something!'
                },
                fn: function(val, parentCt){
                    if(!_.string.startsWith(val, 'A')) return 'You must start with an A';
                }
            }

        },
        ab: {
            label: 'Ab',
            help: 'This is ab',
            tooltip: 'Hey Ab here!',
            placeholder: 'abc...',
            value: 'default',
            validate: function(val, parentCt){
                console.log(val);
                if(val !== '123') return 'You must enter 123';
            }
        },
        efg: {
            label: 'Ha Ha',
            type: 'password',
            validate: {
                checkitout: true
            }
        },
        area: {
            label: 'Codes',
            type: 'textarea',
            validate: {
                required: true
            }
        },
        readonly: {
            label: 'RO',
            html: '<p class="text-success">Nothing...but HTML</p>'
        },

        readonly2: {
            label: 'RO 2',
            type: 'ro',
            value: 'Unchange-able'
        },

        xyz: {
            label: 'File',
            type: 'file',
            help: 'Please choose your image to upload.',
            upload: {
                url: function(){ return '/file/Blog2/';}
            }
        },
        radios: {
            label: 'Radios',
            type: 'radios',
            help: 'choose the one you like',
            tooltip: {
                title: 'hahahaha'
            },
            options: {
                inline: true,
                //data: ['a', 'b', 'c', 'd']
                data: [
                    {label: 'Haha', value: 'a'},
                    {label: 'Hb', value: 'b'},
                    {label: 'Hc', value: 'c'},
                    {label: 'Hd', value: 'd'}
                ]
            }
        },
        checkboxes: {
            label: 'Checkboxes',
            type: 'checkboxes',
            help: 'choose more than you like',
            fieldname: 'haha',
            options: {
                //inline: true,
                //data: ['a', 'b', 'c', 'd']
                data: [
                    {key: 'abc1', val: '1231', other: 'bbb1'},
                    {key: 'abc2', val: '1232', other: 'bbb2'},
                    {key: 'abc3', val: '1233', other: 'bbb3'},
                    {key: 'abc4', val: '1234', other: 'bbb4'},
                    {key: 'abc5', val: '1235', other: 'bbb5'},
                ],
                labelField: 'other',
                valueField: 'val'
            }
        },
        singlecheckbox: {
            label: 'Check?',
            type: 'checkbox',
            boxLabel: 'Select this one if you are smart...:D',
            checked: 'enabled',
            unchecked: 'disabled',
        },

        select: {
            label: 'Select',
            type: 'select',
            help: 'choose 1 you like',
            multiple: true,
            options: {
                //data: ['a', 'b', 'c', 'd']
                data: [
                    {key: 'abc1', val: '1231', other: 'bbb1'},
                    {key: 'abc2', val: '1232', other: 'bbb2'},
                    {key: 'abc3', val: '1233', other: 'bbb3'},
                    {key: 'abc4', val: '1234', other: 'bbb4'},
                    {key: 'abc5', val: '1235', other: 'bbb5'},
                ],
                labelField: 'other',
                valueField: 'val'
            }
        },

        selectgroup: {
            label: 'Group',
            type: 'select',
            options: {
                data: {
                    group1: [{label: 'abc', value: '123'}, {label: '4555', value: '1111'}],
                    group2: [{label: 'abcx', value: '123x'}, {label: '4555x', value: '1111x'}],
                }
            }
        }  
    }
});  