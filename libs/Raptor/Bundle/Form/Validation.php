<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


namespace Raptor\Bundle\Form;
/**
 * La clase Validation se utiliza para la validacion
 * de formaularios para jQuery
 *
 * @author Dinobyte
 */
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
     * Adiciona reglas de validacion de campos para el formulario
     * @param array $fields
     * @return \Raptor\Bundle\Form\Validation
     */
    function fields(array $fields) {
        $this->fields=$fields;
        return $this;
    }
    /**
     * Devuelve la logica de validacion para el formulario
     * @return string
     */
    function render() {
       return \Raptor\Raptor::getInstance()->render('@systemBundle/form/validation.html.twig',array(
           'fields'=> json_encode($this->fields),
           'formId'=> $this->formId
       ));
    }
    /**
     * Crea una instancia de esta clase
     * @param type $formId the form selector
     * @return \Raptor\Bundle\Form\Validation
     */
    static public function create($formId) {
        return new Validation($formId);
    }
}

?>
