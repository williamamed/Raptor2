<?php
namespace App;

/**
 * This a main entry of the App, consist in two method. The first 
 * is the class register to container for new libraries, the registered classes
 * can be used in the dependency inyector in any controller. The second is the main execution
 * method which is call it in first place every time no matter the route you request. 
 *
 * 
 */
class Main extends \Raptor\Core\App {

    public function registerClass(\Raptor\Core\Inyector\Container $container) {
        $container->add(new \PhpOffice\PhpWord\PhpWord());
        $container->add(new \PHPExcel());
    }

    public function init(\Raptor\Raptor $app) {
//        Place your init code here
         
        
        
        
        /**
         * This make Raptor load the control panel from the root path
         * if the config mode is debug wich is taken by Raptor like
         * DEV mode
         * 
         * PROBABLY YOU NEED TO REMOVE THIS IN PRODUCTION MODE
         */
        if($app->config('debug'))
            $app->any('/',function() use ($app){
                $app->redirect($app->request()->getScriptName().'/raptor');
            });
    }

}

?>
