<!DOCTYPE html>
<html>

<head>
    <title>Activation Email</title>
    <meta charset="UTF-8">
</head>

<body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f9fafb;">
    <div
        style="max-width: 600px; margin: 40px auto; padding: 40px; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 16px;">Hello, {{ $employee->name }}
        </h1>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
            Your account has been created. Please click the button below to activate it:
        </p>
        <a href="{{ url('/activate/' . $employee->activation_token) }}"
            style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Activate Account
        </a>

        <hr style="margin: 32px 0; border-color: #e5e7eb;">

        <h2 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 12px;">Employee Information</h2>
        <table style="width: 100%; font-size: 14px; color: #374151;">
            <tr>
                <td style="padding: 8px 0; font-weight: 600;">NIK</td>
                <td>: {{ $employee->nik }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: 600;">Name</td>
                <td>: {{ $employee->name }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: 600;">Email</td>
                <td>: {{ $employee->email }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: 600;">Phone</td>
                <td>: {{ $employee->phone ?? '-' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: 600;">Position</td>
                <td>: {{ $employee->position ?? '-' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: 600;">Department</td>
                <td>: {{ $employee->department ?? '-' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: 600;">Registered At</td>
                <td>: {{ $employee->created_at->format('d M Y') }}</td>
            </tr>
        </table>

        <p style="margin-top: 24px; font-size: 14px; color: #9ca3af;">
            If you didn’t create an account, you can ignore this email.
        </p>
    </div>
</body>

</html>
