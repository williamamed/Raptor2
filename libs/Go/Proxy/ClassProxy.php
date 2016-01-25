<?php
/**
 * Go! AOP framework
 *
 * @copyright Copyright 2012, Lisachenko Alexander <lisachenko.it@gmail.com>
 *
 * This source file is subject to the license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Go\Proxy;

use Go\Aop\Advice;
use Go\Aop\Features;
use Go\Aop\Framework\MethodInvocationComposer;
use Go\Aop\Intercept\Joinpoint;
use Go\Aop\IntroductionInfo;
use Go\Core\AspectContainer;
use Go\Core\AspectKernel;
use Go\Core\LazyAdvisorAccessor;
use Reflection;
use ReflectionClass;
use ReflectionMethod as Method;
use ReflectionProperty as Property;
use TokenReflection\ReflectionClass as ParsedClass;
use TokenReflection\ReflectionMethod as ParsedMethod;
use TokenReflection\ReflectionParameter as ParsedParameter;
use TokenReflection\ReflectionProperty as ParsedProperty;

/**
 * Class proxy builder that is used to generate a child class from the list of joinpoints
 */
class ClassProxy extends AbstractProxy
{
    /**
     * Parent class reflection
     *
     * @var null|ParsedClass
     */
    protected $class = null;

    /**
     * Parent class name, can be changed manually
     *
     * @var string
     */
    protected $parentClassName = null;

    /**
     * Source code for methods
     *
     * @var array Name of method => source code for it
     */
    protected $methodsCode = array();

    /**
     * Static mappings for class name for excluding if..else check
     *
     * @var null|array
     */
    protected static $invocationClassMap = null;

    /**
     * List of additional interfaces to implement
     *
     * @var array
     */
    protected $interfaces = array();

    /**
     * List of additional traits for using
     *
     * @var array
     */
    protected $traits = array();

    /**
     * Source code for properties
     *
     * @var array Name of property => source code for it
     */
    protected $propertiesCode = array();

    /**
     * Name for the current class
     *
     * @var string
     */
    protected $name = '';

    /**
     * Flag to determine if we need to add a code for property interceptors
     *
     * @var bool
     */
    private $isFieldsIntercepted = false;

    /**
     * List of intercepted properties names
     *
     * @var array
     */
    private $interceptedProperties = array();

    /**
     * Generates an child code by parent class reflection and joinpoints for it
     *
     * @param ParsedClass $parent Parent class reflection
     * @param array|Advice[] $classAdvices List of advices for class
     * @param bool $useStaticForLsb Should proxy use 'static::class' instead of '\get_called_class()'
     *
     * @throws \InvalidArgumentException if there are unknown type of advices
     * @return ClassProxy
     */
    public function __construct(ParsedClass $parent, array $classAdvices, $useStaticForLsb = false)
    {
        parent::__construct($classAdvices, $useStaticForLsb);

        $this->class           = $parent;
        $this->name            = $parent->getShortName();
        $this->parentClassName = $parent->getShortName();

        $this->addInterface('\Go\Aop\Proxy');
        $this->addJoinpointsProperty();

        foreach ($classAdvices as $type => $typedAdvices) {

            switch ($type) {
                case AspectContainer::METHOD_PREFIX:
                case AspectContainer::STATIC_METHOD_PREFIX:
                    foreach ($typedAdvices as $joinPointName => $advice) {
                        $method = $parent->getMethod($joinPointName);
                        if (!$method instanceof ParsedMethod) {
                            continue;
                        }
                        $this->overrideMethod($method);
                    }
                    break;

                case AspectContainer::PROPERTY_PREFIX:
                    foreach ($typedAdvices as $joinPointName => $advice) {
                        $property = $parent->getProperty($joinPointName);
                        if (!$property instanceof ParsedProperty) {
                            continue;
                        }
                        $this->interceptProperty($property);
                    }
                    break;

                case AspectContainer::INTRODUCTION_TRAIT_PREFIX:
                    foreach ($typedAdvices as $advice) {
                        /** @var $advice IntroductionInfo */
                        foreach ($advice->getInterfaces() as $interface) {
                            $this->addInterface($interface);
                        }
                        foreach ($advice->getTraits() as $trait) {
                            $this->addTrait($trait);
                        }
                    }
                    break;

                case AspectContainer::INIT_PREFIX:
                case AspectContainer::STATIC_INIT_PREFIX:
                    break; // No changes for class

                default:
                    throw new \InvalidArgumentException("Unsupported point `$type`");
            }
        }
    }


