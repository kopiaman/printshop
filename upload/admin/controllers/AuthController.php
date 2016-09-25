<?php

class AuthController extends BaseController
{
	public function __construct() {
		parent::__construct();
	}
		
    public function index() {
		echo $this->view->render('auth.tpl.php', $this->data);
	}		

    public function login() {
    	$settings = include '../data/settings.php';

		if($_POST['username'] == 'admin' && md5($_POST['password']) == $settings['password']) {
			$_SESSION['logged_in'] = true;
			redirect_to('');
		} else {
			$_SESSION['logged_in'] = false;
			redirect_to('auth', array('error' => 'Invalid login'));
		}
	}

    public function logout() {
		$_SESSION['logged_in'] = false;
		redirect_to('auth');
	}

}