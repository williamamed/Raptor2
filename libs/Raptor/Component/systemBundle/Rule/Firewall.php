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
namespace Raptor\Component\systemBundle\Rule;

/**
 * Description of Panel
 *
 * 
 */
class Firewall implements \Raptor\Bundle\Route\Rule {
    /**
     *
     * @var \Raptor\Raptor
     */
    private $app;
    
    public function call(\Raptor\Raptor $app) {
        $conf=$app->getConfigurationLoader()->getConfOption();
        $this->app=$app;
        
        if(isset($conf['raptor']['admin']) and isset($conf['raptor']['adminpass'])){
            if(!$app->getSession()->get('admin_auth')){
                $this->handleAuthenticationRequest($message,$conf);
                $app->response()->write($app->render('@systemBundle/Login/index.html.twig', array(
                            'error' => $message,
                            'username' => $this->app->request()->post('username')
                )));
                $app->contentType('text/html; charset=UTF-8');
                return true;
            }   
           
        }
        
        return false;
    }
    
    /**
     * 
     * 
     */
    public function handleAuthenticationRequest(&$message,$conf) {
        
        if($this->app->request()->isFormData() and !$this->app->request()->isXhr()){
            
            if($this->app->request()->post('username') and $this->app->request()->post('password')){
                $username=$this->app->request()->post('username');
                $pass=$this->app->request()->post('password');
                $passCompare=$conf['raptor']['adminpass'];
                $obj=\Raptor\Configuration\ConfigurationLoader::getHash($passCompare);
                
                if($obj->valid){
                    $passCompare=  \Raptor\Security\SecureHash::verify($pass, $obj->password);
                }else
                    $passCompare=  ($pass===$conf['raptor']['adminpass']);
                if($conf['raptor']['admin']==$username and $passCompare){
                    $this->app->getSession()->set('admin_auth',true);
                    $this->app->getSession()->set('admin_auth_user',$username);
                    $this->app->redirect($_SERVER['REQUEST_URI']);
                }else
                    $message= "Wrong password or username";
            }else{
                $message= "Wrong password or username";
            }
        }
    }
    

}

?>
