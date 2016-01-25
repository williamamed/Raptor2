<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of DefaultController
 *
 * @author DinoByte
 */
namespace examples\exampleBundle\Controller;

class DefaultController extends \Raptor\Bundle\Controller\Controller {

    /**
     * Api annotation
     * 
     * if you set the \@api annotation this text will be proccess like
     * api description that can be access with app->getApi(), you must set the version
     * of the api description.
     * 
     * if you set the @Route annotation the path will be proccesed like a path
     * definition for this controller and configured in the routing rutine. The 
     * \@RouteName annotation is optional and can be omited, if is omited the route
     * name will be configured in base of the route path.
     * 
     * @Route /new/example
     * @RouteName _new_example
     * @api example.gui
     * 
     * @param \Slim\Http\Request $request
     * @param \Slim\Http\Response $response
     * @param \Slim\Route $route
     */
    public function indexAction($request,$response,$route) {
        /**
         * You can use the next params
         * The current request, response and the route
         * 
         */
        return "Hello World !! ".$route->getName();
    }
    
    /**
     * Save and Get data into a database
     * @Route /new/example/persisting
     * 
     */
    public function persistingAction() {
        /**
         * $this->getStoreManager() is a shortcut of $this->getStore()->getManagerManager() and can be
         * accesed like this $this->app->getStore()->getManager()
         * 
         * We need to check if the persona table exist and create it if not exist [this is only for examples purposes]
         */
        if (!$this->getStoreManager()->getConnection()->getSchemaManager()->tablesExist(array('persona'))){
            $this->getStore()->generateSchema('exampleBundle',array('Persona'));
        }
        
        /**
         * Save a Person entity
         * 
         */
        $persona=new \examples\exampleBundle\Model\Entity\Persona();
        $persona->setNombre('Liams');
        $persona->setApellidos('Adam');
        $persona->setSexo(true);
        $persona->setEdad(25);
        $this->getStoreManager()->persist($persona);
        $this->getStoreManager()->flush();
        /**
         * Accessing to the previusly save entity
         * and return an array of results
         * exampleBundle:Persona is the alias for \examples\exampleBundle\Model\Entity\Persona
         */
        $list=new \Raptor\Util\ItemList(
                $this->getStoreManager()
                ->getRepository('exampleBundle:Persona')
                ->findAll());
        return $list->toJson();
    }
    
    /**
     * This example shows the way to export estandar data
     * storaged in your database, some time you need to export
     * your data to another database engine, in this way you will
     * export and import estandar data no matter your engine.
     * 
     * To import again this data you need to call the Importer
     * 
     * @Route /new/example/exportdata
     * 
     */
    public function exportDataAction() {
        if ($this->getStoreManager()->getConnection()->getSchemaManager()->tablesExist(array('persona'))) {
            $this->getStore()
                    ->getExporter()
                    ->setEntities(array(
                        '\examples\exampleBundle\Model\Entity\Persona'
                    ))
                    ->save(__DIR__ . '/exportExample.php');

            return file_get_contents(__DIR__ . '/exportExample.php');
        }
        
    }
    
    
    
    /**
     * Getting the Dynamic API
     * @Route /new/example/getapi
     * 
     */
    public function apiAction() {
        /**
         * Get the cached api declared in all controller files
         */
        $conf=  $this->app->getApi();
        $text='';
        if($conf===false)
            return "There isn't api declared";
        
        /**
         * Listing by category name
         */
        foreach ($conf as $api_category_name=> $api_category_array) {
           /**
            * Iterate each category
            */
            foreach ($api_category_array as $api_estructure) {
                /**
                 * Verify if the api is valid
                 */
                if($api_estructure->hasApi){
                    $text.='<h2>'.$api_category_name.'</h2>';
                    if($api_estructure->route!=false)
                        $text.='<b>'.$api_estructure->route.'</b><br>';
                    $text.='<pre>'.$api_estructure->text.'</pre><br>';
                }
            }  
        }
        
        return $text;
    }
    
    /**
     * Creating and Exporting a Zip
     * @Route /new/example/exportzip
     * 
     */
    public function exportZipAction() {
        $zip=new \Raptor\Util\Zip();
        /**
         * Give the directory or a file to compress
         * in this case will be the Controller directory
         * of this bundle 
         */
        
        $zip->create(__DIR__);
        $this->app->contentType(\Raptor\Raptor::ZIP);
        $this->app->response()->headers()->set('Content-Disposition', 'attachment; filename="testing.zip"');
        return $zip->output();
    }
    
