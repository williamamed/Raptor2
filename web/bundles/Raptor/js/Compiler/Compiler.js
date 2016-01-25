Ext.onReady(function() {
    new Generator.View();
  
});
Raptor.Animated();
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

Ext.define('Generator.View', {
    extend: 'Ext.Viewport',
    layout: 'fit',
    
    initComponent: function() {
        this.items=new Generator.Panel();
        
        this.callParent();
    }
});

Ext.define('Generator.Panel',{
    extend:'Ext.Panel',
     layout: {
            type: 'border',
            padding: 5
        },
    title: "",
    header:false,
    
    
    initComponent:function(){
        
       
       
        this.adicionar=new Ext.Button({disabled:true,iconCls: 'icon-add', text: 'Publish', handler: this.publish,scope:this});
        this.deleteResour=new Ext.Button({disabled:true,iconCls: 'icon-clear', text: 'Clear', handler: this.eliminar,scope:this});
//       this.grid=new Generator.Grid();
        this.out=new Generator.OutPut();
         this.arbol=new Generator.Tree({
           tbar:[this.adicionar,this.deleteResour]
       });
        this.items=[this.arbol,this.out];
   
         this.callParent();

        
        this.arbol.on('checkchange',function (record){
            var bundles=this.arbol.getChecked();
            if(bundles.length>0){
                this.adicionar.enable();
                this.deleteResour.enable();
            }else{
                this.adicionar.disable();
                this.deleteResour.disable();
            }
        },this)
        

       
    },
    
    
    publish:function(){
        Raptor.msg.show(2,"You are going to publish the resources in the selected bundle, are you shure?",this.create,this);
    },
    eliminar:function(){
        Raptor.msg.show(2,"You are going to delete the resources in the selected bundle, are you shure?",this.deleteResources,this);
    },
    create:function(){
        var me=this;
        var bundles=me.arbol.getChecked();
        var send=new Array();
        for(var i=0;i<bundles.length;i++){
            if(bundles[i].get('id')!='root')
                send.push(bundles[i].get('bundle'));
        }
       var wait=Raptor.msg.show(4,'Wait please .....');
        Ext.Ajax.request({
            url: 'publisher/publish',
            method: 'POST',
            waitMsg: 'wait please .....',
            params: {bundles: Ext.encode(send)},
            success: function(response) {
                var resp=Ext.decode(response.responseText);
                
                if(resp.cod!=3)
                  Raptor.msg.show(resp.cod,resp.msg)
                  wait.close();
                  me.adicionar.disable();
                  me.deleteResour.disable();
                  var response = resp.actions;
                me.arbol.getRootNode().set('checked',false);  
                var cant = response.length;
                var inc = 0;
                var inter = setInterval(function() {

                    if (inc < cant) {
                        me.out.body.dom.innerHTML = me.out.body.dom.innerHTML + '<br>>>&nbsp;' + response[inc];
                        inc++;
                    } else
                        clearInterval(inter);

                }, 500);
                  me.arbol.getStore().reload({
                            callback:function(){
                                me.arbol.collapseNode(me.arbol.getRootNode(),false,function(){
                                    me.arbol.expandNode(me.arbol.getRootNode())
                                });
                                
                            }
                        });
               
            },
            failure: function(response) {
                var resp=Ext.decode(response.responseText);
                wait.close();
                    
                }
        });
    },
    deleteResources:function(){
        var me=this;
        var bundles=me.arbol.getChecked();
        var send=new Array();
        for(var i=0;i<bundles.length;i++){
            if(bundles[i].get('id')!='root')
                send.push(bundles[i].get('bundle'));
        }
       var wait=Raptor.msg.show(4,'Wait please .....');
        Ext.Ajax.request({
            url: 'publisher/clear',
            method: 'POST',
            waitMsg: 'wait please .....',
            params: {bundles: Ext.encode(send)},
            success: function(response) {
                var resp=Ext.decode(response.responseText);
                
                if(resp.cod!=3)
                  Raptor.msg.show(resp.cod,resp.msg)
                  wait.close();
                  me.adicionar.disable();
                  me.deleteResour.disable();
                  var response = resp.actions;
                  me.arbol.getRootNode().set('checked',false);  
                var cant = response.length;
                var inc = 0;
                var inter = setInterval(function() {

                    if (inc < cant) {
                        me.out.body.dom.innerHTML = me.out.body.dom.innerHTML + '<br>>>&nbsp;' + response[inc];
                        inc++;
                    } else
                        clearInterval(inter);

                }, 500);
                  me.arbol.getStore().reload({
                            callback:function(){
                                me.arbol.collapseNode(me.arbol.getRootNode(),false,function(){
                                    me.arbol.expandNode(me.arbol.getRootNode())
                                });
                                
                            }
                        });
               
            },
            failure: function(response) {
                var resp=Ext.decode(response.responseText);
                wait.close();
                    
                }
        });
    }
    
})


    
    
Ext.define('Generator.Tree', {
    extend:'Ext.tree.Panel',
    title: 'Vendor/Bundle - Will publish your bundle resources',
    width:400,
    margin:'0 5 0 0',
    region: 'west',
    root:{text:'src',expanded:true,checked:false},
    rootVisible: true,
    initComponent:function(){
        this.store=this.createStore();
        this.loadMask={store: this.getStore()};
        this.callParent();
    },
    listeners:{
        beforeload:function(store){
           
            
//              store.getProxy().extraParams={id:this.currentNodeExpand.get('id')};
           
          
            
        },
        checkchange:function(n,state){
            if(n.get('id')=='root')
                n.cascadeBy(function(n){
                    if(n.get('vendor')==false)
                        n.set('checked',state)
                })
        },
        beforeitemexpand:function(n){
//            this.currentNodeExpand=n;
        },
        select:function( obj, record, index, eOpts ){
            this.fireEvent('nodeSelected',record);
            
        },
    },
    createStore:function(){
        return Ext.create('Ext.data.TreeStore', {
            fields: [
                {name: 'text'},
                {name: 'id'},
                {name: 'bundle'},
                {name: 'namespace'},
                {name: 'vendor'}
                ],
            proxy: {
                type: 'ajax',
                url: 'publisher/bundles',
                actionMethods: { //Esta Linea es necesaria para el metodo de llamada POST o GET

                    read: 'POST'
                },
                reader: {
                    totalProperty: "cantidad_filas"


                }
            },
            listeners:{
                load:function(){
//                    Ext.each(arguments[2],function(value){
//                        value.set('leaf',true);
//                        value.set('icon','../../../lib/images/entidad.png');
//                        
//                    })
                }
            }
            
        })
    }
    
    
});

Ext.define('Generator.OutPut',{
    extend:'Ext.Panel',
     layout: {
            type: 'border',
            padding: 5
        },
    title:'Output',
    region:'center',
    bodyStyle:'background:white;padding:20px;overflow: scroll-y',
    header:true,
    initComponent:function(){
        this.callParent();
    },
    html:'<b style="color:gray">>> Ouput Console - Raptor 2</b>'

    })

