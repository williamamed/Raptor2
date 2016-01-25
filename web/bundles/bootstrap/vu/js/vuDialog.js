/**
*	VU Ventana de dialogo
*
*	@autor Ailin 
*
*
*
*
*
*
*/

(function($){
	
	function move(element,target){
		var moving=false;
		var from={};
		
		element.mousedown(function(e){
			moving=true;
			from.x=e.pageX;
			from.y=e.pageY;
			var offset = target.offset();
			from.sobX=from.x-offset.left;
			from.sobY=from.y-offset.top;
		})
		
		element.mouseup(function(){
			moving=false;
			target.css({ opacity:1})
		})
		
		$('body').mousemove(function(e){
			if(moving){
				
				target.css({ "position" : "absolute","left":e.pageX-(from.sobX),"top":e.pageY-from.sobY,opacity:0.2})
				
			}
		
		})
	
	}
	
	var Dialog=function(options){
		this.options=$.extend(this.defaultOpts,options);
		
		this.init();
	
	
	}
	
	Dialog.prototype={
		constructor:Dialog,
		init:function(){
			
			$('body').append('<div ></div>');
			this.element=$('body').children(':last')
			var $this=this;
			
			if(this.options.width)
				this.element.width(this.options.width);
			
				
			if(this.options.language)
				this.defaultLanguage=$.extend(this.defaultLanguage,this.options.language);
			
			var fondo=$('<div class="fondo-progressbar"></div>')
			if(this.options.modal)
				$('body').append(fondo);
			
			
			var title=$('<div  class="msg-bartitle"></div>');
			this.name=$('<div  class="msg-title-name"></div>');
			if(this.options.title)
				this.name.html(this.options.title);
			var cerrar=$('<div class="btn msg-cerrar" style="">X</div>');
			title.append(cerrar);
			title.append(this.name);
			this.element.append(title);
			this.textContainer=$('<div style="margin:10px;margin-top:20px;background-color: white;">'+this.options.text)
			this.element.append(this.textContainer);
			
			this.buttonsContainer=$('<div class="barcontainer"></div>')
			this.buttons=false;
			if(this.options.buttons){
				for(var i=0,cant=this.options.buttons.length;i<cant;i++){
							
							var fun=this.options.buttons[i].callback;
							if(this.options.buttons[i].scope)
								var scope=this.options.buttons[i].scope;
							this.options.buttons[i].callback=function(){
								
								if(scope)
									fun.call(scope);
								else
									fun.call($this);
							
							}
							
							var button=$('<a class="btn btn-primary button" ><span class="msg-icon-base" style="background-image:url('+this.options.buttons[i].icon+');"></span>'+this.options.buttons[i].text+'</a>').click(this.options.buttons[i].callback);
							if(this.options.buttons[i].left)
								button.css({'float':'left','margin':'auto',marginLeft:'10px'});
							this.buttonsContainer.append(button)
							
							if(this.options.buttons[i].focus)
								button.focus();
					
				
				}
				this.buttons=true;
				this.element.append(this.buttonsContainer);
			}
			
			cerrar.click(function(){
				$this.element.remove();
				fondo.remove();
				
			
			});
			this.fondo=fondo;
			
			this.element.addClass('progressbar')
		
			this.element.centrar();
			
			
			
			move(title,this.element)
		
		},
		defaultLanguage:{
			aceptar:'Aceptar',
			cancelar:'Cancelar',
			si:'Si',
			no:'No'
		
		},
		defaultOpts:{
			modal:true,
		},
		addButton:function(button){
			var $this=this;
			if(this.buttons==false)
				this.element.append(this.buttonsContainer);
			
			var fun=button.callback;
			var scope=button.scope;
			button.callback=function(){
				
				if(scope)
					fun.call(scope);
				else
					fun.call($this);
					
			}
			var buttonC=$('<a class="btn btn-primary button" href="#"><span class="msg-icon-base" style="background-image:url('+button.icon+');"></span>'+button.text+'</a>').click(button.callback)
			if(button.left)
				buttonC.css({'float':'left','margin':'auto',marginLeft:'10px'});
			
			this.buttonsContainer.append(buttonC);
			if(button.focus){
				buttonC.attr('focus',true);
			
			}
			this.buttonsContainer.find('a[focus=true]').focus();
			
		},
		updateText:function(text){
			this.textContainer.html(text)
		
		},
		getContent:function(){
			return this.textContainer.html();
		},
		updateTitle:function(text){
			this.name.html(text)
		
		},
		close:function(){
				this.element.remove();
				this.fondo.remove();
		
		},
		hide:function(){
			this.element.hide();
			this.fondo.hide();
		
		},
		show:function(){
			this.element.show();
			this.fondo.show();
		
		},
		setWidth:function(ancho){
			this.element.width(ancho);
		
		},
		center:function(){
			this.element.centrar();
		
		},
		setPosition:function(x,y){
			this.element.css({left:x,top:y});
		
		}
		
	
	
	}
	if(window.VU==undefined)
		window.VU={};
		
	window.VU.Dialog=function(option){
		return new Dialog(option);
	
	}
	
    
 
})(jQuery);


