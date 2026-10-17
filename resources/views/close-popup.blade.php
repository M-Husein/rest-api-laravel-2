<!DOCTYPE html>
<html lang="en" data-nosnippet="true">
<head>
<meta name="robots" content="none,nosnippet,noarchive">
<title>Authenticating…</title>
<script>
try{
  const bc = new BroadcastChannel("{{ env('VITE_BC_NAME') }}");
  bc.postMessage({
    type:'OAUTH_SUCCESS',
    provider:'{{ $provider }}'
  });
  bc.close();
}catch(e){
  console.error(e);
}finally{
  window.close();
}
</script>
</head>
<body>
</body></html>