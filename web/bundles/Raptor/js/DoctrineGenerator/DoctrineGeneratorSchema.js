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
        
       
       
        this.adicionar=new Ext.Button({disabled:true,iconCls: 'icon-add', text: 'Generate', handler: this.questionModel,scope:this});
        this.modificar=new Ext.Button({disabled:true, iconCls: 'btn', text: 'Modificar', handler: this.mostrarModificar,scope:this});
        this.eliminar=new Ext.Button({ disabled:true,iconCls: 'icon-del', text: 'Delete', handler:this.eliminarOrganismo,scope:this});
//       this.grid=new Generator.Grid();
        this.out=new Generator.OutPut();
        this.grid=new Generator.Grid({
             tbar:[this.adicionar]
        });
         this.arbol=new Generator.Tree({
          
       });
        this.items=[this.arbol,this.grid];
       
       
        this.callParent();

        this.arbol.on('nodeSelected',function (record){
            
            
        },this)
        
         this.arbol.getSelectionModel().on('beforeselect', function(smodel, record) {
            
            if(record.get('vendor')===false){
                if(this.grid.getSelectionModel().hasSelection())
                    this.adicionar.enable();
            }
          
           
        }, this);
         
         this.grid.getSelectionModel().on('beforeselect', function(smodel, record) {
           
            if(this.arbol.getSelectionModel().hasSelection() && this.arbol.getSelectionModel().getLastSelected().get('vendor')===false)
                    this.adicionar.enable();
           
          
           
        }, this);
         this.arbol.getSelectionModel().on('select', function(model,record) {
           if(record.get('vendor')===false){
             this.grid.getStore().load({params:{name:record.get('text')}});
             this.grid.getSelectionModel().deselectAll();
           }else{
               this.grid.getStore().removeAll();
           }
        }, this);
        this.arbol.getSelectionModel().on('beforedeselect', function(smodel, record) {
            if(this.grid.getStore().isLoading())
               return false;
            this.adicionar.disable();
           
        }, this);
         this.grid.getSelectionModel().on('deselect', function(smodel, record) {
            
           if(!this.grid.getSelectionModel().hasSelection())
                this.adicionar.disable();
           
        }, this);
        
       
    },
    
    questionModel:function(){
        var Entities='';
        for(var i=0;i<this.grid.getSelectionModel().getSelection().length;i++){
            Entities+='- '+this.grid.getSelectionModel().getSelection()[i].get('name')+'<br>';
        }
        var question="<div style='width: 200px;max-height:100px;overflow-y: auto;'><b>To generate:</b><br><br>"+
                "<b>Tables:</b> "+this.grid.getSelectionModel().getSelection().length+"<br><br>"+
               
                "<b>Table:</b> <br>"+Entities+"<br><br>"+
               "<b>Are you shure?</b></div>";
        
        Raptor.msg.show(2,question,this.createModels,this);
    },
    createModels:function(){
        var me=this;
        var Entities=new Array();
        for(var i=0;i<this.grid.getSelectionModel().getSelection().length;i++){
           Entities.push(this.grid.getSelectionModel().getSelection()[i].get('name'));
        }
        var wait=Raptor.msg.show(4,'Wait please .....');
        Ext.Ajax.request({
            url: 'schema/create',
            method: 'POST',
           
            params: {name: me.arbol.getSelectionModel().getLastSelected().get('text'),classes:Ext.encode(Entities)},
            success: function(response) {
                var resp=Ext.decode(response.responseText);
                if(resp.cod==1)
                  Raptor.msg.show(resp.cod,resp.msg)
                me.grid.getSelectionModel().deselectAll();
                wait.close();
            },
           failure: function(form, action) {
                    switch (action.failureType) {
                        case Ext.form.action.Action.CLIENT_INVALID:
                            Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                            break;
                        case Ext.form.action.Action.CONNECT_FAILURE:
                            Ext.Msg.alert('Failure', 'Ajax communication failed');
                            break;
                        case Ext.form.action.Action.SERVER_INVALID:
                           Ext.Msg.alert('Failure', action.result.msg);
                   }
                   wait.close();
                }
        });
    }
    
})

   
    
Ext.define('Generator.Tree', {
    extend:'Ext.tree.Panel',
    title: 'Vendor/Bundle',
    width:400,
    margin:'0 5 0 0',
    region: 'west',
    root:{text:'src',expanded:true},
    rootVisible: true,
    initComponent:function(){
        this.store=this.createStore();
        this.loadMask={store: this.getStore()};
        this.bbar=new Ext.Button({ disabled:false,iconCls: 'icon-update', text: '', handler:this.refresh,scope:this});
        this.callParent();
        
    },
    listeners:{
        afterrender:function(store){
           this.setLoading(true);
        },
        beforeitemexpand:function(n){

        },
        load:function(){
            
        },
        select:function( obj, record, index, eOpts ){
            this.fireEvent('nodeSelected',record);
            
        },
    },
    refresh:function(){
        var me=this;
        this.getStore().reload({
            callback: function() {
                me.collapseNode(me.getRootNode(), false, function() {
                   me.expandNode(me.getRootNode())
                });
            },
           scope:this
        });
    },
    createStore:function(){
        var me=this;
        return Ext.create('Ext.data.TreeStore', {
            fields: [
                {name: 'text'},
                {name: 'id'},
                {name: 'namespace'},
                {name: 'vendor'}
                ],
            proxy: {
                type: 'ajax',
                url: 'bundles',
                actionMethods: { //Esta Linea es necesaria para el metodo de llamada POST o GET

                    read: 'POST'
                },
                reader: {
                    totalProperty: "cantidad_filas"


                }
            },
            listeners:{
                beforeload:function(){
                   me.setLoading(true);
                },
                load:function(){
//                   
                    me.setLoading(false);
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
    html:'<b style="color:gray">>> Ouput Console - RAPTOR NEMESIS</b>'

    })

Ext.define('Generator.Grid',{
        extend:'Ext.grid.GridPanel',
        frame: false,
        region: 'center',
        iconCls: 'icon-table',
        title:'Schema Generator',
        
        columns: [
        
        {header: 'Entity Classes', width: 200, flex: 1, dataIndex: 'class'},
        {header: 'Entity Classes',hidden:true, width: 200, flex: 1, dataIndex: 'name'}
       
    ],
                
        initComponent: function() {
           this.store=this.createStore();
            var me=this;
            this.loadMask={store: this.getStore()};
//             this.bbar= new Ext.PagingToolbar({
//                pageSize: 100,
//                id: 'ptbaux',
//                store: me.getStore(),
//                displayInfo: true
//           
//            });
            
            this.selModel=this.createSm() ;
            this.callParent();
            this.store.on('load',function(){
                this.getSelectionModel().deselectAll();
            },this)
            
        },
        createSm:function(){
            return Ext.create('Ext.selection.CheckboxModel', {mode: 'MULTI'});
        },
        getStore:function(){
           return this.store;
        },
        createStore:function(){
           return new Ext.data.Store({
            
                fields: [
                {name: 'class'},
                {name: 'name'}
               
            ],
           
            proxy: {
                type: 'ajax',
                url: 'schema/listClasses',
                actionMethods: { //Esta Linea es necesaria para el metodo de llamada POST o GET

                    read: 'POST'
                },
                reader: {
                    totalProperty: "cantidad_filas"


                }
            }
        })
        }
    });