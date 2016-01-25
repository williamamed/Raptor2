<?php

namespace Raptor\Bundle\Publisher;
/**
 * Extjs Pre Compiler
 * Create a precompile code of the MVC arquitecture App,
 * the code is generated base on controller, model, view and store directories
 * locates in the Ext App, the main class is out this precompilation.
 * The resulting code is placed in a all-classes.js file
 * 
 */
class Extjs {
    /**
     * Execute the precompilation routine in the specified directory, must exist the compileApp
     * directive out of the target directory app in order to detect it.
     * @param string $directory
     */
    static public function preCompileApp($directory) {
        
        
        foreach (glob($directory . "/*") as $files) {


            if (is_dir($files)) {
                self::preCompileApp($files);
            } else {

                $compile=explode('compileApp', $files);
                if(count($compile)>1){
                     file_put_contents($compile[0].'all-classes.js','',LOCK_EX);
                     $code='';
                     $code.=self::get($compile[0].'app/model');
                     $code.=self::get($compile[0].'app/store');
                     $code.=self::get($compile[0].'app/controller');
                     $code.=self::get($compile[0].'app/view');
                     file_put_contents($compile[0].'all-classes.js',$code,LOCK_EX);
                     
                }
            }
        }
    }
    
    static private function get($directory) {
        $layer='';
        
        foreach (glob($directory . "/*.js") as $files) {
                
            if (!is_dir($files)) {
               
                $layer.="
".file_get_contents($files);
            }
        }
        return $layer;
    }
}

?>
