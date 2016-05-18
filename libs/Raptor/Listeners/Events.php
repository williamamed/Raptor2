<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of Events
 *
 * @author William Amed
 */

namespace Raptor\Listeners;
 
interface Events{
     
     public function loadClassMetadata();
     
     public function onClear();
     
     public function onFlush();
     
     public function postFlush();
     
     public function postLoad();
     
     public function postPersist();
     
     public function postRemove();
     
     public function postUpdate();
     
     public function preFlush();
     
     public function prePersist();
     
     public function preRemove();
     
     public function preUpdate();
     
}

?>
