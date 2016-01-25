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
namespace Raptor\Persister;
/**
 * TableDependencyOrder return the order of schema creation
 * to avoid the dependency issue about associations
 * 
 */
class TableDependencyOrder {
    
    private $tables;
    /**
     *
     * @var Store
     */
    private $store;
    /**
     * 
     * @param array $tables The table name to order
     * @param type $store
     */
    function __construct(array $tables,$store) {
        $this->tables = $tables;
        $this->store=$store;
    }
    /**
     * 
     * @return array An array of ordered schemas
     */
    public function getOrder() {
        $order=array();
        foreach ($this->tables as $table) {
            $many=$this->store->getManager()->getConnection()->getSchemaManager()->listTableForeignKeys($table);
            if(count($many)>0){
                $this->recursive($many, $order);
                if(!isset($order[$table]))
                    $order[$table]=$table;
            }else{
                if(!isset($order[$table]))
                    $order[$table]=$table;
            }
        }
        return $order;
  
    }
    
    private function recursive($foreign,&$order) {
        
        foreach ($foreign as $f) {
            $many=$this->store->getManager()->getConnection()->getSchemaManager()->listTableForeignKeys($f->getForeignTableName());
            if(count($many)>0){
                $this->recursive($many, $order);
                if(!isset($order[$f->getForeignTableName()]))
                    $order[$f->getForeignTableName()]=$f->getForeignTableName();
            }else{
                if(!isset($order[$f->getForeignTableName()]))
                    $order[$f->getForeignTableName()]=$f->getForeignTableName();
            }
        }
    }

}

?>
