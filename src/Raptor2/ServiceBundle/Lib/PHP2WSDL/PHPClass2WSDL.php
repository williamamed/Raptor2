<?php

namespace Raptor2\ServiceBundle\Lib\PHP2WSDL;

use Wingu\OctopusCore\Reflection\ReflectionClass;
use DOMElement;

/**
 * Generate a WSDL from a PHP class.
 */
class PHPClass2WSDL {

    /**
     * The class to transform.
     *
     * @var string
     */
    protected $class;

    /**
     * The URL of the web service.
     *
     * @var string
     */
    protected $uri;

    /**
     * The WSDL document.
     *
     * @var \PHP2WSDL\WSDL
     */
    protected $wsdl;

    /**
     * The soap:operation style.
     *
     * @var array
     */
    protected $bindingStyle = array('style' => 'rpc', 'transport' => 'http://schemas.xmlsoap.org/soap/http');

    /**
     * The soap:body operation style options.
     *
     * @var array
     */
    protected $operationBodyStyle = array('use' => 'encoded', 'encodingStyle' => 'http://schemas.xmlsoap.org/soap/encoding/');

    /**
     * Constrcutor.
     *
     * @param string $class The class name from which to generate the WSDL.
     * @param string $uri The web service URL.
     */
    public function __construct($class, $uri) {
        if (is_string($class)) {
            $this->class = $class;
        } else {
            $this->class = get_class($class);
        }

        $this->uri = $uri;
    }

    /**
     * Set the binding style.
     *
     * @param string $style The style (rpc or document).
     * @param string $transport The transport.
     * @return \PHP2WSDL\PHPClass2WSDL
     */
    public function setBindingStyle($style, $transport) {
        $this->bindingStyle['style'] = $style;
        $this->bindingStyle['transport'] = $transport;
        return $this;
    }

    /**
     * Generate the WSDL DOMDocument.
     *
     * @param boolean $withAnnotation Flag if only the methods with '@soap' annotation should be added.
     */
    public function generateWSDL($withAnnotation = false) {
        $qNameClassName = WSDL::typeToQName($this->class);

        $this->wsdl = new WSDL($qNameClassName, $this->uri);

        $port = $this->wsdl->addPortType($qNameClassName . 'Port');
        $binding = $this->wsdl->addBinding($qNameClassName . 'Binding', 'tns:' . $qNameClassName . 'Port');

        $this->wsdl->addSoapBinding($binding, $this->bindingStyle['style'], $this->bindingStyle['transport']);
        $this->wsdl->addService($qNameClassName . 'Service', $qNameClassName . 'Port', 'tns:' . $qNameClassName . 'Binding', $this->uri);

        $ref = new ReflectionClass($this->class);
        foreach ($ref->getMethods() as $method) {
            if ($withAnnotation === false || $method->getReflectionDocComment()->getAnnotationsCollection()->hasAnnotationTag('soap')) {
                $this->addMethodToWsdl($method, $port, $binding);
            }
        }
    }

    /**
     * Add a method to the WSDL.
     *
     * @param \Wingu\OctopusCore\Reflection\ReflectionMethod $method The reflection of the method to add.
     * @param DOMElement $port The portType element.
     * @param DOMElement $binding The binding element.
     */
    protected function addMethodToWsdl(\Wingu\OctopusCore\Reflection\ReflectionMethod $method, DOMElement $port, DOMElement $binding) {
        $qNameMethodName = WSDL::typeToQName($method->getName());

        $args = array();
        $annotations = array();
        $methodAnnotationsCollection = $method->getReflectionDocComment()->getAnnotationsCollection();
        if ($methodAnnotationsCollection->hasAnnotationTag('param')) {
            foreach ($methodAnnotationsCollection->getAnnotation('param') as $param) {
                $annotations[$param->getParamName()] = $param;
            }
        }

        if ($this->bindingStyle['style'] === 'document') {
            $sequence = array();
            foreach ($method->getParameters() as $param) {
                $type = 'anytype';
                if (isset($annotations['$' . $param->getName()])) {
                    $type = $annotations['$' . $param->getName()]->getParamType();
                }

                $sequenceElement = array('name' => $param->getName(), 'type' => $this->wsdl->getXSDType($type));
                if ($param->isOptional()) {
                    $sequenceElement['nillable'] = 'true';
                }

                $sequence[] = $sequenceElement;
            }

            $element = array('name' => $qNameMethodName, 'sequence' => $sequence);
            $args['parameters'] = array('element' => $this->wsdl->addElement($element));
        } else {
            foreach ($method->getParameters() as $param) {
                $type = 'anytype';
                if (isset($annotations['$' . $param->getName()])) {
                    $type = $annotations['$' . $param->getName()]->getParamType();
                }

                $args[$param->getName()] = array('type' => $this->wsdl->getXSDType($type));
            }
        }

        $this->wsdl->addMessage($qNameMethodName . 'In', $args);

        $returnType = null;
        if ($methodAnnotationsCollection->hasAnnotationTag('return') === true) {
			$annotation = $methodAnnotationsCollection->getAnnotation('return');
            $annotation = reset($annotation);
            $returnType = $annotation->getReturnType();
        }

        $isOneWayMessage = ($returnType === null);

        if ($isOneWayMessage === false) {
            $args = array();
            if ($this->bindingStyle['style'] === 'document') {
                $sequence = array();
                if ($returnType !== null) {
                    $sequence[] = array('name' => $qNameMethodName . 'Result', 'type' => $this->wsdl->getXSDType($returnType));
                }

                $element = array('name' => $qNameMethodName . 'Response', 'sequence' => $sequence);
                $args['parameters'] = array('element' => $this->wsdl->addElement($element));
            } elseif ($returnType !== null) {
                $args['return'] = array('type' => $this->wsdl->getXSDType($returnType));
            }

            $this->wsdl->addMessage($qNameMethodName . 'Out', $args);
        }

        // Add the portType operation.
        if ($isOneWayMessage === false) {
            $portOperation = $this->wsdl->addPortOperation($port, $qNameMethodName, 'tns:' . $qNameMethodName . 'In', 'tns:' . $qNameMethodName . 'Out');
        } else {
            $portOperation = $this->wsdl->addPortOperation($port, $qNameMethodName, 'tns:' . $qNameMethodName . 'In', false);
        }

        // Add any documentation for the operation.
        $description = $method->getReflectionDocComment()->getFullDescription();
        if (strlen($description) > 0) {
            $this->wsdl->addDocumentation($portOperation, $description);
        }

        // When using the RPC style, make sure the operation style includes a 'namespace' attribute (WS-I Basic Profile 1.1 R2717).
        if ($this->bindingStyle['style'] === 'rpc' && isset($this->operationBodyStyle['namespace']) === false) {
            $this->operationBodyStyle['namespace'] = '' . $this->uri;
        }

        // Add the binding operation.
        $operation = $this->wsdl->addBindingOperation($binding, $qNameMethodName, $this->operationBodyStyle, $this->operationBodyStyle);
        $this->wsdl->addSoapOperation($operation, $this->uri . '#' . $qNameMethodName);
    }

    /**
     * Dump the WSDL as XML string.
     *
     * @return string
     */
    public function dump() {
        return $this->wsdl->dump();
    }
}
