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
 * Abstract class of bundle with the base method to use 
 *
 * 
 */
abstract class Bundle {
    /**
     *
     * @var \Raptor\Raptor
     */
    protected $app;

    function __construct() {
        $this->app= \Raptor\Raptor::getInstance();
    }

    public function init() {
        $container = \Raptor\Raptor::getInstance()->getAppAspectKernel()->getContainer();
        $this->registerBundleAspect($container);
    }

    /**
     * Register in the apect container
     */
    abstract public function registerBundleAspect(\Go\Core\AspectContainer $appAspectContainer);
    /**
     * Register an Route Rule in the rule container, this rules are executed before that the registed
     * paths in the controller classes
     */
    abstract public function registerRouteRule(Route\RuleContainer $ruleContainer);
    
    /**
     * This method is call it in the entry of the bundle being the first routing in the bundle
     * execution, you need to know when a route match with a controller path the entrance method
     * of the representing bundle is executed before
     */
    abstract public function entrance(\Raptor\Raptor $app);
    /**
     * Publish the Resources files of this bundle
     * [if you are in dev mode you dont need to call it, Raptor will publish your file]
     */
    public function publishResources() {
        Publisher\Publisher::run($this,true);
    }
    /**
     * This method is call it in the configure routine of the bundle, meaning that is call it when
     * Raptor is configuring and adding all your registered path in the controller classes
     */
    public function configure(){
        
    }
}

?>
