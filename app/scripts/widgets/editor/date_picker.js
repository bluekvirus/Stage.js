/**
 * 
 * DatePicker Editor.
 * Based on [https://github.com/powmedia/backbone-forms#custom-editors]; [http://api.jqueryui.com/datepicker/]
 *
 * @author Yan Zhu
 * @update 2013.07.24
 * 
 */
(function(){

    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        showOn: 'both',
        buttonImage: 'themes/'+Application.theme+'/images/calendar.gif',
        buttonImageOnly: true,
        buttonText: 'Choose'
    });

    Backbone.Form.editors['DatePicker'] = Backbone.Form.editors.Text.extend({

        initialize: function(options) {
            Backbone.Form.editors.Text.prototype.initialize.call(this, options);

            this.$inputEl = this.$el;
            var $el = $('<div></div>');
            $el.append(this.$inputEl);
            this.setElement($el);

            var settings = this.schema.settings || {};
            if (this.schema.inline) {
                this.$inputEl.attr('type', 'hidden');
                this.$datepickerHolder = $('<span></span>').insertAfter(this.$inputEl).datepicker(settings);
            } else {
                this.$datepickerHolder = this.$inputEl.datepicker(settings);
            }
        },

        setValue: function(value) {
            this.$inputEl.val(value);
        },

        getValue: function() {
            return this.$inputEl.val();
        }
    });

})();