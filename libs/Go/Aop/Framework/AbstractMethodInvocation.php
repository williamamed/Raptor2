<?php
/**
 * Go! AOP framework
 *
 * @copyright Copyright 2011, Lisachenko Alexander <lisachenko.it@gmail.com>
 *
 * This source file is subject to the license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Go\Aop\Framework;

use Go\Aop\Intercept\MethodInvocation;
use Go\Aop\Support\AnnotatedReflectionMethod;
use ReflectionMethod;

/**
 * Abstract method invocation implementation
 */
abstract class AbstractMethodInvocation extends AbstractInvocation implements MethodInvocation
{

    /**
     * Instance of object for invoking or null
     *
     * @var object
     */
    protected $instance = null;

    /**
     * Instance of reflection method for class
     *
     * @var null|ReflectionMethod
     */
    protected $reflectionMethod = null;

    /**
     * Name of the invocation class
     *
     * @var string
     */
    protected $className = '';

    /**
     * Constructor for method invocation
     *
     * @param string $className Class name
     * @param string $methodName Method to invoke
     * @param $advices array List of advices for this invocation
     */
    public function __construct($className, $methodName, array $advices)
    {
        parent::__construct($advices);
        $this->className        = $className;
        $this->reflectionMethod = $method = new AnnotatedReflectionMethod($this->className, $methodName);

        // Give an access to call protected method
        if ($method->isProtected()) {
            $method->setAccessible(true);
        }
    }

    /**
     * Gets the method being called.
     *
     * @return AnnotatedReflectionMethod the method being called.
     */
    public function getMethod()
    {
        return $this->reflectionMethod;
    }

    /**
     * Returns the object that holds the current joinpoint's static
     * part.
     *
     * @return object|null the object (can be null if the accessible object is
     * static).
     */
    public function getThis()
    {
        return $this->instance;
    }

    /**
     * Returns the static part of this joinpoint.
     *
     * @return object
     */
    public function getStaticPart()
    {
        return $this->getMethod();
    }

    /**
     * Returns friendly description of this joinpoint
     *
     * @return string
     */
    final public function __toString()
    {
        return sprintf(
            "execution(%s%s%s())",
            is_object($this->instance) ? get_class($this->instance) : $this->instance,
            $this->reflectionMethod->isStatic() ? '::' : '->',
            $this->reflectionMethod->name
        );
    }
}
