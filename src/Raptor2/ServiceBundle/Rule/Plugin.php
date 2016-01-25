<?php
namespace Raptor2\ServiceBundle\Rule;

class Plugin implements \Raptor\Bundle\Route\Rule {
    
    
    public function call(\Raptor\Raptor $app) {
        
        $app->setViewPlugin('raptor_tools',$app->render("@ServiceBundle/plugin.html.twig"));

        /**
         * Return false to continue the flow of routing
         */
        return false;
    }

}

?>
