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
namespace Raptor\Template;
use \Twig_Loader_Filesystem;
use \Twig_Autoloader;
use \Twig_Environment;
use \Twig_SimpleFunction;
use \Twig_SimpleFilter;

/**
 * Description of View
 *
 * 
 */
class View extends \Slim\View {

    /**
     *
     * @var \Twig_Environment
     */
    private $twig;
    
    function __construct() {
        parent::__construct();
        require_once __DIR__ . '/../../Twig/lib/Twig/Autoloader.php';
        Twig_Autoloader::register();

        $loader = new \Twig_Loader_Filesystem();
        $locations = \Raptor\Raptor::getInstance()->getConfigurationLoader()->getOptions();
        $templates = $locations['location'];
        foreach ($templates as $key => $value) {
            if (!file_exists($value . '/Views'))
                mkdir($value . '/Views');
            $loader->addPath($value . '/Views', $key);
        }
        
//        if (\Raptor\Raptor::getInstance()->getMode() == 'development') {
        if (\Raptor\Raptor::getInstance()->config('debug')) {
            
            $this->twig = new Twig_Environment($loader, array(
//                   'cache' => \Raptor\Core\Location::get(\Raptor\Core\Location::CACHE) . '/7u136',
            ));
        } else {
            $this->twig = new Twig_Environment($loader, array(
                'cache' => \Raptor\Core\Location::get(\Raptor\Core\Location::CACHE) . '/7u136',
            ));
        }
        $this->register();
    }
    /**
     * Display template
     *
     * This method echoes the rendered template to the current output buffer
     *
     * @param  string   $template   Pathname of template file relative to templates directory
     */
    public function display($template) {
        return $this->fetch($template);
    }
    
    
    public function render($template) {
        return $this->twig->render($template, $this->data->all());
    }
    
    public function register() {
        $asset = new Twig_SimpleFunction('asset', function ($val) {
                    
                    if(dirname($_SERVER['SCRIPT_NAME'])=='/' or dirname($_SERVER['SCRIPT_NAME'])=='\\')
                        return '/bundles/' . $val;
                    else
                        return dirname($_SERVER['SCRIPT_NAME']) . '/bundles/' . $val;
                });
        $this->twig->addFunction($asset);

        $path = new Twig_SimpleFunction('path', function ($val) {
                    $route = \Raptor\Raptor::getInstance()->router()->getNamedRoute($val);
                    if ($route == NULL)
                        return "";
                    $pattern = $route->getPattern();
                    return \Raptor\Raptor::getInstance()->request()->getRootUri() . $pattern;
                });
        $this->twig->addFunction($path);
        
        $plugin= new Twig_SimpleFunction('plugin', function ($key) {
                    $app = \Raptor\Raptor::getInstance();
                    $result=$app->getViewPlugin($key);
                    if ($result == false)
                        return "";
                    return join("", $result);
                });
        
        $this->twig->addFunction($plugin);
       
        $locale = new Twig_SimpleFunction('locale', function () {
                   $params = \Raptor\Raptor::getInstance()->getConfigurationLoader()->getConfOption();
                    if (isset($params['raptor']['language'])) {
                        return $params['raptor']['language'];   
                    }else{
                        return false;
                    }
        });
        $this->twig->addFunction($locale);
        $langFilter = new Twig_SimpleFilter('lang', function ($val) {
                 return \Raptor\Raptor::getInstance()->getLanguage()->getBundleLanguage($val);
        });
        
        $enviroment= new \Twig_SimpleFunction('conf', function ($val) {
                 return \Raptor\Raptor::getInstance()->config($val);
        });
        $this->twig->addFunction($enviroment);
        
        $this->twig->addFilter($langFilter);
        $lang = new \Twig_SimpleFunction('lang', function ($val) {
                 return \Raptor\Raptor::getInstance()->getLanguage()->getBundleLanguage($val);
        });
        $this->twig->addFunction($lang);
    }

}

?>
