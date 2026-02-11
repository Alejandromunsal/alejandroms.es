<?php
header('Content-Type: application/json');

// Comprobamos que se ha pasado el parámetro 'file'
if (!isset($_GET['file'])) {
    echo json_encode(['lastModified' => null, 'error' => 'No se especificó archivo']);
    exit;
}

// Obtenemos la ruta relativa pasada por GET
$fileRelative = $_GET['file'];

// Construimos la ruta absoluta según la raíz del servidor web
$absolutePath = realpath($_SERVER['DOCUMENT_ROOT'] . $fileRelative);

// Validamos que el archivo exista y esté dentro de la carpeta 'content' por seguridad
$allowedDir = realpath($_SERVER['DOCUMENT_ROOT'] . '/content');
if (!$absolutePath || !str_starts_with($absolutePath, $allowedDir) || !file_exists($absolutePath)) {
    echo json_encode(['lastModified' => null, 'error' => 'Archivo no encontrado o ruta inválida']);
    exit;
}

// Obtenemos la fecha de modificación
$lastModified = filemtime($absolutePath);

// Devolvemos la fecha en formato timestamp
echo json_encode(['lastModified' => $lastModified]);
