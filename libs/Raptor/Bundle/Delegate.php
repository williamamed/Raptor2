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
 * The delegate class encapsulate the Bundle 
 * representation for an execution of a route path
 * in a controller
 * 
 */
class Delegate {
    private $instance;
    private $action;
    private $bundle;

    function __construct($instance, $action, $bundle) {
        $this->instance = $instance;
        $this->action = $action;
        $this->bundle = $bundle;
       
    }

    public function call() {
        
        $cmp_str = $this->bundle;
        $cmp = new $cmp_str();
        if(\Raptor\Raptor::getInstance()->config('debug'))
            Publisher\Publisher::run($cmp, true);
        call_user_func_array(array($cmp, 'entrance'), array(\Raptor\Raptor::getInstance()));
        $app = \Raptor\Raptor::getInstance();
        $app->getLanguage()->setCurrentBundle($cmp);
        $return = call_user_func_array(array(new $this->instance(), $this->action), array($app->request(), $app->response(), $app->router()->getCurrentRoute()));
        if ($return != false || $return != null || !($return instanceof \Slim\Http\Response)) {
            $app->response()->write($return);
        }
        return true;
    }


}

?>
