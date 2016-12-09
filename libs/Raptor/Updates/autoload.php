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
require 'composer/ClassLoader.php';
$loader = new \Composer\Autoload\ClassLoader();
$loader->set('Raptor', __DIR__ );
$loader->set('Slim', __DIR__ );
$loader->set('Go', __DIR__ );
$loader->set('Doctrine', __DIR__ . '/Doctrine');
$loader->set('Doctrine\\Common\\Annotations\\', __DIR__ . '/Doctrine/Common/Annotations');
$loader->set('', __DIR__ . '/../src');
$loader->set('Dissect', __DIR__ );
$loader->set('TokenReflection', __DIR__);
$loader->set('App', __DIR__ . '/..');
$loader->set('Wingu', __DIR__ );
$loader->set('Wingu', __DIR__ );
$loader->set('Assetic', __DIR__. '/kriswallsmith/assetic/src' );
$loader->set('PhpOffice', __DIR__. '/PHPWord-master/src' );
$loader->addClassMap(array('PHPExcel'=>__DIR__. '/Exel/PHPExcel.php'));
require __DIR__. '/Barcode/autoload.php';
require_once __DIR__. '/swiftmailer/lib/swift_required.php';
$loader->register(true);
require __DIR__. '/../app/AppAspectKernel.php';
require __DIR__. '/../app/Main.php';
?>
