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

/**
 * Read from a cache file the stablish
 * configuration in app
 *
 * 
 */

namespace Raptor\Cache;
use Raptor\Core\Location;
/**
 * La cache crea un forma de almacenamiento de infomacion local en el directorio app/cache
 */
class Cache {
    private $name;
    private $data;
    private $update;
    private $instanceCache;
    private $variables;
    /**
     * El nombre e indetificacion en el directorio cache
     * @param string $name
     */
    function __construct($name) {
        $this->name = $name;
        $this->instanceCache = null;
        $this->variables = array();
        $this->load();
    }
    /**
     * 
     * @param string $key
     * @param string $var
     * @param int $ttl
     */
    private function add($key,$var,$ttl=0) {
        $this->variables[$key]=array('ttl'=>$ttl,'value'=>$var);
    }


    /**
     * Retorna true si existe una configuracion cache para el nombre actual
     * 
     * @return boolean
     */
    public function hasCache() {
        $cache = Location::get(\Raptor\Core\Location::CACHE);
        if (!file_exists($cache . DIRECTORY_SEPARATOR . $this->name . DIRECTORY_SEPARATOR . '52753' . $this->name)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 
     * Establece los datos a salvar dentro de la cache
     * @param mixed $data los datos a salvar
     */
    public function setData($data) {
        $this->data = $data;
        $this->update = true;
    }

    /**
     * 
     * Setea el estado de la cache, TRUE para actualizada y false en caso contrario
     * @param type $update
     */
    public function setUpdate($update) {
        $this->update = $update;
    }
    /**
     * Marca esta cache como sucia o no actualizada
     * 
     */
    public function setDirty() {
        $this->update = false;
    }

    /**
     * Retorna TRUE si esta cache ha sido marca como sucia o no actualizada
     * 
     */
    public function isDirty() {
        return !$this->update;
    }

    /**
     * 
     * Retorna el estado de la cache, TRUE para actualizada y FALSE en caso contrario
     * @return boolean
     */
    public function getUpdate() {
        return $this->update;
    }

    /**
     * 
     * Retorna TRUE si la operacion fue correctamente realizada
     * Para que la operacion sea tatisfactoria la cache para este nombre debe de existir
     * @return boolean
     */
    public function load() {
        $cache = Location::get(\Raptor\Core\Location::CACHE);
        if ($this->hasCache()) {
            $file = file_get_contents($cache . DIRECTORY_SEPARATOR . $this->name . DIRECTORY_SEPARATOR . '52753' . $this->name);
            $this->instanceCache = unserialize($file);
            $this->data = $this->instanceCache->getData();
            $this->update = $this->instanceCache->getUpdate();
            return true;
        } else {
            $this->update = false;
            return false;
        }
    }

    /**
     * 
     * Realiza una operacion de salvado, salva los datos y el estado especificado
     */
    public function save() {
        $cache = Location::get(\Raptor\Core\Location::CACHE);
        if (!file_exists($cache . DIRECTORY_SEPARATOR . $this->name))
            mkdir($cache . DIRECTORY_SEPARATOR . $this->name);
        $this->instanceCache=NULL;
        file_put_contents($cache . DIRECTORY_SEPARATOR . $this->name . DIRECTORY_SEPARATOR . '52753' . $this->name, serialize($this), LOCK_EX);
        
    }

    /**
     * Retorna los datos contenidos en la cache
     * $cache = new \Raptor\Cache\Cache('testing');
     *  if ($cache->isDirty()) {
     *      $cache->setData(array('mis_opciones'));
     *      $cache->save();
     *  }
     * @return mixed
     */
    public function getData() {
        return $this->data;
    }

}

?>