    /**
     * Updates parent name for child
     *
     * @param string $newParentName New class name
     *
     * @return static
     */
    public function setParentName($newParentName)
    {
        $this->parentClassName = $newParentName;

        return $this;
    }

    /**
     * Override parent method with new body
     *
     * @param string $methodName Method name to override
     * @param string $body New body for method
     *
     * @return static
     */
    public function override($methodName, $body)
    {
        $this->methodsCode[$methodName] = $this->getOverriddenMethod($this->class->getMethod($methodName), $body);

        return $this;
    }

    /**
     * Creates a method
     *
     * @param int $methodFlags See ReflectionMethod modifiers
     * @param string $methodName Name of the method
     * @param bool $byReference Is method should return value by reference
     * @param string $body Body of method
     * @param string $parameters Definition of parameters
     *
     * @return static
     */
    public function setMethod($methodFlags, $methodName, $byReference, $body, $parameters)
    {
        $this->methodsCode[$methodName] = (
            "/**\n * Method was created automatically, do not change it manually\n */\n" .
            join(' ', Reflection::getModifierNames($methodFlags)) . // List of method modifiers
            ' function ' . // 'function' keyword
            ($byReference ? '&' : '') . // Return value by reference
            $methodName . // Method name
            '(' . // Start of parameter list
            $parameters . // List of parameters
            ")\n" . // End of parameter list
            "{\n" . // Start of method body
            $this->indent($body) . "\n" . // Method body
            "}\n" // End of method body
        );

        return $this;
    }

    /**
     * Inject advices into given class
     *
     * NB This method will be used as a callback during source code evaluation to inject joinpoints
     *
     * @param string $className Aop child proxy class
     * @param array|Advice[] $advices List of advices to inject into class
     *
     * @return void
     */
    public static function injectJoinPoints($className, array $advices = array())
    {
        $reflectionClass  = new ReflectionClass($className);
        $joinPoints       = static::wrapWithJoinPoints($advices, $reflectionClass->getParentClass()->name);

        $prop = $reflectionClass->getProperty('__joinPoints');
        $prop->setAccessible(true);
        $prop->setValue($joinPoints);

        $staticInit = AspectContainer::STATIC_INIT_PREFIX . ':root';
        if (isset($joinPoints[$staticInit])) {
            $joinPoints[$staticInit]->__invoke();
        }
    }

    /**
     * Initialize static mappings to reduce the time for checking features
     *
     * @param bool $useClosureBinding Enables usage of closures instead of reflection
     * @param bool $useSplatOperator Enables usage of optimized invocation with splat operator
     */
    protected static function setMappings($useClosureBinding, $useSplatOperator)
    {
        $dynamicMethodClass = MethodInvocationComposer::compose(false, $useClosureBinding, $useSplatOperator, false);
        $staticMethodClass  = MethodInvocationComposer::compose(true, $useClosureBinding, $useSplatOperator, false);

        // We are using LSB here and overridden static property
        static::$invocationClassMap = array(
            AspectContainer::METHOD_PREFIX        => $dynamicMethodClass,
            AspectContainer::STATIC_METHOD_PREFIX => $staticMethodClass,
            AspectContainer::PROPERTY_PREFIX      => 'Go\Aop\Framework\ClassFieldAccess',
            AspectContainer::STATIC_INIT_PREFIX   => 'Go\Aop\Framework\StaticInitializationJoinpoint',
            AspectContainer::INIT_PREFIX          => 'Go\Aop\Framework\ReflectionConstructorInvocation'
        );
    }

