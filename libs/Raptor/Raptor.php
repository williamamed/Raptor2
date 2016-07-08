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

namespace Raptor;
/**
 * Raptor es la clase principal del framework del lado del
 * servidor. Extiende de la clase principal Slim implementando
 * la logica general del sistema.
 * 
 * @package Raptor
 * @since   2.0.0
 */
class Raptor extends \Slim\Slim {
    
    const JSON = 'application/json';
    const APPXML = 'application/xml';
    const TEXTXML = 'text/xml';
    const CVS = 'text/csv';
    const PDF = 'application/pdf';
    const ZIP = 'application/octet-stream';
    const BMP = 'image/x-ms-bmp';
    const CSS = 'text/css';
    const GIF = 'image/gif';
    const HTM = 'text/html';
    const HTML = 'text/html';
    const SHTML = 'text/html';
    const ICO = 'image/vnd.microsoft.icon';
    const JPE = 'image/jpeg';
    const JPEG = 'image/jpeg';
    const JPG = 'image/jpeg';
    const JS = 'text/javascript';
    const PNG = 'image/png';
    const SVG = 'image/svg+xml';
    const SVGZ = 'image/svg+xml';
    const SWF = 'application/x-shockwave-flash';
    const SWFL = 'application/x-shockwave-flash';
    const TXT = 'text/plain';
    const XHT = 'application/xhtml+xml';
    const XHTML = 'application/xhtml+xml';
    const EXCEL = 'application/vnd.ms-excel';


    /**
     * Store the Global Application Config
     * @var Configuration\ConfigurationLoader
     */
    private $configuration;

    /**
     *
     * @var Security\Sessions\NativeSession
     */
    private $session;

    /**
     * 
     * @var Security\Security
     */
    private $security;

    /**
     *
     * @var Persister\Store
     */
    private $store;

    /**
     *
     * @var \App\AppAspectKernel
     */
    private $appAspectKernel;

    /**
     *
     * @var Language\Language
     */
    private $language;
    /**
     *
     * @var array
     */
    private $plugins;

    /**
     * 
     * @var Core\Inyector\Container
     */
    private $inyector;

    function __construct(array $userSettings = array()) {
        $userSettings['view'] = '\Raptor\Template\View';
        
        parent::__construct($userSettings);
        $this->container->singleton('router', function ($c) {
                    return new Core\Router();
        });
        // Default request
        $this->container->singleton('request', function ($c) {
            return new http\Request($c['environment']);
        });
    }

    /**
     *
     * @var Util\Timer
     */
    private $timer;

    /**
     *
     * @var Bundle\Route\RuleContainer 
     */
    private $ruleContainer;

    public function run() {
        
        $this->timer = new Util\Timer();
        $this->timer->start();
        $this->plugins=array();

        $this->appAspectKernel = \App\AppAspectKernel::getInstance();
        if(!file_exists(Core\Location::get(Core\Location::CACHE)))
            @mkdir (Core\Location::get(Core\Location::CACHE));
        $this->appAspectKernel->init(array(
            'debug' => $this->config('debug'),
            'appDir' => Core\Location::get(Core\Location::SRC),
            'cacheDir' => Core\Location::get(Core\Location::CACHE).'/AOP'
        ));
        $this->ruleContainer = new Bundle\Route\RuleContainer();
        $this->configuration = new Configuration\ConfigurationLoader();
        $secret=$this->configuration->getConfOption();
        if(isset($secret['raptor']['secret']))
            $this->config('cookies.secret_key',$secret['raptor']['secret']);
        Security\Security::directives();
        
        $this->add(new Core\Routing());
        $this->add(new \App\Main());
        $this->add(new Language\Language());
        $this->add(new Security\Security());
        $this->add(new Persister\Store());
        
        $this->add(new Exception\Listener\RaptorExceptions());
        $this->inyector = new Core\Inyector\Container();
        parent::run();
    }
    
    /**
     * Retorna la instancia del cargador de configuracion del
     * sistema, el cargador contiene las directivas de configuracion
     * general del sistema almacenados en options.yml
     * 
     * Tener en cuenta que la configuracion es levantada desde cache, nunca
     * directamente desde el archivo de configuracion.
     * 
     * @return Configuration\ConfigurationLoader
     */
    public function getConfigurationLoader() {
        return $this->configuration;
    }
    
    /**
     * Retorna la instanacia del Inyector de Dependencias
     * 
     * Este contiene todas las instancias de objetos previamente
     * registrados ys eran llamados por su nombre de clase.
     * 
     * @return Core\Inyector\Container
     */
    public function getInyector() {
        return $this->inyector;
    }

