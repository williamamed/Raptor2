

(function($){
	UIR.namespace('UIR.Form');
	UIR.Form.Spin=function(el,options){
		this.options=options;
		this.element=el;
		this.init();
	
	}
	
	
	UIR.Form.Spin.prototype={
		constructor: UIR.Form.Spin,
		init:function(){
			var empty={};
			this.options=$.extend(empty,this.defaultOptions,this.options);
			
			var $element = $(this.element);
			
                        this.input=$element;
                        
                        
                        this.container=$('<div class="input-append uir-spin" style="width:96%"></div>');
                        this.spin=$('<span class="add-on"></span>');
                        this.row1=$('<div class="controls controls-row"><i class="icon-chevron-up"></i></div>');
                        this.row2=$('<div class="controls controls-row"><i class="icon-chevron-down"></i></div>');
                        this.spin.append(this.row1);
                        this.row1.addClass('spin');
                        this.row2.addClass('spin');
                        this.spin.append(this.row2);
                        this.spin.css('height','33px');
                        this.spin.css('padding','0px');
                        $element.before(this.container);
                        this.container.append($element);
                        this.container.append(this.spin);
                        $element.addClass('uneditable-input');
                        //$element.attr('disabled','')
                        $element.keydown(function(e){
                            e.stopPropagation();
                            return false;
                        });
                        //$element.val(0);
                        this.row1.click(this,this.up);
                        this.row2.click(this,this.down);
		},
                defaultOptions:{
			url: false,
			step:1,
                        max:10000,
                        min:0
                        
		},
                up:function(e){
                    var current=0;
                    if(e.data.input.val())
                        current=parseInt(e.data.input.val());
                    if(current<e.data.options.max)
                        e.data.input.val(current+e.data.options.step);
                    e.data.input.keyup();
                    //e.data.input.focus();
                },
                down:function(e){
                    var current=0;
                    if(e.data.input.val())
                        current=parseInt(e.data.input.val());
                    if(current>e.data.options.min)
                        e.data.input.val(current-e.data.options.step);
                    e.data.input.keyup();
                    //e.data.input.focus();
                }        
               
               
	
	}
	
	
	$.fn.SpinUIR=function(options){
		if(typeof options==='string'&& options==='data'){
			return $(this).data('spin');
		}else
			$(this).each(function () {
				var sw=new UIR.Form.Spin(this,options);
				$(this).data('spin',sw)
			})
	
	}





})(jQuery);





