<?php

/**
 * Raptor - Integration PHP 5 framework
 *
 * @author      William Amed <watamayo90@gmail.com>, Otto Haus <ottohaus@gmail.com>
 * @copyright   2014 
 * @link        http://dinobyte.net
 * @version     2.0.1
 * @package     Raptor
 *
 * MIT LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
namespace Raptor\Component\systemBundle\Controller;
use Raptor\Util\ItemList;
/**
 * Description of UiController
 *
 * 
 */
class UiController extends \Raptor\Bundle\Controller\Controller{
    
    /**
     * @Route /genui
     */
    public function indexAction() {
        return $this->render('@systemBundle/ui/index.html.twig');
    }
    
    /**
     * @Route /genui/list
     */
    public function listAction() {
        $dir=  \Raptor\Core\Location::get(\Raptor\Core\Location::APP);
        $this->app->contentType(\Raptor\Raptor::JSON);
        return file_get_contents($dir."/conf/ui.templates.json");
        return $this->render('@systemBundle/ui/index.html.twig');
    }
    
    /**
     * @Route /genui/bundles
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
                $children['text']=$key2.'<b style="color: #402878">/Resources</b>';
                $children['bundle']=$key2;
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
     * @Route /genui/create
     */
    public function createAction($request) {
       $name=  $request->post('module');
       $mode=  $request->post('mode');
       $modeObj=  explode(':', $mode);
       $bundle=  $request->post('bundle');
       
       if($modeObj[0]=='ext'){
           $this->createExtEstructure ($name, $bundle, $modeObj[1]);
           $this->createHtmlExt($name, $bundle);
       }
       if($modeObj[0]=='boot'){
           $this->createHtmlBootstrap($name, $bundle,$modeObj[1]);
       }
       if($modeObj[0]=='ng'){
           $this->createHtmlAngular($name, $bundle,$modeObj[1]);
       }
       
       return $this->show("The UI <b style='color: #ddd'>$name</b> was created in:<br> $bundle/Resources<br> The twig template in:<br>$bundle/Views/$name");
    }
    
    private function createExtEstructure($name,$bundle,$index) {
        $bundles=  $this->app->getConfigurationLoader()->getBundlesSpecifications();
        
        $location=$bundles[$bundle]['location'];
        $app=$location.'/Resources/'.$name.'/js';
        if(!file_exists($app))
        @mkdir($app,0777, true);
        $controller=$location.'/Resources/'.$name.'/js/app/controller';
        if(!file_exists($controller))
        @mkdir($controller,0777, true);
        $model=$location.'/Resources/'.$name.'/js/app/model';
        if(!file_exists($model))
        @mkdir($model,0777, true);
        $store=$location.'/Resources/'.$name.'/js/app/store';
        if(!file_exists($store))
        @mkdir($store,0777, true);
        $view=$location.'/Resources/'.$name.'/js/app/view';
        if(!file_exists($view))
        @mkdir($view,0777, true);
        if($index==1){
            file_put_contents($controller.'/Generic.js',  $this->render('@systemBundle/ui/templates/controller/controller.js.twig',array('name'=>$name)));
            file_put_contents($view.'/Viewport.js',  $this->render('@systemBundle/ui/templates/view/viewport-grid.js.twig',array('name'=>$name)));
        }
        if($index==0){
            file_put_contents($controller.'/Generic.js',  $this->render('@systemBundle/ui/templates/controller/controller-empty.js.twig',array('name'=>$name)));
            file_put_contents($view.'/Viewport.js',  $this->render('@systemBundle/ui/templates/view/viewport.js.twig',array('name'=>$name)));
        }
        if($index==2){
            file_put_contents($controller.'/Generic.js',  $this->render('@systemBundle/ui/templates/controller/controller-tree.js.twig',array('name'=>$name)));
            file_put_contents($view.'/Viewport.js',  $this->render('@systemBundle/ui/templates/view/viewport-tree.js.twig',array('name'=>$name)));
            file_put_contents($view.'/GenericTree.js',  $this->render('@systemBundle/ui/templates/view/tree.js.twig',array('name'=>$name)));
            file_put_contents($model.'/GenericTreeModel.js',  $this->render('@systemBundle/ui/templates/model/treemodel.js.twig',array('name'=>$name)));
            file_put_contents($store.'/GenericTreeStore.js',  $this->render('@systemBundle/ui/templates/store/treestore.js.twig',array('name'=>$name)));
        }
        file_put_contents($model.'/GenericModel.js',  $this->render('@systemBundle/ui/templates/model/model.js.twig',array('name'=>$name)));
        file_put_contents($store.'/Generic.js',  $this->render('@systemBundle/ui/templates/store/store.js.twig',array('name'=>$name)));
        file_put_contents($view.'/GenericList.js',  $this->render('@systemBundle/ui/templates/view/grid.js.twig',array('name'=>$name)));
        file_put_contents($view.'/GenericWindow.js',  $this->render('@systemBundle/ui/templates/view/window.js.twig',array('name'=>$name)));
        if($index==2)
            file_put_contents($app.'/app.js',  $this->render('@systemBundle/ui/templates/app-tree.js.twig',array('name'=>$name)));
        else
            file_put_contents($app.'/app.js',  $this->render('@systemBundle/ui/templates/app.js.twig',array('name'=>$name)));
        file_put_contents($app.'/compileApp','');
    }
    