    /**
     * Wrap advices with joinpoint object
     *
     * @param array|Advice[] $classAdvices Advices for specific class
     * @param string $className Name of the original class to use
     *
     * @throws \UnexpectedValueException If joinPoint type is unknown
     *
     * NB: Extension should be responsible for wrapping advice with join point.
     *
     * @return array|Joinpoint[] returns list of joinpoint ready to use
     */
    protected static function wrapWithJoinPoints($classAdvices, $className)
    {
        /** @var LazyAdvisorAccessor $accessor */
        static $accessor = null;

        if (!self::$invocationClassMap) {
            $aspectKernel = AspectKernel::getInstance();
            $accessor     = $aspectKernel->getContainer()->get('aspect.advisor.accessor');
            self::setMappings(
                $aspectKernel->hasFeature(Features::USE_CLOSURE),
                $aspectKernel->hasFeature(Features::USE_SPLAT_OPERATOR)
            );
        }

        $joinPoints = array();

        foreach ($classAdvices as $joinPointType => $typedAdvices) {
            // if not isset then we don't want to create such invocation for class
            if (!isset(self::$invocationClassMap[$joinPointType])) {
                continue;
            }
            foreach ($typedAdvices as $joinPointName => $advices) {
                $filledAdvices = array();
                foreach ($advices as $advisorName) {
                    $filledAdvices[] = $accessor->$advisorName;
                }

                $joinpoint = new self::$invocationClassMap[$joinPointType]($className, $joinPointName, $filledAdvices);
                $joinPoints["$joinPointType:$joinPointName"] = $joinpoint;
            }
        }

        return $joinPoints;
    }

    /**
     * Add an interface for child
     *
     * @param string|ReflectionClass|ParsedClass $interface
     *
     * @throws \InvalidArgumentException If object is not an interface
     */
    public function addInterface($interface)
    {
        $interfaceName = $interface;
        if ($interface instanceof ReflectionClass || $interface instanceof ParsedClass) {
            if (!$interface->isInterface()) {
                throw new \InvalidArgumentException("Interface expected to add");
            }
            $interfaceName = $interface->name;
        }
        // Use absolute namespace to prevent NS-conflicts
        $this->interfaces[] = '\\' . ltrim($interfaceName, '\\');
    }

    /**
     * Add a trait for child
     *
     * @param string|ReflectionClass|ParsedClass $trait
     *
     * @throws \InvalidArgumentException If object is not a trait
     */
    public function addTrait($trait)
    {
        $traitName = $trait;
        if ($trait instanceof ReflectionClass || $trait instanceof ParsedClass) {
            if (!$trait->isTrait()) {
                throw new \InvalidArgumentException("Trait expected to add");
            }
            $traitName = $trait->name;
        }
        // Use absolute namespace to prevent NS-conflicts
        $this->traits[] = '\\' . ltrim($traitName, '\\');
    }

    /**
     * Creates a property
     *
     * @param int $propFlags See ReflectionProperty modifiers
     * @param string $propName Name of the property
     * @param null|string $defaultText Default value, should be string text!
     *
     * @return static
     */
    public function setProperty($propFlags, $propName, $defaultText = null)
    {
        $this->propertiesCode[$propName] = (
            "/**\n * Property was created automatically, do not change it manually\n */\n" . // Doc-block
            join(' ', Reflection::getModifierNames($propFlags)) . // List of modifiers for property
            ' $' . // Space and vaiable symbol
            $propName . // Name of the property
            (is_string($defaultText) ? " = $defaultText" : '') . // Default value if present
            ";\n" // End of line with property definition
        );

        return $this;
    }

