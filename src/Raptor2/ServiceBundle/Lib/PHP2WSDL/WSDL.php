<?php

namespace Raptor2\ServiceBundle\Lib\PHP2WSDL;

use Wingu\OctopusCore\Reflection\ReflectionClass;
use DOMDocument;
use DOMElement;
use RuntimeException;

/**
 * Create a WSDL.
 */
class WSDL {

    /**
     * The DOMDocument instance.
     *
     * @var DOMDocument
     */
    private $dom;

    /**
     * The WSDL node from the full DOMDocument.
     *
     * @var DOMDocument
     */
    private $wsdl;

    /**
     * Schema node of the WSDL.
     *
     * @var DOMElement
     */
    private $schema;

    /**
     * Types defined on schema.
     *
     * @var array
     */
    private $includedTypes;

    /**
     * Default XSD Types.
     *
     * @var array
     */
    protected static $XSDTypes = array('string' => 'xsd:string', 'bool' => 'xsd:boolean', 'boolean' => 'xsd:boolean', 'int' => 'xsd:int', 'integer' => 'xsd:int', 'double' => 'xsd:float', 'float' => 'xsd:float', 'array' => 'soap-enc:Array', 'time' => 'xsd:time', 'datetime' => 'xsd:dateTime', 'anytype' => 'xsd:anyType',
                    'unknown_type' => 'xsd:anyType', 'mixed' => 'xsd:anyType', 'object' => 'xsd:struct');

    /**
     * Constructor.
     *
     * @param string $name The name of the web service.
     * @param string $uri URI where the WSDL will be available.
     * @throws RuntimeException If the DOM Document can not be created.
     */
    public function __construct($name, $uri) {
        $wsdl = "<?xml version='1.0' ?>
                <definitions name='" . $name . "' targetNamespace='" . $uri . "'
                    xmlns='http://schemas.xmlsoap.org/wsdl/'
                    xmlns:tns='" . $uri . "'
                    xmlns:soap='http://schemas.xmlsoap.org/wsdl/soap/'
                    xmlns:xsd='http://www.w3.org/2001/XMLSchema'
                    xmlns:soap-enc='http://schemas.xmlsoap.org/soap/encoding/'
                    xmlns:wsdl='http://schemas.xmlsoap.org/wsdl/'></definitions>";

        $this->dom = new DOMDocument();
        if ($this->dom->loadXML($wsdl) === false) {
            throw new RuntimeException('Could not create DomDocument.');
        } else {
            $this->wsdl = $this->dom->documentElement;
        }

        $this->schema = $this->dom->createElement('xsd:schema');
        $this->schema->setAttribute('targetNamespace', $uri);

        // Add the import for validation.
        $import = $this->dom->createElement('xsd:import');
        $import->setAttribute('namespace', 'http://schemas.xmlsoap.org/soap/encoding/');
        $this->schema->appendChild($import);

        $types = $this->dom->createElement('types');
        $types->appendChild($this->schema);
        $this->wsdl->appendChild($types);
    }

    /**
     * Add a message element to the WSDL.
     *
     * @param string $name The name for the message.
     * @param array $parts Array of parts for the message ('name'=>'type' or 'name'=>array('type'=>'type', 'element'=>'element')).
     * @return DOMDocument
     * @link http://www.w3.org/TR/wsdl#_messages
     */
    public function addMessage($name, array $parts) {
        $message = $this->dom->createElement('message');
        $message->setAttribute('name', $name);

        foreach ($parts as $name => $type) {
            $part = $this->dom->createElement('part');
            $part->setAttribute('name', $name);
            if (is_array($type)) {
                foreach ($type as $key => $value) {
                    $part->setAttribute($key, $value);
                }
            } else {
                $part->setAttribute('type', $type);
            }

            $message->appendChild($part);
        }

        $this->wsdl->appendChild($message);

        return $message;
    }

    /**
     * Add a portType to element to the WSDL.
     *
     * @param string $name The name of the portType.
     * @return DOMDocument
     */
    public function addPortType($name) {
        $portType = $this->dom->createElement('portType');
        $portType->setAttribute('name', $name);
        $this->wsdl->appendChild($portType);

        return $portType;
    }

    /**
     * Add a binding element to the WSDL.
     *
     * @param string $name The name of the binding.
     * @param string $portType The portType to bind.
     * @return DOMDocument
     */
    public function addBinding($name, $portType) {
        $binding = $this->dom->createElement('binding');
        $binding->setAttribute('name', $name);
        $binding->setAttribute('type', $portType);

        $this->wsdl->appendChild($binding);

        return $binding;
    }

    /**
     * Add a SOAP binding element to the Binding element.
     *
     * @param DOMElement $binding The binding element (from addBinding() method).
     * @param string $style The binding style (rpc or document).
     * @param string $transport The transport method.
     * @return DOMDocument
     * @link http://www.w3.org/TR/wsdl#_soap:binding
     */
    public function addSoapBinding(DOMElement $binding, $style = 'rpc', $transport = 'http://schemas.xmlsoap.org/soap/http') {
        $soapBinding = $this->dom->createElement('soap:binding');
        $soapBinding->setAttribute('style', $style);
        $soapBinding->setAttribute('transport', $transport);

        $binding->appendChild($soapBinding);

        return $soapBinding;
    }

