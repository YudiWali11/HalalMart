<?php

/**
 * Laravel Vercel Entrypoint
 */

if (isset($_GET['vercel_request_uri'])) {
    $_SERVER['REQUEST_URI'] = $_GET['vercel_request_uri'];
    unset($_GET['vercel_request_uri']);
}

require __DIR__ . '/../public/index.php';
