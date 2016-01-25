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
        
//         this.grid.tbar=[this.adicionar,this.modificar,this.eliminar];
         this.win=new Generator.Window();
         //Para enviar tanto adicionar como modificar
         this.win.on('enviado',this.sendEntidad,this);
        
        
       
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
        this.arbol.getSelectionModel().on('beforedeselect', function(smodel, record) {
            this.adicionar.disable();
           
        }, this);
         this.grid.getSelectionModel().on('deselect', function(smodel, record) {
            
           if(!this.grid.getSelectionModel().hasSelection())
                this.adicionar.disable();
           
        }, this);
        
       
    },
    
    mostrarAdicionar:function(){
        this.win.mostrar(true);
        this.win.form.query('#vendor')[0].enable();
        if(this.arbol.getSelectionModel().getLastSelected().get('vendor')==true){
            this.win.form.query('#vendor')[0].disable();
            this.win.form.query('#vendor')[0].setValue(this.arbol.getSelectionModel().getLastSelected().get('text'));
        }
    },
     mostrarModificar:function(){
        this.win.mostrar(false);
        this.win.form.loadRecord( this.grid.getSelectionModel().getLastSelected());
    },
   
    sendEntidad:function(url){
        var winForm=this.win;
        var me=this;
       
        
           if (this.win.form.getForm().isValid())
        {
            this.win.form.getForm().submit({
                url: url,
                waitMsg: 'Wait for this action....',
                params:{vendor:winForm.getVendor(),definition:winForm.getDefinition()},
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
                  
                },
                
                
            });
        } 
        
        
    },
    
    questionModel:function(){
        var Entities='';
        for(var i=0;i<this.grid.getSelectionModel().getSelection().length;i++){
            Entities+='- '+this.grid.getSelectionModel().getSelection()[i].get('table')+'<br>';
        }
        var question="<div style='height:200px;overflow-y: auto;width:100%'><b>To generate:</b><br><br>"+
                "<b>Entities:</b> "+this.grid.getSelectionModel().getSelection().length+"<br>"+
                "<b>Repositories:</b> "+this.grid.getSelectionModel().getSelection().length+"<br>"+
                "<b>Bundle Entity Directory:</b> <br>"+Entities+"<br>"+
                "<b>Bundle Repository Directory:</b> <br>"+Entities+"<br>"+
                "<b>Will use the Anotation Code, the setter and </b> <br>"+
                "<b> getter methods is the best for you !!</b> <br><br>"+
                "<b>Are you shure?</b></div>";
        
        Raptor.msg.show(2,question,this.createModels,this);
    },
    createModels:function(){
        var me=this;
        var Entities=new Array();
        for(var i=0;i<this.grid.getSelectionModel().getSelection().length;i++){
           Entities.push(this.grid.getSelectionModel().getSelection()[i].get('table'));
        }
        var wait=Raptor.msg.show(4,'Wait please .....');
        Ext.Ajax.request({
            url: 'model/create',
            method: 'POST',
           
            params: {name: me.arbol.getSelectionModel().getLastSelected().get('text'),tables:Ext.encode(Entities)},
            success: function(response) {
                var resp=Ext.decode(response.responseText);
                if(resp.cod!=3)
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


    
    Ext.define('Generator.Window',{
        extend:'Ext.Window',
        width:370,
        autoHeight:true,
        modal:true,
        closeAction:'hide',
        layout:'fit',
        
        initComponent:function(){
            this.items=this.createFormulario();
            
            this.aceptar=new Ext.Button({ iconCls: 'icon-acept', text: 'Acept', handler: this.aceptar,scope:this});
            this.cancelar=new Ext.Button({ iconCls: 'icon-cancel', text: 'Cancel', handler: this.cerrar,scope:this});
            this.buttons=[this.cancelar,this.aceptar];
            this.addEvents('enviado');
            this.form.query('#vendor')[0].on('keyup',function(){
                this.createDefinition()
            },this);
            this.form.query('#bundle')[0].on('keyup',function(){
                this.createDefinition()
            },this);
            this.form.query('#vendor')[0].on('change',function(){
                this.createDefinition()
            },this);
           
            this.callParent();
        },
                
       aceptar:function(){
          
            this.fireEvent('enviado','generate/create')
       },
       getVendor:function(){
          
            return this.form.query('#vendor')[0].getValue();
       },
       getBundle:function(){
         return this.form.query('#bundle')[0].getValue();
            
       },
       getDefinition:function(){
          return this.definition;
            
       },
       createDefinition:function(){
           var vendor=this.form.query('#vendor')[0].getValue();
           var bundle=this.form.query('#bundle')[0].getValue();
           this.definition="\\"+vendor+'\\'+bundle+'Bundle';
           var definitionView='<b style="color:black">Bundle Definition:&nbsp;&nbsp;<br></b><b style="color:black">\\</b><b style="color:green">'+vendor+'</b><b style="color:black">\\</b><b style="color:black">'+bundle+'</b><b style="color:blue">Bundle</b>';
           this.form.query('#definition')[0].setText(definitionView,false);
       },
       cerrar:function(){
            this.hide();
       },
        
        mostrar:function(arg){
            if(arg){
                this.mod=false;
                this.setTitle("Create Bundle");
            }else{
                this.setTitle("Create Bundle");
                this.mod=true;
            }
            this.form.getForm().reset();
            this.show();
        },
        
        createFormulario:function(){
            this.form= new Ext.FormPanel({
            labelAlign: 'top',
            frame: true,
            autoHeight:true,
            layout:'anchor',
            bodyStyle: 'padding:5px 5px 5px 5px',
            items: [{
                    xtype: 'textfield',
                    fieldLabel: 'Vendor Name',
                    itemId:'vendor',
                    allowBlank: false,
                    maxLength: 15,
                    regex:/^[a-zA-Z0-9]+$/,
                   enableKeyEvents:true,
                     width:'100%',
                    anchor: '100%',
                    labelAlign: 'top',
                    name: 'vendor'
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Bundle Name',
                    itemId:'bundle',
                    allowBlank: false,
                    maxLength: 30,
                    enableKeyEvents:true,
                    regex:/^[a-zA-Z0-9]+$/,
                    blankText: 'The Bundle need a name',
                     width:'100%',
                    anchor: '100%',
                    labelAlign: 'top',
                    name: 'bundle'
                },{
                    xtype: 'label',
                    text: '',
                    itemId:'definition',
                    margin: '10 10 10 10'
                }]
        });	
        return this.form;
            
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
        title:'Model Generator',
        
        columns: [
        
        {header: 'Table', width: 200, flex: 1, dataIndex: 'table'}
       
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
            autoLoad:true,
                fields: [
                {name: 'table'}
               
            ],
           
            proxy: {
                type: 'ajax',
                url: 'model/listSchema',
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