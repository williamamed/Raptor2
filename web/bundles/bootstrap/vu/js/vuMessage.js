

(function($){
	
	if(window.VU==undefined)
		window.VU={};
	
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
	
	window.VU.Message=function(option){
		return new Message(option);
	
	}
	
	window.VU.Msg={
		language:{
			aceptar:'Aceptar',
			cancelar:'Cancelar',
			si:'Sí',
			no:'No',
			info:'Información',
			warning:'Advertencia',
			error:'Error',
			confirm:'Confirmación',
			
		}

	
	
	
	}
	
	var Message=function(option){
		this.options=option;
		this.init();
	
	}
	
	
	
	Message.prototype={
		constructor:Message,
		init:function(){
			var type = this.options.type.toUpperCase();
			var typeApply;
			var title;
			var buttons=new Array();
            switch(type){
                case 'INFO':{ typeApply = this.styleMsg.info;
							  title=VU.Msg.language.info;//'msg-info';
							  buttons.push({text:VU.Msg.language.aceptar,callback:this.close,scope:this,icon:'../../img/message/apply.png',focus:true});
							  var color={background:'#598EFD',color:'white',borderColor:'#4371D4',css:'alert alert-info'};
                              break;
				}
                case 'ERROR':{ typeApply = this.styleMsg.error;//'msg-error';
                              title=VU.Msg.language.error;
							  buttons.push({text:VU.Msg.language.aceptar,callback:this.close,scope:this,icon:'../../img/message/apply.png',focus:true});
							  var color={background:'#E34B49',color:'white',borderColor:'#B33A38',css:'alert alert-error'};
							  break;
				}
                case 'WARNING':{ typeApply = this.styleMsg.warning;//'msg-warning';
							 title=VU.Msg.language.warning;
							 buttons.push({text:VU.Msg.language.aceptar,callback:this.close,icon:'../../img/message/apply.png',scope:this,focus:true});
							 var color={background:'#DCB84F',color:'white',borderColor:'#C5A549',css:'alert alert-warning'};
							 break;
				}
				case 'SUCCESS':{ typeApply = this.styleMsg.success;//'msg-warning';
							 title=VU.Msg.language.warning;
							 buttons.push({text:VU.Msg.language.aceptar,callback:this.close,icon:'../../img/message/apply.png',scope:this,focus:true});
							 var color={background:'#43C527',color:'white',borderColor:'#359920',css:'alert alert-success'};
							 break;
				}
                case 'CONFIRM':{ typeApply = this.styleMsg.confirm;//'msg-confirm';
                              title=VU.Msg.language.confirm;
							  buttons.push(
                                                           {text:VU.Msg.language.si,callback:this.confirmFunction,icon:'../../img/message/apply.png',scope:this,left:true},
							   {text:VU.Msg.language.no,callback:this.deniFunction,icon:'../../img/message/cancel.png',scope:this,focus:true}
							  
								);
							  break;
				}
            }
			
			this.msg=typeApply+'<span class="msg-text">'+this.options.text+'</span>';
			if(this.options.floating){
				this.floting=$('<div></div>');
				var $this=this;
				$('body').append(this.floting)
				this.floting.hide();
				this.floting.addClass('floting');
				this.floting.addClass(color.css);
				
				this.floting.css({position:'absolute',left:this.options.floating.position.x,top:this.options.floating.position.y});
				
				this.textContainer=$('<div style="margin:10px;margin-top:20px;"></div>');
				this.textContainer.append(this.msg);
				this.floting.append(this.textContainer);
				//this.floting.css(color);
				//this.floting.find('.msg-text').css(color);
				this.floting.fadeIn("slow");
				var closingFunction=function(){};
				this.closing=true;
				if(this.options.floating.seconds)
					var timeOut=setTimeout(function(){
						
						if($this.closing)
							$this.floting.fadeOut("slow",function(){$this.close.call($this)});
						else
							closingFunction=function(){$this.floting.fadeOut("slow",function(){$this.close.call($this)});};
						
					},this.options.floating.seconds*1000)
				
				this.floting.hover( function(){
					
						$this.closing=false;
					
				}, function(e){
					
						if(e.currentTarget.className===e.target.className){
							$this.closing=true;
							closingFunction();
						}
					
				} )
				
				
				
				if(this.options.floating.move)
					move(this.floting,this.floting);
				if(this.options.width){
					//this.floting.width(this.options.width)
				}
			}else{
				this.dialog=VU.Dialog({text:this.msg,title:title});
				if(this.options.width){
					this.dialog.setWidth(this.options.width)
					this.dialog.center();
				}
				for(var i=0,cant=buttons.length;i<cant;i++){
					this.dialog.addButton(buttons[i])
				
				}
			}
		},
		styleMsg:{
			
			info:'<span class="icon-info msg-icon-info icon-3x"></span>',
			warning:'<span class="icon-warning-sign msg-icon-info icon-3x"></span>',
			success:'<span class="icon-ok msg-icon-info icon-3x"></span>',
			error:'<span class="icon-remove msg-icon-info icon-3x"></span>',
			confirm:'<span class="icon-question-sign msg-icon-info icon-3x"></span>',
		},
		close:function(){
			if(this.options.floating){
				this.floting.remove();
			}else{
				this.dialog.close();
				if(typeof(this.options.callback)=='function')
					this.options.callback.call(this);
			}
		},
		hide:function(){
			if(this.options.floating){
				this.floting.hide();
			}else{
				this.dialog.hide();
				
			}
		},
		show:function(){
			if(this.options.floating){
				this.floting.show();
			}else{
				this.dialog.show();
				
			}
		},
		confirmFunction:function(){
			this.dialog.close();
			if(typeof(this.options.callback)=='function')
				this.options.callback.call(this,['yes']);
		
		},
		deniFunction:function(){
			this.dialog.close();
			if(typeof(this.options.callback)=='function')
				this.options.callback.call(this,['No']);
		
		},
		updateMessage:function(text){
			var $this=this;
			if(this.options.floating){
				this.floting
				 .animate( { borderColor:"red" }, 500 ) 
				 .animate( { opacity:0 },200,function(){
					$this.textContainer.find('.msg-text').html(text);
				  })
				  .animate( { opacity:1 }, 500 ) 
				
				
			
			}else{
				this.dialog.updateText(text);
				
			}
			
		
		},
		setPosition:function(x,y,callback){
			if(this.options.floating){
				this.floting
				 
				 .animate( { opacity:0.5 },200)
				 .animate( { left:x,top:y }, 500 ) 
				  .animate( { opacity:1 }, 500 ,callback) 
				
				
			
			}else{
				this.dialog.setPosition(x,y)
				
			}
		
		}
		
		
	
	}
	
	
 
})(jQuery);

	