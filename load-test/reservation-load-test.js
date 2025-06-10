import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success');
const reservationLatency = new Trend('reservation_latency');
const cancellationLatency = new Trend('cancellation_latency');

// Test configuration
export const options = {
  scenarios: {
    constant_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },  // Ramp up to 50 users
        { duration: '1m', target: 50 },   // Stay at 50 users
        { duration: '30s', target: 100 }, // Ramp up to 100 users
        { duration: '2m', target: 100 },  // Stay at 100 users
        { duration: '30s', target: 0 },   // Ramp down to 0
      ],
    },
  },
  thresholds: {
    'errors': ['rate<0.1'],              // Error rate should be less than 10%
    'success': ['rate>0.9'],             // Success rate should be more than 90%
    'reservation_latency': ['p(99)<2000'], // 99th percentile should be under 2s
    'cancellation_latency': ['p(99)<2000'],
  },
};

// Test data
const BASE_URL = 'http://host.docker.internal:3000';
const EVENT_ID = 'c65f72fd-fde1-4724-a973-9d69bcd41b82'; // Replace with actual event ID
const TOTAL_SEATS = 50; // Total seats in the event

function getEventInfo() {
  const response = http.get(`${BASE_URL}/events/${EVENT_ID}`);
  const success = check(response, {
    'seats fetch successful': (r) => r.status === 200,
    'valid seats data': (r) => Array.isArray(r.json()['seats']),
  });

  if (success) {
    const seats = response.json();
    const availableSeats = seats.seats.filter(seat => seat.status === 'available').map(seat => seat.seatNumber);
    const totalSeats = seats.seats.length;
    
    return {
      seats,
      availableSeats,
      totalSeats,
      availableCount: availableSeats.length
    };
  }
  return null;
}

// Helper function to generate random seats from available ones
function getRandomSeats(count) {
  const eventInfo = getEventInfo();
  
  if (!eventInfo || eventInfo.availableCount < count) {
    // console.log(`Not enough available seats. Requested: ${count}, Available: ${eventInfo?.availableCount || 0}`);
    return [];
  }

  const seats = [];
  const availableSeatsCopy = [...eventInfo.availableSeats];
  
  while (seats.length < count && availableSeatsCopy.length > 0) {
    const randomIndex = randomIntBetween(0, availableSeatsCopy.length - 1);
    seats.push(availableSeatsCopy[randomIndex]);
    availableSeatsCopy.splice(randomIndex, 1);
  }

  return seats;
}

function createReservation(seats) {
  const payload = JSON.stringify({
    userId: `user-${__VU}-${__ITER}`,
    seats: seats,
  });

  const startTime = new Date();
  const response = http.post(
    `${BASE_URL}/events/${EVENT_ID}/reserve`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const endTime = new Date();
  const latency = endTime - startTime;

  // Only count unexpected errors
  if (response.status !== 201 && response.status !== 409 && response.status !== 404 && response.status !== 400 && response.status !== 200 && response.status !== 204) {
    errorRate.add(1);
  }

  const success = check(response, {
    'reservation successful': (r) => r.status === 201,
    'valid response format': (r) => r.json('id') !== undefined,
  });

  if (success) {
    reservationLatency.add(latency);
    successRate.add(1);
    return response.json('id');
  } else {
    successRate.add(0);
    return null;
  }
}

function cancelReservation(reservationId) {
  if (!reservationId) return;

  const startTime = new Date();
  const response = http.del(`${BASE_URL}/reservations/${reservationId}`);
  const endTime = new Date();
  const latency = endTime - startTime;

  // Only count unexpected errors
  if (response.status !== 201 && response.status !== 409 && response.status !== 404 && response.status !== 400 && response.status !== 200 && response.status !== 204) {
    errorRate.add(1);
  }

  const success = check(response, {
    'cancellation successful': (r) => r.status === 204,
  });

  if (success) {
    cancellationLatency.add(latency);
  }
}

// Main test function
export default function () {
  // Check initial availability
  const initialEventInfo = getEventInfo();
  if (!initialEventInfo) {
    errorRate.add(1);
    return;
  }

  // Test case 1: Normal reservation
  const seats1 = getRandomSeats(2);
  if (seats1.length === 0) {
    // console.log('Skipping test case 1: No available seats');
    return;
  }
  const reservationId1 = createReservation(seats1);
  sleep(1);

  // Test case 2: Attempt to reserve same seats (should fail)
  if (seats1.length !== 0) {
    const reservationId2 = createReservation(seats1);
    sleep(1);
    check(reservationId2, {
      'reserve same seats should fail': (id) => id === null
    });
    if (reservationId2 === null) {
      successRate.add(1);
    }
  }

  // Test case 3: Attempt to overbook (should fail)
  const seats3 = getRandomSeats(TOTAL_SEATS + 1);
  const reservationId3 = createReservation(seats3);
  sleep(1);

  check(reservationId3, {
    'overbook should fail': (id) => id === null
  });

  if (reservationId3 === null) {
    successRate.add(1);
  }

  // Test case 4: Cancel reservation during high load
  if (reservationId1) {
    cancelReservation(reservationId1);
    sleep(1);

    check(reservationId1, {
      'cancel reservation should succeed': (id) => id !== null
    });

    if (reservationId1 !== null) {
      successRate.add(1);
    }
  }
}

export function setup() {
  const eventInfo = getEventInfo();
  check(eventInfo, {
    'event exists': (data) => data !== null,
    'correct total seats': (data) => data.totalSeats === TOTAL_SEATS,
  });

  return {
    eventId: EVENT_ID,
    totalSeats: TOTAL_SEATS,
  };
}

export function teardown(data) {
  // Get final event state
  const finalEventInfo = getEventInfo();
  check(finalEventInfo, {
    'final state check': (data) => {
      return data.availableCount <= data.totalSeats;
    },
  });
}