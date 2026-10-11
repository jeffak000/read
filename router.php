<?php
// Development/local test server only. Production: nginx/Apache + PHP.
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if(str_starts_with($path,'/api/')){require __DIR__.'/public/api.php';return true;}
if(preg_match('/\.php$/i',$path)){http_response_code(404);return true;}
if(preg_match('/\.(mjs|wasm)$/',$path,$m)){
 $file=realpath(__DIR__.'/public'.$path);$root=realpath(__DIR__.'/public');
 if(!$file||!str_starts_with($file,$root.DIRECTORY_SEPARATOR)){http_response_code(404);return true;}
 header('Content-Type: '.($m[1]==='mjs'?'application/javascript':'application/wasm'));readfile($file);return true;
}
return false;
