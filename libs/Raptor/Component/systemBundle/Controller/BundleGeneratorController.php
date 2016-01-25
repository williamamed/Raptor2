<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DefaultController
 *
 * @author DinoByte
 */

namespace Raptor\Component\systemBundle\Controller;

use Raptor\Bundle\Controller\Controller;
use Raptor\Util\ItemList;

class BundleGeneratorController extends Controller {

    /**
     * @Route /genbundle
     */
    public function indexAction() {
        return $this->render('@systemBundle/bundle/bundle.html.twig');
    }

    /**
     * @Route /genbundle/bundles
     */
    public function loadBundlesAction() {
        $bundles = new ItemList($this->app->getConfigurationLoader()->getBundlesSpecifications());
        $vendors = array();

        $bundles->each(function($key, $value) use (&$vendors) {
                    $namespace = $value['namespace'];
                    if ($namespace[0] == '\\')
                        $namespace = substr($namespace, 1);
                    $vendor = explode('\\', $namespace);
                    $vendor = $vendor[0];

                    if (!isset($vendors[$vendor])) {
                        $vendors[$vendor] = array();
                        $vendors[$vendor][$key] = $value;
                    } else {
                        $vendors[$vendor][$key] = $value;
                    }
                });

        $tree = array();
        unset($vendors['Raptor']);
        foreach ($vendors as $key => $value) {
            $item = array();
            $item['text'] = $key;
            $item['children'] = array();
            $item['expanded'] = true;
            $item['vendor'] = true;
            $item['iconCls'] = 'icon-vendor';
            foreach ($value as $key2 => $value2) {
                $children = array();
                $children['text'] = $key2;
                $children['iconCls'] = 'icon-bundle';
                $children['expandable'] = false;
                $children['vendor'] = false;
                $children['namespace'] = $value2['namespace'];
                $item['children'][] = $children;
            }
            $tree[] = $item;
        }

        return $this->JSON($tree);
    }

    /**
     * @Route /genbundle/create
     * @param \Slim\Http\Request $request
     */
    public function createBundleAction($request) {
        
       
        $bundleName = $request->post('bundle');
        $bundleName.='Bundle';
        
        $messages = new ItemList();
        if (!$this->createBundleDirectory($request->post('vendor'), $bundleName, $messages)) {
            return $this->show("Sorry cannot create the Bundle directory", true, Controller::ERROR);
        }
        $this->createFiles($bundleName, $request->post('definition'), $request->post('vendor'), $messages);
        $this->app->getConfigurationLoader()->registerBundle($request->post('definition') .'\\'. $bundleName);
        $resp = array();
        $messages->each(function($key, $value) use(&$resp) {
                    $resp[] = array('msg' => $value);
                });
        
        $resp = array('response' => $resp);
        $this->app->getConfigurationLoader()->forceLoad();
        return $this->show("Bundle created", true, Controller::INFO, $resp);
    }

    public function createBundleDirectory($vendor, $bundleName, &$messages) {
        $src = \Raptor\Core\Location::get(\Raptor\Core\Location::SRC);
        if (!file_exists($src . '/' . $vendor))
            mkdir($src . '/' . $vendor);
        if (file_exists($src . '/' . $vendor . '/' . $bundleName))
            return false;

        mkdir($src . '/' . $vendor . '/' . $bundleName);
        mkdir($src . '/' . $vendor . '/' . $bundleName . '/Controller');
        mkdir($src . '/' . $vendor . '/' . $bundleName . '/Resources');
        mkdir($src . '/' . $vendor . '/' . $bundleName . '/Views');
        mkdir($src . '/' . $vendor . '/' . $bundleName . '/Model/Entity', 0777, true);
        mkdir($src . '/' . $vendor . '/' . $bundleName . '/Model/Repository', 0777, true);
        mkdir($src . '/' . $vendor . '/' . $bundleName . '/Translation');
        mkdir($src . '/' . $vendor . '/' . $bundleName . '/Rule');
        mkdir($src . '/' . $vendor . '/' . $bundleName . '/Compiler');
        mkdir($src . '/' . $vendor . '/' . $bundleName . '/Aspect');

        $messages->add("<b style='color:green'>Directory src/" . $vendor . '/' . $bundleName . ' created</b>');
        $messages->add("<b style='color:green'>Directory src/" . $vendor . '/' . $bundleName . '/Controller' . ' created</b>');
        $messages->add("<b style='color:green'>Directory src/" . $vendor . '/' . $bundleName . '/Resources' . ' created</b>');
        $messages->add("<b style='color:green'>Directory src/" . $vendor . '/' . $bundleName . '/Resources' . ' created</b>');
        $messages->add("<b style='color:green'>Directory src/" . $vendor . '/' . $bundleName . '/Views' . ' created</b>');
        $messages->add("<b style='color:green'>Directory src/" . $vendor . '/' . $bundleName . '/Model/Entity' . ' created</b>');
        $messages->add("<b style='color:green'>Directory src/" . $vendor . '/' . $bundleName . '/Model/Repository' . ' created</b>');
        return true;
    }

