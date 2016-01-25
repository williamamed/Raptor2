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
 * Description of Controller
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
     * This is the dependency Inyector, return a instance of
     * the given param if exist inside of the dependency container,
     * otherwise a exception is throw.<br>
     * To call a dependency is necesary to difine it in the container.<br>
     * Some classes are defined by default, like Doctrine, Twig, Request.
     * The relevant classes are already defined, you need to add only your
     * your personal classes if you want to used by the dependency inyector.
     * 
     * @param string The name of the class to be inyected
     * @return object A intance of the specified class
     */
    public function get($class) {
        return $this->app->getInyector()->get($class);
    }
    
    /**
     * This is a Alias of extMessage, Return a ExtJs message format response
     * @param string $msg This is the message to send to the view
     * @param boolean $success This represent if the action related was made
     * correctly, by default is <b>true</b>.
     * @param integer $cod Indicates to the view the type of message has to show, 
     * can be diferent values, and the constants that represents the values are:<br> 
     * <b>Controller::INFO</b> indicates to show a information dialog box<br>
     * <b>Controller::QUESTION</b> indicates to show a question dialog box<br>
     * <b>Controller::ERROR</b> indicates to show a error dialog box<br>
     * <b>Controller::WAIT</b> indicates to show a wait dialog box<br>
     * <b>Controller::EXCEPTION</b> indicates to show a exception dialog box with the trace, the trace
     * has to be specified in the $other param<br><br>
     * By default the value is <b>Controller::INFO</b>.
     * @param array $other This is an asociative array of item to atacht to the message, represent
     * others data to send with the message, for example the trace of a exception (e.i array('trace'=>'this is the content of the trace') )
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
     * Call Twig to process the given template with arguments,
     * return a string template, to redirize is necesary to manualy
     * return that string (e.i return $this->render(.....) )
     */
    public function render($template, $arguments = array(), $status = NULL) {
        return \Raptor\Raptor::getInstance()->render($template, $arguments, $status);
    }
    /**
     * Return the string defined to the given tag in the user current language
     * @param string $tag
     * @param string $scope
     * @return string
     */
    public function lang($tag, $scope = null) {
        return \Raptor\Raptor::getInstance()->getLanguage()->getBundleLanguage($tag, $scope);
    }
    /**
     * Set the User prefered Language for the Agent
     */
    public function setPreferedLanguage() {
        $this->app->getLanguage()->setUserPreferedLanguage();
    }
    /**
     * 
     * @return \Slim\Http\Request
     */
    public function getRequest() {
        return $this->app->request();
    }
    /**
     * 
     * @return \Raptor\Persister\Store
     */
    public function getStore() {
        return $this->app->getStore();
    }
    
    /**
     * 
     * @return \Doctrine\ORM\EntityManager
     */
    public function getStoreManager() {
        return $this->app->getStore()->getManager();
    }
    
    /**
     * Return the authenticated user
     * @return \Raptor\Security\Sessions\SessionStore
     */
    public function getSecurityUser() {
        return new \Raptor\Security\Sessions\SessionStore();
    }

    /**
     * Redirect the page to the given route
     * @param string $routeName The Raptor Route Name or Url
     * @param type $isName 
     * @param type $status
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
     * Verify if the active request has a valid csrf token
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
     * Move given Upload File present in the current request,
     * to a specified location
     * 
     * @param string $name This is the param name of the file in the
     * request(e.i $_FILES['icon'] icon is the name of param )
     * 
     * @param string $dir This is the location where the file will be placed
     * @return boolean Return true if the file was copied or false otherwise
     */
    public function moveUploadFileTo($name, $dir) {
        if ($_FILES[$name] and $_FILES[$name]['tmp_name'])
            return move_uploaded_file($_FILES[$name]['tmp_name'], $dir.'/'.$_FILES[$name]['name']);
    }
    
    /**
     * This is used to send data from the server side to the client in JSON FORMAT, 
     * this method set the apropiate content type for this response
     * @param array|ItemList $data This is an asociative array of items to send
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
     * This is used to send data from the server side to the client in JSON FORMAT
     * @param array $other This is an asociative array of items to atach to the message, represent
     * others data to send with the message, for example the trace of a exception (e.i array('trace'=>'this is the content of the trace') )
     */
    public function data($data) {
        $cod = Controller::DATA;
        $msgObj = new ItemList();
        
        $msgObj->set('success', true);
        $msgObj->set('cod', $cod);
        $msgObj->set('cod', $data);
        $this->app->contentType(\Raptor\Raptor::JSON);
        return $msgObj->toJson();
    }

    /**
     * Populate the atributes of the given class or object with parameter from request object.<br>
     * If the first parameter is a string the collector create a instamce of the
     * given name of clases. If the the first parameters is a object, use this object
     * to populate.<br>
     * @param string/object $class Class to populate atributes
     * @param string $request The name of the list of parameters most use in the Request<br>
     * can be: request(POST), query(GET), rest(PUT, DELETE)
     * @param array $matcher If the atributes of the desire class are not equals
     * to the request, is necesary give this specification, this is used to match the atributes.
     * 
     * 
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
     * 
     * 
     * 
     * @return Service Return a instance of the service handler
     */
    public function service() {
        return new \Raptor\Core\Service();
    }

}
?>
