<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // 允许跨域访问

$categories = ['border-radius', 'circle', 'svg', 'pt'];
$result = [];

foreach ($categories as $category) {
    $directory = "images/$category/";
    if (!is_dir($directory)) {
        continue;
    }

    $files = array_diff(scandir($directory), array('.', '..'));
    $pngFiles = array_filter($files, function($file) use ($category) {
        if ($category === 'svg') {
            return strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'svg';
        } else {
            return in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), ['png', 'ico']);
        }
    });

    $result[$category] = array_values($pngFiles);
}

// 添加缓存头以提高性能
header('Cache-Control: public, max-age=3600'); // 缓存1小时

echo json_encode($result);
?>
