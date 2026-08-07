# VoteVibes - Results, Analytics & Export API Documentation

This document describes the Phase 6 backend REST API endpoints for election result calculation, winner determination, voter turnout metrics, demographic analytics, single-request summary, PDF report generation, and multi-format exports.

---

## Base Path

`/api/results`

---

## Endpoints Summary

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/:id` | Get election result (winner, vote counts, candidate rankings) | Public / Auth |
| `GET` | `/:id/stats` | Get election turnout statistics (% turnout, total voters, votes cast) | Public / Auth |
| `GET` | `/:id/rankings` | Get 1-indexed sorted candidate rankings | Public / Auth |
| `GET` | `/:id/summary` | Consolidated single-request election summary | Public / Auth |
| `GET` | `/:id/demographics` | Grouped demographic analytics (Chart.js & Recharts ready) | Public / Auth |
| `GET` | `/:id/report` | Downloadable professional election report PDF | Public / Auth |
| `GET` | `/:id/export/:format` | Downloadable export (`pdf`, `csv`, `json`, `excel`) | Public / Auth |

---

## Detailed Endpoint Documentation

### 1. Get Election Results
`GET /api/results/:id`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Election result retrieved successfully",
  "data": {
    "electionId": "123e4567-e89b-12d3-a456-426614174000",
    "electionTitle": "Campus Student Council Election 2026",
    "status": "COMPLETED",
    "winner": {
      "isTie": false,
      "winningStatus": "SINGLE_WINNER",
      "id": "cand-1",
      "fullName": "Alice Smith",
      "voteCount": 75,
      "percentage": 75.0
    },
    "voteCounts": {
      "cand-1": 75,
      "cand-2": 25
    },
    "rankings": [
      {
        "rank": 1,
        "candidateId": "cand-1",
        "fullName": "Alice Smith",
        "voteCount": 75,
        "percentage": 75.0,
        "isWinner": true
      },
      {
        "rank": 2,
        "candidateId": "cand-2",
        "fullName": "Bob Jones",
        "voteCount": 25,
        "percentage": 25.0,
        "isWinner": false
      }
    ],
    "totalVotes": 100
  }
}
```

---

### 2. Get Election Turnout Statistics
`GET /api/results/:id/stats`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Election statistics retrieved successfully",
  "data": {
    "electionId": "123e4567-e89b-12d3-a456-426614174000",
    "turnout": 75.0,
    "turnoutPercentage": 75.0,
    "totalVoters": 100,
    "eligibleVoters": 100,
    "totalVotes": 75,
    "votesCast": 75,
    "rejectedVotes": 0
  }
}
```

---

### 3. Single-Request Election Summary
`GET /api/results/:id/summary`

Consolidates all 7 required dashboard metrics into one single API request.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Complete election summary retrieved successfully",
  "data": {
    "election": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Campus Student Council Election 2026",
      "status": "COMPLETED"
    },
    "winner": {
      "isTie": false,
      "fullName": "Alice Smith",
      "voteCount": 75,
      "percentage": 75.0
    },
    "rankings": [...],
    "voteCounts": { "cand-1": 75, "cand-2": 25 },
    "turnout": {
      "eligibleVoters": 100,
      "votesCast": 75,
      "turnoutPercentage": 75.0,
      "rejectedVotes": 0
    },
    "analytics": {
      "totalVotesAnalyzed": 75,
      "byDepartment": { "labels": [...], "datasets": [...], "rechartsData": [...] },
      "byBranch": { "labels": [...], "datasets": [...], "rechartsData": [...] },
      "byYear": { "labels": [...], "datasets": [...], "rechartsData": [...] },
      "byRole": { "labels": [...], "datasets": [...], "rechartsData": [...] }
    },
    "timestamp": "2026-08-08T00:59:00.000Z"
  }
}
```

---

### 4. Demographic Analytics
`GET /api/results/:id/demographics`

Generates grouped voter demographic metrics by department, branch, year, and role. Formatted directly for Chart.js (`labels`, `datasets`) and Recharts (`rechartsData`).

---

### 5. Downloadable PDF Election Report
`GET /api/results/:id/report`

- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="Election_Report_....pdf"`
- Generates a clean PDF document containing election metadata, winner callout box, turnout cards, candidate rankings table, and blockchain audit signature statement.

---

### 6. Export Endpoints
`GET /api/results/:id/export/:format`

- **Supported Formats**: `pdf`, `csv`, `json`, `excel` (`xlsx`)
- **Headers**: Automatically sets appropriate `Content-Type` (`text/csv`, `application/json`, `application/vnd.ms-excel`, `application/pdf`).

---

## Error Handling

| Status Code | Error Type | Condition |
| --- | --- | --- |
| `400 Bad Request` | `InvalidStateError` | Election is `DRAFT`, `CANCELLED`, `ARCHIVED`, or voting has not ended. |
| `400 Bad Request` | `ValidationError` | Invalid or unsupported export format parameter. |
| `404 Not Found` | `NotFoundError` | Election ID does not exist. |
| `500 Internal Error` | `InternalServerError` | Server internal failure. |

#### Error JSON Format
```json
{
  "success": false,
  "error": "Election with ID 123e4567-e89b-12d3-a456-426614174000 not found.",
  "errorType": "NotFoundError"
}
```
