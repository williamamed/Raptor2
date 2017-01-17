Interactive.Core=function(){
    
}
Interactive.Util={
    ocuped:false,
    checkCondition:function(cond,cookie){
        var sidesOr=cond.split(' or ');
        
        
        for (var i=0,cant=sidesOr.length;i<cant;i++){
            var sidesAnd=sidesOr[i].split(' and ');
            var res=true;
            
            for (var j=0,cant2=sidesAnd.length;j<cant2;j++){
                var item=sidesAnd[j].trim();
                if(item.charAt(0)==='!'){
                    if(cookie.tutoriales[item]==undefined)
                        res=true;
                    else
                        res=false;
                }else{
                    if(cookie.tutoriales[item]==undefined)
                        res=false;
                    else
                        res=true;
                }
            }
            if(res)
                return true;
        }
        return false;
//        cookie.tutoriales[name]!=undefined
    }
}
Interactive.Core.prototype={
    constructor:Interactive.Core,
    stack:new Array(),
    destroyed:false,
    call:function(text){
        
        if(this.active==false)
            return;
        this.global=$('<div></div>');
        this.auth=$('<div></div>');
        this.close=$('<div></div>');
        this.cont=$('<div></div>');
        this.global.append(this.auth);
        this.global.append(this.cont);
        this.global.append(this.close);
        this.global.css({
            position:'fixed',
            'zIndex':'10000000'
        });
        this.cont.css({
            background:'black',
            padding:'10px',
            float:'left',
            color:'white',
            marginLeft:'5px'
        });
        this.close.css({
            background:'darkred',
            padding:'3px',
            width:'25px',
            height:'25px',
            marginTop:'-10px',
            
            position:'relative',
            textAlign:'center',
            float:'left',
            color:'white',
            marginLeft:'-10px'
        });
        this.close.html('<b>X</b>');
        this.close.css('cursor','pointer');
        
        this.auth.append('<img src="" width="70">')
        this.auth.css({
            float:'left'
        });
        this.global.hide();
        $('body').append(this.global);
        
        
        this.loadMsg(text);
    },
    loadMsg:function(name){
        var me=this;
        $.getJSON(this.url, { name: name },function(data){
            if(me.destroyed===false){
                if(data.waitSeconds)
                    me.clearWait=setTimeout(function(){
                        var val=$.cookie('Interact2_'+Raptor.getUser());
                        var obj=$.parseJSON(val);
                        obj.tutoriales[name]=0;
                        $.cookie('Interact2_'+Raptor.getUser(),null,{path:'/'});
                        
                        $.cookie('Interact2_'+Raptor.getUser(),InteractiveCookie.encode(obj),{expires: 30,path:'/'});
                        me.show(data);
                    },data.waitSeconds*1000);
                else{
                    var val=$.cookie('Interact2_'+Raptor.getUser());
                    var obj=$.parseJSON(val);
                    
                    obj.tutoriales[name]=0;
                    $.cookie('Interact2_'+Raptor.getUser(),null,{path:'/'});
                    
                    $.cookie('Interact2_'+Raptor.getUser(),InteractiveCookie.encode(obj),{expires: 30,path:'/'});
                    me.show(data);
                }
            }
        });
    },
    show:function(data){
        this.textData=$(data.text);
        if(!data.found && data.found===false)
            return;
        
        this.cont.append(this.textData);
        if(data.author.name)
            this.cont.append('<b style="font-size:12px">'+data.author.name+'</b><br>');
        if(data.author.reference)
            this.cont.append('<b style="font-size:10px">'+data.author.reference+'</b><br>');
        this.cont.append('<img class="rapt-interactive" style="float:right" src="" width="60">');
        this.cont.find('.rapt-interactive').attr('src',Raptor.getBundleResource('Raptor/img/logo-int.png'));
        if(data.pointer){
            this.pointer=this.getPointer(data.pointer);
            $('body').append(this.pointer);
        }
        this.cont.append(this.footer());
        this.counterAttr=this.counter();
        this.cont.append(this.control());
        this.cont.append(this.counterAttr);
        
        this.cont.css(data.style);
        this.auth.find('img').attr('src',Raptor.getBundleResource(data.author.img));
        this.global.css(data.position);
        this.global.fadeIn();
        var global=this.global;
        var pointer=this.pointer;
        this.data=data;
        var me=this;
        this.close.click(function(){
            clearTimeout(me.clear);
            clearInterval(me.clearCounter);
            
            me.global.fadeOut('slow',function(){
                me.global.remove();
                if(data.next){
                    
                    Interactive.show(data.next);
                }
                if(me.pointer)
                    me.pointer.remove();
            });
        });
         this.textData.hover( 
            function () { 
                me.global.animate( { opacity:0.3 }, { queue:false, duration:500 } ) 
            },  
            function () { 
                me.global.animate( { opacity:1 }, { queue:false, duration:500 } ) 
            } 
          );
        this.count=data.seconds;
        this.play();
    },
    setRoot:function(url){
        this.url=url;
    },
    destroy:function(){
       var global=this.global;
       var me=this;
       me.destroyed=true;
       clearTimeout(me.clear);
       clearInterval(me.clearCounter);
       clearTimeout(me.clearWait);
       if(this.pointer)
               this.pointer.remove();
       this.global.hide(function(){
                global.remove();
//                if(me.data.next)
//                    me.call(me.data.next)
       });
    },
    footer:function(){
        var foot=$('<b>No quiero más ayuda</b>');
        foot.css('marginTop','5px');
        foot.css('float','right');
        foot.css('cursor','pointer');
        
        var me=this;
        foot.click(function(){
            clearTimeout(me.clear);
            clearInterval(me.clearCounter);
            me.active=false;
            $.cookie('Interact2_'+Raptor.getUser(),null,{path:'/'});
            $.cookie('Interact2_'+Raptor.getUser(),'{"reject":true,"tutoriales":{"interactive":"This is interactive"}}',{expires: 30,path:'/'});
            if(me.pointer)
                me.pointer.remove();
            me.global.fadeOut('slow',function(){
                me.global.remove();
            });
        });
        return foot;
    },
    counter:function(){
        var foot=$('<b></b>');
        foot.css('marginTop','5px');
        foot.css('float','left');
        foot.css('cursor','pointer');
        
        return foot;
    },
    control:function(){
        var foot=$('<b></b>');
        foot.append('<img src="" width="20">');
        foot.find('img').attr('src',Raptor.getBundleResource('Raptor/img/interactive/player_pause.png'));
        foot.css('marginTop','5px');
        foot.css('marginRight','5px');
        foot.css('float','left');
        foot.css('cursor','pointer');
        this.state=true;
        var me=this;
        foot.click(function(){
            if(me.state){
               me.pause();
               me.state=false;
               foot.find('img').attr('src',Raptor.getBundleResource("Raptor/img/interactive/player_play.png"));
            }else{
               me.play();
               me.state=true;
               foot.find('img').attr('src',Raptor.getBundleResource('Raptor/img/interactive/player_pause.png'));
            }
        })
        return foot;
    },
    getPointer:function(selector){
         var pointer=$('<img alt="aqui">');
         pointer.attr('src',Raptor.getBundleResource('Raptor/img/pointer.gif'));
         var ref=$(selector.selector);
         if(ref.size()==0)
             return pointer;
         
         ref=$($(selector.selector).get(0));
         
         var x=0;
         var y=0;
         var transform='rotate(0deg)';
         if(selector.arrow=='left'){
             y=(ref.height()/2+34/2)*-1;
             x=ref.width()/2;
             transform='rotate(270deg)';
         }
         if(selector.arrow=='right'){
             y=(ref.height()/2+34/2)*-1;
             x=(ref.width()/2+25)*-1;
             transform='rotate(90deg)';
         }
         if(selector.arrow=='down'){
             y=(ref.height()+50)*-1;
             transform='rotate(180deg)';
         }
         var position='absolute';
         
         pointer.css({
             position:'absolute',
             zIndex:'1000000',
             transform: transform,
             top:ref.offset().top+ref.height()+y,
             left:ref.offset().left+(ref.width()/2)+x
         });
         return pointer;
    },
    play:function(){
        var data=this.data;
        var me=this;
        this.clear=setTimeout(function(){
            clearTimeout(me.clear);
            clearInterval(me.clearCounter);
            
            me.global.fadeOut('slow',function(){
                me.global.remove();
                if(data.next){
                    
                    Interactive.show(data.next);
                }
                if(me.pointer)
                    me.pointer.remove();
            });
        },this.count*1000);
        this.counterAttr.html("("+this.count+" Seg)");
        
        this.clearCounter=setInterval(function(){
            me.count--;
            me.counterAttr.html("("+me.count+" Seg)");
        },1000)
    },
    pause:function(){
        clearTimeout(this.clear);
        clearInterval(this.clearCounter);
    }
}

jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

InteractiveCookie = {};
InteractiveCookie.JSON = (new (function() {
    var me = this,
            encodingFunction,
            decodingFunction,
            useNative = null,
            useHasOwn = !!{}.hasOwnProperty,
            isNative = function() {
        if (useNative === null) {
            useNative = InteractiveCookie.USE_NATIVE_JSON && window.JSON && JSON.toString() == '[object JSON]';
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
        } else if (InteractiveCookie.isDate(o)) {
            return InteractiveCookie.JSON.encodeDate(o);
        } else if (InteractiveCookie.isString(o)) {
            return InteractiveCookie.JSON.encodeString(o);
        } else if (typeof o == "number") {
            //don't use isNumber here, since finite checks happen inside isNumber
            return isFinite(o) ? String(o) : "null";
        } else if (InteractiveCookie.isBoolean(o)) {
            return String(o);
        }
        // Allow custom zerialization by adding a toJSON method to any object type.
        // Date/String have a toJSON in some environments, so check these first.
        else if (o.toJSON) {
            return o.toJSON();
        } else if (InteractiveCookie.isArray(o)) {
            return encodeArray(o, newline);
        } else if (InteractiveCookie.isObject(o)) {
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
            a.push(InteractiveCookie.JSON.encodeValue(o[i], cnewline), sep);
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
                a.push(InteractiveCookie.JSON.encodeValue(i) + ': ' + InteractiveCookie.JSON.encodeValue(val, cnewline), sep);
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
            a.push(InteractiveCookie.JSON.encodeValue(o[i]), ',');
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
                a.push(InteractiveCookie.JSON.encodeValue(i), ":", InteractiveCookie.JSON.encodeValue(val), ',');

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
InteractiveCookie.encode = InteractiveCookie.JSON.encode;
/**
 * Shorthand for {@link Ext.JSON#decode}
 * @member Ext
 * @method decode
 * @inheritdoc Ext.JSON#decode
 */
InteractiveCookie.decode = InteractiveCookie.JSON.decode;

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
InteractiveCookie.isDate = function(value) {
    return toString.call(value) === '[object Date]';
}
InteractiveCookie.isString = function(value) {
    return typeof value === 'string';
}
InteractiveCookie.isBoolean = function(value) {
    return typeof value === 'boolean';
}
InteractiveCookie.isArray = function(value) {
    return toString.call(value) === '[object Array]';
}
InteractiveCookie.isObject = (toString.call(null) === '[object Object]') ?
        function(value) {
            // check ownerDocument here as well to exclude DOM nodes
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } :
        function(value) {
            return toString.call(value) === '[object Object]';
        }
