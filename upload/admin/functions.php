<?php

/**
 *  
 *  Some functions we need  
 *  
 */

function base_url($path = null) {
	$app = \Slim\Slim::getInstance();
	$base_url = $app->request->getRootUri();
	$admin_url = str_replace("/index.php", "", $base_url);
    return $admin_url.'/'.$path;
    #return ADMIN_URL.'/'.$path;
}

function site_url($path = null) {
    return base_url('').'index.php/'.$path;
}

function api_url($path = null) {
    return API_URL.'/'.$path;
}

function current_url() {
    $current_url = str_replace(ADMIN_URL, "", $_SERVER['REQUEST_URI']);
    return $current_url;
}

function get_segment($position) {
	$current_url = explode('/', current_url());
    return (isset($current_url[$position])?$current_url[$position]:false);
}

function redirect_to($path = null, $data = null) {

    if($data) {
        if(isset($data['success'])) {
            $_SESSION['success'] = $data['success'];
		}
        if(isset($data['error'])) {
            $_SESSION['error'] = $data['error'];
		}
        if(isset($data['vars'])) {
            $_SESSION['vars'] = $data['vars'];
		}
    }
	
	#$app = \Slim\Slim::getInstance();
	#$app->redirect(site_url($path));
    header('Location: '. site_url($path));
    exit();
}

use Cocur\Slugify\Slugify;


function slugify($text) { 
	$slugify = new Slugify();
	return $slugify->slugify($text);
    // replace non letter or digits by -
    $text = preg_replace('~[^\\pL\d]+~u', '-', $text);
    $text = trim($text, '-');
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text); // transliterate
    $text = strtolower($text);// lowercase
    $text = preg_replace('~[^-\w]+~', '', $text);// remove unwanted characters

    if (empty($text))
        return 'n-a';
    return $text;
}
