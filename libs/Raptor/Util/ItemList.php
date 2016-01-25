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

class ItemList extends \Slim\Helper\Set {

    private $converted;

    function __construct($items=array()) {
        parent::__construct($items);
        $this->converted=false;
    }
    /**
     * add a Item to the ItemList
     *
     * @param mixed $item
     * 
     */
    public function add($item) {
        $this->data[] = $item;
    }
    
    /**
     * Shift the first element of this List
     * @return mixed the element, NULL if the list is empty
     */
    public function shift() {
       return array_shift($this->data);
    }
    /**
     * Pop the last element of this List
     * @return mixed the element, NULL if the List is empty
     */
    public function pop() {
        return array_pop($this->data);
    }

    /**
     * Return if the ItemList is empty
     * True if the list is empty, false otherwise 
      * @return boolean
     */
    public function isEmty() {
        if (empty($this->data))
            return true;
        else
            return false;
    }
    
     /**
     * Remove a value in the given pos
     * 
     * @param string/number $pos The key of the value 
     */
    public function remove($pos) {
        
        if (!isset($this->data[$pos]))
            throw new Exception("ItemList index out of range with key: $pos");
        else{
            unset($this->data[$pos]);
        }
        
    }
   
    /**
     * Iterate in the ItemList with the given function,
     * in each iteration execute the given function
     * 
     * @param callable $function this is the function to execute in each iteration,
     * the function has two parameters, first: the current key, second: the current value.<br><br>
     *  Here is an inline example:
     * <pre><code>
     * $list=new ItemList();
     * $list->add('Frank');
     * $list->add('Eva');
     * $result='';
     * $list->each(function($key,$value) use (&$result){
     *      &nbsp;$result.=$value.'-';
     * });
     * echo $result;
     * </code></pre>
     * The example produce the following result:<br>
     * Frank-
     * Eva
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
     * Return the asociated array of ItemList
     * 
     * @return array
     */
    public function getArray() {
       return $this->data;
    }
    
    /**
     * Set the array collection to the ItemList
     * 
     * @param array $collection The array to be used
     */
    public function setArray($collection) {
        $this->data = $collection;
    }
     /**
     * Get the size of ItemList, represent the number of items contained in the list
     * @return number The number of items in the ItemList
     * 
     */
    public function size() {
        return count($this->data);
    }
    /**
     * Merge the current ItemList, with the given array, if the
     * $change parameter is true, then the merge result will be aplied to the
     * current ItemList. If $change parameter is false, the change will be only
     * in the returned array.  
     * @return array The merge result of operation
     * @param array $array The array to be merge
     * @param boolean $change establish if the operation afect the current ItemList
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
     * This is an utility function.<br>
     * If the items in the ItemList are Objects, then are converted in
     * array ignoring every function or method containing in the object, only will be included
     * in coversion all the atributes in any state(private, protected or public), if an atribute is
     * a other object, then is incluted bot not converted, is your responsability stablish wich atribute of
     * that object you use, replacing them using the functions of ItemList
     * @return array 
     * 
     * <br><br>
     *  Here is an inline example:
     * <pre><code>
     * class Man {
     * &nbsp;&nbsp;private $name;
     * &nbsp;&nbsp;private $age;
     * &nbsp;function __construct($name,$age) {
     *  &nbsp;&nbsp;$this->name=$name;
     *  &nbsp;&nbsp;$this->age=$age;
     *  &nbsp;}
     * }
     * 
     * $frank=new Man('Frank',30);
     * $eva=new Man('Eva',25);
     * 
     * $list=new ItemList();
     * $list->add($frank);
     * $list->add($eva);
     * 
     * print_r($list->toArray());
     * 
     * The example produce the following result:<br>
     *  array(
     *      &nbsp;array('name'=>'Frank','age'=>30),
     *      &nbsp;array('name'=>'Eva','age'=>25)
     *  )
     * </code></pre>
     * 
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
     * Convert to JSON the current ItemList
     * 
     * @return String The current ItemList converted to JSON
     */
    public function toJson() {
        if($this->converted==false)
            $this->toArray();
        return json_encode($this->data);
    }
    
    /**
     * Join the items of the List by the given glue to a string
     * 
     * @param string $glue the glue to unite the items of list
     * @return String The current ItemList converted to JSON
     */
    public function join($glue='') {
        return join($glue, $this->data);
    }
    
    /**
     * Return true if the given key exist in the list
     * 
     * @param string $key the key
     * @return boolean
     */
    public function keyExist($key) {
        return array_key_exists($key, $this->data);
    }
    
    /**
     * Return true if the given value exist in the list
     * 
     * @param string $value the value
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
     * Extract a portion of the list
     * 
     * @param integer $offset the value
     * @param integer $length the value
     * @return array
     */
    public function extract($offset,$length) {
        return array_slice($this->data, $offset, $length);
    }

}
?>
