/**
 * CineReserve — Movie Ticket Booking System Logic
 * Implements: state management, event delegation, Local Storage, and async promises.
 */

// ==========================================================================
// 1. Mock Movie Data & Constants
// ==========================================================================
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

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEAT_COLS = 8;

// ==========================================================================
// 2. State Variables
// ==========================================================================
let currentMovie = null;
let selectedDate = "";
let selectedTime = "";
let selectedSeats = []; // Array of seat IDs (e.g., ["A3", "A4"])
let occupiedSeats = {}; // Key: "movieId_date_time" -> Array of seat IDs: ["B2", "C5"]
let bookingsHistory = []; // Array of booking objects

// ==========================================================================
// 3. DOM Elements
// ==========================================================================
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
document.addEventListener("DOMContentLoaded", () => {
  initLocalStorage();
  generateDateTimeOptions();
  renderMovieCards();
  setupEventListeners();
  // Initialize Lucide Icons
  lucide.createIcons();
});

// Load data from localStorage
function initLocalStorage() {
  const savedBookings = localStorage.getItem("cine_reserve_bookings");
  if (savedBookings) {
    bookingsHistory = JSON.parse(savedBookings);
  }

  const savedOccupied = localStorage.getItem("cine_reserve_occupied_seats");
  if (savedOccupied) {
    occupiedSeats = JSON.parse(savedOccupied);
  }
}