    /**
     * Retorna el contenedor de reglas para el sistema, debe
     * de devolver todas reglas registradas en los bundles de
     * la aplicacion
     * 
     * @return Bundle\Route\RuleContainer
     */
    public function getRuleContainer() {
        return $this->ruleContainer;
    }
    /**
     * Establece la clase controladora del lenguaje de la aplicacion
     * 
     * @param \Raptor\Language\Language $language La clase controladora del lenguaje
     */
    public function setLanguage(Language\Language $language) {
        $this->language = $language;
    }

    /**
     * Devuelve la instancia de la clase controladora del lenguaje
     * 
     * @return Language\Language
     */
    public function getLanguage() {
        return $this->language;
    }

    /**
     * Devuelve la instancia del nucleo de Aspectos de la aplicacion.
     * Este nucleo es el contenedor de Aspectos registrados en todos los
     * bundles del sistema.
     * 
     * @return \App\AppAspectKernel
     */
    public function getAppAspectKernel() {
        return $this->appAspectKernel;
    }

    /**
     * Retorna directamente la NativeSession utilizada por el sistema
     * 
     * @return Security\Sessions\NativeSession
     */
    public function getSession() {
        return $this->session;
    }
    
    /**
     * Establece el manejador de sesion para esta aplicacion.
     * 
     * [ Esta funcion es usada por el Security para establecer el manejador en el momento
     * preciso con una verificacion a sesiones remotas ]
     * 
     * @param Security\Sessions\NativeSession $session  El manejador de sesion
     */
    public function setSession($session) {
        $this->session=$session;
    }

    /**
     * Retorna la instancia del Store(Manejador de Persistencia, Doctrine ORM)
     * 
     * @return Persister\Store
     */
    public function getStore() {
        return $this->store;
    }
    
    /**
     * Establece la instancia del Store(Manejador de Persistencia, Doctrine ORM)
     * 
     * [ Esta funcion es usada por Raptor para establecer el manejador ]
     * 
     * @param \Raptor\Persister\Store $store Manejador de Persistencia, Doctrine ORM
     */
    public function setStore(Persister\Store $store) {
        $this->store = $store;
    }
    
    /**
     * Establece la instancia del Manejador de seguridad del sistema.
     * 
     * [ Esta funcion es usada por Raptor para establecer el manejador ]
     * 
     * @param \Raptor\Security\Security $security El manejador de seguridad para esta aplicacion
     */
    public function setSecurity(Security\Security $security) {
        $this->security = $security;
    }
    
    /**
     * Devuelve la instancia del Manejador de Seguridad
     * 
     * @return Security\Security
     */
    public function getSecurity() {
        return $this->security;
    }
    /**
     * Registra e inyecta codigo para un nombre de plugin determinado.
     * 
     * El primer parametro establece para que punto de inyeccion se inyectara
     * el codigo pasado por el segundo parametro.
     * 
     * Los hotpots declarados en Raptor por defecto son:
     * 
     * raptor_bundle:
     * nombre de plugin reservado para inyectar contenido html en el menú bundles del panel de control.
     * 
     * raptor_tools:
     * nombre de plugin reservado para inyectar contenido html en el menú tools del panel de control.
     * 
     * raptor_panel:
     * nombre de plugin reservado para inyectar contenido html en el menú principal del panel de control.
     * 
     * core_library_inside: 
     * nombre de plugin reservado para inyectar funciones javascript en la clase core enviada al cliente. 
     * Ejemplo getHola: function(){ … }, getHola2: function(){ … }
     * 
     * core_library_outside:
     * nombre de plugin reservado para inyectar funciones javascript en el espacio de variables de la biblioteca
     * core, este contenido es inyectadoo luego de la creacion del objeto Raptor.
     * 
     * core_header: 
     * nombre de plugin reservado para inyectar contenido html en la sección header de la respuesta actual, 
     * es inyectado luego del script del core de Raptor.
     * 
     * PUEDES ADEMAS CRETAR TUAS PROPIOS PUNTOS DE INYECCION Y LLAMARLOS EN LAS PLANTILLAS TWIG A TRAVES DE LA FUNCION plugin()
     * 
     * @param string $key nombre del punto de inyeccion eje. raptor_bundle
     * @param string $value el contenido o codigo a inyectar, normalmente utilizado en conjunto con render()
     */
    public function setViewPlugin($key,$value) {
        
            if(!isset($this->plugins[$key]))
                $this->plugins[$key]=array();
            $this->plugins[$key][]=$value;
        
    }
    /**
     * Retorna un array de todo el contenido registrado para ese nombre de punto de inyeccion.
     * 
     * @param string|NULL $key nombre del punto de inyeccion
     * @return array|false
     */
    public function getViewPlugin($key='') {
        if($key==''){
            return $this->plugins;
        }else{
            if(isset($this->plugins[$key]))
                return $this->plugins[$key];
            else
                return false;
        }
    }
    /**
     * Retorna el Manejador de API de Raptor, esta debe devolver toda la documentacion declarada en Raptor.
     * 
     * @return boolean
     */
    public function getApi() {
        $api = new \Raptor\Cache\Cache('api');
        if($api->isDirty()){
           return false; 
        }else{
           return $api->getData(); 
        }
    }

