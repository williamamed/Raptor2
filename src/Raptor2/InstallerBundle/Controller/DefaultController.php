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
        if (!extension_loaded('fileinfo')) {
            return $this->render('@InstallerBundle/installer/index.html.twig',array(
                'finfo'=> false
            ));
        }
        
        
        $local=\Raptor2\InstallerBundle\Importer\BundleImporter::getMetainformation();
        $conf=  $this->getApp()->getConfigurationLoader()->getConfOption();
        if(isset($conf['raptor']['repository'])){
            $remote=  \Raptor2\InstallerBundle\Importer\BundleImporter::getRemoteMetainformation($conf['raptor']['repository']);
            $local=  array_merge($local, $remote);
        }
        return $this->render('@InstallerBundle/installer/index.html.twig',array(
            'modules'=> $local,
            'finfo'=> true
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
        if (!extension_loaded('fileinfo')) {
            return $this->render('@InstallerBundle/installer/index.html.twig',array(
                'finfo'=> false
            ));
        }
        $msg="";
        
        $fileInfo = new \finfo(FILEINFO_MIME_TYPE);
        $fileMime = $fileInfo->file($request->file('mybundle')->get('tmp_name'));
        if($request->file('mybundle') and $fileMime=='application/zip'){
            $dir=\Raptor2\InstallerBundle\Importer\BundleImporter::prepareCache();
            if($this->moveUploadFileTo('mybundle', $dir.'/'.$request->file('mybundle')->get('name'))){
                
                $msg=\Raptor2\InstallerBundle\Importer\BundleImporter::proccesBundle($dir.'/'.$request->file('mybundle')->get('name'));
                
            }else{
                $msg="<span style='color:#ff3366'>The uploaded bundle cant be copied to the cache location for an unknown reason</span>";
            }
        }else{
            $msg="<span style='color:#ff3366'>The file you upload is not a zip bundle file</span>";
        }
        $local=\Raptor2\InstallerBundle\Importer\BundleImporter::getMetainformation();
        $conf=  $this->getApp()->getConfigurationLoader()->getConfOption();
        if(isset($conf['raptor']['repository'])){
            $remote=  \Raptor2\InstallerBundle\Importer\BundleImporter::getRemoteMetainformation($conf['raptor']['repository']);
            $local=  array_merge($local, $remote);
        }
        return $this->render('@InstallerBundle/installer/index.html.twig',array(
            'modules'=>$local,
            'message'=>$msg,
            'finfo'=>true
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
        if($request->get('name') and $request->get('type')=='local'){
            $dir=\Raptor2\InstallerBundle\Importer\BundleImporter::prepareCache();
            $meta=  \Raptor2\InstallerBundle\Importer\BundleImporter::getMetainformation($request->get('name'));
            if($meta!==false){
                
                \Raptor\Util\Files::copy(__DIR__.'/../BundleStorage/files/'.$meta['file'],$dir);
                
                $msg=\Raptor2\InstallerBundle\Importer\BundleImporter::proccesBundle($dir.'/'.$meta['file']);
                
            }
        }elseif ($request->get('name') and $request->get('type')=='remote' and $request->get('url')) {
            
             $file=  \Raptor2\InstallerBundle\Importer\BundleImporter::downloadRemoteFile($request->get('url'));
             
             $msg=\Raptor2\InstallerBundle\Importer\BundleImporter::proccesBundle($file);
                
            
        }
        $local=\Raptor2\InstallerBundle\Importer\BundleImporter::getMetainformation();
        $conf=  $this->getApp()->getConfigurationLoader()->getConfOption();
        if(isset($conf['raptor']['repository'])){
            $remote=  \Raptor2\InstallerBundle\Importer\BundleImporter::getRemoteMetainformation($conf['raptor']['repository']);
            $local=  array_merge($local, $remote);
        }
        return $this->render('@InstallerBundle/installer/index.html.twig',array(
            'modules'=>$local,
            'message'=>$msg,
            'finfo'=>true
        ));
    }
    
    
}

?>
