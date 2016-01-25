/**
 * Created with JetBrains PhpStorm.
 * User: eddy
 * Date: 21/04/14
 * Time: 14:13
 */

VU = {};

/**
 * Función para crear espacios de nombre
 * @example VU.ns('VU.Bundle.Accion'), VU.namespace('VU.Bundle.Accion')
 * @returns {Function}
 */
VU.ns = VU.namespace = function(){
    var obj, blocks, resto;
    for(var i =0; i < arguments.length; i++){
        var arg = arguments[i];
        blocks = arg.split(".");
        obj = window[blocks[0]] = window[blocks[0]] || {};
        resto = blocks.slice(1);
        for(var j =0; j < resto.length; j++){
            obj = obj[resto[j]] = obj[resto[j]] || {};
        }
    }
    return obj;
};

/**
 * Función agregada al prototype que permite clonar
 * @returns {Function}
 */
Function.prototype.clone = function() {
    var that = this;
    var temp = function temporary() { return that.apply(this, arguments); };
    for(var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};
/**
 * Función agregada a la clase String que permite formatear una cadena de acuerdo al patrón {#}
 * donde # es el índice del argumento pasado, reemplaza todas las coincidencias en la cadena.
 * Basado en la misma función de Ext-js
 * @augments Array Valores a reemplazar en la cadena
 *
 * @return String Cadena formateada
 */
String.prototype.format = function(){
    var f = this;
    for(var i = 0; i < arguments.length; i++){
        f = f.replace(new RegExp('\\{'+i+'\\}', 'g'), arguments[i]);
    }
    return f;
}