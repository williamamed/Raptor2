<?php
/**
 * Generated with RAPTOR NEMESIS
 * You can add a route prefix to this Controller
 * puting a @Route annotation to this class.
 */

namespace Raptor2\UpdateServiceBundle\Controller;

use Raptor\Bundle\Controller\Controller;

/**
 * @Route /updateservice
 */
class DefaultController extends Controller{
    
    /**
     * Add your definition Route and the RouteName[optional]
     *
     * @Route 
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function indexAction($request,$response,$route) {
        $default='http://raptorweb.cubava.cu/update';
        $value=$default;
        
        if($request->isFormData()){
            if($request->post('url'))
                file_put_contents(__DIR__.'/../Updater/url',$request->post('url'));
            else 
                file_put_contents(__DIR__.'/../Updater/url',$default);
            $this->app->contentType(\Raptor\Raptor::HTML.' ;charset=UTF-8');
        }
        
        if(file_exists(__DIR__.'/../Updater/url')){
            $value=  file_get_contents(__DIR__.'/../Updater/url');
        }else{
            file_put_contents(__DIR__.'/../Updater/url',$value);
        }
        
        $manager=new \Raptor2\UpdateServiceBundle\Updater\Manager($value.'?_dc'.  mt_rand());
        if($manager->isValid()){
           if(file_exists(__DIR__.'/../Updater/version')){
               if(version_compare(file_get_contents(__DIR__.'/../Updater/version'),$manager->getVersion())==-1)
                       return $this->render('@UpdateServiceBundle/index.html.twig',array(
                            'code'=>1,
                            'value'=>$value,
                            'token'=>  $this->app->getSecurity ()->getToken (),
                            'version'=>$manager->getVersion(),
                            'url'=>  urlencode($manager->getUrl())
                       ));
                       
                     
            }else{
                
               return $this->render('@UpdateServiceBundle/index.html.twig',array(
                            'code'=>1,
                            'value'=>$value,
                            'token'=>  $this->app->getSecurity ()->getToken (),
                            'version'=>$manager->getVersion(),
                            'url'=>  urlencode($manager->getUrl())
                       ));
            } 
        }else{
            return $this->render('@UpdateServiceBundle/index.html.twig',array(
                            'code'=>3,
                            'value'=>$value,
                            'error'=>$manager->getError()
                       ));
            
        }
        
        return $this->render('@UpdateServiceBundle/index.html.twig',array(
                            'code'=>2,
                            'value'=>$value,
                       ));
       
    }
    
    /**
     * Add your definition Route and the RouteName[optional]
     *
     * @Route /update
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function updateAction($request,$response,$route) {
        
        try {
           $this->hasCsrfProtection();
        } catch (\Exception $exc) {
            return $this->render('@UpdateServiceBundle/install/index.html.twig',array(
                    'msg'=>"No se realizó la actualización, esta acción fue detectada como posible ataque !!",
                    'cod'=>false
                ));
        }
        
        if(!$request->get('upd'))
                return;
            $name=  \Raptor2\UpdateServiceBundle\Updater\Manager::downloadRemoteFile(urldecode($request->get('upd')));
            if($name===FALSE)
                return $this->render('@UpdateServiceBundle/install/index.html.twig',array(
                    'msg'=>"No se pudo descargar la actualizacion",
                    'cod'=>false
                ));
            $zip= new \Raptor\Util\Zip($name);
            $name_rand = 'id_update_' . mt_rand();
	    $cache=\Raptor2\UpdateServiceBundle\Updater\Manager::prepareCache();
            $zip->extract($cache . '/' . $name_rand);
            @unlink($name);
            $lib=  \Raptor\Core\Location::get(\Raptor\Core\Location::APP).'/../libs';
            
            //rename($lib.'/Raptor', $lib.'/Raptor3');
            /**
             * removed in the las version
             */
            if (\Raptor\Util\Files::copy($lib.'/Raptor', $lib.'/Raptor3')) {
               \Raptor\Util\Files::delete($lib.'/Raptor');
            }
            
            if(!class_exists('\Raptor\Util\Files',false))
                require_once $lib.'/Raptor3/Util/Files.php';
            \Raptor\Util\Files::copy($cache . '/' . $name_rand, $lib);
            \Raptor\Util\Files::delete($lib.'/Raptor3');
            \Raptor\Util\Files::delete($cache . '/' . $name_rand);
            file_put_contents(__DIR__.'/../Updater/version',$request->get('version'));
            
            if(file_exists($lib.'/Raptor/Updates/Updater.php'))
                include $lib.'/Raptor/Updates/Updater.php';
            
            return $this->render('@UpdateServiceBundle/install/index.html.twig',array(
                'msg'=>"El sistema fue actualizado a la versión ".$request->get('version'),
                'cod'=>true
            ));
    }
    
    /**
     * Add your definition Route and the RouteName[optional]
     *
     * @Route /test
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function testAction($request,$response,$route) {
        return $this->render('@UpdateServiceBundle/test.twig');
    }
    
    /**
     * Add your definition Route and the RouteName[optional]
     *
     * @Route /verify
     * 
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function verifyAction($request,$response,$route) {
        $default='http://raptorweb.cubava.cu/update';
        $value=$default;
        if(file_exists(__DIR__.'/../Updater/url')){
            $value=  file_get_contents(__DIR__.'/../Updater/url');
        }else{
            file_put_contents(__DIR__.'/../Updater/url',$default);
        }
        if(file_exists(__DIR__.'/../Updater/ttl')){
            $time=  intval(file_get_contents(__DIR__.'/../Updater/ttl'));
            $time=$time+(1 * 60 * 60);
            if(time()<$time)
                return $this->JSON (array(
                    'code'=>0
                ));
        }
        file_put_contents(__DIR__.'/../Updater/ttl',  time());
        $manager=new \Raptor2\UpdateServiceBundle\Updater\Manager($value.'?_dc'.  mt_rand());
        if($manager->isValid()){
           if(file_exists(__DIR__.'/../Updater/version')){
               if(version_compare(file_get_contents(__DIR__.'/../Updater/version'),$manager->getVersion())==-1)
                       return $this->JSON (array(
                            'code'=>1,
                            'version'=>$manager->getVersion(),
                            'url'=>  urlencode($manager->getUrl())
                        ));
                     
            }else{
                
                return $this->JSON (array(
                            'code'=>1,
                            'version'=>$manager->getVersion(),
                            'url'=>  urlencode($manager->getUrl())
                        ));
            } 
        }else{
            return $this->JSON (array(
                            'code'=>3,
                            'error'=>$manager->getError()
                        ));
        }
        
        return $this->JSON (array(
                            'code'=>2
                        ));
        
    }
    
    
}

?>