    /**
     * Adds a definition for joinpoints private property in the class
     *
     * @return void
     */
    protected function addJoinpointsProperty()
    {
        $this->setProperty(
            Property::IS_PRIVATE | Property::IS_STATIC,
            '__joinPoints',
            'array()'
        );
    }

    /**
     * Override parent method with joinpoint invocation
     *
     * @param ParsedMethod $method Method reflection
     */
    protected function overrideMethod(ParsedMethod $method)
    {
        // temporary disable override of final methods
        if (!$method->isFinal() && !$method->isAbstract()) {
            $this->override($method->name, $this->getJoinpointInvocationBody($method));
        }
    }

    /**
     * Creates definition for method body
     *
     * @param ParsedMethod $method Method reflection
     *
     * @return string new method body
     */
    protected function getJoinpointInvocationBody(ParsedMethod $method)
    {
        $isStatic = $method->isStatic();
        $scope    = $isStatic ? $this->staticLsbExpression : '$this';
        $prefix   = $isStatic ? AspectContainer::STATIC_METHOD_PREFIX : AspectContainer::METHOD_PREFIX;

        $args = join(', ', array_map(function (ParsedParameter $param) {
            $byReference = $param->isPassedByReference() ? '&' : '';

            return $byReference . '$' . $param->name;
        }, $method->getParameters()));

        $body = '';

        if (($this->class->name === $method->getDeclaringClassName()) && strpos($method->getSource(), 'func_get_args') !== false) {
            $body = '$argsList = \func_get_args();' . PHP_EOL;
            if (empty($args)) {
                $scope = "$scope, \$argsList";
            } else {
                $scope = "$scope, array($args) + \$argsList";
            }
        } elseif (!empty($args)) {
            $scope = "$scope, array($args)";
        }

        $body .= "return self::\$__joinPoints['{$prefix}:{$method->name}']->__invoke($scope);";

        return $body;
    }

    /**
     * Makes property intercepted
     *
     * @param ParsedProperty $property Reflection of property to intercept
     */
    protected function interceptProperty(ParsedProperty $property)
    {
        $this->interceptedProperties[] = is_object($property) ? $property->name : $property;
        $this->isFieldsIntercepted = true;
    }

    /**
     * {@inheritDoc}
     */
    public function __toString()
    {
        $ctor = $this->class->getConstructor();
        if ($this->isFieldsIntercepted && (!$ctor || !$ctor->isPrivate())) {
            $this->addFieldInterceptorsCode($ctor);
        }

        $prefix = join(' ', Reflection::getModifierNames($this->class->getModifiers()));

        $classCode = (
            $this->class->getDocComment() . "\n" . // Original doc-block
            ($prefix ? "$prefix " : '') . // List of class modifiers
            'class ' . // 'class' keyword with one space
            $this->name . // Name of the class
            ' extends '. // 'extends' keyword with
            $this->parentClassName . // Name of the parent class
            ($this->interfaces ? ' implements ' . join(', ', $this->interfaces) : '') . "\n" . // Interfaces list
            "{\n" . // Start of class definition
            ($this->traits ? $this->indent('use ' . join(', ', $this->traits) .';'."\n") : '') . "\n" . // Traits list
            $this->indent(join("\n", $this->propertiesCode)) . "\n" . // Property definitions
            $this->indent(join("\n", $this->methodsCode)) . "\n" . // Method definitions
            "}" // End of class definition
        );

        return $classCode
            // Inject advices on call
            . PHP_EOL
            . '\\' . __CLASS__ . "::injectJoinPoints('"
                . $this->class->name . "',"
                . var_export($this->advices, true) . ");";
    }

