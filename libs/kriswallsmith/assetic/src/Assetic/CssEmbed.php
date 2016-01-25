<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CssEmbed
 *
 * @author amed
 */
namespace Assetic;

class CssEmbed {
    private $rootDir;
    private $content;

    public function setRootDir($param) {
        $this->rootDir=$param;
    }
    
    public function embedString($content) {
        //url(../images/taskbar/black/taskbar-split-h.gif)
        $this->content=$content;
        $this->findImages($content);
        
        return $this->content;
    }
    
    private function findImages($content) {
        $array=  explode('url', $content);
        foreach ($array as $key => $value) {
            $array2=  explode(')', $value);
            foreach ($array2 as $value2) {
                $val=str_replace('(', '', $value2);
                if($this->hasUrl($val)){
                    if(file_exists($this->rootDir.DIRECTORY_SEPARATOR.$val)){
                        $this->content= str_replace('url('.$val.')','data:'.file_get_contents($this->rootDir.DIRECTORY_SEPARATOR.$val),$this->content);
                    }
//                echo $val;
//                echo ' END<br>';
                }
            }
        }
    }
    
    private function hasUrl($param) {
        if(preg_match('/^((..)?\/?\w+)+$/',$param)==1)
            return true;
        else
            return false;
    }
}

?>
