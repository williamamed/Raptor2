(function($){

$.fn.centrar = function(){

var elemento = $(this);



cambiarCss();

$(window).bind("resize", function(){
    cambiarCss();
});



function cambiarCss(){
    var altoImagen = $(elemento).height();
    var anchoImagen = $(elemento).width();
    var anchoVentana = $(window).width();
    var altoVentana = $(window).height();
	
	$(elemento).css({
        "position" : "absolute",
        "left" : anchoVentana / 2 - anchoImagen/ 2,
        "top" : altoVentana /2 - altoImagen / 2
    });
};



};

})(jQuery);