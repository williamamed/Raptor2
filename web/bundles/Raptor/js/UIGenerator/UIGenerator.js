Ext.onReady(function() {
    UiGenTemplate.init();
    var g=new Generator.View();
    g.aplied=0;
    Ext.getCmp('out-pan').on('tabchange',function(p,n){
        if(g.aplied<2){
            var tpl = new Ext.XTemplate(
            '<tpl for=".">',       // process the data.kids node
                '<div class="item-temp">',
                   '<span >',
                    '<img  src="{url}" width="105"></span>', 
                 '<div class="items-sel" typemod="{mode}"><h4>{#}. {title}</h4><p>{desc}</p></div>' ,  
                 '</div>',
            '</tpl></p>'
            );
            if(n.id=='ext-pan')    
            tpl.overwrite(n.body,ext_template);

            if(n.id=='boot-pan')    
            tpl.overwrite(n.body,boot_template);
            g.aplied++;
        }
    })
    Ext.getCmp('out-pan').setActiveTab(1);
    Ext.getCmp('out-pan').setActiveTab(0);
    
    var it=Ext.query('.items-sel');
    for (var i=0;i<it.length;i++){
        Ext.get(it[i]).on('click',function(e,h){
            
            g.pan.mostrarAdicionar();
            g.pan.win.typemod=Ext.get(this).getAttribute('typemod');
            
        });
        
    }   
    
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
        
        
//       this.grid=new Generator.Grid();
        this.out=new Generator.OutPut();
         this.arbol=new Generator.Tree({
           
       });
        this.items=[this.arbol,this.out];
        
//         this.grid.tbar=[this.adicionar,this.modificar,this.eliminar];
         this.win=new Generator.Window();
         //Para enviar tanto adicionar como modificar
         this.win.on('enviado',this.sendEntidad,this);
        
        
       
         this.callParent();
         
//        this.grid.getSelectionModel().on('beforeselect', function(smodel, rowIndex, keepExisting, record) {
//            this.modificar.enable();
//            this.eliminar.enable();
//           
//        }, this);
//        this.grid.getSelectionModel().on('beforedeselect', function(smodel, rowIndex, keepExisting, record) {
//            this.modificar.disable();
//            this.eliminar.disable();
//           
//        }, this);
        
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
    title:'UI Generator - <b style="color:gray;padding: 3px;">Build your app more easy</b>',
    region:'center',
    id:'out-pan',
    disabled:true,
    header:true,
    initComponent:function(){
        this.items=[ {
                title: 'Bootstrap 3',
                id: 'boot-pan',
                icon: Raptor.getBundleResource('Raptor/img/tech/bootstrap-32.png'),
                bodyStyle:'overflow: auto'
            },{
                title: 'Extjs 4',
                id: 'ext-pan',
                icon: Raptor.getBundleResource('Raptor/img/tech/ext-16.gif'),
                bodyStyle:'overflow: auto'
            }]
        this.callParent();
        
    },
   // html:'<b style="color:gray">>> Ouput Console - RAPTOR NEMESIS</b>'

    })

UiGenTemplate={
    init:function(){
        ext_template=[{
                title:'Empty Template',
                desc:"Create a empty ExtJs template",
                url:Raptor.getBundleResource("Raptor/img/ui/empty.png"),
                mode:'ext:0'
        },{
                title:'Grid Template <b style="color:white;background: red;padding: 3px;">New</b>',
                desc:"Create a Grid based ExtJs template",
                url:Raptor.getBundleResource("Raptor/img/ui/grid.gif"),
                mode:'ext:1'
        },{
                title:'Tree-Grid Template <b style="color:white;background: red;padding: 3px;">New</b>',
                desc:"Create a Tree-Grid based ExtJs template",
                url:Raptor.getBundleResource("Raptor/img/ui/grid.gif"),
                mode:'ext:2'
        }]

        boot_template=[{
                title:'Empty Boot Template',
                desc:"Create a starter bootstrap template",
                url:Raptor.getBundleResource("Raptor/img/ui/bootstrap-empty.png"),
                mode:'boot:0'
        },{
                title:'Boot Site Template <b style="color:white;background: red;padding: 3px;">New</b>',
                desc:"Create a fluid boostrap template",
                url:Raptor.getBundleResource("Raptor/img/ui/bootstrap-full.png"),
                mode:'boot:1'
        }]
    }
}
