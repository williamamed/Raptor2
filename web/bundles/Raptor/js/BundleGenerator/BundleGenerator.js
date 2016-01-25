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
        
       
       
        this.adicionar = new Ext.Button({disabled: true,  iconCls: 'icon-add', text: 'Create', handler: this.mostrarAdicionar, scope: this});
        this.exportar=new Ext.Button({disabled:true, iconCls: 'icon-zip', text: 'Zip Export', handler: this.exporting,scope:this});
        this.eliminar = new Ext.Button({disabled: true, iconCls: 'icon-del', text: 'Delete', handler: this.eliminarOrganismo, scope: this});
//       this.grid=new Generator.Grid();
        this.out=new Generator.OutPut();
         this.arbol=new Generator.Tree({
           tbar:[this.adicionar,this.eliminar,this.exportar]
       });
        this.items=[this.arbol,this.out];
        

         this.win=new Generator.Window();
         //Para enviar tanto adicionar como modificar
         this.win.on('enviado',this.sendEntidad,this);
        
        
       
         this.callParent();


        
        this.arbol.on('nodeSelected',function (record){
            
            
        },this)
        
         this.arbol.getSelectionModel().on('beforeselect', function(smodel, record) {
            
            if(record.get('vendor')===false){
                this.eliminar.enable();
                this.adicionar.disable();
                this.exportar.enable();
            }
           if(record.get('vendor')===true){
                this.adicionar.enable();
                this.eliminar.disable();
                this.exportar.disable();
           }
            if(record.get('vendor')===''){
                this.eliminar.disable();
                this.adicionar.enable();
                this.exportar.disable();
            }
           
        }, this);
        this.arbol.getSelectionModel().on('beforedeselect', function(smodel, record) {
            
            this.eliminar.disable();
            this.adicionar.disable();
            this.exportar.disable();
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
                waitMsg: 'wait please...',
                params:{vendor:winForm.getVendor(),definition:winForm.getDefinition()},
                success: function(form, action) {
                    if (action.result.cod != 3)
                    {
                        

                        Raptor.msg.show(action.result.cod,action.result.msg)
                        
                        winForm.hide();
                       
                        me.arbol.getStore().reload({
                            callback:function(){
                                me.arbol.collapseNode(me.arbol.getRootNode(),false,function(){
                                    me.arbol.expandNode(me.arbol.getRootNode())
                                });
                                
                            }
                        });
                        
                       var response=action.result.response;
                        
                        var cant=response.length;
                        var inc=0;
                        var inter=setInterval(function(){

                            if(inc<cant){
                                me.out.body.dom.innerHTML=me.out.body.dom.innerHTML+'<br>>>&nbsp;'+response[inc].msg;
                                inc++;
                            }else
                                clearInterval(inter);
                                
                        },500);
                    }
                    if (action.result.cod == 3)
                        Raptor.msg.show(action.result.cod,action.result.msg)
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
                }
                
            });
        } 
        
        
    },
    
    eliminarOrganismo:function(){
        Raptor.msg.show(2,"You are going to deleted the selected bundle, are you shure?",this.deleteOrganismo,this);
    },
    deleteOrganismo:function(){
        var me=this;
       
        Ext.Ajax.request({
            url: 'genbundle/delete',
            method: 'POST',
            waitMsg: 'wait please .....',
            params: {name: me.arbol.getSelectionModel().getLastSelected().get('text')},
            success: function(response) {
                var resp=Ext.decode(response.responseText);
                if(resp.cod!=3)
                  Raptor.msg.show(resp.cod,resp.msg)
            
                  me.arbol.getStore().reload({
                            callback:function(){
                                me.arbol.collapseNode(me.arbol.getRootNode(),false,function(){
                                    me.arbol.expandNode(me.arbol.getRootNode())
                                });
                                
                            }
                        });
               
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
           }
        });
    },
    
    exporting:function(){
        var me=this;
        var wait=Raptor.msg.wait('Please wait we are checking the bundle for export');
        Ext.Ajax.request({
            url: 'genbundle/checkexport',
            method: 'POST',
            waitMsg: 'wait please .....',
            params: {name: me.arbol.getSelectionModel().getLastSelected().get('text')},
            success: function(response) {
                var resp=Ext.decode(response.responseText);
                wait.close();
                if(resp.cod==Raptor.ERROR || resp.cod==Raptor.EXCEPTION)
                  Raptor.msg.show(resp.cod,resp.msg);
                else
                  window.open('genbundle/export?name='+me.arbol.getSelectionModel().getLastSelected().get('text'));
               
            },
            failure: function(form, action) {
                    wait.close();
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
          
        this.fireEvent('enviado', 'genbundle/create')
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
        this.callParent();
    },
    listeners:{
        beforeload:function(store){
           
            
//              store.getProxy().extraParams={id:this.currentNodeExpand.get('id')};
           
          
            
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
                {name: 'namespace'},
                {name: 'vendor'}
                ],
            proxy: {
                type: 'ajax',
                url: 'genbundle/bundles',
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

