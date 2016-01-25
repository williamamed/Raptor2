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
abstract class Resources {
    private $bundleRoute;
    private $bundleName;
    private $force=false;
    const CSS=1;
    const JS=2;
    const NONE=0;

    public function setAsset($filename) {
        return new AssetCompiler($filename,  $this->bundleRoute,$this->bundleName, $this->force);
    }
    
    public function setBundle($bundle) {
        $location=  ClassLocation::getLocation($bundle);
        $this->bundleRoute=$location.DIRECTORY_SEPARATOR.'Resources';
    }
    
    public function setBundleName($bundle) {
        
        $this->bundleName=$bundle;
    }
    
    public function setForce($force) {
        $this->force=$force;
    }
    
    abstract public function create();
     
}

?>
