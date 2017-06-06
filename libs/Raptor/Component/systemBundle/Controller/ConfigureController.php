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
namespace Raptor\Component\systemBundle\Controller;

/**
 * Description of ConfigureController
 *
 * 
 */
class ConfigureController extends \Raptor\Bundle\Controller\Controller {

    /**
     * @Route /configuration/configure
     */
    public function configureAction(\Slim\Http\Request $request) {
        
        $parameters = array();
        $parameters['database'] = array();
        $parameters['database']['driver'] = $request->post('driver');
        $parameters['database']['dbname'] = $request->post('db');
        $parameters['database']['user'] = $request->post('user');
        $parameters['database']['port'] = $request->post('port');
        $parameters['database']['password'] = $request->post('password');
        $parameters['database']['host'] = $request->post('host');

        $parameters['raptor'] = array();
        $parameters['raptor']['language'] = $request->post('lang');
        $parameters['raptor']['secret'] = $request->post('secret');
        $parameters['raptor']['cache'] = $request->post('cache');
        
        $this->app->getConfigurationLoader()->setConfOption($parameters);
        $this->getStore()->connect();
        //$this->getStore()->generateDatabase($request->post('db'));
        //$parameters['database']['dbname'] = $request->post('db');
        $this->app->getConfigurationLoader()->setConfOption($parameters);
       
        $this->app->getConfigurationLoader()->writeOptions();
        $this->app->getConfigurationLoader()->forceLoad();
//        $parameters['database']['password'] = '???';
//        $this->app->getConfigurationLoader()->setConfOption($parameters);
//        $this->app->getConfigurationLoader()->writeOptions();
        return $this->render('@systemBundle/configure/parameter.html.twig');
    }

}

?>
