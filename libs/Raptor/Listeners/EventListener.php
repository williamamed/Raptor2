<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of EventListener
 *
 * @author Amed
 */
namespace Raptor\Listeners;

abstract class EventListener implements \Doctrine\Common\EventSubscriber {
    
    abstract public function loadClassMetadata(\Doctrine\ORM\Event\LoadClassMetadataEventArgs $e);
     
    abstract public function onClear(\Doctrine\ORM\Event\OnClearEventArgs $e);
     
    abstract public function onFlush(\Doctrine\ORM\Event\OnFlushEventArgs $e);
     
    abstract public function postFlush(\Doctrine\ORM\Event\PostFlushEventArgs $e);
     
    abstract public function postLoad(\Doctrine\Common\EventArgs $e);
     
    abstract public function postPersist(\Doctrine\Common\EventArgs $e);
     
    abstract public function postRemove(\Doctrine\Common\EventArgs $e);
     
    abstract public function postUpdate(\Doctrine\Common\EventArgs $e);
     
    abstract public function preFlush(\Doctrine\ORM\Event\PreFlushEventArgs $e);
     
    abstract public function prePersist(\Doctrine\Common\EventArgs $e);
     
    abstract public function preRemove(\Doctrine\Common\EventArgs $e);
     
    abstract public function preUpdate(\Doctrine\ORM\Event\PreUpdateEventArgs $e);
    
    public function getSubscribedEvents()
    {
        return array(
            \Doctrine\ORM\Events::loadClassMetadata,
            \Doctrine\ORM\Events::onClear,
            \Doctrine\ORM\Events::onFlush,
            \Doctrine\ORM\Events::postFlush,
            \Doctrine\ORM\Events::postLoad,
            \Doctrine\ORM\Events::postPersist,
            \Doctrine\ORM\Events::postRemove,
            \Doctrine\ORM\Events::postUpdate,
            \Doctrine\ORM\Events::preFlush,
            \Doctrine\ORM\Events::prePersist,
            \Doctrine\ORM\Events::preRemove,
            \Doctrine\ORM\Events::preUpdate
                );
    }
}

?>
