/*!
 * 
 *
 *
 * 
 *
 * 
 * 
 *  
 */

 (function($) {
	VU.namespace('VU.Components');
	
	VU.Components.Form=function(element,options){
		this.element=element;
		this.options=options;
		this.init();
	}
	
	VU.Components.Form.prototype={
		constructor:VU.Components.Form,
		
		errorPlace:function(error,element){
				
				
				
                                var name=error.attr('for');
				var find=$('body').find('label[for="'+name+'"]');
                                if(find.size()>0)
                                    return;
                                $('body').append(error);
				error.css({position:'absolute',left:element.offset().left+8,top:element.offset().top+element.height()+20,display:'none !important'})
				error.hide();
				element.hover(function(){
					if(element.hasClass('error')){
						error.fadeIn("slow");
						error.addClass('alert alert-error')
					}
					
				},function(){
					
					error.fadeOut("slow");
				
				})
			 
		},
		
		prepareOpts:function(){
			if(this.options.validate)
			 this.options.validate.errorPlacement=this.errorPlace;
			 
			if(this.options.onSubmit&& typeof this.options.onSubmit=='function')
				this.onSubmit=this.options.onSubmit;
			if(this.options.onError&& typeof this.options.onError=='function')
				this.onError=this.options.onError;
			
			if(this.options.validate)
				$(this.element).validate(this.options.validate)
			else
				$(this.element).validate()
				
				
			
			
			$(this.element).attr('action',this.options.url)	
		
		},
		prepareComponentsVu:function(){
			var that=this;
			
			$(this.element).find('input').each(function(){
					if($(this).data("select2")){
						var sel=$(this).data("select2");
						if(that.options.validate)
						for( var campo in that.options.validate.rules ){
							if(campo===sel.opts.element.attr('name'))
								sel.setRequired();
						
						}
						
						
					}
					if($(this).data("switch")){
						var sel=$(this).data("switch");
						if(that.options.validate)
						for( var campo in that.options.validate.rules ){
							if(campo===sel.options.name)
								sel.setRequired();
						
						}
						
						
					}
				
			})
		
		},
		validarComponentsVu:function(){
			var that=this;
			var results=new Array();
			$(this.element).find('input').each(function(){
					if($(this).data("select2")){
						var sel=$(this).data("select2");
						if(that.options.validate)
						for( var campo in that.options.validate.rules ){
							if(campo===sel.opts.element.attr('name'))
								sel.setRequired();
						
						}
						
						results.push(sel.validate());
					}
					if($(this).data("checks")){
						var sel=$(this).data("checks");
						if(that.options.validate)
						for( var campo in that.options.validate.rules ){
							if(campo===sel.options.name)
								sel.setRequired();
						
						}
						
						results.push(sel.validate());
					}
					if($(this).data("switch")){
						var sel=$(this).data("switch");
						if(that.options.validate)
						for( var campo in that.options.validate.rules ){
							if(campo===sel.options.name)
								sel.setRequired();
						
						}
						
						results.push(sel.validate());
					}
				
			})
			
			for(var i=0,cant=results.length;i<cant;i++){
				if(results[i]==false)
					return false;
			}
			return true
		},
		validar:function(){
			
			var r=$(this.element).valid()
			if(this.validarComponentsVu()&&r){
				return true;
			}else
				return false
		
		},
		//funciones
		setValue:function(/*campo,valor*/){
			
			var text=arguments[1];
			
			$(this.element).find('input[name='+arguments[0]+']').each(function(){
					
					
					if($(this).data("switch")){
						var sel=$(this).data("switch");
						sel.setState(text);
						
					}else{
						if($(this).data("datepicker")){
							var sel=$(this).data("datepicker");
							sel.setDate(text);
						}else
						if($(this).data("select2")){
							var sel=$(this).data("select2");
							
							sel.setValue(text)
						}else{
						  if(!$(this).is("[type='radio']")&&!$(this).is("[type='checkbox']"))	
							$(this).val(text);
						}
					
					}
					//$(this.element).valid();
				
			})
			$(this.element).find("input[type='radio'][name='"+arguments[0]+"'][value='"+text+"']").prop('checked',true);
			$(this.element).find("input[type='checkbox'][name='"+arguments[0]+"']").prop('checked',text);
			$(this.element).find('select[name="'+arguments[0]+'"]').val(text);			
			$(this.element).find('textarea[name="'+arguments[0]+'"]').val(text);
			
		},
		setValues:function(){
			var result=arguments[0];
			var $this=this.element;		
					
					for( var campo in result ){
						
						
						$($this).find('input[name='+campo+']').each(function(){
							if($(this).data("switch")){
								var sel=$(this).data("switch");
								sel.setState(result[campo]);
							}else{
								if($(this).data("datepicker")){
									var sel=$(this).data("datepicker");
									sel.setRawValue(result[campo]);
									
									
								}else{
									if($(this).data("select2")){
										var select2 = $(this).data("select2");
										select2.setValue(result[campo])
												
									}else{
										if(!$(this).is("[type='radio']")&&!$(this).is("[type='checkbox']"))
											$(this).val(result[campo])
									}
								}
								
							}
							
						
						})
						
						
						$($this).find("input[type='radio'][name='"+campo+"'][value='"+result[campo]+"']").prop('checked',true);
						$($this).find("input[type='checkbox'][name='"+campo+"']").prop('checked',result[campo]);
						$($this).find('select[name="'+campo+'"]').val(result[campo]);
						$($this).find('textarea[name="'+campo+'"]').each(function(){
							
							$(this).val(result[campo]);
						})
					}
					
					$($this).valid();
		},
		getValue:function(name){
			return this.getFields(name);
		},
		reset:function(){
			$(this.element).find('input[type!="hidden"]').each(function(){
							if(!$(this).is("[type='submit']")&&!$(this).is("[type='cancel']")&&!$(this).is("[type='radio']"))
								if($(this).data("switch")){
									
									var sel=$(this).data("switch");
									sel.setState(sel.defaultvalue?sel.defaultvalue:false);
									sel.markValid();	
								}else{
									if($(this).data("select2")){
										var select2 = $(this).data("select2");
										select2.clear();
										select2.markValid();		
									}else{
										$(this).val('');
										
									}
								
								}
							$(this).removeClass('error');
                                                       
						
			})
			$(this.element).find("input[type='radio']").prop('checked', false);
			$(this.element).find("input[type='checkbox']").prop('checked',false);
			$(this.element).find('select').val('');
			$(this.element).find('textarea').each(function(){
				$(this).val('');
			})
		},
		clear:function(){
			$(this.element).find('input[type!="hidden"]').each(function(){
							if(!$(this).is("[type='submit']")&&!$(this).is("[type='cancel']")&&!$(this).is("[type='radio']")&&!$(this).is("[type='checkbox']"))
								if($(this).data("switch")){
									var sel=$(this).data("switch");
									sel.setState(sel.defaultvalue?sel.defaultvalue:false);
									
								}else{
									if($(this).data("select2")){
										var select2 = $(this).data("select2");
										select2.clear();
											
									}else{
										$(this).val('');
										
									}
								
								}
								
						
			})
			$(this.element).find("input[type='radio']").prop('checked', false);
			$(this.element).find("input[type='checkbox']").prop('checked',false);
			$(this.element).find('select').val('');
			$(this.element).find('textarea').each(function(){
				$(this).val('');
			})
		},
		submit:function(){
				var params=arguments[0]?arguments[0]:{};
				
				var funcProv=this.onSubmit?this.onSubmit:function(){};
				var suc,err;			
				if(params.success && typeof params.success=='function')
					suc=function(a){
						funcProv(a);
						params.success(a);
					}
                                else{
                                    suc=function(a){
						funcProv(a);
						
                                    }
                                }
				var funcProvE=this.onError?this.onError:function(){};
				if(params.error && typeof params.error=='function')
					err=function(a){
						funcProvE(a);
						params.error(a);
					}
				 else{
                                    err=function(a){
						funcProvE(a);
						
                                    }
                                 }
				suc=suc?suc:function(){};
				err=err?err:function(){};
				var url='';
                                if(params.url)
                                    url=params.url;
                                else
                                    url=this.options.url;
				var $this=this;
					if(this.validar()){
						var obj=this.getFields();
						var valores=new Object();
						
						for(var i=0,cant=obj.length;i<cant;i++){
							
							valores[obj[i].name]=obj[i].value;
							
						}
						if(params.data){
                                                    valores=$.extend(valores,params.data);
                                                }
						var html = $.ajax({ 
							type:'POST',
							data:valores,
							url: url, 
							async: false,
							success: suc,
							error: err
						}).responseText;
				
					}
		},
		onSubmit:function(){
		
		},
		onError:function(){
			
		},
		getFields:function(field){
					var $this=this.element;
					var that=this;
					
					if(field){
						
							return $($this).find('[name='+field+']').val();
						
						
					}else{
						var obj=new Array();
						
						$($this).find('input').each(function(){
							if(!$(this).is("[type='submit']")&&!$(this).is("[type='cancel']")){
								if($(this).is("[type='radio']")){
									
									if($(this).is(":checked")||$(this).get(0).checked){
											//console.info($(this))
											obj.push({name:$(this).attr('name'),value:$(this).val()});
									}
									
								}else{
									if($(this).is("[type='checkbox']")){
										if($(this).attr('name')!=undefined){
											if($(this).get(0).checked)
												obj.push({name:$(this).attr('name'),value:$(this).get(0).checked});
										}
									
									}else
										if($(this).attr('name')!=undefined)
											obj.push({name:$(this).attr('name'),value:$(this).val(),input:this});
								}
							}
							
						
						})
						
						$($this).find('textarea').each(function(){
							obj.push({name:$(this).attr('name'),value:$(this).val(),input:this});
						})
						
						$($this).find('select').each(function(){
							obj.push({name:$(this).attr('name'),value:$(this).val(),input:this});
						})
						var tables=this.collectData();
						if(tables){
							
							for( var campo in tables ){
								var field={};
								field.value=tables[campo];
								field.name=campo;
								obj.push(field);
							}
						
						}
							
						return obj;
					
					}
					
				
		},
		collectData:function(){
			/***  Integrar con VU GRID  ****/
			var data={};
			
			$(this.element).find('table[name]').each(function(){
				
				data[$(this).attr('name')]={};
				var rows=new Array();
				
				$(this).find('tbody tr').each(function(){
					var row={};
					var index=0;
					$(this).find('td').each(function(){
						index++;
						row['index'+index]=$(this).html();
					})
					rows.push(row);
				})
					var head={};
					var indexH=0;
					$(this).find('th').each(function(){
						indexH++;
						head['header'+indexH]=$(this).html();
					
					})
					
				
				data[$(this).attr('name')].rows=rows;
				data[$(this).attr('name')].header=head;
			})
			return data;
		},
		init:function(){
			this.prepareOpts();
			var $this=this.element;
			var that=this;
		
			this.prepareComponentsVu();
		
		},
		
		
	
	}
	
	
	
	$.fn.vuForm=function(option){
		if(typeof option==='string'&& option==='data'){
			return $(this).data('vuForm');
		}else
		$(this).each(function(){
			var $this=new VU.Components.Form(this,option);
			$(this).data('vuForm',$this)
		})
	
	
	}
 
 
 }(jQuery));
 
