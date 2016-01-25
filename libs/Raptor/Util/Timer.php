<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Timer
 *
 * @author DinoByte
 */
namespace Raptor\Util;

class Timer {
    private $executionTime;
    private $init;
    private $end;
    
    function __construct() {
        $this->executionTime=0;
    }
    
    public function start() {
        $this->init=  microtime(true);
    }
    
    public function stop() {
        $this->end=  microtime(true);
        $this->executionTime=$this->end-$this->init;
    }
    
    public function getExecutionTime() {
        $this->stop();
        return $this->executionTime;
    }



}

?>
