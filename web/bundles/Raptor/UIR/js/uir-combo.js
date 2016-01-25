

(function($){
	UIR.namespace('UIR.Form');
	UIR.Form.Combo=function(el,options){
		this.options=options;
		this.element=el;
		this.init();
	
	}
	
	
	UIR.Form.Combo.prototype={
		constructor: UIR.Form.Combo,
		init:function(){
			var empty={};
			this.options=$.extend(empty,this.defaultOptions,this.options);
			
			var $element = $(this.element);
			this.loaded=false;
                        $element.hide();
                        this.input=$element;
                        this.button=$('<a id="drop4" class="dropdown-toggle btn" href="#" data-toggle="dropdown" ><span style="color:gray;margin-right:10px;">'+this.options.defaultText+'</span><b class="caret"></b></a>');
                        $element.after(this.button);
                        this.menu=$('<ul class="dropdown-menu uir-combo"><div class="loading" role="presentation"></div></ul>');
                        this.menu.css({
                            position:'absolute',
                            zIndex: 100000
                        });
                        this.$element=$element;
                        //this.menu.hide();
                        this.button.addClass(this.options.class)
                        $('body').append(this.menu);
                        this.menu.dropdown();
                        var me=this;
                        
                        $(window).resize(function(){ 
                            me.menu.hide();
                        });
                        $(document).mousedown(function(e){ 
                            
                            if (!(
							me.menu.is(e.target) ||
							me.button.find(e.target).length ||
							me.menu.is(e.target) ||
							me.menu.find(e.target).length
						)) {
							me.menu.hide();
						}
                        });
                        this.loading=false;
                        this.button.click(function(){
                            me.menu.css({
                                'left': $(this).offset().left,
                                'top': $(this).offset().top+$(this).height()+5,
                                'width':$(this).width()
                            });
                            me.menu.toggle();
                           if(me.loaded==false && me.loading==false){
                               me.makeLoad();
                           }
                        });
                        
                       this.input.change( function() { 
                            
                          });
                        this.data=[];
                       
                        this.dataCount=this.data.length;
                       
                        this.button.tooltip();
                        
                     // alert(this.container.height())
		},
                defaultOptions:{
			url: false,
			
                        data:[],
                        multi:false
		},        
                onLoadServer:function(data){
                        this.hideLoading();
                    
                        this.data=data;
                        this.reDraw();
                        this.$element.trigger('loaded');
                },
                makeLoad:function(url,opt,callback){
                    this.showLoading();
                    this.loading=true;
                    var me=this;
                    if(!url||url=='')
                        url=this.options.url;
                    
                    $.post(url, opt,function(data){
                        me.onLoadServer($.parseJSON(data));
                        me.loaded=true;
                        me.loading=false;
                        if(callback)
                            callback.call(me);
                    });
                },
                onSelectChange:function(e){
                    if(e.data.options.url){
                        e.data.makeLoad('',{size:e.data.pagingSelect.val(),page:1});
                    }else{
                        e.data.reDraw($(this).val());
                        e.data.updatePagination();
                    }
                },
                setRequired:function(){
                    this.button.addClass('uir-combo-error');
                    this.button.attr('data-original-title',this.options.invalid);
                },
                validate:function(){
                    if(this.input.is('[required]') && !this.input.val())
                        return false;
                    else
                        return true;
                },
		load:function(url,params){
			this.makeLoad(url,params);
		},
                reDraw:function(){
                    
                    this.menu.empty();
                    
                    var numpag=this.data.length;
                    for (var i = 0; i < numpag; ++i) {
                        this.add(this.data[i]);

                    }
                },
                onRowClick:function(e){
                    //if(e.data.options.multi==false||e.ctrlKey==false)
                    var span=e.data.button.find('span');
                    span.html($(this).html()).css('color','black');
                    e.data.menu.hide();
                    var value=$(this).parent("li").data('value');
                    var row=$(this).parent("li").data('row');
                    e.data.input.val(value);
                    e.data.input.data('data',row);
                    e.data.__on_select_row.call(e.data.__on_select_row_scope,$(this));
                    e.data.button.removeClass('uir-combo-error');
                    e.data.button.attr('data-original-title','');
                    e.data.$element.trigger('selected');
                },
                onSelect:function(fun,scope){
                    this.__on_select_row=fun;
                    this.__on_select_row_scope=scope;
                },
                __on_select_row:function(){
                    
                },
                onDeSelect:function(fun,scope){
                    this.__on_deselect_row=fun;
                    this.__on_deselect_row_scope=scope;
                },
                __on_deselect_row:function(){
                    
                },
		add:function(row){
                    var li=$('<li role="presentation"></li>');
                    var item=$('<a href="#" tabindex="-1" role="menuitem"></a>');
                    li.append(item);
                    this.menu.append(li);
                    item.click(this,this.onRowClick);
                    var cant=row.length;
                    var data=row;
                    var value;
                    if(row instanceof Object){
                       var me=this;
                       
                      
                            $.each(row, function(i, val) { 
                                
                                if(me.options.valueField===i){
                                    value=val;
                                }
                                if(me.options.displayField===i){
                                    item.html(val)
                                }
                                
                             });
                            
                       
                       
                    }
                    
                    
                    
                   li.data('row',data);
                   li.data('value',value);
                    
		
		},
                
                getSelected:function(){
                    var row=this.input.data('row');
                    
                        return row;
                    
                },
                setValue:function(value){
                    var me=this;
                    if(this.loaded==false && this.loading==false){
                        this.makeLoad('',{},function(){
                            this.setValue(value);
                        });
                        return;
                    }
                    this.menu.find('li').each(function(){
                        
                        if($(this).data('value')===value)
                            $(this).find('a').click();
                    });
                    this.$element.trigger('valued');
                },
                reset:function(){
                    var span=this.button.find('span');
                    span.html(this.options.defaultText).css('color','gray');
                    this.input.val(null);
                    this.input.data('data',null);
                    this.button.removeClass('uir-combo-error');
                    this.button.attr('data-original-title','');
                },
		
                showLoading:function(){
                       this.menu.find(".loading").show();
                },
                hideLoading:function(){
                       this.menu.find(".loading").hide();
                }
		 
	
	}
	
	
	$.fn.ComboUIR=function(options){
		if(typeof options==='string'&& options==='data'){
			return $(this).data('combo');
		}else
			$(this).each(function () {
				var sw=new UIR.Form.Combo(this,options);
				$(this).data('combo',sw)
			})
	
	}





})(jQuery);


