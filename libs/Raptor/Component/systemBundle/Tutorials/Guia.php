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
namespace Raptor\Component\systemBundle\Tutorials;
/**
 * Description of Guia
 *
 * 
 */
class Guia implements \Raptor\Bundle\Route\Rule{
    /**
     *
     * @var \Raptor2\InteractiveBundle\Manager\InteractiveManager
     */
    private $interactive;
    

    public function call(\Raptor\Raptor $app) {
        $this->interactive=$app->getInyector()->get('InteractiveManager');
        
        $this->interactive->add(array(
            'name'=>'raptor.panel.welcome',
            'seconds'=>40,
            'style'=>array(
                'background'=>'darkblue'
            ),
            'next'=>'raptor.panel.start',
            'author'=>'amed',
            'position'=>'right top'
        ),'systemBundle');
        
        $this->interactive->add(array(
            'name'=>'raptor.panel.start',
            'seconds'=>20,
            'style'=>array(
                'background'=>'darkblue'
            ),
            'pointer'=>'.navbar-nav li:first',
            'author'=>'amed',
            'position'=>'right top'
        ),'systemBundle');
        
        $this->interactive->add(array(
            'name'=>'raptor.configuration.conf',
            'seconds'=>60,
            'style'=>array(
                'background'=>'darkblue'
            ),
            'author'=>'amed',
            'next'=>'raptor.tools.toolpresent',
            'position'=>'right bottom'
        ),'systemBundle');
        
         $this->interactive->add(array(
            'name'=>'raptor.start.startopen',
            'seconds'=>60,
            'style'=>array(
                'background'=>'darkblue'
            ),
            'pointer'=>'.navbar-nav li:eq(1)',
            'author'=>'amed',
            'position'=>'right top'
        ),'systemBundle');
         
       $this->interactive->add(array(
            'name'=>'raptor.tools.toolpresent',
            'seconds'=>60,
            'waitSeconds'=>45,
            'style'=>array(
                'background'=>'darkblue'
            ),
            'pointer'=>'.navbar-nav li:eq(2)',
            'author'=>'amed',
            'next'=>'raptor.bundle.bundle',
            'position'=>'right top'
        ),'systemBundle');
       
       $this->interactive->add(array(
            'name'=>'raptor.bundle.bundle',
            'seconds'=>45,
            'waitSeconds'=>30,
            'style'=>array(
                'background'=>'darkblue'
            ),
            'pointer'=>'.navbar-nav>li:eq(3)',
            'author'=>'amed',
            'next'=>'raptor.account.admin',
            'position'=>'right top'
        ),'systemBundle');
       
       $this->interactive->add(array(
            'name'=>'raptor.account.admin',
            'seconds'=>45,
            'waitSeconds'=>30,
            'style'=>array(
                'background'=>'darkblue'
            ),
            'pointer'=>'.navbar-nav.navbar-right li:first',
            'author'=>'amed',
            'position'=>'left top'
        ),'systemBundle');
        return false;
    }
}

?>
