(function($){

    //BEGIN: TABLE WITH PAGINATION
    $.grid = function (table, conf){
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
                    // yaicel: cantidad de elementos a cargar en la consulta
                    ,pageRange:[10,20,40,60]
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
            plugin.settings.rowsContainer = $element.find('.grid-body  .grid-body-list table > tbody');
            // console.log( plugin.settings.rowsContainer) ;
//            plugin.settings.rowsContainer = $element.find('tbody > tr > table > tbody');
            if(plugin.settings.urlSource == undefined || plugin.settings.urlSource == ''){
                plugin.settings.urlSource = $element.attr('urlsource');
            }
            plugin.initSearch();
            if(plugin.settings.autoload)
                plugin.getAjaxData();
            
            plugin.settings.callBack(this);
//            plugin.removeAllRows();

    // para el scroll
        $element.find('.grid-body-list').on('scroll',function(evt,data){
            var sc = $element.find('.grid-body-list').scrollLeft() ;
            $element.find('.grid-body-columns').scrollLeft(sc);
        })
        }

        //Acciones header
        plugin.initHeader = function(){
            settings.header = {};
            settings.header.container = $element.find('.grid-body-columns > table > thead');
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


        plugin.createPaginator = function () {
            var pcontainer = $('<ul class="paginator-container"></ul>');
            
            // crear los tamannos de paginas
            var pageSize = plugin.settings.paginator.options.pageRange ;
            var select = $('<select class="page-size" style=""></select>');
            for(var i = 0 ; i < pageSize.length ;i++){
                select.append($('<option value="'+pageSize[i]+'">'+pageSize[i]+'</option>'))
            }
            pcontainer.append($('<li></li>').append($('<span></span>').append(select))) ;
            
            
            pcontainer.append($('<li class="paginator-refresh"><span><i class="icon-refresh"></i></span></li><li class="paginator-begin disabled"><span index="0"><i class="icon-step-backward"></i></span></li><li class="paginator-before disabled"><span index="1"><i class="icon-backward"></i></span></li><li class="paginator-next disabled"><span index="2"><i class="icon-forward"></i></span></li><li class="paginator-end disabled"><span index="3"><i class="icon-step-forward"></i></span></li><li><span class="" index="4"><div class="progress"><div class="bar progress-text-inner-container" style="width: 0%;"><div class="progress-text progress-text-infront" style="">Mostrando 0-0 / 0</div></div><div class="progress-text-behind progress-text" style=" ">Mostrando 0-0 / 0</div></div></span></li>')) ;


            var paginator = $('<div class="pagination pagination-centered"></div>')
            paginator.append(pcontainer) ;

            return paginator ;
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
                    $('<td ></td>').appendTo(row).html(data[columns[col]['name']]);
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
                $(this).attr('checked', check);
            });
            plugin.getAllRows().each(function(){
                plugin.toggleSelectionRow($(this), check);
            })
            plugin.bindSelectionTrigger();
        }
        
        
        
        //Funcionalidades para consumir publicamente
        
        /**
         * Obtiene la fila seleccionada con click, o la ultima que fue chequeada
         */
        plugin.getRowSelected = function(){
            
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
            var $tmpl = $('<div class="tr-loading"> <div class="td-loading"> <div class="loading-progress-container"> <div class="progress progress-striped active"><div style="width: 100%;" class="bar"><strong>'+(msg? msg : plugin.settings.msgLoading)+'</strong></div></div></div></div></div>');
            $element.find('.grid-body-list')
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
            $element.find('.grid-body-list .tr-loading')
                    .remove();
        }
        
        plugin.init();
        
//        $element.data('vuGrid', this);
//        
//        return this;
    }
    
    $.fn.grid = function(options) {
        if(this.length){
            var el = this[0]
                ,vuGrid = $(el).data('vuGrid');
            if (undefined == vuGrid) {
                var plugin = new $.grid(el, options);
                $(el).data('vuGrid', plugin);
                return plugin;
            }else{
                if(options && typeof options == 'string' && vuGrid[options])
                    return vuGrid[options]();
                return vuGrid;
            }
        }
        return this;
//        return this.each(function() {
//            if (undefined == $(this).data('vuGrid')) {
//                var plugin = new $.grid(this, options);
//                $(this).data('vuGrid', plugin);
//            }
//        });

    }
    //END: TABLE WITH PAGINATION

    //BEGIN GRID-TO-GRID OR TABLE-TO-TABLE
    var vuGriToGrid = function(el, config){
        return this.init(el, config);
    }

    vuGriToGrid.prototype = {
        constructor: vuGriToGrid
        ,defaults: {
             gridConfig: {          //Config común para ambos grid
                 delegateSearch: false
                ,delegateButtonSearch: false
                ,columns: []        //Solo si fromSource == false, sino sobreescribe las existentes.
                ,pluginName: 'vuGrid'
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
            this.initSecond();
            this.initButtons();
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
        }
        ,initSecond: function(){
            var config = this.settings.secondConfig;
            if(this.settings.fromSource){
                var plugin = this.getPluginFromConfig(config);
                if(plugin){
                    this.second = plugin;
                }
            }   //TODO Programar caso contrario
        }
        ,initButtons: function(){
            var obj = this;
            if(this.settings.fromSource){
                var $btnContainer = this.$el.find('.gridtogrid-btn-container');
                this.buttons.toSecond = $btnContainer.find('[data-action="to-second"]');
                this.buttons.toFirst = $btnContainer.find('[data-action="to-first"]');
                this.buttons.allToSecond = $btnContainer.find('[data-action="all-to-second"]');
                this.buttons.allToFirst = $btnContainer.find('[data-action="all-to-first"]');

                this.buttons.toSecond.click(function(){
                    obj.addRows(obj.getFirstSelectionsValues(), obj.getFirst(), obj.getSecond(), 'to-second');
                });

                this.buttons.toFirst.click(function(){
                    obj.addRows(obj.getSecondSelectionsValues(), obj.getSecond(), obj.getFirst(), 'to-first');
                });

                this.buttons.allToSecond.click(function(){
                    obj.addRows(obj.getFirstValues(), obj.getFirst(), obj.getSecond(), 'to-second');
                });

                this.buttons.allToFirst.click(function(){
                    obj.addRows(obj.getSecondValues(), obj.getSecond(), obj.getFirst(), 'to-first');
                });
            }//TODO Implementar caso contrario
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
            return plugin.getRowsChecked();
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
                var plugin = new vuGriToGrid(el, options);
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

    //BEGIN: VU RUN MODAL
    
    $.vuRunModal = function (conf){
        var settings = {
             idIndex: 'id'
            ,idTmpl: 'templateModal'
            ,title: 'Adicionar'
            ,objects: undefined
            ,action: undefined
            ,callBack: function(scope, modal){}
            ,style: 'max-width: 562px; min-width: 562px;'
            ,pButtonText: undefined
            ,autodestroy: false
            ,pButtonAction: function(evt, modal){}
//            ,bodyId: undefined             
//            ,footerId: undefined
            
        };
        
        if(typeof conf != 'object')
            return false;
        
        settings = $.extend(settings, conf);
        
        var  btn = this
            ,modal;
        
        if($('#'+settings.idModal).length == 0){
            var modalConfig = {
                 id: settings.idModal
                ,title: settings.title
                ,style: settings.style
                ,pButtonText: settings.pButtonText
                ,configuratedObjects: settings.objects
            };
            var tmpl = window.tmpl(settings.idTmpl)(modalConfig);
           modal = $(tmpl).appendTo(document.body);
           modal.find('.modal-footer a.btn-primary').click(function(evt){
               evt.preventDefault();
               settings.pButtonAction(evt, modal);
           });
           // if(settings.autodestroy){
           //      modal.on('hidden', function(evt){
           //          modal.destroy();
           //      });
           // }
        } else {
            modal = $('#'+settings.idModal);
        }
        if(settings.action != undefined && settings.action != 'none')
            modal.modal(settings.action);
        settings.callBack(this, modal);
        
        // TEST
//                $(".from-list-container select option", modal).draggable();
//                
//                var to = $(".to-list-container select", modal).droppable({
//                    accept: "option",
//                    drop: function(ev, ui) {
//                        // Añado el objeto origen a la lista destino 
//                        alert('LLEGO')
//                        $(this).append($(ui.draggable));         
//                    }
//                });
        //TEST
        
        return modal;
    }
    //END: VU RUN MODAL
    
    //Funcion para hacer scroll vertical animado 
    $.vuVerticalScroll = function(opt){
        var element = this;
        var conf = {
            top: 0,
            delay: 250,
            callBack: undefined
        }
        var config = $.extend({}, conf, opt);
        var $body = (window.opera)? (document.compatMode=="CSS1Compat"? $('html') : $('body')) : $('html,body');
        $body.animate({scrollTop: config.top}, config.delay, undefined, function(){
            if($.isFunction(config.callBack)){
                config.callBack(element, config.top);
            }
        });
    };
    
    /**Obtener los valores de un formulario para sustituir el codigo del envio 
     *de los mismos y hacerlo reutilizable
     *@param form Formulario del que se desea obtener los valores
     *@param opts Objeto de configuracion donse se seleccionan opciones en la 
     *obtencion de los datos. Propiedades{shortNames: false, descripcionSelects: false, token: false}
     *@return Objeto con los valores del formulario.
     */
    
    $.getFormsValues = function(form, opts){
        var config = {
            elmFormSelector: '[sendable="true"]',
            shortNames: false,
            descripcionSelects: false, //Para que annada un campo adicional con la descripcion del elem seleccionado de los selects.
            token: false,
            includeFiles: true
        };
        $.extend(config, opts);
        if(config.token)
            config.elmFormSelector+= ', [id$="_token"]';
        var elementos = {};
        $(config.elmFormSelector,form).each(function(ind, elem){
            var $elem = $(elem);
            if(elem.name || $elem.attr('shortname')){
                if($elem.attr('type') === 'radio'){
                    if((config.shortNames && !$(elementos).attr($elem.attr('shortname'))) || (!config.shortNames && !$(elementos).attr(elem.name))){
                        var value = $('[name="'+elem.name+'"]:checked',form).val();
                        $(elementos).attr(config.shortNames && $elem.attr('shortname') != undefined? $elem.attr('shortname') : elem.name, value != undefined ? value: '');
                    }
                }else if($elem.is('.listtolist-container') && $elem.data('vuListToList') != undefined){
                    $(elementos).attr(config.shortNames && $elem.attr('shortname') != undefined? $elem.attr('shortname') : $elem.attr('name'), $elem.data('vuListToList').getToListAllValues());
                }else if($elem.is('.switch')){
                    if($elem.find('input[type="checkbox"]').is(':checked'))
                        $(elementos).attr(config.shortNames && $elem.attr('shortname') != undefined? $elem.attr('shortname') : $elem.attr('name'), $elem.find('input[type="checkbox"]').val());
                }else if($elem.is('input[type="file"]')){
                    if(elem.files.length == 1){
                        $(elementos).attr(config.shortNames && $elem.attr('shortname') != undefined? $elem.attr('shortname') : $elem.attr('name'), elem.files[0]);
                    }else{
                        var  pos  = 0
                            ,name = config.shortNames && $elem.attr('shortname') != undefined? $elem.attr('shortname') : $elem.attr('name');
                        $(elem.files).each(function(){
                            $(elementos).attr(name+'['+pos+++']', this);
                        });
                    }
                }else if($elem.is('input[type="checkbox"]')){
                    if($elem.is(':checked'))
                        $(elementos).attr(config.shortNames && $elem.attr('shortname') != undefined? $elem.attr('shortname') : $elem.attr('name'), $elem.val());
                }else{
                    $(elementos).attr(config.shortNames && $elem.attr('shortname') != undefined? $elem.attr('shortname') : elem.name, $elem.val());
                    if(config.descripcionSelects && $elem.is('select')){
                        $(elementos).attr(config.shortNames && $elem.attr('shortname') != undefined? $elem.attr('shortname')+'Descripcion' : elem.name+'Descripcion', elem.value != '' && elem.value != undefined? $('option:selected', elem).html(): '');
                    }
                }
            }
        });
        return elementos;
    };
    
    //Setea los valores contenidos en un objeto javascript a un formulario
    $.setFormsValues = function(form, values){
        $('[sendable="true"]', form).each(function(){
            var elm = this;
            if($(elm).attr('shortname') != undefined && $(values).attr($(elm).attr('shortname')) != undefined){
                $(this).val($(values).attr($(elm).attr('shortname')));
                if($(elm).is('select')){
                    if($(elm).data('nCombo')){
                        if($(elm).data('nCombo').settings.ajax){
                            if(!$(elm).data('nCombo').settings.updated){
                                $(elm).data('nCombo').loadAjax({
                                    data:{}, 
                                    select:$(values).attr($(elm).attr('shortname'))
                                });
                            }else{
                                $(elm).data('nCombo').select(values[$(elm).attr('shortname')]);
    //                            $(elm).data('nCombo').update();
                                $(elm).change();
                            }
                        }else{
                            $(elm).val($(values).attr($(elm).attr('shortname')));
                            $(elm).data('nCombo').update();
                        }
                    }else if($(elm).data('chosen')){
                        $(elm).val($(values).attr($(elm).attr('shortname')));
                        $(elm).data('chosen').results_update_field();
                        $(elm).change();
                    }else {
                        $(elm).val($(values).attr($(elm).attr('shortname')));
                    }
                }else if($(elm).is('.listtolist-container') && $(elm).data('vuListToList') != undefined){
                    $(elm).data('vuListToList').setValues($(values).attr($(elm).attr('shortname')));
                }else if($(elm).is('.switch')){
                    $(elm).bootstrapSwitch('setState',$(values).attr($(elm).attr('shortname')));
                }
            }
            
        });
        return form;
    };
    
    //Funcion para eliminar los valores de los grids dentro del formulario de las solicitudes u otro contenedor
    $.removeGridsValues = function (form, opts){
        var config = {
            returnValues: false
        };
        $.extend(config, opts);
        var values = {};
        var encontro = false;
        $('div.grid-container', form).each(function(){
            encontro = true;
            var $grid = $(this).data('grid');
            if(config.returnValues){
                var $obj = $grid.getStore();
                $(values).attr($(this).attr('id'), $obj);
            }
            $grid.removeAll().putValid();
        });
        if(config.returnValues)
            return values;
        return encontro;
    };
    
    //Funcion para reiniciar los formularios
    $.fn.clearForm = function($options){
        var $defaults = {
            validator: null,
            selector: '[sendable="true"]',
            clearHidden: true,
            defaultReset: true,
            onReset: function(evt, target){}
        };
        $.extend($defaults, $options);
        
        this.each(function(){
            var $target = this;
            var $element = $(this);
            if($defaults.defaultReset)
                $target.reset();
            $('.controls', $(this)).each(function(){
                if($(this).data('radiosVu'))
                    $(this).data('radiosVu').triggerUpdate();
            });
//            $('.n-combo', $element).each(function(){
//                if($element.data('nCombo'))
//                    $element.data('nCombo').update();
//            });
            $('select', $element).each(function(){
                if($(this).data('nCombo')){
                    $(this).data('nCombo').update();
                }else if($(this).data('chosen')){
                    $(this).data('chosen').results_update_field();
                }
            });
            //TODO Revisar esto, puede darse el caso de que no sea necesario
            $('span.uneditable-input', $element).each(function(){
                $(this).val("").html("");
            });

            if($defaults.clearHidden){
                $('input[type="hidden"]:not([id$="_token"])', $element).each(function(){
                    $(this).val('');
                });
            }

            $('.listtolist-container', $element).each(function(){
                if($(this).data('vuListToList')){
                    $(this).data('vuListToList').removeAll();
                }
            });

            $('.switch.has-switch', $element).each(function(){
                var active = $(this).find('input[type="checkbox"]').is(':checked');
                $(this).bootstrapSwitch('setState', active)
            });

            $('fieldset.uneditable-btn-group label.btn', $element).removeClass('active btn-primary');

            $.removeGridsValues(this);

             if($element.data('validator'))
                $element.data('validator').resetForm();
        });
    }
    
    /*BEGIN VUPROCESANDO*/
    /**
     * VuProcesando
     * Clase con comportamiento para mostrar un cargando (Loading...)
     * @param options
     */

    var VuProcesando = function(options){
        this.options = $.extend(this.defaults,  options);
        this.init();
    };

    VuProcesando.prototype = {
        constructor: VuProcesando
        ,defaults : {
            msg: ''
            ,id: 'idProcedandoMsg'
            ,percent: 0
            ,holder: 'body'
            ,textColor: '#3A87AD'
            ,runIncrement: false
        }
        ,init : function(){
            $('#'+this.options.id).remove();
            var $superContainer = $('<div class="procesando-supercontainer"></div>')
                .attr('id', this.options.id);
            var $container = $('<div class="procesando-container"></div>');
            var $progress = $('<div class="progress progress-info progress-striped active"></div>');
            var $bar = $('<div style="width: 0;" class="bar"></div>');
            $progress.append($bar);
            var $texto = $('<strong></strong>').css({color: this.options.textColor});
            if(this.options.msg && this.options.msg != ''){
                $texto.html(this.options.msg);
            }else{
                $texto.hide();
            }
            $container.append($texto);
            $container.append($progress);
            $superContainer.append($container)
                .hide()
                .appendTo(this.options.holder);
            //console.log($bar);return;
            this.resetIncrementStatus();
            this.options.cargando = $superContainer;
            if(this.options.runIncrement)
                this.incrementPercent();
            else
                $bar.css({width: '100%'})
            return this;
        }
        ,incrementPercent : function(){
            var el = this;
            if(this.options.percent == 100 || !this.options.runIncrement)
                return;
            this.options.percent+=5;
            this.options.cargando.find('.bar').css('width', this.options.percent+'%');
            //setTimeout(this.incrementPercent, 250);
        }
        ,show : function(){
            if(!this.options.cargando)
                this.init()
            this.options.cargando.show();
            //this.options.cargando.find('.bar').css({'width': '100%'});
            return this;
        }
        ,hide : function(){
            $('#'+this.options.id).fadeOut('fast');
            return this;
        }
        ,destroy : function(){
            var el = this;
            $('#'+this.options.id).fadeOut('fast', function(){
                var data = $(el.options.holder).data();
                $(data).removeProp('vuProcesando');
            });
            return null;
        }
        ,removeMsg : function(){
            if(this.options.cargando){
                var visible = this.options.cargando.is(':visible')
                this.options.cargando.remove();
                this.options.cargando = undefined;
//                if(visible){
//                    this.init()
//                        .show();
//                }
            }
            return this;
        }
        ,setMsg : function(msg){
            this.options.msg = msg;
            if(this.options.cargando){
                var visible = this.options.cargando.is(':visible')
                this.removeMsg();
                if(visible){
                    this.init()
                        .show();
                }
            }
            return this;
        }
        ,startIncrement : function(){
            this.options.runIncrement = true;
            this.incrementPercent();
            return this;
        }
        ,stopIncrement : function(){
            this.options.runIncrement = false;
            return this;
        }
        ,resetIncrementStatus : function(){
            this.options.percent = 0;
            return this;
        }
    };

    var  noConflictVuProcesando = $.fn.vuProcesando
        ,noConflictVuPageProcesando = $.fn.vuPageProcesando;

    /*Agrega el procesando el primero de la coleccion seleccionada.*/
    $.fn.vuProcesando = function(options){
        if(this.length){
            var  $element = $(this[0])
                ,plugin = $element.data('vuProcesando');
            if(typeof  options == 'string' &&  plugin){
                if(typeof plugin[options] == 'function')
                    return plugin[options]();
                else
                    return plugin.setMsg(options);
            }else if (    plugin
                && typeof  options == 'object'
                && !(options instanceof Array)
                )
            {
                plugin.destroy();
                options = $.extend(options, {holder: $element});
            }else if(typeof  options == 'string'){
                options = $.extend({msg: options}, {holder: $element});
            }

            if(!plugin){
                plugin = new VuProcesando(options);
                $element.data('vuProcesando', plugin);
            }

            return plugin;
        }
    }

    /*Abreviatura para el procesando que cubre la pagina completa.*/
    $.vuPageProcesando = function(options){
        return $('body').vuProcesando(options);
    }

    /*Resolucion de conflictos*/
    $.fn.vuProcesando.noConflict = function () {
        $.fn.vuProcesando = noConflictVuProcesando;
        $.vuPageProcesando = noConflictVuPageProcesando;
        return this;
    }

    /*END VUPROCESANDO*/

    /**
     * Inicia los eventos de scroll y resize de la ventana para poner fixed los
     * submenues.
     */
    $.initSubnavScroll = function (){
        var $win = $(window),
            $header = $('.app-header'),
            $nav    = $('.subnav').filter(':not(.subnav-advanced-search)'),
            $navAdvanced = $('.subnav.subnav-advanced-search'),
            $esp    = $('.subnav-fill'),
            navTop  = $nav.length && $nav.offset().top - 70,
            fillHeight = 43,
            isFixed = false;

        function processScroll() {
            var scrollTop = $win.scrollTop();
            var headerPosition = $header.css('position');
            if (headerPosition == 'fixed' && scrollTop >= navTop && !isFixed) {
                isFixed = true
                $esp.show().css({height: fillHeight+'px'})
                $nav.addClass('subnav-fixed')
                $navAdvanced.addClass('subnav-fixed')
//                $esp.addClass('clear')
                $('.app-menu-bar').css({boxShadow: 'none'})
                
            } else if (headerPosition != 'fixed' || (scrollTop <= navTop && isFixed)) {
                isFixed = false
                $nav.removeClass('subnav-fixed')
                $navAdvanced.removeClass('subnav-fixed')
                $esp.removeClass('clear')
                $('.app-menu-bar').css({boxShadow: ''})
                $esp.css({height: '0'}).hide();
            }
        }
        
        var $toggleAdvanced = $nav.find('[advanced-search-toggle="true"]');
        $toggleAdvanced.click(function(){
           $navAdvanced.slideToggle(function(){
                var eventName = $navAdvanced.is(':visible')? 'show.subnav' : 'hide.subnav';
                $navAdvanced.trigger(eventName);
            });
        })
        
        function updateFill(){
            if($esp.is(':visible')){
                $esp.animate({height : fillHeight+'px'});
            }
        }
        
        if ($nav.length)
            $win.on('scroll resize', processScroll);
        
        $navAdvanced.on('show.subnav',function(){
                fillHeight += 38;
                updateFill();
            }).on('hide.subnav', function(){
                fillHeight -= 38;
                updateFill();
            }).find('.subnav-close').click(function(){
                $toggleAdvanced.click();
            });
    };

    /**
     * Envio de datos incluidos ficheros
     */
    $.vuAjax = function(opt){
        var   me = this
            , defaults = {
                  url: ''
                , form: false   //Formulario del que se quieren extraer los datos
                , getFormValues: function(form){
                    return $.getFormsValues(form, {token: config.token});
                }
                , token: true
                , async: true
//                , data: {}
//                , success: function(){}
//                , error: function(){}
            }
            , config = $.extend({}, defaults, opt)
            , formData = new FormData()
            , values = {};

        if(config.form && $(config.form).is('form')){
            values = config.getFormValues(config.form);
        }
        if(typeof config.data == 'object'){
            values = $.extend({}, config.data, values);
        }
        for(var key in values){
            formData.append(key, values[key]);
        }
        //Proceso de envio de los datos
        if(XMLHttpRequest != undefined){
            me.xhr = new XMLHttpRequest();
            me.xhr.onload = function(){
                if (me.xhr.readyState == 4 && me.xhr.status == 200 && config.success) {
                    config.success.call(me, JSON.parse(me.xhr.responseText));
                }
                else if(config.error){
                    config.error.call(me, me.xhr.responseText, me.xhr);
                }
            };
            me.xhr.open('POST', config.url, config.async);
            me.xhr.send(formData);
        }else{
            //Proceso alternativo de envio
            me.xhr = $.ajax({
                  url: config.url
                , type: 'POST'
                , data: formData
                , cache: false
                , async: config.async
                , dataType: 'json'
                , processData: false // Don't process the files
                , contentType: false // Set content type to false as jQuery will tell the server its a query string request
                , success: function(data, textStatus, jqXHR){
                    config.success.call(me, data);
                }
                , error: function(jqXHR, textStatus, errorThrown){
                    if(config.error)
                        config.error.call(me, jqXHR.responseText, jqXHR);
                }
            });
        }
        return me;
    };

    /**
     * Maneja una barra de acciones para lanzar eventos (user.click) solamente cuando
     * el item de acción no se encuentra deshabilitado.
     * Permite suscribir la misma a una tabla (vuGrid) para mediante el evento (selection.change)
     * habilitar o deshabilitar las acciones en dependencia de la cantidad mínima y máxima necesaria
     * para cada acción.
     * @author Eddie Nelson Beltrán González
     * @event user.click
     *
     */
    /**
     * TODO Agregar posibilidad de una funcion callback por cada item para analizar los datos seleccionados dando la
     *      posibilidad de no habilitarse si no cumplen ciertos requisitos
     */
    $.vuSubnavActions = function(element, options){
        this.init(element, options);
    }

    $.vuSubnavActions.prototype = {
          constructor: $.vuSubnavActions
        , defaults: {
              tableSelector: 'table.ca-main-table'  //Selector de la tabla
            , tableEvent: 'selection.change'        //Evento de la tabla al que se suscriben las acciones
            , actionsEvent: 'user.click'         //Evento que lanzan las acciones
            , actionsSelector: 'li.nav-action'   //Selector de la acciones
            , minSelection: 1
            , maxSelection: null
        }
        , settings: {
              config: {}
            , actions: []
        }
        , init: function(element, options){
            var obj = this;
            this.el = element;
            this.$el = $(element);
            obj.settings.config = $.extend({}, obj.defaults, obj.optsFromElement(), options);
            var config = obj.settings.config;
            obj.settings.actions = obj.$el.find(config.actionsSelector);
            obj.initActionEvent();
        }
        , optsFromElement: function(){
            var   obj = this
                , props = {}
                , attrs = {};
            for(key in obj.el.attributes){
                if(/^data-/i.test(obj.el.attributes[key].nodeName))
                    attrs[obj.el.attributes[key].nodeName] = obj.el.attributes[key].value;
            }
            for(key in obj.defaults){
                var data = attrs['data-'+key.toLowerCase()] || attrs['data-'+key];
                if(data){
                    props[key] = data;
                }
            }
            return props;
        }
        , initActionEvent: function(){
            var obj = this
                config = obj.settings.config;
            obj.settings.actions.each(function(){
                var $el = $(this);
                $el.click(function(){
                    if ($el.is(':not(.disabled)')) {
                        $el.trigger(config.actionsEvent);
                    }
                });
                //Se suscribe el elemento al evento de la tabla
                $(config.tableSelector).on(config.tableEvent, function(evt, rows){
                    var min = $el.attr('minselection') ? parseInt($el.attr('minselection')) : config.minSelection;
                    var max = $el.attr('maxselection') ? parseInt($el.attr('maxselection')) : config.maxSelection;
                    if (max) {
                        if (rows.length < min || rows.length > max) {
                            $el.addClass('disabled');
                        } else {
                            $el.removeClass('disabled');
                        }
                    } else {
                        if (rows.length < min) {
                            $el.addClass('disabled');
                        } else {
                            $el.removeClass('disabled');
                        }
                    }
                });
            });
        }
    };

    $.fn.vuSubnavActions = function(options){
        this.each(function(){
            var $el = $(this);
            if(!$el.data('vuSubnavActions')){
                var obj = new $.vuSubnavActions(this, options);
                $el.data('vuSubnavActions', obj)
            }else if(typeof options == 'string'){
                return $el.data('vuSubnavActions')[options]();
            }
        })
        return this;
    }

    $('[data-provider="vu-subnav-actions"]').vuSubnavActions({});


})(jQuery)