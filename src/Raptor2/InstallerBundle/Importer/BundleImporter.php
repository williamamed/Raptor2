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
namespace Raptor2\InstallerBundle\Importer;
/**
 * Description of BundleImporter
 *
 * 
 */
class BundleImporter {
    
   static public function proccesBundle($bundle) {


        $zip = new \Raptor\Util\Zip($bundle);
        $rand_id = rand(10, 100000);
        $name_rand = 'id_install_' . $rand_id;
        $zip->extract(self::prepareCache() . '/' . $name_rand);
        $src=  \Raptor\Core\Location::get(\Raptor\Core\Location::SRC);
        @unlink($bundle);
        $result = self::checkingForInstall($name_rand);
        if ($result !== false) {
            $meta = json_decode(file_get_contents($result), true);

            if (isset($meta['namespace'])) {
                $parts = explode('.', $meta['namespace']);
                
                if (!file_exists($src . '/' . $parts[0] . '/' . $parts[1])) {
                    if (!file_exists($src . '/' . $parts[0])) {
                        @mkdir(self::prepareCache() . '/' . $parts[0]);
                    }
                    $match = \Raptor\Util\Files::find(self::prepareCache() . '/' . $name_rand, $parts[1]);
                    if (count($match) > 0) {
                        \Raptor\Util\Files::copy($match[0], $src . '/' . $parts[0] . '/' . $parts[1]);
                        $error = 'The installer finish to import and run the bundle !!<br>';
                        if (isset($meta['installScript']) and file_exists($src . '/' . $parts[0] . '/' . $parts[1] . '/' . $meta['installScript'])) {
                            $message = require $src . '/' . $parts[0] . '/' . $parts[1] . '/' . $meta['installScript'];
                            $error.=(is_string($message) ? $message : '');
                        }
                        \Raptor\Raptor::getInstance()->getConfigurationLoader()->forceLoad();
                    } else {
                        //Show error
                        $error = '<span style="color:red">Cannot find the bundle especified in the manifiest</span>';
                    }
                } else {
                    //Show error
                    $error = '<span style="color:red">The bundle especified already exist or an existent bundle have the same name</span>';
                }
            } else {
                //Show error
                $error = '<span style="color:red">The Namepace param is a critical parameter in the manifiest and is missing</span>';
            }
        } else {
            //Show error
            $error = '<span style="color:red">We cannot find an installer manifiest in the zip bundle</span>';
        }
        $hidden = \Raptor\Util\Files::find(self::prepareCache() . '/' . $name_rand, '.*');
        foreach ($hidden as $value) {
            @unlink($value);
        }
        \Raptor\Util\Files::delete(self::prepareCache() . '/' . $name_rand);

        return $error;
    }
    
   static public function prepareCache() {
        $cache=  \Raptor\Core\Location::get(\Raptor\Core\Location::CACHE);
        if(!file_exists($cache.'/Installer'))
            @mkdir ($cache.'/Installer');
        return $cache.'/Installer';
    }
    
   static public function checkingForInstall($name) {
        $file=  \Raptor\Util\Files::find(self::prepareCache().'/'.$name,'install.json');
        if(count($file)>0)
            return $file[0];
        return false;
    }
    
   static public function getMetainformation($name=NULL) {
        $modules=  glob(__DIR__.'/../BundleStorage/meta/*.json');
        $metaInformation=array();
        
        foreach ($modules as $filename) {
            $metaObj=  json_decode(file_get_contents($filename), true);
            
            if($metaObj){
                $meta=array('name'=>'','description'=>'','file'=>'');
                if(isset($metaObj['name']) and $metaObj['name']){
                    $meta['name']=$metaObj['name'];
                }else
                    continue;
                if(isset($metaObj['description']))
                    $meta['description']=$metaObj['description'];
                
                if(isset($metaObj['author']))
                    $meta['author']=$metaObj['author'];
                
                if(isset($metaObj['file']) and $metaObj['file'] and file_exists(__DIR__.'/../BundleStorage/files/'.$meta['file']))
                    $meta['file']=$metaObj['file'];
                else
                    continue;
                
                if(isset($metaObj['image'])){
                    $web=  \Raptor\Core\Location::get(\Raptor\Core\Location::WEBBUNDLES);
                    if(file_exists($web.'/'.$metaObj['image']))
                        $meta['image']=$metaObj['image'];
                    else
                        $meta['image']=0;
                }else
                    $meta['image']=0;
                //Validate if the file exists
                //if(__DIR__.'/../BundleStorage/files/'.$meta['file'])
                $meta['type']='local';
                    $metaInformation[]=$meta;
                if($name!=NULL and $name==$meta['name'])
                        return $meta;
            }
        }
        if($name!=NULL)
            return false;
        return $metaInformation;
    }
    
    
    static private function getRemoteManifiest($url) {
        
        $array=array();
        $bufer=@file_get_contents($url);
        
       
        $array=  json_decode($bufer,true);
        if(!$array)
            return array();
        return $array;
    }
    
    static public function downloadRemoteFile($url) {
       
       $bufer=@file_get_contents($url);
       $rand_id = rand(10, 100000);
       $file=self::prepareCache()."/remote/$rand_id.zip";
       if(!file_exists(self::prepareCache()."/remote"))
             @mkdir (self::prepareCache()."/remote") ;
       file_put_contents($file, $bufer);
       return $file;
    }

    static public function getRemoteMetainformation($url) {
        $modules= self::getRemoteManifiest($url);
        $metaInformation=array();
        
        foreach ($modules as $filename) {
            $metaObj=  $filename;
            
            if($metaObj){
                $meta=array('name'=>'','description'=>'','file'=>'');
                if(isset($metaObj['name']) and $metaObj['name']){
                    $meta['name']=$metaObj['name'];
                }else
                    continue;
                if(isset($metaObj['description']))
                    $meta['description']=$metaObj['description'];
                
                if(isset($metaObj['author']))
                    $meta['author']=$metaObj['author'];
                
                if(isset($metaObj['file']) and $metaObj['file'])
                    $meta['file']=$metaObj['file'];
                else
                    continue;
                
                if(isset($metaObj['image'])){
                    $meta['image']=$metaObj['image'];
                    
                }else
                    $meta['image']=0;
                
                    $meta['type']='remote';
                    $metaInformation[]=$meta;
               
            }
        }
        
        return $metaInformation;
    }
}

?>
