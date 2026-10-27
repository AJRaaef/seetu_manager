package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping(value = "/error", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> handleErrorHtml(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int statusCode = HttpStatus.NOT_FOUND.value();
        if (status != null) {
            try {
                statusCode = Integer.parseInt(status.toString());
            } catch (Exception ignored) {}
        }

        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        String errorMsg = (message != null && !message.toString().isEmpty()) 
                ? message.toString() 
                : "The requested resource could not be found or was denied.";

        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Page Not Found - SeettuManager</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: #F8FAFC;
                        color: #1E293B;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                    }
                    .box {
                        background: #ffffff;
                        border-radius: 16px;
                        padding: 40px;
                        max-width: 500px;
                        width: 100%;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.06);
                        text-align: center;
                        border: 1px solid #E2E8F0;
                    }
                    .code {
                        font-size: 56px;
                        font-weight: 800;
                        color: #235665;
                        margin: 0;
                        line-height: 1;
                    }
                    h2 {
                        font-size: 20px;
                        margin: 12px 0 8px 0;
                        color: #0F2F3D;
                    }
                    p {
                        color: #64748B;
                        font-size: 14px;
                        margin-bottom: 24px;
                    }
                    .btn {
                        display: inline-block;
                        background: #235665;
                        color: #ffffff;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 14px;
                        padding: 10px 24px;
                        border-radius: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="box">
                    <div class="code">%d</div>
                    <h2>SeettuManager Service</h2>
                    <p>%s</p>
                    <a href="http://localhost:5173" class="btn">Return to SeettuManager Application &rarr;</a>
                </div>
            </body>
            </html>
            """.formatted(statusCode, errorMsg);

        return ResponseEntity.status(statusCode).body(html);
    }

    @RequestMapping(value = "/error")
    public ResponseEntity<ApiResponse<Object>> handleErrorJson(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int statusCode = HttpStatus.NOT_FOUND.value();
        if (status != null) {
            try {
                statusCode = Integer.parseInt(status.toString());
            } catch (Exception ignored) {}
        }

        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        String errorMsg = (message != null && !message.toString().isEmpty()) 
                ? message.toString() 
                : "Error occurred processing request";

        return ResponseEntity.status(statusCode).body(ApiResponse.error("HTTP " + statusCode + ": " + errorMsg));
    }
}
