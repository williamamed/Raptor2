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
namespace Raptor2\InteractiveBundle\Lib;
/**
 * Description of InteractiveContainer
 *
 * 
 */
abstract class InteractiveContainer {
    
    private $tags;
    private $conditions;
    private $currentCookie;
    
    function __construct() {
        $this->tags=array();
        $this->registerTutorials();
        $this->conditions=array();
    }
    
    public function setCurrentData($data) {
        $this->currentCookie=$data;
    }
    
    private function getDefault(){
        return array(
            'name'=>'interactive',
            'text'=>'<h2>NOT FOUND</h2>',
            'seconds'=>4,
            'author'=>array('img' => 'Raptor/img/logo.png'),
            'style'=>array('background'=>'gray'),
            'next'=>NULL,
            'position'=>array(
                'left'=>'20px',
                'top'=>'20px'
            )
        );
    }
    
    public function add($options,$bundle=null) {
        $defaultOptions=array(
            'name'=>'interactive',
            'text'=>'<h2>NOT FOUND</h2>',
            'seconds'=>4,
            'author'=>NULL,
            'style'=>array('background'=>'gray'),
            'next'=>NULL,
            'position'=>'left top'
        );
        
        $opt=  array_merge($defaultOptions, $options);
        if(isset($opt['position'])){
            $position=$opt['position'];
            $real=array();
            if(strstr($position,'left')!==false)
                    $real['left']='20px';
            if(strstr($position,'right')!==false)
                    $real['right']='20px';
            if(strstr($position,'top')!==false)
                    $real['top']='20px';
            if(strstr($position,'bottom')!==false)
                    $real['bottom']='20px';
            $opt['position']=$real;
        }
        if($bundle==null){
            $location=  \Raptor\Raptor::getInstance ()->getConfigurationLoader ()->getBundlesLocation ();
            $bundle=$location['InteractiveBundle'];
        }else{
            $location=  \Raptor\Raptor::getInstance ()->getConfigurationLoader ()->getBundlesLocation ();
            $bundle=$location[$bundle];
        }
           
        $opt['bundle']=$bundle;
        $this->tags[$opt['name']]=$opt;
        if(isset($opt['if']))
            $this->conditions[$opt['name']]=$opt['if'];
    }
    
    public function getTutorial($name) {
        $route=  str_replace('.', '/', $name);
        
        $lang= \Raptor\Raptor::getInstance()->getLanguage()->getUserCurrentLanguage();
        
        if (isset($this->tags[$name])) {
            $tutorial = new \Raptor\Util\ItemList($this->tags[$name]);
            if (!file_exists($this->tags[$name]['bundle'] . "/Tutorials/$lang")){
                $default=$this->getDefault();
                $default['found']=FALSE;
                return $default;
            }
            if (file_exists($this->tags[$name]['bundle'] . "/Tutorials/$lang/docs/$route.html")) {

                $tutorial->set('text', file_get_contents($this->tags[$name]['bundle'] . "/Tutorials/$lang/docs/$route.html"));
                $tutorial->set('bundle', '');
            }
            
            if ($this->tags[$name]['author'] == NULL)
                $tutorial->set('author', array('img' => 'Raptor/img/logo.png'));
            else {
                $author = str_replace('.', '/', $this->tags[$name]['author']);
                $obj = json_decode(file_get_contents($this->tags[$name]['bundle'] . "/Tutorials/$lang/authors/$author.json"));
                $result=array();
                
                if ($obj->img == '')
                    $obj->img = 'Raptor/img/accountblue.png';
                foreach ($obj as $key => $value) {
                    $result[$key]=$value;
                }
                $tutorial->set('author', $result);
            }
            if($tutorial->get('next')==NULL)
                $tutorial->set ('next', $this->getConditionalTutorial($name));
            if($tutorial->has('pointer')){
                $pointerOrig=$tutorial->get('pointer');
                $pointer=array();
                if(preg_match('/^arrow:((up)|(down)|(left)|(right)) /', $pointerOrig)){
                    
                    if(count(explode('arrow:up', $pointerOrig))>1){
                        $pointer['arrow']='up';
                        $pointer['selector']=  str_replace('arrow:up','', $pointerOrig);
                    }
                    if(count(explode('arrow:down', $pointerOrig))>1){
                        $pointer['arrow']='down';
                        $pointer['selector']=  str_replace('arrow:down','', $pointerOrig);
                    }
                    if(count(explode('arrow:left', $pointerOrig))>1){
                        $pointer['arrow']='left';
                        $pointer['selector']=  str_replace('arrow:left','', $pointerOrig);
                    }
                    if(count(explode('arrow:right', $pointerOrig))>1){
                        $pointer['arrow']='right';
                        $pointer['selector']=  str_replace('arrow:right','', $pointerOrig);
                    }
                }else{
                    $pointer=array('selector'=>$pointerOrig,'arrow'=>'up');
                }
                $tutorial->set('pointer', $pointer);
            }
            return $tutorial;
        }
        $default=$this->getDefault();
        $default['next']=$this->getConditionalTutorial($name);
        return new \Raptor\Util\ItemList($default);
    }
    
    private function getConditionalTutorial($current) {
        foreach ($this->conditions as $key=>$value) {
            if(!$this->isShow($key) and $this->translateCondition($value,$current)){
                return $key;
            }
        }
        return NULL;
    }
    
    public function isShow($tuto) {
        if(isset($this->currentCookie['tutoriales'][$tuto]))
            return true;
        else
            return false;
    }


    private function translateCondition($cond,$current) {
        $or=  explode(strtoupper(' or '), $cond);
        
        foreach ($or as $orValue) {
            $and=  explode(strtoupper(' and '), $orValue);
            $res=true;
            foreach ($and as $andValue) {
                $item=  trim($andValue);
                if($item[0]==='!'){
                    $item=  str_replace('!', '', $item);
                    if($current!=$item and !isset($this->currentCookie['tutoriales'][$item]))
                        $res=true;
                    else
                        $res=false;
                }else{
                    if($current==$item or isset($this->currentCookie['tutoriales'][$item]))
                        $res=false;
                    else
                        $res=true;
                }
            }
            if($res)
                return true;
        }
        return false;
    }

    abstract public function registerTutorials();
}

?>
