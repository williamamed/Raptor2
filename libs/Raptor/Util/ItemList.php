<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of List
 *
 * @author DinoByte
 */
namespace Raptor\Util;
use \Exception;
use Wingu\OctopusCore\Reflection\ReflectionClass;
use Wingu\OctopusCore\Reflection\ReflectionProperty;
/**
 * Clase utilitarias para el manejo de array de forma integrada, esta clase implementa
 *  Iterator y puede considerarse Iterable
 */
class ItemList extends \Slim\Helper\Set {

    private $converted;

    function __construct($items=array()) {
        parent::__construct($items);
        $this->converted=false;
    }
    /**
     * Añade un elemento a la lista
     *
     * @param mixed $item
     * 
     */
    public function add($item) {
        $this->data[] = $item;
    }
    
    /**
     * Extrae un elemento del comienzo de la lista 
     * @return mixed el elemento, NULL si la lista esta vacia
     */
    public function shift() {
       return array_shift($this->data);
    }
    /**
     * Extrae el último elemento de la lista
     * @return mixed el elemento, NULL si la lista esta vacia
     */
    public function pop() {
        return array_pop($this->data);
    }

    /**
     *
     * Retorna TRUE si la lista esta vacia
     * 
      * @return boolean
     */
    public function isEmty() {
        if (empty($this->data))
            return true;
        else
            return false;
    }
    
     /**
     * Remueve un elemento en la posicion dada
     * 
     * @param string/number $pos la llave del valor
     */
    public function remove($pos) {
        
        if (!isset($this->data[$pos]))
            throw new Exception("ItemList index out of range with key: $pos");
        else{
            unset($this->data[$pos]);
        }
        
    }
   
    /**
     * Itera en la lista con la funcion especificada
     * En cada iteracion se ejecuta la funcion
     * La funcion a ejecutar recibe 2 parametros
     * El primer parametro la llave actual y el segundo el valor actual
     * 
     * Ejemplo:
     * 
     * $list=new ItemList();
     * 
     * $list->add('Frank');
     * 
     * $list->add('Eva');
     * 
     * $result='';
     * 
     * $list->each(function($key,$value) use (&$result){
     * 
     *      $result.=$value.'-';
     * 
     * });
     * 
     * echo $result;
     * 
     * The example produce the following result:<br>
     * Frank-
     * Eva
     * @param callable $function la funcion a ejecutar en cada iteracion
     */
    public function each(callable $function) {
       
        foreach ($this->data as $key => $value) {
            //$function($key,$value,$this);
            call_user_func_array($function,array($key,&$this->data[$key],&$this));
        }
    }
    
    public function filter(callable $function) {
        return new ItemList(array_filter($this->data, $function));
    }
    /**
     * 
     * Retorna el array asociado a esta lista
     * @return array
     */
    public function getArray() {
       return $this->data;
    }
    
    /**
     * 
     * Setea un array para esta lista
     * @param array $collection el array que para ser usado como lista
     */
    public function setArray($collection) {
        $this->data = $collection;
    }
     /**
     * 
     * Devuelve el tamaño de esta lista, representa el numero de items contenido en la lista 
     * @return number
     * 
     */
    public function size() {
        return count($this->data);
    }
    /**
     * Convina la lista actual con el array pasado por parametro
     * Si el parametro $change es TRUE entonces el resultado de la convinacion
     * es aplicada a la lista actual
     * 
     * @return array el resultado de la operacion
     * @param array $array el array que sera convinado
     * @param boolean $change establece si la operacion actual afecta la lista
     * 
     */
    public function merge($array,$change=false) {
        if($change){
            $this->data = array_merge($array, $this->data);
            return $this->data;
        }else
            return array_merge($array, $this->data);
    }
    
