<?php

class BaseController
{
	public $view = null;
	public $data = [];

    public function __construct() {
		$this->view = new Razr\Engine(new Razr\Loader\FilesystemLoader(__DIR__ . '/../views/'));

		//get the settings
		$settings = include '../data/settings.php';
		$this->data['currency'] = $settings['currency'];

	}

}