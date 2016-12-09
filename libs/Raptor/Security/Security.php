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
namespace Raptor\Security;

/**
 * This Security Class handle all the protections rutines, storage all
 * the security params
 *
 * 
 */
class Security extends \Slim\Middleware {
    /**
     *
     * @var AbstractSecurityManager
     */
    private $manager;

    
    /**
     * [USADO POR EL SISTEMA]
     */
    public function call() {
        $this->app->setSecurity($this);
        $this->app->hook('slim.after', array($this, 'writeToken'));
        $this->chekingSessionEnviroment();
        $this->app->setSession(new Sessions\NativeSession());
        $this->next->call();
    }
    
    /**
     * 
     * Establece el estado del proceso de idetificacion-autenticacion
     * TRUE para especificar que el usuario actual se encuentra autenticado
     * FALSE en caso contrario
     * @param boolean $state
     */
    public function setAuthenticated($state) {
        if($state)
            $this->getApplication()->getSession()->set('rpt_user_agent', $this->getApplication()->request()->getUserAgent());
        $this->getApplication()->getSession()->set('rpt_auth', $state);
    }
    /**
     * [Atajo de setAuthenticated(true)]
     *  Marca el usuario como autenticado
     * Opcionalmente pueden especificarse los datos a añadir en la sesion del usuario autenticado
     * 
     *
     * @param array $attr atributos del usuario autenticado, esto re-escribira los atributos especificados anteriormente
     */
    public function login($attr=array()) {
        $this->getApplication()->getSession()->set('rpt_user_agent', $this->getApplication()->request()->getUserAgent());
        $this->getApplication()->getSession()->set('rpt_auth', true);
        if((bool)$attr)
            $this->setUser ($attr);
    }
    /**
     * [Atajo de setAuthenticated(false)]
     * Marca el usuario como no autenticado
     * 
     * 
     */
    public function logout() {
        $this->getApplication()->getSession()->set('rpt_auth', false);
    }
    /**
     * 
     * Devuelve el estado del proceso de identificacion-autenticacion
     * @return boolean
     */
    public function isAuthenticated() {
        
        $result=$this->getApplication()->getSession()->get('rpt_auth') == true ? true : false;
        if($result==true and $this->getApplication()->getSession()->get('rpt_user_agent')!==$this->getApplication()->request()->getUserAgent()){
           /**
            * Probably be good to verify the autenticity of the user
            * in this place
            */
            $result=false;
        }
        return $result;
    }
    /**
     * Devuelve el token actual de seguridad, este token corresponde a la proteccion CSRF
     * @return string
     */
    public function getToken() {
        return $this->getApplication()->getSession()->get('rpt_csrf');
    }
    /**
     * 
     * Verifica si el token de seguridad espeficicado es valido
     * Devuelve TRUE si es valido, FALSE en caso contrario
     * 
     * @param string $old token de seguridad a verificar
     * @return boolean
     */
    public function verifyToken($old) {
        $options = $this->app->getConfigurationLoader()->getOptions();
        $secret = '';
        if (isset($options['raptor']) and isset($options['raptor']['secret']))
            $secret = $options['raptor']['secret'];
        return $this->getToken() == $old;
    }
    /**
     * 
     * Escribe un nuevo token para la session actual
     * 
     * [ESTA FUNCION ES USADA INTERNAMENTE POR EL SISTEMA]
     */
    public function writeToken() {
        
        if (!$this->app->request()->isXhr() and strpos($this->app->response()->headers->get('Content-Type'), 'text/html')!==false) {
            $options = $this->app->getConfigurationLoader()->getOptions();
            $secret = '';
            if (isset($options['raptor']) and isset($options['raptor']['secret']))
                $secret = $options['raptor']['secret'];
            $new = session_id();
            $this->getApplication()->getSession()->set('rpt_csrf', md5($secret . $new));
            $this->getApplication()->getSession()->writeSession();

        }
        
    }

    /**
     * 
     * Devuelve el manejador de seguridad para esta aplicacion
     * El Manejador de seguridad implementa Route\Rule y extiende de AbstractSecurityManager
     * @return AbstractSecurityManager
     */
    public function getManager() {
        return $this->manager;
    }

    /**
     * 
     * Setea el manejador de seguridad para esta aplicacion
     * El Manejador de seguridad implementa Route\Rule y extiende de AbstractSecurityManager
     * @param AbstractSecurityManager $manager
     */
    public function setManager($manager) {
        $this->manager = $manager;
    }
    
    /**
     * 
     * Devuelve un array con los datos almacenados en la sesion para el usuario autenticado
     * @return array
     */
    public function getUser() {
        return $this->getApplication()->getSession()->get();
    }
    
    /**
     * 
     * Setea un array con los datos del usuario
     * @param array $user
     */
    public function setUser(array $user) {
        $this->getApplication()->getSession()->put($user);
    }
    
    static public function getSessionName() {
        $name=\Raptor\Raptor::getInstance()->getConfigurationLoader()->getConfOption('raptor','name');
        if($name===false)
            return 'Raptor2Session';
        return $name.'Session';
    }

    /**
     * Establece directivas y rutinas de proteccion contra ataques
     * [USADA POR EL SISTEMA]
     */
    static public function directives() {
        $options=  \Raptor\Raptor::getInstance()->getConfigurationLoader()->getConfOption();
        if(isset($options['raptor']['session_expire'])){
            ini_set('session.cookie_lifetime', intval($options['raptor']['session_expire']));
        }else{
            ini_set('session.cookie_lifetime',0);
        }
        ini_set('session.cookie_httponly', true);
        ini_set('session.use_only_cookies', true);
        $savePath=\Raptor\Core\Location::get(\Raptor\Core\Location::APP).'/Sessions';
        if(!file_exists($savePath))
            @mkdir ($savePath);
        session_save_path($savePath);
        
        
        if (isset($options['raptor']['proxy'])) {
            $parts=  explode('@', $options['raptor']['proxy']);
            $header=array();
            $proxy='';
            if(count($parts)==2){
                $auth = base64_encode($parts[0]);
                $header[]="Proxy-Authorization: Basic $auth";
                $proxy=$parts[1];
            }else{
                $proxy=$parts[0];
            }
            
            
            stream_context_set_default(
                    array('http' =>
                        array('proxy' => "tcp://$proxy",
                            'request_fulluri' => true,
                            'method' => "GET",
                            'user_agent' => 'Mozilla/5.0',
                            'header' => $header
                        )
                    )
            );
        }
    }
    
    /**
     * 
     * Chequea el ambiente para establecer el manejador de sesion para escenarios de balance de carga
     * 
     * Si en la configuracion de Raptor se establece la opcion de sesiones remotas el sistema
     * implementara la variante para ambientes de balance de carga
     */
    private function chekingSessionEnviroment() {
        $options=  $this->app->getConfigurationLoader()->getConfOption();
        if(isset($options['raptor']['session_remote'])){
            if(is_string($options['raptor']['session_remote'])){
                $op=$options['raptor']['session_remote'];
                $sessionHandler=new $op();
                session_set_save_handler($sessionHandler, false);
                register_shutdown_function('session_write_close');
            }  elseif (is_bool($options['raptor']['session_remote']) and (bool)$options['raptor']['session_remote']===true) {
                new Sessions\RemoteSession();
            }
        }
    }
}

?>