    /**
     * Add code for intercepting properties
     *
     * @param null|ParsedMethod $constructor Constructor reflection or null
     */
    protected function addFieldInterceptorsCode(ParsedMethod $constructor = null)
    {
        $byReference = false;
        $this->setProperty(Property::IS_PRIVATE, '__properties', 'array()');
        $this->setMethod(Method::IS_PUBLIC, '__get', $byReference, $this->getMagicGetterBody(), '$name');
        $this->setMethod(Method::IS_PUBLIC, '__set', $byReference, $this->getMagicSetterBody(), '$name, $value');
        $this->isFieldsIntercepted = true;
        if ($constructor) {
            $this->override('__construct', $this->getConstructorBody($constructor, true));
        } else {
            $this->setMethod(Method::IS_PUBLIC, '__construct', $byReference, $this->getConstructorBody(), '');
        }
    }

    /**
     * Creates a method code from Reflection
     *
     * @param ParsedMethod $method Reflection for method
     * @param string $body Body of method
     *
     * @return string
     */
    protected function getOverriddenMethod(ParsedMethod $method, $body)
    {
        $code = (
            preg_replace('/ {4}|\t/', '', $method->getDocComment()) . "\n" . // Original Doc-block
            join(' ', Reflection::getModifierNames($method->getModifiers())) . // List of modifiers
            ' function ' . // 'function' keyword
            ($method->returnsReference() ? '&' : '') . // By reference symbol
            $method->name . // Name of the method
            '(' . // Start of parameters list
            join(', ', $this->getParameters($method->getParameters())) . // List of parameters
            ")\n" . // End of parameters list
            "{\n" . // Start of method body
            $this->indent($body) . "\n" . // Method body
            "}\n" // End of method body
        );

        return $code;
    }

    /**
     * Returns a code for magic getter to perform interception
     *
     * @return string
     */
    private function getMagicGetterBody()
    {
        return <<<'GETTER'
if (\array_key_exists($name, $this->__properties)) {
    return self::$__joinPoints["prop:$name"]->__invoke(
        $this,
        \Go\Aop\Intercept\FieldAccess::READ,
        $this->__properties[$name]
    );
} elseif (\method_exists(\get_parent_class(), __FUNCTION__)) {
    return parent::__get($name);
} else {
    trigger_error("Trying to access undeclared property {$name}");

    return null;
}
GETTER;
    }

    /**
     * Returns a code for magic setter to perform interception
     *
     * @return string
     */
    private function getMagicSetterBody()
    {
        return <<<'SETTER'
if (\array_key_exists($name, $this->__properties)) {
    $this->__properties[$name] = self::$__joinPoints["prop:$name"]->__invoke(
        $this,
        \Go\Aop\Intercept\FieldAccess::WRITE,
        $this->__properties[$name],
        $value
    );
} elseif (\method_exists(\get_parent_class(), __FUNCTION__)) {
    parent::__set($name, $value);
} else {
    $this->$name = $value;
}
SETTER;
    }

    /**
     * Returns constructor code
     *
     * @param ParsedMethod $constructor Constructor reflection
     * @param bool $isCallParent Is there is a need to call parent code
     *
     * @return string
     */
    private function getConstructorBody(ParsedMethod $constructor = null, $isCallParent = false)
    {
        $assocProperties = array();
        $listProperties  = array();
        foreach ($this->interceptedProperties as $propertyName) {
            $assocProperties[] = "'$propertyName' => \$this->$propertyName";
            $listProperties[]  = "\$this->$propertyName";
        }
        $assocProperties = $this->indent(join(',' . PHP_EOL, $assocProperties));
        $listProperties  = $this->indent(join(',' . PHP_EOL, $listProperties));
        if ($constructor) {
            $parentCall = $this->getJoinpointInvocationBody($constructor);
        } elseif ($isCallParent) {
            $parentCall = '\call_user_func_array(array("parent", __FUNCTION__), \func_get_args());';
        } else {
            $parentCall = '';
        }

        return <<<CTOR
\$this->__properties = array(
$assocProperties
);
unset(
$listProperties
);
$parentCall
CTOR;
    }
}
