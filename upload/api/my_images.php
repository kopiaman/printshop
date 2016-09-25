<?php
/**
 *  
 *  Get the images uploaded
 *  for the current session
 *  
 */
require __DIR__ . '/autoload.php';


$result = [];
$result['status'] = true;
$result['uuid'] = $_SESSION['uuid'];

//get folder
$folder = $result['uuid'][0] . '/' . $result['uuid'][1] . '/' . $result['uuid'] .'/';
$full_path = "../storage/uploads/".$folder;

//get files in folder
$files = glob($full_path . "*.png");
$images = [];
foreach($files as $file) {
	$tmp['path'] = str_replace("../storage/uploads/", "", $file);
	$tmp['filename'] = pathinfo($file, PATHINFO_FILENAME);
	$tmp['created_at'] = filemtime($file);
	$images[] = $tmp;
}

$result['images'] = $images;

header('Content-Type: application/json');
echo json_encode($result);

