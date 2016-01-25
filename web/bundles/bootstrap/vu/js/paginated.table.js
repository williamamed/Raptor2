//BEGIN: TABLE WITH PAGINATION
    $.vuPaginatedTable = function (table, conf){
        var settings = {
             id: ''
            ,urlSource: '' //Url donde se piden los datos
            ,autoload: true
            ,root: 'data'
            ,msgLoading: 'Cargando datos...' //TODO cambiar a una variable separado lo referente a todos los textos que necesiten traducirse
            ,msgNoDataLoaded: 'No existen datos para mostrar.'
            ,delegateSearch: '#Search' //Selector para el elemento encargado de buscar(poner contenedor con estructura y el input dentro se usa como elcampo de busqueda)
            ,delegateButtonSearch: '#idSearch'
            ,callBack: function(scope, modal){} //Se ejecuta al terminar la ejecucion
            ,style: '' //Estilos forzados a la tabla
            ,renderColumns: {} //Permite establecer mediante una funcion como se va a dibujar una columna determinada{index: 'indice de la col', render: function(valorColumna){//Funcion que debe retornar el html a dibujar}}
            ,renderRow: null   //Función para construir las filas, recibe el objeto completo por parámetro
            ,pButtonAction: function(){}
            ,paginator:{
                 el: undefined
                ,options:{
                     page: 1
                    ,showPages: 5
                    ,totalPages: undefined
                    ,total: undefined
                    ,pageSize: 5
                    ,pageInitial: undefined
                    ,pageFinal: undefined
                    ,showBar: true
                    ,barText: 'Mostrando'
                }
                ,params:{}
            }
        };
        
        if(typeof conf != 'object')
            return false;
        
        var  plugin = this
            ,$element = $(table);

        var paginatorConf = conf.paginator;
        if(paginatorConf){
            conf.paginator.options = $.extend({},settings.paginator.options, paginatorConf.options);
            conf.paginator = $.extend({},settings.paginator, paginatorConf);
        }
        plugin.settings = $.extend(settings, conf);
        
        plugin.init = function(){
            plugin.initPaginator();
            plugin.initHeader();
            plugin.settings.rowsContainer = $element.find('tbody');
//            plugin.settings.rowsContainer = $element.find('tbody > tr > table > tbody');
            if(plugin.settings.urlSource == undefined || plugin.settings.urlSource == ''){
                plugin.settings.urlSource = $element.attr('urlsource');
            }
            plugin.initSearch();
            if(plugin.settings.autoload)
                plugin.getAjaxData();
            
            plugin.settings.callBack(this);
//            plugin.removeAllRows();
        }

        //Acciones header
        plugin.initHeader = function(){
            settings.header = {};
            settings.header.container = $element.find('> thead');
//            settings.header.container = $element.find('tbody > tr > table > thead');
            var $header = settings.header.container;
            $header.find('tr th:first').each(function(){
                if($(this).attr('index') == 'checkbox-selection'){
                        settings.header.checkbox = $(this).find('input[type="checkbox"]').on('change', function(evt){
                        evt.stopPropagation();
                        var checked = $(this).is(':checked');
                        plugin.selectUnselectAll(checked);
                    });
                }
            });
            settings.header.columns = [];
            plugin.updateHeadersIndex();
        }

        plugin.updateHeadersIndex = function(){
            var newColumns = [];
            settings.header.container.find('tr th:not(:first)').each(function(){
                newColumns.push({name: $(this).attr('index'), element: $(this)});
            });
            settings.header.columns = newColumns;
            if(settings.paginator.el)
                settings.paginator.el.closest('th').attr('colspan', newColumns.length + 1);
            return plugin;
        }

        plugin.rebuildHeaders = function(headers, reload){
            if(typeof headers == 'object' && headers instanceof Array){
                var saveColumns = settings.header.columns;
                try{
                    var  columns = []
                        ,appendColumns = [];
                    var index = 0;
                    for(var i=0; i < headers.length; i++){
                        var el = headers[i];
                        var $col = $('<th><span></span></th>').attr('index', el.index || index++)
                                                              .find('span')
                                                              .html(el.text || '')
                                                              .end();
                        columns.push({name: el.index, element: $col});
                        appendColumns.push($col);
                    }
                    plugin.removeAllRows();
                    settings.header.container.find('tr th:not(:first)').remove();
                    settings.header.container.find('tr').append(appendColumns);
                    plugin.updateHeadersIndex();
                    settings.paginator.el.closest('th').attr('colspan', columns.length+1);
                    if(reload){
                        plugin.getAjaxData();
                    }
                }catch(ex){
                    settings.header.columns = saveColumns;
                }
            }
            return plugin;
        }

        plugin.initSearch = function(){
            if(plugin.settings.delegateSearch != undefined && plugin.settings.delegateSearch != ""){
                var $inputSearch = undefined;
                var $buttonSearch = undefined;
                if(typeof plugin.settings.delegateSearch == 'object'){
                    $inputSearch = plugin.settings.delegateSearch;
                }else{
                    $inputSearch = $(plugin.settings.delegateSearch);
                }
                if($inputSearch.length != 0){
                    if(plugin.settings.delegateButtonSearch != undefined 
                       && plugin.settings.delegateButtonSearch != "" ){
                            if(typeof plugin.settings.delegateButtonSearch == 'object'){
                                $buttonSearch = plugin.settings.delegateButtonSearch;
                            }else{
                                $buttonSearch = $(plugin.settings.delegateButtonSearch);
                            }
                            $buttonSearch.click(function(){
                                if($inputSearch.val() != "" && $inputSearch.val() !== undefined ){
                                    plugin.getAjaxData(1);
                                }        
                            })
                       }
                    $inputSearch.keyup(function(){
                        var searchVal = $inputSearch.val();
                        var name = $inputSearch.attr('name')?$inputSearch.attr('name'): 'search';

                        if(searchVal == "" && plugin.getPaginatorParams().search != undefined){
                            plugin.getPaginatorParams()[name] = undefined;
                            plugin.getAjaxData(1);
                        }else if(searchVal != ""){
                            plugin.getPaginatorParams()[name] = searchVal;
                        }
                    })

                    $inputSearch.keypress(function(e){
                        if(e.which == 13 ){
                            e.preventDefault();
                            if($inputSearch.val() != "")
                                plugin.getAjaxData(1);
                        }
                    });
                    
                    //Por si inicialmente el campo de busqueda tiene datos.
                    $inputSearch.trigger('keyup');
                }    
            }
            
        }

        //Acciones para paginador
        plugin.initPaginator = function(){
            var $paginator = $element.find('.paginator-container');
            if($paginator.length != 0){
                plugin.settings.paginator.el = $paginator;
                if(!plugin.settings.paginator.options.showBar)
                    $paginator.find('.progress').closest('li').remove();
                plugin.settings.paginator.options.pageSize = $paginator.find('select.page-size').val();
                plugin.initPaginatorEvents($paginator);
                plugin.updatePaginator();
                
//                $paginator.find('li.item-page').remove();
//                var options = plugin.settings.paginator.options;
//                options.page = 1000;
            }else{
                plugin.settings.paginator.options.pageSize = undefined;
                plugin.settings.paginator.options.page = undefined;
            }
        }
        
        plugin.initPaginatorEvents = function($paginatorContainer){
            $paginatorContainer.find('li > a').click(function(evt){
                evt.preventDefault();
            });
            var $pageSize = $paginatorContainer.find('select.page-size');
            $pageSize.on('change', function(evt){
                plugin.changePaginatorSize($(evt.target).val());
            });
            var $next = $paginatorContainer.find('.paginator-next');
            $next.click(function(){
                plugin.getAjaxData(Math.min((plugin.settings.paginator.options.page + 1), plugin.settings.paginator.options.totalPages));
            });
            var $refresh = $paginatorContainer.find('.paginator-refresh');
            $refresh.click(function(){
                plugin.getAjaxData();
            });
        }

        plugin.setPaginatorParams = function(params){
            if(typeof params == 'object'){
                plugin.settings.paginator.params = params;
            }
            return plugin;
        }

        plugin.getPaginatorParams = function(){
           return plugin.settings.paginator.params; 
        }

        plugin.mergePaginatorParams = function(params){
           plugin.settings.paginator.params = $.extend({},plugin.settings.paginator.params, params); 
        }

        plugin.countPaginatorParams = function(){
            if (!Object.keys) {
                Object.keys = function (obj) {
                    var keys = [],
                        k;
                    for (k in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, k)) {
                            keys.push(k);
                        }
                    }
                    return keys;
                };
            }
           return Object.keys(plugin.settings.paginator.params).length; 
        }
        
        plugin.clearPaginatorParams = function(){
           plugin.settings.paginator.params = {}; 
        }

        /**
         * Actualiza el paginador con las paginas que deben estar visibles de acuerdo
         * a la pagina actual
         * @param options (no requerido) Si se pasa options se actualiza el objeto paginatorOptions
         * con los valores que sean pasados.{
         *
         *                                  }
         */
        plugin.updatePaginator = function(options){
            if(options && typeof options == 'object'){
                plugin.updatePaginatorObject(options);
            }
            //Actualizar los elementos del paginator
            plugin.updatePagesPaginator();
        }

        /**
         * Actualiza el objeto del paginado con los nuevos valores que le sean
         * pasados por parametros
         */
        plugin.updatePaginatorObject = function(options){
            var pagOpts = plugin.settings.paginator.options;
            if(!isNaN(options.total)){
                pagOpts.total = options.total;
            }
            if(options.page){
                pagOpts.page = options.page;
            }
            if(options.pageSize){
                pagOpts.pageSize = options.pageSize;
            }
            var totalPages = pagOpts.total / pagOpts.pageSize;
            if(pagOpts.total % pagOpts.pageSize != 0){
                totalPages++;
            }

            pagOpts.totalPages = totalPages;
            plugin.settings.paginator.options = pagOpts;
        }

        /**
         * Cambia el tamanno de pagina para el paginado, por lo que actualiza la
         * tabla con la cantidad de datos nueva y comienza por la pagina 1.
         */
        plugin.changePaginatorSize = function(pageSize){
            plugin.settings.paginator.options.pageSize = pageSize;
            plugin.settings.paginator.options.page = 1;
//                plugin.updatePagesPaginator(1);
//                plugin.updateBarPaginator();
            plugin.getAjaxData(1);
        }

        plugin.updatePagesPaginator = function(pInicial, pFinal){
            var $paginator = plugin.settings.paginator.el;
            if(!$paginator)
                return plugin;
            var options = plugin.settings.paginator.options;
            $paginator.find('li.item-page').remove();
            var $reference = $paginator.find('.paginator-before');
            if(!pInicial && !pFinal && options.pageInitial!= undefined && options.pageFinal!=undefined){
                if( options.pageFinal - options.pageInitial + 1 != options.pageSize
                    && options.pageFinal - options.pageInitial + 1 == options.totalPages){
                    pagInicial = options.pageInitial;
                    pagFinal = options.pageFinal;
                }else{
                    if(options.pageFinal > options.totalPages){
                        pagFinal = options.pageFinal = Math.max(options.totalPages, 1);
                        pagInicial = Math.max(1, pagFinal - options.showPages);
                        options.page = pagFinal;
                    }else{
                        pagInicial = options.pageInitial;
                        if(options.totalPages <= options.pageFinal){
                            pagFinal = Math.max(options.totalPages, 1);
                        }else{
                            pagFinal = options.pageFinal;
                        }
                    }
                }
            }else{
                var pagInicial = undefined;
                var pagFinal = undefined;
                if(pInicial){
                    pInicial = Math.max(1, pInicial);
                    if((options.totalPages - pInicial + 1) >= options.showPages){
                        pagInicial = pInicial;
                        pagFinal = pInicial + options.showPages -1;
                    }else{
                        pagFinal = Math.max(options.totalPages, 1);
                        if(pagFinal-(options.showPages-1) > 0){
                            pagInicial = pagFinal-(options.showPages-1);
                        }else{
                            pagInicial = 1;
                        }
                    }
                }else if(pFinal){
                    pFinal = Math.min(options.totalPages, pFinal);


                    if((pFinal - (options.showPages-1)) >= 1){
                        pagFinal = pFinal;
                        pagInicial = pagFinal - (options.showPages -1);
                    }else{
                        pagInicial = 1;
                        if(pagInicial+(options.showPages-1) <= options.totalPages){
                            pagFinal = pagInicial+(options.showPages-1);
                        }else{
                            pagFinal = options.totalPages;
                        }
                    }
                }
                else{
                    pagInicial = 1;
                    if(pagInicial+ (options.showPages-1) <= options.totalPages){
                        pagFinal = pagInicial + (options.showPages-1);
                    }else{
                        pagFinal = options.totalPages;
                    }
                }
                options.pageInitial = pagInicial;
                options.pageFinal = pagFinal;
            }
            for(var i = pagInicial; i<= pagFinal; i++){

                var clases = 'item-page';
                if(i == options.page){
                    clases+=' page-active';
                }
                var item = $('<li page="'+i+'" class="'+clases+'"><span >'+i+'</span></li>')
                    .click(function(){
                        if(plugin.settings.ajaxObj)
                            return;
                        plugin.getAjaxData(parseInt($(this).attr('page')));
                        $paginator.find('li.page-active').removeClass('page-active');
                        $(this).addClass('page-active');
                    });
                $reference.after(item);
                $reference = item;
            }

            //Se actualizan los botones siguiente y anterior ademas de fin e inicio
            var $beginBefore = $paginator.find('.paginator-begin, .paginator-before');

            if(options.page == 1){

                $beginBefore.addClass('disabled')
                    .unbind('click');
            }else{
                if($beginBefore.hasClass('disabled')){
                    $beginBefore.filter('.paginator-begin')
                        .removeClass('disabled')
                        .click(function(){
                            plugin.getAjaxData(1);
                        });
                    $beginBefore.filter('.paginator-before')
                        .removeClass('disabled')
                        .click(function(){
                            plugin.getAjaxData(options.page - 1);
                        });
                }
            }

            var $endNext = $paginator.find('.paginator-end, .paginator-next')
                .unbind('click');

            if(options.page == options.totalPages || options.totalPages == 0 || options.totalPages == 1){
                $endNext.addClass('disabled');
            }else{
                $endNext.filter('.paginator-end')
                    .click(function(){
                        plugin.getAjaxData(options.totalPages);
                    });
                $endNext.filter('.paginator-next')
                    .click(function(){
                        plugin.getAjaxData(options.page + 1);
                    });
                if($endNext.hasClass('disabled')){
                    $endNext.removeClass('disabled');

                }
            }
            if(options.showBar)
                setTimeout(plugin.updateBarPaginator, 100);
            return plugin;
        };

        plugin.updateBarPaginator = function(){
            var $paginator = plugin.settings.paginator.el;
            var options = plugin.settings.paginator.options;
            var $progress = $paginator.find('.progress .bar');
            var primero = options.total != 0 ? (options.page - 1) * options.pageSize + 1 : 0;
            var totalCargados = 0;
            if(options.pageSize < 0){
                totalCargados = options.total;
            }else{
                totalCargados = Math.min(options.page * options.pageSize, options.total);
            }
            var percent = options.total != 0 ? totalCargados * 100 / options.total : 0;
            $progress.css({width: percent+'%'});
            var text = '';
            if(!isNaN(options.total)){

                text = options.barText+' '+primero+' - '+totalCargados+' / '+options.total;
            }else{
                text = options.barText+' 0 - 0 / 0 ';
            }
            $paginator.find('.progress-text-infront, .progress-text-behind')
                .html(text);

        };

        //Acciones para la carga de datos
        /**
         * Obtiene datos por ajax mediante el uso del paginado y filtro aplicado
         */
        plugin.getAjaxData = function(page, params){
            if(plugin.settings.ajaxObj){
                return;
//                plugin.settings.ajaxObj.abort();
            }
            var options = plugin.settings.paginator.options;
            if(page > options.totalPages){
                page = Math.max(options.totalPages, 1);
            }else if(page < 1){
                page = 1;
            }
            var data = {};
            data.page = (page != undefined)?page : options.page;
            data.pageSize = options.pageSize;
            data = $.extend({}, params, data, plugin.settings.paginator.params);
            //Mostrar el cargando ...
            plugin.showLoading();
            plugin.settings.ajaxObj = $.ajax({
                 url: plugin.settings.urlSource
                ,data: data
                ,method: 'GET'
                ,async: true
                ,dataType: 'JSON'
                ,success: function(response){
                    if(response.success){
                        plugin.settings.paginator.options.total = response.total;
                        var totalPages = parseInt(response.total / plugin.settings.paginator.options.pageSize);
                        if(response.total % plugin.settings.paginator.options.pageSize > 0){
                            totalPages++;
                        }
                        plugin.settings.paginator.options.totalPages = parseInt(totalPages);
                        
                        plugin.removeAllRows();
                        var root = plugin.settings.root;
						
                        if(response[root].length != 0){
                            $(response[root]).each(function(obj, val){
                                var row = plugin.getRowBuilder().call(plugin, val);
                                plugin.appendRow(row, val);
                            });
                            $element.trigger('data.loaded', [response[root]]);
                        }else{
                            var row = plugin.buildNoDataRow();
                            plugin.appendRow(row, null);
                        }
                        
                        //Cambiar
                        if(page){
                            options.page=page;
                        }
                        if((page && page == options.pageInitial && options.pageInitial != 1) 
                            || page && page > options.pageFinal){
                            plugin.updatePagesPaginator(undefined, page);
//                            setTimeout(plugin.updatePagesPaginator, 100, undefined, page);
                        }else if((page && page == options.pageFinal && options.pageFinal != options.totalPages) 
                                  || page == 1 || page < options.pageInitial){
                            plugin.updatePagesPaginator(page);
//                            setTimeout(plugin.updatePagesPaginator, 100, page);
                        }else {
                            plugin.updatePagesPaginator();
//                            setTimeout(plugin.updatePagesPaginator, 100);
                        }
                        
//                        plugin.updateBarPaginator();
                        
                    }else{
//                        alert('Success false');
                    }
                    //Ocultar el cargando...
                     plugin.bindSelectionTrigger();
                     plugin.hideLoading();
                     plugin.settings.ajaxObj = null;
                }
                ,error: function(obj){
                    //Ocultar el cargando...
                    plugin.hideLoading();
                    plugin.settings.ajaxObj = null;
                }
                
            });
        }
        
        /**
         * Actualiza los datos de la tabla haciendo uso de los datos de paginado
         * y ordenamiento actuales
         */
        plugin.updateTable = function(){
            plugin.getAjaxData();
        }
        


        plugin.getRowBuilder = function(){
            if(plugin.settings.renderRow){
                return plugin.settings.renderRow;
            }
            return plugin.buildRow;
        }
        
        /**
         * Construye una fila determinada de acuerdo a los datos pasados y le 
         * agrega los eventos correspondientes.
         */
        plugin.buildRow = function(data, type){
            type = type || '';
            var row = $('<tr></tr>').addClass(type);
            var columns = settings.header.columns;
			
            $('<td><input class="checkbox-row-selector" type="checkbox" name="id"/></td>')
             .find('input')
             .attr('value', data[settings.idIndex])
             .click(function(evt){
                 evt.stopPropagation();
             })
             .change(function(){
                 plugin.bindSelectionTrigger();
                 plugin.toggleSelectionRow(row, $(this).attr('checked'));
             })
             .end()
             .appendTo(row);
            for (var col in columns){
                var renderFunction = plugin.getRenderFunction(columns[col]['name']);
                if(!renderFunction){
                    $('<td></td>').appendTo(row).html(data[columns[col]['name']]);
                }else{
                    $('<td></td>').append($(renderFunction.call(plugin, data[columns[col]['name']], data)))
                                  .appendTo(row);
                }
            }
            row.data('row', data).click(function(evt){
                //evt.stopPropagation();
                evt.preventDefault();
                var $checkbox = $(this).find('input.checkbox-row-selector[type="checkbox"]');
                if(!evt.ctrlKey)
                    plugin.selectUnselectAll(false);
                $checkbox.attr('checked', $checkbox.attr('checked')? false : 'checked')
                         .trigger('change');
				plugin.unselectHeader();
//                plugin.selectRow()  //Aqui
            });
            return row;
        }
        
        plugin.getRenderFunction = function(index){
            if(plugin.settings.renderColumns[index]){
                return plugin.settings.renderColumns[index];
            }
            return false;
        }
        
        plugin.bindSelectionTrigger = function(){
            $element.trigger('selection.change', [plugin.getRowsChecked()]);
        }

        plugin.toggleSelectionRow = function ($row, checked){
            if(checked){
                $row.addClass('info')
            }else{
                $row.removeClass('info');
            }
        }
        
        /**
         * Construye una fila con el texto configurado de no resultados.
         * @param row String Texto a mostrar
         */
        plugin.buildNoDataRow = function(text){
            return $('<tr><td colspan="'+(plugin.settings.header.columns.length + 1)+'"><span class="">'+plugin.settings.msgNoDataLoaded+'</span></td></tr>');
        }

        /**
         * Retorna todas la filas
         */
        plugin.getAllRows = function(){
            return settings.rowsContainer.children('tr');
        }
        /**
         * Retorna los valores de todas la filas
         */
        plugin.getAllValues = function(){
            return settings.rowsContainer.children('tr').map(function(){
                return $(this).data('row');
            });
        }


        /**
         * Retorna la fila de una posición
         * @param pos Integer Índice de la fila
         */
        plugin.getRowAt= function(pos){
            return $(settings.rowsContainer.children('tr')[pos]);
        }

        /**
         * Elimina todas las filas cargadas.
         */
        plugin.removeAllRows = function(){
            settings.rowsContainer.children('tr').remove();
        }

        /**
         * Elimina una fila determinada de acuerdo al index de la misma.
         * @param pos Indice a eliminar
         */
        plugin.removeRowAt = function(pos){
            var  rows = settings.rowsContainer.children()
                ,row = rows[pos];
            if (row){
                row.remove();
                $element.trigger('row.removed', [row, $(row).data('row')]);
            }
            return plugin;
        }

        /**
         * Adiciona una fila determinada al final de la tabla.
         * @param row Fila
         * @param data Datos asociados
         * @returns plugin
         */
        plugin.appendRow = function(row){
            settings.rowsContainer.append(row);
            $element.trigger('row.appended', [row, row.data('row')]);
            return plugin;
        }

        /**
         * Adiciona un arreglo de filas al final de la tabla.
         * @param rows Array Contiene objetos {row: fila, data:datos}
         */
        plugin.appendRows = function(rows){
            var lastPos = this.rowsContainer.children('tr').length -1;
            for(var i=0; i<rows.length; i++){
                plugin.insertRow(lastPos++, rows[i]);
            }
            $element.trigger('rows.appended', [rows]);
            return plugin;
        }

        /**
         * Adiciona una fila determinada al inicio de la tabla.
         */
        plugin.prependRow = function(row){
            settings.rowsContainer.prepend(row);
            $element.trigger('row.appended', [row, row.data('row')]);
            return plugin;
        }

        /**
         * Adiciona un arreglo de filas al inicio de la tabla.
         * @param Array Contiene objetos {row: fila, data:datos}
         */
        plugin.prependRows = function(rows){
            for(var i=0; i<rows.length; i++){
                plugin.insertRow(i, rows[i]);
            }
            $element.trigger('rows.appended', [rows]);
            return plugin;
        }

        /**
         * Inserta una fila en una posición específica.
         * @param pos Integer Número entero a partir de 0
         * @param $row Array(objeto del dom) fila en el ámbito de jQuery
         * @param data Object datos asociados a la fila
         */
        plugin.insertRow = function(pos, $row, data){
            $row = $row.length? $row : $($row);
            if(isNaN(pos))
                return;
            var rows = settings.rowsContainer.children();
            if(!rows.length || pos <= 0){
                return plugin.prependRow($row);
            }else if(pos > rows.length-1){
                return plugin.appendRow($row);
            }
            if(rows[pos]){
                var ref = rows[pos];
                $row.insertBefore(ref);
                $element.trigger('row.appended', [$row, data]);
            }

            return plugin;
        }

        plugin.insert = function(pos, data, type){
            if(data && data.length){
                var rows = [];
                for(var i =0; i<data.length; i++){
                    plugin.insertRow(pos++, plugin.getRowBuilder().call(plugin, data[i], type || ''), data[i]);
                }
            }else if(data){
                var row = plugin.getRowBuilder().call(plugin, data);
                plugin.insertRow(pos, row, data);
            }
        }
        
        /**
         * Selecciona o des-selecciona todas las filas dependiento de checked(
         * true: selecciona todas, false: des-selecciona todas).
         */
        plugin.selectUnselectAll = function(checked){
            var check = checked? 'checked' : false;
			
            settings.rowsContainer.find('tr > td:first-child input.checkbox-row-selector').each(function(){
                $(this).prop('checked', check)
            });
            plugin.getAllRows().each(function(){
                plugin.toggleSelectionRow($(this), check);
            })
            plugin.bindSelectionTrigger();
        }
        
        plugin.unselectHeader=function(){
			
			var checked = $(settings.header.checkbox).is(':checked');
			if(checked)
				settings.header.checkbox.prop('checked', false)
		
		}
        
        //Funcionalidades para consumir publicamente
        
        /**
         * Obtiene la fila seleccionada con click, o la ultima que fue chequeada
         */
        plugin.getRowSelected = function(){
              var data;
            settings.rowsContainer.find('tr.info').each(function(){
               data= ($(this).closest('tr').data('row'));
            });
            return data;
        }

        /**
         * Obtiene las filas nuevas.
         */
        plugin.getRowsNews = function(){
            return settings.rowsContainer.children('tr.new');
        }

        /**
         * Obtiene los valores de las filas nuevas.
         */
        plugin.getRowsNewsValues = function(){
            var data = [];
            settings.rowsContainer.children('tr.new').each(function(){
                data.push($(this).data('row'));
            });
            return data;
        }

        /**
         * Obtiene las filas modificadas.
         */
        plugin.getRowsModifieds = function(){
            return settings.rowsContainer.children('tr.modified');
        }

        /**
         * Obtiene los valores de las filas nuevas.
         */
        plugin.getRowsModifiedsValues = function(){
            var data = [];
            settings.rowsContainer.children('tr.modified').each(function(){
                data.push($(this).data('row'));
            });
            return data;
        }

        /**
         * Obtiene las filas que posean el checkbox de seleccion con valor checked.
         */
        plugin.getRowsChecked = function(){
            var data = [];
            settings.rowsContainer.find('tr > td input.checkbox-row-selector:checked').each(function(){
                data.push($(this).closest('tr').data('row'));
            });
            return data;
        }

        /**
         * Obtiene los valores de las filasseleccionadas.
         */
        plugin.getRowsCheckedValues = function(){
            return plugin.getRowsChecked;
        }
        
        /**
         * Elimina la fila que se encuentra seleccionada.
         */
        plugin.removeRowSelected = function(){
            
        }
        
        /**
         * Elimina las filas que se encuentra seleccionadas mediante el checkbox.
         */
        plugin.removeRowsChecked = function(){
            return plugin.getRowsChecked().remove();
        }

        plugin.removeRows = function(rows){
            var removed = [];
            plugin.getAllRows().each(function(){
                for(var i = 0; i < rows.length; i++)
                    if($(this).data('row') == rows[i])
                        removed.push($(this).remove());
            });
            return removed;
        }
        
        /**
         * Muestra el cargando datos
         */
        plugin.showLoading = function(msg){
            var $tmpl = $('<tr class="tr-loading"> <td class="td-loading"> <div class="loading-progress-container"> <div class="progress progress-striped active"><div style="width: 100%;" class="bar"><strong>'+(msg? msg : plugin.settings.msgLoading)+'</strong></div></div></div></td></tr>');
            $element.find('tfoot')
                    .find('.tr-loading')
                    .remove()
                    .end()
                    .append($tmpl);
//            $tmpl.fadeIn('fast');
        }
        
        /**
         * Oculta el cargando datos
         */
        plugin.hideLoading = function(){
            $element.find('tfoot .tr-loading')
                    .remove();
        }
        
        plugin.init();
        
//        $element.data('vuTable', this);
//        
//        return this;
    }
    
    $.fn.vuPaginatedTable = function(options) {
        if(this.length){
            var el = this[0]
                ,vuTable = $(el).data('vuTable');
            if (undefined == vuTable) {
                var plugin = new $.vuPaginatedTable(el, options);
                $(el).data('vuTable', plugin);
                return plugin;
            }else{
                if(options && typeof options == 'string' && vuTable[options])
                    return vuTable[options]();
                return vuTable;
            }
        }
        return this;
//        return this.each(function() {
//            if (undefined == $(this).data('vuTable')) {
//                var plugin = new $.vuPaginatedTable(this, options);
//                $(this).data('vuTable', plugin);
//            }
//        });

    }
    //END: TABLE WITH PAGINATION
