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
 * This class return the absolute path to the main locations of the app
 * app
 * src
 * cache
 * web
 * web_bundles
 */
class Location {
   static private $instance = null;
   protected $locations;
   const APP='app';
   const SRC='src';
   const CACHE='cache';
   const WEB='web';
   const WEBBUNDLES='web_bundles';
   
   private function __construct() {
       $this->locations=array(
           'app'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'app',
           'src'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'src',
           'cache'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'app'.DIRECTORY_SEPARATOR.'cache',
           'web'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'web',
           'web_bundles'=>__DIR__.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'web'.DIRECTORY_SEPARATOR.'bundles'
       );
   }
    /**
     * app
     * src
     * cache
     * web
     * web_bundles
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
