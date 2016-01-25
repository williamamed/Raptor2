<?php

namespace examples\exampleBundle\Aspect;
use Go\Aop\Aspect;
use Go\Aop\Intercept\MethodInvocation;
use Go\Lang\Annotation\After;
use Go\Lang\Annotation\Before;
use Go\Lang\Annotation\Pointcut;

class AccessAspect implements \Go\Aop\Aspect {

    /**
     * @param MethodInvocation $invocation
     * @Before("execution(public examples\exampleBundle\Controller\DefaultController->*(*))")
     */
    protected function beforeMethodExecution(\Go\Aop\Intercept\MethodInvocation $invocation) {
        //echo 'Calling Before Interceptor for ', $invocation;
    }

}

?>
