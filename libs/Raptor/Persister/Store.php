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

use Doctrine\ORM\Tools\EntityGenerator;
use Doctrine\ORM\Tools\EntityRepositoryGenerator;
use Raptor\Util\ItemList;

/**
 * 
 * The Store Class give access to your model files and database
 * using Doctrine ORM
 * 
 */
class Store extends \Slim\Middleware {

    protected $options;
    protected $bundlesDirs;

    /**
     * the Entity manager.
     *
     * @var \Doctrine\ORM\EntityManager
     */
    protected $entityManager;
    protected $annotations;
    protected $namespaceSeparator = '\\';
    private $state;
    
    function __construct() {
        $this->registerAutoload();
        $this->state=false;
    }

    public function call() {
        $this->connect();
        $this->app->setStore($this);
        $this->next->call();
    }

    public static function registerAutoload() {
        \Doctrine\ORM\Tools\Setup::registerAutoloadDirectory(__DIR__ . '/../../Doctrine');
    }

    public function registerClassLoader() {
        $classLoader = new \Doctrine\Common\ClassLoader('Proxies', \Raptor\Core\Location::get(\Raptor\Core\Location::CACHE) . '/d0374123');
        $classLoader->register();
    }
    /**
     * get the state of the Store, true connected and false otherwise
     * @return boolean
     */
    public function getState() {
        return $this->state;
    }
    /**
     * Connect Doctrine with the specificated params of connections
     */
    public function connect() {
        $op = $this->app->getConfigurationLoader()->getOptions();
        if (isset($op['options']['database'])) {
            $this->options = $op['options']['database'];
            $this->options['bundles'] = $op['bundles'];
            $this->options['specifications'] = $op['specifications'];
        }else
            $this->state=false;
        $this->registerClassLoader();
        $config = new \Doctrine\ORM\Configuration();

        if (!file_exists(\Raptor\Core\Location::get(\Raptor\Core\Location::CACHE) . '/d0374123/Proxies'))
            mkdir(\Raptor\Core\Location::get(\Raptor\Core\Location::CACHE) . '/d0374123/Proxies', 0777, true);
        $config->setProxyDir(\Raptor\Core\Location::get(\Raptor\Core\Location::CACHE) . '/d0374123/Proxies');
        $config->setProxyNamespace('Proxies');
//        $config->setAutoGenerateProxyClasses(($this->app->getMode() == "development"));
        $config->setAutoGenerateProxyClasses($this->app->config('debug'));
        
        $annotations = array();
        $definitions = new ItemList($this->options['specifications']);

        $definitions->each(function($key, $value) use (&$config, &$annotations) {
                    $config->addEntityNamespace($key, $value['namespace'] . '\\Model\\Entity');
                    $annotations[] = $value['location'];
                });

        $driverImpl = $config->newDefaultAnnotationDriver($annotations);
        $this->annotations = $annotations;
        $config->setMetadataDriverImpl($driverImpl);

        //Until the development of the RaptorCache
        if (true or $this->app->getMode() == "development") {
            $cache = new \Doctrine\Common\Cache\ArrayCache();
        } else {
            $cache = new \Doctrine\Common\Cache\ApcCache();
        }

        $config->setMetadataCacheImpl($cache);
        $config->setQueryCacheImpl($cache);
        
        $connectionOptions = array(
            'driver' => $this->options['driver'],
            'dbname' => $this->options['dbname'],
            'user' => $this->options['user'],
            'password' => $this->options['password'],
            'port' => $this->options['port'],
            'host' => $this->options['host']);


        $em = \Doctrine\ORM\EntityManager::create($connectionOptions, $config);
        

        $helperSet = new \Symfony\Component\Console\Helper\HelperSet(array(
            'db' => new \Doctrine\DBAL\Tools\Console\Helper\ConnectionHelper($em->getConnection()),
            'em' => new \Doctrine\ORM\Tools\Console\Helper\EntityManagerHelper($em)
        ));
        $this->entityManager = $em;
        $this->state=true;
    }

