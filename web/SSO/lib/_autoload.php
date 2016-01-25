<?php



require_once __DIR__.'/../../../src/Raptor2/SyntarsusBundle/Saml/SAMLConfig.php';

/**
 * This file is a backwards compatible autoloader for simpleSAMLphp.
 * Loads the Composer autoloader.
 *
 * @author Olav Morken, UNINETT AS.
 * @package simpleSAMLphp
 */

// SSP is loaded as a separate project
if (file_exists(dirname(dirname(__FILE__)) . '/vendor/autoload.php')) {
	require_once dirname(dirname(__FILE__)) . '/vendor/autoload.php';
}
// SSP is loaded as a library.
else if (file_exists(dirname(dirname(__FILE__)) . '/../../autoload.php')) {
	require_once dirname(dirname(__FILE__)) . '/../../autoload.php';
}
else {
	throw new Exception('Unable to load Composer autoloader');
}


       

return;
if(!class_exists('Raptor\Raptor', false))
    $rpt_autoload=true;
else
    $rpt_autoload=false;

  if(!class_exists('Raptor\autoload', false))
    require (__DIR__.'/../../../../lib/autoload.php');
 \Raptor\autoload::register();
 \Raptor\RaptorDB::registerAutoload();
 \Raptor\Bundle\BundleAutoload::register();
 if(!defined("USER_LOCAL"))
 define("USER_LOCAL",305);
 if(!defined("USER_REMOTE"))
 define("USER_REMOTE",306);
 if(!defined("USER_PUBLIC"))
 define("USER_PUBLIC",307);
if(!class_exists('Start', false))
    require (__DIR__.'/../../../../app/Start.php');
$start=new \Start();

$start->onConfig();



if($rpt_autoload){
    $sessionhandler=new System\SessionHandlerBundle\Controller\DefaultController();
    $sessionhandler->indexAction();
}