    /**
     * Add an operation to a binding element.
     *
     * @param DOMElement $binding The binding element (from addBinding() method).
     * @param string $name The name of the operation.
     * @param array $input Attributes for the input element (use, namespace, encodingStyle).
     * @param array $output Attributes for the output element (use, namespace, encodingStyle).
     * @return DOMDocument
     * @link http://www.w3.org/TR/wsdl#_soap:body
     */
    public function addBindingOperation(DOMElement $binding, $name, array $input = null, array $output = null) {
        $operation = $this->dom->createElement('operation');
        $operation->setAttribute('name', $name);

        if (is_array($input)) {
            $inputElement = $this->dom->createElement('input');
            $soapElement = $this->dom->createElement('soap:body');
            foreach ($input as $name => $value) {
                $soapElement->setAttribute($name, $value);
            }

            $inputElement->appendChild($soapElement);
            $operation->appendChild($inputElement);
        }

        if (is_array($output)) {
            $outputelement = $this->dom->createElement('output');
            $soapElement = $this->dom->createElement('soap:body');
            foreach ($output as $name => $value) {
                $soapElement->setAttribute($name, $value);
            }

            $outputelement->appendChild($soapElement);
            $operation->appendChild($outputelement);
        }

        $binding->appendChild($operation);

        return $operation;
    }

    /**
     * Add an operation element to a portType element.
     *
     * @param DOMElement $portType The port type element (from addPortType() method).
     * @param string $name The name of the operation.
     * @param string $inputMessage The input message.
     * @param string $outputMessage The output message.
     * @return DOMDocument
     * @link http://www.w3.org/TR/wsdl#_request-response
     */
    public function addPortOperation(DOMElement $portType, $name, $inputMessage = null, $outputMessage = null) {
        $operation = $this->dom->createElement('operation');
        $operation->setAttribute('name', $name);

        if (is_string($inputMessage) && (strlen(trim($inputMessage)) >= 1)) {
            $inputElement = $this->dom->createElement('input');
            $inputElement->setAttribute('message', $inputMessage);
            $operation->appendChild($inputElement);
        }

        if (is_string($outputMessage) && (strlen(trim($outputMessage)) >= 1)) {
            $outputElement = $this->dom->createElement('output');
            $outputElement->setAttribute('message', $outputMessage);
            $operation->appendChild($outputElement);
        }

        $portType->appendChild($operation);

        return $operation;
    }

    /**
     * Add a SOAP operation to an operation element.
     *
     * @param DOMElement $binding The binding element (from addBindingOperation() method).
     * @param string $soapAction SOAP Action.
     * @return DOMDocument
     * @link http://www.w3.org/TR/wsdl#_soap:operation
     */
    public function addSoapOperation(DOMElement $binding, $soapAction) {
        $soapOperation = $this->dom->createElement('soap:operation');
        $soapOperation->setAttribute('soapAction', $soapAction);

        $binding->insertBefore($soapOperation, $binding->firstChild);

        return $soapOperation;
    }

    /**
     * Add a service element to the WSDL.
     *
     * @param string $name Service name.
     * @param string $portName Port name.
     * @param string $binding Binding for the port.
     * @param string $location SOAP Address location.
     * @return DOMDocument
     * @link http://www.w3.org/TR/wsdl#_services
     */
    public function addService($name, $portName, $binding, $location) {
        $service = $this->dom->createElement('service');
        $service->setAttribute('name', $name);

        $port = $this->dom->createElement('port');
        $port->setAttribute('name', $portName);
        $port->setAttribute('binding', $binding);

        $soapAddress = $this->dom->createElement('soap:address');
        $soapAddress->setAttribute('location', $location);

        $port->appendChild($soapAddress);
        $service->appendChild($port);

        $this->wsdl->appendChild($service);

        return $service;
    }

    /**
     * Add a documentation element to another element in the WSDL.
     *
     * @param DOMElement $inputElement The DOMElement element to add the documentation.
     * @param string $documentation The documentation text.
     * @return DOMDocument
     * @link http://www.w3.org/TR/wsdl#_documentation
     */
    public function addDocumentation(DOMElement $inputElement, $documentation) {
        if ($inputElement === $this) {
            $element = $this->dom->documentElement;
        } else {
            $element = $inputElement;
        }

        $doc = $this->dom->createElement('documentation');
        $cdata = $this->dom->createTextNode($documentation);
        $doc->appendChild($cdata);

        if ($element->hasChildNodes()) {
            $element->insertBefore($doc, $element->firstChild);
        } else {
            $element->appendChild($doc);
        }

        return $doc;
    }

    /**
     * Add a complex type.
     *
     * @param string $type The type.
     * @param string $wsdlType The WSDL type.
     */
    public function addType($type, $wsdlType) {
        $this->includedTypes[$type] = $wsdlType;
    }