    /**
     * Return the Dcotrine Entity Manager for this
     * connection
     * @return \Doctrine\ORM\EntityManager
     */
    public function getManager() {
        return $this->entityManager;
    }
    /**
     * Exporter make and save a file data from the database with the tables especified
     * @return \Raptor\Persister\Exporter
     */
    public function getExporter() {
        return new Exporter($this);
    }
    /**
     * Importer upload a data file previusly save with the Exporter class into the database 
     * @return \Raptor\Persister\Importer
     */
    public function getImporter() {
        return new Importer($this);
    }
    /**
     * Get all the schemas database
     * @return array
     */
    public function getSchemaClass() {
        $this->entityManager->getConnection()->getDatabasePlatform()->registerDoctrineTypeMapping('set', 'string');
        $this->entityManager->getConnection()->getDatabasePlatform()->registerDoctrineTypeMapping('enum', 'string');

        // fetch metadata
        $driver = new \Doctrine\ORM\Mapping\Driver\DatabaseDriver(
                $this->entityManager->getConnection()->getSchemaManager()
        );

        $this->entityManager->getConfiguration()->setMetadataDriverImpl($driver);
        $cmf = new \Doctrine\ORM\Tools\DisconnectedClassMetadataFactory();
        $cmf->setEntityManager($this->entityManager); // we must set the EntityManager

        return $driver->getAllClassNames();
    }

    private function translateSchemas($name) {
        $real = new ItemList(explode('.', $name));
        $real->each(function($k, $v, $l) {
                    $l->set($k, ucfirst($v));
                });

        return $real->join('');
    }

    /**
     * Generate the model class for Raptor
     * @param string $namespace
     * @param array $clases
     */
    public function generateClasses($namespace, $clases) {
        // custom datatypes (not mapped for reverse engineering)
        $this->entityManager->getConnection()->getDatabasePlatform()->registerDoctrineTypeMapping('set', 'string');
        $this->entityManager->getConnection()->getDatabasePlatform()->registerDoctrineTypeMapping('enum', 'string');

// fetch metadata
        $driver = new \Doctrine\ORM\Mapping\Driver\DatabaseDriver(
                $this->entityManager->getConnection()->getSchemaManager()
        );

        $this->entityManager->getConfiguration()->setMetadataDriverImpl($driver);
        $cmf = new \Doctrine\ORM\Tools\DisconnectedClassMetadataFactory();
        $cmf->setEntityManager($this->entityManager); // we must set the EntityManager

        $classes = $driver->getAllClassNames();
        $metadata = array();
        $rep = new EntityRepositoryGenerator();

        foreach ($clases as $class) {
            //any unsupported table/schema could be handled here to exclude some classes

            if (true) {
                $meta = $cmf->getMetadataFor($class);
                $association = new ItemList($meta->associationMappings);
                $me = $this;
                $association->each(function($k, $v, $l) use (&$me) {
                            $v['targetEntity'] = $me->translateSchemas($v['targetEntity']);
                            $v['sourceEntity'] = $me->translateSchemas($v['sourceEntity']);
                            $l->set($k, $v);
                        });
                $meta->associationMappings = $association->getArray();

                $real = $this->translateSchemas($class);

                $meta->name = $namespace . $this->namespaceSeparator . 'Model' . $this->namespaceSeparator . 'Entity' . $this->namespaceSeparator . $real;
                $meta->namespace = $namespace . $this->namespaceSeparator . 'Model' . $this->namespaceSeparator . 'Entity';

                // $meta->namespace='Entities\\'.$class;
                $meta->customRepositoryClassName = $namespace . $this->namespaceSeparator . 'Model' . $this->namespaceSeparator . 'Repository' . $this->namespaceSeparator . $real . 'Repository';

                //TODO buscar entidades ya creadas    



                foreach ($meta->associationMappings as $key => $value) {
                    $names = $this->entityManager->getConfiguration()->getEntityNamespaces();
                    $target = $meta->associationMappings[$key]['targetEntity'];
                    $found = false;
                    foreach ($names as $routes) {
                        if ($routes[0] == '\\')
                            $bundleRoute = substr($routes, 1);
                        else
                            $bundleRoute = $routes;
                        $fileroute = __DIR__ . "/../../../src/" . str_replace('\\', DIRECTORY_SEPARATOR, $bundleRoute);
                        $fileroute.=DIRECTORY_SEPARATOR . $target . ".php";


                        if (file_exists($fileroute)) {
                            $found = true;
                            $target = substr($routes, 1) . $this->namespaceSeparator . $value['targetEntity'];
                        }
                    }
                    if ($found) {
                        //$target = $namespace . $this->namespaceSeparator . 'Entity' . $this->namespaceSeparator . $value['targetEntity'];
                        $meta->associationMappings[$key]['targetEntity'] = $target;
                    } else {
                        $meta->associationMappings[$key]['targetEntity'] = $namespace . $this->namespaceSeparator . 'Model' . $this->namespaceSeparator . 'Entity' . $this->namespaceSeparator . $value['targetEntity'];
                    }
                }
                $metadata[] = $meta;

                $rep->writeEntityRepositoryClass(
                        $namespace . $this->namespaceSeparator . 'Model' . $this->namespaceSeparator . 'Repository' . $this->namespaceSeparator . $real . 'Repository', \Raptor\Core\Location::get(\Raptor\Core\Location::SRC));
            }
        }

        $generator = new EntityGenerator();
        $generator->setAnnotationPrefix('');   // edit: quick fix for No Metadata Classes to process
        $generator->setUpdateEntityIfExists(true); // only update if class already exists
        $generator->setRegenerateEntityIfExists(true); // this will overwrite the existing classes
        $generator->setGenerateStubMethods(true);
        $generator->setGenerateAnnotations(true);
        //$y=new Doctrine\ORM\Tools\Export\Driver\YamlExporter(__DIR__ . '/Entities/yml');
        //$y->setMetadata($metadata);
        //$y->export();
        $generator->generate($metadata, \Raptor\Core\Location::get(\Raptor\Core\Location::SRC));
    }
    
    

