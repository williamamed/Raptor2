
UIR.load={
    show:function(text){
        var t=text?text:'Loading...';
        if(this.active==true)
            return;
        if(this.opened==true){
            this.mask.find('.uir-load-text').html(t)
            this.mask.show();
            return;
        }
        
        this.body=$('body');
        var mask=$('<div>');
        mask.css('background','rgba(255,255,255,0.7)');
        mask.css('display','none');
        mask.addClass('uir-load');
        if($('.uir-load').size()>0)
            mask=$($('.uir-load').get(0));
        this.mask=mask;
        
        
        var indicator=$('<div>');
        indicator.addClass('indicator');
        mask.append(indicator);
        mask.append('<h3 class="uir-load-text" style="text-align:center;color:black;position:absolute;top:50%;margin-top: 20px;width:100%">'+t+'</h3>');
        this.body.append(mask);
        this.active=true;
        this.opened=true;
        this.mask.show();
    },
    hide:function(){
        if(this.mask)
            this.mask.fadeOut();
        this.active=false;
    }
}
