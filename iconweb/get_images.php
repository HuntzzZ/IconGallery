<?php
$categories = ['border-radius', 'circle', 'svg'];
$result = [];

foreach ($categories as $category) {
    $directory = "images/$category/";
    if (!is_dir($directory)) {
        continue;
    }

    $files = array_diff(scandir($directory), array('.', '..'));
    $pngFiles = array_filter($files, function($file) use ($category) {
        return pathinfo($file, PATHINFO_EXTENSION) === ($category === 'svg' ? 'svg' : 'png');
    });

    $result[$category] = array_values($pngFiles);
}

header('Content-Type: application/json');
echo json_encode($result);
?>

