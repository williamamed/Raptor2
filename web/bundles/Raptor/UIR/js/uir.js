
UIR = {};
UIR.adjust=true;

UIR.autoAdjust=function(){
    
}
/**
 * Función para crear espacios de nombre
 * @example VU.ns('UIR.Bundle.Accion'), UIR.namespace('VU.Bundle.Accion')
 * @returns {Function}
 */
UIR.ns = UIR.namespace = function(){
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
UIR.Internal={
    ControllerList:{},
    ModelList:{},        
    BaseController:function(options,name,app){
        var me=this;
        
            me.options=options;
            
      this.controllerName = name;
      this.appName = app;
    },
    
    BaseModel:function(options){
        var me=this;
        $(document).ready(function() {
            me.options=options;
            me.internalInit();
            me.init();
            me.postInit();
        });
    }
};
UIR.Controller=function(name,options){
   var ns=name.split('.');
   var obj;
   if(ns.length===2){
        var app=$('[uir-app="'+ns[0]+'"]');
        if(app.size()>0){
            obj=new UIR.Internal.BaseController(options,ns[1],ns[0]);
            app.data(name,obj);
        }else
            throw Error('The app '+ns[0]+' you declare not exist !!')
        
   }else
        throw Error('The controller '+name+' that you declare is wrong(MISSING APP NAME), you must declare an app name ej. Appname.mycontroller')
   
   return obj;
}
UIR.getController=function(name){
   
   var ns=name.split('.');
   var obj;
   if(ns.length===2){
        var app=$('[uir-app="'+ns[0]+'"]');
        if(app.size()>0){
           
            return app.data(name);
        }else
            throw Error('The app '+ns[0]+' you call not exist !!')
        
   }else
        throw Error('The controller '+name+' that you call is wrong(MISSING APP NAME), you must call an app name ej. Appname.mycontroller')
   
}

UIR.Internal.BaseController.prototype={
    constructor: UIR.Internal.BaseController,
    
    elements:[],
    events:{},
    Run:function(fun){
        
        var me=this;    
        $(document).ready(function() {
                
                me.internalInit();
                if(fun instanceof Function)
                    fun.call(me);
                
                UIR.autoAdjust();
            })
    },
    run:function(fun){
        
        var me=this;    
        $(document).ready(function() {
                
                me.internalInit();
                if(fun instanceof Function)
                    fun.call(me);
                
                UIR.autoAdjust();
            })
    },
    internalInit:function(){
        this.options=$.extend(this,this.options);
        
        this.make();
    },
    addEvents:function(obj){
        this.events=obj;
        
        this.postInit();
    },
    make:function(){
        var count=this.elements.length;
        
        for(var i=0;i<count;++i){
            var name=this.elements[i].name;
            var fun='get'+name.substring(0,1).toUpperCase()+name.substring(1);
            
            var me=this;
            (function(){
                var item=me.elements[i];
                me[fun]=function(){
                        return $(item.ref);
                };
             })()
        }
        
    },
    postInit:function(){
    var me=this; 
        if(this.events instanceof Object){
            $.each(this.events, function(i, val) {
                    var delegate=false;
                   if(val.delegate && (typeof  val.delegate === 'boolean' || typeof  val.delegate === 'string'))
                            delegate=true;
                    
                    $.each(val,function(i2,val2){
                        
                        if(delegate){
                            if(typeof  val.delegate === 'boolean' && val.delegate===true)
                                $('body').on(i2,i,$.proxy(val2,me,$(i)))
                            
                            if(typeof  val.delegate === 'string')
                                $(val.delegate).on(i2,i,$.proxy(val2,me,$(i)))
                                
                        }else
                            $(i).on(i2,$.proxy(val2,me,$(i)))
                    })               
            });
            
        }
    },
    model: function(name) {
        
        var app = $('[uir-app="' + this.appName + '"]');
        if (app.size() > 0) {

            return app.data('Model-'+name);
        } else
            throw Error('The app ' + this.appName + ' you call not exist !!')

    }
}

UIR.Model=function(name,options){
   var ns=name.split('.');
   var obj;
   if(ns.length===2){
        var app=$('[uir-app="'+ns[0]+'"]');
        if(app.size()>0){
            
            var obj=new UIR.Internal.BaseModel(options);
            app.data('Model-'+name,obj);
        }else
            throw Error('The app node '+ns[0]+' you declare not exist !!')
        
   }else
        throw Error('The model '+name+' that you declare is wrong(MISSING APP NAME), you must declare an app name ej. Appname.mymodel')
   
  
   return obj;
}

UIR.Internal.BaseModel.prototype={
    constructor: UIR.Internal.BaseModel,
    
    ajax:['post'],
    url:'',
    
    internalInit:function(){
        this.options=$.extend(this,this.options);
        
       
    },
    
    postInit:function(){
        
    },
    make:function(options){
         
         $.ajax({ 
            type: this.ajax.toUpperCase(), 
            url: this.url, 
            data: options, 
            success: function(msg){ 
              alert( "Data Saved: " + msg ); 
            } 
         });
    }
}



// @tag extras,core
// @require ../lang/Error.js
// @define Ext.JSON

/**
 * Modified version of [Douglas Crockford's JSON.js][dc] that doesn't
 * mess with the Object prototype.
 *
 * [dc]: http://www.json.org/js.html
 *
 * @singleton
 */
UIR.isDate=function(value) {
      return toString.call(value) === '[object Date]';
}
UIR.isString=function(value) {
            return typeof value === 'string';
}     
UIR.isBoolean= function(value) {
            return typeof value === 'boolean';
}
UIR.isArray=function(value) {
      return toString.call(value) === '[object Array]';
}
UIR.isObject=(toString.call(null) === '[object Object]') ?
        function(value) {
            // check ownerDocument here as well to exclude DOM nodes
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } :
        function(value) {
            return toString.call(value) === '[object Object]';
        }


UIR.JSON = (new(function() {
    var me = this,
    encodingFunction,
    decodingFunction,
    useNative = null,
    useHasOwn = !! {}.hasOwnProperty,
    isNative = function() {
        if (useNative === null) {
            useNative = UIR.USE_NATIVE_JSON && window.JSON && JSON.toString() == '[object JSON]';
        }
        return useNative;
    },
    pad = function(n) {
        return n < 10 ? "0" + n : n;
    },
    doDecode = function(json) {
        return eval("(" + json + ')');
    },
    doEncode = function(o, newline) {
        // http://jsperf.com/is-undefined
        if (o === null || o === undefined) {
            return "null";
        } else if (UIR.isDate(o)) {
            return UIR.JSON.encodeDate(o);
        } else if (UIR.isString(o)) {
            return UIR.JSON.encodeString(o);
        } else if (typeof o == "number") {
            //don't use isNumber here, since finite checks happen inside isNumber
            return isFinite(o) ? String(o) : "null";
        } else if (UIR.isBoolean(o)) {
            return String(o);
        }
        // Allow custom zerialization by adding a toJSON method to any object type.
        // Date/String have a toJSON in some environments, so check these first.
        else if (o.toJSON) {
            return o.toJSON();
        } else if (UIR.isArray(o)) {
            return encodeArray(o, newline);
        } else if (UIR.isObject(o)) {
            return encodeObject(o, newline);
        } else if (typeof o === "function") {
            return "null";
        }
        return 'undefined';
    },
    m = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"': '\\"',
        "\\": '\\\\',
        '\x0b': '\\u000b' //ie doesn't handle \v
    },
    charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g,
    encodeString = function(s) {
        return '"' + s.replace(charToReplace, function(a) {
            var c = m[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
    },

    //<debug>
    encodeArrayPretty = function(o, newline) {
        var len = o.length,
            cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["[", cnewline], // Note newline in case there are no members
            i;

        for (i = 0; i < len; i += 1) {
            a.push(UIR.JSON.encodeValue(o[i], cnewline), sep);
        }

        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = newline + ']';

        return a.join('');
    },

    encodeObjectPretty = function(o, newline) {
        var cnewline = newline + '   ',
            sep = ',' + cnewline,
            a = ["{", cnewline], // Note newline in case there are no members
            i, val;

        for (i in o) {
            val = o[i];
            if (!useHasOwn || o.hasOwnProperty(i)) {
                // To match JSON.stringify, we shouldn't encode functions or undefined
                if (typeof val === 'function' || val === undefined) {
                    continue;
                }
                a.push(UIR.JSON.encodeValue(i) + ': ' + UIR.JSON.encodeValue(val, cnewline), sep);
            }
        }

        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = newline + '}';

        return a.join('');
    },
    //</debug>

    encodeArray = function(o, newline) {
        //<debug>
        if (newline) {
            return encodeArrayPretty(o, newline);
        }
        //</debug>

        var a = ["[", ""], // Note empty string in case there are no serializable members.
            len = o.length,
            i;
        for (i = 0; i < len; i += 1) {
            a.push(UIR.JSON.encodeValue(o[i]), ',');
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = ']';
        return a.join("");
    },

    encodeObject = function(o, newline) {
        //<debug>
        if (newline) {
            return encodeObjectPretty(o, newline);
        }
        //</debug>

        var a = ["{", ""], // Note empty string in case there are no serializable members.
            i, val;
        for (i in o) {
            val = o[i];
            if (!useHasOwn || o.hasOwnProperty(i)) {
                // To match JSON.stringify, we shouldn't encode functions or undefined
                if (typeof val === 'function' || val === undefined) {
                    continue;
                }
                a.push(UIR.JSON.encodeValue(i), ":", UIR.JSON.encodeValue(val), ',');
                
            }
        }
        // Overwrite trailing comma (or empty string)
        a[a.length - 1] = '}';
        return a.join("");
    };
    
    /**
     * Encodes a String. This returns the actual string which is inserted into the JSON string as the literal
     * expression. **The returned value includes enclosing double quotation marks.**
     *
     * To override this:
     *
     *     Ext.JSON.encodeString = function(s) {
     *         return 'Foo' + s;
     *     };
     *
     * @param {String} s The String to encode
     * @return {String} The string literal to use in a JSON string.
     * @method
     */
    me.encodeString = encodeString;

    /**
     * The function which {@link #encode} uses to encode all javascript values to their JSON representations
     * when {@link Ext#USE_NATIVE_JSON} is `false`.
     * 
     * This is made public so that it can be replaced with a custom implementation.
     *
     * @param {Object} o Any javascript value to be converted to its JSON representation
     * @return {String} The JSON representation of the passed value.
     * @method
     */
    me.encodeValue = doEncode;

    /**
     * Encodes a Date. This returns the actual string which is inserted into the JSON string as the literal
     * expression. **The returned value includes enclosing double quotation marks.**
     *
     * The default return format is `"yyyy-mm-ddThh:mm:ss"`.
     *
     * To override this:
     *
     *     Ext.JSON.encodeDate = function(d) {
     *         return Ext.Date.format(d, '"Y-m-d"');
     *     };
     *
     * @param {Date} d The Date to encode
     * @return {String} The string literal to use in a JSON string.
     */
    me.encodeDate = function(o) {
        return '"' + o.getFullYear() + "-"
        + pad(o.getMonth() + 1) + "-"
        + pad(o.getDate()) + "T"
        + pad(o.getHours()) + ":"
        + pad(o.getMinutes()) + ":"
        + pad(o.getSeconds()) + '"';
    };

    /**
     * Encodes an Object, Array or other value.
     * 
     * If the environment's native JSON encoding is not being used ({@link Ext#USE_NATIVE_JSON} is not set,
     * or the environment does not support it), then ExtJS's encoding will be used. This allows the developer
     * to add a `toJSON` method to their classes which need serializing to return a valid JSON representation
     * of the object.
     * 
     * @param {Object} o The variable to encode
     * @return {String} The JSON string
     */
    me.encode = function(o) {
        if (!encodingFunction) {
            // setup encoding function on first access
            encodingFunction = isNative() ? JSON.stringify : me.encodeValue;
        }
        return encodingFunction(o);
    };

    /**
     * Decodes (parses) a JSON string to an object. If the JSON is invalid, this function throws
     * a SyntaxError unless the safe option is set.
     *
     * @param {String} json The JSON string
     * @param {Boolean} [safe=false] True to return null, false to throw an exception if the JSON is invalid.
     * @return {Object} The resulting object
     */
    me.decode = function(json, safe) {
        if (!decodingFunction) {
            // setup decoding function on first access
            decodingFunction = isNative() ? JSON.parse : doDecode;
        }
        try {
            return decodingFunction(json);
        } catch (e) {
            if (safe === true) {
                return null;
            }
            
        }
    };
})());
/**
 * Shorthand for {@link Ext.JSON#encode}
 * @member Ext
 * @method encode
 * @inheritdoc Ext.JSON#encode
 */
UIR.encode = UIR.JSON.encode;
/**
 * Shorthand for {@link Ext.JSON#decode}
 * @member Ext
 * @method decode
 * @inheritdoc Ext.JSON#decode
 */
UIR.decode = UIR.JSON.decode;

UIR.INFO=1;
UIR.QUESTON=2;
UIR.ERROR=3;
UIR.WAIT=4;
UIR.EXCEPTION=5;
UIR.DATA=6;
