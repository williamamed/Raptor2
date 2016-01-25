<?php
namespace examples\exampleBundle;

/**
 * Description of examplePkg
 * 
 * @Route /bundlemio
 */
class exampleBundle extends \Raptor\Bundle\Bundle {

    public function registerBundleAspect(\Go\Core\AspectContainer $appAspectContainer) {
        $appAspectContainer->registerAspect(new \examples\exampleBundle\Aspect\AccessAspect());
    }

    public function entrance(\Raptor\Raptor $app) {
        
    }

    public function registerRouteRule(\Raptor\Bundle\Route\RuleContainer $ruleContainer) {
        $ruleContainer->add('/bundlemio/new/example', new Rule\MyRule());
    }

}

?>
