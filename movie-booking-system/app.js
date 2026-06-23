/**
 * CineReserve — Movie Ticket Booking System Logic
 * Implements: state management, event delegation, Local Storage, and async promises.
 */

// ==========================================================================
// 1. Mock Movie Data & Constants
// ==========================================================================

// [CONCEPT: Arrays & Objects] (Lines 11 - 52)
// The movies list is modeled as an Array of Objects. Each object represents a movie with properties like id, title, genre, poster path, etc.
const MOVIES = [
  {
    id: "supergirl",
    title: "Supergirl: Woman of Tomorrow",
    genre: "Action / Sci-Fi / Adventure",
    rating: 8.5,
    duration: "2h 10m",
    synopsis: "Based on the DC Comics character, Supergirl embarks on a thrilling cosmic adventure across the galaxy, escaping the ruins of Krypton and fighting to protect her new home on Earth from ancient intergalactic threats.",
    poster: "assets/Supergirl (6_26_26).jpeg",
    price: 250.00
  },
  {
    id: "the-odyssey",
    title: "The Odyssey",
    genre: "Sci-Fi / Drama / History",
    rating: 9.4,
    duration: "2h 45m",
    synopsis: "Directed by Christopher Nolan and featuring a star-studded cast, The Odyssey is a mind-bending historical science-fiction drama exploring a cosmic voyage across time, space, and gravity anomalies. Shot entirely with IMAX cameras.",
    poster: "assets/christopher nolan film odyssey.jpeg",
    price: 300.00
  },
  {
    id: "avengers-doomsday",
    title: "Avengers: Doomsday",
    genre: "Action / Adventure / Sci-Fi",
    rating: 9.0,
    duration: "2h 35m",
    synopsis: "In Marvel Studios' Avengers: Doomsday, Earth's mightiest heroes face their most formidable adversary yet, Victor von Doom, played by Robert Downey Jr. The heroes must unite across time and dimensions to halt absolute cosmic doom.",
    poster: "assets/download (1).jpeg",
    price: 350.00
  },
  {
    id: "spiderman-brand-new-day",
    title: "Spider-Man: Brand New Day",
    genre: "Action / Sci-Fi / Fantasy",
    rating: 8.8,
    duration: "2h 15m",
    synopsis: "With the past erased and his choices shaping the future, Spider-Man returns in Brand New Day. Faced with new enemies and a world that has forgotten Peter Parker, he must define what it truly means to be a hero.",
    poster: "assets/download.jpeg",
    price: 200.00
  }
];

// [CONCEPT: Arrays] (Lines 55 - 56)
// Using arrays to configure visual coordinate definitions (rows and columns) for the seating grid.
const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEAT_COLS = 8;

// ==========================================================================
// 2. State Variables
// ==========================================================================

// [CONCEPT: Objects & Arrays] (Lines 64 - 67)
// Variables hold dynamic application state: arrays for chosen seats and historical logs, and objects for occupancy keys.
let currentMovie = null; // Object: Current selected movie detail
let selectedDate = "";
let selectedTime = "";
let selectedSeats = []; // Array: Holds IDs of seats currently highlighted by user (e.g., ["A3", "A4"])
let occupiedSeats = {}; // Object: Map of sessions to arrays of occupied seats (e.g., {"supergirl_date_time": ["B2"]})
let bookingsHistory = []; // Array: List of transaction receipt objects saved in history

// ==========================================================================
// 3. DOM Elements
// ==========================================================================

// [CONCEPT: DOM Manipulation] (Lines 75 - 97)
// Querying nodes from the Document Object Model (DOM) to update content and trigger visual views.
const movieGrid = document.getElementById("movie-grid");
const bookingSection = document.getElementById("booking-section");
const selectedMovieTitleDisplay = document.getElementById("selected-movie-title-display");
const seatingGrid = document.getElementById("seating-grid");
const showDateSelect = document.getElementById("show-date");
const showTimeSelect = document.getElementById("show-time");
const ticketBasePriceSpan = document.getElementById("ticket-base-price");
const selectedSeatsBadge = document.getElementById("selected-seats-badge");
const totalPriceDisplay = document.getElementById("total-price-display");
const bookTicketBtn = document.getElementById("book-ticket-btn");

