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

class DoctrineGeneratorController extends Controller {

    /**
     * @Route /gendoctrine/model
     */
    public function indexAction() {
        return $this->render('@systemBundle/Doctrine/model.html.twig');
    }

    /**
     * @Route /gendoctrine/bundles
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
     * @Route /gendoctrine/model/listSchema
     */
    public function listSchemaAction() {
        $schemas=new ItemList($this->app->getStore()->getSchemaClass());
        $schemas->each(function($key,$value,$list){
            $schema=new ItemList();
            $schema->set('table',$value);
            $list->set($key,$schema->getArray());
        });
        
        return $this->JSON($schemas);
    }
    /**
     * @Route /gendoctrine/model/create
     */
    public function createClassesAction($request) {
        $tables=  $request->post('tables');
        $bundle=  $request->post('name');
        $spc=  $this->app->getConfigurationLoader()->getBundlesSpecifications();
        $namespace=$spc[$bundle]['namespace'];
        if($namespace[0]=='\\')
            $namespace=  substr ($namespace, 1);
        $this->getStore()->generateClasses($namespace,json_decode($tables));
        return $this->show("Classes created");
    }
    /**
     * @Route /gendoctrine/schema
     */
    public function schemaAction() {
       return $this->render('@systemBundle/doctrine/schema.html.twig');
    }
    /**
     * @Route /gendoctrine/schema/listClasses
     */
    public function listClassesAction($request) {
        $bundle=  $request->post('name');
        
        $spc=  $this->app->getConfigurationLoader()->getBundlesSpecifications();
        
        $absolute= $spc[$bundle]['location'];
        $supose=new ItemList(glob($absolute.'/Model/Entity/*.php'));
       
        $supose->each(function($key,$value,$list) use ($bundle){
            $class=new ItemList();
            $name=explode($bundle,$value);
            $name=$name[1];
            $class->set('class',$bundle.$name);
            $className=  str_replace('/Model/Entity/','', $name);
            $className=  str_replace('.php','', $className);
            $class->set('class',$bundle.$name);
            $class->set('name',$className);    
            $list->set($key,$class->getArray());
        });
        return $this->JSON($supose);
    }
    /**
     * @Route /gendoctrine/schema/create
     */
    public function createSchemaAction($request) {
        $classes=  $request->post('classes');
        $bundle=  $request->post('name');
        $this->getStore()->generateSchema($bundle,json_decode($classes));
       return $this->show("Schema created");
    }
}

?>
