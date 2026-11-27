<!DOCTYPE html>
<html lang="id" style="color-scheme: light;">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title inertia>{{ config('app.name', 'Pasanku') }}</title>
    <link rel="icon" type="image/png" href="/images/pasanku_app_icon.png" />
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="bg-canvas text-ink font-body antialiased selection:bg-accent/30 selection:text-ink">
    @inertia
</body>
</html>
