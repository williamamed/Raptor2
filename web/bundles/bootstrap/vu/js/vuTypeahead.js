(function($) {
	//para evitar redefinir el plugin vutypeahead
    if ($.fn.vuTypeahead != undefined)
        return;
	VU.namespace('VU.Components');
    VU.Components.Typeahead = window.Typeahead.getFromAmbit('Typeahead');

	
	
	VU.Components.Typeahead.prototype.listen= function () {
      this.$element
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this)).on('keyup',  $.proxy(this.notyping, this))

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this)).on('keydown', $.proxy(this.typing, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
        .on('mouseleave', 'li', $.proxy(this.mouseleave, this))
		
		this.contType=0;
		this.contNoType=0;
    }
	
	VU.Components.Typeahead.prototype.typing=function(){
		this.typing=true;
		if(this.ajax)
			this.ajax.abort();
		this.contType++;
		if(this.timeType)
			clearTimeout(this.timeType);
		
	}
	VU.Components.Typeahead.prototype.notyping=function(){
		
		
		var r=this.contType;
		var $this=this;
		this.timeType=setTimeout(function(){
			
			if(r==$this.contType){
				$this.typing=false;
				$this.lookup()
			}
		
		},500)
	}
	
    VU.Components.Typeahead.prototype.source = function(arreglo){
		
		if(this.typing==false){
		this.$element.addClass('loading-ajax');
		var el=this.$element;
		this.ajax = $.ajax({ 
		type:'POST',
		data:"query="+this.query,
		url: this.options.ajax.url, 
		async: false,
		complete:function(){
			el.removeClass('loading-ajax');
		}
		
		});
		
		var html=this.ajax.responseText;
		
		if(this.options.oneRequest)
			this.source=eval(html);
		
		return eval(html);
		}
    }
	
	
	
	
    $.fn.vuTypeahead = function(option) {
        if(option.ajax){
			option.source=VU.Components.Typeahead.prototype.source;
			
		}
		return this.each(function() {
            var   $this = $(this)
                , data = $this.data('typeahead')
                , options = typeof option == 'object' && option
            if (!data)
                $this.data('typeahead', (data = new VU.Components.Typeahead(this, options)))
            if (typeof option == 'string')
                data[option]();
				//console.debug(data);
        })
    }

    $.fn.typeahead.defaults = $.extend($.fn.typeahead.defaults, {
        items: 8,
        minLength: 1,
		oneRequest:true
    });
	
	
	
  
	//$.fn.vuTypeahead.Constructor=function(){alert('fff')}
	
	

})(jQuery);