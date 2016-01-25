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
 * Description of DebugController
 *
 * 
 */
class PerformanceController extends \Raptor\Bundle\Controller\Controller {
    /**
     * @Route /performance
     */
    public function indexAction() {
       return $this->render('@systemBundle/performance/index.html.twig');
    }
    /**
     * @Route /performance/list
     */
    public function listAction() {
        $cache=new \Raptor\Cache\Cache('performance');
        if($cache->hasCache())
            $performance= $cache->getData ();
        else
            $performance= new ItemList();
        
        $series=array();
         $performance->each(function($key,$value) use (&$series){
             $item=new ItemList();
             $item->set('value',$value);
             $item->set('no',$key);
             $series[]=$item->getArray();
         });
        return $this->JSON(new ItemList($series));
    }
}

?>
