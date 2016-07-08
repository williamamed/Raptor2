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
namespace Raptor\Bundle\Route;

/**
 * Contenedor de reglas declaradas
 * 
 */
class RuleContainer {
    /**
     *
     * @var Rule
     */
    private $container;

    function __construct() {
        $this->container=array(array());
    }
    /**
     * Adiciona una regla a este contenedor
     * 
     * Significa que esta regla sera ejecutada cuando el patron de ruta de la regla coincida
     * con la del request actual
     * 
     * @param string $pattern patron de ruta de regla
     * @param \Raptor\Bundle\Route\Rule $callback regla especificada para ejecutar cuando el patron de ruta coincida
     * @param int $priority prieoridad de la regla, de 0-10, por defecto 0
     */
    public function add($pattern, Rule $callback,$priority=0) {
        $this->container[$priority][]=array($pattern,array($callback, 'call'));
        
    }
    
    /**
     * Adiciona una regla a este contenedor
     * 
     * Significa que esta regla sera ejecutada cuando el patron de ruta en la anotacion de la regla coincida
     * con la del request actual
     * 
     * 
     * @param \Raptor\Bundle\Route\Rule $callback regla especificada para ejecutar cuando el patron de ruta coincida
     * 
     */
    public function addRule(Rule $callback) {
        $class = new \Wingu\OctopusCore\Reflection\ReflectionClass($callback);
        $pattern='';
        $priority=0;
        if (!$class->getReflectionDocComment()->isEmpty() and $class->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('Pattern')) {
            $doc = $class->getReflectionDocComment();
            $obj = $doc->getAnnotationsCollection()->getAnnotation('Pattern');
            $pattern = $obj[0]->getDescription();
        }else
            return;
        if (!$class->getReflectionDocComment()->isEmpty() and $class->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('Priority')) {
            $doc = $class->getReflectionDocComment();
            $obj = $doc->getAnnotationsCollection()->getAnnotation('Priority');
            $priority = $obj[0]->getDescription();
        }
        $this->container[intval($priority)][]=array($pattern,array($callback, 'call'));
        
    }
    
    /**
     * Añade un regla para las guias interactivas de usuario
     * 
     * 
     * @param \Raptor\Bundle\Route\Rule $callback regla especificada para ejecutar cuando el patron de ruta coincida
     * 
     */
    public function addGuia(Rule $callback) {
        $this->container[0][]=array('/interactive/tutorial',array($callback, 'call'));
        
    }
    
    public function dispatch() {
        krsort($this->container);
        foreach ($this->container as $key => $priority) {
            
            foreach ($priority as $value) {
                
                \Raptor\Raptor::getInstance()->any($value[0],$value[1])->setParams(array(\Raptor\Raptor::getInstance()));
            }
            
        }
    }
}

?>