    private function createHtmlExt($name,$bundle) {
        $bundles=  $this->app->getConfigurationLoader()->getBundlesSpecifications();
        
        $location=$bundles[$bundle]['location'];
        $app=$location.'/Views';
        
        $resource=__DIR__.'/../Views/ui/views';
        if(!file_exists($app.'/ext-layout.html.twig')){
            file_put_contents($app.'/ext-layout.html.twig',  file_get_contents($resource.'/layout.html.twig'));
        }
        if(!file_exists($app.'/'.$name))
        @mkdir($app.'/'.$name,0777, true);
        $gen=file_get_contents($resource.'/gen.html.twig');
        $gen=  str_replace('!bundle',$bundle, $gen);
        $abbr=  str_replace('Bundle','', $bundles[$bundle]['namespace']);
        $abbr=  str_replace('\\','/', $abbr);
        if($abbr[0]=='/')
            $abbr=  substr ($abbr, 1);
        $abbr=$abbr.'/'.$name.'/js';
        $gen=  str_replace('!route',$abbr, $gen);
        file_put_contents($app.'/'.$name.'/index.html.twig', $gen );
    }
    
    
    private function createHtmlBootstrap($name,$bundle,$index) {
        $bundles=  $this->app->getConfigurationLoader()->getBundlesSpecifications();
        
        $location=$bundles[$bundle]['location'];
        $app=$location.'/Views';
        
        $resource=__DIR__.'/../Views/ui/bootstrap';
        
        if(!file_exists($app.'/'.$name))
        @mkdir($app.'/'.$name,0777, true);
        if($index==0)
            $gen=file_get_contents($resource.'/empty.html.twig');
        if($index==1)
            $gen=file_get_contents($resource.'/full.html.twig');
      
        file_put_contents($app.'/'.$name.'/index.html.twig', $gen );
    }
    
    private function createHtmlAngular($name,$bundle,$index) {
        $bundles=  $this->app->getConfigurationLoader()->getBundlesSpecifications();
        
        $location=$bundles[$bundle]['location'];
        $app=$location.'/Views';
        
        $resource=__DIR__.'/../Views/ui/angular';
        
        if(!file_exists($app.'/'.$name))
        @mkdir($app.'/'.$name,0777, true);
        if($index==0)
            $gen=file_get_contents($resource.'/empty.html.twig');
        
      
        file_put_contents($app.'/'.$name.'/index.html.twig', $gen );
    }
}

?>
