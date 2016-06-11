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

/**
 * The configuration loader handle all the Raptor global configuration,
 * storage the values of route definitions, registed bundles, global options, 
 * classes absolute locations, Api definitions Etc.
 *
 * 
 */
namespace Raptor\Configuration;
use Raptor\Core\Location;

class ConfigurationLoader {
    
    protected $options;
    
    /**
     *
     * @var Raptor\Cache\Cache
     */
    private $cache;

    /**
     *
     * @var \Raptor\Bundle\Reader
     */
    private $reader;
    
    private $monitor;
    /**
     *
     * @var \Raptor\Cache\Cache
     */
    private $cacheautoinstaller;
    /**
     *
     * @var array 
     */
    private $autoinstaller;
    
    function __construct() {
        $this->options = array();
        $this->monitor=new Monitor();
        $this->cache = new \Raptor\Cache\Cache('system');
        $this->cacheautoinstaller = new \Raptor\Cache\Cache('autoinstall');
        $this->autoinstaller=array();
        $this->reader = new \Raptor\Bundle\Reader();
        $this->read();
        
    }

    private function read() {
        if(!$this->cacheautoinstaller->isDirty()){
            $this->autoinstaller=  $this->cacheautoinstaller->getData();
        }
        if ($this->cache->isDirty()) {
            $this->monitor->execute();
            $this->checkForGhosts();
            $app = Location::get(Location::APP);
            $this->options['options'] = \Raptor\Yaml\Yaml::parse($app . '/conf/options.yml');
            $this->options['bundles'] = \Raptor\Yaml\Yaml::parse($app . '/conf/bundles.yml');
            
            /**
             * Add the system routes and the bundles
             * check fot enviroment
             * if(development)
             */
            $this->options['bundles'] = array_merge(\Raptor\Yaml\Yaml::parse(__DIR__ . '/../Component/bundles.yml'), $this->options['bundles']);
            /**
             * Must call this before the Reader
             */
           
//           \Raptor\Raptor::getInstance()->getAppAspectKernel()->resetContainer();
           
            foreach ($this->options['bundles'] as $bundle) {
                $cmp_str = $bundle;
                $cmp = new $cmp_str();
                call_user_func_array(array($cmp, 'init'), array());
                $container = \Raptor\Raptor::getInstance()->getAppAspectKernel()->getContainer();
                $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
                $refClass = new \ReflectionObject($cmp);
                
                $container->addResource($trace[1]['file']);
                $container->addResource($refClass->getFileName());
            }
            
            $this->reader->setBundles($this->options['bundles']);
            $this->reader->load();
            $this->options['routes'] = $this->reader->getDefinitions();
            $this->options['location'] = $this->reader->getLocation();
            $this->options['specifications'] = $this->reader->getSpecifications();
            $this->options['description'] = $this->reader->getDescriptions();
            $this->cache->setData($this->options);
            $this->cache->save();
            /**
             * Save the API to access in the main Raptor class
             */
            $api = new \Raptor\Cache\Cache('api');
            $api->setData($this->reader->getApi());
            $api->save();
            /**
             * Save the Auto Install Cache to know the trace of installed bundled
             */
            $this->cacheautoinstaller->setData($this->autoinstaller);
            $this->cacheautoinstaller->save();
            
        } else {
            $this->options = $this->cache->getData();
            foreach ($this->options['bundles'] as $bundle) {
                $cmp_str = $bundle;
                $cmp = new $cmp_str();
                call_user_func_array(array($cmp, 'init'), array());
                $container = \Raptor\Raptor::getInstance()->getAppAspectKernel()->getContainer();
                $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
                $refClass = new \ReflectionObject($cmp);

                $container->addResource($trace[1]['file']);
                $container->addResource($refClass->getFileName());
            }
        }
        
    }
    
