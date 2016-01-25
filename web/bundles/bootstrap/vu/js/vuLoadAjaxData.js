(function($){
VU.namespace('VU.Components');

VU.Components.TextValidator=function(el,options){
	this.element=el;
	this.options=options;
	this.init();

}

	VU.Components.TextValidator.prototype={
		constructor:VU.Components.TextValidator,
		init:function(){
			this.options=$.extend(this.defaultOpts,this.options);
			this.index=new Array();
			this.indexMap=new Array();
			var $this=this;
			$(this.element).change(function(){
				$this.onChange($this);
			});
		
		},
		defaultOpts:{
			url: '',
			run: true,
			params: [],
			targets: [],
			edited: false,
			onSuccess: function(){},
			onFailure: function(){}
		},
		joinRequest: function() {
            var $arr = [];
            var $index = 0;
            if (this.options.url != '') {
                $arr[$index++] = this.options.url
            }            
            for (var $i = 0; $i < this.options.targets.length; $i++) {
                if (this.options.targets[$i].url != undefined) {
                    $arr[$index++] = this.options.targets[$i].url;
                }
            }
            return $arr;
        },
		
		onChange:function($this){
			
			if($this.options.run){
                var $arrUrlJoined = $this.joinRequest();
                if($($this.element).val() != undefined){
                    for (var $i = 0; $i < $this.options.targets.length; $i++) {
                        $('#'+$this.options.targets[$i].id).attr('value', '');
                        $('#'+$this.options.targets[$i].id).html('');
                    }
    //                $target.attr('verified', false);
                    var verified = $($this.element).attr('verified');
                    if(verified != undefined)
                        $($this.element).attr('verified',false);
                    if($($this.element).val() != '' && $($this.element).valid())
                        for (var $i = 0; $i < $arrUrlJoined.length; $i++) {
                            var data = {};
                            var $targetValue = $($this.element).val();
                            $(data).attr($($this.element).attr('shortname')?$($this.element).attr('shortname'):'dato', $targetValue);
                            if($this.options.params != undefined)
                                $($this.options.params).each(function(){
                                    if(this.selector == undefined || this.name == undefined)
                                        return;
                                    var value = $(this.selector).val();
                                    if(value == undefined)
                                        return;
                                    $(data).attr(this.name, value);

                                });
                            if($($this.element.settings).attr('ajax')){
                                $($this.element).attr('ajax').abort();
                            }
                            $($this.element).addClass('loading-ajax');
							var index=$this.index.indexOf($targetValue);
							if(index<0)
                            var ajax = $.ajax({
                                data: data,
                                type: 'GET',
                                async: true,
                                dataType: 'json',
                                url: $arrUrlJoined[$i],
                                success: function ($response) {
									eval('$response='+$response)
									
                                    if($response.success === true && $($this.element).val() == $targetValue){
										
                                        $.each($response.datos, function ($key, $value) {
											
										   for (var $j = 0; $j < $this.options.targets.length; $j++) {
													
                                                if ($this.options.targets[$j].key == $key) {
													$this.indexMap.push($response);
													$this.index.push($targetValue);
                                                    $('#'+$this.options.targets[$j].id).attr('value', $value);
                                                    $('#'+$this.options.targets[$j].id).html($value);
                                                }
                                            }
                                        });
                                        $($this.element).attr('verified', true);
                                        $this.options.onSuccess($($this.element), $response);
                                        $($this.element).trigger('ajax.success', [$this.element, $response]);
										
                                    }else{
                                        $this.options.onFailure($($this.element), $response);
                                        $($this.element).trigger('ajax.failure', [$this.element, $response]);
                                        if($($this.element).is(':visible'))
                                        $($this.element).attr('verified', false);
                                    }
                                    $($this.element).valid();
                                    $($this.element).trigger('ajax.blur');
                                    $($this.element.settings).attr('ajax', false);
                                    $($this.element).removeClass('loading-ajax');
                                },
                                error: function(xhr, textStatus, errorThrown) {
                                   
									$($this.element).removeClass('loading-ajax');
                                    if(errorThrown != undefined && errorThrown != 'abort'){
                                        $($this.element).attr('verified', false);
										 
                                        $($this.element).trigger('ajax.failure', [$this.element], {msg: 'Error al contactar con el servidor.'});
                                        bootbox.alert('Ha ocurrido un error! ' + ( errorThrown ? errorThrown :xhr.status ), 'Aceptar');
                                        $($this.element.settings).attr('ajax', false);
                                    }
                                }
                            });
							else{
								var $response=$this.indexMap[index];
								if($response.success === true && $($this.element).val() == $targetValue){
										
                                        $.each($response.datos, function ($key, $value) {
											
										   for (var $j = 0; $j < $this.options.targets.length; $j++) {
													
                                                if ($this.options.targets[$j].key == $key) {
													
                                                    $('#'+$this.options.targets[$j].id).attr('value', $value);
                                                    $('#'+$this.options.targets[$j].id).html($value);
                                                }
                                            }
                                        });
                                        $($this.element).attr('verified', true);
                                        $this.options.onSuccess($($this.element), $response);
                                        $($this.element).trigger('ajax.success', [$this.element, $response]);
                                    }
									$($this.element).valid();
                                    $($this.element).trigger('ajax.blur');
                                    $($this.element.settings).attr('ajax', false);
                                    $($this.element).removeClass('loading-ajax');
							
							}
                            $($this.element.settings).attr('ajax', ajax);
                        }
                        else{
                                $($this.element).attr('verified', verified);
                        }
                    $this.element.edited = false;
                }
            }
		
		}
	
	}

	$.fn.vuLoadAjaxData = function ($options) {
		$(this).each(function () {
			var text=new VU.Components.TextValidator(this,$options);
			$(this).data('data',text);
		})
	
	}

})(jQuery)