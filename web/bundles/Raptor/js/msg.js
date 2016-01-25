/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

Ext.ns('Dino.msg');
var msgArray=new Array();
var msgArrayText=new Array();
Ext.require('Ext.form.field.Base');
Ext.onReady(function() {
  container = Ext.DomHelper.append(Ext.getBody(), {
                tag: 'span',
              
  }, true);
    ancho1 = Ext.getBody();
    container.position('absolute', 1000000, ancho1.getWidth(true) - 330, 40);

    Ext.form.field.Base.override({
    constructor: function() {
        

        this.callParent(arguments);
	 if(this.allowBlank==false)
            this.labelSeparator='<span>: </span><b style="color:red;font-size:12px"> *</b>';
    }
});

Ext.Ajax.on('requestcomplete', function(conn, response, options){
    
		var respText = response.responseText;
                var resp=Ext.decode(respText);
		if (resp!=undefined&&resp.cod!=undefined&&resp.cod==5){
			Dino.msg.info(5,resp.msg,null,null,resp.trace);
		}
});

Ext.Ajax.on('requestexception', function(conn, response, options){
   
		var respText = response.responseText;
                var resp=Ext.decode(respText);
		if (resp!=undefined&&resp.cod!=undefined&&resp.cod==5){
			Dino.msg.info(5,resp.msg,null,null,resp.trace);
		}
});

Ext.Ajax.on('beforerequest', function (conn, options) {
                    if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {
                       if(Raptor)
                           var token=Raptor.getToken();
                        if(!options.params)
                           options.params={token:token};
                       else
                           options.params.token=token;                       
                    }
                    
                   
                    }, this);

});

    
Dino.msg.info=function(tipo, msg, fn, scope,trace){
    
    switch (tipo){
        case 1:{
               var f = Ext.DomHelper.append(Ext.getBody(), {
                tag: 'span',
                cls: 'msg-raptor'
            }, true);

            var ancho = Ext.getBody();

            Ext.DomHelper.applyStyles(f, {
                'width': '300px', 'z-index': '1000000',
                 'border-radius':'5px',
                 'padding':'5px',
                 'margin-bottom':'5px'
            });
//            f.setOpacity(0.75);
            if (Ext.version == '2.2') {
                f.addClass('x-panel-header');
                f.addClass('x-unselectable');
                f.addClass('x-panel-header-text');
            }
            f.hide();
             var title = Ext.DomHelper.append(f, {
                tag: 'div',
                html: '<span class="icon-close" style="position:absolute;width:20px;height:20px;right:-2px;top:-10px;margin:2px;"></span>'
            }, true);
            
            var im = Ext.DomHelper.append(f, {
                tag: 'span',
                html: '<span class="icon-info" style="width:20px;height:20px; float:left;margin:2px;"></span>',
                cls: 'x-window-dlg'
            }, true);


            var tex = Ext.DomHelper.append(f, {
                tag: 'span',
                
                html: msg


            }, true);

            Ext.DomHelper.applyStyles(tex, {
                'font': 'bold', 'margin': '10px', 'float': 'rigth'
            });
            f.appendTo(container);
            f.show(true);
            
            
            
            var time=setTimeout(function() {
                im.hide(true);
                tex.hide(true);
             Ext.DomHelper.applyStyles(f, {
                
                 'border-radius':'0px',
                 'padding':'0px',
                 'margin-bottom':'0apx'
            });
             Ext.fly(f).setHeight(0, {
                duration : 500, // animation will have a duration of .5 seconds
                // will change the content to "finished"
                callback: function(){  f.remove(); }
            });
            
             
            }, 15000); 
            
            title.on('click',function(){
                    clearTimeout(time);
                    im.hide(true);
                    tex.hide(true);
                    Ext.DomHelper.applyStyles(f, {
                        'border-radius': '0px',
                        'padding': '0px',
                        'margin-bottom': '0apx'
                    });
                    Ext.fly(f).setHeight(0, {
                        duration: 500, // animation will have a duration of .5 seconds
                        // will change the content to "finished"
                        callback: function() {
                            f.remove();
                        }
                    });
            })
            
            
            break;
            
        }
        
        case 2:{
                Ext.Msg.confirm('', msg, function(n) {
                    if (n === 'yes') {
                        fn.call(scope);

                    }


                })
                break;
        }
        
        case 3:{
            var buttons = new Array(Ext.MessageBox.OK, Ext.MessageBox.OKCANCEL, Ext.MessageBox.OK);
            var title = new Array('', '', '');
            var icons = new Array(Ext.MessageBox.INFO, Ext.MessageBox.QUESTION, Ext.MessageBox.ERROR);
            Ext.MessageBox.show({
                title: title[tipo - 1],
                msg: msg,
                //animEl: Ext.getBody(),
                buttons: buttons[tipo - 1],
                icon: icons[tipo - 1],
                fn: fn,
                scope: scope
            }); 
                break;
        }
        
        case 4:{
             return Ext.Msg.wait(msg,'',{
                    progress: true,
//                    title: '',
                    closable: false,
                    modal: true,
                   

                    width: 350
                });  
               break;  
        }
        
        case 5:{
              var win=new Ext.Window({
                  title:'Exception',
                  modal:true,
                  autoHeight:true,
                  closeAction:'destroy',
                  layout:'anchor',
                  iconCls: 'icon-excep',
                  width:600,
                  buttons:[{
                          xtype:'button',
                          text:'Close',
                          iconCls:'icon-cancel',
                          handler:function(){
                              win.close();
                          },
                          scope:this
                  }],
                  items:[{
                          xtype:'container',
                          layout:'anchor',
                          anchor:'100%',
                         
                          height:'100%',
                          items:[{
                                    xtype:'container',
                                    margin:'5 5 5 5',
                                    padding:10,
                                    html:msg,
                                    anchor:'100%'
                            },{
                                  xtype:'fieldset',
                                  margin:'5 15 5 5',
                                  title: 'Trace',
                                  collapsible: true,
                                  
                                  collapsed:true,
                                  layout:'fit',
                                  anchor:'100%',
                                  items:{
                                      xtype:'container',
                                      html:trace
                                  }
                          }]
                  }]
               }); 
               win.show();
               break;  
        }
        
    }
    
    
}




Dino.msg.isValidJson=function(text){
    if(text.split('<body').length>1)
        return true;
    else
        return false;
    
}





                    
Dino.Animated = function(type) {
    Ext.onReady(function() {
        var cl='raptor-anim';
        if(type){
            cl=type;
        }
        var f = Ext.DomHelper.append(Ext.getBody(), {
            tag: 'div',cls: cl
        }, true);
        
        var ancho = Ext.getBody();
        Ext.DomHelper.applyStyles(f, {
            'width': '80px', height: '95px', 'z-index': '1000000','border-radius':'5px'
        });
        f.position('absolute', 1000000, ancho.getWidth(true) - 100, ancho.getHeight() - 100);
        f.show({duration: 1000});
        f.flagVision = true;
        
        setInterval(function() {
            if (f.flagVision) {
                f.fadeOut({
                    opacity: 0, //can be any value between 0 and 1 (e.g. .5)
                    easing: 'easeOut',
                    duration: 1000,
                    remove: false,
                    useDisplay: false
                });
                f.flagVision = false;
            } else {
                f.show({
                    opacity: 0, //can be any value between 0 and 1 (e.g. .5)
                    easing: 'easeIn',
                    duration: 1000,
                    remove: false,
                    useDisplay: false
                });

                f.flagVision = true;
            }
        }, 20000);
    })
}