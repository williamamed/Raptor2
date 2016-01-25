<?php
namespace examples\exampleBundle\Rule;

class MyRule implements \Raptor\Bundle\Route\Rule {
    
    
    public function call(\Raptor\Raptor $app) {
        
        //$app->response()->write('Regla aplicada');

        /**
         * Return false to continue the flow of routing
         */
        return false;
    }

}

?>
