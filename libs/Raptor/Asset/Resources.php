<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Resources
 *
 * @author amed
 */
namespace Raptor\Asset;
use Raptor\Util\ClassLocation;

/**
 * La clase Resources se encarga del nombramiento y locacion del archivo a
 * crear con la minificacion.
 */
abstract class Resources {
    private $bundleRoute;
    private $bundleName;
    private $force=false;
    const CSS=1;
    const JS=2;
    const NONE=0;
    
    /**
     * Establece el nombre y ruta del archivo a crear, la ruta sera relativa al Resource del bundle especificado.
     * 
     * Normalmente la clase Compiler de los bundles ya establecen el bundle en que se encuentran, solo
     * tendras que llamar a esta funcion
     * 
     * @param string $filename Ruta relativa al bundle donde se creara el archivo
     * @return \Raptor\Asset\AssetCompiler
     */
    public function setAsset($filename) {
        return new AssetCompiler($filename,  $this->bundleRoute,$this->bundleName, $this->force);
    }
    /**
     * Establece el bundle donde se creara el archivo especificado en setAsset
     * 
     * [USADO POR RAPTOR]
     * @param string $bundle
     */
    public function setBundle($bundle) {
        $location=  ClassLocation::getLocation($bundle);
        $this->bundleRoute=$location.DIRECTORY_SEPARATOR.'Resources';
    }
    /**
     * Establece el nombre del bundle donde se crera el archivo minificado
     * 
     * [USADO POR RAPTOR]
     * @param string $bundle
     */
    public function setBundleName($bundle) {
        
        $this->bundleName=$bundle;
    }
    /**
     * Fuerza a reescribir el archivo minificado si ya existe
     * 
     * @param boolean $force
     */
    public function setForce($force) {
        $this->force=$force;
    }
    /**
     * Crea las directivas de minificacion para un componente
     * [ESTA FUNCION ES REESCRITA POR LOS COMPILER]
     */
    abstract public function create();
     
}

?>
