<?php

namespace App;

use Go\Core\AspectKernel;
use Go\Core\AspectContainer;

class AppAspectKernel extends AspectKernel {

    /**
     * Configure an AspectContainer with advisors, aspects and pointcuts
     *
     * @param AspectContainer $container
     *
     * @return void
     */
    protected function configureAop(AspectContainer $container) {
//        $container->registerAspect(new \examples\exampleBundle\Aspect\AccessAspect());
        
    }
    
    public function resetContainer() {
        $container=$this->container = new $this->options['containerClass'];
        $container->set('kernel', $this);
        $container->set('kernel.interceptFunctions', $this->hasFeature(\Go\Aop\Features::INTERCEPT_FUNCTIONS));
        $container->set('kernel.options', $this->options);
        // Register kernel resources in the container for debug mode
        if ($this->options['debug']) {
            $this->addKernelResourcesToContainer($this->container);
        }
        \Go\Instrument\ClassLoading\AopComposerLoader::init($this->options, $container);
        
        // Register all AOP configuration in the container
        $this->configureAop($container);
    }
    
    

}

?>
