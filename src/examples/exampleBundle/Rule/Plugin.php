<?php
namespace Raptor\ServiceBundle\Rule;

class Plugin implements \Raptor\Bundle\Route\Rule {
    
    
    public function call(\Raptor\Raptor $app) {
        
        $app->setViewPlugin('raptor_bundle',$app->render("@exampleBundle/plugin.html.twig"));

        /**
         * Return false to continue the flow of routing
         */
        return false;
    }

}

?>
