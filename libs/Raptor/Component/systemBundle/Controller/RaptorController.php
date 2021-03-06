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
 * Description of DebugController
 *
 * 
 */
class RaptorController extends \Raptor\Bundle\Controller\Controller {

    /**
     * @Route /clean
     * @RouteName _raptor_clean
     */
    public function cleanAction() {

        $this->app->getConfigurationLoader()->forceLoad();
        return $this->render('@systemBundle/cache/clean.html.twig', array(
                    'autoinstall' => $this->app->getConfigurationLoader()->getAutoInstallMessage()
        ));
    }

    /**
     * @Route /cleanajax
     * @RouteName _raptor_clean_ajax
     */
    public function cleanAjaxAction() {

        $this->app->getConfigurationLoader()->forceLoad();
        return "OK";
    }

    /**
     * @Route /
     * @RouteName _raptor_front
     */
    public function frontAction() {

        return $this->render('@systemBundle/control/panel.html.twig', array(
                    'user' => $this->app->getSession()->get('admin_auth'),
                    'username' => $this->app->getSession()->get('admin_auth_user'),
                    'docs' => false
        ));
    }
    
    /**
     * @Route /logout
     * @RouteName _raptor_front_logout
     */
    public function adminLogoutAction() {
        $this->app->getSession()->set('admin_auth', false);
        $this->redirect('_raptor_front');
    }

    /**
     * @Route /newcredentials
     * @RouteName _raptor_front_newcredentials
     */
    public function newCredentialsAction($request) {

        $validation = \Raptor\Bundle\Form\Validation::create('#credential_admin')
                ->fields(array(
            'username' => array('required' => true),
            'password' => array('required' => true),
            'repassword' => array('equalTo' => '#password')
        ));

        return $this->JSON(array(
                    'extjs' => false,
                    'content' => $this->render('@systemBundle/credentials/index.html.twig', array(
                        'username' => $this->app->getSession()->get('admin_auth_user'),
                        'validation' => $validation->render()
                    ))
        ));
    }

    /**
     * @Route /newcredentials/config
     * 
     */
    public function newCredentialsConfigAction($request) {
        try {

            $parameters['raptor'] = array();
            $parameters['raptor']['admin'] = $request->post('username');
            $hash = \Raptor\Security\SecureHash::hash($request->post('password'));
            $parameters['raptor']['adminpass'] = "hash($hash)";

            $this->app->getConfigurationLoader()->setConfOption($parameters);

            $this->app->getConfigurationLoader()->writeOptions();
            $this->app->getConfigurationLoader()->forceLoad();
            $this->app->flash('credentials_msg', 'The credentials are configured to the admin user');
        } catch (\Exception $exc) {
            $this->app->flash('credentials_msg', $exc->getMessage());
            $this->redirect($request->getReferer() . '#!/raptor/newcredentials', false);
        }
        $this->redirect($request->getReferer() . '#!/raptor/newcredentials', false);
    }

    /**
     * @Route /configuration
     * @RouteName _raptor_configuration
     */
    public function configureAction() {
        $options = $this->app->getConfigurationLoader()->getOptions();

        return $this->JSON(array(
                    'extjs' => false,
                    'content' => $this->render('@systemBundle/configure/index.html.twig', array(
                        'db' => $options['options']['database'],
                        'raptor' => $options['options']['raptor'],
                    ))
        ));
    }

    /**
     * @Route /flaticon
     * 
     */
    public function flatAction() {

        return $this->render('@systemBundle/icons/index.html.twig');
    }

    /**
     * @Route /presentation
     * @RouteName _raptor_presentation
     */
    public function startAction() {
        $version = array(PHP_VERSION);
        if (version_compare(PHP_VERSION, '5.4') == -1)
            $version[] = false;
        else
            $version[] = true;
        $other = array();
        if (extension_loaded('soap') === false) {
            $other['soap'] = false;
        } else {
            $other['soap'] = true;
        }

        if (extension_loaded('zip') === false) {
            $other['zip'] = false;
        } else {
            $other['zip'] = true;
        }

        if (extension_loaded('openssl') === false) {
            $other['openssl'] = false;
        } else {
            $other['openssl'] = true;
        }

        if (extension_loaded('mcrypt') === false) {
            $other['mcrypt'] = false;
        } else {
            $other['mcrypt'] = true;
        }

        return $this->JSON(array(
                    'extjs' => false,
                    'content' => $this->render('@systemBundle/start/start.html.twig', array(
                        'version' => $version,
                        'other' => $other
                    ))
        ));
    }

}

?>
