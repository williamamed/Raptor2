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
namespace Raptor\Core;

/**
 * Execute the routing rutine for registered controller paths
 *
 * 
 */
class Routing extends \Slim\Middleware {

    private $routes;
    private $bundles;

    public function call() {
        $options = $this->app->getConfigurationLoader()->getOptions();
        $this->routes = $options['routes'];
        $this->bundles = $options['bundles'];
        $this->adding();
        $this->next->call();
    }

    private function adding() {
        foreach ($this->bundles as $key => $bundle) {
            $cmp_str = $bundle;
            $cmp = new $cmp_str();
            call_user_func_array(array($cmp, 'configure'),array());
        }
        
        foreach ($this->bundles as $key => $bundle) {
            $cmp_str = $bundle;
            $cmp = new $cmp_str();
            call_user_func_array(array($cmp, 'registerRouteRule'),array($this->app->getRuleContainer()));
        }
        $this->app->getRuleContainer()->dispatch();
        
        foreach ($this->routes as $key => $route) {
            switch ($route) {
                case 'POST':
                    $route = $this->app->post($route[0], array(new \Raptor\Bundle\Delegate($route[1], $route[2], $route[3]), 'call'));
                    break;
                case 'GET':
                    $route = $this->app->get($route[0], array(new \Raptor\Bundle\Delegate($route[1], $route[2], $route[3]), 'call'));
                    break;
                case 'PUT':
                    $route = $this->app->put($route[0], array(new \Raptor\Bundle\Delegate($route[1], $route[2], $route[3]), 'call'));
                    break;
                case 'DELETE':
                    $route = $this->app->delete($route[0], array(new \Raptor\Bundle\Delegate($route[1], $route[2], $route[3]), 'call'));
                    break;
                default:
                    $route = $this->app->any($route[0], array(new \Raptor\Bundle\Delegate($route[1], $route[2], $route[3]), 'call'));
                    break;
            }
            
            $route->setName($key);
            $route->setMiddleware(array($this->app->router(), 'setCurrent'));
        }
    }

}

?>
