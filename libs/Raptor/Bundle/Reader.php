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
namespace Raptor\Bundle;

/**
 * This class read the routes
 * definition from bundles
 * INTERNAL
 * 
 */
class Reader {
    private $bundles;
    private $definitions;
    private $location;
    private $specif;
    private $description;
    private $api;
    
    function __construct() {
        $this->bundles = array();
        $this->definitions = array();
        $this->location = array();
        $this->description=array();
        $this->api=array();
    }
    
    public function setBundles($bundles) {
        $this->bundles = $bundles;
    }
    public function getDefinitions() {
        return $this->definitions;
    }

    public function getLocation() {
        return $this->location;
    }

    public function getSpecifications() {
        return $this->specif;
    }
    
    public function getDescriptions() {
        return $this->description;
    }
    
    public function getApi() {
        return $this->api;
    }

    public function load() {
        foreach ($this->bundles as $bundle) {
            
            $class = new \Wingu\OctopusCore\Reflection\ReflectionClass($bundle);
            
            $prefix = '';
            $this->location[$class->getShortName()] = \Raptor\Util\ClassLocation::getLocation($bundle);
            $this->specif[$class->getShortName()] = array('location' => \Raptor\Util\ClassLocation::getLocation($bundle), 'namespace' => $class->getNamespaceName(), 'name' => $class->getName());
            if (!$class->getReflectionDocComment()->isEmpty() and $class->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('Route')) {
                $doc = $class->getReflectionDocComment();
                $obj = $doc->getAnnotationsCollection()->getAnnotation('Route');
                $prefix = $obj[0]->getDescription();
            }
            
            $controllerDir = \Raptor\Util\ClassLocation::getLocation($bundle) . '/Controller';
            $listfiles=  \Raptor\Util\Files::find($controllerDir, "*Controller.php");
            
            foreach ($listfiles as $nombre_fichero) {
                $prefixController = $prefix;
                $namespaceSrc = explode('src', $nombre_fichero);
                $real = array();
                if (count($namespaceSrc) > 1)
                    $real = $namespaceSrc[1];
                else {
                    $namespaceSrc = explode('libs', $nombre_fichero);
                    $real = $namespaceSrc[1];
                }
                $namespaceClass = str_replace('.php', '', $real);
                $namespace = str_replace('/', '\\', $namespaceClass);
                
                $controller = new \Wingu\OctopusCore\Reflection\ReflectionClass($namespace);
                if (!$controller->getReflectionDocComment()->isEmpty() and $controller->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('Route')) {
                    $doc = $controller->getReflectionDocComment();
                    $obj = $doc->getAnnotationsCollection()->getAnnotation('Route');
                    $prefixController = $prefixController . $obj[0]->getDescription();
                }

                foreach ($controller->getMethods() as $method) {
                    /**
                     * Searching the API in any method of controller classes
                     */
                    $api = new \stdClass();
                    $api->hasApi = false;
                    $api->version = '0.0.0';
                    $api->text = '';
                    $doc = $method->getReflectionDocComment();
                    if ($method->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('api')) {
                        $api->text = $method->getReflectionDocComment()->getFullDescription();
                        $collectionDescrip = $doc->getAnnotationsCollection()->getAnnotation('api');
                        $api->category = $collectionDescrip[0]->getDescription();
                        $api->class = $method->getDeclaringClass()->getName();
                        $api->bundle = $class->getName();
                        $api->method = $method->getName();
                        $api->hasApi = true;
                        if($method->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('Route')){
                            $doc = $method->getReflectionDocComment();
                            $collectionRouteObj = $doc->getAnnotationsCollection()->getAnnotation('Route');
                            $collectionRoute = $collectionRouteObj[0];
                            $api->route=$prefixController . $collectionRoute->getDescription();
                        }else{
                            $api->route=false;
                        }
                        
                        if($method->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('version')){
                            $doc = $method->getReflectionDocComment();
                            $collectionRouteObj = $doc->getAnnotationsCollection()->getAnnotation('version');
                            $collectionRoute = $collectionRouteObj[0];
                            $api->version=$collectionRoute->getDescription();
                        }
                    }
                    if ($api->hasApi) {
                        if (!isset($this->api[$api->category]))
                            $this->api[$api->category] = array();
                        $this->api[$api->category][] = $api;
                    }
                        
                    if (!$method->getReflectionDocComment()->isEmpty() and $method->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('Route')) {
                        
                        if ($method->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('RouteName')) {
                            $collectionNameObj = $doc->getAnnotationsCollection()->getAnnotation('RouteName');
                            $collectionName = $collectionNameObj[0]->getDescription();
                        } else {
                            $routeArray = $doc->getAnnotationsCollection()->getAnnotation('Route');
                            $Route = $routeArray[0];
                            $collectionName = str_replace('/', '_', $prefixController . $Route->getDescription());
                        }

                        
                        $collectionRouteObj = $doc->getAnnotationsCollection()->getAnnotation('Route');
                        
                        $collectionRoute = $collectionRouteObj[0];
                        $descrip="";
                        
                        if ($method->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('Description')) {
                            $collectionDescrip = $doc->getAnnotationsCollection()->getAnnotation('Description');
                            $descrip = $collectionDescrip[0]->getDescription();
                        }
                        $methodName='ANY';
                        if ($method->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('Method')) {
                            $collectionMethod = $doc->getAnnotationsCollection()->getAnnotation('Method');
                            $methodName = $collectionMethod[0]->getDescription();
                        }
                        
                        $this->definitions[$collectionName]=$api;
                        $this->definitions[$collectionName] = array($prefixController . $collectionRoute->getDescription(), $method->getDeclaringClass()->getName(), $method->getName(), $class->getName(),'method'=>$methodName);
                        $this->description[$prefixController . $collectionRoute->getDescription()]=array($descrip,$method->getReflectionDocComment()->getFullDescription());
                        
                    }
                }
            }
        }
        
    }

}

?>
