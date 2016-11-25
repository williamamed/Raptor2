
(function ($) {
    UIR.namespace('UIR.Panel');
    UIR.Panel.Table = function (el, options) {
        this.options = options;
        this.element = el;
        this.init();

    }


    UIR.Panel.Table.prototype = {
        constructor: UIR.Panel.Table,
        init: function () {
            var empty = {};
            this.options = $.extend(empty, this.defaultOptions, this.options);
            this.extraParams={};
            var $element = $(this.element);
            this.$element = $element;
            this.container = $("<div></div>");
            if (this.options.putRootClass === true)
                this.container.addClass('uir-table container-fluid');
            $element.before(this.container);

            //this.container.append($element);

            this.body = $element.find('tbody');

            if (this.body.size() == 0) {
                this.body = $('<tbody></tbody>');
                $element.append(this.body);
            }
            //Loading template
            this.loading = $('<div></div>');
            this.loading.addClass('')
            this.loading.append('<div class="uir-table-loading-indicator"></div>')
            this.loading.append('<h4 class="uir-table-loading-text" style="text-align:center;position:absolute;top:50%;margin-top: 20px;width:100%">Cargando..</h4>')
            this.loading.css({
                'background': 'rgba(0,0,0,0.5)',
                'position': 'absolute',
                'zIndex': '100000'
            });
            this.loading.appendTo(document.body);

            this.loading.hide();
            //Filas de arriba y abajo
            this.rowUp = $("<div class='row-fluid'>");
            this.rowCenter = $("<div class='row-fluid'>");

            this.rowDown = $("<div class='row-fluid'>");
            this.container.prepend(this.rowUp);
            this.container.append(this.rowCenter);
            this.container.append(this.rowDown);
            //Lugar de derecha e izquierda de arriba
            this.rowUpLeft = $("<div class='col-lg-9'></div>");
            this.rowUpRight = $("<div class='col-lg-3'></div>");
            this.rowUp.append(this.rowUpLeft);
            this.rowUp.append(this.rowUpRight);
            if (this.options.hideTop == true)
                this.rowUp.hide();
            if (this.options.searching == true) {
                var con = $('<div></div>');
                con.addClass('input-group');
                //con.addClass('col-md-3');

                this.searchingEl = $("<input class='form-control' type='text'>");
                //con.addClass('pull-right');
                this.searchingEl.attr('placeholder', 'Buscar...');
                con.append(this.searchingEl);
                this.searchingEl.on('keypress', this, this.onSearch);
                this.btnSearch = $('<button class="btn btn-primary"><span class="glyphicon glyphicon-search"></span></button>');
                var span = $('<span class="input-group-btn">');

                span.append(this.btnSearch);
                con.append(span)
                this.btnSearch.css('height', '35px');

                this.rowUpRight.append(con);
                this.btnSearch.click(this, this.onSearchBtn);
            }

            this.rowTable = $("<div class='col-lg-12'></div>");
            this.rowTable.append($element);
            if (this.options.height) {
                this.rowTable.css({
                    overflow: 'hidden',
                    marginTop: 5
                })
                this.rowTable.height(this.options.height)
                this.rowTable.perfectScrollbar({
                    suppressScrollX: true
                });

            }


            this.rowCenter.append(this.rowTable);
            //$element.css('marginTop',5);

            if (this.options.header) {
                $element.find('thead').remove();
                this.header = $('<thead></thead>');
                $element.prepend(this.header);
                var tr = $('<tr></tr>');
                this.header.append(tr);
                var cantHeader = this.options.header.length;
                if (this.options.multi == true) {
                    var th = $('<th></th>');
                    var check = $('<input type="checkbox" />');
                    th.append(check);
                    th.width(15);
                    tr.append(th);
                    var me = this;
                    th.change(function () {
                        var state = $(this).find('input').get(0).checked;

                        me.body.find('input').each(function () {
                            $(this).get(0).checked = state;
                        });

                    })

                }
                for (var i = 0; i < cantHeader; ++i) {
                    if (this.options.header[i].hidden !== true) {
                        var th = $('<th></th>');
                        th.html(this.options.header[i].title);
                        tr.append(th);

                    }
                }
            }
            this.data = [];
            var data = [];



            this.body.find('tr').each(function () {
                var row = [];
                $(this).find('td').each(function () {
                    row.push($(this).html())
                });
                data.push(row);
            })
            this.data = data;
            this.dataCount = this.data.length;
            if (this.options.paging == true) {
                this.currentPage = 1;
                this.pagingSelect = $("<select class='form-control' name='example_length' size='1'>" +
                        "<option value='10' selected='selected'>10</option>" +
                        "<option value='25'>25</option>" +
                        " <option value='50'>50</option>" +
                        "<option value='100'>100</option>" +
                        "</select>");
                this.rowDownLeft = $("<div class='col-lg-2'></div>");
                this.rowDownLeft.append(this.pagingSelect);
                this.rowDown.append(this.rowDownLeft);

                this.pagination = $("<nav>" +
                        "<ul class='pagination'>" +
                        " <li><a href='#'><span aria-hidden='true'>&laquo;</span><span class='sr-only'>Previous</span></a></li>" +
                        " <li class='prev'><a href='#'><span aria-hidden='true'>&raquo;</span><span class='sr-only'>Next</span></a></li>" +
                        " </ul>" +
                        "</nav>");
                this.rowDownRight = $("<div class='col-lg-6 pull-right'></div>");
                this.rowDownRight.append(this.pagination);
                this.pagination.addClass('pull-right');
                this.rowDown.append(this.rowDownRight);
                this.pagingSelect.change(this, this.onSelectChange);
                this.pagination.empty();
                if (this.options.url) {
                    this.body.empty();
                    if (this.options.autoload == true)
                        this.makeLoad();
                } else {
                    this.pagingSelect.trigger('change');
                }
            } else {
                if (this.options.url) {
                    if (this.options.autoload == true)
                        this.makeLoad();
                } else {
                    this.reDraw('all');
                }

            }

            this.onFixHeader();
            // alert(this.container.height())
        },
        onSearch: function (e) {
            if (e.which == 13) {
                $('a').focus();
                e.data.currentPage = 1;
                e.data.makeLoad('', {query: e.data.searchingEl.val()});
            }
        },
        onFixHeader: function () {

            var clone = this.$element.find('thead').clone(true);

            this.fixHeader = $('<table class="table table-bordered2 uir-table"></table>').css({'position': 'fixed'}).appendTo(this.rowTable);
            this.fixHeader.hide();
            clone.appendTo(this.fixHeader);
            this.fixHeader.css('zIndex', 10);
            this.rowTable.on('scroll', $.proxy(this.eventFixHeader, this))
            $(window).on('scroll', $.proxy(this.eventFixHeader, this));

            $(window).on('resize', $.proxy(this.eventFixHeader, this));
        },
        eventFixHeader: function () {
            var scroll = $(window).scrollTop();

            if (this.rowTable.scrollTop() > 0) {
                this.fixHeader.show();

                this.fixHeader.css({
                    top: this.rowTable.offset().top - scroll,
                    left: this.$element.find('thead').offset().left,
                    width: this.$element.find('thead').width()
                })
                var el = this.$element;
                var tds = this.$element.find('thead th');
                var cont = 0;
                this.fixHeader.find('th').each(function () {
                    $(this).width($(tds.get(cont)).width())
                    cont++;
                })
            } else {
                this.fixHeader.hide();
            }
        },
        onSearchBtn: function (e) {


            e.data.currentPage = 1;
            e.data.makeLoad('', {query: e.data.searchingEl.val()});

        },
        onLoadServer: function (dataLoaded) {
            this.hideLoading();
            var data = dataLoaded;
            this.rowData = dataLoaded;
            if (this.options.reader) {
                data = dataLoaded[this.options.reader];
            }

            if (this.options.paging == true) {
                this.data = data.data;
                this.sorting();
                this.dataCount = data.size;
                if (this.data == undefined) {
                    this.data = [];
                    this.dataCount = 0;
                }
                this.reDraw(this.pagingSelect.val(), this.currentPage, true);
                this.updatePagination();
                this.updatePaginationClick();
                //this.pagingSelect.trigger('change');
            } else {

                this.data = data;
                this.sorting();
                this.dataCount = this.data.length
                this.reDraw('all');
            }
            var e = $.Event('loaded')

            this.$element.trigger(e)

        },
        makeLoad: function (url, opt) {
            this.showLoading();
            this.__on_deselect_row.call(this.__on_deselect_row_scope);
            var e = $.Event('rowdeselect');

            this.$element.trigger(e);

            var me = this;
            if (!url || url == '')
                url = this.options.url;
            if (typeof url == 'object') {
                opt = url;
                url = this.options.url;
            }

            var op = {};
            if (this.options.paging === true) {

                var numpag = this.pagingSelect.val();

                op = $.extend(this.extraParams, {size: numpag, page: this.currentPage}, opt);
            } else
                op = $.extend(this.extraParams, {}, opt);
            if (this.options.searching == true)
                op.query = this.searchingEl.val();

            $.ajax({
                url: url,
                type: 'POST',
                data: op,
                success: function (data) {
                    me.onLoadServer(data);

                },
                error: function () {
                    me.onLoadServer([]);
                }
            });

        },
        onSelectChange: function (e) {
            if (e.data.options.url) {
                e.data.currentPage = 1;
                e.data.makeLoad('', {size: e.data.pagingSelect.val(), page: 1});
            } else {
                e.data.reDraw($(this).val());
                e.data.updatePagination();
            }
        },
        updatePagination: function () {
            var num = this.dataCount / this.pagingSelect.val();
            var rest = this.dataCount % this.pagingSelect.val();
            var cant = parseInt(num);
            if (rest > 0)
                cant++;
            this.pagination.empty();

            this.pagination.append("<ul class='pagination'>" +
                    " <li class='prev'><a ><span aria-hidden='true'>&laquo;</span><span class='sr-only'>Previous</span></a></li>" +
                    " <li class='next'><a ><span aria-hidden='true'>&raquo;</span><span class='sr-only'>Next</span></a></li>" +
                    " </ul>");
            this.prevButton = this.pagination.find('li[class=prev] a');
            this.nextButton = this.pagination.find('li[class=next] a');

            if (this.currentPage == 1 || this.dataCount == 0) {
//                        this.prevButton.hide();
                this.prevButton.parents('li').addClass('disabled');
            } else {
                this.prevButton.parents('li').removeClass('disabled');
            }

            if (this.currentPage * this.pagingSelect.val() >= this.dataCount) {
//                        this.nextButton.hide();
                this.nextButton.parents('li').addClass('disabled');
            }


            var start = this.currentPage % 3 == 0 ? this.currentPage : parseInt((this.currentPage / 3)) + 1;
            var end = start + 2;
            if (end > cant) {
                end = cant;
                start = cant - 2;
                if (start < 1)
                    start = 1;
            }
            for (var i = start; i <= end; ++i) {
                var pag = $('<li class="uir-pag uir-pag-' + i + '"><a >' + i + '</a></li>');
                pag.data('pag', i);
                this.nextButton.parents('li').before(pag);
            }
            this.pagination.find('li').removeClass('active');
            this.pagination.find('li.uir-pag-' + this.currentPage).addClass('active');
            this.pagination.find('li.uir-pag a').click({scope: this, button: 3}, this.onPageClick);
            this.nextButton.click({scope: this, button: 2}, this.onPageClick);
            this.prevButton.click({scope: this, button: 1}, this.onPageClick);


        },
        onPageClick: function (e) {
            if ($(this).parents('li').hasClass('disabled') || $(this).parents('li').hasClass('active'))
                return false;
            var me = e.data.scope;
            var opt = e.data.button;
            var numpag = me.pagingSelect.val();

            if (opt == 1) {
                me.currentPage--;

            }
            if (opt == 2) {
                me.currentPage++;

            }
            if (opt == 3) {
                me.currentPage = $(this).parents('li').data('pag');
            }
            if (me.options.url) {
                me.makeLoad('', {size: numpag, page: me.currentPage});
            } else {
                me.reDraw(numpag, me.currentPage);
                me.updatePaginationClick();
            }

        },
        updatePaginationClick: function (e) {
            var me = this;
            me.nextButton.show();
            me.prevButton.show();
            if (me.currentPage * me.pagingSelect.val() >= me.dataCount) {
//                        me.nextButton.hide();
//                        me.prevButton.show();
                me.nextButton.parents('li').addClass('disabled');
                me.prevButton.parents('li').removeClass('disabled')
            } else {
//                        me.nextButton.show();
                me.nextButton.parents('li').removeClass('disabled');
            }
            if (me.currentPage == 1) {
//                        me.prevButton.hide();
                me.prevButton.parents('li').addClass('disabled')
            }

        },
        defaultOptions: {
            url: false,
            paging: true,
            searching: true,
            header: [],
            data: [],
            reader: false,
            multi: false,
            autoload: true,
            hideTop: false,
            putRootClass: true
        },
        setPagingOptions: function (options) {

        },
        reDraw: function (numpag, page, ajax) {

            this.body.empty();

            if (this.options.multi == true) {

                this.header.find('input').get(0).checked = false;
            }
            var init = 0;
            if (ajax !== true && page && numpag != 'all') {
                init = (page * numpag) - numpag;
                numpag = page * numpag;
            }
            if (numpag == 'all' || numpag > this.data.length)
                numpag = this.data.length;
            for (var i = init; i < numpag; ++i) {
                this.add(this.data[i]);

            }
            if (numpag == 0) {
                this.rowUpLeft.empty();
                $('.uir-table-no-data').remove();
                this.rowUpLeft.append('<span class="label label-info text-center " style="margin-top:10px;">No se encontraron datos para mostrar</span>');
                this.rowCenter.append('<div class="uir-table-no-data" style="text-align:center;color:gray;border-bottom:1px #d3d3d3 solid ;text-shadow: 0 2px 4px rgba(0, 0, 0, .6);padding-bottom:15px;margin-bottom: 10px">Sin datos para mostrar</div>')
            } else {
                $('.uir-table-no-data').remove();
                this.rowUpLeft.empty();
                var text = '';
                if (this.options.paging == true) {
                    var total = parseInt(this.dataCount / this.pagingSelect.val());
                    var rest = this.dataCount % this.pagingSelect.val();
                    if (rest > 0)
                        total++;
                    text += "Página " + this.currentPage + " de " + total + " - ";
                }
                var can = numpag - init;
                text += "Mostrando " + can + " de " + this.dataCount;
                this.rowUpLeft.append('<span class="label label-info text-center " style="margin-top:10px;">' + text + '</span>');
            }
            this.rowTable.scrollTop(0);
        },
        onRowClick: function (e) {
            //if(e.data.options.multi==false||e.ctrlKey==false)
            e.data.body.find('tr').removeClass('selected');
            $(this).addClass('selected');
            e.data.__on_select_row.call(e.data.__on_select_row_scope, $(this));
            var e2 = $.Event('rowselect');

            e.data.$element.trigger(e2, [$(this).data('row'), $(this)]);
        },
        onTableSelect: function (fun, scope) {
            this.__on_select_row = fun;
            this.__on_select_row_scope = scope;
        },
        __on_select_row: function () {

        },
        onTableDeSelect: function (fun, scope) {
            this.__on_deselect_row = fun;
            this.__on_deselect_row_scope = scope;
        },
        __on_deselect_row: function () {

        },
        add: function (row, index) {
            var tr = $('<tr>');
            tr.click(this, this.onRowClick);
            var cant = row.length;
            var data = row;
            if (this.options.multi == true) {
                var th = $('<th></th>');
                var check = $('<input type="checkbox" />');
                th.append(check);
                var me = this;
                th.change(function (e) {

                    var state = $(this).find('input').get(0).checked;
                    if (state) {
                        $(this).addClass('selected');
                    } else {
                        $(this).removeClass('selected');
                        me.header.find('input').get(0).checked = false;
                    }


                })
                tr.append(th);
            }
            if (row instanceof Object) {
                var me = this;

                if (me.options.header) {
                    $.each(me.options.header, function (i2, val2) {

                        $.each(row, function (i, val) {
                            if (val2.index === i && val2.hidden !== true) {
                                var td = $('<td>');
                                if (val2.render instanceof Function)
                                    td.html(val2.render.call(me, val, row));
                                else
                                    td.html(val);
                                tr.append(td);
                                if (val2.style)
                                    td.attr('style', val2.style);
                                if (val2.cls)
                                    td.addClass(val2.cls);

                                if (val2.editable) {
                                    var clicked = false;
                                    var funcion = function (e) {

                                        if (clicked) {
                                            clicked = false;
                                            return;
                                        }
                                        e.stopPropagation();
                                        var before = td.html();
                                        var sub = $('<div>');
                                        sub.append(before);
                                        td.empty();
                                        td.append(sub);
                                        td.children().hide();


                                        var input = $('<input type="text" class="form-control">');

                                        var con = $('<div class="selectContainer"></div>');
                                        if (val2.editable.autoComplete)
                                            input = $('<select  class="form-control" title="Seleccione..">' +
                                                    '<option value=""></option>' +
                                                    '</select>')
                                        con.append(input);

                                        if (val2.editable.autoComplete && val2.editable.data instanceof Array) {
                                            var lon = val2.editable.data.length;
                                            var idMap = (val2.editable.map) ? val2.editable.map.id : 'id';
                                            var textMap = (val2.editable.map) ? val2.editable.map.text : 'text';
                                            for (var k = 0; k < lon; ++k) {
                                                input.append('<option value="' + (val2.editable.data[k][idMap] ? val2.editable.data[k][idMap] : val2.editable.data[k][textMap]) + '">' + val2.editable.data[k][textMap] + '</option>');
                                            }
                                        }

                                        if (val2.editable.autoComplete && val2.editable.data instanceof Function) {
                                            var dataOld = val2.editable.data();
                                            var lon = dataOld.length;
                                            var idMap = (val2.editable.map) ? val2.editable.map.id : 'id';
                                            var textMap = (val2.editable.map) ? val2.editable.map.text : 'text';
                                            for (var k = 0; k < lon; ++k) {
                                                input.append('<option value="' + (dataOld[k][idMap] ? dataOld[k][idMap] : dataOld[k][textMap]) + '">' + dataOld[k][textMap] + '</option>');
                                            }
                                        }


                                        con.click(function () {
                                            e.stopPropagation();
                                            clicked = true;
                                        })
                                        if (val2.editable.autoComplete)
                                            input.selectpicker().change(function () {
                                                row[i] = !input.find('option:selected').html() ? null : input.find('option:selected').html();
                                                con.remove();
                                                clicked = true;
                                                td.html(val2.render.call(me, row[i], row));


                                                td.children().show();
                                                if (val2.editable.onSave) {
                                                    val2.editable.reject = function () {
                                                        row[i] = prev;
                                                        td.html(val2.render.call(me, row[i], row));
                                                    }
                                                    var result = val2.editable.onSave(row[i], input.val(), row);
//                                                           
                                                }
                                            });




                                        if (val2.editable.style)
                                            input.attr('style', val2.editable.style)
                                        input.width(td.width() - 40);

                                        input.click(function (e) {
                                            e.stopPropagation();
                                        });
                                        input.blur(function (e) {
                                            e.stopPropagation();
                                            $(this).remove();
                                            td.children().show();
                                        });
                                        input.keyup(function (e) {
                                            e.stopPropagation();
                                            if (e.which == 27) {
                                                $(this).remove();
                                                td.children().show();
                                            }
                                            var valid = true;
                                            if (val2.editable.validation) {
                                                if (val2.editable.validation instanceof Function) {
                                                    valid = val2.editable.validation.render.call(me, input.val(), row);
                                                } else {
                                                    valid = val2.editable.validation.test(input.val());
                                                }
                                            }
                                            if (valid)
                                                input.removeClass('error');
                                            else {
                                                input.addClass('error');
                                                return;
                                            }


                                            if (e.which == 13) {
                                                row[i] = !input.val() ? null : input.val();
                                                td.html(val2.render.call(me, row[i], row));

                                                $(this).remove();
                                                td.children().show();
                                                if (val2.editable.onSave) {
                                                    val2.editable.reject = function () {
                                                        row[i] = prev;
                                                        td.html(val2.render.call(me, row[i], row));
                                                    }
                                                    var result = val2.editable.onSave(row[i], row);
//                                                           
                                                }
                                            }
                                        });
                                        if (val2.editable.autoComplete) {
                                            $(this).append(con)

                                        } else
                                            $(this).append(input);
                                        input.val(row[i]);
                                        var prev = row[i];
                                        input.focus();
                                    }
                                    if (val2.editable.click && val2.editable.click == 1)
                                        td.click(funcion);
                                    else
                                        td.dblclick(funcion)
                                }
                            }

                        });


                    });

                } else {
                    $.each(row, function (i, val) {
                        var td = $('<td>');
                        td.html(val);
                        tr.append(td);

                    });

                }

            }

            if (row instanceof Array) {
                for (var i = 0; i < cant; ++i) {
                    var td = $('<td>');

                    td.html(row[i]);
                    tr.append(td);

                }
            }
            if (index) {
                this.body.find('tr:eq(' + index + ')').before(tr);
            } else
                this.body.append(tr);
            tr.data('row', data);


        },
        addTitleRow: function (row) {
            var tr = $('<tr>');
            this.body.append(tr);
            tr.click(this, this.onRowClick);
            var cant = row.length;
            var data = row;



            if (row instanceof Array) {
                for (var i = 0; i < cant; ++i) {
                    var td = $('<td>');

                    td.html(row[i]);
                    tr.append(td);

                }
            }


            tr.data('row', data);


        },
        insertAt: function (index, row) {
            this.add(row, index)
        },
        getAt: function (i) {
            var row = this.body.find('tr:eq(' + i + ')');
            if (row.size() > 0) {
                return $(row.get(0)).data('row');
            } else {
                return null;
            }
        },
        size: function () {
            return this.rowData.length;
        },
        getData: function () {
            return this.rowData;
        },
        getSelected: function () {
            var row = this.body.find('.selected');
            if (row.size() > 0) {
                return $(row.get(0)).data('row');
            } else {
                return null;
            }

        },
        setSelected: function (items) {
            if (items instanceof Array) {
                var rows = this.body.find('tr');

                for (var i = 0; i < rows.size(); ++i) {
                    if (this.options.multi === true) {
                        var cant = items.length;
                        for (var j = 0; j < cant; ++j) {
                            $.each(items[j], function (index, val) {

                                if ($(rows.get(i)).data('row')[index] && $(rows.get(i)).data('row')[index] === val) {
                                    var inp = $(rows.get(i)).find('input').get(0);
                                    inp.click();

                                    inp.checked = true;
                                }
                            })
                        }


                    } else {
                        var cant = items.length;
                        for (var j = 0; j < cant; ++j) {
                            $.each(items[j], function (index, val) {
                                if ($(rows.get(i)).data('row')[index] && $(rows.get(i)).data('row')[index] === val) {
                                    $(rows.get(i)).addClass('selected');
                                }
                            });
                        }

                    }
                }


            }

            if (items instanceof Object) {
                var rows = this.body.find('tr');

                for (var i = 0; i < rows.size(); ++i) {
                    if (this.options.multi === true) {

                        $.each(items, function (index, val) {
                            if ($(rows.get(i)).data('row')[index] && $(rows.get(i)).data('row')[index] === val) {
                                var inp = $(rows.get(i)).find('input').get(0);
                                inp.click();
                                inp.checked = true;
                            }
                        })



                    } else {

                        $.each(items[j], function (index, val) {
                            if ($(rows.get(i)).data('row')[index] && $(rows.get(i)).data('row')[index] === val) {
                                $(rows.get(i)).addClass('selected');
                            }
                        });


                    }
                }

            }
        },
        resetSelection: function () {
            var rows = this.body.find('tr');
            rows.removeClass('selected');
            if (this.options.multi === false) {

                return;
            }

            for (var i = 0; i < rows.size(); ++i) {
                if (this.options.multi === true) {
                    $(rows.get(i)).find('input').each(function () {
                        this.checked = false;
                    });

                }
            }
        },
        getSelection: function () {
            var rows = this.body.find('tr');

            var result = [];
            for (var i = 0; i < rows.size(); ++i) {
                var inp = $(rows.get(i)).find('input').get(0);
                if (inp.checked === true)
                    result.push($(rows.get(i)).data('row'));
            }

            return result;


        },
        remove: function (i) {
            var row = this.body.find('tr:eq(' + i + ')');
            if (row.size() > 0) {
                $(row.get(0)).remove();
                return true;
            } else {
                return false;
            }
        },
        clear: function () {
            if (this.options.paging == true) {
                this.data = [];
                this.dataCount = 0;

                this.reDraw(this.pagingSelect.val(), this.currentPage, true);
                this.updatePagination();
                this.updatePaginationClick();
                //this.pagingSelect.trigger('change');
            } else {
                this.data = [];
                this.dataCount = 0
                this.reDraw('all');
            }
        },
        showLoading: function () {
            var offset = this.container.offset();

            if (this.flagLoad)
                return;
            if (this.container.width() < 0 || this.container.height() < 0)
                return;
            this.flagLoad = true;

            this.loading.css({
                'left': offset.left,
                'top': offset.top,
                'width': this.container.width(),
                'height': this.container.height()
            });
            this.loading.fadeIn();
        },
        hideLoading: function () {
            this.loading.fadeOut("slow");
            this.flagLoad = false;
        },
        sorting: function () {
            if (this.options.sort) {

                return;
                var sorted = new Array();
                var current = 0;
                for (var i = 0, cant = this.data.length; i < cant; i++) {
                    if (this.data[i][this.options.sort] >= current) {
                        sorted.push(this.data[i]);
                        current = this.data[i][this.options.sort];
                    } else {
                        var rest = sorted.splice(sorted.length - 1, 1);

                        var ini = sorted.splice(0, sorted.length - 1);

                        var result = ini.concat(this.data[i]);
                        sorted = result.concat(rest);

                    }
                }
                this.data = sorted;
            }
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


    $.fn.TableUIR = $.fn.tableUIR = function (options) {
        if (typeof options === 'string') {
            if (options === 'data')
                return $(this).data('tableuir');
            var obj = $(this).data('tableuir');

            var arg = new Array();
            for (var i = 1; i < arguments.length; i++) {
                arg.push(arguments[i])
            }
            if (obj[options])
                return obj[options].apply(obj, arg);
        } else {

            $(this).each(function () {

                $(this).data('tableuir', new UIR.Panel.Table(this, options))

            })
        }

    }





})(jQuery);