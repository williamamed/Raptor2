<?php
namespace Raptor\Component\systemBundle;

/**
 * Description of examplePkg
 * 
 * @Route /raptor
 */
class systemBundle extends \Raptor\Bundle\Bundle {

    public function registerBundleAspect(\Go\Core\AspectContainer $appAspectContainer) {
        
    }

    public function entrance(\Raptor\Raptor $app) {
        
    }

    public function registerRouteRule(\Raptor\Bundle\Route\RuleContainer $ruleContainer) {
            $ruleContainer->add('[\/\w]*', new Rule\Panel(),10);
            $ruleContainer->add('[\/\w]*', new Rule\Client(),10);
            $ruleContainer->add('/raptor[\/\w]*', new Rule\Firewall(),10);
            $ruleContainer->add('/interactive/tutorial', new Tutorials\Guia());
    }

}

?>
