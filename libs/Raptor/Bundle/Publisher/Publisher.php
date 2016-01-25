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
namespace Raptor\Bundle\Publisher;
/**
 * Publisher execute a copying routine in the web directory of the
 * especified bundle, be aware that is copied creating the corresponding
 * bundle estrucuture in web
 *
 * 
 */
class Publisher {
    /**
     * The publishing files will be those are located in Resources
     * @param string $bundle The bundle you want to publish in web
     * @param boolean $extPreCompile if is true execute the extjs precompile routine
     */
    static public function run($bundle,$extPreCompile=false) {
        $class= new \Wingu\OctopusCore\Reflection\ReflectionClass($bundle);
        $location= dirname($class->getFileName());
       
        if(file_exists($location.DIRECTORY_SEPARATOR.'Resources')){
            
                $fileBundle=  str_replace('Bundle','', $class->getNamespaceName());
                $fileBundle=  str_replace('\\','/', $fileBundle);
                
                
                $web=\Raptor\Core\Location::get(\Raptor\Core\Location::WEBBUNDLES);
                if(!file_exists($web.'/'.$fileBundle))
                    mkdir ($web.'/'.$fileBundle,0777,true);
                \Raptor\Util\Files::copy($location.DIRECTORY_SEPARATOR.'Resources',$web.'/'.$fileBundle);
                if($extPreCompile)
                    Extjs::preCompileApp($web.'/'.$fileBundle);
         }
    }
}

?>
