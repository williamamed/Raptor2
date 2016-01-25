<?php
/**
 * Generated with RAPTOR NEMESIS
 * You can add a route prefix to this Controller
 * puting a @Route annotation to this class.
 */

namespace Raptor2\InteractiveBundle\Controller;

use Raptor\Bundle\Controller\Controller;

/**
 * @Route /interactive
 */
class DefaultController extends Controller{
    
    /**
     * Add your definition route and the name route[optional]
     *
     * @Route /core
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function indexAction($request,$response,$route) {
        $this->app->contentType('application/javascript');
        return $this->render('@InteractiveBundle/lib/interactive.js');
    }
    
    /**
     * 
     *
     * @Route /tutorial
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function turorialAction($request,$response,$route) {
        $interactive=$this->get('InteractiveManager');
        $user='public';
        if($this->app->getSecurity()->isAuthenticated()){
            $array=$this->app->getSecurity()->getUser();
            $user=$array['username'];
        }
        $store=json_encode(array('reject'=>false,'tutoriales'=>array('interactive'=>'This is interactive')));
        if($this->app->getCookie('Interactive_'.$user, true)==NULL){
            $this->app->setCookie('Interactive_'.$user, $store ,  strtotime('+30 day'));
        }else{
            $store= json_decode($this->app->getCookie('Interactive_'.$user, true));
            $store->tutoriales->{$request->get('name')}=0;
            $this->app->setCookie('Interactive_'.$user, json_encode($store) ,  strtotime('+30 day'));
            
        }
        $interactive->setCurrentData($store);
        return $this->JSON($interactive->getTutorial($request->get('name')));
    }
    
    
}

?>
