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
 * The cache create a way of local storage
 * in the app/cache directory
 */
class Cache {
    private $name;
    private $data;
    private $update;
    private $instanceCache;
    /**
     * The name and identification in the cache directory
     * @param string $name
     */
    function __construct($name) {
        $this->name = $name;
        $this->instanceCache = null;
        $this->load();
    }

    /**
     * Return TRUE if exist a cache config for this actual name
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
     * Put the data to save into the CacheConfig
     * @param mixed $data
     */
    public function setData($data) {
        $this->data = $data;
        $this->update = true;
    }

    /**
     * Set the state of the cache config, 
     * TRUE to non updated and else if was update
     * @param type $update
     */
    public function setUpdate($update) {
        $this->update = $update;
    }
    /**
     * Mark this cache has dirty
     * 
     */
    public function setDirty() {
        $this->update = false;
    }

    /**
     * Return true is this Cache is
     * marked has dirty
     * 
     */
    public function isDirty() {
        return !$this->update;
    }

    /**
     * Return the state of the cache config, 
     * TRUE to non updated and else if was update
     * @return boolean
     */
    public function getUpdate() {
        return $this->update;
    }

    /**
     * Return TRUE if the load operation success, to suucces most exist
     * a cache config to this name and loaded correctly, otherwise return false
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
     * Perform a save operation, save the data and state in the cache
     */
    public function save() {
        $cache = Location::get(\Raptor\Core\Location::CACHE);
        if (!file_exists($cache . DIRECTORY_SEPARATOR . $this->name))
            mkdir($cache . DIRECTORY_SEPARATOR . $this->name);
        $this->instanceCache=NULL;
        file_put_contents($cache . DIRECTORY_SEPARATOR . $this->name . DIRECTORY_SEPARATOR . '52753' . $this->name, serialize($this), LOCK_EX);
        
    }

    /**
     * Return the data contained in cache
     * @return mixed
     */
    public function getData() {
        return $this->data;
    }

}

?>
