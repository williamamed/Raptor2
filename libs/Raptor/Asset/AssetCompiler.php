<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of AssetCompiler
 *
 * @author amed
 */

namespace Raptor\Asset;

use Assetic\Asset\AssetCollection;
use Assetic\Asset\FileAsset;
use Assetic\Asset\GlobAsset;
use Assetic\Filter\CssMinFilter;
use Raptor\Asset\Resources;
class AssetCompiler {

    private $resources = null;
    private $name;
    private $bundle;
    private $bundleName;
    private $force;

    function __construct($name, $bundle, $bundleName,$force=false) {
        $this->resources = new \Raptor\Util\ItemList ();
        $this->name = $name;
        $this->bundle = $bundle;
        $this->bundleName = '/'.$bundleName;
        $this->force=$force;
    }
    /**
     * This directive add a file to be minified
     * @param string $resources The relative route resource ie. ('js/my.js')
     * @param type $location This determine if lookup of the specified resource must be in the bundle resources(true default) or in the webbundles dir (false)
     * @return \Raptor\Asset\AssetCompiler
     */
    public function add($resources, $location = true) {
        
        $std = new \stdClass();
        if ($location) {
            $res = $this->bundle . DIRECTORY_SEPARATOR . $resources;
        } else {
            $bundles = \Raptor\Core\Location::get(\Raptor\Core\Location::WEBBUNDLES);

            $res = $bundles . DIRECTORY_SEPARATOR . $resources;
        }

        $std->{'asset'} = $res;
        $std->{'flag'} = true;
        $this->resources->add($std);
        return $this;
    }

    public function addGroup($resources, $location = true) {
        $std = new \stdClass();
        if ($location) {
            $res = $this->bundle . DIRECTORY_SEPARATOR . $resources;
        } else {
            $bundles = \Raptor\Core\Location::get(\Raptor\Core\Location::WEBBUNDLES);

            $res = $bundles . DIRECTORY_SEPARATOR . $resources;
        }

        $std->{'asset'} = $res;
        $std->{'flag'} = false;
        $this->resources->add($std);
        return $this;
    }

    public function compile($compile= Resources::NONE) {
        require_once __DIR__.'/cssmin-v3.0.1.php';
        require_once __DIR__.'/jsmin.php';
        $asset = new AssetCollection();
        $this->resources->each(function($key, $value) use (&$asset) {
                    if ($value->flag)
                        $asset->add(new FileAsset($value->asset));
                    else
                        $asset->add(new GlobAsset($value->asset));
                });
        if($compile==Resources::JS){
            $asset->ensureFilter(new \Assetic\Filter\JSMinFilter());
        }
        if($compile==Resources::CSS)
            $asset->ensureFilter(new \Assetic\Filter\CssMinFilter());    
// the code is merged when the asset is dumped
        $bundles = \Raptor\Core\Location::get('web_bundles');

        if (!file_exists($bundles . $this->bundleName))
            mkdir($bundles . $this->bundleName, 0777, true);
        
        if ($this->name[0] == '/' or $this->name[0] == DIRECTORY_SEPARATOR)
            unset($this->name[0]);
        $dir = dirname($bundles . $this->bundleName . '/' . $this->name);
        if (!file_exists($dir))
            mkdir($dir, 0777, true);

        if ($this->force == true)
            file_put_contents($bundles . $this->bundleName . '/' . $this->name, $asset->dump());
        else {
            if (!file_exists($bundles . $this->bundleName . '/' . $this->name))
                file_put_contents($bundles . $this->bundleName . '/' . $this->name, $asset->dump());
        }

    }

}

?>
