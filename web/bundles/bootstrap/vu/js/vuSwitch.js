(function($){
	VU.namespace('VU.Components');
	VU.Components.Switch=function(el,options){
		this.options=options;
		this.element=el;
		this.init();
	
	}
	
	
	VU.Components.Switch.prototype={
		constructor:VU.Components.Switch,
		init:function(){
			
			this.options=$.extend(this.defaultOptions,this.options);
			
			var $element = $(this.element);
			if(this.options.name)
				$element.find('input').attr('name',this.options.name);
			else{
				if(!$element.find('input').attr('name'))
					console.info("El componente Switch debe tener un name");
				else
					this.options.name=$element.find('input').attr('name');
			}
				
			var color, $div
              , $switchLeft
              , $switchRight
              , $label
              , myClasses = ""
              , classes = $element.attr('class')
              , colorI
			   , colorD
              , moving
              , onLabel = this.options.labelOn
              , offLabel = this.options.labelOff
              , icon = false;
			  
			  if(this.options.typeOn)
				colorI="switch-"+this.options.typeOn;
			if(this.options.typeOff)
				colorD="switch-"+this.options.typeOff;
			  
			$element.addClass('has-switch');
			if ($element.data('on') !== undefined)
              colorI = "switch-" + $element.data('on');

            if ($element.data('on-label') !== undefined)
              onLabel = $element.data('on-label');

            if ($element.data('off-label') !== undefined)
              offLabel = $element.data('off-label');

            if ($element.data('icon') !== undefined)
              icon = $element.data('icon');
			  
			
            $switchLeft = $('<span>')
              .addClass("switch-left")
              .addClass(myClasses)
              .addClass(colorI)
              .html(onLabel);
			  
			
            if ($element.data('off') !== undefined)
              colorD = "switch-" + $element.data('off');

            $switchRight = $('<span>')
              .addClass("switch-right")
              .addClass(myClasses)
              .addClass(colorD)
              .html(offLabel);

            $label = $('<label>')
              .html("&nbsp;")
              .addClass(myClasses)
              .attr('for', $element.find('input').attr('id'));
		
			 if (icon) {
              $label.html('<i class="icon icon-' + icon + '"></i>');
            }

            $div = $element.find(':checkbox').wrap($('<div>')).parent().data('animated', false);

            if ($element.data('animated') !== false)
              $div.addClass('switch-animate').data('animated', true);

            $div
              .append($switchLeft)
              .append($label)
              .append($switchRight);

            $element.find('>div').addClass(
              $element.find('input').is(':checked') ? 'switch-on' : 'switch-off'
            );

            if ($element.find('input').is(':disabled'))
              $(this.element).addClass('deactivate');

            var changeStatus = function ($this) {
              $this.siblings('label').trigger('mousedown').trigger('mouseup').trigger('click');
			   
            };
			
			$switchLeft.on('click', function (e) {
              changeStatus($(this));
			 
            });

            $switchRight.on('click', function (e) {
              changeStatus($(this));
			  
            });
			
			$element.find('input').on('change', function (e, skipOnChange) {
              var $this = $(this)
                , $element = $this.parent()
                , thisState = $this.is(':checked')
                , state = $element.is('.switch-off');

              e.preventDefault();

              $element.css('left', '');

              if (state === thisState) {

                if (thisState)
                  $element.removeClass('switch-off').addClass('switch-on');
                else $element.removeClass('switch-on').addClass('switch-off');

                if ($element.data('animated') !== false)
                  $element.addClass("switch-animate");

                if (typeof skipOnChange === 'boolean' && skipOnChange)
                  return;

                $element.parent().trigger('switch-change', {'el': $this, 'value': thisState})
              }
            });
			
			$element.find('label').on('mousedown touchstart', function (e) {
              var $this = $(this);
              moving = false;

              e.preventDefault();
              e.stopImmediatePropagation();

              $this.closest('div').removeClass('switch-animate');

              if ($this.closest('.has-switch').is('.deactivate'))
                $this.unbind('click');
              else {
                

                $this.on('click touchend', function (e) {
                  var $this = $(this)
                    , $target = $(e.target)
                    , $myCheckBox = $target.siblings('input');

                  e.stopImmediatePropagation();
                  e.preventDefault();

                  $this.unbind('mouseleave');

                  if (moving)
                    $myCheckBox.prop('checked', !(parseInt($this.parent().css('left')) < -25));
                  else $myCheckBox.prop("checked", !$myCheckBox.is(":checked"));

                  moving = false;
                  $myCheckBox.trigger('change');
                });

                $this.on('mouseleave', function (e) {
                  var $this = $(this)
                    , $myCheckBox = $this.siblings('input');

                  e.preventDefault();
                  e.stopImmediatePropagation();

                  $this.unbind('mouseleave');
                  $this.trigger('mouseup');

                  $myCheckBox.prop('checked', !(parseInt($this.parent().css('left')) < -25)).trigger('change');
                });

                $this.on('mouseup', function (e) {
                  e.stopImmediatePropagation();
                  e.preventDefault();

                  $(this).unbind('mousemove');
                });
              }
            });
			if(this.options.required==true)
				this.required=true;
			this.messageInvalid();
			this.markValid();
			var that=this;
			$(this.element).find('input').change(function(){
				that.validate();
			
			})
			
		},
		defaultOptions:{
			labelOff:'OFF',
			labelOn:'On'
		
		},
		validate:function(){
			
			if(this.required==true){
				
				if(!this.status()){
					
					this.markInvalid();
					
					return false
				}else{
					this.markValid();
					
					return true
				}
			
			}else{
				this.markValid();
				return true
			}
		},
		
		setRequired:function(){
			this.required=true;
			
		},
		markInvalid:function(){
			this.invalidField=true;
			this.container.addClass('switch-error')
	
		},
		markValid:function(){
			this.invalidField=false;
			this.container.removeClass('switch-error')
		},
		messageInvalid:function(){
			this.msgInvalid=$('<div></div>');
			$('body').append(this.msgInvalid)
			this.msgInvalid.html('Este campo es requerido');
			this.msgInvalid.addClass('alert alert-error');
			
			var container=$(this.element);
			this.container=container;
			
			this.msgInvalid.hide();
			var that=this;
			this.container.hover(function(){
					if(that.invalidField==true){
						var offset=that.container.offset();
						that.msgInvalid.css({position:'absolute',left:offset.left,top:offset.top+that.container.height()+3});
						that.msgInvalid.fadeIn("slow");
					}
				},function(){
					
					that.msgInvalid.fadeOut("slow");
				
				})
	
	
		},
		
		
		 isActive: function () {
			return !$(this.element).hasClass('deactivate');
		  },
		  setActive: function (active) {
			if (active)
			  $(this.element).removeClass('deactivate');
			else $(this.element).addClass('deactivate');
		  },
		setState: function (value, skipOnChange) {
			$(this.element).find('input:checkbox').prop('checked', value).trigger('change', skipOnChange);
		},
		 toggleState: function (skipOnChange) {
			var $input = $(this.element).find('input:checkbox');
			$input.prop('checked', !$input.is(':checked')).trigger('change', skipOnChange);
		 },
		 status: function () {
			return $(this.element).find('input:checkbox').is(':checked');
		 },
		 destroy: function () {
        var $div = $(this.element).find('div')
          , $checkbox;

        $div.find(':not(input:checkbox)').remove();

        $checkbox = $div.children();
        $checkbox.unwrap().unwrap();

        $checkbox.unbind('change');

        return $checkbox;
      },
	
	}
	
	
	$.fn.vuSwitch=function(options){
		if(typeof options==='string'&& options==='data'){
			return $(this).data('switch');
		}else
			$(this).each(function () {
				var sw=new VU.Components.Switch(this,options);
				$(this).data('switch',sw);
				$(this).find('input').data('switch',sw);
			
			})
	
	}





})(jQuery);