    /**
     * Devuelve la instancia de la clase utilitaria Timer, esta devuelve informacion sobre el
     * tiempo en ejecucion de bloques de codigo etc.
     * 
     * @return Util\Timer
     */
    public function getTimer() {
        return $this->timer;
    }

    /**
     * Retorna una instancia unica de esta aplicacion Raptor de acuerdo a su nombre
     * 
     * @param  string $name El nombre de la aplicacion
     * @return \Raptor\Raptor|null
     */
     public static function getInstance($name = 'default') {
        return isset(static::$apps[$name]) ? static::$apps[$name] : null;
    }
    
    /**
     * Render a template. 
     * $this->render('@exampleBundle/index.twig');
     *
     * Call this method within a GET, POST, PUT, PATCH, DELETE, NOT FOUND, or ERROR
     * callable to render a template whose output is appended to the
     * current HTTP response body. How the template is rendered is
     * delegated to the current View.
     *
     * @param  string $template The name of the template passed into the view's render() method
     * @param  array  $data     Associative array of data made available to the view
     * @param  int    $status   The HTTP response status code to use (optional)
     */
    public function render($template, $data = array(), $status = null) {
        if (!is_null($status)) {
            $this->response->status($status);
        }
        $this->view->setTemplatesDirectory($this->config('templates.path'));
        $this->view->appendData($data);
        return $this->view->display($template);
    }
    
    /**
     * Generate diagnostic template markup
     *
     * This method accepts a title and body content to generate an HTML document layout.
     *
     * @param  string   $title  The title of the HTML template
     * @param  string   $body   The body content of the HTML template
     * @return string
     */
    protected static function generateTemplateMarkup($title, $body)
    {
        return sprintf("<html><head><title>%s</title><style>body{margin:0;padding:30px;font:12px/1.5 Helvetica,Arial,Verdana,sans-serif;}h1{margin:0;font-size:48px;font-weight:normal;line-height:48px;}strong{display:inline-block;width:65px;}</style></head><body><div style='background-color: #402878 ;color: white;padding: 25px;'><h1>%s</h1></div><div style='background:gray;color:white;margin-top:0;padding:25px;'>%s</div></body></html>", $title, $title, $body);
    }

    /**
     * Default Not Found handler
     */
    protected function defaultNotFound()
    {
        if($this->request()->isXhr()){
            $this->contentType(\Raptor\Raptor::JSON);
            $response=new \Raptor\Util\ItemList();
            $response->set('cod',5);
            $response->set('msg',"<h2>404 Page Not Found</h2>".'<h4>The page you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly. If all else fails, you can visit our home page at the link below.</p><a href="' . $this->request->getRootUri() . '/">Visit the Home Page</a></h4>');
            echo $response->toJson();
            return;
        }
        echo static::generateTemplateMarkup('404 Page Not Found', '<p>The page you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly. If all else fails, you can visit our home page at the link below.</p><a href="' . $this->request->getRootUri() . '/">Visit the Home Page</a>');
    }

    /**
     * Default Error handler
     */
    protected function defaultError($e)
    {
        $this->getLog()->error($e);
        if($this->request()->isXhr()){
            $this->contentType(\Raptor\Raptor::JSON);
            $response=new \Raptor\Util\ItemList();
            $response->set('cod',5);
            $response->set('msg',"<h2>Error</h2>".'<h4>A website error has occurred. The website administrator has been notified of the issue. Sorry for the temporary inconvenience.</h4>');
            echo $response->toJson();
            return;
        }
        echo self::generateTemplateMarkup('Error', '<p>A website error has occurred. The website administrator has been notified of the issue. Sorry for the temporary inconvenience.</p>');
    }
    
}
