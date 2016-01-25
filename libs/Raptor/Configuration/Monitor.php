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
namespace Raptor\Configuration;
/**
 * This class execute a routine to check for
 * added and removed bundles and prevents fails
 * in bundles execution list
 */
class Monitor {
    private $detected;
    
    function __construct() {
        $this->detected=array();
    }

    public function execute() {
        $src=  \Raptor\Core\Location::get(\Raptor\Core\Location::SRC);
        $bundles=  glob($src.'/*Bundle.php*');
        $this->detected=array_merge_recursive($this->detected, $bundles);
        foreach (glob($src.'/*') as $path) {
            if(is_dir($path))
                $this->look ($path);
        }
    }
    
    private function look($path) {
        $bundles=  glob($path.'/*Bundle.php*');
        $this->detected=  array_merge_recursive($this->detected, $bundles);
       
        foreach (glob($path.'/*') as $pathDeep) {
            if(is_dir($pathDeep))
                $this->look ($pathDeep);
        }
    }
    
    public function getDetection() {
        $this->normalize();
        return $this->detected;
    }
    
    private function normalize() {
        foreach ($this->detected as &$value) {
            $name=  strstr($value,'src');
            $name=  str_replace('.php','', $name);
            $name=  str_replace('/','\\', $name);
            $name=  str_replace('src','', $name);
            $value=$name;
        }
    }
    
    
}

?>
