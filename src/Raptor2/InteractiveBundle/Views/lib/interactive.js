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
                        me.show(data);
                    },data.waitSeconds*1000);
                else
                    me.show(data);
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
            $.cookie('Interactive_'+Raptor.getUser(),null,{path:'/'});
            $.cookie('Interactive_'+Raptor.getUser(),'{"reject":true,"tutoriales":{"interactive":"This is interactive"}}',{expires: 30,path:'/'});
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
                if(data.next)
                    Interactive.show(data.next);
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
