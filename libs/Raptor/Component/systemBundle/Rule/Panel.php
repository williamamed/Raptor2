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
namespace Raptor\Component\systemBundle\Rule;

/**
 * Description of Panel
 *
 * 
 */
class Panel implements \Raptor\Bundle\Route\Rule {

    public function call(\Raptor\Raptor $app) {
        if(!$app->config('debug'))
            return false;
        \Raptor\Raptor::getInstance()->hook('slim.after', array($this, 'registerLastPerformance'));
        if (!$app->request()->isXhr())
            \Raptor\Raptor::getInstance()->hook('slim.after', array($this, 'createPanel'));
        
        return false;
    }

    public function createPanel() {
        $app = \Raptor\Raptor::getInstance();
        
         if (strpos($app->response()->headers->get('Content-Type'), 'text/html')===false)
            return;
         
        $time = round($app->getTimer()->getExecutionTime(), 2);
        if ($time > 25)
            $color = '#a90000';
        else
            $color = 'white';
        $session = $app->getSecurity()->getUser();
        $session['Token'] = $app->getSecurity()->getToken();
        $session['Language'] = $app->getLanguage()->getUserCurrentLanguage();
        
        foreach ($session as $key => $value) {
            if(!is_string($value) &&  !is_numeric($value))
                if(is_array($value))
                    $session[$key]=join(',',$session[$key]);
                else
                    unset($session[$key]);
        }
        
        $app->response()->write($app->render('@systemBundle/panel/panel.html.twig', array(
                    'color' => $color,
                    'time' => $time . ' Seg',
                    
                    'memory' => ((memory_get_usage(true) / 1024) / 1024) . 'MB',
                    'session' => $session,
                    'header' => $app->request()->headers(),
                    'routes' => $app->router()->getNamedRoutes()->getArrayCopy()
        )));
    }
    
    public function registerLastPerformance() {
        $app = \Raptor\Raptor::getInstance();
        $time = round($app->getTimer()->getExecutionTime(), 2);
        $cache=new \Raptor\Cache\Cache('performance');
        if(!$cache->hasCache())
            $performance=new \Raptor\Util\ItemList();
        else
            $performance=$cache->getData();
        
        if($performance->size()<20)
            $performance->add($time);
        else{
            $performance->shift();
            $performance->add($time);
        }
        $cache->setData($performance);
        $cache->save();
    }

}

?>