// Generate dynamic Date and Showtime options
function generateDateTimeOptions() {
  const dates = [];
  const today = new Date();
  
  // Create dates for next 5 days
  for (let i = 0; i < 5; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    
    // Format: "Mon, Jun 22" or "Today, Jun 22"
    let dayLabel = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
    if (i === 0) dayLabel = "Today";
    if (i === 1) dayLabel = "Tomorrow";
    
    const formattedDate = `${dayLabel}, ${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    dates.push(formattedDate);
  }

  // Populate Dates Select
  showDateSelect.innerHTML = dates.map(d => `<option value="${d}">${d}</option>`).join("");
  selectedDate = dates[0];

  // Populate Showtimes
  const times = ["11:00 AM", "2:15 PM", "5:30 PM", "8:45 PM", "11:15 PM"];
  showTimeSelect.innerHTML = times.map(t => `<option value="${t}">${t}</option>`).join("");
  selectedTime = times[0];
}

// Render now showing movie cards
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

// Set up UI Event listeners
function setupEventListeners() {
  // Movie selection via delegation
  movieGrid.addEventListener("click", (e) => {
    const selectBtn = e.target.closest(".select-movie-btn");
    const movieCard = e.target.closest(".movie-card");
    
    if (selectBtn || movieCard) {
      const movieId = selectBtn ? selectBtn.dataset.id : movieCard.dataset.id;
      selectMovie(movieId);
    }
  });

  // Date and Time selection change
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

  // Seat interaction (Delegation inside seat-grid)
  seatingGrid.addEventListener("click", (e) => {
    const seat = e.target.closest(".seat");
    if (seat && !seat.classList.contains("occupied")) {
      const seatId = seat.dataset.id;
      toggleSeatSelection(seatId);
    }
  });

  // Booking Checkout Click
  bookTicketBtn.addEventListener("click", handleBookingSubmit);

  // Modal actions
  viewBookingsBtn.addEventListener("click", openBookingsModal);
  closeModalBtn.addEventListener("click", closeBookingsModal);
  closeReceiptBtn.addEventListener("click", () => {
    receiptModal.classList.add("hidden");
  });

  // Close modals on background clicking
  window.addEventListener("click", (e) => {
    if (e.target === bookingsModal) closeBookingsModal();
    if (e.target === receiptModal) receiptModal.classList.add("hidden");
  });
}

// ==========================================================================
// 5. Booking Flow & State Updates
// ==========================================================================

// Handle selecting a movie card
function selectMovie(movieId) {
  currentMovie = MOVIES.find(m => m.id === movieId);
  if (!currentMovie) return;

  // Visual card updates
  document.querySelectorAll(".movie-card").forEach(card => {
    card.classList.remove("selected-card");
  });
  document.getElementById(`card-${movieId}`).classList.add("selected-card");

  // Update Seating Layout Header Details
  selectedMovieTitleDisplay.textContent = `${currentMovie.title} (${currentMovie.genre})`;
  ticketBasePriceSpan.textContent = `₹${currentMovie.price.toFixed(2)}`;

  // Re-generate list for fresh state
  resetSeatSelection();
  renderSeatMap();
  
  // Show seating layout container and smoothly scroll to it
  bookingSection.classList.remove("hidden");
  bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Renders the seat map grid dynamically
function renderSeatMap() {
  if (!currentMovie) return;

  const sessionKey = `${currentMovie.id}_${selectedDate}_${selectedTime}`;
  
  // Initialize dynamic occupied seats if they don't exist yet
  // We populate a few mock occupied seats deterministically based on date/time/movie to make the system look active
  if (!occupiedSeats[sessionKey]) {
    occupiedSeats[sessionKey] = generateMockOccupiedSeats(sessionKey);
    localStorage.setItem("cine_reserve_occupied_seats", JSON.stringify(occupiedSeats));
  }

  const sessionOccupied = occupiedSeats[sessionKey];

  let html = "";
  
  // Create layout
  SEAT_ROWS.forEach(row => {
    // Row label header
    html += `<div class="row-label">${row}</div>`;
    
    // Column seats
    for (let col = 1; col <= SEAT_COLS; col++) {
      const seatId = `${row}${col}`;
      const isOccupied = sessionOccupied.includes(seatId);
      const isSelected = selectedSeats.includes(seatId);
      
      let seatClass = "seat";
      if (isOccupied) seatClass += " occupied";
      else if (isSelected) seatClass += " selected";
      
      html += `<div class="${seatClass}" data-id="${seatId}"></div>`;
    }
  });

  seatingGrid.innerHTML = html;
  
  // Re-evaluate ticket calculation values
  updateCalculations();
}

// Generate realistic pseudo-random seating per session
function generateMockOccupiedSeats(sessionKey) {
  // Simple seed based on string lengths/characters to get reproducible random seating layouts
  let seed = 0;
  for (let i = 0; i < sessionKey.length; i++) {
    seed += sessionKey.charCodeAt(i);
  }
  
  const mockOccupied = [];
  // Occupy between 8 to 18 seats randomly
  const seatsToOccupyCount = 8 + (seed % 11); 
  
  while (mockOccupied.length < seatsToOccupyCount) {
    const row = SEAT_ROWS[Math.floor(((seed * mockOccupied.length + 13) % 997) % SEAT_ROWS.length)];
    const col = Math.floor(((seed * (mockOccupied.length + 1) + 47) % 997) % SEAT_COLS) + 1;
    const seatId = `${row}${col}`;
    
    if (!mockOccupied.includes(seatId)) {
      mockOccupied.push(seatId);
    }
    // Simple mock seed progression
    seed = (seed * 11 + 59) % 10000;
  }
  
  return mockOccupied;
}

// Toggle selections
function toggleSeatSelection(seatId) {
  const index = selectedSeats.indexOf(seatId);
  if (index > -1) {
    selectedSeats.splice(index, 1);
  } else {
    selectedSeats.push(seatId);
  }

  // Sync state classes with DOM directly for fluid feedback
  const seatEl = seatingGrid.querySelector(`.seat[data-id="${seatId}"]`);
  if (seatEl) {
    seatEl.classList.toggle("selected");
  }

  updateCalculations();
}

// Reset chosen seats state
function resetSeatSelection() {
  selectedSeats = [];
  updateCalculations();
}

// Update totals, labels and checkout button availability
function updateCalculations() {
  if (selectedSeats.length > 0) {
    selectedSeatsBadge.textContent = selectedSeats.sort().join(", ");
    selectedSeatsBadge.style.color = "var(--secondary)";
  } else {
    selectedSeatsBadge.textContent = "None";
    selectedSeatsBadge.style.color = "var(--text-dark)";
  }

  const cost = currentMovie ? currentMovie.price * selectedSeats.length : 0;
  totalPriceDisplay.textContent = `₹${cost.toFixed(2)}`;

  // Enable button if seats are selected
  bookTicketBtn.disabled = selectedSeats.length === 0;
}

// ==========================================================================
// 6. Async Booking Execution
// ==========================================================================
async function handleBookingSubmit() {
  if (!currentMovie || selectedSeats.length === 0) return;

  // Show the loader overlay
  loaderOverlay.classList.remove("hidden");
  
  try {
    // Async simulation: Secure reservations with standard network promise
    await simulateNetworkPayment();

    // Setup record
    const bookingCode = "CR-" + Math.floor(100000 + Math.random() * 900000);
    const sessionKey = `${currentMovie.id}_${selectedDate}_${selectedTime}`;
    const totalCost = currentMovie.price * selectedSeats.length;

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

    // Update global state & persistent stores
    bookingsHistory.unshift(newBooking);
    localStorage.setItem("cine_reserve_bookings", JSON.stringify(bookingsHistory));

    // Register seats as permanently occupied in this session
    occupiedSeats[sessionKey] = [...(occupiedSeats[sessionKey] || []), ...selectedSeats];
    localStorage.setItem("cine_reserve_occupied_seats", JSON.stringify(occupiedSeats));

    // Trigger Success UI Receipt
    renderReceipt(newBooking);
    
    // Clean up seat lists
    selectedSeats = [];
    renderSeatMap(); // Renders with new occupied list + resets values
    
  } catch (error) {
    console.error("Booking verification failed:", error);
    alert("Transaction timed out. Please try again.");
  } finally {
    // Hide loader overlay
    loaderOverlay.classList.add("hidden");
  }
}

// Simulated network transaction promise (Async concepts)
function simulateNetworkPayment() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2000); // 2-second simulation
  });
}

// Generate the final booking success ticket stub receipt
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

  // Display success modal
  receiptModal.classList.remove("hidden");
  
  // Re-enable icons inside generated DOM elements if any
  lucide.createIcons();
}

// ==========================================================================
// 7. Bookings History Panel
// ==========================================================================
function openBookingsModal() {
  bookingsModal.classList.remove("hidden");
  renderBookingsList();
}

function closeBookingsModal() {
  bookingsModal.classList.add("hidden");
}

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

// Cancel a booked ticket (reverse Local Storage reservation)
function cancelBooking(bookingId) {
  const index = bookingsHistory.findIndex(b => b.bookingId === bookingId);
  if (index === -1) return;

  const booking = bookingsHistory[index];
  
  // Ask for confirmation
  if (!confirm(`Are you sure you want to cancel your booking for ${booking.movieTitle}?`)) {
    return;
  }

  // Remove occupied seat records in local storage
  const sessionKey = `${booking.movieId}_${booking.date}_${booking.time}`;
  if (occupiedSeats[sessionKey]) {
    occupiedSeats[sessionKey] = occupiedSeats[sessionKey].filter(
      seat => !booking.seats.includes(seat)
    );
    localStorage.setItem("cine_reserve_occupied_seats", JSON.stringify(occupiedSeats));
  }

  // Remove from log array
  bookingsHistory.splice(index, 1);
  localStorage.setItem("cine_reserve_bookings", JSON.stringify(bookingsHistory));

  // Re-render seating layouts if currently visualising this session
  if (currentMovie && currentMovie.id === booking.movieId && selectedDate === booking.date && selectedTime === booking.time) {
    renderSeatMap();
  }

  // Re-render list
  renderBookingsList();
}
