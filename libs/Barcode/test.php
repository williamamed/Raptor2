<?php
require_once('class/BCGColor.php');
require_once('class/BCGDrawing.php');
require_once('class/BCGcode39.barcode.php');
 
$colorfg = new BCGColor(0, 0, 0);
$colorbg = new BCGColor(255, 255, 255);
 
// Barcode Part
$code = new BCGcode39();
$code->setScale(3);

$code->setColor($colorfg, $colorbg);
$code->parse('EHD2345543453');
 
// Drawing Part
$drawing = new BCGDrawing('', $colorbg);
$drawing->setBarcode($code);
$drawing->draw();
 
header('Content-Type: image/png');
 
$drawing->finish(BCGDrawing::IMG_FORMAT_PNG);
?>