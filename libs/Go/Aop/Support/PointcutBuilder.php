<?php
/**
 * Go! AOP framework
 *
 * @copyright Copyright 2014, Lisachenko Alexander <lisachenko.it@gmail.com>
 *
 * This source file is subject to the license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Go\Aop\Support;

use Go\Aop\Framework\AfterInterceptor;
use Go\Aop\Framework\AfterThrowingInterceptor;
use Go\Aop\Framework\AroundInterceptor;
use Go\Aop\Framework\BeforeInterceptor;
use Go\Aop\Framework\DeclareErrorInterceptor;
use Go\Core\AspectContainer;

/**
 * Pointcut builder provides simple DSL for declaring pointcuts in plain PHP code
 */
class PointcutBuilder
{
    /**
     * @var AspectContainer
     */
    protected $container;

    /**
     * Default constructor for the builder
     *
     * @param AspectContainer $container Instance of container
     */
    public function __construct(AspectContainer $container)
    {
        $this->container = $container;
    }

    /**
     * Declares the "Before" hook for specific pointcut expression
     *
     * @param string $pointcutExpression Pointcut, e.g. "within(**)"
     * @param callable $advice Advice to call
     */
    public function before($pointcutExpression, \Closure $advice)
    {
        $this->container->registerAdvisor(
            new LazyPointcutAdvisor($this->container, $pointcutExpression, new BeforeInterceptor($advice)),
            $this->getPointcutId($pointcutExpression)
        );
    }

    /**
     * Declares the "After" hook for specific pointcut expression
     *
     * @param string $pointcutExpression Pointcut, e.g. "within(**)"
     * @param callable $advice Advice to call
     */
    public function after($pointcutExpression, \Closure $advice)
    {
        $this->container->registerAdvisor(
            new LazyPointcutAdvisor($this->container, $pointcutExpression, new AfterInterceptor($advice)),
            $this->getPointcutId($pointcutExpression)
        );
    }

    /**
     * Declares the "AfterThrowing" hook for specific pointcut expression
     *
     * @param string $pointcutExpression Pointcut, e.g. "within(**)"
     * @param callable $advice Advice to call
     */
    public function afterThrowing($pointcutExpression, \Closure $advice)
    {
        $this->container->registerAdvisor(
            new LazyPointcutAdvisor($this->container, $pointcutExpression, new AfterThrowingInterceptor($advice)),
            $this->getPointcutId($pointcutExpression)
        );
    }

    /**
     * Declares the "Around" hook for specific pointcut expression
     *
     * @param string $pointcutExpression Pointcut, e.g. "within(**)"
     * @param callable $advice Advice to call
     */
    public function around($pointcutExpression, \Closure $advice)
    {
        $this->container->registerAdvisor(
            new LazyPointcutAdvisor($this->container, $pointcutExpression, new AroundInterceptor($advice)),
            $this->getPointcutId($pointcutExpression)
        );
    }

    /**
     * Declares the error message for specific pointcut expression
     *
     * @param string $pointcutExpression Pointcut, e.g. "within(**)"
     * @param string $message Error message to show
     * @param integer $level Error level to trigger
     */
    public function declareError($pointcutExpression, $message, $level = E_USER_ERROR)
    {
        $advice = new DeclareErrorInterceptor($message, $level);
        $this->container->registerAdvisor(
            new LazyPointcutAdvisor($this->container, $pointcutExpression, $advice),
            $this->getPointcutId($pointcutExpression)
        );
    }

    /**
     * Returns a unique name for pointcut expression
     *
     * @param string $pointcutExpression
     *
     * @return string
     */
    private function getPointcutId($pointcutExpression)
    {
        static $index = 0;

        return preg_replace('/\W+/', '_', $pointcutExpression) . '.' . $index++;
    }
}
