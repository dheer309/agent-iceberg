

Invoke-RestMethod -Uri "http://localhost:8000/sessions" -Method POST -ContentType "application/json" -Body '{"query": "[userPrompt]", "enable_redteam": true, "redteam_loops": 5}'

Invoke-WebRequest -Uri "http://localhost:8000/sessions/[sessionID]/step" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"steps": 1}'
