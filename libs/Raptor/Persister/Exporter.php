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
 * 
 * 
 * La clase Exporter crea y salva un archivo con los datos de la base de datoscon las
 * tablas especificadas, esto es generalmente usado para salvar pequeños montos de datos
 * en formato PHP para garantizar la compativilidad con todos los motores de base de datos
 * [ESTA OPERACION ES SIMILAR A LA RUTINA DE EXPORTACION EN ARRAY PHP DE  PHPMYADMIN ]
 * 
 */
class Exporter {
    private $entities;
    private $tables;
    /**
     *
     * @var Store
     */
    private $store;
    
    
            
    function __construct($store) {
        $this->entities=array();
        $this->tables=array();
        $this->store=$store;
    }
    /**
     * 
     * Setea un array con las entidades que representan las tablas que seran salvadas
     * Estas seran salvadas en un archivo en formato array php
     * 
     * $this->getStore()
     *               ->getExporter()
     *               ->setEntities(array(
     *                   '\examples\exampleBundle\Model\Entity\Persona'
     *               ))
     *               ->save(__DIR__ . '/exportExample.php');
     * 
     * @param array $entities
     * @return \Raptor\Persister\Exporter
     */
    public function setEntities($entities) {
        $this->entities = $entities;
        return $this;
    }
    
    /**
     * 
     * Setea un array con los nombres de las tablas o el comodin (*) para exportarlas todas
     * El comodin para exportar todas las tablas podra ser la palabra reservada (all) o (*)
     * 
     * $this->getStore()
     *               ->getExporter()
     *               ->setTables('*')->save(__DIR__ . '/exportExample.php');
     * 
     * @param array|string $tables
     * @return \Raptor\Persister\Exporter
     */
    public function setTables($tables) {
        if(is_array($tables))
            $this->tables=$tables;
        elseif ($tables==='all' or $tables==='*') {
            $this->tables =$this->store->getManager()->getConnection()->getSchemaManager()->listTableNames();
        }
        return $this;
    }
    /**
     * 
     * Salva los datos con el nombre y ruta especificado
     * 
     * $this->getStore()
     *               ->getExporter()
     *               ->setEntities(array(
     *                   '\examples\exampleBundle\Model\Entity\Persona'
     *               ))
     *               ->save(__DIR__ . '/exportExample.php');
     * 
     * @param string $file nombre del archivo a salvar con los datos
     */
    public function save($file) {
        $definition=array();
        
        foreach ($this->entities as $entity) {
            $meta=$this->store->getManager()->getMetadataFactory()->getMetadataFor($entity);
            $table=$meta->getTableName();
            $association=$meta->associationMappings;
            foreach ($association as $map) {
                if(isset($map['joinTable']) and isset($map['joinTable']['name'])){
                    $mapTable=$map['joinTable']['name'];
                    if(!isset($definition[$mapTable])){
                        $resultmap=$this->store->getManager()->getConnection()->executeQuery("SELECT * FROM $mapTable");
                        $definition[$mapTable]=$resultmap->fetchAll(\PDO::FETCH_ASSOC);
                    }
                }
            }
            $result=$this->store->getManager()->getConnection()->executeQuery("SELECT * FROM $table");
            $definition[$table]=$result->fetchAll(\PDO::FETCH_ASSOC);
        }
        
        foreach ($this->tables as $table) {
            $result=$this->store->getManager()->getConnection()->executeQuery("SELECT * FROM $table");
            $definition[$table]=$result->fetchAll(\PDO::FETCH_ASSOC);
        }
        $time=  date("F d Y h:i:s A");
        file_put_contents($file,"<?php
 /**
  * THIS FILE IS GENERATED BY RAPTOR EXPORTER, TO EASLY UPLOAD THIS FILE AGAIN INTO THE 
  * DATABASE USE THE IMPORTER CLASS.
  * 
  * Generated $time
  */
 
\$create=".  var_export($this->entities,true).";
\$data=".  var_export($definition,true).";

");
    }

    

}

?>
