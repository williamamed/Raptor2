<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of FileSystem
 * All Right Reserved
 * @author DinoByte
 */
namespace Raptor\Util;

class Files {
    /**
     * 
     * @param string $file
     * @param string $to directory to copy for
     * @return array an array of copied files
     * @throws Exception
     * @throws \Exception
     */
    static public function copy($file,$to) {
        $copy=array();
        if(!file_exists($to))
            @mkdir ($to);
        if (is_dir($file)) {
            foreach (glob($file . "/*") as $archivos_carpeta) {
                
                $name=  explode(DIRECTORY_SEPARATOR,  str_replace('/',DIRECTORY_SEPARATOR,$archivos_carpeta));
                $name= $name[count($name)-1];
                $to=str_replace('/',DIRECTORY_SEPARATOR,$to);
                if (is_dir($archivos_carpeta)) {
                    
                    if(!file_exists($to.DIRECTORY_SEPARATOR.$name)){
                       mkdir($to.DIRECTORY_SEPARATOR.$name);
                    }
                    $result=self::copy($file.DIRECTORY_SEPARATOR.$name,$to.DIRECTORY_SEPARATOR.$name);
                    $copy=array_merge($copy, $result);
                    
                    } else {
                    if (!copy($archivos_carpeta,$to.DIRECTORY_SEPARATOR.$name)) {
                        throw new Exception("Error al copiar ".$to.DIRECTORY_SEPARATOR.$name."...\n");
                    }else{
                        $copy[]=$to.DIRECTORY_SEPARATOR.$name;
                    }
                }
            }
            
        }else{
           if(file_exists($to)){
               $name=  explode(DIRECTORY_SEPARATOR,  str_replace('/',DIRECTORY_SEPARATOR,$file));
               $name= $name[count($name)-1];
               if (!copy($file,$to.DIRECTORY_SEPARATOR.$name)) {
                    throw new \Exception("Error al copiar ".$to.DIRECTORY_SEPARATOR.$name."...\n",3);
               }else{
                        $copy[]=$to.DIRECTORY_SEPARATOR.$name;
                    }
           }
               
        }
        return $copy;
    }
    /**
     * Delete a file, if the given file is a directory
     * delete recursive all the content
     * @param string $file
     */
    static public function delete($file) {
        
        if (is_dir($file)) {
            foreach (glob($file . "/*") as $archivos_carpeta) {
                if (is_dir($archivos_carpeta)) {
                    self::delete($archivos_carpeta);
                } else {
                    if(file_exists($file))
                        @unlink($archivos_carpeta);
                }
            }
            if(file_exists($file))
                @rmdir($file);
        }else{
            if(file_exists($file))
             @unlink($file);
        }
    }
    /**
     * Search recursibly in a directory for a pattern
     * @param string $directory The directory to search for
     * @param string $file The pattern fiel to search
     * @return array an array of matching results
     */
    static public function find($directory,$file) {
        $result=array();
        foreach (glob($directory . "/".$file) as $archivos_carpeta) {
                $result[]=$archivos_carpeta;
        }
        foreach (glob($directory . "/*") as $archivos_carpeta) {
                if (is_dir($archivos_carpeta)) {
                    $result=  array_merge($result,self::find($archivos_carpeta,$file));
                }
        }
        
        return $result;
    }
}

?>
