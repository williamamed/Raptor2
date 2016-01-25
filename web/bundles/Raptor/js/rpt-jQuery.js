
    if($){
      
       Rpt={
          controlActions: function() {
            var actions = Raptor.getActions();
            if (actions != false) {
                var actionsSize = actions.length;
                var selector = new Array();
                for (var i = 0; i < actionsSize; i++) {
                    selector.push("[privilegeName='" + actions[i] + "'] ");
                }
                var sel=selector.join(',');
                
                $(sel).show();
                
            }
        }
       }
    }

