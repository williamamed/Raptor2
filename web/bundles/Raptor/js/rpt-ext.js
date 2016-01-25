
    if(Ext){
       
       Raptor.controlActions=function() {
            var actions = Raptor.getActions();
            if (actions != false) {
                var actionsSize = actions.length;
                var selector = new Array();
                for (var i = 0; i < actionsSize; i++) {
                    selector.push('[privilegeName=' + actions[i] + '] ');
                }
                var sel=selector.join(',');
                var all = Ext.ComponentQuery.query('[?privilegeName]');
                Ext.each(all, function(name, index, countriesItSelf) {
                    name.hide();
                });
                
                var compo = Ext.ComponentQuery.query(sel);
                
                Ext.each(compo, function(name, index, countriesItSelf) {
                    name.show();
                });
            }
        }
       }
 
    
  
