# Reservation System Load Test

This directory contains load tests for the ticket reservation system using k6.

## Prerequisites

1. Configure test parameters in `reservation-load-test.js`:
   ```javascript
   const BASE_URL = 'http://host.docker.internal:3000';  // Update if needed
   const EVENT_ID = 'your-event-id';                     // Create new event for testing
   const TOTAL_SEATS = 50;                               // Update if needed
   ```

## Running the Tests

Run the load test:
```bash
k6 run reservation-load-test.js
```

Or using Docker:
```bash
docker run --rm -e HOST=host.docker.internal -v ${PWD}:/load-test grafana/k6 run /load-test/reservation-load-test.js --out json=results.json
```

## Test Scenarios

The load test simulates the following scenarios:

1. **Normal Reservation**
   - Attempts to reserve 2 random available seats
   - Verifies successful reservation

2. **Concurrent Seat Conflicts**
   - Attempts to reserve the same seats again
   - Verifies that duplicate reservation fails (409 Conflict)

3. **Overbooking Prevention**
   - Attempts to reserve more seats than available
   - Verifies that overbooking fails (400 Bad Request)

4. **Cancellation Under Load**
   - Cancels a successful reservation
   - Verifies successful cancellation

## Metrics and Thresholds

The test will fail if:
- Unexpected error rate exceeds 1% (excluding expected 409/400 responses)
- 99th percentile latency exceeds 2 seconds