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