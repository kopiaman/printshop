<?php
/**
 *  
 *  This gets the clipart from the clip_art directory
 *  
 */
require __DIR__ . '/autoload.php';
$clip_art = [];
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator("../data/clip_art/")) as $filename)
{
	//save yaml files
	$filetype = pathinfo($filename, PATHINFO_EXTENSION);
	if (strtolower($filetype) == 'svg') {

		$path = $filename->getPathname();
		$path = str_replace(DIRECTORY_SEPARATOR, "/", $path);
		$dir = str_replace(DIRECTORY_SEPARATOR, "/", $filename->getPath());
		
		$tmp = [];
		$tmp['path'] = $path;
		$tmp['category'] = str_replace("../data/clip_art/", "", $dir);
		$tmp['name'] = str_replace("_", "", $filename->getBasename(".svg"));
		$tmp['keywords'] = $tmp['category'] . "," . $tmp['name'];
		$clip_art[] = $tmp;
	}
	
}

usort($clip_art, function($a, $b) {
     return strcmp($a["category"], $b["category"]);
});

$clip_art[] = $tmp;

header('Content-Type: application/json');
echo json_encode($clip_art);

