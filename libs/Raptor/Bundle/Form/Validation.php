<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * This class is used to form validation
 *
 * @author Dinobyte
 */
namespace Raptor\Bundle\Form;

class Validation {
    private $formId;
    private $fields;
    /**
     * 
     * @param type $formId the form selector
     */
    function __construct($formId) {
        $this->formId = $formId;
    }
    /**
     * Add the validation rules to the specified form
     * @param array $fields
     * @return \Raptor\Bundle\Form\Validation
     */
    function fields(array $fields) {
        $this->fields=$fields;
        return $this;
    }
    /**
     * Return the validation logic to the specified form
     * @return string
     */
    function render() {
       return \Raptor\Raptor::getInstance()->render('@systemBundle/form/validation.html.twig',array(
           'fields'=> json_encode($this->fields),
           'formId'=> $this->formId
       ));
    }
    /**
     * Create a Validation Form instance
     * @param type $formId the form selector
     * @return \Raptor\Bundle\Form\Validation
     */
    static public function create($formId) {
        return new Validation($formId);
    }
}

?>
