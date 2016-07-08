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
namespace Raptor\Bundle\Controller;
use Raptor\Util\ItemList;
use Raptor\Bundle\Collector;
/**
 * Clase controladora de los bundles del sistema
 *
 * 
 */
class Controller {
    const INFO = 1;
    const QUESTION = 2;
    const ERROR = 3;
    const WAIT = 4;
    const EXCEPTION = 5;
    const DATA = 6;
    /**
     * Access to Raptor App
     * @var \Raptor\Raptor
     */
    protected $app;
    /**
     * Retorna la instancia a la clase principal de la aplicacion
     * 
     * @return \Raptor\Raptor
     */
    public function getApp() {
        return $this->app;
    }
            
    function __construct() {
        $this->app = \Raptor\Raptor::getInstance();
    }
    /**
     * Inyector de dependencias
     * 
     * Retorna la instancia de la clase registrada anteriormente por 
     * Raptor a traves de su nombre de clase.
     * 
     * Para llamar una clase a traves de esta funcion es necesario haberla registrado
     * anteriormente. Si la clase no existe en el lanzara una exception
     * 
     * 
     * @param string $class El nombre de la clase que sera obtenida del contenedor de dependencias
     * @return object A intance of the specified class
     */
    public function get($class) {
        return $this->app->getInyector()->get($class);
    }
    
    /**
     * Este es un Alias para extMessage, retorna un mensaje en el formato SON especificado por Extjs
     * 
     * Valores de respuesta de mensajes :
     * 
     * Controller::INFO indica mostrar un mensaje de informacion
     * Controller::QUESTION indica mostrar un mesaje de pregunta
     * Controller::ERROR indica mostrar un mesaje de error
     * Controller::WAIT indica mostrar un mesaje de espera
     * Controller::EXCEPTION indica mostrar un mesaje de excepcion con su respectiva traza, la traza debe 
     * ser especificada en $other param
     * 
     * @param string $msg Mensaje a enviar hacia la vista
     * @param boolean $success establece si la ccion fue relizada correctamente, por defecto en true
     * @param integer $cod Indica a la vista el tipo de mensaje a mostrar
     * @param array $other Array asociativo con un grupo de parametros adicionales a enviar en la respuesta de este mensaje, por ejemplo trzas de una excepcion (e.i array('trace'=>'this is the content of the trace') )
     * 
     */
    public function show($msg, $success = true, $cod = Controller::INFO, $other = array()) {
        $msgObj = new ItemList();
        $msgObj->set('msg', $msg);
        $msgObj->set('success', $success);
        $msgObj->set('cod', $cod);
        foreach ($other as $key => $value) {
            $msgObj->set($key,$value);
        }
        $this->app->contentType(\Raptor\Raptor::JSON);
        return $msgObj->toJson();
    }
    
    /**
     * Manda a renderizar una plantilla twig con sus parametros
     * 
     * $this->render('@exampleBundle/index.twig');
     * 
     * @param string $template La ruta de la plantilla relativa la carpeta Views del bundle especificado
     * @param array $arguments Un array de parametros a pàsar a la plantilla
     * @param int $status codigo del rensponse
     * @return string
     */
    public function render($template, $arguments = array(), $status = NULL) {
        return \Raptor\Raptor::getInstance()->render($template, $arguments, $status);
    }
    
    /**
     * 
     * Retorna el texto del tag especificado en el idioma actual del sistema.
     * 
     * Si el tag o el idioma no han sido definidos devuelve una cadena vacia
     * 
     * @param string $tag
     * @param string $scope Espacio de variables del bundle donde se ejecutara la accion de lectura
     * @return string
     */
    public function lang($tag, $scope = null) {
        return \Raptor\Raptor::getInstance()->getLanguage()->getBundleLanguage($tag, $scope);
    }
    /**
     * Establece el lenguaje definido en el navegador 
     */
    public function setPreferedLanguage() {
        $this->app->getLanguage()->setUserPreferedLanguage();
    }
    /**
     * Retorna el request activo para la peticion actual
     * 
     * @return \Slim\Http\Request
     */
    public function getRequest() {
        return $this->app->request();
    }
    /**
     * Retorna el manejador de persistencia para esta aplicacion(Doctrine ORM)
     * 
     * @return \Raptor\Persister\Store
     */
    public function getStore() {
        return $this->app->getStore();
    }
    
    /**
     * Retorna el manejador de Doctrine ORM
     * 
     * @return \Doctrine\ORM\EntityManager
     */
    public function getStoreManager() {
        return $this->app->getStore()->getManager();
    }
    
