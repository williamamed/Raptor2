<?php

/**
 * Raptor - Integration PHP 5 framework
 *
 * @author      William Amed <watamayo90@gmail.com>, Otto Haus <ottohaus@gmail.com>
 * @copyright   2014 
 * @link        http://dinobyte.net
 * @version     2.0.1
 * @package     Raptor
 *
 * MIT LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Description of SecureHash
 *
 * @author DinoByte
 */

namespace Raptor\Security;

require_once __DIR__ . '/../lib/password.php';
/**
 * Esta clase hashea y verifica hash de contraseñas realizados
 */
class SecureHash {
    /**
     * Hashea una contraseña o texto dado
     * @param string $password el texto o la contraseña a hashear
     * @return string
     * @throws \RuntimeException lanza esta excepcion si la plataforma PHP no es compatible
     */
    static public function hash($password) {

        if (!function_exists('password_hash')) {
            throw new \RuntimeException('The function password_hash() does not exist, your PHP environment is probably incompatible. Try running [vendor/ircmaxell/password-compat/version-test.php] to check compatibility or use an alternative hashing strategy.');
        }

        if (($hash = password_hash($password, PASSWORD_BCRYPT)) === false) {
            throw new \RuntimeException('Error generating hash from string, your PHP environment is probably incompatible. Try running [vendor/ircmaxell/password-compat/version-test.php] to check compatibility or use an alternative hashing strategy.');
        }

        return $hash;
    }
    /**
     * Verifica si el hash proporcionado como segundo parametro corresponde al texto o contraseña especificado
     * @param string $password texto o la contraseña
     * @param string $hash hash a verificar contra el primer parametro
     * @return type
     * @throws \RuntimeException lanza esta excepcion si la funcion password_verify() no existe
     */
    static public function verify($password, $hash) {

        if (!function_exists('password_verify')) {
            throw new \RuntimeException('The function password_verify() does not exist, your PHP environment is probably incompatible. Try running [vendor/ircmaxell/password-compat/version-test.php] to check compatibility or use an alternative hashing strategy.');
        }

        return password_verify($password, $hash);
    }

}

?>
