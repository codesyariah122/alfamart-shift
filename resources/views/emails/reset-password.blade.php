<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Reset Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f6f8fa;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 600px;
            background-color: #ffffff;
            margin: auto;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h3 {
            color: #ED2D56;
        }

        a.button {
            display: inline-block;
            background-color: #ED2D56;
            color: #ffffff;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 15px;
        }

        a.button:hover {
            background-color: #c52146;
        }

        p {
            line-height: 1.6;
        }
    </style>
</head>

<body>
    <div class="container">
        <h3>Permintaan Reset Password</h3>
        <p>Kami menerima permintaan untuk mengganti password akun Anda.</p>
        <p>Silakan klik tombol di bawah ini untuk mengatur ulang password Anda:</p>
        <p>
            <a href="{{ env('FRONTEND_APP') . '/set-new-password?token=' . $token }}" class="button">
                Reset Password
            </a>
        </p>
        <p>Jika Anda tidak meminta reset password, Anda bisa mengabaikan email ini. Password Anda tetap aman.</p>
    </div>
</body>

</html>
