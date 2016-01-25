<?php

/**
 * Raptor - Integration PHP 5 framework
 *
 * @author      William Amed <watamayo90@gmail.com>, Otto Haus <ottohaus@gmail.com>
 * @copyright   2014 
 * @link        http://dinobyte.net
 * @version     2.0.1
 * @package     Raptor
 *
 * MIT LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
namespace Raptor\Component\systemBundle\Controller;
use Raptor\Util\ItemList;
/**
 * Description of UiPublisherController
 *
 * 
 */
class UiPublisherController extends \Raptor\Bundle\Controller\Controller{
    
    /**
     * @Route /resources/publisher
     *
     */
    public function indexAction() {
        return $this->render('@systemBundle/publisher/compiler.html.twig');
    }
    
    /**
     * @Route /resources/publisher/bundles
     */
    public function loadBundlesAction() {
        $bundles = new ItemList($this->app->getConfigurationLoader()->getBundlesSpecifications());
        $vendors = array();

        $bundles->each(function($key, $value) use (&$vendors) {
                    $namespace = $value['namespace'];
                    if ($namespace[0] == '\\')
                        $namespace = substr($namespace, 1);
                    $vendor = explode('\\', $namespace);
                    $vendor = $vendor[0];

                    if (!isset($vendors[$vendor])) {
                        $vendors[$vendor] = array();
                        $vendors[$vendor][$key] = $value;
                    } else {
                        $vendors[$vendor][$key] = $value;
                    }
                });

        $tree = array();
        unset($vendors['Raptor']);
        foreach ($vendors as $key => $value) {
            $item = array();
            $item['text'] = $key;
            $item['children'] = array();
            $item['expanded'] = true;
            $item['vendor'] = true;
            $item['iconCls'] = 'icon-vendor';
            foreach ($value as $key2 => $value2) {
                $children = array();
                $children['text']=$key2.'<b style="color: #402878">/Resources</b>';
                $children['bundle']=$key2;
                $children['iconCls'] = 'icon-bundle';
                $children['expandable'] = false;
                $children['vendor'] = false;
                $children['checked'] = false;
                $children['namespace'] = $value2['namespace'];
                $item['children'][] = $children;
            }
            $tree[] = $item;
        }

        return $this->JSON($tree);
    }
    
    /**
     * @Route /resources/publisher/publish
     */
    public function publishAction($request) {
        $bundleName = $request->post('bundles');
        $bundleName = json_decode($bundleName);
        $bundles = $this->app->getConfigurationLoader()->getBundlesSpecifications();
        $web = \Raptor\Core\Location::get(\Raptor\Core\Location::WEBBUNDLES);
        $console=array();
        foreach ($bundleName as $value) {
            if (isset($bundles[$value])) {
                $class = $bundles[$value]['name'];
                
                $location = $bundles[$value]['location'];
                \Raptor\Bundle\Publisher\Publisher::run($bundles[$value]['name'],true);
                if (file_exists($location . DIRECTORY_SEPARATOR . 'Compiler' . DIRECTORY_SEPARATOR . 'Compiler.php')) {
                    $compiler = $bundles[$value]['namespace'] . '\\Compiler\\Compiler';
                    $comp = new $compiler();
                    $fileBundle = str_replace('Bundle', '',$bundles[$value]['namespace']);
                    $fileBundle = str_replace('\\', '/',$fileBundle);
                    
                    $comp->setBundle($class);
                    $comp->setBundleName($fileBundle);
                    $comp->setForce(true);
                    $comp->create();
                }
                $console[]="The resources of $value are published";
            }
        }
        //\Raptor\Bundle\Publisher\Extjs::preCompileApp(\Raptor\Core\Location::get(\Raptor\Core\Location::WEBBUNDLES));
        
        return $this->show('The resources was published',true, \Raptor\Bundle\Controller\Controller::INFO,array('actions'=>$console));
    }
    
    /**
     * @Route /resources/publisher/clear
     */
    public function clearAction($request) {
        
        $bundleName = $request->post('bundles');
        $bundleName = json_decode($bundleName);
        $bundles = $this->app->getConfigurationLoader()->getBundlesSpecifications();
        $web = \Raptor\Core\Location::get(\Raptor\Core\Location::WEBBUNDLES);
        $console=array();
        foreach ($bundleName as $value) {
            if (isset($bundles[$value])) {
                $fileBundle = str_replace('Bundle', '',$bundles[$value]['namespace']);
                $fileBundle = str_replace('\\', '/',$fileBundle);
                \Raptor\Util\Files::delete($web .'/' .$fileBundle );
                $console[]="The resources $value are deleted";
                if(count(glob($web .'/' .$fileBundle . '/../*'))==0)
                    rmdir ($web .'/' .$fileBundle . '/..');
            }
        }

        
        return $this->show('The resources was deleted',true, \Raptor\Bundle\Controller\Controller::INFO,array('actions'=>$console));
    }
}

?>
