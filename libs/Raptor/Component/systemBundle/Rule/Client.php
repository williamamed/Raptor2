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
class Client implements \Raptor\Bundle\Route\Rule {

    public function call(\Raptor\Raptor $app) {
        if (!$app->request()->isXhr())
            \Raptor\Raptor::getInstance()->hook('slim.after', array($this, 'createScript'));
        return false;
    }

    public function createScript() {
        
        $app = \Raptor\Raptor::getInstance();
        
        
        if (strpos($app->response()->headers->get('Content-Type'), 'text/html')===false)
            return;
        $user='public';
        if($app->getSecurity()->isAuthenticated()){
            $array=$app->getSecurity()->getUser();
            $user=$array['username'];
        }
            
        $data = array(
            'token' => $app->getSecurity()->getToken(),
            'front' => $app->request()->getRootUri(),
            'bundle' => $app->request()->getRootUri() . '/../bundle',
            'file' => $app->getLanguage()->getBundleFile(),
            'lang' => $app->getLanguage()->getUserCurrentLanguage(),
            'user' => $user
        );
        $core = $app->render('@systemBundle/client/client.core.html.twig', $data);

        $app->response()->write($core . $app->response()->getBody(), true);
    }

}

?>
