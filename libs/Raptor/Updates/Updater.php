<?php

/*
 * Este archivo realiza el proceso de actualizacion de componentes
 * y clases que no pertenecen al paquete de clases de Raptor
 * Utilizados para realizar mantenimeinto y actualizacion a Slim, los
 * Bundles utilitarios y recursos.
 */
$app=  Raptor\Raptor::getInstance();
$lib=  \Raptor\Core\Location::get(\Raptor\Core\Location::APP).'/../libs';
if(file_exists($lib.'/Slim/Slim.php') and file_exists(__DIR__.'/Slim.php')){
    Raptor\Util\Files::delete($lib.'/Slim/Slim.php');
    Raptor\Util\Files::copy(__DIR__.'/Slim.php', $lib.'/Slim');
    Raptor\Util\Files::delete(__DIR__.'/Slim.php');
}
if(file_exists($lib.'/../src/Raptor2/InstallerBundle/Importer/BundleImporter.php') and file_exists(__DIR__.'/BundleImporter.php')){
    Raptor\Util\Files::delete($lib.'/../src/Raptor2/InstallerBundle/Importer/BundleImporter.php');
    Raptor\Util\Files::copy(__DIR__.'/BundleImporter.php', $lib.'/../src/Raptor2/InstallerBundle/Importer');
    Raptor\Util\Files::delete(__DIR__.'/BundleImporter.php');
}
?>
