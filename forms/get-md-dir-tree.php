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

$section = $_GET['section'] ?? 'tutorials';

$allowed = ['tutorials', 'proyectos'];

if (!in_array($section, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid section']);
    exit;
}

echo json_encode(
    scanDirRecursive(__DIR__ . "/../content/$section")
);