    public function createFiles($bundleName, $namesp, $vendor, &$messages) {
        if ($namesp[0] == '\\')
            $namespace = substr($namesp, 1);
        else
            $namespace = $namesp;
        $controller = $this->render('@systemBundle/classTemplates/controller.twig', array('namespace' => $namespace));
        $bundle = $this->render('@systemBundle/classTemplates/bundle.twig', array('class' => $bundleName, 'namespace' => $namespace));
        $compiler = $this->render('@systemBundle/classTemplates/compiler.twig', array('class' => $bundleName, 'namespace' => $namespace));
        $src = \Raptor\Core\Location::get(\Raptor\Core\Location::SRC);
        
        file_put_contents($src . '/' . $vendor . '/' . $bundleName . '/Controller/DefaultController.php', $controller);
        file_put_contents($src . '/' . $vendor . '/' . $bundleName . '/Compiler/Compiler.php', $compiler);
        file_put_contents($src . '/' . $vendor . '/' . $bundleName . '/' . $bundleName . '.php', $bundle);
        $messages->add("<b style='color:green'>File src/" . $vendor . '/' . $bundleName . '/Controller/DefaultController.php' . ' created</b>');
        $messages->add("<b style='color:green'>File src/" . $vendor . '/' . $bundleName . '/' . $bundleName . '.php' . ' created</b>');
        $messages->add("<b style='color:green'>File src/" . $vendor . '/' . $bundleName . '/Compiler/Compiler.php' . ' created</b>');
    }

    /**
     * @Route /genbundle/delete
     */
    public function deleteBundleAction($request) {
        
        $name = $request->post('name');
        $sp=  $this->app->getConfigurationLoader()->getBundlesSpecifications();
        $vendor=  str_replace($name,'', $sp[$name]['location']);
        $this->eliminarDir($sp[$name]['location']);
        $files = new ItemList(glob($vendor . "*"));
        if ($files->isEmty())
            $this->eliminarDir($vendor);

        $this->app->getConfigurationLoader()->unRegisterBundle($sp[$name]['name']);
        /**
         * Cant call force load here, the Aspect Kernel has a problem with removed bundles
         * instead perform a save operation with cache
         */
        $this->app->getConfigurationLoader()->getCache()->setDirty();
        $this->app->getConfigurationLoader()->getCache()->save();
        return $this->show("Bundle $name deleted");
    }

    
    /**
     * @Route /genbundle/export
     */
    public function exportAction() {
        $options=  $this->app->getConfigurationLoader()->getBundlesLocation();
        if (isset($options[$this->app->request()->get('name')])) {
            
            $location = \Raptor\Core\Location::get(\Raptor\Core\Location::CACHE);
            if ($location . "/Installer")
                @mkdir($location . "/Installer/created", 0777, true);
            $file = rand(10, 100000);
            $zip = new \Raptor\Util\Zip($location . "/Installer/created/" . $file . ".zip");
            $zip->create($options[$this->app->request()->get('name')]);
            $this->app->response()->headers()->set('Content-Description', 'File Transfer');
            $this->app->response()->headers()->set('Content-Disposition', 'attachment; filename="'.$this->app->request()->get('name').'.zip"');
            $this->app->contentType(\Raptor\Raptor::ZIP);
            $this->app->response()->headers()->set('Content-Transfer-Encoding', 'binary');
            $content = file_get_contents($location . "/Installer/created/" . $file . ".zip");
            
            @unlink($location . "/Installer/created/" . $file . ".zip");
            return $content;
        }
        
    }
    
    /**
     * @Route /genbundle/checkexport
     */
    public function checkExportAction() {
        
        $options=  $this->app->getConfigurationLoader()->getBundlesLocation();
        if(isset($options[$this->app->request()->post('name')])){
            $install=  \Raptor\Util\Files::find($options[$this->app->request()->post('name')],'install.json');
            if(count($install)>0){
                return $this->show("Please wait we are generating");
            }else{
                return $this->show("The bundle that you want export hasn't an installer manifiest, please create one.",true,  Controller::ERROR);
            }
        }
        return $this->show("We cannot find the bundle specified",true,  Controller::ERROR);
    }
    
    function eliminarDir($carpeta) {
        foreach (glob($carpeta . "/*") as $archivos_carpeta) {


            if (is_dir($archivos_carpeta)) {
                $this->eliminarDir($archivos_carpeta);
            } else {
                unlink($archivos_carpeta);
            }
        }

        rmdir($carpeta);
    }

}

?>
