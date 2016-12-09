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

/**
 * Clase utilitaria para el manejo de archivos(copiado, remocion y busqueda)
 */
class Files {

    /**
     * Copia archivos o directorios completos hacia una nueva locacion
     * 
     * @param string $file el archivo o directorio a copiar
     * @param string $to directorio donde se copiara el archivo
     * @return array un array con todos los elementos que fueron copiados
     * @throws \Exception Lanza una excepcion si el archivo existe
     */
    static public function copy($file, $to) {
        $copy = array();
        if (!file_exists($to))
            @mkdir($to, 0777, true);
        if (is_dir($file)) {
            foreach (scandir($file) as $archivos_carpeta) {
                if ($archivos_carpeta != "." && $archivos_carpeta != "..") {

                    $to = str_replace('/', DIRECTORY_SEPARATOR, $to);
                    if (is_dir($file . '/' . $archivos_carpeta)) {

                        if (!file_exists($to . DIRECTORY_SEPARATOR . $archivos_carpeta)) {
                            mkdir($to . DIRECTORY_SEPARATOR . $archivos_carpeta, 0777, true);
                        }

                        $result = self::copy($file . DIRECTORY_SEPARATOR . $archivos_carpeta, $to . DIRECTORY_SEPARATOR . $archivos_carpeta);
                        $copy = array_merge($copy, $result);
                    } else {

                        if (!copy($file . '/' . $archivos_carpeta, $to . DIRECTORY_SEPARATOR . $archivos_carpeta)) {
                            throw new \Exception("Error al copiar " . $to . DIRECTORY_SEPARATOR . $archivos_carpeta . "...\n");
                        } else {
                            $copy[] = $to . DIRECTORY_SEPARATOR . $archivos_carpeta;
                        }
                    }
                }
            }
        } else {
            if (file_exists($to)) {
                $name = explode(DIRECTORY_SEPARATOR, str_replace('/', DIRECTORY_SEPARATOR, $file));
                $name = $name[count($name) - 1];
                if (!copy($file, $to . DIRECTORY_SEPARATOR . $name)) {
                    throw new \Exception("Error al copiar " . $to . DIRECTORY_SEPARATOR . $name . "...\n", 3);
                } else {
                    $copy[] = $to . DIRECTORY_SEPARATOR . $name;
                }
            }
        }
        return $copy;
    }

    /**
     * 
     * Remueve recursivamente el directorio especificado 
     * @param string $file
     */
    static public function delete($file) {

        if (is_dir($file)) {
            $dir = scandir($file);
            foreach ($dir as $archivos_carpeta) {
                if ($archivos_carpeta != "." && $archivos_carpeta != "..") {
                    if (is_dir($file . '/' . $archivos_carpeta)) {
                        self::delete($file . '/' . $archivos_carpeta);
                    } else {
                        if (file_exists($file . '/' . $archivos_carpeta))
                            @unlink($file . '/' . $archivos_carpeta);
                    }
                }
            }
            if (file_exists($file))
                @rmdir($file);
        }else {
            if (file_exists($file))
                @unlink($file);
        }
    }

    /**
     * 
     * Busca recursivamente en un directorio por un patron de archivo
     * @param string $directory el directorio en donde buscar
     * @param string $file el patron de archivo a buscar
     * @return array un array con todas coincidencias
     */
    static public function find($directory, $file) {
        $result = array();
        foreach (glob($directory . "/" . $file) as $archivos_carpeta) {
            $result[] = $archivos_carpeta;
        }
        foreach (scandir($directory) as $archivos_carpeta) {
            if ($archivos_carpeta != "." && $archivos_carpeta != "..") {
                if (is_dir($directory . '/' . $archivos_carpeta)) {
                    $result = array_merge($result, self::find($directory . '/' . $archivos_carpeta, $file));
                }
            }
        }

        return $result;
    }

}

?>
