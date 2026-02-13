<?php
header('Content-Type: application/json');

function scanDirRecursive($dir) {
    $result = [];
    foreach (scandir($dir) as $item) {
        if ($item === '.' || $item === '..') continue;
        $path = "$dir/$item";
        if (is_dir($path)) {
            $result[$item] = scanDirRecursive($path);
        } else if (pathinfo($item, PATHINFO_EXTENSION) === 'md') {
            $result[] = pathinfo($item, PATHINFO_FILENAME);
        }
    }
    return $result;
}

echo json_encode(scanDirRecursive(__DIR__ . '/../content/tutorials'));
