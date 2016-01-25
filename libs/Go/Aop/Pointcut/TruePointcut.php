<?php
/**
 * Go! AOP framework
 *
 * @copyright Copyright 2012, Lisachenko Alexander <lisachenko.it@gmail.com>
 *
 * This source file is subject to the license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Go\Aop\Pointcut;

use Go\Aop\Pointcut;

/**
 * Canonical Pointcut instance that always matches.
 */
class TruePointcut implements Pointcut
{
    use PointcutClassFilterTrait;

    /**
     * Filter kind
     *
     * @var int
     */
    protected $filterKind = 0;

    /**
     * Default constructor can be used to specify concrete filter kind
     *
     * @param int $filterKind Kind of filter, e.g. KIND_METHOD
     */
    public function __construct($filterKind = self::KIND_ALL)
    {
        $this->filterKind = $filterKind;
    }

    /**
     * Performs matching of point of code
     *
     * @param mixed $point Specific part of code, can be any Reflection class
     *
     * @return bool
     */
    public function matches($point)
    {
        return true;
    }

    /**
     * Returns the kind of point filter
     *
     * @return integer
     */
    public function getKind()
    {
       return $this->filterKind;
    }
}