    /**
     *
     * @var \PHPExcel 
     */
    private $excel;
    /**
     * Creating a Excel
     * 
     * @Route /new/example/excel
     * 
     */
    public function exportingExcelAction() {
        /**
         * An example of excel exporting
         */
        $this->excel=$this->get('PHPExcel');
        $this->excel->createSheet(0);
        $this->excel->getActiveSheet()
                ->setCellValue('A2', "No")
                ->setCellValue('B2', "Name")
                ->setCellValue('C2', "Last Name");
        $objWriter = \PHPExcel_IOFactory::createWriter($this->excel, 'Excel5');
        $objWriter->save('php://output');
        $this->excel->disconnectWorksheets();
        
        $this->app->response()->headers()->set('Content-Disposition', 'attachment; filename="example"');
        
        $this->app->response()->headers()->set('Cache-Control', 'max-age=0');
        $this->app->contentType(\Raptor\Raptor::EXCEL);
    }
    
    
    /**
     * Printing a barcode 39
     * 
     * @Route /new/example/barcode
     * 
     */
    public function barcodeAction() {
        
        $colorfg = new \BCGColor(0, 0, 0);
        $colorbg = new \BCGColor(255, 255, 255);

// Barcode Part
        $code = new \BCGcode39();
        $code->setScale(3);

        $code->setColor($colorfg, $colorbg);
        $code->parse('EHD2345543453');

// Drawing Part
        $drawing = new \BCGDrawing('', $colorbg);
        $drawing->setBarcode($code);
        $drawing->draw();



        $drawing->finish(\BCGDrawing::IMG_FORMAT_PNG);
        $this->app->contentType(\Raptor\Raptor::PNG);
        
    }
    
    /**
     * Creating a PDF or WORD with PhpOffice
     * 
     * @Route /new/example/office
     * 
     */
    public function listAction() {
        
        $phpWord = $this->get('PhpWord');
        $phpWord->addFontStyle('rStyle', array('bold' => true, 'italic' => true, 'size' => 16, 'allCaps' => true, 'doubleStrikethrough' => true));
        $phpWord->addParagraphStyle('pStyle', array('align' => 'center', 'spaceAfter' => 100));
        $phpWord->addTitleStyle(1, array('bold' => true), array('spaceAfter' => 240));

        // New portrait section
        $section = $phpWord->addSection();

// Simple text
        $section->addTitle(htmlspecialchars('Welcome to PhpWord'), 1);
        $section->addText(htmlspecialchars('Hello World!'));

// Two text break
        $section->addTextBreak(2);

// Defined style
        $section->addText(htmlspecialchars('I am styled by a font style definition.'), 'rStyle');
        $section->addText(htmlspecialchars('I am styled by a paragraph style definition.'), null, 'pStyle');
        $section->addText(htmlspecialchars('I am styled by both font and paragraph style.'), 'rStyle', 'pStyle');

        $section->addTextBreak();

// Inline font style
        $fontStyle['name'] = 'Times New Roman';
        $fontStyle['size'] = 20;

        $textrun = $section->addTextRun();
        $textrun->addText(htmlspecialchars('I am inline styled '), $fontStyle);
        $textrun->addText(htmlspecialchars('with '));
        $textrun->addText(htmlspecialchars('color'), array('color' => '996699'));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('bold'), array('bold' => true));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('italic'), array('italic' => true));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('underline'), array('underline' => 'dash'));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('strikethrough'), array('strikethrough' => true));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('doubleStrikethrough'), array('doubleStrikethrough' => true));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('superScript'), array('superScript' => true));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('subScript'), array('subScript' => true));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('smallCaps'), array('smallCaps' => true));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('allCaps'), array('allCaps' => true));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('fgColor'), array('fgColor' => 'yellow'));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('scale'), array('scale' => 200));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('spacing'), array('spacing' => 120));
        $textrun->addText(htmlspecialchars(', '));
        $textrun->addText(htmlspecialchars('kerning'), array('kerning' => 10));
        $textrun->addText(htmlspecialchars('. '));

// Link
        $section->addLink('http://www.google.com', htmlspecialchars('Google'));
        $section->addTextBreak();
        $file = 'HelloWorld.pdf';

        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'PDF');
        $objWriter->save("php://output");
        $this->app->response()->headers()->set('Content-Description', 'File Transfer');
        $this->app->response()->headers()->set('Content-Disposition', 'attachment; filename="' . $file . '"');
        $this->app->response()->headers()->set('Content-Type', 'application/pdf');
        $this->app->response()->headers()->set('Content-Transfer-Encoding', 'binary');
        
    }
    
    
}

?>