// Modals
const bookingsModal = document.getElementById("bookings-modal");
const viewBookingsBtn = document.getElementById("view-bookings-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const bookingsList = document.getElementById("bookings-list");

const receiptModal = document.getElementById("receipt-modal");
const ticketReceiptStub = document.getElementById("ticket-receipt-stub");
const closeReceiptBtn = document.getElementById("close-receipt-btn");

// Loader
const loaderOverlay = document.getElementById("loader-overlay");

// ==========================================================================
// 4. Initialization & Setup
// ==========================================================================

// [CONCEPT: Events] (Lines 105 - 112)
// Using an Event Listener to capture the window loading event and initialize the app layout securely.
document.addEventListener("DOMContentLoaded", () => {
  initLocalStorage();
  generateDateTimeOptions();
  renderMovieCards();
  setupEventListeners();
  // Initialize Lucide Icons
  lucide.createIcons();
});

// [CONCEPT: Local Storage] (Lines 118 - 128)
// Reading saved strings from browser Local Storage and parsing them back to JavaScript data via JSON.parse().
function initLocalStorage() {
  const savedBookings = localStorage.getItem("cine_reserve_bookings");
  if (savedBookings) {
    bookingsHistory = JSON.parse(savedBookings); // Deserialization
  }

  const savedOccupied = localStorage.getItem("cine_reserve_occupied_seats");
  if (savedOccupied) {
    occupiedSeats = JSON.parse(savedOccupied); // Deserialization
  }
}

// [CONCEPT: DOM Manipulation & Arrays] (Lines 134 - 159)
// Dynamically generating select options inside the DOM by looping through dates arrays.
function generateDateTimeOptions() {
  const dates = [];
  const today = new Date();
  
  // Array Operations: Populate 5-day list
  for (let i = 0; i < 5; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    
    let dayLabel = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
    if (i === 0) dayLabel = "Today";
    if (i === 1) dayLabel = "Tomorrow";
    
    const formattedDate = `${dayLabel}, ${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    dates.push(formattedDate); // Array operation
  }

  // DOM Writing: Inject date options into HTML select element using map()
  showDateSelect.innerHTML = dates.map(d => `<option value="${d}">${d}</option>`).join("");
  selectedDate = dates[0];

  // DOM Writing: Inject times into select elements
  const times = ["11:00 AM", "2:15 PM", "5:30 PM", "8:45 PM", "11:15 PM"];
  showTimeSelect.innerHTML = times.map(t => `<option value="${t}">${t}</option>`).join("");
  selectedTime = times[0];
}

// [CONCEPT: DOM Manipulation, Arrays & Objects] (Lines 165 - 200)
// Mapping array elements (MOVIES) to structural HTML nodes and writing them into the DOM container.
function renderMovieCards() {
  movieGrid.innerHTML = MOVIES.map(movie => `
    <article class="movie-card" id="card-${movie.id}" data-id="${movie.id}">
      <div class="movie-poster-wrapper">
        <img class="movie-poster" src="${movie.poster}" alt="${movie.title} Poster" loading="lazy">
        <div class="rating-badge">
          <i data-lucide="star"></i>
          <span>${movie.rating.toFixed(1)}</span>
        </div>
      </div>
      <div class="movie-details">
        <span class="movie-genre">${movie.genre}</span>
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-meta">
          <div class="movie-meta-item">
            <i data-lucide="clock"></i>
            <span>${movie.duration}</span>
          </div>
          <div class="movie-meta-item">
            <i data-lucide="indian-rupee"></i>
            <span>${movie.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <!-- Overlay details with selection CTA -->
      <div class="card-overlay">
        <p class="overlay-synopsis">${movie.synopsis}</p>
        <button class="select-movie-btn" data-id="${movie.id}">
          <i data-lucide="ticket"></i>
          <span>Book Tickets</span>
        </button>
      </div>
    </article>
  `).join("");
}

// [CONCEPT: Events & Event Delegation] (Lines 206 - 256)
// Setting up DOM event triggers. Implements Event Delegation on grids (listening to parent nodes to catch child triggers).
function setupEventListeners() {
  // Event Delegation: Listening to click on movieGrid rather than attaching listeners to each card
  movieGrid.addEventListener("click", (e) => {
    const selectBtn = e.target.closest(".select-movie-btn");
    const movieCard = e.target.closest(".movie-card");
    
    if (selectBtn || movieCard) {
      const movieId = selectBtn ? selectBtn.dataset.id : movieCard.dataset.id;
      selectMovie(movieId);
    }
  });

  // Change Events: Triggers when the selection option changes
  showDateSelect.addEventListener("change", (e) => {
    selectedDate = e.target.value;
    resetSeatSelection();
    renderSeatMap();
  });

  showTimeSelect.addEventListener("change", (e) => {
    selectedTime = e.target.value;
    resetSeatSelection();
    renderSeatMap();
  });

  // Event Delegation: Listening to clicks inside seatingGrid
  seatingGrid.addEventListener("click", (e) => {
    const seat = e.target.closest(".seat");
    if (seat && !seat.classList.contains("occupied")) {
      const seatId = seat.dataset.id;
      toggleSeatSelection(seatId);
    }
  });

  // Standard Click Event
  bookTicketBtn.addEventListener("click", handleBookingSubmit);

  // Modal Dialog Open/Close Click Events
  viewBookingsBtn.addEventListener("click", openBookingsModal);
  closeModalBtn.addEventListener("click", closeBookingsModal);
  closeReceiptBtn.addEventListener("click", () => {
    receiptModal.classList.add("hidden");
  });

  // Close modals on backdrop window clicks
  window.addEventListener("click", (e) => {
    if (e.target === bookingsModal) closeBookingsModal();
    if (e.target === receiptModal) receiptModal.classList.add("hidden");
  });
}

// ==========================================================================
// 5. Booking Flow & State Updates
// ==========================================================================

// [CONCEPT: DOM Manipulation & Objects] (Lines 264 - 286)
// Changing DOM class attributes and text content of elements dynamically based on the current selected Movie Object.
function selectMovie(movieId) {
  currentMovie = MOVIES.find(m => m.id === movieId); // Find object in array
  if (!currentMovie) return;

  // DOM Class List updates
  document.querySelectorAll(".movie-card").forEach(card => {
    card.classList.remove("selected-card");
  });
  document.getElementById(`card-${movieId}`).classList.add("selected-card");

  // DOM Text content updates
  selectedMovieTitleDisplay.textContent = `${currentMovie.title} (${currentMovie.genre})`;
  ticketBasePriceSpan.textContent = `₹${currentMovie.price.toFixed(2)}`;

  resetSeatSelection();
  renderSeatMap();
  
  // Show section panel and scroll into viewport
  bookingSection.classList.remove("hidden");
  bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// [CONCEPT: DOM Manipulation & Local Storage] (Lines 292 - 332)
// Rendering the seat layouts reactively based on local storage caches.
function renderSeatMap() {
  if (!currentMovie) return;

  const sessionKey = `${currentMovie.id}_${selectedDate}_${selectedTime}`;
  
  // Local Storage Check: Generate mock occupancy if no record exists yet
  if (!occupiedSeats[sessionKey]) {
    occupiedSeats[sessionKey] = generateMockOccupiedSeats(sessionKey);
    localStorage.setItem("cine_reserve_occupied_seats", JSON.stringify(occupiedSeats)); // Save JSON string
  }

  const sessionOccupied = occupiedSeats[sessionKey];

  let html = "";
  
  // DOM generation using nested iterations
  SEAT_ROWS.forEach(row => {
    html += `<div class="row-label">${row}</div>`;
    
    for (let col = 1; col <= SEAT_COLS; col++) {
      const seatId = `${row}${col}`;
      const isOccupied = sessionOccupied.includes(seatId); // Array evaluation
      const isSelected = selectedSeats.includes(seatId); // Array evaluation
      
      let seatClass = "seat";
      if (isOccupied) seatClass += " occupied";
      else if (isSelected) seatClass += " selected";
      
      html += `<div class="${seatClass}" data-id="${seatId}"></div>`;
    }
  });

  seatingGrid.innerHTML = html; // DOM Insertion
  
  updateCalculations();
}

// [CONCEPT: Arrays] (Lines 338 - 361)
// Generating deterministic layouts of occupied seats using standard array manipulations (push, includes).
function generateMockOccupiedSeats(sessionKey) {
  let seed = 0;
  for (let i = 0; i < sessionKey.length; i++) {
    seed += sessionKey.charCodeAt(i);
  }
  
  const mockOccupied = []; // Array initialization
  const seatsToOccupyCount = 8 + (seed % 11); 
  
  while (mockOccupied.length < seatsToOccupyCount) {
    const row = SEAT_ROWS[Math.floor(((seed * mockOccupied.length + 13) % 997) % SEAT_ROWS.length)];
    const col = Math.floor(((seed * (mockOccupied.length + 1) + 47) % 997) % SEAT_COLS) + 1;
    const seatId = `${row}${col}`;
    
    if (!mockOccupied.includes(seatId)) { // Array checking
      mockOccupied.push(seatId); // Array pushing
    }
    seed = (seed * 11 + 59) % 10000;
  }
  
  return mockOccupied;
}

// [CONCEPT: Arrays & DOM Manipulation] (Lines 367 - 384)
// Toggling selected seats inside arrays and synchronizing CSS layout class tags in the DOM.
function toggleSeatSelection(seatId) {
  const index = selectedSeats.indexOf(seatId); // Find item index in array
  if (index > -1) {
    selectedSeats.splice(index, 1); // Array removal
  } else {
    selectedSeats.push(seatId); // Array addition
  }

  // DOM updating directly on class lists for smooth UI feedback
  const seatEl = seatingGrid.querySelector(`.seat[data-id="${seatId}"]`);
  if (seatEl) {
    seatEl.classList.toggle("selected");
  }

  updateCalculations();
}

// [CONCEPT: Arrays] (Line 387 - 390)
// Cleaning selected state list values in array.
function resetSeatSelection() {
  selectedSeats = [];
  updateCalculations();
}

// [CONCEPT: DOM Manipulation & Arrays] (Lines 396 - 410)
// Calculating subtotals, sorting selections, and enabling buttons in DOM based on array sizes.
function updateCalculations() {
  if (selectedSeats.length > 0) {
    selectedSeatsBadge.textContent = selectedSeats.sort().join(", "); // Array sort and join
    selectedSeatsBadge.style.color = "var(--secondary)";
  } else {
    selectedSeatsBadge.textContent = "None";
    selectedSeatsBadge.style.color = "var(--text-dark)";
  }

  const cost = currentMovie ? currentMovie.price * selectedSeats.length : 0;
  totalPriceDisplay.textContent = `₹${cost.toFixed(2)}`;

  // DOM State Control
  bookTicketBtn.disabled = selectedSeats.length === 0;
}

// ==========================================================================
// 6. Async Booking Execution
// ==========================================================================

// [CONCEPT: Async Concepts & Local Storage] (Lines 418 - 466)
// An async reservation pipeline that blocks UI, awaits simulated server verification, and saves results in Local Storage.
async function handleBookingSubmit() {
  if (!currentMovie || selectedSeats.length === 0) return;

  // DOM Update: reveal load indicator overlay
  loaderOverlay.classList.remove("hidden");
  
  try {
    // [ASYNC] Awaiting a simulated standard network transaction latency
    await simulateNetworkPayment();

    const bookingCode = "CR-" + Math.floor(100000 + Math.random() * 900000);
    const sessionKey = `${currentMovie.id}_${selectedDate}_${selectedTime}`;
    const totalCost = currentMovie.price * selectedSeats.length;

    // [OBJECT] Setup transaction ticket logging object
    const newBooking = {
      bookingId: bookingCode,
      movieId: currentMovie.id,
      movieTitle: currentMovie.title,
      genre: currentMovie.genre,
      date: selectedDate,
      time: selectedTime,
      seats: [...selectedSeats],
      price: totalCost
    };

    // [LOCAL STORAGE] Push booking object to ledger and store in local cache
    bookingsHistory.unshift(newBooking); // Array unshift
    localStorage.setItem("cine_reserve_bookings", JSON.stringify(bookingsHistory)); // Serialization

    // [LOCAL STORAGE] Update occupied session arrays and store in local cache
    occupiedSeats[sessionKey] = [...(occupiedSeats[sessionKey] || []), ...selectedSeats];
    localStorage.setItem("cine_reserve_occupied_seats", JSON.stringify(occupiedSeats)); // Serialization

    // Trigger Success UI ticket
    renderReceipt(newBooking);
    
    selectedSeats = [];
    renderSeatMap(); // Updates layout visual and resets selections
    
  } catch (error) {
    console.error("Booking verification failed:", error);
    alert("Transaction timed out. Please try again.");
  } finally {
    // DOM Update: hide loader overlay
    loaderOverlay.classList.add("hidden");
  }
}

// [CONCEPT: Async Concepts - Promises & Timers] (Lines 472 - 478)
// Simulates an asynchronous operation (like a API checkout request) by returning a Promise that resolves after a setTimeout timer.
function simulateNetworkPayment() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Resolves promise
    }, 2000); // 2-second timeout
  });
}

// [CONCEPT: DOM Manipulation & Objects] (Lines 484 - 515)
// Building dynamic receipt details inside DOM elements using variables from the Booking Object.
function renderReceipt(booking) {
  ticketReceiptStub.innerHTML = `
    <div class="ticket-row-header">
      <h4 class="ticket-movie-name">${booking.movieTitle}</h4>
      <p class="ticket-movie-genre">${booking.genre}</p>
    </div>
    <div class="ticket-details-grid">
      <div class="ticket-field">
        <span class="label">Date</span>
        <span class="val">${booking.date}</span>
      </div>
      <div class="ticket-field">
        <span class="label">Time</span>
        <span class="val">${booking.time}</span>
      </div>
      <div class="ticket-field">
        <span class="label">Seats</span>
        <span class="val">${booking.seats.sort().join(", ")}</span>
      </div>
      <div class="ticket-field">
        <span class="label">Total Paid</span>
        <span class="val">₹${booking.price.toFixed(2)}</span>
      </div>
    </div>
    <div class="ticket-footer-barcode">
      <div class="barcode-visual"></div>
      <span class="barcode-text">${booking.bookingId}</span>
    </div>
  `;

  // DOM update: reveal receipt popup window
  receiptModal.classList.remove("hidden");
  
  lucide.createIcons();
}

// ==========================================================================
// 7. Bookings History Panel
// ==========================================================================

// [CONCEPT: DOM Manipulation] (Lines 523 - 530)
// Modal control triggers.
function openBookingsModal() {
  bookingsModal.classList.remove("hidden");
  renderBookingsList();
}

function closeBookingsModal() {
  bookingsModal.classList.add("hidden");
}

// [CONCEPT: DOM Manipulation & Arrays] (Lines 536 - 579)
// Generating historical booking cards by mapping logged objects inside lists.
function renderBookingsList() {
  if (bookingsHistory.length === 0) {
    bookingsList.innerHTML = `
      <div class="no-bookings">
        <i data-lucide="ticket"></i>
        <p>You haven't reserved any tickets yet.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // DOM Writing: Mapping bookings array elements to cards
  bookingsList.innerHTML = bookingsHistory.map(booking => `
    <div class="booking-item-card" id="booking-${booking.bookingId}">
      <div class="booking-item-left">
        <h4 class="booking-item-title">${booking.movieTitle}</h4>
        <div class="booking-item-meta">
          <span>${booking.date}</span>
          <span>&bull;</span>
          <span>${booking.time}</span>
          <span>&bull;</span>
          <span>₹${booking.price.toFixed(2)}</span>
        </div>
        <div class="booking-item-seats">
          Seats: ${booking.seats.sort().join(", ")}
        </div>
      </div>
      <button class="cancel-booking-btn" data-id="${booking.bookingId}">
        <i data-lucide="trash-2"></i>
        <span>Cancel</span>
      </button>
    </div>
  `).join("");

  lucide.createIcons();

  // Attach cancel events
  const cancelButtons = bookingsList.querySelectorAll(".cancel-booking-btn");
  cancelButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      cancelBooking(btn.dataset.id);
    });
  });
}

