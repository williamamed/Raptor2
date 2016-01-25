(function($){
    if($.fn.datepicker == undefined)
        return;
	VU.namespace('VU.Components');
	
    VU.Components.Datepicker = window.Datepicker.getFromAmbit('Datepicker');

	
	
	VU.Components.Datepicker.prototype.setValue2=VU.Components.Datepicker.prototype.setValue
	
	VU.Components.Datepicker.prototype.setValue=function(){
		this.setValue2();
		if (!this.isInput) {
				if (this.component){
					this.element.find('input').keyup();
				}
			} else {
				this.element.keyup();
			}
	}
	VU.Components.Datepicker.prototype.setRawValue=function(){
		
		if (!this.isInput) {
				if (this.component){
					this.element.find('input').val(arguments[0]);
					this.element.find('input').keyup();
				}
			} else {
				this.element.val(arguments[0]);
				this.element.keyup();
			}

	}
	

    $.fn.datepicker.dates['es'] = {
        days: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
        daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
        daysMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"],
        months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        today: "Hoy"
    };

    $.fn.datepicker.defaults = $.extend($.fn.datepicker.defaults, {
        autoclose: false,
        beforeShowDay: $.noop,
        calendarWeeks: false,
        clearBtn: false,
        daysOfWeekDisabled: [],
        endDate: Infinity,
        forceParse: true,
        format: 'dd/mm/yyyy',
        keyboardNavigation: true,
        language: 'es',
        minViewMode: 0,
        orientation: "auto",
        rtl: false,
        startDate: -Infinity,
        startView: 0,
        todayBtn: false,
        todayHighlight: false,
        weekStart: 0
    });

    $.fn.datepicker.locale_opts = [
        'format',
        'rtl',
        'weekStart'
    ];

    $.fn.vuDatepicker = $.fn.datepicker;
	

})(jQuery);