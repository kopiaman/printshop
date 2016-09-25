<?php
require __DIR__ . '/autoload.php';
$result = [];
$result['status'] = true;

$data_dir = "../data/";
$result['palette'] = json_decode(file_get_contents($data_dir . 'palette.json'));

header('Content-Type: application/json');
echo json_encode($result);

