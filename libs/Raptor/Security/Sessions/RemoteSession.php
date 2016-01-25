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
namespace Raptor\Security\Sessions;
/**
 * Description of RemoteSession
 *
 * 
 */
class RemoteSession implements \SessionHandlerInterface{
    /**
     *
     * @var Raptor\Raptor
     */
    private $app;
    
    function __construct() {
        $this->app = \Raptor\Raptor::getInstance();
        session_set_save_handler($this, false);
        register_shutdown_function('session_write_close');
        if (!$this->app->getStore()->getManager()->getConnection()->getSchemaManager()->tablesExist(array('raptor_session'))) {
            $this->app->getStore()->generateSchema('systemBundle', array('RaptorSession'));
        }
    }

    public function close() {
        return true;
    }

    public function destroy($session_id) {
        $session = $this->app->getStore()
                        ->getManager()
                        ->getRepository('systemBundle:RaptorSession')
                        ->findOneBy(array('name' => $session_id));
        if ($session) {
            

            $this->app->getStore()
                    ->getManager()
                    ->remove($session);
            $this->app->getStore()
                    ->getManager()
                    ->flush();
            return true;
        }
        else
            return false;
    }

    public function gc($maxlifetime) {
        $sessions = new \Raptor\Util\ItemList($this->app->getStore()
                        ->getManager()
                        ->getRepository('systemBundle:RaptorSession')
                        ->getGarvage($maxlifetime));
        
        if ($sessions->size() > 0) {
            foreach ($sessions as $session) {
                $this->app->getStore()
                        ->getManager()
                        ->remove($session);
            }
            
            $this->app->getStore()->getManager()->flush();
            return true;
        }
        else
            return true;
    }

    public function open($save_path, $name) {
        return true;
    }

    public function read($session_id) {
        $session = $this->app->getStore()
                        ->getManager()
                        ->getRepository('systemBundle:RaptorSession')
                        ->findOneBy(array('name' => $session_id));
       
        if ($session)
            return (string) $session->getData();
        else
            return "";
    }

    public function write($session_id, $session_data) {
        $session =$this->app->getStore()
                        ->getManager()
                        ->getRepository('systemBundle:RaptorSession')
                        ->findOneBy(array('name' => $session_id));
        
        if ($session){
            
            $session->setData($session_data);
            $session->setTime(time());
            $this->app->getStore()
                    ->getManager()
                    ->persist($session);
        }else{
            $session = new \Raptor\Component\systemBundle\Model\Entity\RaptorSession();
            $session->setName($session_id);
            $session->setData($session_data);
            $session->setTime(time());
            $this->app->getStore()
                    ->getManager()
                    ->persist($session);
            
        }
        $this->app->getStore()
                    ->getManager()
                    ->flush();
        return true;
    }    
}

?>
