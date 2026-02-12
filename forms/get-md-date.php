<?php
header('Content-Type: application/json');

if (!isset($_GET['file'])) {
    echo json_encode(['lastModified' => null, 'error' => 'No se especificó archivo']);
    exit;
}

$fileRelative = $_GET['file'];
$absolutePath = realpath($_SERVER['DOCUMENT_ROOT'] . $fileRelative);
$allowedDir = realpath($_SERVER['DOCUMENT_ROOT'] . '/content/tutorials');

if (!$absolutePath || !str_starts_with($absolutePath, $allowedDir) || !file_exists($absolutePath)) {
    echo json_encode(['lastModified' => null, 'error' => 'Archivo no encontrado o ruta inválida']);
    exit;
}

$lastModified = filemtime($absolutePath);

echo json_encode(['lastModified' => $lastModified]);
