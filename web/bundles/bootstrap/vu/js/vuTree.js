/* =============================================================
 * bootstrap-tree.js v0.3
 * http://twitter.github.com/cutterbl/Bootstrap-Tree
 * 
 * Inspired by Twitter Bootstrap, with credit to bits of code
 * from all over.
 * =============================================================
 * Copyright 2012 Cutters Crossing.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

!function ($) {

  "use strict"; // jshint ;_;

  var loading = "<img src='../tree/src/skin-vista/loading.gif' class='indicator' /> Loading ...";

  /* NODE CLASS DEFINITION
   * ========================= */

//Este es el constructor de la clase
VU.namespace('VU.Components');

  VU.Components.Node = function (parent,options,element) {
    
	if(element)
		this.element = $(element);
	this.parent=parent;
    this.options =options;
	this.init();
    
  }
 
  //Funciones de la clase, aÒadidas via prototype
  VU.Components.Node.prototype={
	init:function(){
		
		if(!this.element){
			this.element=$('<li></li>');
			//this.element.mouseup($.proxy(this.onDrop,this))
			//this.move(this.element,this.element);
			this.container=$('<span></span>');
			this.expander=$('<span></span>');
			this.checkbox=$('<span></span>');
			this.text=$('<span></span>');
			this.icon=$('<span></span>');
			
			this.container.attr('role','container');
			this.expander.attr('role','connec');
			this.checkbox.attr('role','check');
			this.text.attr('role','text');
			this.icon.attr('role','icon');
			
			this.container.addClass('tree-row');
			if(this.options.checkable){
				this.checkbox.addClass('tree-checkbox');
				
				if(this.options.check)
					this.checkbox.addClass('tree-checkbox-check');
				
			}else
				this.checkbox.addClass('tree-blanc');
			
			this.icon.addClass('icon');
			
			this.text.addClass('text');
			this.text.html(this.options.text);
			this.element.append(this.container);
			this.container.append(this.expander);
			this.container.append(this.checkbox);
			this.container.append(this.icon);
			this.container.append(this.text);
			
			
			
			if(!this.options.leaf){
			   if(this.options.children){
				   this.hasChildren=true;
				   this.expander.addClass('expander');
				   this.expander.attr('role','expand');
				   this.createChildren();
			   }else{
				   if(this.options.url){
					 this.url=this.options.url;
					 this.hasChildren=true;
					 this.loadUrl=true;
					 this.expander.addClass('expander');
					 this.expander.attr('role','expand');
				   }else{
						this.expander.addClass('tree-connec');
				   }
			   }
			}else{
				this.icon.addClass('tree-leaf');
				this.expander.addClass('tree-connec');
			
			}
			if(this.options.icon){
				//this.icon.css({'background-size':'100% 100%','background-image':'url('+this.options.icon+')'});
				this.icon.addClass(this.options.icon).removeClass('tree-leaf icon');
			}
			var that=this;
			this.expander.click(function(){that.onExpand.call(that)});
			this.element.data('tree-node',this);
			this.element.click(function(e){that.onSelect.call(that,e)})
		}

		if(!this.checkbox.hasClass('tree-blanc')){
			this.checkbox.click(function(){that.onCheck.call(that)})
		
		}
	},
	onSelect:function(e){
		this.parent.element.find('span').removeClass('node-tree-select');
		
		this.container.addClass('node-tree-select');
		e.stopPropagation();
	
	},
	
	showParent:function(){
		var parent=this.element.parent().parent().data('tree-node');
		this.element.show();
		
		if(parent){
			$(parent.element).data('hasFiltering',true)
			parent.showParent();
			
		}
	},
	onCheck:function(){
		this.checkbox.toggleClass('tree-checkbox-check');
		if(this.checkbox.hasClass('tree-checkbox-check')){
			this.check=true;
		}else{
			this.check=false;
		}
		
	},
	onExpand:function(){
		var $this=this;
		
		
		if(this.hasChildren){
			if(this.loadUrl){
				if(this.expander.hasClass('expander')){
					this.expander.addClass('tree-loading');
					$.ajax({
						type:'POST',
						data:this.options,
						url: this.options.url, 
						async: false,
						success: function(data){$this.onLoadData.call($this,data)},
						error: function(){$this.onLoadFail.call($this)}
						
					});
				
					
				}else{
					this.expander.removeClass('expander-open')
					this.expander.addClass('expander')
					this.treeChilds.slideUp();  
				}
			}else{
				if(this.expander.hasClass('expander')){
					this.treeChilds.slideDown(); 
					this.expander.removeClass('expander')
					this.expander.addClass('expander-open')
				}else{
					this.expander.removeClass('expander-open')
					this.expander.addClass('expander')
					this.treeChilds.slideUp(); 
				}
			}
		}
			
	},
	onLoadData:function(data){
		this.response=$.parseJSON(data);
		this.expander.removeClass('tree-loading');
		if(this.response&&this.response.length){
			this.createChildrenLoaded(this.response);
			this.treeChilds.slideToggle(); 
			this.expander.removeClass('expander')
			this.expander.addClass('expander-open')
			if(this.parent.isFiltering)
				this.parent.filterBy(this.parent.filter.val());
		}else{
			this.expander.removeClass('expander')
			this.expander.addClass('tree-blanc')
			this.hasChildren=false;
		}
	},
	onLoadFail:function(){
		this.expander.css('background-position','0px -112px')
	
	},
	addChild:function(element){
		if(this.treeChilds){
			this.treeChilds.append(element);
			this.hasChildren=true;
			if(this.expander.hasClass('expander')){
				this.expander.removeClass('expander-open');
			}else{
				this.expander.removeClass('expander');
			}
			
			console.log('new 2')
		}else{
			this.treeChilds=$('<ul></ul>');
			console.log('new ')
			 this.hasChildren=true;
			this.element.append(this.treeChilds);
			this.treeChilds.append(element);
			
				
				this.expander.addClass('expander');
			this.expander.removeClass('tree-connec tree-connecLast');
			 this.expander.attr('role','expand');
			//this.expander.click($.proxy(this.onExpand,this));
			
			this.treeChilds.hide();
			//this.treeChilds.find('li:last').find('.tree-connec').addClass('tree-connecLast');
			//this.treeChilds.find('li:last').children('span').addClass('tree-rowlast');
		}
			
	
	},
	createChildren:function(){
		var list=this.options.children;
		if(!this.treeChilds){
			this.treeChilds=$('<ul></ul>');
			this.element.append(this.treeChilds);
		}
		if(this.parent.options.order)
			this.orderBy(list,true);
		
		this.treeChilds.hide();
		for(var i=0,cant=list.length;i<cant;i++){
			var node=new VU.Components.Node(this.parent,list[i]);
			this.treeChilds.append(node.element.get(0));
		}
		//this.treeChilds.find('li:last-child').find('.tree-connec').addClass('tree-connecLast');
		//this.treeChilds.find('li:last-child').children('span').addClass('tree-rowlast');
		
	},
	get:function(attr){
		return this.options[attr];
	},
	createChildrenLoaded:function(result){
		var list=result;
		
		if(this.parent.options.order)
			this.orderBy(list,true);
		if(!this.treeChilds){
			this.treeChilds=$('<ul></ul>');
			this.element.append(this.treeChilds);
		}
		this.treeChilds.hide();
		for(var i=0,cant=list.length;i<cant;i++){
			var node=new VU.Components.Node(this.parent,list[i]);
			this.treeChilds.append(node.element.get(0));
		}
		//this.treeChilds.find('li:last-child').find('.tree-connec').addClass('tree-connecLast');
		//this.treeChilds.find('li:last-child').children('span').addClass('tree-rowlast');
		this.loadUrl=false;
		$(this.element).trigger('update');
		if(this.parent.options.dragDrop){
			this.parent.addDrops($(this.element).find('li').children('span'))
			this.parent.addDrags($(this.element).find('li').children('span'))
		}
	
	},
	orderBy:function(elementos, orden){
	    
		var $this=this;
	    elementos.sort(function(a, b) {
	       var compA = $this.omitirAcentos(a.text.toUpperCase());
	       var compB = $this.omitirAcentos(b.text.toUpperCase());
	       return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
	    })
	  
	},
	omitirAcentos:function(text) {
	    var acentos = "√¿¡ƒ¬»…À ÃÕœŒ“”÷‘Ÿ⁄‹€„‡·‰‚ËÈÎÍÏÌÔÓÚÛˆÙ˘˙¸˚—Ò«Á";
	    var original = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc";
	    for (var i=0; i<acentos.length; i++) {
	        text = text.replace(acentos.charAt(i), original.charAt(i));
	    }
	    return text;
	}
  
  }
  

  
   /* TREE CLASS DEFINITION
   * ========================= */
  
  VU.Components.Tree=function(options,el){
	this.element=el;
	this.options=options;
	this.init();
  }
  
 
   
  VU.Components.Tree.prototype={
	init:function(){
		$(this.element).addClass('tree');
		
		var root=$('<div></div>');
		root.height('10px');
		root.addClass('tree-root')
		root.attr('role','root')
		
		$(this.element).prepend(root);
		this.textPlaceHolder='Filtrar...';
		if(this.options.filterText)
			this.textPlaceHolder=this.options.filterText;
		if(this.options.data)
			this.createEstructure();
		if(this.options.filter){
			this.filter=$('<input type="text" class="input-block-level"  placeholder="'+this.textPlaceHolder+'" />');
			root.before(this.filter);
			this.filter.change($.proxy(this.onSelect,this))
		}
		
		
		if(this.options.dragDrop){
			if(this.options.dragable){
			
				this.addDrags($(this.element).find('li').children('span'))
				this.addDrags($(this.options.dragable))
				window.DragDrop.targets($(this.element).find('li').children('span'))
				$(this.element).find('li').children('span').on('drop',$.proxy(this.onDropFunction,this));
				$(this.element).find('li').children('span').on('drop',$.proxy(this.updateLines,this));
			}else{
				this.addDrags($(this.element).find('li').children('span'))
				window.DragDrop.targets($(this.element).find('li').children('span'))
				$(this.element).find('li').on('drop',$.proxy(this.onDropFunction,this));
			}
			this.addDrops(root);
			//this.addDrops($(this.element).find('.tree-node-sep'));
			if(this.options.dropable){
			
				window.DragDrop.targets($(this.options.dropable))
				$(this.options.dropable).on('drop',$.proxy(this.onDropFunction,this));
				
			}
			if(this.options.onDrop)
				this.onDrop=this.options.onDrop;
				
		}
	},
	
	addDrops:function(selector){
		window.DragDrop.targets(selector)
		selector.on('drop',$.proxy(this.onDropFunction,this));
		selector.on('drop',$.proxy(this.updateLines,this));
	},
	onDragItem:function(el){
		if(el.parent().data('tree-node'))
			return el.find('span[role="text"]').html();
		else{
			
			if(this.options.onDrag)
				return this.options.onDrag(el);
			else
				return "No onDrag function defined";
		}
	},
	addDrags:function(selector){
		var me=this;
		window.DragDrop.move(selector);
		window.DragDrop.on('drag',this.onDragItem,this);
		
		//$(that).find('span[role="text"]').html()
	},
	onSelect:function(){
		if(this.filter.val()){
			this.filterBy(this.filter.val())
			this.isFiltering=true;
		}else{
			$(this.element).find('li').show();
			this.isFiltering=false;
		}
	},
	filterBy:function(text){
		$(this.element).find('li').data('hasFiltering',false);
		$(this.element).find('li').each(function(){
			var node=$(this).data('tree-node');
			if(node.get('text').toUpperCase().indexOf(text.toUpperCase()) == -1&&$(this).data('hasFiltering')==false){
				$(this).hide();
				
			}else{
				$(this).show();
				node.showParent();
				
			}
		})
	
	},
	createEstructure:function(){
		var list=this.options.data;
		if(this.options.order)
			this.orderBy(list,true);
		for(var i=0,cant=list.length;i<cant;i++){
			if(!list[i].url)
				if(this.options.url)
					list[i].url=this.options.url;
			var node=new VU.Components.Node(this,list[i]);
			$(this.element).append(node.element);
			$(node.element).on('update',$.proxy(this.updateLines,this))
		}
		this.updateLines();
	
	},
	onDropFunction:function(e){
		if(e.target.attr('role')==='separator')
			var separ=true;
		else
			var separ=false;
			
		if(e.target.attr('role')==='root')
			var root=true;
		else
			var root=false;
		
		this.onDrop.call(this,e.source,e.target,e,separ,root);
		if(separ){
			e.target.remove();
		}
	},
	onDrop:function(source,target,e,sep,root){
			
			/*
			* Insertar dentro de un nodo, si los dos son nodos validos
			*/
			if(source.parent().data('tree-node')&&target.parent().data('tree-node')){
				var listaUl=target.next();
				if($(listaUl).is('ul')){
					var node=target.parent().data('tree-node');
					node.addChild(source.parent());
				}else{
					var node=target.parent().data('tree-node');
					node.addChild(source.parent());
					
					
				}
				
			}
			/*
			* Insertar despues de un nodo
			* Verifica si el drop se hizo en un separador, indicando que es despues y no dentro del nodo
			*/
			if(sep&&source.parent().data('tree-node')){
				var node=source.parent();
				var nodeT=target.prev();
				
				nodeT.after(node);
			}
			if(root&&source.parent().data('tree-node')){
				var node=source.parent();
				var nodeT=target.next();
				
				nodeT.before(node);
			}
			
			if(!source.parent().data('tree-node')&&root){
				this.createNode({text:source.html(),checkable:true},'after',target)
			}
			if(!source.parent().data('tree-node')&&sep){
				this.createNode({text:source.html(),checkable:true},'before',target)
				
			}
			if(!source.parent().data('tree-node')&&target.parent().data('tree-node')){
				
				var node=target.parent().data('tree-node');
				node.addChild(this.createNode({text:source.html(),checkable:true},'append',source.parent()));
				
			}
				
		},
		createNode:function(options,place,append){
			var node=new Node(this,options);
			
			if(place=='after'){
				$(append).after(node.element);
			}
			if(place=='before'){
				$(append).before(node.element);
			}
			if(place=='append'){
				$(append).append(node.element);
			}
			if(place=='prepend'){
				$(append).prepend(node.element);
			}
			$(node.element).on('update',$.proxy(this.updateLines,this))
			if(this.options.dragDrop){
				this.addDrags(node.element.children('span'));
				this.addDrops(node.element.children('span'));
			}
			
			return node.element;
	},
	updateLines:function(){
		
		this.element.find('span[role="connec"]').removeClass('tree-connecLast');
		this.element.find('span[role="container"]').removeClass('tree-rowlast');
		$(this.element).find('div[class="tree-node-sep"]').remove();
		this.element.find('li').removeClass('last-li');	
		this.element.find('ul').each(function(){
			if($(this).children().length==0){
				var node=$(this).parent().data('tree-node');
				node.hasChildren=false;
				node.expander.attr('role','connec');
				node.expander.removeClass('expander expander-open')
				node.expander.addClass('tree-connec')
				
			}
		
		})
		//this.element.find('li:last-child').('span[role="connec"]').addClass('tree-connecLast');
		this.element.find('li:last-child').each(function(){
			//console.info(this)
			$(this).removeClass('last-li');
			$(this).addClass('last-li');	
			
		})
		
		this.element.find('li:last-child').children('span[role="container"]').addClass('tree-rowlast').children('span[role="connec"]').addClass('tree-connecLast');
		
		$(this.element).find('li').after('<div class="tree-node-sep" role="separator"></div>');
		this.addDrops($(this.element).find('div[class="tree-node-sep"]'));	
		//this.element.find('li:last-child').addClass('last-li');	
		console.log('updateLines')
	},
	getChecked:function(){
		var checked=new Array();
		
		$(this.element).find('li').each(function(){
			if($(this).data('tree-node')){
				var node=$(this).data('tree-node');
				if(node.check)
					checked.push(node);
			}
		})
		return checked;
	
	},
	getSelected:function(){
		var selected;
		
		$(this.element).find('li:has(.node-tree-select)').each(function(){
			
			if($(this).data('tree-node')){
				var node=$(this).data('tree-node');
				selected=node;
			}
		})
		return selected;
	
	},
	orderBy:function(elementos, orden){
	    
		var $this=this;
	    elementos.sort(function(a, b) {
	       var compA = $this.omitirAcentos(a.text.toUpperCase());
	       var compB = $this.omitirAcentos(b.text.toUpperCase());
	       return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
	    })
	     
	},
	omitirAcentos:function(text) {
	    var acentos = "√¿¡ƒ¬»…À ÃÕœŒ“”÷‘Ÿ⁄‹€„‡·‰‚ËÈÎÍÏÌÔÓÚÛˆÙ˘˙¸˚—Ò«Á";
	    var original = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc";
	    for (var i=0; i<acentos.length; i++) {
	        text = text.replace(acentos.charAt(i), original.charAt(i));
	    }
	    return text;
	}
  
  
  }
  
  
  
  $.fn.vuTree=function(options){
	 var publicFunctions=['getSelected','getChecked']
	 if(typeof options=='object'){
		var t=new VU.Components.Tree(options,this);
		$(this).data('vuTree',t);
	}
	 if(typeof options=='string'){
		
		var tree=$(this).data('vuTree');
		if(publicFunctions.indexOf(options)>=0){
			return tree[options]();
			
		}else
			throw options+" no es una funcion publica valida";
	 }
		
  
  }
  
  var DragDrop=function(){
	this.init();
  }
  
  DragDrop.prototype={
	init:function(){
		this.moving=false;
		this.dropElement=undefined;
		this.dragElement=undefined;
		var $this=this;
		$('body').mouseup(function(e){
			$this.moving=false;
			if($this.item){
				$this.item.css({ opacity:1});
				$this.item.remove();
				$this.item.empty();
				
				if($this.dropElement){
					$($this.dropElement).trigger({
						type:'drop',
						source:$this.dragElement,
						target:$this.dropElement
					});
					$($this.dropElement).removeClass('drop-el')
					$this.dropElement=undefined;
					$this.dragElement=undefined;
					$this.item=undefined;
					
				}
			}
			
		})
		
		$('body').mousemove(function(e){
			if($this.moving){
				if($this.item){
					$this.item.css({ "position" : "absolute","left":e.pageX+30,"top":e.pageY-30})
						//console.debug(e.target)
					
				}
			}
		
		})
	},
	prepareEls:function(source,target){
		
	},
	targets:function(target){
		var $this=this;
		this.target=target;
		target.hover(function(e){
			if($this.moving){
				if($this.item&&$this.dragElement.get(0)!=this){
					$this.item.addClass('item-drop-green');
					$this.item.removeClass('item-drop-red');
					$this.item.css({'background':'green'});
					$this.dropElement=$(this);
					var data=$(this).data('tree-node');
					//if(data)
					//	$this.item.html(data.options.text)
						$(this).addClass('drop-el')
						
					
				}
			}
		
		},function(){
			if($this.moving){
				if($this.item){
					$this.item.addClass('item-drop-red');
					$this.item.removeClass('item-drop-green');
					$this.item.css({'background':'red'});
					$this.dropElement=undefined;
					//$this.item.html('')
					$(this).removeClass('drop-el')
				}
			}
		
		})
	},
	move:function(element){
		this.moving=false;
		
		var from={};
		
		var $this=this;
		
		
		element.mousedown(function(e){
			$this.moving=true;
			var that=this;
			setTimeout(function(){
				
				if($this.moving){
					if($this.item)
						$this.item.remove();
					$this.item=$('<div></div>');
					$this.item.addClass('item-drop-red');
					$this.item.css({'background':'red',height:20,position:'absolute'});
					
					from.x=e.pageX;
					from.y=e.pageY;
					$this.item.appendTo('body');
					
					var offset = $this.item.offset();
					from.sobX=from.x-offset.left;
					from.sobY=from.y-offset.top;
					$this.item.css({left:e.pageX+30,top:e.pageY-30});
					
						//$this.item.append($(that).clone())
					$this.dragElement=$(that);
					$this.item.html($this.onDrag($this.dragElement))
					//$this.item.html($(that).find('span[role="text"]').html())
					//console.info(that)
					//e.stopPropagation();
				}
			},1000)
			e.stopPropagation();
		})
		
		
		
		
	
	},
	on:function(e,fun,scope){
		if(e==='drag'){
			this.onDrag=function(el){
				return fun.call(scope,el);
			}
		}
	
	}
  
  }
  
  window.DragDrop=new DragDrop();
  
 
  //$('.branch').slideUp();
  


	

}(window.jQuery);