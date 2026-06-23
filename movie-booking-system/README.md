# CineReserve — Movie Booking System

A premium single-page Movie Ticket Booking Web Application designed with a glassmorphic aesthetic, dark-mode styling, and interactive component state management. This project was built from scratch using **Vanilla HTML5, CSS3, and modern JavaScript (DOM)**.

---

## 🌟 System Features

1. **Now Showing Grid**: Displays a responsive list of movie cards featuring real-time titles, genres, duration, custom rating stars, and pricing details.
2. **Interactive Cinema Layout**: Displays a glowing theatrical screen layout with a seating grid that shows seat states (Available, Selected, or Occupied) in real-time.
3. **Session Seating Separation**: Dynamic seats are calculated separately for each movie, date, and showtime. If no prior seat layout exists, a deterministic layout of occupied seats is loaded to simulate an active theater session.
4. **Reactive Pricing breakdown**: Displays selected seat numbers, base ticket pricing, and recalculates the total subtotal instantly.
5. **Async Checkout Simulation**: Simulates a card payment gateway using promises and timers, blocking standard UI operations with a glassmorphic overlay spinner during the delay.
6. **Dynamic Ticket Receipts**: Renders a physical ticket receipt with perforated coupon edges, matching transaction keys, and a CSS-only barcode.
7. **Bookings Ledger**: Stores and lists all purchased tickets. Permits cancellations which vacant seats back onto the cinema grid.

---

## 🚀 Core Coding Concepts Explained (with `app.js` Line Reference)

The system is built as a clean codebase to master the following web principles:

### 1. Arrays
Arrays are used to configure seats, loop through data collections, filter arrays, and push/remove selected seat IDs.
* **Concepts**:
  * **Array Mapping (`.map()`)**: Transforms list items (e.g., movies or showdates) into HTML strings, which are then joined (`.join("")`) and written to the DOM.
  * **Element Searching (`.find()`, `.findIndex()`, `.includes()`)**: Evaluates seat selections, finds movie objects, and matches ticket IDs.
  * **Dicing Arrays (`.splice()`, `.filter()`)**: Adds or removes items when users select/cancel seats.
