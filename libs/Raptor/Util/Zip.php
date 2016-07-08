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
namespace Raptor\Util;
/**
 * 
 * La clase ZIP comprime y descomprime archivos ZIP
 * [NECESITA LA EXTENSION ZIP ACTIVADA]
 */
class Zip {
    /**
     *
     * @var \ZipArchive
     */
    private $zip;
    private $name;
    private $content;
    /**
     * 
     * @param string $name this is the path name of the zip file
     */
    function __construct($name=NULL) {
        $this->name = $name;
        $this->zip=new \ZipArchive();
    }

    /**
     * 
     * Crea un archivo ZIP de la ruta especificada, puede ser un archivo o directorio
     * Devuelve TRUE si el archivo fue comprimido correctamente, FALSE en caso contrario
     * @param string $path archivo o directorio a comprimir
     * @return boolean
     */
    public function create($path) {
        $path=  realpath($path);
        $relative=  str_replace('\\','/', $path);
        $relative=  explode('/',$relative);
        $relative=$relative[count($relative)-1];
        $location=  \Raptor\Core\Location::get(\Raptor\Core\Location::CACHE);
        $output=false;
        if($this->name==NULL){
            $this->name=$location."/temp_".rand (10,900000).'.zip';
            $output=true;
        }
        $res = $this->zip->open($this->name, \ZipArchive::CREATE);
        if ($res === TRUE) {
            if(is_dir($path)){
                
                foreach (glob($path.'/*') as $value) {
                    if(is_dir($value))
                        $this->add($value,$relative);
                    else{
                        $name=strstr($value, $relative);
                        
                        $this->zip->addFile($value, $name );
                    }

                }
            }else{
                $this->zip->addFile($path);
            }
            $this->zip->close();
            if($output){
                $this->content=  file_get_contents($this->name);
                @unlink($this->name);
            }
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * 
     * Retorna el contenido del archivo ZIP
     * Para retornos hacia el cliente necesitas establecer el contentType en la respuesta
     * @return string
     */
    public function output() {
        return $this->content;
    }
    
    private function add($ruta,$relative) {
        foreach (glob($ruta.'/*') as $value) {
                if(is_dir($value))
                    $this->add($value,$relative);
                else{
                        $name=strstr($value, $relative);
                        $this->zip->addFile($value, $name );
                }
        }
    }
    /**
     * 
     * Extrae el archivo ZIP en el destino especificado
     * @param string $to destino donde descomprimir el archivo
     * @return boolean
     */
    public function extract($to) {
        if ($this->zip->open($this->name) === true) {
            $this->zip->extractTo($to);
            $this->zip->close();
            return true;
        }
        return false;
    }
}

?>
