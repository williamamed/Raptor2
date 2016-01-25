<?php
/**
 * Generated with RAPTOR NEMESIS
 * You can add a route prefix to this Controller
 * puting a @Route annotation to this class.
 */

namespace Raptor2\ServiceBundle\Controller;

use Raptor\Bundle\Controller\Controller;

/**
 * @Route /public
 */
class ServerController extends Controller{
    
    /**
     * Add your definition route and the name route[optional]
     *
     * @Route /service
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function indexAction($request,$response,$route) {
        $dirClass = __DIR__ . DIRECTORY_SEPARATOR . '..'. DIRECTORY_SEPARATOR . 'Soap' . DIRECTORY_SEPARATOR . 'wsdl' . DIRECTORY_SEPARATOR . 'service.wsdl';

        if (file_exists($dirClass)) {
            $server = new \SoapServer($dirClass, array('soap_version' => SOAP_1_2));
            $server->setClass('Raptor2\ServiceBundle\Soap\Service');
            $this->app->contentType(\Raptor\Raptor::APPXML);
            $server->handle();
        }
    }
    
    
    
}

?>
