<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of autoload
 * autoLoad Class From Packed Raptor
 * @author DinoByte
 */
class BarcodeAutoload {
    //put your code here
    function __construct() {
        
        
    }
    
     static public function register()
    {
        spl_autoload_register(array(new self, 'autoload'));
    }

    static public function autoload($class)
    {
     
        
        if (false !== strpos($class, 'BCG')) {
                    
             if (file_exists($file = dirname(__FILE__).'/class/'.str_replace('_', '/', str_replace('\\', '/', $class)).'.php')) {
                  
                 require_once $file;
             }
        }

        
       
    }

}
\BarcodeAutoload::register();
?>
