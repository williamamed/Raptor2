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
 * 
 * Clase asbtracta del bundle con los metodos base
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
     * Registro de aspectos en el bundle
     */
    abstract public function registerBundleAspect(\Go\Core\AspectContainer $appAspectContainer);
    /**
     * 
     * Registra Reglas de rutas en el contenedor de reglas, estas reglas seran ejecutas antes de las
     * rutas definidas en los controladores
     */
    abstract public function registerRouteRule(Route\RuleContainer $ruleContainer);
    
    /**
     *
     * 
     * Esta funcion es llamada en la entrada de cada bundle, siendo la primera rutina a ejecutar cuando se
     * mande a ejecutar un ruta que pertenesca a un bundle
     * 
     */
    abstract public function entrance(\Raptor\Raptor $app);
    /**
     * Publica los recursos del bundle actual
     * [Si te encuentras en modo de desarrollo no necesitas llamar esta funcion, Raptor publica todos los recursos automaticamente en cada request]
     */
    public function publishResources() {
        Publisher\Publisher::run($this,true);
    }
    /**
     * 
     * Esta funcion es llamada en la rutina de configuracion del bundle
     * Significa que es llamada cuando Raptor esta configurando y añadiendo todas las rutas registradas
     * en las clases controladoras
     */
    public function configure(){
        
    }
}

?>
