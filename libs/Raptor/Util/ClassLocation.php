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
/**
 * Esta clase devuelve la direccion absoluta en el servidor
 * de la clase especificada
 */
class ClassLocation {
   
    /**
     * Devuelve la direccion absoluta en el servidor de la clase especificada
     * 
     * $loc=\Raptor\Util\ClassLocation::getLocation('\Raptor\Raptor');
     * 
     * devolvera lo siguiente:
     * /var/www/html/Raptor2/libs/Raptor/
     * 
     * @param string $class clase que se desea su direccion
     * @return sring
     */
    public static function getLocation($class) {
        $reflect = new ReflectionClass($class);
        return dirname($reflect->getFileName());
    }
    
}

?>
