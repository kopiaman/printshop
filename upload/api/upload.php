<?php
/**
 *  
 *  Upload the image for the current session
 *  
 */
require __DIR__ . '/autoload.php';

function imagecreatefromfile($imagepath=false) {
    if(!$imagepath || !is_readable($imagepath))
		return false;
    return @imagecreatefromstring(file_get_contents($imagepath));
}

$result = [];
$result['status'] = true;
$result['uuid'] = $_SESSION['uuid'];

//get folder
$folder = $result['uuid'][0] . '/' . $result['uuid'][1] . '/' . $result['uuid'] .'/';
$full_path = "../storage/uploads/".$folder;

if(!file_exists($full_path))
	mkdir ( $full_path, 0777, true );
	
$img = imagecreatefromfile($_FILES['file']['tmp_name']);
imagecolortransparent($img, imagecolorallocatealpha($img, 0, 0, 0, 127));
imagealphablending($img, TRUE);
#imagesavealpha($img, TRUE);
$filename = pathinfo($_FILES['file']['name'], PATHINFO_FILENAME). '.png';
#var_dump($_POST);die();
// remove whitespace if needed
#if(isset($_POST['whitespace']) && (int) $_POST['whitespace'] == 1 ) {
	$white = imagecolorallocate($img, 255, 255, 255);
	$white = imagecolorexact($img, 255, 255, 255);
	
	#var_dump($white);die();
    imagecolortransparent($img, $white);
#}

imagepng($img, $full_path . $filename);
$result['filepath'] = $folder . $filename;
$result['whitespace'] = (int) $_POST['whitespace'];

header('Content-Type: application/json');
echo json_encode($result);