    /**
     * Retorna el SessionStore del usuario autenticado
     * 
     * @return \Raptor\Security\Sessions\SessionStore
     */
    public function getSecurityUser() {
        return new \Raptor\Security\Sessions\SessionStore();
    }

    /**
     * Redirecciona hacia el nombre de ruta especificado
     * 
     * Podra redireccionarse por nombre de ruta o por URL, para
     * redireccionar a una URL el segundo parametro debera ser false
     * 
     * @param string $routeName EL nombre de ruta de Raptor
     * @param boolean $isName Establece si el primer paremetro es un nombre de ruta o una URL, por defecto en true(nombre de ruta)
     * @param int $status Codigo de la redireccion
     * @throws \Exception
     */
    public function redirect($routeName, $isName = true, $status = 302) {
        if ($isName == true) {
            $route = $this->app->router()->getNamedRoute($routeName);

            if ($route != NULL) {
                
                $this->app->redirect($this->app->request()->getScriptName().$route->getPattern(), $status);
            } else {
                throw new \Exception("The route name ( $routeName ) do not exist", 3);
            }
        } else {
           $this->app->redirect($routeName, $status);
        }
    }

    /**
     * Verifica si la peticion actual contiene y es valido el token de proteccion CSRF 
     * 
     * @return boolean
     * @throws \Raptor\Exception\Csrf
     */
    public function hasCsrfProtection() {
        if ($this->app->getSecurity()->verifyToken($this->app->request()->params('token')))
            return true;
        else {
            throw new \Raptor\Exception\Csrf("The Token specified in the request object is invalid<br>Espected: ".$this->app->getSecurity()->getToken()."<br> This given: ".$this->app->request()->params('token'));
        }
    }

    /**
     * 
     * Mueve el archivo subido en la peticion actual a la locacion especificada
     * 
     * @param string $name Nombre del parametro del archivo(e.i $_FILES['icon'] icon es el nombre del parametro )
     * 
     * @param string $dir Nombre y ruta donde sera movido el archivo
     * @return boolean Retorna true si el archivo fue movido, false sino fue movido
     */
    public function moveUploadFileTo($name, $dir) {
        if ($_FILES[$name] and $_FILES[$name]['tmp_name'])
            return move_uploaded_file($_FILES[$name]['tmp_name'], $dir);
    }
    
    /**
     * Este metodo es usado para enviar datos desde el lado del servidor al cliente en formato JSON,
     * establece el contentType apropiado para la respuesta
     * 
     * @param array|ItemList $data Array asociativo con los datos a enviar
     */
    public function JSON($data) {
        if ($data instanceof ItemList)
            $msgObj = $data;
        else
            $msgObj = new ItemList($data);
        $this->app->contentType(\Raptor\Raptor::JSON);
        return $msgObj->toJson();
    }

    /**
     * Este metodo es usado para enviar datos desde el lado del servidor al cliente en formato JSON,
     * establece el contentType apropiado para la respuesta
     * 
     * @param array|ItemList $data Array asociativo con los datos a enviar
     */
    public function data($data) {
        $cod = Controller::DATA;
        $msgObj = new ItemList();
        
        $msgObj->set('success', true);
        $msgObj->set('cod', $cod);
        foreach ($data as $key => $value) {
            $msgObj->set($key, $value);
        }
        
        $this->app->contentType(\Raptor\Raptor::JSON);
        return $msgObj->toJson();
    }

    /**
     * Pobla los atributos de la clase o objeto especificado con los parametros provenientes en el request actual
     * 
     * Si el primer parametro es una clase el colector crea un instancia de esta.
     * Si el primer paremtro es un objeto lo usa para poblar segun los parametros del request.
     * 
     * @param string/object $class clase u objeto a poblar
     * @param array $matcher un array con el macheo de parametros que no conciden con los atributos de la clase. ejemplo array('nombre'=>'nombre_c') en el ejemplo nombre es el parametro que viene en el request y nombre_c el que esta en la clase, el colector pone el valor de nombre en nombre_c
     * @return mixed
     */
    public function collector($class,$matcher = array()) {
        $classTo = $class;
        if (!is_object($classTo)) {
            $alias = new ItemList(explode(':', $classTo));
            if ($alias->size() > 1) {
                $classTo = $alias->get(0);
                $namespace = $this->getStore()->getManager()->getConfiguration()->getEntityNamespace($classTo);
                $namespace.='\\' . $alias->get(1);
                $classTo = $namespace;
            }
            $classTo = new $classTo();
        }
        
        return Collector::run($classTo, new ItemList($this->app->request()->params()), $matcher);
    }

    /**
     * Retorna una instancia del manejador de servicios
     * 
     * @return \Raptor\Core\Service
     */
    public function service() {
        return new \Raptor\Core\Service();
    }

}
?>
