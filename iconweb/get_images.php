<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// 定义图标目录
$directories = [
    'border-radius' => 'images/border-radius/',
    'circle' => 'images/circle/',
    'svg' => 'images/svg/',
    'pt' => 'images/pt/'
];

$result = [];

foreach ($directories as $category => $path) {
    if (is_dir($path)) {
        $files = scandir($path);
        $image_files = array_filter($files, function($file) {
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            return in_array($extension, ['png', 'jpg', 'jpeg', 'gif', 'svg']);
        });
        
        $result[$category] = array_values($image_files);
    } else {
        $result[$category] = [];
    }
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>
