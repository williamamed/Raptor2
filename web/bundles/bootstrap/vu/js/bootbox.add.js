/* 
 * Extension del bootbox para agregarle iconos a los mensajes de alertas, 
 * informaciones y errores.
 * 
 * @Author Eddie
 */

!function($){
    if(window.bootbox != undefined){
        window.bootbox.vuAlert = function(msg, type, btnText, callBack){
            var typeApply = 'hide';
            var type = type.toUpperCase();
            switch(type){
                case 'INFO': typeApply = 'icon-info-sign';//'msg-info';
                              break;
                case 'ERROR': typeApply = 'icon-remove-sign';//'msg-error';
                              break;
                case 'WARNING': typeApply = 'icon-warning-sign';//'msg-warning';
                              break;
                case 'CONFIRM': typeApply = 'icon-question-sign';//'msg-confirm';
                              break;
				case 'SUCCESS': typeApply = 'icon-ok';//'msg-confirm';
                              break;
            }
            var msgBody =  '<div class="row-fluid">'
                          +'<i class="'+typeApply+'" style="font-size: 60px; float: left; color: #888888;"></i>'
                          +'<div class="vu-text-msg-container">'
                          +'<span class="vu-text-msg">'
                          +msg
                          +'</span>'
                          +'</div>'
                          +'</div>';
            if(typeof btnText === 'string' ){
                bootbox.alert(msgBody, btnText, callBack);
            }else if(typeof btnText === 'function'){
                bootbox.alert(msgBody, btnText);
            }else{
                 bootbox.alert(msgBody);
            }
        }
        
        /**
         * @augments msg Mensaje a mostrar
         * @augments type Tipo de icono  mostrar (INFO, ERROR, WARNING)
         * @augments btn1 Texto del boton 1
         * @augments btn2 Texto del boton 2
         * @augments callBack funcion que se ejecuta cuando se presionan los botones
         *           recibe como argumento true o false que representa si se confirma
         *           o no.
         */
        window.bootbox.vuConfirm = function(){
            var element = this;
            this.getType = function(type){
                var typeApply = 'hide';
                switch(type.toUpperCase()){
                case 'INFO': typeApply = 'icon-info-sign';//'msg-info';
                              break;
                case 'ERROR': typeApply = 'icon-remove-sign';//'msg-error';
                              break;
                case 'WARNING': typeApply = 'icon-warning-sign';//'msg-warning';
                              break;
                case 'CONFIRM': typeApply = 'icon-question-sign';//'msg-confirm';
                              break;
                }
                return typeApply;
            }
            
            this.getMesgBody = function(msg, type){
                return    '<div class="row-fluid">'
                         +'<i class="'+this.getType(type)+'" style="font-size: 60px; float: left; color: #888888;"></i>'
                         +'<div class="vu-text-msg-container">'
                         +'<span class="vu-text-msg">'
                         +msg
                         +'</span>'
                         +'</div>'
                         +'</div>';
            }
            
            var type = 'hide';
//            var msg = "",
//                type = null,
//                btn1 = null,
//                btn2 = null,
//                callBack = null,
//                msgApply = "";
                
                
            switch(arguments.length){
                case 1: msg = arguments[0];
                        msgApply = this.getMesgBody(msg, type);
                        bootbox.confirm(msgApply, callBack);
                        break;
                case 2: msg = arguments[0];
                        callBack = arguments[1];
                        msgApply = this.getMesgBody(msg, type);
                        bootbox.confirm(msgApply, callBack);
                        break;
                case 3: msg = arguments[0];
                        type = arguments[1];
                        callBack = arguments[2];
                        msgApply = this.getMesgBody(msg, type);
                        bootbox.confirm(msgApply, callBack);
                        break;
                case 4: msg = arguments[0];
                        type = arguments[1];
                        btn1 = arguments[2];
                        callBack = arguments[3];
                        msgApply = this.getMesgBody(msg, type);
                        bootbox.confirm(msgApply, btn1, callBack);
                        break;
                case 5: msg = arguments[0];
                        type = arguments[1];
                        btn1 = arguments[2];
                        btn2 = arguments[3];
                        callBack = arguments[4];
                        msgApply = this.getMesgBody(msg, type);
                        bootbox.confirm(msgApply, btn1, btn2, callBack);
                        break;
            }
        }
    }
}(jQuery);