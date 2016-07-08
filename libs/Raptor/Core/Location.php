<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Location
 * All Right Reserved
 * @author DinoByte
 */
namespace Raptor\Core;
/**
 * 
 * Esta clase retorna todas las rutas absolutas en el servidor de las principales
 * partes del sistema, app, src, cache, web, web_bundles, libs
 * 
 */
class Location {
   static private $instance = null;
   protected $locations;
   const APP='app';
   const SRC='src';
   const CACHE='cache';
   const WEB='web';
   const LIBS='libs';
   const WEBBUNDLES='web_bundles';
   
   private function __construct() {
       $this->locations=array(
           'app'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'app',
           'src'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'src',
           'cache'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'app'.DIRECTORY_SEPARATOR.'cache',
           'web'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'web',
           'libs'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'libs',
           'web_bundles'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'web'.DIRECTORY_SEPARATOR.'bundles'
       );
   }
    /**
     * retorna todas las rutas absolutas en el servidor de las principales partes del sistema.
     *  
     * app, src, cache, web, web_bundles, libs
     * 
     * @param string $location
     * @return url
     */
    public static function get($location) {
	if (self::$instance == null) {
            self::$instance = new Location();
        }
        return self::$instance->_get($location);
    }
    
    private function _get($field) {
       
        if(isset($this->locations[$field])){
            $real=realpath($this->locations[$field]);
            return ($real===false)?$this->locations[$field]:$real;
        }else
            return false;
    }
}

?>
