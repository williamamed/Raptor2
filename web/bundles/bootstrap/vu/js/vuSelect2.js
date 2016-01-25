(function($){

    if($.fn.select2 == undefined)
        return;
	
	/**
     * Compares equality of a and b
     * @param a
     * @param b
     */
    function equal(a, b) {
        if (a === b) return true;
        if (a === undefined || b === undefined) return false;
        if (a === null || b === null) return false;
        // Check whether 'a' or 'b' is a string (primitive or object).
        // The concatenation of an empty string (+'') converts its argument to a string's primitive.
        if (a.constructor === String) return a+'' === b+''; // a+'' - in case 'a' is a String object
        if (b.constructor === String) return b+'' === a+''; // b+'' - in case 'b' is a String object
        return false;
    }
	
	//Functions code here
	VU.namespace('VU.Components');
	
	window.Select2.class.abstract.prototype=$.extend(window.Select2.class.abstract.prototype,{
	   /* Metodo para preparar las opciones
		* Usado para activar el filtrado en la busqueda
		*
		*/
		prepararOpciones:function(){
					this.opts.populateResults=function(container, results, query) {
                    var populate,  data, result, children, id=this.opts.id;
					var self=this;
					
					
                    populate=function(results, container, depth) {

                        var i, l, result, selectable, disabled, compound, node, label, innerContainer, formatted;

                        results = self.opts.sortResults(results, container, query);
						
                        for (i = 0, l = results.length; i < l; i = i + 1) {

                            result=results[i];

                            disabled = (result.disabled === true);
                            selectable = (!disabled) && (id(result) !== undefined);

                            compound=result.children && result.children.length > 0;

                            node=$("<li></li>");
                            node.addClass("select2-results-dept-"+depth);
                            node.addClass("select2-result");
                            node.addClass(selectable ? "select2-result-selectable" : "select2-result-unselectable");
                            if (disabled) { node.addClass("select2-disabled"); }
                            if (compound) { node.addClass("select2-result-with-children"); }
                            node.addClass(self.opts.formatResultCssClass(result));

                            label=$(document.createElement("div"));
                            label.addClass("select2-result-label");

                            formatted=self.opts.formatResult(result, label, query, self.opts.escapeMarkup);
                            if (formatted!==undefined) {
                                label.html(formatted);
                            }

                            node.append(label);
							
                            if (compound) {

                                innerContainer=$("<ul></ul>");
                                innerContainer.addClass("select2-result-sub");
                                populate(result.children, innerContainer, depth+1);
                                node.append(innerContainer);
                            }

                            node.data("select2-data", result);
                            container.append(node);
                        }
						
						container.find('li').each(function(){
								
								if(($(this).find('span').html()==''||$(this).find('span').length==0)&&query.term!==''){
									$(this).remove();
								}
						
						})
						
                    };

                    populate(results, container, 0);
        }
            
			
			
	},
	/* Metodo que contiene la preparacion de las opciones original
	*  Usado para que se cargue una sola vez la lista de seleccion desde el servidor
	*
	*/
	
	prepare2: window.Select2.class.abstract.prototype.prepareOpts,
	
	/* Redefinicion de la preparacion de las opciones, añadiendo el codigo adicional de la preparacion
	*  Usado para que se cargue una sola vez la lista de seleccion desde el servidor
	*
	*/
	
	prepareOpts:function(opts){
		
		this.opts=this.prepare2(opts);
		
		this.prepararOpciones();
		
		
		return this.opts;
	},
	
	/* Metodo que contiene el codigo de inicializacion original del componente
	*/
	
	iniciar: window.Select2.class.abstract.prototype.init,
	
	/* Redefinicion de la inicializacion, se le añade el cierre de la lista de seleccion que viene por defecto abierta
	*  y el mecanismo de integracion con el formulario, la validacion independiente del componente
	*
	*/
	verificarDependencia:function(){
		var activate=true;
		
		for(var i=0,cant=this.dependencia.length;i<cant;i++){
			
			if(!this.dependencia[i].activated)
				 activate=false;
			
				
		}
		
		if(activate){
			this.enable();
			this.activated=true;			
			this.clean();
			this.clear();
		
		}else{
			this.activated=false;
			this.disable();
			this.clean();
			this.clear();
		}
	
	},
	init:function(option){
		this.iniciar(option);
		this.dropdown.hide();
		this.container.find('abbr').addClass('icon-chevron-down');
		var $this=this;
		$('body').click(function(e){
			$this.close();
			
			e.stopPropagation();
		})
		
		if(!this.opts.iconLoading)
			this.opts.iconLoading='../../img/ajax/ajax-loader.gif';
		if(this.opts.name)
			this.opts.element.attr('name',this.opts.name);
		else
			this.opts.name=this.opts.element.attr('name');
		
		this.query={};
		if(this.opts.depend){
			this.dependencia=new Array();
			this.activated=false;
			this.disable();
			this.clean();
			this.clear();
			
			if(typeof this.opts.depend=='object'){
				for(var i=0,cant=this.opts.depend.length;i<cant;i++){
					
					if($(this.opts.depend[i]).length>0&&$(this.opts.depend[i]).data('select2')){
						var that=this;
						(function(){
							var index=that.opts.depend[i];
							var sel=$(index).data('select2');
							//console.info(index,that.opts.name)
							
							sel.opts.element.change(function(){
								sel.activated=true;
								//that.activated=false;
								
								if(!sel.opts.element.val())
									sel.activated=false;
								
								that.disable();
								that.clean();
								that.clear();
								that.activated=false;
								that.opts.element.change();
								that.verificarDependencia();
							})
							
							that.dependencia.push(sel);
						
						})();
						
						
					}
				}
			
			}
			if(typeof this.opts.depend=='string'){
				
				if($(this.opts.depend).length>0&&$(this.opts.depend).data('select2')){
					var sel=$(this.opts.depend).data('select2');
					
					var that=this;
						sel.opts.element.change(function(){
							sel.activated=true;
								//that.activated=false;
								
								if(!sel.opts.element.val())
									sel.activated=false;
								that.disable();
								that.clean();
								that.clear();
								that.activated=false;
								that.opts.element.change();
								that.verificarDependencia();
						})
						this.dependencia.push(sel);
						
				}
			
			}
			
		
		}
		
			
			
		if(option.required==true)
			this.required=true;
		
		this.messageInvalid();
		this.markValid();
		var that=this;
		this.opts.element.change(function(e){
			
			if($(e.currentTarget).data('select2').isInterfaceEnabled())
				that.validate();
		})
		
		
	},
	
	setValue:function(data){
	
		if(typeof data!='object')
			this.data({id:data,text:data});
		else
			this.data(data);
		this.markValid();
		this.enable();
		
		this.activated=true;
		
	},
	markInvalid:function(){
		this.invalidField=true;
		this.container.addClass('select2-container-error')
	
	},
	markValid:function(){
		this.invalidField=false;
		this.container.removeClass('select2-container-error')
	},
	messageInvalid:function(){
		this.msgInvalid=$('<div></div>');
		$('body').append(this.msgInvalid)
		this.msgInvalid.html('Este campo es requerido');
		this.msgInvalid.addClass('alert alert-error');
		
		
		
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
	
	validate:function(){
		if(this.required==true){
			if(this.opts.element.val()===''){
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
	
	/* Redefinicion de la actualizacion de la lista de resultados
	*  Usado para que se cargue una sola vez la lista de seleccion desde el servidor
	*
	*/
	
	updateResults : function (initial) {
            var search = this.search,
                results = this.results,
                opts = this.opts,
                data,
                self = this,
                input,
                term = search.val(),
                lastTerm = $.data(this.container, "select2-last-term"),
                // sequence number used to drop out-of-order responses
                queryNumber;
			
            // prevent duplicate queries against the same term
            if (initial !== true && lastTerm && equal(term, lastTerm)) return;
			
            $.data(this.container, "select2-last-term", term);

            // if the search is currently hidden we do not alter the results
            if (initial !== true && (this.showSearchInput === false || !this.opened())) {
                return;
            }

            function postRender() {
                search.removeClass("select2-active");
                self.positionDropdown();
            }

            function render(html) {
                results.html(html);
                postRender();
            }

            queryNumber = ++this.queryCount;

            var maxSelSize = this.getMaximumSelectionSize();
            if (maxSelSize >=1) {
                data = this.data();
                if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, "formatSelectionTooBig")) {
                    render("<li class='select2-selection-limit'>" + opts.formatSelectionTooBig(maxSelSize) + "</li>");
                    return;
                }
            }

            if (search.val().length < opts.minimumInputLength) {
                if (checkFormatter(opts.formatInputTooShort, "formatInputTooShort")) {
                    render("<li class='select2-no-results'>" + opts.formatInputTooShort(search.val(), opts.minimumInputLength) + "</li>");
                } else {
                    render("");
                }
                if (initial && this.showSearch) this.showSearch(true);
                return;
            }

            if (opts.maximumInputLength && search.val().length > opts.maximumInputLength) {
                if (checkFormatter(opts.formatInputTooLong, "formatInputTooLong")) {
                    render("<li class='select2-no-results'>" + opts.formatInputTooLong(search.val(), opts.maximumInputLength) + "</li>");
                } else {
                    render("");
                }
                return;
            }

            if (opts.formatSearching && this.findHighlightableChoices().length === 0) {
                render("<li class='select2-searching'>" + opts.formatSearching() + "</li>");
            }

            search.addClass("select2-active");

            this.removeHighlight();

            // give the tokenizer a chance to pre-process the input
            input = this.tokenize();
            if (input != undefined && input != null) {
                search.val(input);
            }

            this.resultsPage = 1;
			/* Consulta para cargar los datos por Ajax*/
			if(!self.dataSelect)
			this.dropdown.find("input.select2-input").attr('disabled','disabled');
			//Agregado para poner el idicador de cargando
			if(!self.dataSelect){
			if(!self.imgLoading){
			self.imgLoading=$("<image style='margin-right:5px'/>");
			self.imgLoading.attr('src',opts.iconLoading);
			self.container.find('abbr').append(this.imgLoading);
			}
            self.inicioUnaVez=true;
			opts.query({
                element: opts.element,
                    term: search.val(),
                    page: this.resultsPage,
                    context: null,
                    matcher: opts.matcher,
                    callback: this.bind(function (data) {
                var def; // default choice
				self.imgLoading.remove();
                // ignore old responses
                if (queryNumber != this.queryCount) {
                  return;
                }

                // ignore a response if the select2 has been closed before it was received
                if (!this.opened()) {
                    this.search.removeClass("select2-active");
                    return;
                }

                // save context, if any
                this.context = (data.context===undefined) ? null : data.context;
                // create a default choice and prepend it to the list
                if (this.opts.createSearchChoice && search.val() !== "") {
                    def = this.opts.createSearchChoice.call(self, search.val(), data.results);
                    if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null) {
                        if ($(data.results).filter(
                            function () {
                                return equal(self.id(this), self.id(def));
                            }).length === 0) {
                            data.results.unshift(def);
                        }
                    }
                }

                if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, "formatNoMatches")) {
                    render("<li class='select2-no-results'>" + opts.formatNoMatches(search.val()) + "</li>");
                    return;
                }

                results.empty();
                self.opts.populateResults.call(this, results, data.results, {term: search.val(), page: this.resultsPage, context:null});
				self.dataSelect=data.results;
				
                if (data.more === true && checkFormatter(opts.formatLoadMore, "formatLoadMore")) {
                    results.append("<li class='select2-more-results'>" + self.opts.escapeMarkup(opts.formatLoadMore(this.resultsPage)) + "</li>");
                    window.setTimeout(function() { self.loadMoreIfNeeded(); }, 10);
				
                }

                this.postprocessResults(data, initial);

                postRender();
					
					
					self.dropdown.find("input.select2-input").removeAttr("disabled") 
					//console.debug(self.dropdown.find("input.select2-input"))
                this.opts.element.trigger({ type: "select2-loaded", items: data });
				
            })
			}
			);
			}else{
				// Aqui se carga local luego de haber cargado remoto ***** Ailin *****
				
				
					results.empty();
					self.opts.populateResults.call(this, results,self.dataSelect, {term: search.val(), page: this.resultsPage, context:null});
				
			
			}
			
    },
	
	/* Metodo para forzar la carga desde el servidor
	* Usado para la carga sincronizada
	*
	*/
	
	clean : function(){
       this.dataSelect=undefined;
    }
	
	
	})
	
	
	
  

    $.fn.vuSelect2 = $.fn.select2;

	$.fn.select2.defaults.formatSearching=function () { return "Buscando..."; };
	
	//Grupo de select
	
	VU.Components.GrupoSelect=function(el,options){
		this.options=options;
		this.element=el;
		this.init();
	
	}
	
	VU.Components.GrupoSelect.prototype={
		constructor:VU.Components.GrupoSelect,
		init:function(){
			var defaultOp={
			ajax: {
				dataType: "json",
			  
				
				results: function (data) {
							return {results: data};
				}
			}
		
			}	
			if(!this.options.ajax)
				throw "La propiedad ajax es requerida";
			
			this.options.ajax=$.extend(defaultOp.ajax,this.options.ajax);
			
			var $this=$(this.element);
			
			if(!$this.is('div'))
			throw "El marcado del elemento debe ser un div";
			var ops=$.extend({},this.options);
			
			if(!this.options.grupo)
			throw "La propiedad grupos es requerida";
			if(this.options.query)
			throw "Este componente no funciona con la propiedad query";
			if(!this.options.ajax.url)
			throw "La propiedad ajax.url es requerida";
			var sels=new Array();
			
			for(var i=0;i<ops.grupo.length;i++){
				if(!ops.grupo[i].input){
					var el=$('<input type="hidden" class="input-block-level" style="width:200px" placeholder="'+ops.grupo[i].name+'" name="'+ops.grupo[i].name+'"/>');
					
					if(ops.grupo[i].renderTo){
						el.appendTo(ops.grupo[i].renderTo);
						$('<br>').appendTo($(this.element));
					}else{
						
						el.appendTo($(this.element));
						
						$('<br>').appendTo($(this.element));
					}
				
				}
				var ops2=$.extend({},this.options);
				ops2.element=el;
				ops2.configSelect=ops.grupo[i];
				
				if(!ops.grupo[i].input){
					var sel=new window.Select2.class.single();
					sel.init(ops2);
				}else{
					
					var sel=$(ops.grupo[i].input).data('select2');
					sel.opts=$.extend(sel.opts,{configSelect:ops.grupo[i]});
					
				}
				
				sels.push(sel);
			}
			
			this.instanceList=sels;
			for(var i=0;i<sels.length;i++){
			 
				this.activarComponent(sels[i],sel);
			}
			this.disabledDepend();
			this.prepareDepend();
		},
		activarComponent:function (sel,sels){
			sel.activated=false;
			var that=this;
			sel.opts.element.change(function(){
					sel.activated=true;
					that.searchModeActivate(sel);
						
			})
			sel.instanceList=sels;
	
	
		},
		disabledDepend:function(){
			var dependientes=new Array();
			
			
			
			for(var i=0;i<this.instanceList.length;i++){
				
				if(this.instanceList[i].opts.configSelect.depend){
					dependientes.push(this.instanceList[i]);
					this.instanceList[i].disable();
				}
				if(this.instanceList[i].opts.configSelect.root==true){
					this.instanceList[i].opts.ajax.data=function(){return {root:true}}
				}
			}
			this.dependendientes=dependientes;
		
		},
		
		prepareDepend:function(){
			var dependientes=this.dependendientes;
			
			
			for(var i=0;i<dependientes.length;i++){
				var activate=true;
				var objData={};
				dependientes[i].consulta={};
				dependientes[i].instanceDependency=new Array();
				for(var j=0;j<dependientes[i].opts.configSelect.depend.length;j++){
					for(var k=0;k<this.instanceList.length;k++){
				
						if(this.instanceList[k].opts.name==dependientes[i].opts.configSelect.depend[j])
							dependientes[i].instanceDependency.push(this.instanceList[k]);
							
					}
				}
				
				
			}
		
		},
		
		searchModeActivate:function(sel){
			var dependientes=this.dependendientes;
			var posibles=new Array();
			for(var i=0;i<dependientes.length;i++){
				var dep=false;
				for(var j=0;j<dependientes[i].instanceDependency.length;j++){
				//	console.info(sel.opts.name,dependientes[i].instanceDependency[j])
					if(sel.opts.name===dependientes[i].instanceDependency[j].opts.name)
						dep=true;
				}
				if(dep){
					posibles.push(dependientes[i]);
					
				}
			}
			//console.info(posibles)
			for(var i=0;i<posibles.length;i++){
				var result=true;
				for(var j=0;j<posibles[i].instanceDependency.length;j++){
						if(posibles[i].instanceDependency[j].activated==false||!posibles[i].instanceDependency[j].val())
							result=false;
						else{
							if(posibles[i].instanceDependency[j].opts.element.select2('data'))
								posibles[i].consulta[posibles[i].instanceDependency[j].opts.configSelect.name]=posibles[i].instanceDependency[j].opts.element.select2('data').text;
						}
				}
				
				if(result==true){
						(function(){
						
						
						var data=eval(uneval(posibles[i].consulta));
						
						posibles[i].opts.ajax.data=function(){
							
							return data;
						}
						})()
						posibles[i].enable();
						
						posibles[i].clean();
						posibles[i].clear();
				}else{
						posibles[i].activated=false;
						posibles[i].disable();
						posibles[i].clean();
						posibles[i].clear();
				
				}
			}
			
			
		
		}
		
		
	
	
	}
	
	VU.Components.Grupo=function(el,options){
		this.options=options;
		this.element=el;
		this.init();
	
	}
	
	VU.Components.Grupo.prototype={
		constructor:VU.Components.Grupo,
		init:function(){
			var defaultOp={
			ajax: {
				dataType: "json",
			  
				
				results: function (data) {
							return {results: data};
				}
			}
		
			}	
			if(!this.options.ajax)
				throw "La propiedad ajax es requerida";
			
			this.options.ajax=$.extend(defaultOp.ajax,this.options.ajax);
			
			var $this=$(this.element);
			
			if(!$this.is('div'))
			throw "El marcado del elemento debe ser un div";
			var ops=$.extend({},this.options);
			
			if(!this.options.grupo)
				throw "La propiedad grupos es requerida";
			if(this.options.query)
				throw "Este componente no funciona con la propiedad query";
			if(!this.options.ajax.url)
				throw "La propiedad ajax.url es requerida";
			var sels=new Array();
			
			for(var i=0;i<ops.grupo.length;i++){
				if(!ops.grupo[i].input){
					var el=$('<input type="hidden" class="input-block-level" style="width:200px" placeholder="'+ops.grupo[i].name+'" name="'+ops.grupo[i].name+'"/>');
					
					if(ops.grupo[i].renderTo){
						el.appendTo(ops.grupo[i].renderTo);
						$('<br>').appendTo($(this.element));
					}else{
						
						el.appendTo($(this.element));
						
						$('<br>').appendTo($(this.element));
					}
				
				}
				var ops2=eval(uneval(this.options))
				ops2.element=el;
				ops2.configSelect=ops.grupo[i];
				
				if(ops.grupo[i].depend){
					ops2.depend=new Array();
					for(var j=0;j<ops.grupo[i].depend.length;j++){
						(function(){
							var index=ops.grupo[i].depend[j];
							ops2.depend.push('input[name="'+index+'"]');
						
						})();
						
						
						
						
					}
				}
					
				if(!ops.grupo[i].input){
					var sel=new window.Select2.class.single();
					sel.init(ops2);
				}else{
					
					var sel=$(ops.grupo[i].input).data('select2');
					sel.opts=$.extend(sel.opts,{configSelect:ops.grupo[i]});
					sel.init(sel.opts);
					
				}
				
				
				if(ops.grupo[i].root){
					sel.opts.ajax.data=function(){
								
								return {root:true};
					}
				}else{
				
					sel.opts.ajax.data=function(){
								
								return sel.query;
					}
				}
				sels.push(sel);
			}
			
		
		}
	
	}
	
	
	
	
	$.fn.vuGrupoSelect=function(option){
		this.each(function(){
			if(typeof options==='string'&& options==='data'){
			return $(this).data('grupoSelect');
		}else
			var grupo=new VU.Components.GrupoSelect(this,option);
			$(this).data('grupoSelect',grupo);
		
		})
		
	
	}
	
	
	
	
	

})(jQuery);
