<?php

/**
 * Example authentication source - username & password.
 *
 * This class is an example authentication source which stores all username/passwords in an array,
 * and authenticates users against this array.
 *
 * @author Olav Morken, UNINETT AS.
 * @package simpleSAMLphp
 */


class sspmod_raptor2_Auth_Source_RaptorSource extends sspmod_core_Auth_UserPassBase {


	/**
	 * Our users, stored in an associative array. The key of the array is "<username>:<password>",
	 * while the value of each element is a new array with the attributes for each user.
	 */
	private $users;


	/**
	 * Constructor for this authentication source.
	 *
	 * @param array $info  Information about this authentication source.
	 * @param array $config  Configuration.
	 */
	public function __construct($info, $config) {
		assert('is_array($info)');
		assert('is_array($config)');

		/* Call the parent constructor first, as required by the interface. */
		parent::__construct($info, $config);

		$this->users = array();

		/* Validate and parse our configuration. */
		foreach ($config as $userpass => $attributes) {
			if (!is_string($userpass)) {
				throw new Exception('Invalid <username>:<password> for authentication source ' .
					$this->authId . ': ' . $userpass);
			}

			$userpass = explode(':', $userpass, 2);
			if (count($userpass) !== 2) {
				throw new Exception('Invalid <username>:<password> for authentication source ' .
					$this->authId . ': ' . $userpass[0]);
			}
			$username = $userpass[0];
			$password = $userpass[1];

			try {
				$attributes = SimpleSAML_Utilities::parseAttributes($attributes);
			} catch(Exception $e) {
				throw new Exception('Invalid attributes for user ' . $username .
					' in authentication source ' . $this->authId . ': ' .
					$e->getMessage());
			}

			$this->users[$username . ':' . $password] = $attributes;
		}
	}


	/**
	 * Attempt to log in using the given username and password.
	 *
	 * On a successful login, this function should return the users attributes. On failure,
	 * it should throw an exception. If the error was caused by the user entering the wrong
	 * username or password, a SimpleSAML_Error_Error('WRONGUSERPASS') should be thrown.
	 *
	 * Note that both the username and the password are UTF-8 encoded.
	 *
	 * @param string $username  The username the user wrote.
	 * @param string $password  The password the user wrote.
	 * @return array  Associative array with the users attributes.
	 */
	protected function login($username, $password) {

        assert('is_string($username)');
        assert('is_string($password)');

        $file = @fopen(Raptor2\SyntarsusBundle\Saml\SAMLConfig::getBaseUrl()."/index.php/service/syntarsus/login?username=$username&password=$password", "r");
        if (!$file) {
            throw new SimpleSAML_Error_Error('WRONGUSERPASS');
        }
        
        $line = fgets($file, 1024);
        fclose($file);
        $text=  json_decode($line);
        if($text===NULL or $text===false)
            throw new SimpleSAML_Error_Error('WRONGUSERPASS');
        if ($text->login == false) {
            throw new SimpleSAML_Error_Error('WRONGUSERPASS');
        } else {
            
                
                foreach ($text->attr as $key => $value) {
                    $result[$key] = array($value);
                }
               
                return $result;
            
        }
    }

}

?>