<?php

namespace Raptor\Component\systemBundle\Model\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Raptor\Component\systemBundle\Model\Entity\RaptorSession
 *
 * @Table(name="raptor_session")
 * @Entity(repositoryClass="Raptor\Component\systemBundle\Model\Repository\RaptorSessionRepository")
 */
class RaptorSession
{
    /**
     * @var integer $id
     *
     * @Column(name="id", type="integer", nullable=false)
     * @Id
     * @GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string $name
     *
     * @Column(name="name", type="string", length=255, nullable=false)
     */
    private $name;

    /**
     * @var text $data
     *
     * @Column(name="data", type="text", nullable=false)
     */
    private $data;

    /**
     * @var integer $time
     *
     * @Column(name="time", type="integer", nullable=false)
     */
    private $time;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set name
     *
     * @param string $name
     * @return RaptorSession
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * Get name
     *
     * @return string 
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set data
     *
     * @param text $data
     * @return RaptorSession
     */
    public function setData($data)
    {
        $this->data = $data;
        return $this;
    }

    /**
     * Get data
     *
     * @return text 
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Set time
     *
     * @param integer $time
     * @return RaptorSession
     */
    public function setTime($time)
    {
        $this->time = $time;
        return $this;
    }

    /**
     * Get time
     *
     * @return integer 
     */
    public function getTime()
    {
        return $this->time;
    }
}