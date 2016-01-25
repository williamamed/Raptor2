!function ($) {
VU.namespace('VU.Components');

VU.Components.vuGrid = function(element, config) {
    return this.init(element, config);
}
VU.Components.vuGrid.prototype = {
    constructor: VU.Components.vuGrid,
    defaults: {
        urlSource: '', // url de donde se van a cargar los datos
        autoload: true, //si la carga de datos es automatica
        root: 'data',
        msgLoading: 'Cargando datos...', // mensaje que muestra cuando se estan cargando los datos
        msgNoDataLoaded: 'No existen datos para mostrar.', // mensaje que muestra cuando no hay datos
        delegateSearch: '#Search', //Selector para el elemento encargado de buscar(poner contenedor con estructura y el input dentro se usa como elcampo de busqueda)
        delegateButtonSearch: '#idSearch',
        callBack: function(scope, modal) {
        }, //Se ejecuta al terminar la ejecucion
        renderColumns: {}, //Permite establecer mediante una funcion como se va a dibujar una columna determinada{index: 'indice de la col', render: function(valorColumna){//Funcion que debe retornar el html a dibujar}}
        renderRow: null, //Función para construir las filas, recibe el objeto completo por parámetro
        pButtonAction: function() {
        },
        urlAdd:'',
        urlEdit:'',
        urlDel:'',
        width: '300px', //ancho 
        height: '300px', //alto
        block: false, //bloquear el grid
        style: '',
        class: 'table table-bordered table-striped table-hover  table-condensed vu-paginated-table',
        titlebar: {
            el: undefined,
            options: {
                show: true, // si esta visible o no la barra de titulo
                title: "Listado", // titulo de la barra de titulo
                icon: "icon-list", // icono de la barra de titulo
            }
        },
        toolbar: {
            el: undefined,
            options: {
                show: true,
                btnAdd: {
                    el: undefined,
                    options: {
                        show: true,
                        id: 'adicionar',
                        title: "Adicionar",
                        icon: "icon-plus-sign",
                        minSelection: null,
                        maxSelection: null,
                        action: undefined
                    },
                },
                btnEdit: {
                    el: undefined,
                    options: {
                        show: true,
                        id: 'edit',
                        title: "Editar",
                        icon: "icon-pencil",
                        minSelection: 1,
                        maxSelection: 1,
                        action: undefined
                    }
                },
                btnDel: {
                    el: undefined,
                    options: {
                        show: true,
                        id: 'del',
                        title: "Eliminar",
                        icon: "icon-trash",
                        minSelection: 1,
                        maxSelection: null,
                        action: undefined
                    }
                },
            buttons: [], // columnas que tiene el grid [index,name,style[width],editable,visible]          
        }
    },
    header: {
        el: undefined,
        options: {
            show: true,
            selectedAll: true,
            numeration: false,
            columns: [], // columnas que tiene el grid [index,name,style[width],editable,visible]   
        }
    },
    paginator: {
        el: undefined,
        options: {
            page: 1,
            pageSize: 5,
            pageRange: [10, 20, 40, 60],
            showPages: 5,
            totalPages: undefined,
            total: undefined,
            pageInitial: undefined,
            pageFinal: undefined,
            showBar: true,
            barText: 'Mostrando'
        },
        params: {}
    },
    modal: {
        el: undefined,
        options: {
            addTitle:'Adicionar',
            editTitle:'Editar',
            btnAction:undefined,
            form:{
                el:undefined,
            }
        }
    }
},
settings: {},
        element: undefined, //elemento del dom    

        init: function(element, config) {
            var plugin = this;
            this.element = element;
            this.$element = $(element);
            this.initConfig(config);

            this.$element.addClass('grid') ;

            if (this.settings.titlebar.options.show == true) {
                this.$element.prepend($('<div class="grid-head"><div class="grid-head-title"><i class="' + this.settings.titlebar.options.icon + '"></i>' + this.settings.titlebar.options.title + '</div></div>'));
            }
            this.$element.append($('<div class="grid-body"></div>')) ;
            this.initToolbar();

            this.initHeader();
            this.initPaginator();
        //        this.settings.rowsContainer = this.$element.find('.grid-body  .grid-body-list table > tbody');

        if (this.settings.urlSource == undefined || this.settings.urlSource == '') {
            this.settings.urlSource = this.$element.attr('urlsource');
        }

        this.initSearch();
        if (this.settings.autoload)
            this.getAjaxData();
        this.settings.callBack(this);
        // para el scroll
        var $element = this.$element;
        this.$element.find('.grid-body-list').on('scroll', function(evt, data) {
            var sc = $element.find('.grid-body-list').scrollLeft();
            $element.find('.grid-body-columns').scrollLeft(sc);
        });

        $(this.$element.find('.grid-body-list')).height(this.settings.height);
        this.$element.width(this.settings.width);
    },
    initConfig: function(config) {
        this.settings = $.extend({}, this.defaults, config);
    },
    //Acciones header
    initHeader: function() {

    //        this.settings.header = {};
    this.settings.header.el = undefined;
    this.$element.find('.grid-body-columns > table > .thead');

    if (this.settings.header.el == undefined) {

        var a = $('<div class="grid-body-columns"></div>');
        var tr = $('<tr></tr>');
        var tr2 = $('<tr style="height: 0px;"></tr>');

        if (this.settings.header.options.selectedAll == true) {
            tr.append($('<th class="header-selection" index="checkbox-selection" style="width:15px"><input type="checkbox" value="all"/></th>'))
            tr2.append($('<th style="width:15px;padding-top: 0px; padding-bottom: 0px; border-top-width: 0px; border-bottom-width: 0px; height: 0px;"></th>'))
        }

        $(this.settings.header.options.columns).each(function() {
            tr.append($('<th index="' + this.index + '" style="width:' + this.width + '">' + this.title + '</th>'))
            tr2.append($('<th style="width:' + this.width + ';padding-top: 0px; padding-bottom: 0px; border-top-width: 0px; border-bottom-width: 0px; height: 0px;"></th>'))
        });

        tr.append($('<th  style="width:10px"></th>'))
        var thead = $('<thead></thead>').append(tr);
        var thead2 = $('<thead></thead>').append(tr2);

        var tableRow = $('<table class="' + this.settings.class + '" ></table>');
        tableRow.append(thead2);
        var tbody2 = $('<tbody></tbody>');
        tableRow.append(tbody2);


        this.$element.find('.grid-body').append($('<div class="grid-body-columns"></div>').append($('<table class="' + this.settings.class + '" ></table>').append(thead)))
        this.$element.find('.grid-body').append($('<div class="grid-body-list"></div>').append(tableRow));



        this.settings.header.el = thead;
        this.settings.rowsContainer = tbody2 ;

    //            console.log(this.settings.header.el);

}
    //      settings.header.container = $element.find('tbody > tr > table > thead');
    var $header = this.settings.header.el;
    var plugin = this;
    $header.find('tr th:first').each(function() {
        if ($(this).attr('index') == 'checkbox-selection') {
            plugin.settings.header.checkbox = $(this).find('input[type="checkbox"]').on('change', function(evt) {
                evt.stopPropagation();
                var checked = $(this).is(':checked');
                plugin.selectUnselectAll(checked);
            });
        }
    });
    this.settings.header.columns = [];
    this.updateHeadersIndex();
    

    if(this.settings.block==true){
        this.block() ;
    }
    this.buildModal() ;
},
updateHeadersIndex: function() {
    var newColumns = [];
    this.settings.header.el.find('tr th:not(:first)').each(function() {
    //        this.settings.header.options.each(function() {
        newColumns.push({name: $(this).attr('index'), element: $(this)});
    });
    this.settings.header.columns = newColumns;
    if (this.settings.paginator.el)
        this.settings.paginator.el.closest('th').attr('colspan', newColumns.length + 1);
    return this;
},
rebuildHeaders: function(headers, reload) {
    if (typeof headers == 'object' && headers instanceof Array) {
        var saveColumns = this.settings.header.columns;
        try {
            var columns = []
            , appendColumns = [];
            var index = 0;
            for (var i = 0; i < headers.length; i++) {
                var el = headers[i];
                var $col = $('<th><span></span></th>').attr('index', el.index || index++)
                .find('span')
                .html(el.text || '')
                .end();
                columns.push({name: el.index, element: $col});
                appendColumns.push($col);
            }
            this.removeAllRows();
            this.settings.header.el.find('tr th:not(:first)').remove();
            this.settings.header.el.find('tr').append(appendColumns);
            this.updateHeadersIndex();
            this.settings.paginator.el.closest('th').attr('colspan', columns.length + 1);
            if (reload) {
                this.getAjaxData();
            }
        } catch (ex) {
            this.settings.header.columns = saveColumns;
        }
    }
    return this;
},
initSearch: function() {
    var plugin = this;
    if (this.settings.delegateSearch != undefined && this.settings.delegateSearch != "") {
        var $inputSearch = undefined;
        var $buttonSearch = undefined;
        if (typeof this.settings.delegateSearch == 'object') {
            $inputSearch = this.settings.delegateSearch;
        } else {
            $inputSearch = $(this.settings.delegateSearch);
        }
        if ($inputSearch.length != 0) {
            if (this.settings.delegateButtonSearch != undefined
                && this.settings.delegateButtonSearch != "") {
                if (typeof this.settings.delegateButtonSearch == 'object') {
                    $buttonSearch = this.settings.delegateButtonSearch;
                } else {
                    $buttonSearch = $(this.settings.delegateButtonSearch);
                }
                $buttonSearch.click(function() {
                    if ($inputSearch.val() != "" && $inputSearch.val() !== undefined) {
                        plugin.getAjaxData(1);
                    }
                })
            }
            $inputSearch.keyup(function() {
                var searchVal = $inputSearch.val();
                var name = $inputSearch.attr('name') ? $inputSearch.attr('name') : 'search';
                if (searchVal == "" && plugin.getPaginatorParams().search != undefined) {
                    plugin.getPaginatorParams()[name] = undefined;
                    plugin.getAjaxData(1);
                } else if (searchVal != "") {
                    plugin.getPaginatorParams()[name] = searchVal;
                }
            })

            $inputSearch.keypress(function(e) {
                if (e.which == 13) {
                    e.preventDefault();
                    if ($inputSearch.val() != "")
                        plugin.getAjaxData(1);
                }
            });
    //Por si inicialmente el campo de busqueda tiene datos.
    $inputSearch.trigger('keyup');
}
}

},
    //Acciones para paginador
    initPaginator: function() {

        var pcont = $('<ul class="paginator-container"></ul>') ;
    //        crear pagesize
    var pageSize = $('<select class="page-size" style=""></select>');
    $(this.settings.paginator.options.pageRange).each(function(){
        pageSize.append($('<option value="'+this+'">'+this+'</option>'));
    });

    pcont.append($('<li></li>').append($('<span></span>').append(pageSize))) ;
    pcont.append($(' <li class="paginator-refresh"><span><i class="icon-refresh"></i></span></li><li class="paginator-begin disabled"><span index="0"><i class="icon-step-backward"></i></span></li><li class="paginator-before disabled"><span index="1"><i class="icon-backward"></i></span></li><li class="paginator-next disabled"><span index="2"><i class="icon-forward"></i></span></li><li class="paginator-end disabled"><span index="3"><i class="icon-step-forward"></i></span></li>'));

    if(this.settings.paginator.options.showBar){
        pcont.append($('<li><span class="" index="4"><div class="progress"><div class="bar progress-text-inner-container" style="width: 0%;"><div class="progress-text progress-text-infront" style="">Mostrando 0-0 / 0</div></div><div class="progress-text-behind progress-text" style=" ">Mostrando 0-0 / 0</div></div></span></li>')) ;
    }
    this.$element.find('.grid-body').append($('<div class="grid-body-pagination"></div>').append($('<div class="pagination pagination-left" ></div>').append(pcont)));

    var $paginator = pcont;

    if ($paginator.length != 0) {
        this.settings.paginator.el = $paginator;
        if (!this.settings.paginator.options.showBar)
            $paginator.find('.progress').closest('li').remove();
        this.settings.paginator.options.pageSize = $paginator.find('select.page-size').val();
        this.initPaginatorEvents($paginator);
        this.updatePaginator();
    //                $paginator.find('li.item-page').remove();
    //                var options = plugin.settings.paginator.options;
    //                options.page = 1000;
} else {
    this.settings.paginator.options.pageSize = undefined;
    this.settings.paginator.options.page = undefined;
}
},
initPaginatorEvents: function($paginatorContainer) {
    var plugin = this;
    $paginatorContainer.find('li > a').click(function(evt) {
        evt.preventDefault();
    });
    var $pageSize = $paginatorContainer.find('select.page-size');
    $pageSize.on('change', function(evt) {
        plugin.changePaginatorSize($(evt.target).val());
    });
    var $next = $paginatorContainer.find('.paginator-next');
    $next.click(function() {
        plugin.getAjaxData(Math.min((plugin.settings.paginator.options.page + 1), plugin.settings.paginator.options.totalPages));
    });
    var $refresh = $paginatorContainer.find('.paginator-refresh');
    $refresh.click(function() {
        plugin.getAjaxData();
    });
},
setPaginatorParams: function(params) {
    if (typeof params == 'object') {
        this.settings.paginator.params = params;
    }
    return this;
},
getPaginatorParams: function() {
    return this.settings.paginator.params;
},
mergePaginatorParams: function(params) {
    this.settings.paginator.params = $.extend({}, this.settings.paginator.params, params);
},
countPaginatorParams: function() {
    if (!Object.keys) {
        Object.keys = function(obj) {
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
    var plugin = this;
    return Object.keys(plugin.settings.paginator.params).length;
},
clearPaginatorParams: function() {
    this.settings.paginator.params = {};
},
    /**
    * Actualiza el paginador con las paginas que deben estar visibles de acuerdo
    * a la pagina actual
    * @param options (no requerido) Si se pasa options se actualiza el objeto paginatorOptions
    * con los valores que sean pasados.{
    *
    *                                  }
    */
    updatePaginator: function(options) {
        if (options && typeof options == 'object') {
            this.updatePaginatorObject(options);
        }
    //Actualizar los elementos del paginator
    this.updatePagesPaginator();
},
    /**
    * Actualiza el objeto del paginado con los nuevos valores que le sean
    * pasados por parametros
    */
    updatePaginatorObject: function(options) {
        var pagOpts = this.settings.paginator.options;
        if (!isNaN(options.total)) {
            pagOpts.total = options.total;
        }
        if (options.page) {
            pagOpts.page = options.page;
        }
        if (options.pageSize) {
            pagOpts.pageSize = options.pageSize;
        }
        var totalPages = pagOpts.total / pagOpts.pageSize;
        if (pagOpts.total % pagOpts.pageSize != 0) {
            totalPages++;
        }

        pagOpts.totalPages = totalPages;
        this.settings.paginator.options = pagOpts;
    },
    /**
    * Cambia el tamanno de pagina para el paginado, por lo que actualiza la
    * tabla con la cantidad de datos nueva y comienza por la pagina 1.
    */
    changePaginatorSize: function(pageSize) {
        this.settings.paginator.options.pageSize = pageSize;
        this.settings.paginator.options.page = 1;
    //                plugin.updatePagesPaginator(1);
    //                plugin.updateBarPaginator();
    this.getAjaxData(1);
},
updatePagesPaginator: function(pInicial, pFinal) {
    var $paginator = this.settings.paginator.el;
    if (!$paginator)
        return this;
    var plugin = this;
    var options = this.settings.paginator.options;
    $paginator.find('li.item-page').remove();
    var $reference = $paginator.find('.paginator-before');
    if (!pInicial && !pFinal && options.pageInitial != undefined && options.pageFinal != undefined) {
        if (options.pageFinal - options.pageInitial + 1 != options.pageSize
            && options.pageFinal - options.pageInitial + 1 == options.totalPages) {
            pagInicial = options.pageInitial;
        pagFinal = options.pageFinal;
    } else {
        if (options.pageFinal > options.totalPages) {
            pagFinal = options.pageFinal = Math.max(options.totalPages, 1);
            pagInicial = Math.max(1, pagFinal - options.showPages);
            options.page = pagFinal;
        } else {
            pagInicial = options.pageInitial;
            if (options.totalPages <= options.pageFinal) {
                pagFinal = Math.max(options.totalPages, 1);
            } else {
                pagFinal = options.pageFinal;
            }
        }
    }
} else {
    var pagInicial = undefined;
    var pagFinal = undefined;
    if (pInicial) {
        pInicial = Math.max(1, pInicial);
        if ((options.totalPages - pInicial + 1) >= options.showPages) {
            pagInicial = pInicial;
            pagFinal = pInicial + options.showPages - 1;
        } else {
            pagFinal = Math.max(options.totalPages, 1);
            if (pagFinal - (options.showPages - 1) > 0) {
                pagInicial = pagFinal - (options.showPages - 1);
            } else {
                pagInicial = 1;
            }
        }
    } else if (pFinal) {
        pFinal = Math.min(options.totalPages, pFinal);
        if ((pFinal - (options.showPages - 1)) >= 1) {
            pagFinal = pFinal;
            pagInicial = pagFinal - (options.showPages - 1);
        } else {
            pagInicial = 1;
            if (pagInicial + (options.showPages - 1) <= options.totalPages) {
                pagFinal = pagInicial + (options.showPages - 1);
            } else {
                pagFinal = options.totalPages;
            }
        }
    }
    else {
        pagInicial = 1;
        if (pagInicial + (options.showPages - 1) <= options.totalPages) {
            pagFinal = pagInicial + (options.showPages - 1);
        } else {
            pagFinal = options.totalPages;
        }
    }
    options.pageInitial = pagInicial;
    options.pageFinal = pagFinal;
}
for (var i = pagInicial; i <= pagFinal; i++) {

    var clases = 'item-page';
    if (i == options.page) {
        clases += ' page-active';
    }
    var item = $('<li page="' + i + '" class="' + clases + '"><span >' + i + '</span></li>')
    .click(function() {
        if (plugin.settings.ajaxObj)
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
    if (options.page == 1) {

        $beginBefore.addClass('disabled')
        .unbind('click');
    } else {
        if ($beginBefore.hasClass('disabled')) {
            $beginBefore.filter('.paginator-begin')
            .removeClass('disabled')
            .click(function() {
                plugin.getAjaxData(1);
            });
            $beginBefore.filter('.paginator-before')
            .removeClass('disabled')
            .click(function() {
                plugin.getAjaxData(options.page - 1);
            });
        }
    }

    var $endNext = $paginator.find('.paginator-end, .paginator-next')
    .unbind('click');
    if (options.page == options.totalPages || options.totalPages == 0 || options.totalPages == 1) {
        $endNext.addClass('disabled');
    } else {
        $endNext.filter('.paginator-end')
        .click(function() {
            plugin.getAjaxData(options.totalPages);
        });
        $endNext.filter('.paginator-next')
        .click(function() {
            plugin.getAjaxData(options.page + 1);
        });
        if ($endNext.hasClass('disabled')) {
            $endNext.removeClass('disabled');
        }
    }
    if (options.showBar)
        setTimeout($.proxy(plugin.updateBarPaginator, this), 100);
    return plugin;
},
updateBarPaginator: function() {
    var plugin = this;
    //        console.log(plugin) ;
    var $paginator = plugin.settings.paginator.el;
    var options = this.settings.paginator.options;
    var $progress = $paginator.find('.progress .bar');
    var primero = options.total != 0 ? (options.page - 1) * options.pageSize + 1 : 0;
    var totalCargados = 0;
    if (options.pageSize < 0) {
        totalCargados = options.total;
    } else {
        totalCargados = Math.min(options.page * options.pageSize, options.total);
    }
    var percent = options.total != 0 ? totalCargados * 100 / options.total : 0;
    $progress.css({width: percent + '%'});
    var text = '';
    if (!isNaN(options.total)) {

        text = options.barText + ' ' + primero + ' - ' + totalCargados + ' / ' + options.total;
    } else {
        text = options.barText + ' 0 - 0 / 0 ';
    }
    $paginator.find('.progress-text-infront, .progress-text-behind')
    .html(text);
},
    //Acciones para la carga de datos
    /**
    * Obtiene datos por ajax mediante el uso del paginado y filtro aplicado
    */
    getAjaxData: function(page, params) {
        var plugin = this;
        if (plugin.settings.ajaxObj) {
            return;
    //                plugin.settings.ajaxObj.abort();
}
var options = plugin.settings.paginator.options;
if (page > options.totalPages) {
    page = Math.max(options.totalPages, 1);
} else if (page < 1) {
    page = 1;
}
var data = {};
data.page = (page != undefined) ? page : options.page;
data.pageSize = options.pageSize;
data = $.extend({}, params, data, plugin.settings.paginator.params);
    //Mostrar el cargando ...
    plugin.showLoading();
    plugin.settings.ajaxObj = $.ajax({
        url: plugin.settings.urlSource
        , data: data
        , method: 'GET'
        , async: true
        , dataType: 'JSON'
        , success: function(response) {
            if (response.success) {
                plugin.settings.paginator.options.total = response.total;
                var totalPages = parseInt(response.total / plugin.settings.paginator.options.pageSize);
                if (response.total % plugin.settings.paginator.options.pageSize > 0) {
                    totalPages++;
                }
                plugin.settings.paginator.options.totalPages = parseInt(totalPages);
                plugin.removeAllRows();
                var root = plugin.settings.root;
                if (response[root].length != 0) {
                    $(response[root]).each(function(obj, val) {
                        var row = plugin.getRowBuilder().call(plugin, val);
                        plugin.appendRow(row, val);
                    });
                    plugin.$element.trigger('data.loaded', [response[root]]);
                } else {
                    var row = plugin.buildNoDataRow();
                    plugin.appendRow(row, null);
                }

    //Cambiar
    if (page) {
        options.page = page;
    }
    if ((page && page == options.pageInitial && options.pageInitial != 1)
        || page && page > options.pageFinal) {
        plugin.updatePagesPaginator(undefined, page);
    //                            setTimeout(plugin.updatePagesPaginator, 100, undefined, page);
} else if ((page && page == options.pageFinal && options.pageFinal != options.totalPages)
    || page == 1 || page < options.pageInitial) {
    plugin.updatePagesPaginator(page);
    //                            setTimeout(plugin.updatePagesPaginator, 100, page);
} else {
    plugin.updatePagesPaginator();
    //                            setTimeout(plugin.updatePagesPaginator, 100);
}

    //                        plugin.updateBarPaginator();

} else {
    //                        alert('Success false');
}
    //Ocultar el cargando...
    plugin.bindSelectionTrigger();
    plugin.hideLoading();
    plugin.settings.ajaxObj = null;
}
, error: function(obj) {
    //Ocultar el cargando...
    plugin.hideLoading();
    plugin.settings.ajaxObj = null;
}

});
},
    /**
    * Actualiza los datos de la tabla haciendo uso de los datos de paginado
    * y ordenamiento actuales
    */
    updateTable: function() {
        this.getAjaxData();
    },
    getRowBuilder: function() {
        if (this.settings.renderRow) {
            return this.settings.renderRow;
        }
        return this.buildRow;
    },
    /**
    * Construye una fila determinada de acuerdo a los datos pasados y le 
    * agrega los eventos correspondientes.
    */
    buildRow: function(data, type) {
        type = type || '';
        var plugin = this;
        var row = $('<tr></tr>').addClass(type);
        var columns = this.settings.header.columns;

        if(this.settings.header.options.selectedAll == true){
            $('<td style="width:15px"><input class="checkbox-row-selector" type="checkbox" name="id"/></td>')
            .find('input')
            .attr('value', data[plugin.settings.idIndex])
            .click(function(evt) {
                evt.stopPropagation();
            })
            .change(function() {
                plugin.bindSelectionTrigger();
                plugin.toggleSelectionRow(row, $(this).attr('checked'));
            })
            .end()
            .appendTo(row);
        }

        for (var col in columns) {
            var renderFunction = plugin.getRenderFunction(columns[col]['name']);
            if (!renderFunction) {
                $('<td ></td>').appendTo(row).html(data[columns[col]['name']]);
            } else {
                $('<td></td>').append($(renderFunction.call(plugin, data[columns[col]['name']], data)))
                .appendTo(row);
            }
        }
        row.data('row', data).click(function(evt) {
    //evt.stopPropagation();
    evt.preventDefault();
    var $checkbox = $(this).find('input.checkbox-row-selector[type="checkbox"]');
    if (!evt.ctrlKey)
        plugin.selectUnselectAll(false);
    $checkbox.attr('checked', $checkbox.attr('checked') ? false : 'checked')
    .trigger('change');
    //                plugin.selectRow()  //Aqui
});
        return row;
    },
    getRenderFunction: function(index) {
        if (this.settings.renderColumns[index]) {
            return this.settings.renderColumns[index];
        }
        return false;
    },
    bindSelectionTrigger: function() {
        this.$element.trigger('selection.change', [this.getRowsChecked()]);
    },
    toggleSelectionRow: function($row, checked) {
        if (checked) {
            $row.addClass('info')
        } else {
            $row.removeClass('info');
        }
    },
    /**
    * Construye una fila con el texto configurado de no resultados.
    * @param row String Texto a mostrar
    */
    buildNoDataRow: function(text) {
        return $('<tr><td colspan="' + (this.settings.header.columns.length + 1) + '"><span class="">' + this.settings.msgNoDataLoaded + '</span></td></tr>');
    },
    /**
    * Retorna todas la filas
    */
    getAllRows: function() {
        return this.settings.rowsContainer.children('tr');
    },
    /**
    * Retorna los valores de todas la filas
    */
    getAllValues: function() {
        return this.settings.rowsContainer.children('tr').map(function() {
            return $(this).data('row');
        });
    },
    /**
    * Retorna la fila de una posición
    * @param pos Integer Índice de la fila
    */
    getRowAt: function(pos) {
        return $(this.settings.rowsContainer.children('tr')[pos]);
    },
    /**
    * Elimina todas las filas cargadas.
    */
    removeAllRows: function() {
        this.settings.rowsContainer.children('tr').remove();
    },
    /**
    * Elimina una fila determinada de acuerdo al index de la misma.
    * @param pos Indice a eliminar
    */
    removeRowAt: function(pos) {
        var rows = this.settings.rowsContainer.children()
        , row = rows[pos];
        if (row) {
            row.remove();
            this.$element.trigger('row.removed', [row, $(row).data('row')]);
        }
        return this;
    },
    /**
    * Adiciona una fila determinada al final de la tabla.
    * @param row Fila
    * @param data Datos asociados
    * @returns plugin
    */
    appendRow: function(row) {
        this.settings.rowsContainer.append(row);
        this.$element.trigger('row.appended', [row, row.data('row')]);
        return this;
    },
    /**
    * Adiciona un arreglo de filas al final de la tabla.
    * @param rows Array Contiene objetos {row: fila, data:datos}
    */
    appendRows: function(rows) {
        var lastPos = this.rowsContainer.children('tr').length - 1;
        for (var i = 0; i < rows.length; i++) {
            this.insertRow(lastPos++, rows[i]);
        }
        this.$element.trigger('rows.appended', [rows]);
        return this;
    },
    /**
    * Adiciona una fila determinada al inicio de la tabla.
    */
    prependRow: function(row) {
        this.settings.rowsContainer.prepend(row);
        this.$element.trigger('row.appended', [row, row.data('row')]);
        return this;
    },
    /**
    * Adiciona un arreglo de filas al inicio de la tabla.
    * @param Array Contiene objetos {row: fila, data:datos}
    */
    prependRows: function(rows) {
        for (var i = 0; i < rows.length; i++) {
            this.insertRow(i, rows[i]);
        }
        this.$element.trigger('rows.appended', [rows]);
        return this;
    },
    /**
    * Inserta una fila en una posición específica.
    * @param pos Integer Número entero a partir de 0
    * @param $row Array(objeto del dom) fila en el ámbito de jQuery
    * @param data Object datos asociados a la fila
    */
    insertRow: function(pos, $row, data) {
        $row = $row.length ? $row : $($row);
        if (isNaN(pos))
            return;
        var rows = this.settings.rowsContainer.children();
        if (!rows.length || pos <= 0) {
            return this.prependRow($row);
        } else if (pos > rows.length - 1) {
            return this.appendRow($row);
        }
        if (rows[pos]) {
            var ref = rows[pos];
            $row.insertBefore(ref);
            this.$element.trigger('row.appended', [$row, data]);
        }

        return this;
    },
    insert: function(pos, data, type) {
        if (data && data.length) {
            var rows = [];
            for (var i = 0; i < data.length; i++) {
                this.insertRow(pos++, this.getRowBuilder().call(this, data[i], type || ''), data[i]);
            }
        } else if (data) {
            var row = this.getRowBuilder().call(this, data);
            this.insertRow(pos, row, data);
        }
    },
    /**
    * Selecciona o des-selecciona todas las filas dependiento de checked(
    * true: selecciona todas, false: des-selecciona todas).
*/
selectUnselectAll: function(checked) {
    var check = checked ? 'checked' : false;
    var plugin = this;
    this.settings.rowsContainer.find('tr > td:first-child input.checkbox-row-selector').each(function() {
        $(this).attr('checked', check);
    });
    this.getAllRows().each(function() {
        plugin.toggleSelectionRow($(this), check);
    })
    this.bindSelectionTrigger();
},
    //Funcionalidades para consumir publicamente

    /**
    * Obtiene la fila seleccionada con click, o la ultima que fue chequeada
    */
    getRowSelected: function() {

    },
    /**
    * Obtiene las filas nuevas.
    */
    getRowsNews: function() {
        return this.settings.rowsContainer.children('tr.new');
    },
    /**
    * Obtiene los valores de las filas nuevas.
    */
    getRowsNewsValues: function() {
        var data = [];
        this.settings.rowsContainer.children('tr.new').each(function() {
            data.push($(this).data('row'));
        });
        return data;
    },
    /**
    * Obtiene las filas modificadas.
    */
    getRowsModifieds: function() {
        return this.settings.rowsContainer.children('tr.modified');
    },
    /**
    * Obtiene los valores de las filas nuevas.
    */
    getRowsModifiedsValues: function() {
        var data = [];
        this.settings.rowsContainer.children('tr.modified').each(function() {
            data.push($(this).data('row'));
        });
        return data;
    },
    /**
    * Obtiene las filas que posean el checkbox de seleccion con valor checked.
    */
    getRowsChecked: function() {
        var data = [];
        this.settings.rowsContainer.find('tr > td input.checkbox-row-selector:checked').each(function() {
            data.push($(this).closest('tr').data('row'));
        });
        return data;
    },
    /**
    * Obtiene los valores de las filasseleccionadas.
    */
    getRowsCheckedValues: function() {
        return this.getRowsChecked;
    },
    /**
    * Elimina la fila que se encuentra seleccionada.
    */
    removeRowSelected: function() {

    },
    /**
    * Elimina las filas que se encuentra seleccionadas mediante el checkbox.
    */
    removeRowsChecked: function() {
        return this.getRowsChecked().remove();
    },
    removeRows: function(rows) {
        var removed = [];
        this.getAllRows().each(function() {
            for (var i = 0; i < rows.length; i++)
                if ($(this).data('row') == rows[i])
                    removed.push($(this).remove());
            });
        return removed;
    },
    /**
    * Muestra el cargando datos
    */
    showLoading: function(msg) {
        // var $tmpl = $('<div class="tr-loading"> <div class="td-loading"> <div class="loading-progress-container"> <div class="progress progress-striped active"><div style="width: 100%;" class="bar"><strong>' + (msg ? msg : this.settings.msgLoading) + '</strong></div></div></div></div></div>');
        // this.$element.find('.grid-body')
        // .find('.tr-loading')
        // .remove()
        // .end()
        // .append($tmpl);

        this.$element.find('.grid-body').block({message: this.settings.msgLoading,overlayCSS: { backgroundColor: 'black' } });
    //            $tmpl.fadeIn('fast');
},
    /**
    * Oculta el cargando datos
    */
    hideLoading: function() {
        this.$element.find('.grid-body').unblock(); 
    },

    /**
    * Bloquea el grid
    */
    block: function(msg) {
      this.$element.block({message: null,overlayCSS: { backgroundColor: 'black', cursor:'not-allowed'  } });
  },
    /**
    * Desbloquea el grid
    */
    unBlock: function() {
        this.$element.unblock(); 
    },

    /*
    * Iniciando la barra de botones
    */
    initToolbar: function() {
        if (this.settings.toolbar.options.show == true) {

            var toolbar = this.settings.toolbar.el;
            if (toolbar == undefined) {
                toolbar = $('<ul class="nav nav-pills nav-actions-container "></div>');
                this.settings.toolbar.el = toolbar;
                if (this.$element.find('.grid-body'))
                    this.$element.find('.grid-body').append($('<div class="grid-body-toolbars"></div>').append($('<div class="subnav" ></div>').append(toolbar)));
                else {
                    this.$element.append($('<div class="grid-body"></div>').append($('<div class="grid-body-toolbars"></div>').append($('<div class="subnav" ></div>').append(toolbar))))
                }
            } else {
                toolbar = $(this.settings.toolbar.el);
            }

            /*
            * si el usuario quiere mostrar el btn adicionar
            */
            if (this.settings.toolbar.options.btnAdd.options.show == true) {
            // si ha seleccionado alguno 
            var btnAdd = this.settings.toolbar.options.btnAdd.el;
            var plugin =  this ;
            if (this.settings.toolbar.options.btnAdd.options.action === undefined) {
                this.settings.toolbar.options.btnAdd.options.action = function() {
                   plugin.showAddModal() ;
               }
           }

           if (btnAdd === undefined) {
            btnAdd = this.createButton(this.settings.toolbar.options.btnAdd.options);
            toolbar.append(btnAdd);
        } else {
            var min = this.settings.toolbar.options.btnAdd.options.minSelection;
            var max = this.settings.toolbar.options.btnAdd.options.maxSelection;
            this.addSelectionChange(min, max, btnAdd);
        }

            //   this.getModalMenu('Adicionar', 'add').modal('toggle');
        }

            /*
            * si el usuario quiere mostrar el btn editar
            */
            if (this.settings.toolbar.options.btnEdit.options.show) {

                var btnEdit = this.settings.toolbar.options.btnEdit.el;
                if (this.settings.toolbar.options.btnEdit.options.action === undefined) {
                    this.settings.toolbar.options.btnEdit.options.action = function() {
                       plugin.showEditModal() ;
                   };
               }

               if (btnEdit === undefined) {
                btnEdit = this.createButton(this.settings.toolbar.options.btnEdit.options);
                toolbar.append(btnEdit);
            } else {
                var min = this.settings.toolbar.options.btnEdit.options.minSelection;
                var max = this.settings.toolbar.options.btnEdit.options.maxSelection;
                this.addSelectionChange(min, max, btnEdit);
            }

            // this.getModalMenu('Editar', 'edt').modal('toggle');
        }

            /*
            * si el usuario quiere mostrar el btn eliminar
            */
            if (this.settings.toolbar.options.btnDel.options.show) {
            // si ha seleccionado alguno 
            var btnDel = this.settings.toolbar.options.btnDel.el;
            if (this.settings.toolbar.options.btnDel.options.action === undefined) {
                this.settings.toolbar.options.btnDel.options.action = function() {
                    var url = plugin.settings.urlDel;
                    var data = plugin.getRowsChecked();
                    if (data.length != 0){
                        var msg = "¿Está seguro desea eliminar el elemento seleccionado?";
                        if(data.length >1)
                            msg = "¿Está seguro desea eliminar los elementos  seleccionados?";
                        bootbox.vuConfirm(msg , 'CONFIRM', function(del){
                                if(del){
                                    var sendData = [];
                                    $(data).each(function() {
                                        sendData.push(this.id_menu);
                                    });
                                    $.ajax({
                                        url: url,
                                        type: 'POST',
                                        data: {
                                            id_menu: JSON.stringify(sendData)
                                        },
                                        success: function(response) {
                                            var data = JSON.parse(response);
                                            if (data.success == true) {
                                                bootbox.vuAlert(data.data, 'INFO');
                                            } else {
                                                if (data.success == false) {
                                                    bootbox.vuAlert(data.data.errors, 'ERROR');
                                                }
                                            }
                                        },
                                        error: function() {

                                        }
                                    });
                                }
                        });
                    }           
                }
            }

if (btnDel === undefined) {
    btnDel = this.createButton(this.settings.toolbar.options.btnDel.options);
    toolbar.append(btnDel);
} else {
    var min = this.settings.toolbar.options.btnDel.options.minSelection;
    var max = this.settings.toolbar.options.btnDel.options.maxSelection;
    this.addSelectionChange(min, max, btnDel);
}
}
}
},
createButton: function(data) {
    var a = $('<a></a>');
    if (data.icon !== undefined)
        a.append($('<i class="' + data.icon + '"></i>'));
    if (data.title !== undefined)
        a.append($('<span>' + data.title + '</span>'));
    if (data.id !== undefined)
        a.attr('id', data.id);
    var btn = $('<li class=""></li>').append(a);
    if (data.action !== undefined)
        btn.click(data.action);
    var min = 0;
    if (data.minSelection !== undefined) {
        btn.attr('minselection', data.minSelection);
        min = data.minSelection;
    }

    var max = null;
    if (data.maxSelection !== undefined) {
        btn.attr('maxselection', data.maxSelection);
        max = data.maxSelection;
    }

    this.addSelectionChange(min, max, btn);
    return btn;
},
buildModal:function(){
    var modal = this.settings.modal.el ;
    if(modal == undefined){
        modal = $('<div id="myModal2" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"></div>');
        var modal_header = $('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3 id="myModalLabel"></h3></div>') ;
        var modal_body = $('<div class="modal-body"></div>');
        var modal_footer = $('<div class="modal-footer"><button class="btn" data-dismiss="modal">Close</button><button class="btn btn-primary">Save changes</button></div>');
        var form = $('<form id="myform" action="" metod="POST"></form>') ;
        modal.append(modal_header);
        modal_body.append(form);
        modal.append(modal_body);
        modal.append(modal_footer);
        modal.
        this.settings.modal.el = modal ;
        this.$element.append(modal) ;
    }

    var form = this.settings.modal.options.form.el ;
    if(form == undefined){
        form = $(modal).find('form') ;
        this.settings.modal.options.form.el =  form ;
    }

    var btn = this.settings.modal.options.btnAction ;
    if(btn == undefined){
        btn = $(modal).find('.btn-primary') ;
        this.settings.modal.options.btnAction =  form ;
    }
    // form.vuForm() ;
    btn.click(function(){
        form.submit() ;
    });


},
addSelectionChange: function(min, max, btn) {
    var $el = $(btn);
    this.$element.on('selection.change', function(evt, rows) {
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
},
showAddModal:function(){

    var $modal = $(this.settings.modal.el) ;
    var modal = this.settings.modal ;
    var $form = $(this.settings.modal.options.form.el) ;
    var url = this.settings.urlAdd;

    $modal.find('h3').text(modal.options.addTitle) ;
    // al formulario le seteo los valores

    // le cambio la url de los datos
    $modal.modal('show') ;
},
showEditModal:function(){
    var $modal = $(this.settings.modal.el) ;
    var modal = this.settings.modal ;
    var $form = $(modal.options.form.el) ;
    var url = this.settings.urlAdd;
    //var formData = $.getFormsValues($form, {token: true});//shortNames: true,      

    $modal.find('h3').text(this.settings.modal.options.editTitle)
    // al formulario le seteo los valores
    // le cambio la url de los datos
    $modal.modal('show') ;
},
hideModal:function(){
    $(this.settings.modal.el).modal('hide') ;
}
};

$.fn.vuGrid = function(options) {
    if (this.length) {
        var element = this[0]
        , grid = $(element).data('vuGrid');
        if (undefined == grid) {
            var obj = new VU.Components.vuGrid(element, options);
            $(element).data('vuGrid', obj);
            return obj;
        } else {
            if (options && typeof options == 'string' && grid[options])
                return VU.Components.vuGridToGrid[options]();
            return grid;
        }
    }
    return this;
}

}(window.jQuery);