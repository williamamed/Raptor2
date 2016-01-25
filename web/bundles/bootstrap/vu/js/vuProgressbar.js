(function($){
/**
     * VuProcesando
     * Clase con comportamiento para mostrar un cargando (Loading...)
     * @param options
     */
	VU.namespace('VU.Components');
    VU.Components.VuProcesando = function(options){
        this.options = $.extend(this.defaults,  options);
        this.init();
    };

    VU.Components.VuProcesando.prototype = {
        constructor: VU.Components.VuProcesando
        ,defaults : {
            msg: ''
            ,id: 'idProcedandoMsg'
            ,percent: 0
            ,holder: 'body'
            ,textColor: '#3A87AD'
            ,runIncrement: false
        }
        ,init : function(){
            $('#'+this.options.id).remove();
            var $superContainer = $('<div class="procesando-supercontainer"></div>')
                .attr('id', this.options.id);
            var $container = $('<div class="procesando-container"></div>');
            var $progress = $('<div class="progress progress-info progress-striped active"></div>');
            var $bar = $('<div style="width: 0;" class="bar"></div>');
            $progress.append($bar);
            var $texto = $('<strong></strong>').css({color: this.options.textColor});
            if(this.options.msg && this.options.msg != ''){
                $texto.html(this.options.msg);
            }else{
                $texto.hide();
            }
            $container.append($texto);
            $container.append($progress);
            $superContainer.append($container)
                .hide()
                .appendTo(this.options.holder);
            //console.log($bar);return;
            this.resetIncrementStatus();
            this.options.cargando = $superContainer;
            if(this.options.runIncrement)
                this.incrementPercent();
            else
                $bar.css({width: '100%'})
            return this;
        }
        ,incrementPercent : function(){
            var el = this;
            if(this.options.percent == 100 || !this.options.runIncrement){
                this.destroy();
				return;
			}
            this.options.percent+=5;
			
            this.options.cargando.find('.bar').css('width', this.options.percent+'%');
            //setTimeout(this.incrementPercent, 250);
        },
		setPercent : function(percent){
            var el = this;
			this.options.percent=percent;
            if(this.options.percent >= 100 || !this.options.runIncrement){
                this.destroy();
				return;
			}
            
			
            this.options.cargando.find('.bar').css('width', this.options.percent+'%');
            //setTimeout(this.incrementPercent, 250);
        }
        ,show : function(){
            if(!this.options.cargando)
                this.init()
            this.options.cargando.show();
            //this.options.cargando.find('.bar').css({'width': '100%'});
            return this;
        }
        ,hide : function(){
            $('#'+this.options.id).fadeOut('fast');
            return this;
        }
        ,destroy : function(){
            var el = this;
            $('#'+this.options.id).fadeOut('fast', function(){
                var data = $(el.options.holder).data();
                $(data).removeProp('vuProcesando');
            });
            return null;
        }
        ,removeMsg : function(){
            if(this.options.cargando){
                var visible = this.options.cargando.is(':visible')
                this.options.cargando.remove();
                this.options.cargando = undefined;
//                if(visible){
//                    this.init()
//                        .show();
//                }
            }
            return this;
        }
        ,setMsg : function(msg){
            this.options.msg = msg;
            if(this.options.cargando){
                var visible = this.options.cargando.is(':visible')
                this.removeMsg();
                if(visible){
                    this.init()
                        .show();
                }
            }
            return this;
        }
        ,startIncrement : function(){
            this.options.runIncrement = true;
            this.incrementPercent();
            return this;
        }
        ,stopIncrement : function(){
            this.options.runIncrement = false;
            return this;
        }
        ,resetIncrementStatus : function(){
            this.options.percent = 0;
            return this;
        }
    };

    var  noConflictVuProcesando = $.fn.vuProcesando
        ,noConflictVuPageProcesando = $.fn.vuPageProcesando;

    /*Agrega el procesando el primero de la coleccion seleccionada.*/
    $.fn.vuProcesando = function(options){
        if(this.length){
            var  $element = $(this[0])
                ,plugin = $element.data('vuProcesando');
            if(typeof  options == 'string' &&  plugin){
                if(typeof plugin[options] == 'function')
                    return plugin[options]();
                else
                    return plugin.setMsg(options);
            }else if (    plugin
                && typeof  options == 'object'
                && !(options instanceof Array)
                )
            {
                plugin.destroy();
                options = $.extend(options, {holder: $element});
            }else if(typeof  options == 'string'){
                options = $.extend({msg: options}, {holder: $element});
            }

            if(!plugin){
                plugin = new VU.Components.VuProcesando(options);
                $element.data('vuProcesando', plugin);
            }

            return plugin;
        }
    }

    /*Abreviatura para el procesando que cubre la pagina completa.*/
    $.vuPageProcesando = function(options){
        return $('body').vuProcesando(options);
    }

    /*Resolucion de conflictos*/
    $.fn.vuProcesando.noConflict = function () {
        $.fn.vuProcesando = noConflictVuProcesando;
        $.vuPageProcesando = noConflictVuPageProcesando;
        return this;
    }
})(jQuery);
