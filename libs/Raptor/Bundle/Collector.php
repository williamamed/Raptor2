<?php

/**
 * Description of Collector
 * All Right Reserved
 * @author DinoByte
 */
namespace Raptor\Bundle;
use \ReflectionClass;
use \ReflectionProperty;
/**
 * Pobla los atributos de la clase o objeto especificado con los parametros provenientes en el request actual
 */
class Collector {
    /**
     *  Pobla los atributos de la clase o objeto especificado con los parametros provenientes en el request actual
     * @param string|Object $name
     * @param \Raptor\Util\ItemList $request
     * @param array $matcher
     * @return mixed
     * @throws \Exception
     */
    static public function run($name,  \Raptor\Util\ItemList $request,$matcher=array()) {

        


        $class = $name;
        $reflectionClass = new ReflectionClass($class);
        $props = $reflectionClass->getProperties(ReflectionProperty::IS_PRIVATE | ReflectionProperty::IS_PUBLIC | ReflectionProperty::IS_PROTECTED);

        foreach ($props as $prop) {
           
            if($request->keyExist($prop->getName())){
                $prop->setAccessible(true);
                $prop->setValue($class,  Collector::validator($request->get($prop->getName())));
            }
        }
        
        foreach ($matcher as $key=>$match) {
            
            if ($reflectionClass->hasProperty($key) and $request->keyExist($match)) {
                $reflectionClass->getProperty($key)->setAccessible(true);
                $reflectionClass->getProperty($key)->setValue($class, $request->get($match));
            }else{
                throw new \Exception("Reflection Error: the $key match does not exist in the class ");
            }
        }
        return $class;
    }
    /**
     * [USO INTERNO DEL SISTEMA]
     * @param type $value
     * @return boolean
     */
    static public function validator($value) {
        if($value==='true')
            return true;
        if($value==='false')
            return false;
        return $value;
    }

}

?>