    /**
     * * Convierte los elementos de la lista en array
     * [ESTA ES UNA FUNCION UTILITARIA]
     * 
     * Si los elementos de la lista son instancias entonces trataran de ser convertidos
     * a su equivalente en arrays, si las instancias contienen recursivamente otros objetos
     * estos no seran covertidos, esta funcion solo llega hasta el primer nivel. Para convertir
     * las restantes instancias que pertenecen a las del primer nivel usted devera usar la 
     * funcion callback
     * 
     * La funcion callback recibe 2 parametros, el primero una referencia al objeto actual de
     * la iteracion y el segundo la lista en si, puede modificar la referencia del elemento actual
     * por ejemplo para objeto de un segundo nivel
     * 
     * Ejemplo de conversion de una instancia de entidad Rol a solo el id del rol:
     * 
     * $users->toArray(function(&$item,$lista){
     * 
     * $item['idRol'] = $item['idRol']->getId();
     * 
     * })
     * 
     * 
     * Ejemplo 2:
     * 
     * class Man {
     * 
     * private $name;
     * 
     * private $age;
     * 
     * function __construct($name,$age) {
     * 
     *  $this->name=$name;
     * 
     *  $this->age=$age;
     * 
     *  }
     * 
     * }
     * 
     * $frank=new Man('Frank',30);
     * 
     * $eva=new Man('Eva',25);
     * 
     * $list=new ItemList();
     * 
     * $list->add($frank);
     * 
     * $list->add($eva);
     * 
     * print_r($list->toArray());
     * 
     * Esto producira los siguientes resultados:
     * 
     *  array(
     * 
     *     array('name'=>'Frank','age'=>30),
     * 
     *     array('name'=>'Eva','age'=>25)
     * 
     *  )
     * @param function $callback funcion a ejecutar en cada elemento
     * @return array
     */
    public function toArray($callback=null) {
        
        $this->converted=true;
        foreach ($this->data as $key => $value) {
            if(is_object($value)){
               if (method_exists($value, "__load")) {
                    $value->__load();
               }
               $this->data[$key] = $this->convertObject($value);
                
            }
            if(is_callable($callback)){
//                   $callback($this->data[$key]);
                   call_user_func_array($callback,array(&$this->data[$key],&$this));
            }
        }
        return $this->data;
    }
    
    private function convertObject($obj) {
                $reflect = new ReflectionClass($obj);
                $props   = $reflect->getProperties(ReflectionProperty::IS_PUBLIC | ReflectionProperty::IS_PROTECTED | ReflectionProperty::IS_PRIVATE);
                $item=array();
                $parent=$reflect->getParentClass();
                if($parent)
                    $item= array_merge($item,$this->lookProperties($parent,$obj));
                foreach ($props as $prop) {
                    $prop->setAccessible(true);
                    $property=$prop->getValue($obj);
                    $item[$prop->getName()] = $property;
        }

              
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
                    $item[$prop->getName()] = $property;
        }
               return $item;
    }




    /**
     * 
     * Convierte a JSON la lista actual
     * @return String 
     */
    public function toJson() {
        if($this->converted==false)
            $this->toArray();
        return json_encode($this->data);
    }
    
    /**
     * 
     * Une los elementos de esta listam por el texto especificado
     * 
     * @param string $glue el texto que unira todos los elemntos de la lista
     * @return String 
     */
    public function join($glue='') {
        return join($glue, $this->data);
    }
    
    /**
     * 
     * Retorna TRUE si la llave especificado existe en la lista
     * @param string $key la llave
     * @return boolean
     */
    public function keyExist($key) {
        return array_key_exists($key, $this->data);
    }
    
    /**
     * 
     * Retorna TRUE si el valor especificado existe en la lista
     * @param string $value el valor
     * @return boolean
     */
    public function valueExist($value) {
        foreach ($this->data as $key => $valueItem) {
            if($valueItem==$value)
                return true;
        }
        return false;
    }
    
    /**
     * Extrae una porcion de la lista
     * 
     * @param integer $offset el inicio
     * @param integer $length el final
     * @return array
     */
    public function extract($offset,$length) {
        return array_slice($this->data, $offset, $length);
    }

}
?>
