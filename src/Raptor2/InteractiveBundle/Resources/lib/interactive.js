
Interactive.Core={
    show:function(text){
        var cont=$('<div></div>');
        cont.css({
            background:'black',
            position:'absolute',
            padding:'10px',
            top:'20px',
            left:'30px'
        });
        cont.width(500);
        cont.html(text);
        $('body').append(cont);
    }
}


