    //BEGIN GRID-TO-GRID OR TABLE-TO-TABLE
	VU.ns('VU.Components');
    VU.Components.vuGriToGrid = function(el, config){
        return this.init(el, config);
    }

    VU.Components.vuGriToGrid.prototype = {
        constructor: VU.Components.vuGriToGrid
        ,defaults: {
             gridConfig: {          //Config común para ambos grid
                 delegateSearch: false
                ,delegateButtonSearch: false
                ,columns: []        //Solo si fromSource == false, sino sobreescribe las existentes.
                ,pluginName: 'vuTable'
                ,getValuesFn: ''
             }
            ,firstConfig: {         //Config específica para el primer grid
                grid: ''            //Selector del grid
            }
            ,secondConfig: {        //Config específica para el segundo grid
                grid: ''            //Selector del grid
            }
            ,fromSource: true       //Establece que las tablas ya se encuentran pintadas
            ,btnAllToSecond: true   //True muestra el botón de pasar all para el segundo
            ,btnAllToFirst: true    //True muestra el botón de pasar all para el primero
            //si fromSource == false
            ,horizontal: true       //true posiciona los grid uno al lado del otro, false uno debajo del otro
            ,listeners: {}          //eventos suscritos inicialmente
        }
        ,settings: {}
        ,buttons: {}            //Objeto con los botones
        ,el: undefined          //Elemento del dom
        ,init: function(el, config){
            var obj = this;
            this.el = el;
            this.$el = $(el);
            this.initConfig(config);
            this.initFirst();
			this.initButtons();
            this.initSecond();
            
            this.initListeners();
            return this;
        }
        ,initConfig: function(config){
            config.gridConfig = $.extend({}, this.defaults.gridConfig, config.gridConfig? config.gridConfig : {});
            this.settings = $.extend({}, this.defaults, config, this.settings);
            this.settings.firstConfig = $.extend({}, this.settings.gridConfig, this.settings.firstConfig);
            this.settings.secondConfig = $.extend({}, this.settings.gridConfig, this.settings.secondConfig);
        }
        ,initFirst: function(){
            var config = this.settings.firstConfig;
			
            if(this.settings.fromSource){
                var plugin = this.getPluginFromConfig(config);
				
                if(plugin){
                    this.first = plugin;
                }
            }   //TODO Programar caso contrario
			else{
				var tableHTML=$('<table class="table table-bordered table-striped table-condensed vu-paginated-table"></table>');
				//TODO poner id y clase
				var header=$('<thead></thead>');
				var tr=$('<tr></tr>');
				header.append(tr);
				tr.append('<th style="width: 15px;" index="checkbox-selection"><input type="checkbox" value="all"></th>');
				for(var i=0,cant=this.settings.gridConfig.columns.length;i<cant;i++){
					var th=$('<th></th>');
					th.attr('index',this.settings.gridConfig.columns[i].index);
					th.width(this.settings.gridConfig.columns[i].width);
					var span=$('<span></span>');
					span.html(this.settings.gridConfig.columns[i].header);
					th.append(span)
					tr.append(th);
				
				}
				tableHTML.append(header);
				
				var body=$('<tbody><tr><td colspan="4"><span class="">No existen datos para mostrar.</span></td></tr></tbody>').appendTo(tableHTML);
				var foot=$('<tfoot><tr><th colspan="4"><div class="pagination pagination-small pagination-centered"><ul class="paginator-container">'+
						'<li><span><select style="" class="page-size"><option value="10">10</option><option value="20">20</option><option value="40">40</option>'+
						'<option value="60">60</option></select></span></li><li class="paginator-refresh"><span><i class="icon-refresh"></i></span></li>'+
						'<li class="paginator-begin disabled"><span index="0">← Primera</span></li><li class="paginator-before disabled"><span index="1">«</span></li>'+
						'<li class="paginator-next disabled"><span index="2">»</span></li><li class="paginator-end disabled"><span index="3">Última →</span></li>'+
						' </ul></div></th></tr></tfoot>').appendTo(tableHTML);
						
				var container=$('<div class="span"></div>');
				container.append(tableHTML);
						
				tableHTML.addClass('table table-bordered table-striped table-condensed vu-paginated-table');
				tableHTML.attr('id',config.id);
				tableHTML.attr('urlsource',config.url)
				config.grid='#'+config.id;
				$(this.el).append(container);
				
				
				this.first= new $.vuPaginatedTable(tableHTML, config);
			}
        }
        ,initSecond: function(){
            var config = this.settings.secondConfig;
            if(this.settings.fromSource){
                var plugin = this.getPluginFromConfig(config);
                if(plugin){
                    this.second = plugin;
                }
            }   //TODO Programar caso contrario
			else{
				var tableHTML=$('<table class="table table-bordered table-striped table-condensed vu-paginated-table"></table>');
				//TODO poner id y clase
				var header=$('<thead></thead>');
				var tr=$('<tr></tr>');
				header.append(tr);
				tr.append('<th style="width: 15px;" index="checkbox-selection"><input type="checkbox" value="all"></th>');
				for(var i=0,cant=this.settings.gridConfig.columns.length;i<cant;i++){
					var th=$('<th></th>');
					th.attr('index',this.settings.gridConfig.columns[i].index);
					th.width(this.settings.gridConfig.columns[i].width);
					var span=$('<span></span>');
					span.html(this.settings.gridConfig.columns[i].header);
					th.append(span)
					tr.append(th);
				
				}
				tableHTML.append(header);
				
				var body=$('<tbody><tr><td colspan="4"><span class="">No existen datos para mostrar.</span></td></tr></tbody>').appendTo(tableHTML);
				var foot=$('<tfoot><tr><th colspan="4"><div class="pagination pagination-small pagination-centered"><ul class="paginator-container">'+
						'<li><span><select style="" class="page-size"><option value="10">10</option><option value="20">20</option><option value="40">40</option>'+
						'<option value="60">60</option></select></span></li><li class="paginator-refresh"><span><i class="icon-refresh"></i></span></li>'+
						'<li class="paginator-begin disabled"><span index="0">← Primera</span></li><li class="paginator-before disabled"><span index="1">«</span></li>'+
						'<li class="paginator-next disabled"><span index="2">»</span></li><li class="paginator-end disabled"><span index="3">Última →</span></li>'+
						' </ul></div></th></tr></tfoot>').appendTo(tableHTML);
						
				var container=$('<div class="span"></div>');
				container.append(tableHTML);
						
				tableHTML.addClass('table table-bordered table-striped table-condensed vu-paginated-table');
				tableHTML.attr('id',config.id);
				tableHTML.attr('urlsource',config.url)
				config.grid='#'+config.id;
				$(this.el).append(container);
				
				
				this.second= new $.vuPaginatedTable(tableHTML, config);
			}
        }
        ,initButtons: function(){
            var obj = this;
            if(this.settings.fromSource){
               
            }//TODO Implementar caso contrario
			else{
				var container=$('<div class="span1 gridtogrid-btn-container"></div>');
				container.append('<button data-action="to-second" class="btn" ><i class="icon-angle-right"></i>>></button>');
				if(this.settings.btnAllToSecond)
					container.append('<button data-action="all-to-second" class="btn"><i class="icon-double-angle-right"></i>* >></button>');
				if(this.settings.btnAllToFirst)
					container.append(' <button data-action="all-to-first" class="btn"><i class="icon-double-angle-left"></i>* <<</button>');
				container.append('<button data-action="to-first" class="btn"><i class="icon-angle-left"></i><<</button>');
				
				$(this.el).append(container);
			}
			 var $btnContainer = this.$el.find('.gridtogrid-btn-container');
                this.buttons.toSecond = $btnContainer.find('[data-action="to-second"]');
                this.buttons.toFirst = $btnContainer.find('[data-action="to-first"]');
                this.buttons.allToSecond = $btnContainer.find('[data-action="all-to-second"]');
                this.buttons.allToFirst = $btnContainer.find('[data-action="all-to-first"]');

                this.buttons.toSecond.click(function(){
                    obj.addRows(obj.getFirstSelectionsValues(), obj.getFirst(), obj.getSecond(), 'to-second');
					obj.getFirst().unselectHeader();
                });

                this.buttons.toFirst.click(function(){
                    obj.addRows(obj.getSecondSelectionsValues(), obj.getSecond(), obj.getFirst(), 'to-first');
					obj.getSecond().unselectHeader();
                });

                this.buttons.allToSecond.click(function(){
                    obj.addRows(obj.getFirstValues(), obj.getFirst(), obj.getSecond(), 'to-second');
					obj.getFirst().unselectHeader();
                });

                this.buttons.allToFirst.click(function(){
                    obj.addRows(obj.getSecondValues(), obj.getSecond(), obj.getFirst(), 'to-first');
					obj.getSecond().unselectHeader();
                });
        }
        ,initListeners: function(){
            var listeners = this.settings.listeners;
            if(typeof listeners == 'object'){
                for(index in listeners){
                    this.$el.on(index, listeners[index]);
                }
            }
        }
        ,addRows: function(rows, first, second, direction){
            if(rows.length){
                var beforeEvt = $.Event('gridtogrid.beforeadd');
                this.$el.trigger(beforeEvt, [rows, first, second, direction]);
                if(!beforeEvt.isDefaultPrevented()){
                    this.fnInsertRows(second, rows);
                    this.fnRemoveRows(first, rows);
                    this.$el.trigger('gridtogrid.add', rows, first, second, direction)
                }
            }
        }
        ,getPluginFromConfig: function(config){
            var plugin = null;
            if(typeof config.grid == 'string'){
                plugin = $(config.grid).data(config.pluginName);
				
            }else if(typeof config.grid == 'object'){
                plugin = config.grid;
            }else{
                throw 'Problema de configuración.';
            }
            return plugin;
        }
        ,fnGetValues: function(plugin){
            return plugin.getAllValues();
        }
        ,fnGetSelectionsValues: function(plugin){
            console.debug(plugin.getRowSelected())
			var selected=plugin.getRowsChecked();
			if(selected.length==0)
				if(plugin.getRowSelected())
					selected.push(plugin.getRowSelected())
			return selected;
        }
        ,fnInsertRows: function(plugin, rows){
            plugin.insert(0,rows);
        }
        ,fnRemoveRows: function(plugin, rows){
            plugin.removeRows(rows);
        }
        //Funciones públicas
        ,getFirst: function(){
            return this.first;
        }
        ,getSecond: function(){
            return this.second;
        }
        ,getFirstSelectionsValues: function(){
            return this.fnGetSelectionsValues(this.first);
        }
        ,getSecondSelectionsValues: function(){
            return this.fnGetSelectionsValues(this.second);
        }
        /**
         * Retorna los valores de ambos grids
         *
         * @param boolean encode True codifica la respuesta a JSON
         * @return Object {first:[],second:[]}
         */
        ,getGridValues: function(encode){
            encode  = encode || false;
            var firstVals = this.getFirstValues();
            var secondVals = this.getSecondValues();
            var response = {
                first: firstVals
               ,second: secondVals
            };
            return encode? JSON.encode(response) : response;
        }
        ,getFirstValues: function(){
            return this.fnGetValues(this.first);
        }
        ,getSecondValues: function(){
            return this.fnGetValues(this.second);
        }
    };

    $.fn.vuGridToGrid = function(options) {
        if(this.length){
            var el = this[0]
                ,vuGridToGrid = $(el).data('vuGridToGrid');
            if (undefined == vuGridToGrid) {
                var plugin = new VU.Components.vuGriToGrid(el, options);
                $(el).data('vuGridToGrid', plugin);
                return plugin;
            }else{
                if(options && typeof options == 'string' && vuGridToGrid[options])
                    return vuGridToGrid[options]();
                return vuGridToGrid;
            }
        }
        return this;
    }
    //END GRID-TO-GRID OR TABLE-TO-TABLE

