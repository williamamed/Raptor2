<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of FileLocation
 *
 * @author DinoByte
 */
namespace Raptor\Util;
use \ReflectionClass;

class ClassLocation {
   
    
    public static function getLocation($class) {
        $reflect = new ReflectionClass($class);
        return dirname($reflect->getFileName());
    }
    
}

?>
