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