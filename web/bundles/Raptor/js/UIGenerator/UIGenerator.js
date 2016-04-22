Ext.onReady(function() {
    
    var g=new Generator.View();
    g.aplied=0;
    Ext.getCmp('out-pan').on('tabchange',function(p,n){
        
        
            var tpl = new Ext.XTemplate(
            '<tpl for=".">',       // process the data.kids node
                '<div class="item-temp">',
                   '<span >',
                    '<img  src="{icon}" width="105"></span>', 
                 '<div class="items-sel" urlget="{url}" typemod="{mode}"><h4>{#}. {title}</h4><p>{desc}</p></div>' ,  
                 '</div>',
            '</tpl></p>'
            );
           
            tpl.overwrite(n.body,UiGenTemplate.items[n.id].templates);
            
            var it=Ext.query('.items-sel');
            for (var i=0;i<it.length;i++){
                Ext.get(it[i]).on('click',function(e,h){

                    g.pan.mostrarAdicionar();
                    g.pan.win.typemod=Ext.get(this).getAttribute('typemod');
                    g.pan.win.urlget=Ext.get(this).getAttribute('urlget');

                });

            }
    });
    
    
       
    
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
        this.pan=new Generator.Panel();
        this.items=this.pan;
        
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
        

        this.out=new Generator.OutPut();
         this.arbol=new Generator.Tree({
           
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
               
                Ext.getCmp('out-pan').setDisabled(false)
            }
           if(record.get('vendor')===true){
                
                Ext.getCmp('out-pan').setDisabled(true)
           }
            if(record.get('vendor')===''){
                
                Ext.getCmp('out-pan').setDisabled(true)
            }
           
        }, this);
        this.arbol.getSelectionModel().on('beforedeselect', function(smodel, record) {
            
            
           
        }, this);
        
       
    },
    
    mostrarAdicionar:function(){
        this.win.mostrar(true);
        
    },
    
    sendEntidad:function(url){
        var winForm=this.win;
        var me=this;
       
        
           if (this.win.form.getForm().isValid())
        {
            if(winForm.urlget)
                url=winForm.urlget;
            this.win.form.getForm().submit({
                url: url,
                waitMsg: 'Please wait...',
                params:{bundle:me.arbol.getSelectionModel().getLastSelected().get('bundle'),mode:winForm.typemod},
                success:function(form, action){
                    if (action.result.cod != 3)
                    {
                        

                        Raptor.msg.show(action.result.cod,action.result.msg)
                        
                        winForm.hide();
                       
                       
                    }
                    if (action.result.cod == 3)
                        Raptor.msg.show(action.result.cod,action.result.msg)
                },
                failure: function(form, action) {
                    
                    if (action.result.cod != 3)
                    {
                        

                        Raptor.msg.show(action.result.cod,action.result.msg)
                        
                        winForm.hide();
                       
                       
                    }
                    if (action.result.cod == 3)
                        Raptor.msg.show(action.result.cod,action.result.msg)
                }
            });
        } 
        
        
    }
    
})


    
    Ext.define('Generator.Window',{
        extend:'Ext.Window',
        width:370,
        autoHeight:true,
        modal:true,
        closeAction:'hide',
        layout:'fit',
        title:'Enter the UI name',
        initComponent:function(){
            this.items=this.createFormulario();
            
            this.aceptar=new Ext.Button({ iconCls: 'icon-acept', text: 'Acept', handler: this.aceptar,scope:this});
            this.cancelar=new Ext.Button({ iconCls: 'icon-cancel', text: 'Cancel', handler: this.cerrar,scope:this});
            this.buttons=[this.cancelar,this.aceptar];
            this.addEvents('enviado');
            
            this.callParent();
        },
                
       aceptar:function(){
          
            this.fireEvent('enviado','genui/create')
       },
       getModule:function(){
          
            return this.form.query('#vendor')[0].getValue();
       },
       
       cerrar:function(){
            this.hide();
       },
        
        mostrar:function(arg){
            
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
                    fieldLabel: 'Module Name',
                    itemId:'vendor',
                    allowBlank: false,
                    maxLength: 15,
                    regex:/^[a-zA-Z0-9]+$/,
                   enableKeyEvents:true,
                     width:'100%',
                    anchor: '100%',
                    labelAlign: 'top',
                    name: 'module'
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

            
        },
        beforeitemexpand:function(n){

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
                {name: 'vendor'},
                {name: 'bundle'}
              ],
            proxy: {
                type: 'ajax',
                url: 'genui/bundles',
                actionMethods: { //Esta Linea es necesaria para el metodo de llamada POST o GET

                    read: 'POST'
                },
                reader: {
                    totalProperty: "cantidad_filas"


                }
            },
            listeners:{
                load:function(){
                   
                }
            }
            
        })
    }
    
    
});

Ext.define('Generator.OutPut',{
    extend:'Ext.tab.Panel',
     layout: {
            type: 'border',
            padding: 5
        },
    title:'UI Generator - <b style="color:gray;padding: 3px;">Build your app more easly</b>',
    region:'center',
    id:'out-pan',
    disabled:true,
    header:true,
    initComponent:function(){

        this.callParent();
        this.on('render',function(){
            this.setLoading('Looking for templates ...');
            Ext.Ajax.request({
                url: 'genui/list',
                callback: function() {
                    this.setLoading(false);

                },
                success: function(response, opts) {
                    var obj = Ext.decode(response.responseText);
                    UiGenTemplate={};
                    
                    Ext.Object.each(obj, function(key, value, myself) {
                        this.add({
                            title: value.title,
                            id: key,
                            icon: Raptor.getBundleResource(value.icon),
                            bodyStyle:'overflow: auto'
                        });
                        
                        for(var i=0;i<value.templates.length;i++){
                            value.templates[i].icon=Raptor.getBundleResource(value.templates[i].icon);
                            value.templates[i].mode=key+':'+i;
                        }
                    },this);
                    UiGenTemplate.items=obj;
                    
                    Ext.getCmp('out-pan').setActiveTab(0);
                },
                failure: function(response, opts) {
                     Raptor.msg.show(3,'server-side failure with status code ' + response.status);
                },
                scope: this
            });
        },this)
        
    }

    });

