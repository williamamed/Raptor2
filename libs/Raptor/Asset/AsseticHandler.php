<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of AsseticHandler
 * All Right Reserved
 * @author DinoByte
 */

namespace Raptor\Asset;

use Raptor\Raptor;
use Raptor\Core\Location;
use Assetic\Asset\AssetCollection;
use Assetic\Asset\FileAsset;
use Assetic\Asset\GlobAsset;
use Raptor\Http\Response;

class AsseticHandler {

    static public function isAsset() {
        if (isset($_SERVER["PATH_INFO"]))
            $info = $_SERVER["PATH_INFO"];
        else
            $info = "";
        $expresion = "/(";
        $config = \Raptor\Core\ConfigurationLoader::get('resources');
        $types = array();
        if (is_array($config)) {
            foreach ($config as $value) {
                $types[] = "($value)";
            }
            $exp_types = join("|", $types);
            $expresion.=$exp_types . ")+$/";
//        $expresion = "/((.css)|(.js)|(.jpeg)|(.jpeg))+$/";
            if (preg_match($expresion, $info) === 1) {
                return true;
            }
            else
                return false;
        }
        else
            return false;
    }

    static public function serverAsset($dev) {
        $headers = Raptor::getRequest()->header;
        $route = $headers->get('PATH_INFO');
        $web_location = Location::get('web_bundles');
        $file = $web_location . $route;

        $js = new AssetCollection(array(
            new GlobAsset($file)
        ));
        
// the code is merged when the asset is dumped
        $response = new Response($js->dump());
        if(preg_match("/(\.css)$/", $route))
        $response->addHeader('Content-Type', 'text/css');
        else
           $response->addHeader('Content-Type', 'application/javascript'); 
        if ($dev == FALSE)
            $response->setCache(true, 3, true);
        $response->sendResponse();
        exit;
    }

}

?>
