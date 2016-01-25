(function($){ 
    /**
     * Funcion para mostrar mensajes de manera rápida y código reducido.
     * @param msg
     * @param title Opcional
     * @param type Opcional
     * @param delay Opcional
     * @param sticker Opcional
     */
    $.vuMsg = function (msg){
        var icons = {
             error:'icon-remove-sign'
            ,info: 'icon-info-sign'
            ,warning: 'icon-warning-sign',
			success:'icon-ok'
        }
        var config = {
             title: arguments[1] || "Informaci&oacute;n."
            ,text: msg
            ,type: arguments[2] || 'info'
            ,delay: arguments[3] || 3000
            ,sticker: arguments[4] || false
            ,hide: arguments[5] || true
            ,icon: icons[arguments[2]] || icons['info']
        };
		var t=$.pnotify(config)
		
		t.updateText=function(texto,titulo){
			t.find('div[class="ui-pnotify-text"]').html(texto)
			if(titulo)
				t.find('h4[class="ui-pnotify-title"]').html(titulo)
		}
        return t;
    };
})(jQuery);
