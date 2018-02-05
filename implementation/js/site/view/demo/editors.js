//Demo - Regionals
;(function(app){

    app.view('FieldsetA', {
        editors: {
            _global: {
                layout: {
                    label: 'col-sm-2',
                    field: 'col-sm-10'
                }
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
                    app.debug(val);
                    if(val !== '123') return 'You must enter 123';
                }
            },
            efg: {
                label: 'Ha Ha',
                type: 'password',
                validate: {
                    checkitout: true
                }
            }
        }
    });

    app.view('FieldsetB', {
        className: 'well well-sm',
        template: '<div action="testb"></div>',
        actions: {
            testb: function(){
                app.debug('test action ct clicked...');
            },
            search: function(){
                var content = this.get('twoSidesButtons');
                app.notify('SEARCH', 'searched for ' + (content || 'nothing'), 'info');
            },
            danger: function(){
                app.notify('DANGER', 'NOooo...', 'error', {icon: 'fa fa-reddit-alien'});
            },
            upload: function(){
                app.notify('SUBMIT', 'Submitted to the server', 'ok', {icon: 'fa fa-fort-awesome'});
            },
        },
        editors: {
            _global: {
                appendTo: '[action="testb"]',
                layout: {
                    label: 'col-sm-2',
                    field: 'col-sm-10'
                }
            },
            area: {
                label: 'Text',
                type: 'textarea',
                validate: {
                    required: true
                }
            },
            search: {
                label: 'Search',
                type: 'search',
                event: 'search-triggered',
                callback: function(){
                    
                },
            },
            onSideButtons: {
                type: 'text',
                label: 'One Side Buttons',
                buttons: [
                    {type: 'primary', html: '<i class="fa fa-check"></i> SUBMIT', action: 'upload'},
                ],
            },
            twoSidesButtons: {
                type: 'text',
                label: 'Two Sides Buttons',
                buttons: {
                    prefix: [
                        {type: 'danger', html: '<i class="fa fa-exclamation-circle"></i>', action: 'danger'}
                    ],
                    postfix: [
                        {type: 'info', html: '<i class="fa fa-check"></i>', action: 'search'},
                    ],
                },
            },
            readonly: {
                label: 'RO',
                value: '<p class="text-success">Nothing...but HTML</p>'
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
                fieldname: 'files[]',
                upload: {
                    //standalone: true,
                    formData: function(){
                        //return [{name: 'a', value: 1}, {name: 'b', value: 2}];
                        return {a: 1, b: 2};
                    },
                    //formData: {a: 1, b: 2},
                    url: 'sample/file/',
                    callbacks: {
                        always: function(e, info){
                            app.debug(e, info);
                        }
                    }
                }
            },
            xyz2: {
                label: 'File2',
                type: 'file',
                help: 'Please choose your abc to upload.',
                //fieldname: 'files[]',
                multiple: true,
                upload: {
                    standalone: true,
                    formData: function(){
                        //return [{name: 'a', value: 1}, {name: 'b', value: 2}];
                        return {a: 1, b: 2};
                    },
                    //formData: {a: 1, b: 2},
                    url: 'sample/file/',
                    callbacks: {
                        always: function(e, info){
                            app.debug(e, info);
                        }
                    }
                }

            },
            radios: {
                label: 'Radios',
                type: 'radios',
                className: 'radio-success',
                help: 'choose the one you like',
                tooltip: {
                    title: 'hahahaha'
                },
                value: ['c'],
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
                className: 'checkbox-info',
                help: 'choose more than you like',
                fieldname: 'haha',
                value: ['1232', '1234'],
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
            range:{
                label: 'Range',
                type: 'range',
                // min: 0,
                // max: 100,
                // value: 0,
                // step: 5,
                unitLabel: 'K',
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
            remoteselect: {
                label: 'Remote Select',
                type: 'select',
                options: {
                    remote: {
                        url: 'sample/choices'
                    },
                    extract: 'payload',
                    // extract: function(data){
                    //     return {a: [{x:1, y:2}, {x:3, y:4}, {x:0, y:5}], b: [5,6,78]};
                    // },
                    // labelField: 'x',
                    // valueField: 'y',
                }
            },
            //code edtior
            code: {
                type: 'code',
                label: 'Code Editor',
            },
            //date editors
            date: app.view({
                className: 'form-group',
                template: [
                    '<div class="col-sm-6">',
                        '<div editor="date-from"></div>',
                    '</div>',
                    '<div class="col-sm-6">',
                        '<div editor="date-to"></div>',
                    '</div>',
                ],
                editors: {
                    'date-from': {
                        label: 'Date-From',
                        type: 'date',
                        startDate: '2/29/2012',
                        layout: {
                            label: 'col-sm-4',
                            field: 'col-sm-8'
                        },
                    },
                    'date-to': {
                        label: 'Date-To (hidden\&click)',
                        type: 'date',
                        hidden: true,
                        layout: {
                            label: 'col-sm-4',
                            field: 'col-sm-8'
                        }
                    },
                }
            }),
            'date-methods': app.view({
                className: 'form-group',
                template: [
                    '<div class="col-sm-6">',
                        '<div editor="methods"></div>',
                    '</div>',
                    '<div class="col-sm-6">',
                        '<div class="row">',
                            '<div class="col-sm-8">',
                                '<input type="text" id="date-interact-getVal" class="form-control" placeholder="get the value of editor in standard form."/>',
                            '</div>',
                            '<div class="col-sm-4">',
                                '<div class="btn btn-block btn-primary" action="get-val">getVal</div>',
                            '</div>',
                        '</div>',
                        '<div class="row" style="padding-top:1em;">',
                            '<div class="col-sm-8">',
                                '<input type="text" id="date-interact-getVal-true" class="form-control" placeholder="get the value of editor in milliseconds."/>',
                            '</div>',
                            '<div class="col-sm-4">',
                                '<div class="btn btn-block btn-primary" action="get-val-true">getVal(true)</div>',
                            '</div>',
                        '</div>',
                        '<div class="row wrapper-2x">',
                            '<div class="col-sm-8">',
                                '<input type="text" id="date-interact-setVal" class="form-control" placeholder="(m)m/(d)d/yyyy or milliseconds"/>',
                            '</div>',
                            '<div class="col-sm-4">',
                                '<div class="btn btn-block btn-info" action="set-val">setVal</div>',
                            '</div>',
                        '</div>',
                        '<div class="row">',
                            '<div class="col-sm-6">',
                                '<div class="btn btn-block btn-warning" action="disable">Disable</div>',
                            '</div>',
                            '<div class="col-sm-6">',
                                '<div class="btn btn-block btn-success" action="enable">Enable</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                ],
                editors: {
                    methods: {
                        type: 'date',
                        label: 'Date Methods',
                        layout: {
                            label: 'col-sm-4',
                            field: 'col-sm-8'
                        }
                    },
                },
                actions: {
                    'get-val': function(){
                        var val = this.getEditor('methods').getVal();

                        this.$el.find('#date-interact-getVal').val(val);
                    },
                    'get-val-true': function(){
                        var val = this.getEditor('methods').getVal(true),
                            date = new Date(val);

                        this.$el.find('#date-interact-getVal-true').val(val);
                    },
                    'set-val': function(){
                        var val = this.$el.find('#date-interact-setVal').val();

                        if(_.contains(val, '/'))
                            this.getEditor('methods').setVal(val);
                        else
                            this.getEditor('methods').setVal(parseInt(val));
                    },
                    disable: function(){
                        this.getEditor('methods').disable();
                    },
                    enable: function(){
                        this.getEditor('methods').disable(false);
                    },
                }
            }),
            'time-methods': app.view({
                className: 'form-group',
                template: [
                    '<div class="col-sm-6">',
                        '<div editor="time"></div>',
                    '</div>',
                    '<div class="col-sm-6">',
                        '<div class="row">',
                            '<div class="col-sm-8">',
                                '<input type="text" id="date-interact-getVal" class="form-control" placeholder="get the value of editor in standard form."/>',
                            '</div>',
                            '<div class="col-sm-4">',
                                '<div class="btn btn-block btn-primary" action="get-val">getVal()</div>',
                            '</div>',
                        '</div>',
                        '<div class="row wrapper">',
                            '<div class="col-sm-8">',
                                '<input type="text" id="date-interact-setVal" class="form-control" placeholder="hh:mm:ss am/pm or milliseconds"/>',
                            '</div>',
                            '<div class="col-sm-4">',
                                '<div class="btn btn-block btn-info" action="set-val">setVal</div>',
                            '</div>',
                        '</div>',
                        '<div class="row">',
                            '<div class="col-sm-6">',
                                '<div class="btn btn-block btn-warning" action="disable">Disable</div>',
                            '</div>',
                            '<div class="col-sm-6">',
                                '<div class="btn btn-block btn-success" action="enable">Enable</div>',
                            '</div>',
                        '</div>',
                    '</div>',
                ],
                editors: {
                    time: {
                        label: 'Time Methods',
                        type: 'time',
                        startTime: 12345678900,
                        layout: {
                            label: 'col-sm-4',
                            field: 'col-sm-8'
                        }
                    }
                },
                actions: {
                    'get-val': function(){
                        var val = this.getEditor('time').getVal();

                        this.$el.find('#date-interact-getVal').val(val);
                    },
                    'set-val': function(){
                        var val = this.$el.find('#date-interact-setVal').val();

                        if(_.contains(val, ':'))
                            this.getEditor('time').setVal(val);
                        else
                            this.getEditor('time').setVal(parseInt(val));
                    },
                    disable: function(){
                        this.getEditor('time').disable();
                    },
                    enable: function(){
                        this.getEditor('time').disable(false);
                    },
                }
            }),
        },
    });

    //////////Form/////////
    app.view('Demo.Editors', {
        template: [
            '<div class="row">',
                '<div class="form form-horizontal">',
                    '<div region="fieldset-a" view="FieldsetA"></div>',
                    '<div region="fieldset-b" view="FieldsetB"></div>',
                '</div>',
            '</div>', //the class form form-horizontal is required for the editor layout class config to work in bootstrap 3
            '<div class="row">',
                '<div class="col-sm-10 col-sm-offset-2">',
                    '<span class="btn btn-primary" action="submit">Submit</span> ',
                    '<span class="btn btn-warning btn-outline" action="validate">Validate</span> ',
                    '<span class="btn btn-default" action="test">Test</span> ',
                    '<span class="btn btn-default btn-outline" action="test2">Test(Disable/Enable)</span> ',
                    '<span class="btn btn-info" action="info">Inform</span> ',
                    '<span class="btn btn-info btn-outline" action="clearinfo">Clear Info</span> ',
                '</div>',
            '</div>'
        ],
        editors: {
            _global: {
                layout: {
                    label: 'col-sm-2',
                    field: 'col-sm-10'
                },
                appendTo: 'div.form',
            },
            'main.selectgroup': {
                label: 'Group',
                type: 'select',
                options: {
                    data: {
                        group1: [{label: 'abc', value: '123'}, {label: '4555', value: '1111'}],
                        group2: [{label: 'abcx', value: '123x'}, {label: '4555x', value: '1111x'}],
                    }
                }
            },
            //compond editor
            duration: app.view({
                className: 'form-group',
                template: [
                    '<label class="control-label col-sm-2">Duration (compond)</label>',
                    '<div class="col-sm-10">',
                        '<div class="row">',
                            '<div class="col-sm-6" editor="time"></div>',
                            '<div class="col-sm-6" editor="unit"></div>',
                        '</div>',
                    '</div>',
                ],
                editors: {
                    time: {
                        type: 'text',
                        name: 'time',
                        validate: {
                            required: true
                        }
                    },
                    unit: {
                        type: 'radios',
                        name: 'unit',
                        value: 'h',
                        options: {
                            inline: true,
                            data: [{
                                label: 'Hours',
                                value: 'h'
                            }, {
                                label: 'Minutes',
                                value: 'm'
                            }, {
                                label: 'Seconds',
                                value: 's'
                            }]
                        },
                        validate: {
                            required: true
                        }
                    }
                },
                getVal: function() {
                    var vals = this.get();
                    return vals.time + vals.unit;
                },
                setVal: function(val, loud) {
                    //set editor values
                }
            }),
        },
        onReady: function(){

            // this.$('input').iCheck({
            //     checkboxClass: 'icheckbox_square',
            //     radioClass: 'iradio_square',
            // });
            
        },
        actions: {
            validate: function($btn){
                this.getViewIn('fieldset-a').validate(true);
                this.getViewIn('fieldset-b').validate(true);
                this.validate(true);
            },
            submit: function(){
                // var f = this.getEditor('fieldset-b.xyz');
                // f.upload({
                //     fileInput: this.$el.find('input[name="files[]"]')
                // });
                app.debug(_.extend(this.get(), {
                    'fieldset-a': this.getViewIn('fieldset-a').get(),
                    'fieldset-b': this.getViewIn('fieldset-b').get()
                }));
            },
            test: function(){
                this.set({
                    main: {
                        selectgroup: '1111x'
                    }
                });

                this.getViewIn('fieldset-b').set({
                    checkboxes: ['1231', '1233'],
                    readonly2: 'Hello!',
                    singlecheckbox: 'enabled',
                });

                //since we changed the inputs outside of iCheck plugin api.
                //this.$('input').iCheck('update');
            },
            test2: function(){
                var editor = this.getEditor('fieldset-b.checkboxes');
                if(!editor) return app.debug('Can not find editor:', 'fieldset-b.checkboxes');

                if(editor.isEnabled()) {
                    editor.disable(true);
                    this.getEditor('fieldset-a.ab').disable();
                    this.getEditor('fieldset-b.radios').disable();
                }
                else {
                    editor.disable(false);
                    this.getEditor('fieldset-a.ab').disable(false);
                    this.getEditor('fieldset-b.radios').disable(false);
                }
            },
            info: function(){
                this.status({
                    singlecheckbox: 'passed!',
                    efg: {
                        status: 'error',
                        message: 'another server error!'
                    }
                });
            },
            clearinfo: function(){
                this.getViewIn('fieldset-a').status();
                this.getViewIn('fieldset-b').status();
                this.status();
            }
        }
    });

})(Application);
