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
namespace Raptor\Language;

/**
 * 
 * La clase Language establece el manejo del contexto idiomatico
 * para la aplicacion Raptor
 * 
 */
class Language extends \Slim\Middleware {

    private $system;
   
    private $current;
    private $current_bundle;

    function __construct() {
        $options = \Raptor\Raptor::getInstance()->getConfigurationLoader()->getOptions();
        
        if (isset($options['options']['raptor']) and isset($options['options']['raptor']['language']) and isset($options['options']['raptor']['locales'])) {
            $this->current = $options['options']['raptor']['language'];
        }
        else
            throw new \Exception('No Language is set in parameters Config');
    }


    /**
     * [MARCADO PARA REMOCION, SIN USO]
     * @param string $key
     * @return string
     */
    public function getSystem($key) {
        return;
    }
    /**
     * 
     * Retorna el lenguaje definido en las opciones del sistema(options.yml)
     * @return string
     */
    public function getSystemLanguage() {
        return $this->current;
    }
    /**
     * 
     * Retorna el lenguaje definido por el Agente de Usuario
     * @return string
     */
    public function getPreferedLanguage() {
        $request = \Raptor\Raptor::getInstance()->request();
        $lang_string = $request->headers('ACCEPT_LANGUAGE');
        $lang_array = explode(';', $lang_string);
        $lang = $lang_array[0];
        $options = \Raptor\Raptor::getInstance()->getConfigurationLoader()->getOptions();
        
        $params = $options['options']['raptor'];
        $locale = $params['locales'];

        foreach ($locale as $value) {
            $result = explode($value, $lang);
            if (count($result) > 1) {
                return $value;
            }
        }

        return $this->getSystemLanguage();
    }
    /**
     * 
     * Devuelve la cadena definida para el tag especificado y el scope del bundle dado
     * La cadena sera devuelta en el lenguaje actual del sistema o un cadena vacia
     * en caso de que no exista una definicion para ese tag en el bundle
     * @param string $tag llave del string deseado
     * @param string $scope espacio de variables del bundle de donde pertenece la definicion de idioma
     * @return string
     */
    public function getBundleLanguage($tag, $scope=null) {
        $route = '';
        if ($scope == null)
            $location = \Raptor\Util\ClassLocation::getLocation($this->current_bundle);
        else
            $location = \Raptor\Util\ClassLocation::getLocation($scope);
        $route = $location . "";
       
        
        $ultimate_session = \Raptor\Raptor::getInstance()->getSession()->get('rpt_lang');
        $lan = '';
        if ($ultimate_session) {
            $lan = $ultimate_session;
        } else {
            $lan = $this->getSystemLanguage();
        }
        $default=$this->getSystemLanguage();
        if (file_exists($route . '/Translation/' . $lan . '.json')) {
            $etiq = json_decode(file_get_contents($route . '/Translation/' . $lan . '.json'));
            if (key_exists($tag, $etiq)) {
                return $etiq->{$tag};
            } else {
                return '';
            }
        }elseif(file_exists($route . '/Translation/' . $default . '.json')){
            $etiq = json_decode(file_get_contents($route . '/Translation/' . $default . '.json'));
            if (key_exists($tag, $etiq)) {
                return $etiq->{$tag};
            } else {
                return '';
            }
        }else{
            return '';
        }
    }

    /**
     * 
     * Devuelve la definicion de lenguaje para el bundle y lenguaje actual
     * Sera devuelta la definicion completa del archivo, ejemplo. la definicion de es.json
     * @return string
     */
    public function getBundleFile() {
        if (!$this->current_bundle)
            return "{}";
        $location = \Raptor\Util\ClassLocation::getLocation($this->current_bundle);
       
        $route = $location . "";


        $ultimate_session = \Raptor\Raptor::getInstance()->getSession()->get('rpt_lang');
        $lan = '';
        if ($ultimate_session) {
            $lan = $ultimate_session;
        } else {
            $lan = $this->getSystemLanguage();
        }

        if (file_exists($route . '/Translation/' .$lan . '.json')) {
            $file = file_get_contents($route . '/Translation/' . $lan . '.json');
        } else {
            $file = '{}';
        }
        return $file;
    }

    /**
     * 
     * Setea para el usuario en la sesion actual, el lenguaje por defecto definido en las opciones
     * @return string
     */
    public function setUserCurrentLanguage() {

        \Raptor\Raptor::getInstance()->getSession()->set('rpt_lang', $this->current);

        return $this->current;
    }
    /**
     * 
     * Devuelve el lenguaje actual definido para el usuario en la sesion actual
     * @return string
     */
    public function getUserCurrentLanguage() {

        $ultimate_session = \Raptor\Raptor::getInstance()->getSession()->get('rpt_lang');
        $lan = '';
        if ($ultimate_session) {
            $lan = $ultimate_session;
        } else {
            $lan = $this->getSystemLanguage();
        }

        return $lan;
    }
    /**
     * 
     * Setea para el usuario en la sesion actual, el lenguaje del agente de usuario
     * @return string
     */
    public function setUserPreferedLanguage() {
        $prefer = $this->getPreferedLanguage();
        \Raptor\Raptor::getInstance()->getSession()->set('rpt_lang', $prefer);

        return $prefer;
    }
    /**
     * [USO DEL SISTEMA]
     */
    public function call() {
        $this->app->setLanguage($this);
        $this->app->getLanguage()->setUserCurrentLanguage();
        $this->next->call();
    }
    /**
     * 
     * Establece el bundle actual para el analisis del contexto idiomatico
     * @param string $current_bundle
     */
    public function setCurrentBundle($current_bundle) {
        $this->current_bundle = $current_bundle;
    }

}

?>