    private function decodeFunctions($text) {
        
        $rigth=strstr($text,'"hash(');
        if($rigth!==FALSE){
            $left=  strstr($rigth,')"', true);
            $change=$left.')"';
            $hash=  str_replace('"hash(','', $left);
            // ... Detect and change the text, pass after to the recursive function
            
            $passed=str_replace($change, "{mode: hash,password: $hash}", $text);
            return $this->decodeFunctions($passed);
        }
        return $text;
    }
   /**
    * Return a Std class representing the tag definition in the conf file,<br>
    * ei. "hash($TH$63.YHHSKKSK*&SJHJS&%JHD.sIIMNs)" = {mode: hash, password: $TH$63.YHHSKKSK*&SJHJS&%JHD.sIIMNs}
    * @param string $definition
    * @return \stdClass
    */ 
   static public function getHash($definition) {
        
        $rigth=strstr($definition,'hash(');
        
        $std=new \stdClass();
        $std->valid=false;
        $std->password=$definition;
        if($rigth!==FALSE){
            $left=  strstr($rigth,')', true);
            
            $hash=  str_replace('hash(','', $left);
            // ... Detect and change the text, pass after to the recursive function
            $std->mode='hash';
            $std->password=$hash;
            $std->valid=true;
        }
        
        return $std;
    }

    /**
     * Return the all the configuration in one array
     * 
     * ['options'=><br>
     *  &nbsp;&nbsp;&nbsp;&nbsp;['database'=>...,'raptor'=>...],<br>
     *  'bundles'=><br>
     *  &nbsp;&nbsp;&nbsp;&nbsp;['database','raptor'],<br>
     *  'routes'=><br>
     *  &nbsp;&nbsp;&nbsp;&nbsp;['route_name'=>['/path','Bundle\ClassController','MethodToCall']],<br>
     *  'location'=><br>
     *  &nbsp;&nbsp;&nbsp;&nbsp;['bundleName'=>'src/exampleBundle'],<br>
     *  'specifications'=><br>
     *  &nbsp;&nbsp;['bundleName'=><br>
     *  &nbsp;&nbsp;&nbsp;&nbsp;['location'=>'src/exampleBundle',<br>
     *  &nbsp;&nbsp;&nbsp;&nbsp;'namespace'=>'example\exampleBundle',<br>
     *  &nbsp;&nbsp;&nbsp;&nbsp;'name'=>'example\exampleBundle\exampleBundle']<br>
     *  ]
     * @return Array
     */
    public function getOptions() {
        return $this->options;
    }
    /**
     * Set the options to the conf options file
     * You need to call flush to write in the config file
     * @param Array $array
     */
    public function setConfOption($array) {
        if (is_array($array)) {
           $this->options['options'] = array_replace_recursive($this->options['options'], $array);
           
        }
    }

    /**
     * Return the configuration array
     * 
     * @return Array
     */
    public function getConfOption() {
        return $this->options['options'];
    }

    /**
     * Return all the routes registered
     * ['route_name'=>['/path','Bundle\ClassController','MethodToCall']]
     * 
     * @return Array
     */
    public function getRoutes() {
        return $this->options['routes'];
    }
    
    /**
     * Return all the routes descriptions
     * ['/path'=>['This route is for doing something']]
     * 
     * @return Array
     */
    public function getRoutesDescriptions() {
        return $this->options['description'];
    }

    /**
     * Return the bundles location
     * ['bundleName'=>'src/exampleBundle']
     * 
     * @return Array
     */
    public function getBundlesLocation() {
        return $this->options['location'];
    }

    /**
     * Return the bundles registered
     * ['\example\exampleBundle\exampleBundle']
     * 
     * @return Array
     */
    public function getBundles() {
        return $this->options['bundles'];
    }

    /**
     * Return the bundles location
     * 
     *      ['bundleName'
     *      &nbsp;&nbsp;=>['location'=>'src/exampleBundle',
     *       &nbsp;&nbsp;&nbsp;&nbsp;'namespace'=>'example\exampleBundle',
     *       &nbsp;&nbsp;&nbsp;&nbsp;'name'=>'example\exampleBundle\exampleBundle']
     *       ]
     * 
     * @return Array
     */
    public function getBundlesSpecifications() {
        return $this->options['specifications'];
    }