// [CONCEPT: Arrays, Local Storage & DOM Manipulation] (Lines 585 - 617)
// Splicing logs arrays, removing dynamic allocations in Local Storage, and re-rendering grids in DOM.
function cancelBooking(bookingId) {
  const index = bookingsHistory.findIndex(b => b.bookingId === bookingId); // Array search
  if (index === -1) return;

  const booking = bookingsHistory[index];
  
  if (!confirm(`Are you sure you want to cancel your booking for ${booking.movieTitle}?`)) {
    return;
  }

  const sessionKey = `${booking.movieId}_${booking.date}_${booking.time}`;
  if (occupiedSeats[sessionKey]) {
    // Array operation: Filter out cancelled seats
    occupiedSeats[sessionKey] = occupiedSeats[sessionKey].filter(
      seat => !booking.seats.includes(seat)
    );
    // Local Storage: Save updated occupied array string
    localStorage.setItem("cine_reserve_occupied_seats", JSON.stringify(occupiedSeats));
  }

  // Array operation: Slices transaction log item out of list
  bookingsHistory.splice(index, 1);
  // Local Storage: Save updated bookings logs list string
  localStorage.setItem("cine_reserve_bookings", JSON.stringify(bookingsHistory));

  if (currentMovie && currentMovie.id === booking.movieId && selectedDate === booking.date && selectedTime === booking.time) {
    renderSeatMap(); // DOM re-render of seat visual
  }

  renderBookingsList(); // DOM re-render of modal visual
}
