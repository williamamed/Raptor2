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
namespace Raptor2\InteractiveBundle\Rule;
/**
 * Description of Interactive
 *
 * 
 */
class Interactive implements \Raptor\Bundle\Route\Rule{
    
    public function call(\Raptor\Raptor $app) {
        /**
         * Add to the inyector container the Interactive Instance
         * 
         */
        $app->getInyector()->add(new \Raptor2\InteractiveBundle\Manager\InteractiveManager());
        $user='public';
        if($app->getSecurity()->isAuthenticated()){
            $array=$app->getSecurity()->getUser();
            $user=$array['username'];
        }
        $store=json_encode(array('reject'=>false,'tutoriales'=>array('interactive'=>'This is interactive')));
        if($app->getCookie('Interact2_'.$user, true)==NULL){
            //$app->setCookie('Interactive_'.$user, $store ,  strtotime('+1 year'));
        }else{
            $store=  $app->getCookie('Interact2_'.$user, true);
        }
        $app->setViewPlugin('core_library_outside',$app->render("@InteractiveBundle/core/core.js.twig",array(
            'url'=>$app->request()->getUrl().$app->request()->getScriptName().'/interactive/core',
            'perfil'=>$store
        )));
        
        /**
         * Return false to continue the flow of routing
         */
        return false;
    }    
}

?>
