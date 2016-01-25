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

use Exception;
use Go\Aop\AdviceAfter;
use Go\Aop\Intercept\Joinpoint;

/**
 * "After Throwing" interceptor
 */
class AfterThrowingInterceptor extends BaseInterceptor implements AdviceAfter
{
    /**
     * After throwing exception invoker
     *
     * @param Joinpoint $joinpoint the concrete joinpoint
     *
     * @return mixed the result of the call to {@link Joinpoint::proceed()}
     * @throws Exception
     */
    final public function invoke(Joinpoint $joinpoint)
    {
        $result = null;
        try {
            $result = $joinpoint->proceed();
        } catch (Exception $invocationException) {
            $adviceMethod = $this->adviceMethod;
            $adviceMethod($joinpoint);

            throw $invocationException;
        }

        return $result;
    }
}