    /**
     * Force the ConfigurationLoader
     * to recompile the configuration
     * and cached
     */
    public function forceLoad() {
        $this->cache->setDirty();
        $this->read();
    }
    /**
     * Write in the conf options file
     */
    public function writeOptions() {
        
            $app = Location::get(Location::APP);
            
            $real = $this->getConfOption();
            
            $ymlParam = \Raptor\Yaml\Yaml::dump($real);
        file_put_contents($app . '/conf/options.yml', $ymlParam);
        
    }
    /**
     * Add a bundles in the conf bundles file
     * @param array|string $bundles
     */
    public function registerBundle($bundles) {
        $app = Location::get(Location::APP);
        $real_bundles = \Raptor\Yaml\Yaml::parse($app . '/conf/bundles.yml');
        if (is_array($bundles)) {
            $real_bundles = array_merge($real_bundles, $bundles);
        } else {
            $real_bundles[] = $bundles;
        }
        $ymlParam = \Raptor\Yaml\Yaml::dump($real_bundles);
        file_put_contents($app . '/conf/bundles.yml', $ymlParam);
    }
    
    /**
     * Remove a bundles in the conf bundles file
     * @param string $bundle
     */
    public function unRegisterBundle($bundle) {
        $app = Location::get(Location::APP);
        $real_bundles = \Raptor\Yaml\Yaml::parse($app . '/conf/bundles.yml');
        $copy=$bundle;
        if($copy[0]!='\\')
            $copy='\\'.$copy;
        
        foreach ($real_bundles as $key => $value) {
            if($value==$copy){
                unset($real_bundles[$key]);
            }
        }
        $ymlParam = \Raptor\Yaml\Yaml::dump($real_bundles);
        file_put_contents($app . '/conf/bundles.yml', $ymlParam);
    }
    /**
     * 
     * @return \Raptor\Cache\Cache
     */
    public function getCache() {
        return $this->cache;
    }
    
    /**
     * Get an array of messages corresponding to the last bundles autoinstall operations
     * @return array
     */
    public function getAutoInstallMessage() {
        $msg=$this->autoinstaller;
        $this->autoinstaller=array();
        $this->cacheautoinstaller->setData(array());
        $this->cacheautoinstaller->save();
        return $msg; 
    }
    
    private function checkForGhosts() {
        $app = \Raptor\Core\Location::get(\Raptor\Core\Location::APP);
        $src = \Raptor\Core\Location::get(\Raptor\Core\Location::SRC);
        $installed=$this->options['bundles'] = \Raptor\Yaml\Yaml::parse($app . '/conf/bundles.yml');
        $detected=  $this->monitor->getDetection();
        /**
         * Ghost detection
         */
        foreach ($installed as $bundle) {
            $detect=false;
            foreach ($detected as $value) {
                if($bundle===$value){
                    $detect=true;
                    break;
                }
            }
            if($detect==false){
                $this->autoinstaller[]="<h3>A ghost bundle <b>($bundle)</b> was detected and removed !!</h3>";
                $this->unRegisterBundle ($bundle);
            }
        }
        /**
         * AutoBundle-Installer
         */
        foreach ($detected as $bundle) {
            $detect=false;
            foreach ($installed as $value) {
                if($bundle===$value){
                    $detect=true;
                    break;
                }
            }
            if($detect==false){
                $bundleRoute=$src.''.str_replace('\\', '/', $bundle).'';
        		$div=explode('/',$bundleRoute);
        		unset($div[count($div)-1]);
        		$bundleRoute=join('/',$div);
                $ruta=  $bundleRoute.'/Manifiest/install.json';
                if(file_exists($ruta)){
                    $meta=  json_decode(utf8_encode(file_get_contents($ruta)),true);
                    
                    if(!isset($meta['installed']) or (isset($meta['installed']) and  $meta['installed']==0)){
                        
                        $meta['installed']=1;
                        if(isset($meta['installScript']) and file_exists($bundleRoute.$meta['installScript'])){
                            $this->callbackInstall($bundleRoute.$meta['installScript']);
                        }
                        file_put_contents($ruta, json_encode($meta,JSON_PRETTY_PRINT));
                        $this->registerBundle($bundle);
                        $this->autoinstaller[]="<h3>A new bundle <b>$bundle</b> was detected and installed !!</h3>";
                    }
                } 
            }
        }
    }
    /**
     * This callback prevent that the include installer script
     * inject malicius code in the functioning
     * @param type $param
     */
    private function callbackInstall($file) {
        include $file;
    }

    
}

?>
