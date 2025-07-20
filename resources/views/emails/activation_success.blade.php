<!DOCTYPE html>
<html>

<head>
    <title>Activation Success</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f3f4f6;">
    <div
        style="max-width: 600px; margin: 40px auto; padding: 40px; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
        <h1 style="font-size: 26px; font-weight: 700; color: #10b981; margin-bottom: 16px;">
            🎉 Hi, {{ $employee->name }}!
        </h1>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 12px;">
            Your account has been <strong>successfully activated</strong>.
        </p>
        <p style="font-size: 14px; color: #6b7280;">
            You can now log in and start using the system.
        </p>
    </div>
</body>

</html>
