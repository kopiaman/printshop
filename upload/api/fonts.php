<?php
/**
 *  
 *  This gets the fonts from the /data/fonts directory
 *  
 */
require __DIR__ . '/autoload.php';

$font_list = [];
$fonts = glob("../data/fonts/json/*.json");
foreach($fonts as $font) {
	$font_meta = json_decode(file_get_contents($font), true);
	$font_meta['image'] = generate_image($font_meta);
	if($font_meta['image'])
		$font_list[] = $font_meta;
}
function delete_files($target) {
    if(is_dir($target)){
        $files = glob( $target . '*', GLOB_MARK ); //GLOB_MARK adds a slash to directories returned
        
        foreach( $files as $file )
        {
            delete_files( $file );      
        }
      
        rmdir( $target );
    } elseif(is_file($target)) {
        unlink( $target );  
    }
}
function generate_image($font_info) {

	#print_r($font_info['regular']['ttf']);
	if(!isset($font_info['regular']['ttf'])) {
		return false;
	}
	
	$font_path = "../data/".$font_info['regular']['ttf'];
	
	if(file_exists($font_path)) {
		$image_path = "../data/fonts/png/" . $font_info['url'] . ".png";
		if(file_exists($image_path)) {
			return $image_path;
		}
		
		// Create the image
		$im = imagecreatetruecolor(175, 35);

		// Create some colors
		$white = imagecolorallocate($im, 255, 255, 255);
		$grey = imagecolorallocate($im, 128, 128, 128);
		$black = imagecolorallocate($im, 0, 0, 0);
		imagefilledrectangle($im, 0, 0, 174, 34, $white);

		// The text to draw
		$text = str_replace("_", " ", $font_info['name']);
		// Replace path by your own font path
		$font = $font_path;

		// Add some shadow to the text
		#imagettftext($im, 14, 0, 11, 28, $grey, $font, $text);

		// Add the text
		imagettftext($im, 14, 0, 10, 27, $black, $font, $text);

		// Using imagepng() results in clearer text compared with imagejpeg()
		imagepng($im, $image_path);
		imagedestroy($im);
		return $image_path;	
	}
	return false;
}

header('Content-Type: application/json');
echo json_encode($font_list);