    /**
     * Generate the Schema tables for Raptor
     * 
     * @param string $alias
     * @param array $classes
     */
    public function generateSchema($alias, $classes = array()) {
        $schemaTool = new \Doctrine\ORM\Tools\SchemaTool($this->entityManager);
        
        $driver = $this->entityManager->getConfiguration()->newDefaultAnnotationDriver($this->annotations);

        $this->entityManager->getConfiguration()->setMetadataDriverImpl($driver);
        $cmf = new \Doctrine\ORM\Tools\DisconnectedClassMetadataFactory();
        $cmf->setEntityManager($this->entityManager);

        $metaInformation = new ItemList($classes);
        $me = $this;
        $schemas = array();

        $metaInformation->each(function($key, $value, $list) use (&$alias, &$cmf, &$me, &$schemas) {

                    $meta = $cmf->getMetadataFor($alias . ':' . $value);
                    $list->set($key, $meta);
                    $tableDef = explode('.', $meta->table['name']);
                    if (count($tableDef) > 1)
                        $schemas[$tableDef[0]] = $tableDef[0];
                });

               
        $schemaTool->createSchema($metaInformation->getArray());
    }

    /**
     * Generate the database specified if not exist
     * @param string $name
     */
    public function generateDatabase($name) {

        $this->entityManager->getConnection()->executeQuery("CREATE DATABASE IF NOT EXISTS " . $name);
    }

    /**
     * Return tru if the specified class is Valid(for valid must be transient class)
     * @param string $class
     * @return boolean
     */
    public function isValid($class) {
        $cmf = new \Doctrine\ORM\Tools\DisconnectedClassMetadataFactory();
        $cmf->setEntityManager($this->entityManager);
        return $cmf->isTransient($class);
    }

}

?>
