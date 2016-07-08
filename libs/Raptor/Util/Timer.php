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
/**
 * La clase utilitaria Timer devuelve informacion sobre el
 * tiempo en ejecucion de bloques de codigo ect.
 */
class Timer {
    private $executionTime;
    private $init;
    private $end;
    
    function __construct() {
        $this->executionTime=0;
    }
    /**
     * Empieza la rutina de conteo
     */
    public function start() {
        $this->init=  microtime(true);
    }
    /**
     * Termina la rutina de conteo
     */
    public function stop() {
        $this->end=  microtime(true);
        $this->executionTime=$this->end-$this->init;
    }
    /**
     * Devuelve el tiempo en milisegundo que duro el conteo
     * @return number
     */
    public function getExecutionTime() {
        $this->stop();
        return $this->executionTime;
    }



}

?>
