<?php

/**
 * THIS CLASS IS NOT USED ANYMORE IN THIS VERSION
 * IS MARKED FOR REMOTION
 *
 * 
 */
namespace Raptor\Bundle;


class BundleAutoload {
   function __construct() {
        
        
    }
    
     static public function register()
    {
        spl_autoload_register(array(new self, 'autoload'));
    }

    static public function autoload($class)
    {
       
        if (false == strpos($class, 'Bundle')) {
            return;
        }
         
        if (false !== strpos($class, 'Doctrine')) {
            return;
        }
        
        if (false !== strpos($class, 'Raptor')) {
            return;
        }
        $bundle = \Raptor\Core\Location::get(\Raptor\Core\Location::SRC) . '/';
        
        if (file_exists($file = $bundle . str_replace('_', '/', str_replace('\\', '/', $class)) . '.php')) {
            require_once $file;
        }
    }
}

?>
