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

    

    public function call() {
        $this->app->setSecurity($this);
        $this->app->hook('slim.after', array($this, 'writeToken'));
        $this->chekingSessionEnviroment();
        $this->app->setSession(new Sessions\NativeSession());
        $this->next->call();
    }
    
    /**
     * Establish the state of identification process
     * @param boolean $state
     */
    public function setAuthenticated($state) {
        if($state)
            $this->getApplication()->getSession()->set('rpt_user_agent', $this->getApplication()->request()->getUserAgent());
        $this->getApplication()->getSession()->set('rpt_auth', $state);
    }
    /**
     * [Shortcut of setAuthenticated(true)]
     * Mark the user session has authenticated
     * 
     * [IF YOU ARE USING THE SECURITY MANAGER IN SOME HOW LIKE A SECURITY MODULE PROBABLY YOU NEED TO CALL THE LOGIN METHOD IN THE 
     *  SECURITY MANAGER, SOME MANAGERS ADD OTHER ROUTINES TO THE LOGIN PROCCES]
     */
    public function login($attr=array()) {
        $this->getApplication()->getSession()->set('rpt_user_agent', $this->getApplication()->request()->getUserAgent());
        $this->getApplication()->getSession()->set('rpt_auth', true);
        if((bool)$attr)
            $this->setUser ($attr);
    }
    /**
     * [Shortcut of setAuthenticated(false)]
     * Mark the user session has non-authenticated
     * 
     *  [IF YOU ARE USING THE SECURITY MANAGER IN SOME HOW LIKE A SECURITY MODULE PROBABLY YOU NEED TO CALL THE LOGIN METHOD IN THE 
     *  SECURITY MANAGER, SOME MANAGERS ADD OTHER ROUTINES TO THE LOGIN PROCCES]
     */
    public function logout() {
        $this->getApplication()->getSession()->set('rpt_auth', false);
    }
    /**
     * Get the state of identification process
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
     * Get the current security Token
     * @return string
     */
    public function getToken() {
        return $this->getApplication()->getSession()->get('rpt_csrf');
    }
    /**
     * Return true if the specifid token
     * match with the current token
     * @param string $old
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
     * Write a new token to the User
     * 
     * THIS FUNCTION IS CALLED INTERNALLY
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
     * Get the Security Manager for this App
     * The Security manager implements Route\Rule
     * @return AbstractSecurityManager
     */
    public function getManager() {
        return $this->manager;
    }

    /**
     * Set the Security Manager for this App
     * The Security manager must implements Route\Rule
     * @param AbstractSecurityManager $manager
     */
    public function setManager($manager) {
        $this->manager = $manager;
    }
    
    /**
     * Return the an array with the user data stored in the session
     * @return array
     */
    public function getUser() {
        return $this->getApplication()->getSession()->get();
    }
    
    /**
     * Set the user data to store in the session
     * @param array $user
     */
    public function setUser(array $user) {
        $this->getApplication()->getSession()->put($user);
    }
    /**
     * Establish some directives for session protection
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
            $parts=  explode('@', $conf['raptor']['proxy']);
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
     * Check the enviroment to establish the session driver
     * for charg balance
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
