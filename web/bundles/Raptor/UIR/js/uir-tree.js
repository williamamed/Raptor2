

(function($) {
    UIR.namespace('UIR.Panel');
    UIR.Panel.Tree = function(el, options) {
        this.options = options;
        this.element = el;
        this.init();

    }
    UIR.Panel.TreeNode = function(el, options, data) {
        this.options = options;
        this.dataNode = data;
        this.element = el;
        this.init();

    }
    UIR.Panel.TreeNode.prototype = {
        constructor: UIR.Panel.TreeNode,
        init: function() {
            var $element = $(this.element);
            $element.data('node', this);
            $element.data('nodetreeuir',this);    
            var link = $('<a href="#"></a>');
            link.addClass('nodedir');
            var icon = $('<span class="icon"></span>');
            if(this.dataNode.icon)
                var icon = $('<span class="icon-custom"><img src="'+this.dataNode.icon+'" height="16" width="16"/></span>');
            var ind = $('<span class="indicator"></span>');
            var text = $('<span style="color: #333333"></span>');
            $element.append(link);
            link.append(ind);
            link.append(icon);
            link.append(text);
            text.html(this.dataNode.name);
            this.indicator = ind;
            this.icon = icon;
            this.text = text;
            ind.click(this.onIndicatorClick);
        },
        loadNode: function(options) {
            var me = this;
            if (!options)
                options = {};
            if (!options.param)
                options.param = {};
            var id = this.dataNode.data ? this.dataNode.data.id : 0;
            var opt = $.extend(me.dataNode.data, {node: id}, options.param);
            var loading = $('<span class="loading"></span>');
            var aEl=$(me.element).children('a');
            if($(me.element).hasClass('root-uir-node')){
                aEl.show();
            }
            $(me.element).children('ul.nav').remove();
            aEl.prepend(loading);
            aEl.children('span.indicator').hide();
            var evt=$.Event('treeuir.beforeload');
            $(me.element).trigger(evt,[this.dataNode,opt]);
            
            $.post(this.options.url, opt, function(data) {
                if($(me.element).hasClass('root-uir-node')){
                    aEl.hide();
                }
                me.proccessNode(data, $(me.element));
                if (options.callback) {
                    options.callback.call(me, data);
                    
                }
                loading.remove();
                
                
                $(me.element).children('a').children('span.indicator').show();
            });
        },
        proccessNode: function(data, parent) {

            var el = parent;
            if (data.length === 0)
                return;
            var list = $('<ul class="nav" style="padding-left:12px;">');
            
            el.append(list);
            for (var i = 0; i < data.length; i++) {
                var node = $('<li></li>');

                var nodeObj = new UIR.Panel.TreeNode(node, this.options, {
                    name: this.options.map?data[i][this.options.map.name]:data[i].name,
                    data: data[i]
                });
                
                list.append(nodeObj.element);
            }


            el.find('.nodedir').click(this.onNodeClick);
        },
        onNodeClick: function(e) {
            
            var obj = $($(this).parents('li').get(0)).data('node');
            if (obj.options.onNodeSelect)
                obj.options.onNodeSelect.call(obj, $(this));
            
        },
        onIndicatorClick: function(e) {
            e.stopPropagation();
            if (!$(this).hasClass('loaded')) {
                $(this).hide();
                var me = $(this);
                var li=$($(this).parents('li').get(0));
                li.data('node').loadNode({
                    callback: function(data) {
                        me.toggleClass('expanded');
                        me.show();
                        me.addClass('loaded');
                        var evt=$.Event('treeuir.loaded');
                        li.trigger(evt,[li.data('nodetreeuir').dataNode,data]);
                    }
                });
            } else {
                $(this).toggleClass('expanded');
                $($(this).parents('li').get(0)).find('ul').toggle();
            }
        },
        
        getData:function(){
            return this.dataNode;
        }
    }



    UIR.Panel.Tree.prototype = {
        constructor: UIR.Panel.Tree,
        init: function() {
            var $element = $(this.element);
            $element.addClass('uir-tree');
            var textheader='';
            var icon='';
            if(this.options.title)
                textheader='<span class="text-header">'+this.options.title+'</span>';
            if(this.options.icon)
                icon='<img src='+this.options.icon+' width="16" height="16">';
            
            var base=$('<ul class="nav nav-sidebar" style="margin-left:-12px"></ul>');
            var content=$('<div class="col-md-12 uir-tree-content"></div>');
            var header=$('<div class="col-md-12 uir-tree-header">'+icon+textheader+'</div>');
            $element.append(header);
            $element.append(content);
            if(this.options.height){
                content.css({
                    overflow:'hidden'
                });
                content.height(this.options.height);
                content.perfectScrollbar({
                      suppressScrollX:true
                });
            }
           
            content.append(base)
            var rootnode = $('<li class="root-uir-node"></li>');
            this.options.rootnode = rootnode;
            this.root = new UIR.Panel.TreeNode(rootnode, this.options, {name: null});
            var me = this;
            this.root.indicator.hide();
            this.root.icon.hide();
            base.append(rootnode);
            if(this.options.autoload==true)
                this.root.loadNode({
                    params: {
                        node: 0
                    },
                    callback: function() {
                        $($(this.element).children('a').get(0)).hide();
                        $(me.root.element).children('ul').css('paddingLeft', 0);
                    }
                });
            var me=this;
            
//            $element.on('treeuir.loaded','li',function(e,node,data){
//                var evt=$.Event('treeuir.loaded');
//                $element.trigger(evt,[node,data]);
//            })
//            
//            $element.on('treeuir.beforeload','li',function(e,node,data){
//                var evt=$.Event('treeuir.beforeload');
//                $element.trigger(evt,[node,data]);
//            })
            
            $element.on('click','.nodedir',function(e){
                if(me.selected)
                    $(me.selected).removeClass('selected')
                me.selected=this;
                $(this).addClass('selected');
                var evt=$.Event('treeuir.click');
                $element.trigger(evt,[$($(this).parents('li').get(0)).data('nodetreeuir').dataNode]);
            })
        },
        getSelected: function() {
            return $($(this.element).find('.selected').parents('li').get(0)).data('nodetreeuir');
        },
        
        getRootNode:function(){
            return this.root;
        }
    }


    $.fn.treeUIR = function(options) {
         if (typeof options === 'string') {
            if (options === 'data')
                return $(this).data('treeuir');
            var obj = $(this).data('treeuir');

            var arg = new Array();
            for (var i = 1; i < arguments.length; i++) {
                arg.push(arguments[i])
            }
            if (obj[options])
                return obj[options].apply(obj, arg);
        } else {

            $(this).each(function() {

                $(this).data('treeuir', new UIR.Panel.Tree(this, options))

            })
        }

    }





})(jQuery);
