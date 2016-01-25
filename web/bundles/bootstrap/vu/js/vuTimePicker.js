(function($){

	 if($.fn.timepicker == undefined)
        return;
	VU.namespace('VU.Components');	
	VU.Components.Timepicker = $.fn.timepicker.Constructor;	

	VU.Components.Timepicker.prototype=$.extend(VU.Components.Timepicker.prototype,{
		/*
		* Redifinicion del init para incorporar la validacion del inicio del rango
		*
		**/
		init: function () {
            if (this.$element.parent().hasClass('input-append')) {
                this.$element.parent('.input-append').find('.add-on').on('click', $.proxy(this.showWidget, this));
                this.$element.on({
                    focus: $.proxy(this.highlightUnit, this),
                    click: $.proxy(this.highlightUnit, this),
                    keypress: $.proxy(this.elementKeypress, this),
                    blur: $.proxy(this.blurElement, this)
                });

            } else {
                if (this.template) {
                    this.$element.on({
                        focus: $.proxy(this.showWidget, this),
                        click: $.proxy(this.showWidget, this),
                        blur: $.proxy(this.blurElement, this)
                    });
                } else {
                    this.$element.on({
                        focus: $.proxy(this.highlightUnit, this),
                        click: $.proxy(this.highlightUnit, this),
                        keypress: $.proxy(this.elementKeypress, this),
                        blur: $.proxy(this.blurElement, this)
                    });
                }
            }
            
            //Aqui: Corrigiendo el lugar donde colocar el timepicker para que se coloquen
            //dentro del contenedor del elemento.
            this.$widget = $(this.getTemplate()).appendTo($(this.$element).parent());
//            this.$widget = $(this.getTemplate()).appendTo('body');
            var me=this;
			$('body').click(function(e){
				me.hideWidget();
				e.stopPropagation();
			})
			
            this.$widget.on('click', $.proxy(this.widgetClick, this));

            if (this.showInputs) {
                this.$widget.find('input').on({
                    click: function() { this.select(); },
                    keypress: $.proxy(this.widgetKeypress, this),
                    change: $.proxy(this.updateFromWidgetInputs, this)
                });
            }
			//Aqui: Validacion para inicializar cuando este la opcion del rango, iniciar con el valor minimo
			if(this.options.minTime){
				this.validateEntry();
				this.setValueInitialRange();
				this.defaultTime=this.getTime();
			}else
				this.setDefaultTime(this.defaultTime);
				
			
        },
		/**
		*	validar entrada de valores Max y Min
		*
		*
		*/
		validateEntry:function(){
			var min=this.match(this.options.minTime);
			if(min[2]==undefined)
				min[2]='00';
			if(parseInt(min[0],10)>12)
				min[3]='PM';
				
			if(this.options.showMeridian&&parseInt(min[0],10)>12){
				min[0]=parseInt(min[0],10)-12;
			}
			
			if(min[3]==undefined)
				if(parseInt(min[0],10)>12)
					min[3]='PM';
				else
					min[3]='AM';
			
			var max=this.match(this.options.maxTime);
			if(max[2]==undefined)
				max[2]='00';
			if(parseInt(max[0],10)>12)
				max[3]='PM';
			if(this.options.showMeridian&&parseInt(max[0],10)>12){
				max[0]=parseInt(max[0],10)-12;
			}
			if(max[3]==undefined)
				if(parseInt(max[0],10)>12)
					max[3]='PM';
				else
					max[3]='AM';
					
			this.options.minTime=min[0]+':'+min[1]+':'+min[2]+' '+min[3];
			this.options.maxTime=max[0]+':'+max[1]+':'+max[2]+' '+max[3];
		
		}
		/*
		*	Colocar el valor inicial cuando este activo la opcion del rango
		*
		*/
		,setValueInitialRange:function(){
			var min=this.match(this.options.minTime);
			
			  if(min[2]==undefined)
				min[2]='00';
			this.meridian=min[3];	
		
			 
			 this.hour=parseInt(min[0],10);
			 this.minute=parseInt(min[1],10);
			 if(this.options.showSeconds){
				this.second=parseInt(min[2],10);
			 }else
				this.second=0;
			this.beforeTime=this.getTime();
			this.updateElement();
            this.updateWidget();
		}
		/*
		*	Para validar el Rango
		*
		*/
		,validateRange:function(){
			 
			 var current=this.match(this.getTime());
			
			 //Actual
			  var dateCurrent=new Date();
			 if(this.options.showMeridian){
				if(current[3]=='PM'){
					if(parseInt(current[0],10)==12)
						var hourC=parseInt(current[0],10);
					else
						var hourC=parseInt(current[0],10)+12;
				}else{
					if(parseInt(current[0],10)==12)
						var hourC=0;
					else
						var hourC=parseInt(current[0],10);
				}
			 }else
				var hourC=parseInt(current[0],10);
			 
			 dateCurrent.setHours(hourC);
			 dateCurrent.setMinutes(parseInt(current[1],10));
			 if(this.options.showSeconds){
				dateCurrent.setSeconds(parseInt(current[2],10));
			 }
			 //Maximo
			 var max=this.match(this.options.maxTime);
			 
			 if(max[2]==undefined)
				max[2]='00';
			
			 var dateMax=new Date(dateCurrent);
			 if(this.options.showMeridian){
				if(max[3]=='PM'){
					if(parseInt(max[0],10)==12)
						var hourMax=parseInt(max[0],10);
					else
						var hourMax=parseInt(max[0],10)+12;
				}else{
					if(parseInt(max[0],10)==12)
						var hourMax=0;
					else
						var hourMax=parseInt(max[0],10);
					
				}
			 }else
				var hourMax=parseInt(max[0],10);
			 
			 dateMax.setHours(hourMax);
			 dateMax.setMinutes(parseInt(max[1],10));
			 if(this.options.showSeconds){
				dateMax.setSeconds(parseInt(max[2],10));
			 }
			 //Minimo
			 var min=this.match(this.options.minTime);
			 
			  if(min[2]==undefined)
				min[2]='00';
			 //console.info(current)
			 var dateMin=new Date(dateCurrent);
			 if(this.options.showMeridian){
				if(min[3]=='PM'){
					if(parseInt(min[0],10)==12)
						var hourMin=parseInt(min[0],10);
					else
						var hourMin=parseInt(min[0],10)+12;
				}else{
					if(parseInt(min[0],10)==12)
						var hourMin=0;
					else
						var hourMin=parseInt(min[0],10);
					
				}
			 }else
				var hourMin=parseInt(min[0],10);
			 
			 dateMin.setHours(hourMin);
			 dateMin.setMinutes(parseInt(min[1],10));
			 if(this.options.showSeconds){
				dateMin.setSeconds(parseInt(min[2],10));
			 }
			// console.info(dateMin<=dateCurrent,dateMin+'<='+dateCurrent)
			 if(dateMin<=dateCurrent&&dateMax>=dateCurrent)
				return true;
			 else
				return false;
		
		},
		//Expresion regular para dividir la fecha
		match: function(time) {
			var rtime = /^((?:1[012]|0[1-9]|[1-9])|(?:[01][0-9]|2[0-3])):([0-5][0-9]):?([0-5][0-9])?(?:\s(am|pm))?$/i,
				matches = rtime.exec(time);
			
			if (matches) {
				matches.splice(0, 1);
			}
			return matches;
		}
		/*
		*	Redifinicion del update para agregar el validador de rango
		*
		*
		*/
		, update: function() {
           if(this.options.minTime)
		   if(!this.validateRange()){
				this.setValues(this.beforeTime);
		   }
		   
			this.updateElement();
            this.updateWidget();
        },
		/*
		*	Redifinicion de toggleMeridian para agregar el tiempo anterior
		*
		**/
		toggleMeridian:function(){
			this.beforeTime=this.getTime();
            this.meridian = this.meridian === 'AM' ? 'PM' : 'AM';

            this.update();
		},
		/*
		*	Este es usado por los increment y no actualiza la interfaz, las llamadas a  los increment se encargan de actualizar la interfaz
		*
		**/
		toggleMeridianIntern:function(){
			this.beforeTime=this.getTime();
            this.meridian = this.meridian === 'AM' ? 'PM' : 'AM';
			
		}
		/*
		*	Redifinicion de los increment de las horas para cambiar el toggleMeridian por el toggleMeridianIntern y controlar el tiempo anterior
		*
		**/
		, incrementHour: function() {
            this.beforeTime=this.getTime();
			if (this.showMeridian) {
                if (this.hour === 11) {
                    this.toggleMeridianIntern();
                } else if (this.hour === 12) {
                    return this.hour = 1;
                }
            }
            if (this.hour === 23) {
                return this.hour = 0;
            }
            this.hour = this.hour + 1;
			
        }

        , decrementHour: function() {
			 this.beforeTime=this.getTime();
            if (this.showMeridian) {
                if (this.hour === 1) {
                    return this.hour = 12;
                }
                else if (this.hour === 12) {
                    this.toggleMeridianIntern();
                }
            }
            if (this.hour === 0) {
                return this.hour = 23;
            }
            this.hour = this.hour - 1;
        }
	})

	$.fn.vuTimePicker=$.fn.timepicker;

})(jQuery)