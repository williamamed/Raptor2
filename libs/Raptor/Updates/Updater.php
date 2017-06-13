<?php

/*
 * Este archivo realiza el proceso de actualizacion de componentes
 * y clases que no pertenecen al paquete de clases de Raptor
 * Utilizados para realizar mantenimeinto y actualizacion a Slim, los
 * Bundles utilitarios y recursos.
 */

$lib=  \Raptor\Core\Location::get(\Raptor\Core\Location::APP).'/../libs';

/**
 * Updates files
 * array(
 *      array('file_to_copy','file_to_override')
 * )
 */
$files=array(
    
);

foreach ($files as $value) {
    if (file_exists($lib . $value[1]) and file_exists(__DIR__ . $value[0])) {
        Raptor\Util\Files::delete($lib . $value[1]);
        Raptor\Util\Files::copy(__DIR__ . $value[0], dirname($lib . $value[1]));
        Raptor\Util\Files::delete(__DIR__ . $value[0]);
    }
}
/**
 * Copy new ones
 * array(
 *      array('file_to_copy','directory_to_copy')
 * )
 */
$files_new=array();

foreach ($files_new as $value) {
    if (file_exists(__DIR__ . $value[0])) {
        @mkdir($lib . $value[1],0777,true);
        Raptor\Util\Files::copy(__DIR__ . $value[0], $lib . $value[1]);
        Raptor\Util\Files::delete(__DIR__ . $value[0]);
    }
}

?>
