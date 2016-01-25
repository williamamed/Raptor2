

(function($){
	UIR.namespace('UIR.Panel');
	UIR.Panel.Table=function(el,options){
		this.options=options;
		this.element=el;
		this.init();
	
	}
	
	
	UIR.Panel.Table.prototype={
		constructor: UIR.Panel.Table,
		init:function(){
			var empty={};
			this.options=$.extend(empty,this.defaultOptions,this.options);
			
			var $element = $(this.element);
			
                        this.$element=$element;
                        this.container=$("<div></div>");
                        if(this.options.putRootClass===true)
                            this.container.addClass('uir-table');
			$element.before(this.container);
                        this.container.append($element);
                        
                        this.body=$element.find('tbody');
                        
                        if(this.body.size()==0){
                            this.body=$('<tbody></tbody>');
                            $element.append(this.body);
                        }
                        //Loading template
                        this.loading=$('<div></div>');
                        this.loading.addClass('text-center')
                        this.loading.append('<span class="label label-info " style="position:relative;top: 50%;"><b class="uir-loading-table" style="margin-right:5px;"></b>Cargando datos</span>')
                        this.loading.css({
                            'background':'rgba(0,0,0,0.5)',
                            'position':'absolute',
                            'zIndex':'100000'
                        });
                        this.loading.appendTo(document.body);
                        
                        this.loading.hide();
                        //Filas de arriba y abajo
                        this.rowUp=$("<div class='row-fluid'>");
                        this.rowDown=$("<div class='row-fluid'>");
                        this.container.prepend(this.rowUp);
                        this.container.append(this.rowDown);
                        //Lugar de derecha e izquierda de arriba
                        this.rowUpLeft=$("<div class='span6'></div>");
                        this.rowUpRight=$("<div class='span6'></div>");
                        this.rowUp.append(this.rowUpLeft);
                        this.rowUp.append(this.rowUpRight);
                        if(this.options.hideTop==true)
                            this.rowUp.hide();
                        if(this.options.searching==true){
                            var con=$('<div></div>');
                            con.addClass('input-append');
                            
                            this.searchingEl=$("<input type='text'>");
                            con.addClass('pull-right');
                            this.searchingEl.attr('placeholder','Buscar...');
                            con.append(this.searchingEl);
                            this.searchingEl.on('keypress',this,this.onSearch);
                            this.btnSearch=$('<button class="btn btn-primary"><i class="icon-search"></i></button>');
                            con.append(this.btnSearch);
                            this.btnSearch.css('height','35px');
                            
                            this.rowUpRight.append(con);
                            this.btnSearch.click(this,this.onSearchBtn);
                        }
                        if(this.options.header){
                            $element.find('thead').remove();
                            this.header=$('<thead></thead>');
                            $element.prepend(this.header);
                            var tr=$('<tr></tr>');
                            this.header.append(tr);
                            var cantHeader=this.options.header.length;
                            if(this.options.multi==true){
                                var th=$('<th></th>');
                                var check=$('<input type="checkbox" />');
                                th.append(check);
                                th.width(15);
                                tr.append(th);
                                var me=this;
                                th.change(function(){
                                   var state=$(this).find('input').get(0).checked;
                                   
                                       me.body.find('input').each(function(){
                                           $(this).get(0).checked=state;
                                       });
                                  
                                })
                                
                            }
                            for (var i = 0; i < cantHeader; ++i) {
                                if(this.options.header[i].hidden!==true){
                                    var th=$('<th></th>');
                                    th.html(this.options.header[i].title);
                                    tr.append(th);
                                    
                                }
                            }
                        }
                        this.data=[];
                        var data=[];
                        
                        this.body.find('tr').each(function(){
                            var row=[];
                            $(this).find('td').each(function(){
                                row.push($(this).html())
                            });
                            data.push(row);
                        })
                        this.data=data;
                        this.dataCount=this.data.length;
                       if(this.options.paging==true){
                           this.currentPage=1;
                            this.pagingSelect=$("<select name='example_length' size='1'>"+
                                "<option value='10' selected='selected'>10</option>"+
                                "<option value='25'>25</option>"+
                               " <option value='50'>50</option>"+
                                "<option value='100'>100</option>"+
                            "</select>");
                            this.rowDownLeft=$("<div class='span6'></div>");
                            this.rowDownLeft.append(this.pagingSelect);
                            this.rowDown.append(this.rowDownLeft);
                            
                            this.pagination=$("<div class='pagination'>"+
                                    "<ul>"+
                                       " <li><a href='#'><i class=' icon-chevron-left'></i>Prev</a></li>"+
                                       
                                       " <li class='prev'><a href='#'>Next<i class='icon-chevron-right'></i></a></li>"+
                                   " </ul>"+
                                    "</div>");
                            this.rowDownRight=$("<div class='span6'></div>");
                            this.rowDownRight.append(this.pagination);
                            this.pagination.addClass('pull-right');
                            this.rowDown.append(this.rowDownRight);
                            this.pagingSelect.change(this,this.onSelectChange);
                            this.pagination.empty();
                            if(this.options.url){
                                this.body.empty();
                                if(this.options.autoload==true)
                                    this.makeLoad();
                            }else{
                                this.pagingSelect.trigger('change');
                            }
                        }else{
                            if(this.options.url){
                                if(this.options.autoload==true)
                                    this.makeLoad();
                            }else{
                                this.reDraw('all');
                            }
                            
                        }
                        
                        
                     // alert(this.container.height())
		},
                onSearch:function(e){
                    if(e.which==13 ){
                        $('a').focus();
                        e.data.currentPage=1;
                        e.data.makeLoad('',{query:e.data.searchingEl.val()});
                    }
                },
                onSearchBtn:function(e){
                    
                        
                        e.data.currentPage=1;
                        e.data.makeLoad('',{query:e.data.searchingEl.val()});
                    
                },
                onLoadServer:function(dataLoaded){
                    this.hideLoading();
                    var data=dataLoaded;
                    this.rowData=dataLoaded;
                   if(this.options.reader){
                       data=dataLoaded[this.options.reader];
                   }
                    
                    if(this.options.paging==true){
                        this.data=data.data;
                        this.sorting();
                        this.dataCount=data.size;
                        if(this.data==undefined){
                            this.data=[];
                            this.dataCount=0;
                        }
                        this.reDraw(this.pagingSelect.val(),this.currentPage,true);
                        this.updatePagination();
                        this.updatePaginationClick();
                        //this.pagingSelect.trigger('change');
                    }else{
                        
                        this.data=data;
                        this.sorting();
                        this.dataCount=this.data.length
                        this.reDraw('all');
                    }
                    var e = $.Event('loaded')
                       
                    this.$element.trigger(e)
                    
                },
                makeLoad:function(url,opt){
                    this.showLoading();
                    this.__on_deselect_row.call(this.__on_deselect_row_scope);
                    
                    var me=this;
                    if(!url||url=='')
                        url=this.options.url;
                    
                    
                    var op={};
                        if(this.options.paging===true){
                            
                            var numpag=this.pagingSelect.val();
                            
                            op=$.extend({},{size:numpag,page:this.currentPage},opt);
                        }else
                            op=$.extend({},{},opt);
                    if(this.options.searching==true)
                        op.query=this.searchingEl.val();
                    $.post(url, op,function(data){
                        me.onLoadServer($.parseJSON(data));
                       
                    });
                    
                },
                onSelectChange:function(e){
                    if(e.data.options.url){
                        e.data.currentPage=1;
                        e.data.makeLoad('',{size:e.data.pagingSelect.val(),page:1});
                    }else{
                        e.data.reDraw($(this).val());
                        e.data.updatePagination();
                    }
                },
                updatePagination:function(){
                    var num=this.dataCount/this.pagingSelect.val();
                    var rest=this.dataCount%this.pagingSelect.val();
                    var cant=parseInt(num);
                    if(rest>0)
                        cant++;
                    this.pagination.empty();
                    this.pagination.append("<ul>"+
                                       " <li class='prev'><a  href='#' ><i class='icon-chevron-left'></i>Prev</a></li>"+
                                       
                                       " <li class='next'><a href='#'>Next<i class='icon-chevron-right'></i></a></li>"+
                                   " </ul>");
                    this.prevButton=this.pagination.find('li[class=prev] a');
                    this.nextButton=this.pagination.find('li[class=next] a');
                    
                    if(num>0||this.dataCount==0){
                        this.prevButton.hide();
                    }
                    
                    if(this.currentPage*this.pagingSelect.val()>=this.dataCount){
                        this.nextButton.hide();
                        
                    }
                    this.nextButton.click({scope:this,button:2},this.onPageClick);
                    this.prevButton.click({scope:this,button:1},this.onPageClick);
                   
                  
                },
                onPageClick:function(e){
                    var me=e.data.scope;
                    var opt=e.data.button;
                    var numpag=me.pagingSelect.val();
                    
                    if(opt==1){
                        me.currentPage--;
                        
                    }
                    if(opt==2){
                        me.currentPage++; 
                        
                    }
                    if(me.options.url){
                        me.makeLoad('',{size:numpag,page:me.currentPage});    
                    }else{
                        me.reDraw(numpag,me.currentPage);
                        me.updatePaginationClick();
                    }
                    
                },
                
                updatePaginationClick:function(e){
                   var me=this;
                    me.nextButton.show();
                    me.prevButton.show();
                    if(me.currentPage*me.pagingSelect.val()>=me.dataCount){
                        me.nextButton.hide();
                        me.prevButton.show();
                       
                    }else{
                        me.nextButton.show();
                    }
                    if(me.currentPage==1){
                        me.prevButton.hide();
                        
                    }
                    
                },
		defaultOptions:{
			url: false,
			paging: true,
                        searching: true,
                        header:[],
                        data:[],
                        reader:false,
                        multi:false,
                        autoload:true,
                        hideTop:false,
                        putRootClass:true
		},
                setPagingOptions:function(options){
                    
                },
		load:function(url,params){
			
		},
                reDraw:function(numpag,page,ajax){
                    
                    this.body.empty();
                    
                    if(this.options.multi==true){
                        
                        this.header.find('input').get(0).checked=false;
                    }
                    var init=0;
                    if(ajax!==true&&page&&numpag!='all'){
                        init=(page*numpag)-numpag;
                        numpag=page*numpag;
                    }
                    if(numpag=='all'||numpag>this.data.length)
                        numpag=this.data.length;
                    for (var i = init; i < numpag; ++i) {
                        this.add(this.data[i]);

                    }
                    if(numpag==0){
                        this.rowUpLeft.empty();
                        this.rowUpLeft.append('<span class="label label-info text-center " style="margin-top:10px;">No se encontraron datos para mostrar</span>');
                    }else{
                        this.rowUpLeft.empty();
                        var text='';
                        if(this.options.paging==true){
                            var total=parseInt(this.dataCount/this.pagingSelect.val());
                            var rest=this.dataCount%this.pagingSelect.val();
                            if(rest>0)
                                total++;
                            text+="Página "+this.currentPage+" de "+total+" - ";
                        }
                        var can=numpag-init;
                        text+="Mostrando "+can+" de "+this.dataCount;
                        this.rowUpLeft.append('<span class="label label-info text-center " style="margin-top:10px;">'+text+'</span>');
                    }
                },
                onRowClick:function(e){
                    //if(e.data.options.multi==false||e.ctrlKey==false)
                        e.data.body.find('tr').removeClass('selected');
                    $(this).addClass('selected');
                    e.data.__on_select_row.call(e.data.__on_select_row_scope,$(this));
                },
                onTableSelect:function(fun,scope){
                    this.__on_select_row=fun;
                    this.__on_select_row_scope=scope;
                },
                __on_select_row:function(){
                    
                },
                onTableDeSelect:function(fun,scope){
                    this.__on_deselect_row=fun;
                    this.__on_deselect_row_scope=scope;
                },
                __on_deselect_row:function(){
                    
                },
		add:function(row){
                    var tr=$('<tr>');
                    
                    tr.click(this,this.onRowClick);
                    var cant=row.length;
                    var data=row;
                    if(this.options.multi==true){
                                var th=$('<th></th>');
                                var check=$('<input type="checkbox" />');
                                th.append(check);
                                var me=this;
                                th.change(function(e){
                                   
                                    var state=$(this).find('input').get(0).checked;
                                   if(state){
                                       $(this).addClass('selected');
                                   }else{
                                       $(this).removeClass('selected');
                                       me.header.find('input').get(0).checked=false;
                                   }
                                   
                                   
                                })
                                tr.append(th);
                   }
                    if(row instanceof Object){
                       var me=this;
                       
                       if (me.options.header) {
                            $.each(me.options.header, function(i2, val2) {
                                
                                $.each(row, function(i, val) { 
                                    if(val2.index ===i&&val2.hidden !== true){
                                        var td=$('<td>');
                                        if(val2.render instanceof Function)
                                            td.html(val2.render.call(me,val,row));
                                        else
                                            td.html(val);
                                        tr.append(td);
                                        
                                    }
                                    
                                });
                                
                                
                            });
                             
                        } else {
                            $.each(row, function(i, val) { 
                                var td=$('<td>');
                                td.html(val);
                                tr.append(td);
                                
                             });
                            
                        }
                       
                    }
                    
                    if(row instanceof Array){
                       for(var i=0;i<cant;++i){
                            var td=$('<td>');
                        
                            td.html(row[i]);
                            tr.append(td);
                        
                        }
                    }
                    
                   this.body.append(tr); 
                   tr.data('row',data);
                    
		
		},
                addTitleRow:function(row){
                    var tr=$('<tr>');
                    this.body.append(tr);
                    tr.click(this,this.onRowClick);
                    var cant=row.length;
                    var data=row;
                    
                    
                    
                    if(row instanceof Array){
                       for(var i=0;i<cant;++i){
                            var td=$('<td>');
                        
                            td.html(row[i]);
                            tr.append(td);
                        
                        }
                    }
                    
                    
                   tr.data('row',data);
                    
		
		},
                insertAt:function(){
                    
                },
		getAt:function(i){
			
		},
                       
                size:function(){
                    return this.rowData.length;
                },
                getData:function(){
			return this.rowData;
		},
                getSelected:function(){
                    var row=this.body.find('.selected');
                    if(row.size()>0){
                        return $(row.get(0)).data('row');
                    }else{
                        return null;
                    }
                    
                },
                setSelected:function(items){
                    if(items instanceof Array){
                        var rows=this.body.find('tr');
                        
                        for(var i=0;i<rows.size();++i){
                            if(this.options.multi===true){
                                var cant=items.length;
                                for(var j=0;j<cant;++j){
                                    $.each(items[j],function(index,val){
                                        
                                        if($(rows.get(i)).data('row')[index] && $(rows.get(i)).data('row')[index]===val){
                                            var inp=$(rows.get(i)).find('input').get(0);
                                            inp.click();
                                            
                                            inp.checked=true;
                                        }
                                    })
                                }
                                
                                
                            }else{
                                var cant=items.length;
                                for(var j=0;j<cant;++j){
                                    $.each(items[j],function(index,val){
                                        if($(rows.get(i)).data('row')[index] && $(rows.get(i)).data('row')[index]===val){
                                            $(rows.get(i)).addClass('selected');
                                        }
                                    });
                                }
                                
                            }
                        }
                        
                       
                    }
                    
                    if(items instanceof Object){
                        var rows=this.body.find('tr');
                    
                        for(var i=0;i<rows.size();++i){
                            if(this.options.multi===true){
                                
                                    $.each(items,function(index,val){
                                        if($(rows.get(i)).data('row')[index] && $(rows.get(i)).data('row')[index]===val){
                                            var inp=$(rows.get(i)).find('input').get(0);
                                            inp.click();
                                            inp.checked=true;
                                        }
                                    })
                                
                                
                                
                            }else{
                               
                                    $.each(items[j],function(index,val){
                                        if($(rows.get(i)).data('row')[index] && $(rows.get(i)).data('row')[index]===val){
                                            $(rows.get(i)).addClass('selected');
                                        }
                                    });
                               
                                
                            }
                        }
                       
                    }
                },
                resetSelection:function(){
                    var rows=this.body.find('tr');
                        rows.removeClass('selected');
                        if(this.options.multi===false){
                            
                            return;
                        }
                        
                        for(var i=0;i<rows.size();++i){
                            if(this.options.multi===true){
                                $(rows.get(i)).find('input').each(function(){
                                    this.checked=false;
                                });
                                
                            }
                        }
                },
                getSelection:function(){
                    var rows=this.body.find('tr');
                    
                        var result=[];
                        for(var i=0;i<rows.size();++i){
                            var inp=$(rows.get(i)).find('input').get(0);
                            if(inp.checked===true)
                               result.push($(rows.get(i)).data('row'));
                        }
                        
                        return result;
                   
                    
                },
		remove:function(){
			
		},
                clear:function(){
                    if(this.options.paging==true){
                        this.data=[];
                        this.dataCount=0;
                        
                        this.reDraw(this.pagingSelect.val(),this.currentPage,true);
                        this.updatePagination();
                        this.updatePaginationClick();
                        //this.pagingSelect.trigger('change');
                    }else{
                        this.data=[];
                        this.dataCount=0
                        this.reDraw('all');
                    }
                },
                showLoading:function(){
                        var offset=this.container.offset();
                        if(this.container.width()==0 && this.container.height())
                            return;
                        this.loading.css({
                            'left':offset.left,
                            'top': offset.top,
                            'width': this.container.width(),
                            'height': this.container.height()
                        });
                        this.loading.fadeIn(); 
                },
                hideLoading:function(){
                       this.loading.fadeOut("slow");
                },
		sorting:function(){
                    if(this.options.sort){
                        
                        return;
                        var sorted=new Array();
                        var current=0;
                        for (var i=0,cant=this.data.length;i<cant;i++){
                            if(this.data[i][this.options.sort]>=current){
                                sorted.push(this.data[i]);
                                current=this.data[i][this.options.sort];
                            }else{
                                var rest=sorted.splice(sorted.length-1,1);
                                
                                var ini=sorted.splice(0,sorted.length-1);
                                
                                var result=ini.concat(this.data[i]);
                                sorted=result.concat(rest);
                                
                            }
                        }
                        this.data=sorted;
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
	
	
	$.fn.TableUIR=function(options){
		if(typeof options==='string'&& options==='data'){
			return $(this).data('table');
		}else{
                    
			$(this).each(function () {
				
				$(this).data('table',new UIR.Panel.Table(this,options))
                               
			})
                }
	
	}





})(jQuery);