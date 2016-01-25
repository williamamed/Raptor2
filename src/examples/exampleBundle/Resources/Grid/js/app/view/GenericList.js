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