* **Line References in [app.js](file:///c:/Users/Aryan/OneDrive/Desktop/js%20practice/movie-booking-system/app.js)**:
  * **Lines 11–52**: `MOVIES` array storing movie schemas.
  * **Lines 55–56**: `SEAT_ROWS` array representing horizontal seating labels.
  * **Line 66**: `selectedSeats` array holding active choices.
  * **Line 67**: `bookingsHistory` array storing transaction logs.
  * **Line 144**: `dates.push()` adding dates dynamically to arrays.
  * **Lines 148, 152**: Mapping date and time arrays using `.map()` and `.join("")` to write option tags.
  * **Line 166**: `.map()` and `.join("")` translating movies array to card components.
  * **Line 289**: `.find()` fetching the movie details object by matching ID.
  * **Lines 319–320**: Using `.includes()` on arrays to evaluate seat statuses inside map iteration loop.
  * **Lines 342, 351, 353**: Array operations: `.includes()` checking state, `.push()` to store seats.
  * **Lines 371–373**: Index checking via `.indexOf()` and splicing out using `.splice()`.
  * **Line 400**: Sorting selection arrays `.sort()` and printing lists `.join(", ")`.
  * **Line 444**: Adding booking objects to log using `.unshift()`.
  * **Line 558**: Finding booking indexes using `.findIndex()`.
  * **Lines 570–572**: Filtering out vacant seats from arrays using `.filter()`.
  * **Line 578**: Splicing booking arrays using `.splice()`.

---

### 2. Objects
Objects act as custom data containers mapping keys to properties for movies, bookings, and occupied seats mapping.
* **Concepts**:
  * **Key-Value Dictionary**: Used in state variables to map string combinations to nested datasets.
  * **Data Schemas**: Standard structure modeling metadata.
* **Line References in [app.js](file:///c:/Users/Aryan/OneDrive/Desktop/js%20practice/movie-booking-system/app.js)**:
  * **Lines 12–51**: Nested objects inside the `MOVIES` array containing title, genre, runtime, rating, and poster metadata.
  * **Line 64**: `currentMovie` holding the selected movie object.
  * **Line 67**: `occupiedSeats` mapping unique session strings to array values.
  * **Lines 433–442**: Creating a transaction `newBooking` object containing booking details.

---

### 3. DOM (Document Object Model) Manipulation
Allows JavaScript to read, write, toggle class lists, and alter styles in HTML.
* **Concepts**:
  * **Querying nodes**: Connecting views using `document.getElementById`.
  * **Writing templates**: Replacing container trees using `.innerHTML`.
  * **Updating values**: Modifying tags using `.textContent` and `.style`.
  * **Visibility hooks**: Hiding/revealing modals and loaders with `.classList.add()` / `.classList.remove()`.
* **Line References in [app.js](file:///c:/Users/Aryan/OneDrive/Desktop/js%20practice/movie-booking-system/app.js)**:
  * **Lines 75–97**: Queries fetching page elements (`movieGrid`, `seatingGrid`, modals, loader).
  * **Line 148, 152**: Writing dates options directly to select tag DOM.
  * **Line 166**: Rendering card templates inside `movieGrid.innerHTML`.
  * **Lines 267–268**: Removing visual selected outlines on cards.
  * **Lines 272–273**: Injecting text titles and pricing details dynamically.
  * **Line 282**: Removing the `.hidden` class to render the booking panel.
  * **Line 325**: Rendering seat layout HTML directly in `seatingGrid.innerHTML`.
  * **Line 377**: Toggling selected states visually via `classList.toggle("selected")`.
  * **Lines 397–401**: Writing lists and cost figures reactively.
  * **Line 408**: Controlling button states dynamically via `.disabled`.
  * **Line 421**: Removing class lists to show async overlay spinners.
  * **Lines 484–504**: Writing transaction fields inside the physical ticket coupon template.
  * **Line 507**: Removing `.hidden` to show checkout receipts.
  * **Line 524, 529**: Modal dialog visual overlays toggle.
  * **Lines 547–566**: Writing transaction booking log items inside the modal listing.

---

### 4. Events
Allows capturing browser updates, selection updates, dropdown changes, and triggers.
* **Concepts**:
  * **Window Initialization**: Capturing `DOMContentLoaded` triggers.
  * **Event Delegation**: Binding a click listener to a parent node (`#seating-grid` or `#movie-grid`) and inspecting bubbles with `event.target.closest()` to improve client performance.
  * **Input updates**: Hooking change events (`change`) to dropdown selections.
* **Line References in [app.js](file:///c:/Users/Aryan/OneDrive/Desktop/js%20practice/movie-booking-system/app.js)**:
  * **Line 105**: Listening to window load using `DOMContentLoaded`.
  * **Lines 207–215**: Event Delegation on `movieGrid` targeting `.select-movie-btn`.
  * **Lines 218–228**: Dropdown options update triggers on `change` events.
  * **Lines 231–237**: Event Delegation on `seatingGrid` catching seat selectors.
  * **Line 240**: Booking checkout button click event listener.
  * **Lines 243–255**: Modals closing and opening events, including background backdrop dismissals.
  * **Lines 572–576**: Modal cancel event handler binding dynamically.

---

### 5. Local Storage
Provides access to browser persistent caches, saving sessions and booked tickets locally.
* **Concepts**:
  * **Caching string values**: `localStorage.setItem()` and `localStorage.getItem()`.
  * **Serialization / Deserialization**: Transforming datasets to strings via `JSON.stringify()` and back to JSON via `JSON.parse()`.
* **Line References in [app.js](file:///c:/Users/Aryan/OneDrive/Desktop/js%20practice/movie-booking-system/app.js)**:
  * **Lines 119, 124**: Retrieving stored tickets lists and parsing strings using `JSON.parse()`.
  * **Line 297**: Initializing and updating local seat allocations by stringifying JSON arrays.
  * **Line 445**: Writing new tickets lists to cache using `JSON.stringify()`.
  * **Line 449**: Storing newly booked seats using `JSON.stringify()`.
  * **Lines 574, 580**: Clearing/updating storage during cancellations.

---

### 6. Async Concepts
Enables non-blocking operations, network verification latencies, and loading indicators.
* **Concepts**:
  * **Promises**: Returning a new `Promise` wrapper that resolves after a specified timeout timer.
  * **Async/Await Control Flow**: Declaring an asynchronous callback thread (`async`) to pause execution (`await`) without locking browser paint frames.
* **Line References in [app.js](file:///c:/Users/Aryan/OneDrive/Desktop/js%20practice/movie-booking-system/app.js)**:
  * **Line 418**: Declaring `async function handleBookingSubmit()`.
  * **Line 424**: Pausing thread operations with `await simulateNetworkPayment()`.
  * **Lines 472–478**: Declaring helper `simulateNetworkPayment()` which returns `new Promise()` resolving inside a `setTimeout()` block of 2 seconds.
