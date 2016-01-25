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
 * Raptor
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
        $this->add(new Language\Language());
        $this->add(new Security\Security());
        $this->add(new Persister\Store());
        $this->add(new \App\Main());
        $this->add(new Exception\Listener\RaptorExceptions());
        $this->inyector = new Core\Inyector\Container();
        parent::run();
    }
    /**
     * Return the Configuration Loader for this App
     * @return Configuration\ConfigurationLoader
     */
    public function getConfigurationLoader() {
        return $this->configuration;
    }
    /**
     * Return to the agent the Core javascript
     * library
     */
    public function clientCore() {
        
    }
    /**
     * Return the container to depedency inyector
     * @return Core\Inyector\Container
     */
    public function getInyector() {
        return $this->inyector;
    }

    /**
     * Get the RouteContainer for this App
     * 
     * @return Bundle\Route\RuleContainer
     */
    public function getRuleContainer() {
        return $this->ruleContainer;
    }

    public function setLanguage(Language\Language $language) {
        $this->language = $language;
    }

    /**
     * Get the Language Configuration
     * @return Language\Language
     */
    public function getLanguage() {
        return $this->language;
    }

    /**
     * Get the App Aspect Global Kernel
     * @return \App\AppAspectKernel
     */
    public function getAppAspectKernel() {
        return $this->appAspectKernel;
    }

    /**
     * Return the current session for this app
     * @return Security\Sessions\NativeSession
     */
    public function getSession() {
        return $this->session;
    }
    
    /**
     * Set the session handler for this app.
     * This is used by the Security to set the apropiate NativeSession in the precise moment with a 
     * verification for remote sessions 
     * @param Security\Sessions\NativeSession $session
     */
    public function setSession($session) {
        $this->session=$session;
    }

    /**
     * Return the Doctrine Store 
     * @return Persister\Store
     */
    public function getStore() {
        return $this->store;
    }

    public function setStore(Persister\Store $store) {
        $this->store = $store;
    }

    public function setSecurity(Security\Security $security) {
        $this->security = $security;
    }
    /**
     * Get the security routing for this app
     * @return Security\Security
     */
    public function getSecurity() {
        return $this->security;
    }
    /**
     * Register a render portion with that plugin name
     * @param string $key the name of the location where to render
     * @param string $value the content to render in that location
     */
    public function setViewPlugin($key,$value) {
        
            if(!isset($this->plugins[$key]))
                $this->plugins[$key]=array();
            $this->plugins[$key][]=$value;
        
    }
    /**
     * return the array of plugins registered with that key or all if key is not specified
     * @param string|NULL $key
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
   
    public function getApi() {
        $api = new \Raptor\Cache\Cache('api');
        if($api->isDirty()){
           return false; 
        }else{
           return $api->getData(); 
        }
    }


    public function getTimer() {
        return $this->timer;
    }

    /**
     * Return an instance of Raptor PHP App expecified
     * Get application instance by name
     * @param  string $name The name of the Raptor application
     * @return \Raptor\Raptor|null
     */
     public static function getInstance($name = 'default') {
        return isset(static::$apps[$name]) ? static::$apps[$name] : null;
    }
    
    /**
     * Render a template
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
        echo static::generateTemplateMarkup('404 Page Not Found', '<p>The page you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly. If all else fails, you can visit our home page at the link below.</p><a href="' . $this->request->getRootUri() . '/">Visit the Home Page</a>');
    }

    /**
     * Default Error handler
     */
    protected function defaultError($e)
    {
        $this->getLog()->error($e);
        echo self::generateTemplateMarkup('Error', '<p>A website error has occurred. The website administrator has been notified of the issue. Sorry for the temporary inconvenience.</p>');
    }
    
}
