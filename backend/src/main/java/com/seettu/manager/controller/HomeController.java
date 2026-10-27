package com.seettu.manager.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> rootHtml() {
        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SeettuManager API Service</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background: linear-gradient(135deg, #0F2F3D 0%, #235665 100%);
                        color: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .card {
                        background: #ffffff;
                        color: #1E293B;
                        border-radius: 16px;
                        padding: 40px;
                        max-width: 540px;
                        width: 100%;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
                        text-align: center;
                    }
                    .badge {
                        display: inline-block;
                        background: #DCFCE7;
                        color: #166534;
                        font-size: 12px;
                        font-weight: 700;
                        padding: 4px 12px;
                        border-radius: 9999px;
                        margin-bottom: 16px;
                    }
                    h1 {
                        font-size: 24px;
                        font-weight: 800;
                        margin: 0 0 10px 0;
                        color: #0F2F3D;
                    }
                    p {
                        font-size: 14px;
                        color: #64748B;
                        line-height: 1.6;
                        margin: 0 0 24px 0;
                    }
                    .btn {
                        display: inline-block;
                        background: #235665;
                        color: #ffffff;
                        text-decoration: none;
                        font-weight: 700;
                        font-size: 14px;
                        padding: 12px 28px;
                        border-radius: 8px;
                        transition: background 0.2s;
                    }
                    .btn:hover {
                        background: #1A3644;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <span class="badge">● Spring Boot API Online</span>
                    <h1>SeettuManager Backend Service</h1>
                    <p>The backend REST API server is actively running on port <strong>8081</strong>. To access the user portal, dashboard, and group management, please open the React application.</p>
                    <a href="http://localhost:5173" class="btn">Open SeettuManager Web App &rarr;</a>
                </div>
            </body>
            </html>
            """;
        return ResponseEntity.ok(html);
    }

    @GetMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> apiStatus() {
        return ResponseEntity.ok(Map.of(
                "application", "SeettuManager Backend API",
                "status", "RUNNING",
                "version", "1.0.0",
                "port", 8081,
                "frontendUrl", "http://localhost:5173"
        ));
    }
}
