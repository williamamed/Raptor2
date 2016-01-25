<?php
/**
 * Generated with RAPTOR NEMESIS
 * You can add a route prefix to this Controller
 * puting a @Route annotation to this class.
 */

namespace Raptor2\InstallerBundle\Controller;

use Raptor\Bundle\Controller\Controller;

/**
 * @Route /raptor
 */
class DefaultController extends Controller{
    
    /**
     * 
     *
     * @Route /bundle/installer
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function bundleInstallerIndexAction() {
        
        
        return $this->render('@InstallerBundle/installer/index.html.twig',array(
            'modules'=> \Raptor2\InstallerBundle\Importer\BundleImporter::getMetainformation()
        ));
    }
    
    /**
     * 
     *
     * @Route /bundle/installer/upload
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function bundleInstallerUploadAction($request) {
        
        $msg="";
        if($request->file('mybundle') and $request->file('mybundle')->get('type')=='application/octet-stream'){
            $dir=\Raptor2\InstallerBundle\Importer\BundleImporter::prepareCache();
            if($this->moveUploadFileTo('mybundle', $dir)){
                
                $msg=\Raptor2\InstallerBundle\Importer\BundleImporter::proccesBundle($dir.'/'.$request->file('mybundle')->get('name'));
                
            }
        }
        return $this->render('@InstallerBundle/installer/index.html.twig',array(
            'modules'=>\Raptor2\InstallerBundle\Importer\BundleImporter::getMetainformation(),
            'message'=>$msg
        ));
    }
    
    /**
     * 
     *
     * @Route /bundle/installer/module
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function bundleInstallerModuleAction($request) {
        
        $msg="";
        if($request->get('name')){
            $dir=\Raptor2\InstallerBundle\Importer\BundleImporter::prepareCache();
            $meta=  \Raptor2\InstallerBundle\Importer\BundleImporter::getMetainformation($request->get('name'));
            if($meta!==false){
                
                \Raptor\Util\Files::copy(__DIR__.'/../BundleStorage/files/'.$meta['file'],$dir);
                
                $msg=\Raptor2\InstallerBundle\Importer\BundleImporter::proccesBundle($dir.'/'.$meta['file']);
                
            }
        }
        return $this->render('@InstallerBundle/installer/index.html.twig',array(
            'modules'=>\Raptor2\InstallerBundle\Importer\BundleImporter::getMetainformation(),
            'message'=>$msg
        ));
    }
    
    
}

?>
