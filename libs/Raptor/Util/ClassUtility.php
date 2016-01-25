<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of ClassUtility
 *
 * @author Amed
 */
namespace Raptor\Util;

use Wingu\OctopusCore\Reflection\ReflectionClass;
use Wingu\OctopusCore\Reflection\ReflectionProperty;

class ClassUtility {
    
   static public function toArray($obj) {
                $reflect = new ReflectionClass($obj);
                $props   = $reflect->getProperties(ReflectionProperty::IS_PUBLIC | ReflectionProperty::IS_PROTECTED | ReflectionProperty::IS_PRIVATE);
                $item=array();
                $parent=$reflect->getParentClass();
                if($parent)
                    $item= array_merge($item,$this->lookProperties($parent,$obj));
                foreach ($props as $prop) {
                    $prop->setAccessible(true);
                    $property=$prop->getValue($obj);
//                    if(!is_object($property))
//                       $item[$prop->getName()]=  '';
//                    else
                       $item[$prop->getName()]=$property;
//                       print_r($property);
//                       echo '<br>';
                }
//                die;
              
               return $item;
    }
    
    private function lookProperties(ReflectionClass $reflect,$obj) {
       
                $props   = $reflect->getProperties(ReflectionProperty::IS_PUBLIC | ReflectionProperty::IS_PROTECTED | ReflectionProperty::IS_PRIVATE);
                $item=array();
                $parent=$reflect->getParentClass();
                if($parent)
                     $item= array_merge($item,$this->lookProperties($parent,$obj));
                foreach ($props as $prop) {
                    $prop->setAccessible(true);
                    $property=$prop->getValue($obj);
//                    if(!is_object($property))
//                       $item[$prop->getName()]=  '';
//                    else
                       $item[$prop->getName()]=$property;
//                       print_r($property);
//                       echo '<br>';
                }
//                die;
               
               return $item;
    }
}

?>
