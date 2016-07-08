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
namespace Raptor\Core;

/**
 * 
 * Esta clase maneja el consumo de servicios tanto internos como SOAP
 * 
 */
class Service {
    /**
     * 
     * Devuelve la URL de servicio SOAP registrada
     * @return string
     */
    public function getUrl() {
        $conf = \Raptor\Raptor::getInstance()->getConfigurationLoader()->getOptions();
        if (isset($conf['raptor']) and isset($conf['raptor']['services']))
            return $conf['services'] . '?wsdl';
        return '';
    }

    /**
     * Retorna una instancia de la clase SoapClient para un servicio remoto
     * 
     * @param type $url
     * @param type $options
     * @return SoapClient
     */
    public function consume($url, $options = array()) {

        $soap = new \SoapClient($url, $options);

        return $soap;
    }

    /**
     * Retorna una instancia de la clase SoapClient para un servicio interno
     * @return SoapClient
     */
    public function internal() {
        return $soap = new \SoapClient($this->getUrl());
    }

    /**
     * 
     * Retorna una instancia de los servicios privados en el bundle especificado o FALSE sino se encontro ninguno
     * @param string $bundle The name of the Bundle where is the PrivateService
     * @return PrivateService
     */
    public function getPrivate($bundle) {
        $bundles = \Raptor\Raptor::getInstance()->getConfigurationLoader()->getOptions();
        if (isset($bundles['specifications'][$bundle])) {
            if (file_exists($bundles['specifications'][$bundle]['location'] . DIRECTORY_SEPARATOR . 'Services' . DIRECTORY_SEPARATOR . 'PrivateService.php')) {
                $class = $bundles['specifications'][$bundle]['namespace'] . '\\Services\\PrivateService';
                return new $class();
            } else {
                return FALSE;
            }
        }
        else
            return FALSE;
    }

}

?>
