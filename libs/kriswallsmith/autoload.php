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
class autoloadAsset {
    //put your code here
    function __construct() {
        
        
    }
    
     static public function register()
    {
        spl_autoload_register(array(new self, 'autoload'));
    }

    static public function autoload($class)
    {
        if (0 !== strpos($class, 'Assetic')) {
            return;
        }
        
        
//        print_r($class);
//        echo '<br>';
        
        
        if (file_exists($file = dirname(__FILE__).'/assetic/src/'.str_replace('_', '/', $class).'.php')) {
            require_once $file;
        }
    }

}

?>