    /**
     * Get the XSD Type from a PHP type.
     *
     * @param string $type The type to get the XSD type from.
     * @return string
     */
    public function getXSDType($type) {
        if (isset(self::$XSDTypes[strtolower($type)])) {
            return self::$XSDTypes[strtolower($type)];
        } elseif ($type) {
            return $this->addComplexType($type);
        } else {
            return null;
        }
    }

    /**
     * Add a complex type.
     *
     * @param string $type Name of the class.
     * @return string
     */
    public function addComplexType($type) {
        if (isset($this->includedTypes[$type])) {
            return $this->includedTypes[$type];
        }

        if (strpos($type, '[]') !== false) {
            return $this->addComplexTypeArray(str_replace('[]', '', $type), $type);
        }

        $class = new ReflectionClass($type);

        $soapTypeName = $this->typeToQName($type);
        $soapType = 'tns:' . $soapTypeName;

        $this->addType($type, $soapType);

        $all = $this->dom->createElement('xsd:all');
        foreach ($class->getProperties() as $property) {
            if ($property->isPublic() && $property->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('var')) {
                $element = $this->dom->createElement('xsd:element');
                $element->setAttribute('name', $property->getName());
                $propertyVarAnnotation = $property->getReflectionDocComment()->getAnnotationsCollection()->getAnnotation('var');
                $element->setAttribute('type', $this->getXSDType(reset($propertyVarAnnotation)->getVarType()));
                if ($property->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('nillable')) {
                    $element->setAttribute('nillable', 'true');
                }
                $all->appendChild($element);
            }
        }

        $complexType = $this->dom->createElement('xsd:complexType');
        $complexType->setAttribute('name', $soapTypeName);
        $complexType->appendChild($all);

        $this->schema->appendChild($complexType);

        return $soapType;
    }

    /**
     * Add an array of complex type.
     *
     * @param string $singularType The type name without the '[]'.
     * @param string $type The original type name.
     * @return string
     */
    protected function addComplexTypeArray($singularType, $type) {
        $xsdComplexTypeName = 'ArrayOf' . self::typeToQName($singularType);
        $xsdComplexType = 'tns:' . $xsdComplexTypeName;

        // Register type here to avoid recursion.
        $this->addType($type, $xsdComplexType);

        // Process singular type using DefaultComplexType strategy.
        $this->addComplexType($singularType);

        // Add array type structure to WSDL document.
        $complexType = $this->dom->createElement('xsd:complexType');
        $complexType->setAttribute('name', $xsdComplexTypeName);

        $complexContent = $this->dom->createElement('xsd:complexContent');
        $complexType->appendChild($complexContent);

        $xsdRestriction = $this->dom->createElement('xsd:restriction');
        $xsdRestriction->setAttribute('base', 'soap-enc:Array');
        $complexContent->appendChild($xsdRestriction);

        $xsdAttribute = $this->dom->createElement('xsd:attribute');
        $xsdAttribute->setAttribute('ref', 'soap-enc:arrayType');
        $xsdAttribute->setAttribute('wsdl:arrayType', 'tns:' . self::typeToQName($singularType) . '[]');
        $xsdRestriction->appendChild($xsdAttribute);

        $this->schema->appendChild($complexType);

        return $xsdComplexType;
    }

    /**
     * Parse an xsd:element represented as an array into a DOMElement.
     *
     * @param array $element An xsd:element represented as an array.
     * @return DOMElement
     */
    private function parseElement(array $element) {
        $elementXml = $this->dom->createElement('xsd:element');
        foreach ($element as $key => $value) {
            if (in_array($key, array('sequence', 'all', 'choice'))) {
                if (is_array($value)) {
                    $complexType = $this->dom->createElement('xsd:complexType');
                    if (count($value) > 0) {
                        $container = $this->dom->createElement('xsd:' . $key);
                        foreach ($value as $subelement) {
                            $subelementXml = $this->parseElement($subelement);
                            $container->appendChild($subelementXml);
                        }

                        $complexType->appendChild($container);
                    }

                    $elementXml->appendChild($complexType);
                }
            } else {
                $elementXml->setAttribute($key, $value);
            }
        }

        return $elementXml;
    }

    /**
     * Add an xsd:element represented as an array to the schema.
     *
     * @param array $element An xsd:element represented as an array.
     * @return string
     */
    public function addElement(array $element) {
        $elementXml = $this->parseElement($element);
        $this->schema->appendChild($elementXml);
        return 'tns:' . $element['name'];
    }

    /**
     * Dump the WSDL as XML string.
     *
     * @return string
     */
    public function dump() {
        $this->dom->formatOutput = true;
        return $this->dom->saveXML();
    }

    /**
     * Convert a PHP type into QName.
     *
     * @param string $type The PHP type.
     * @return string
     */
    public static function typeToQName($type) {
        if ($type[0] === '\\') {
            $type = substr($type, 1);
        }

        return str_replace('\\', '.', $type);
    }
}
