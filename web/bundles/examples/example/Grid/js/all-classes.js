
Ext.define('Grid.model.GenericModel', {
    extend: 'Ext.data.Model',
    fields: ['id','nombre','apellidos','edad','sexo'],
    
    proxy: {
        type: 'rest',
        listeners:{
            exception:function(s,response){
                var resp=Ext.decode(response.responseText);
                Dino.msg.info(resp.cod,resp.msg);
            }
        },
        api:{
            create  : 'example/insert',
            read    : 'example/list',
            update  : 'example/edit',
            destroy : 'example/delete'
        },
        reader: {
            type: 'json'
           
        }
    }
});
Ext.define('Grid.store.Generic', {
    extend: 'Ext.data.Store',
    model: 'Grid.model.GenericModel',
    autoLoad:true,
    autoSync:true,
    listeners:{
        write:function(s,op){
            for(var i=0,cant=op.getRecords().length,record=op.getRecords();i<cant;i++){
                Dino.msg.info(1,"The element "+record[i].get('id'));
            }
        }
    }
});
Ext.define('Grid.controller.Generic', {
    extend: 'Ext.app.Controller',
    stores: ['Generic'],
    models: ['GenericModel'],
    refs: [{
            ref: 'genericlist',
            selector: 'genericlist'
        },
        {
            ref: 'buttonAdd',
            selector: 'viewport button[action=addAction]'
        },
        {
            ref: 'buttonEdit',
            selector: 'viewport button[action=editAction]'
        },
        {
            ref: 'buttonDelete',
            selector: 'viewport button[action=deleteAction]'
        }
    ],
    init: function() {
        this.control({
            
            'genericwindow button[action=save]': {
                click: this.addAction
            },
            'viewport button[action=addAction]': {
                click: this.onAddAction
            },
            'viewport button[action=editAction]': {
                click: this.onEditAction
            },
            'viewport button[action=deleteAction]': {
                click: this.onDeleteAction
            },
            'genericlist': {
                beforeselect: this.onListSelect,
                beforedeselect: this.onListDeSelect
            },
            
            'viewport':{
                render:this.onRender
            }
        });
       
    },
    onRender:function(){
        //Make Raptor control the UI to activate the privilege
        //Rpt.controlActions();
    },
    
    onListSelect: function() {
       this.getButtonEdit().enable()
       this.getButtonDelete().enable()
    },
    onListDeSelect: function() {
       this.getButtonEdit().disable()
       this.getButtonDelete().disable()
        
    },
   
    onAddAction: function() {
        var view = Ext.widget('genericwindow');
    },
    
    onEditAction: function() {
        var model=this.getGenericlist().getSelectionModel().getLastSelected();
        var view = Ext.widget('genericwindow', {action: 'edit',title:'Modify'});
            var form=view.down('form');
            form.loadRecord(model);
    },
    
    onDeleteAction: function() {
       Dino.msg.info(2,'Are you shure', this.deleteAction, this);
    },
    
    addAction:function(button){
        
        var win    = button.up('window'),
        form   = win.down('form'),
        values = form.getValues();
        var record;
       this.getGenericlist().getSelectionModel().deselectAll();
        if(win.action=='edit'){
            record= form.getRecord();
            record.set(values);
        }else{
            record=this.getGenericStore().add(values)[0];
        }
        win.close();
    },
    
    deleteAction:function(){
        var record= this.getGenericlist().getSelectionModel().getLastSelected();
        this.getGenericlist().getSelectionModel().deselectAll();
        this.getGenericStore().remove(record);
    }

});



Ext.define('Grid.view.GenericList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.genericlist',
    
    store: 'Generic',
    title: "Generic grid - use Raptor.getTag('title') to integrate with language package ",
    iconCls:'',
   
    initComponent: function() {
        this.columns = [{
            header:"Header",
            dataIndex: 'nombre',
            flex: 1
        },{
            header:"Header1",
            dataIndex: 'apellidos',
            flex: 1
        },{
            header:"Header2",
            dataIndex: 'edad',
            flex: 1
        },{
            header:"Header1",
            dataIndex: 'sexo',
            flex: 1
        }];
        this.dockedItems = [{
            dock: 'top',
            xtype: 'toolbar',
            
            items: [{
                xtype: 'button',
                text: 'Add',
                action:'addAction',
                iconCls:'icon-add'  
            },{
                xtype: 'button',
                text: 'Edit',
                disabled:true,
                privilegeName:'insert',
                action:'editAction',
                iconCls:'icon-add'  
            },{
                xtype: 'button',
                text: 'Delete',
                disabled:true,
                privilegeName:'insert',
                action:'deleteAction',
                iconCls:'icon-add'  
            }]
        }];
        
        this.callParent();
    }
});


 Ext.define('Grid.view.GenericWindow',{
        extend:'Ext.Window',
        width:300,
        autoHeight:true,
        modal:true,
        alias: 'widget.genericwindow',
        autoShow: true,
        closeAction:'destroy',
        title:"Generic window",
        layout:'fit',
        initComponent:function(){
            this.items = {
            labelAlign: 'top',
            frame: true,
            xtype: 'form',
            layout: 'anchor',
            bodyStyle: 'padding:5px 5px 5px 5px',
            defaults: {frame: true, anchor: '100%'},
            items: [{
                            xtype: 'textfield',
                            fieldLabel: 'Test field',
                            allowBlank: false,
                            maxLength: 40,
                            width: '100%',
                            labelAlign: 'top',
                            name: 'nombre'
                            
                        },{
                            xtype: 'textfield',
                            fieldLabel: 'Apellidos',
                            allowBlank: false,
                            maxLength: 40,
                            width: '100%',
                            labelAlign: 'top',
                            name: 'apellidos'
                            
                        },{
                            xtype: 'textfield',
                            fieldLabel: 'edad',
                            allowBlank: false,
                            maxLength: 40,
                            width: '100%',
                            labelAlign: 'top',
                            name: 'edad'
                        }]
        };
            
        this.buttons = [{   iconCls: 'icon-acept',
                            text: 'Acept',
                            action: 'save'
                        }, 
                        {
                            iconCls: 'icon-cancel',
                            text: 'Cancel',
                            scope: this,
                            handler: this.close
                        }]    
            
            
            
            this.callParent();
           
        } 
 
      
    })



Ext.define('Grid.view.Viewport', {
    extend: 'Ext.container.Viewport',
    layout: 'fit',
    
    
    initComponent: function() {
        this.items = [{
                xtype:'container',
                layout:'border',
                items:[{
                        xtype: 'genericlist',
                        region:'center'
                    }]
        }];
        
        this.callParent();
    }
});