# St. Patrick's Makokoba - Codebase Documentation

## 1. Project Overview

This document provides a detailed explanation of the codebase for the St. Patrick's Catholic Church Makokoba website.

The project is a full-stack web application built with modern web technologies. It consists of a React frontend and a Node.js/Express backend.

### 1.1. Frontend (Client-side)

The frontend is a single-page application (SPA) built with **React** and **TypeScript**. It is responsible for rendering the user interface and interacting with the backend API.

- **Core Technologies:**
    - **React:** A JavaScript library for building user interfaces.
    - **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
    - **React Router:** For handling client-side routing.
    - **Leaflet:** An open-source JavaScript library for interactive maps.
    - **Lucide-React:** A library of simply designed icons.
    - **Create React App:** The project was bootstrapped with Create React App.

### 1.2. Backend (Server-side)

The backend is a RESTful API built with **Node.js** and the **Express** framework. It handles business logic, interacts with the database, and provides data to the frontend.

- **Core Technologies:**
    - **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
    - **Express:** A fast, unopinionated, minimalist web framework for Node.js.
    - **MySQL:** A popular open-source relational database. The `mysql2` driver is used for database interaction.
    - **JSON Web Tokens (JWT):** For secure authentication.
    - **Bcrypt.js:** For hashing passwords.
    - **Multer:** For handling file uploads.
    - **Joi & Express-Validator:** For data validation.

## 2. Backend (Server-side)

### 2.1. Server Setup (`backend/server.js`)

The main server file initializes the Express application and configures middleware, routes, and error handling.

- **Middleware Configuration:**
    - `helmet`: Adds various security headers to HTTP responses.
    - `express-rate-limit`: Limits repeated requests to public APIs and/or endpoints such as password reset.
    - `cors`: Enables Cross-Origin Resource Sharing, allowing the frontend to make requests to the backend.
    - `express.json` & `express.urlencoded`: Parses incoming request bodies with JSON and URL-encoded payloads.
    - `compression`: Compresses response bodies for most requests.
    - `morgan`: Logs HTTP requests.
    - `express.static`: Serves static files (e.g., uploaded images).

- **Health Check:**
    - A health check endpoint is available at `/health` to verify that the API is running.

- **Routing:**
    - The server imports and mounts all the route handlers from the `backend/routes` directory under the `/api` prefix.

- **Error Handling:**
    - A 404 handler is in place for undefined API endpoints.
    - A global error handler catches and processes various types of errors, including validation errors, JWT errors, Multer errors, and database errors, returning standardized error responses.

- **Database Connection & Server Start:**
    - The `startServer` function tests the database connection and then starts the Express server.
    - The server listens on the port defined in the `.env` file or defaults to `5000`.

- **Graceful Shutdown:**
    - The server is configured to shut down gracefully on `SIGTERM` and `SIGINT` signals.

### 2.2. API Routes (`backend/routes`)

This section details the API endpoints available in the backend.

#### 2.2.1. Admin Routes (`/api/admin`)

These routes are for administrative purposes and require admin privileges.

- **`POST /api/admin/users`**: Creates a new user account. (Admin only)
- **`GET /api/admin/users`**: Retrieves a paginated list of all users. (Admin only)
- **`PUT /api/admin/users/:id`**: Updates a user's information. (Admin only)
- **`PATCH /api/admin/users/:id/reset-password`**: Resets a user's password. (Admin only)
- **`PATCH /api/admin/users/:id/toggle`**: Activates or deactivates a user's account. (Admin only)
- **`DELETE /api/admin/users/:id`**: Deletes a user account. (Admin only)
- **`GET /api/admin/users/stats`**: Retrieves statistics about users. (Admin only)

#### 2.2.2. Analytics Routes (`/api/analytics`)

These routes are for tracking and viewing website analytics. Some routes are public, while others require admin or content manager privileges.

- **`POST /api/analytics/track`**: Tracks a page visit. This is a public endpoint.
- **`GET /api/analytics/overview`**: Retrieves an overview of website analytics. (Content manager only)
- **`GET /api/analytics/pages`**: Retrieves analytics for specific pages. (Content manager only)
- **`GET /api/analytics/visitors`**: Retrieves analytics about visitors. (Content manager only)
- **`GET /api/analytics/realtime`**: Retrieves real-time analytics. (Content manager only)
- **`GET /api/analytics/content`**: Retrieves analytics for content like news and events. (Content manager only)
- **`DELETE /api/analytics/cleanup`**: Deletes old analytics data. (Content manager only)

#### 2.2.3. Announcements Routes (`/api/announcements`)

These routes are for managing announcements. Some endpoints are public, while others require content manager privileges.

- **`GET /api/announcements`**: Retrieves a paginated list of announcements. Public, but shows only active announcements for non-authenticated users.
- **`GET /api/announcements/active`**: Retrieves a list of currently active announcements. Public.
- **`GET /api/announcements/:id`**: Retrieves a single announcement by its ID. Public, but shows only active announcements for non-authenticated users.
- **`POST /api/announcements`**: Creates a new announcement. (Content manager only)
- **`PUT /api/announcements/:id`**: Updates an existing announcement. (Content manager only)
- **`DELETE /api/announcements/:id`**: Deletes an announcement. (Content manager only)
- **`PATCH /api/announcements/:id/toggle`**: Activates or deactivates an announcement. (Content manager only)
- **`GET /api/announcements/type/:type`**: Retrieves announcements of a specific type. Public, but shows only active announcements for non-authenticated users.
- **`GET /api/announcements/stats/overview`**: Retrieves statistics about announcements. (Content manager only)

#### 2.2.4. Auth Routes (`/api/auth`)

These routes are for user authentication and profile management.

- **`POST /api/auth/register`**: Registers a new user. Public.
- **`POST /api/auth/login`**: Logs in a user and returns a JWT token. Public.
- **`POST /api/auth/refresh`**: Refreshes a JWT token. Public.
- **`GET /api/auth/profile`**: Retrieves the profile of the currently authenticated user. (Authenticated users only)
- **`PUT /api/auth/profile`**: Updates the profile of the currently authenticated user. (Authenticated users only)
- **`PUT /api/auth/change-password`**: Changes the password of the currently authenticated user. (Authenticated users only)
- **`POST /api/auth/logout`**: Logs out the user (client-side token removal). (Authenticated users only)
- **`GET /api/auth/verify`**: Verifies if the current JWT token is valid. (Authenticated users only)

#### 2.2.5. Categories Routes (`/api/categories`)

These routes are for managing categories for news, events, and other content.

- **`GET /api/categories`**: Retrieves a paginated list of categories. Public, but shows only active categories for non-authenticated users.
- **`GET /api/categories/type/:type`**: Retrieves categories of a specific type. Public, but shows only active categories for non-authenticated users.
- **`GET /api/categories/:id`**: Retrieves a single category by its ID. Public, but shows only active categories for non-authenticated users.
- **`POST /api/categories`**: Creates a new category. (Content manager only)
- **`PUT /api/categories/:id`**: Updates an existing category. (Content manager only)
- **`DELETE /api/categories/:id`**: Deletes a category. (Content manager only)
- **`GET /api/categories/:id/usage`**: Retrieves usage statistics for a specific category. (Content manager only)
- **`GET /api/categories/stats/overview`**: Retrieves an overview of category statistics. (Content manager only)

#### 2.2.6. Contact Routes (`/api/contact`)

These routes are for managing the church's contact information.

- **`GET /api/contact`**: Retrieves the latest contact information. Public.
- **`PUT /api/contact`**: Updates the contact information. (Content manager only)
- **`GET /api/contact/history`**: Retrieves a history of changes to the contact information. (Content manager only)

#### 2.2.7. Events Routes (`/api/events`)

These routes are for managing church events.

- **`GET /api/events`**: Retrieves a paginated list of events. Public, but shows only published events for non-authenticated users.
- **`GET /api/events/upcoming`**: Retrieves a list of upcoming events. Public.
- **`GET /api/events/:id`**: Retrieves a single event by its ID. Public, but shows only published events for non-authenticated users.
- **`POST /api/events`**: Creates a new event. (Content manager only)
- **`PUT /api/events/:id`**: Updates an existing event. (Content manager only)
- **`DELETE /api/events/:id`**: Deletes an event. (Content manager only)
- **`POST /api/events/:id/register`**: Registers the authenticated user for an event. (Authenticated users only)
- **`GET /api/events/date-range/:start/:end`**: Retrieves events within a specific date range. Public, but shows only published events for non-authenticated users.
- **`GET /api/events/stats/overview`**: Retrieves statistics about events. (Content manager only)

#### 2.2.8. Gallery Routes (`/api/gallery`)

These routes are for managing the church's photo gallery.

- **`GET /api/gallery`**: Retrieves a paginated list of gallery images. Public.
- **`GET /api/gallery/featured`**: Retrieves a list of featured gallery images. Public.
- **`POST /api/gallery`**: Adds a new image to the gallery. (Content manager only)
- **`PUT /api/gallery/:id`**: Updates an existing gallery image. (Content manager only)
- **`DELETE /api/gallery/:id`**: Deletes a gallery image. (Content manager only)

#### 2.2.9. Ministries Routes (`/api/ministries`)

These routes are for managing the church's ministries.

- **`GET /api/ministries`**: Retrieves a paginated list of ministries. Public, but shows only active ministries for non-authenticated users.
- **`GET /api/ministries/active`**: Retrieves a list of all active ministries. Public.
- **`GET /api/ministries/:id`**: Retrieves a single ministry by its ID. Public, but shows only active ministries for non-authenticated users.
- **`POST /api/ministries`**: Creates a new ministry. (Content manager only)
- **`PUT /api/ministries/:id`**: Updates an existing ministry. (Content manager only)
- **`DELETE /api/ministries/:id`**: Deletes a ministry. (Content manager only)
- **`PATCH /api/ministries/:id/toggle`**: Activates or deactivates a ministry. (Content manager only)

#### 2.2.10. News Routes (`/api/news`)

These routes are for managing news articles.

- **`GET /api/news`**: Retrieves a paginated list of news articles. Public, but shows only published and non-archived articles for non-authenticated users.
- **`GET /api/news/:id`**: Retrieves a single news article by its ID. Public, but shows only published and non-archived articles for non-authenticated users.
- **`POST /api/news`**: Creates a new news article. (News creator or higher role required)
- **`PUT /api/news/:id`**: Updates an existing news article. (News creator or higher role required)
- **`PATCH /api/news/:id/archive`**: Archives a news article. (News creator or higher role required)
- **`PATCH /api/news/:id/unarchive`**: Unarchives a news article. (News creator or higher role required)
- **`DELETE /api/news/:id`**: Deletes a news article. (News creator or higher role required)
- **`GET /api/news/stats/overview`**: Retrieves statistics about news articles. (News creator or higher role required)

#### 2.2.11. Prayers Routes (`/api/prayers`)

These routes are for managing prayer intentions.

- **`GET /api/prayers`**: Retrieves a paginated list of prayer intentions. Public, but shows only approved intentions for non-authenticated users.
- **`POST /api/prayers`**: Submits a new prayer intention for review. Public.
- **`PATCH /api/prayers/:id/approve`**: Approves a prayer intention. (Content manager only)
- **`DELETE /api/prayers/:id`**: Deletes a prayer intention. (Content manager only)
- **`GET /api/prayers/pending`**: Retrieves a list of all pending prayer intentions. (Content manager only)
- **`GET /api/prayers/stats/overview`**: Retrieves statistics about prayer intentions. (Content manager only)

#### 2.2.12. Sacraments Routes (`/api/sacraments`)

These routes are for managing information about the sacraments offered by the church.

- **`GET /api/sacraments`**: Retrieves a paginated list of sacraments. Public, but shows only active sacraments for non-authenticated users.
- **`GET /api/sacraments/active`**: Retrieves a list of all active sacraments. Public.
- **`GET /api/sacraments/:id`**: Retrieves a single sacrament by its ID. Public, but shows only active sacraments for non-authenticated users.
- **`POST /api/sacraments`**: Creates a new sacrament entry. (Content manager only)
- **`PUT /api/sacraments/:id`**: Updates an existing sacrament entry. (Content manager only)
- **`DELETE /api/sacraments/:id`**: Deletes a sacrament entry. (Content manager only)
- **`PATCH /api/sacraments/:id/toggle`**: Activates or deactivates a sacrament entry. (Content manager only)

#### 2.2.13. Schedule Routes (`/api/schedule`)

These routes are for managing the church's mass and service schedule.

- **`GET /api/schedule`**: Retrieves the entire mass schedule, grouped by day. Public.
- **`GET /api/schedule/day/:day`**: Retrieves the schedule for a specific day of the week. Public.
- **`GET /api/schedule/:id`**: Retrieves a single schedule entry by its ID. Public.
- **`POST /api/schedule`**: Creates a new schedule entry. (Content manager only)
- **`PUT /api/schedule/:id`**: Updates an existing schedule entry. (Content manager only)
- **`DELETE /api/schedule/:id`**: Deletes a schedule entry. (Content manager only)
- **`PATCH /api/schedule/:id/toggle`**: Activates or deactivates a schedule entry. (Content manager only)
- **`PUT /api/schedule/day/:day/bulk`**: Bulk updates the schedule for a specific day. (Content manager only)
- **`GET /api/schedule/stats/overview`**: Retrieves statistics about the schedule. (Content manager only)

#### 2.2.14. Upload Routes (`/api/upload`)

These routes are for handling file uploads.

- **`POST /api/upload/single`**: Uploads a single file. (Content manager only)
- **`POST /api/upload/multiple`**: Uploads multiple files. (Content manager only)
- **`GET /api/upload`**: Retrieves a paginated list of uploaded files. (Content manager only)
- **`GET /api/upload/:id`**: Retrieves information about a single uploaded file. (Content manager only)
- **`DELETE /api/upload/:id`**: Deletes an uploaded file. (Content manager only)

#### 2.2.15. Users Routes (`/api/users`)

These routes are for managing user accounts and are restricted to administrators.

- **`GET /api/users`**: Retrieves a paginated list of all users. (Admin only)
- **`GET /api/users/:id`**: Retrieves a single user by their ID. (Admin only)
- **`POST /api/users`**: Creates a new user. (Admin only)
- **`PUT /api/users/:id`**: Updates an existing user. (Admin only)
- **`PATCH /api/users/:id/reset-password`**: Resets a user's password. (Admin only)
- **`PATCH /api/users/:id/toggle`**: Activates or deactivates a user account. (Admin only)
- **`DELETE /api/users/:id`**: Deletes a user. (Admin only)
- **`GET /api/users/role/:role`**: Retrieves all users with a specific role. (Admin only)
- **`GET /api/users/stats/overview`**: Retrieves statistics about users. (Admin only)

## 3. Frontend (Client-side)

The frontend of the application is a single-page application (SPA) built using React and TypeScript. It is responsible for the user interface and for interacting with the backend API.

### 3.1. Folder Structure (`src`)

The `src` directory contains all the frontend source code. Here is an overview of the key directories:

- **`components`**: Contains reusable UI components that are used across different pages of the application.
- **`contexts`**: Holds React context providers for managing global state, such as authentication and language settings.
- **`hooks`**: Contains custom React hooks that encapsulate reusable logic.
- **`pages`**: Contains the main page components for each route of the application.
- **`services`**: Includes modules for communicating with the backend API.

### 3.2. Application Entry Point (`src/index.tsx` and `src/App.tsx`)

- **`src/index.tsx`**: This is the main entry point of the React application. It uses `ReactDOM.createRoot` to render the main `App` component into the `div` with the `id` of `root` in the `public/index.html` file.

- **`src/App.tsx`**: This component is the root of the application's component tree. It sets up the following:
    - **Context Providers**: It wraps the entire application with `LanguageProvider`, `AdminProvider`, and `AuthProvider` to provide global state for language, admin-related data, and authentication.
    - **Router**: It uses `react-router-dom` to handle client-side routing.
    - **Main Layout**: It renders the `AuthenticatedApp` component, which is responsible for the main layout and routing logic of the application.

### 3.3. Main Layout and Routing

- **`src/components/AuthenticatedApp.tsx`**: This component is central to the application's layout and routing. It uses the `useAuth` hook to check the user's authentication status and role.
    - If the user is not authenticated, it renders the `Login` component.
    - If the user is an `admin`, it renders the `AdminDashboard`.
    - For regular authenticated users, it displays the main website, which includes the `Header`, `Footer`, and the main content routes.

- **`src/components/Header.tsx`**: This component renders the header of the website. It includes:
    - The church's logo and name.
    - A navigation menu with links to the different pages.
    - A language toggle button.
    - User information and a logout button if the user is authenticated.
    - A banner for urgent announcements.

- **`src/components/Footer.tsx`**: This component renders the footer of the website. It contains:
    - Quick links to important pages.
    - Mass times.
    - Contact information.
    - Social media links.
    - Copyright information.

### 3.4. Pages

This section describes the main pages of the application.

#### 3.4.1. Home Page (`src/pages/Home.tsx`)

The Home page is the main landing page of the website. It provides a comprehensive overview of the church's activities and information. The page is divided into the following sections:

- **Hero Section**: A full-width slider with background images, a welcome message, and links to the contact and calendar pages.
- **Spiritual Content**: Displays the "Theme of the Year", "Today's Readings", and "Saint of the Day".
- **From the Priest's Desk**: A message from the parish priest.
- **Quick Info**: Shows mass times, confession times, and catechism lessons.
- **Contact Information**: A quick contact section with address and phone numbers.
- **Ministry Highlights**: A preview of some of the church's ministries.
- **Community Gallery Preview**: A preview of the photo gallery.
- **Parish History**: A timeline of the parish's history.
- **About Us**: A brief "Our History" and "Our Mission" section.
- **Diaspora Corner**: A section for parishioners living abroad.

The page uses the `useLanguage` hook for translations and the `useAdmin` hook to fetch dynamic content like the theme of the year, saint of the day, and ministry highlights.

#### 3.4.2. Prayers Page (`src/pages/Prayers.tsx`)

This page is dedicated to prayers and daily devotional content.

- **Daily Readings**: Displays the liturgical date, season, and color, along with the first reading, psalm, and gospel for the day. The data is currently hardcoded but is designed to be replaced with data from a liturgical API.
- **Prayer Categories**: A filter to view prayers by category (e.g., Traditional, Marian, Saints).
- **Prayer Grid**: A grid of prayer cards, each containing an image, icon, title, and the full text of the prayer.
- **Prayer Schedule**: A schedule of daily communal prayers held at the parish.
- **Prayer Intentions**: A form that allows users to submit their prayer intentions.

The page uses the `useLanguage` hook for translations.

#### 3.4.3. Gallery Page (`src/pages/Gallery.tsx`)

This page displays the church's photo gallery, organized into groups and subgroups.

- **Group Tabs**: Allows users to select a top-level category (e.g., "Mass", "Association").
- **SubGroup Navigation**: Provides buttons to filter by a more specific category (e.g., "Palm Sunday", "CYA").
- **Image Gallery**: A grid of images for the selected subgroup. Clicking on an image opens a modal.
- **Image Modal**: A modal view to display a larger version of an image with its title and description.

The component uses local state to manage the active group, subgroup, and the currently selected image. The gallery data is currently hardcoded but is intended to be fetched from the backend.

#### 3.4.4. Ministries Page (`src/pages/Ministries.tsx`)

This page provides a comprehensive overview of the various ministries and associations within the parish. The page is organized into the following sections:

- **Youth Ministries**: Information about the different youth groups.
- **Women's Associations**: Details on the various associations for women.
- **Children's Ministry**: Information on the ministry for children.
- **Men's Guild**: Details about the men's association.
- **Prayer Groups**: Information on different prayer groups.
- **Liturgical Ministry**: Details on the liturgical ministries.
- **Committees**: Information about the various parish committees.

The component currently uses hardcoded data for the ministry details, but it is designed to be populated with dynamic data from the backend. It uses the `useLanguage` hook for translations.

#### 3.4.5. Outreach Page (`src/pages/Outreach.tsx`)

This page details the church's various outreach programs and community support initiatives.

- **Hero Section**: A hero section with the title "Serving Our Community".
- **Main Outreach Programs**: Details on the "Caritas Outreach" and "HIV/AIDS Ministry", including the services they provide.
- **Education Support**: Information on tutoring programs, a scholarship program, and adult literacy classes.
- **Archdiocese Connection**: Explains the parish's partnership with the Bulawayo Archdiocese.
- **How to Get Involved**: Information on volunteer opportunities and donation needs.
- **Emergency Contact**: Emergency contact information for urgent community needs.

The component currently uses hardcoded data and the `useLanguage` hook for translations.

#### 3.4.6. Sacraments Page (`src/pages/Sacraments.tsx`)

This page provides detailed information about the seven sacraments of the Catholic Church.

- **Sacrament Navigation**: Tabs allow users to select one of the seven sacraments: Baptism, Confirmation, Eucharist, Reconciliation, Anointing of the Sick, Marriage, and Holy Orders.
- **Sacrament Details**: For each sacrament, the page displays:
    - An overview of the sacrament, its requirements, and the preparation involved.
    - A list of frequently asked questions and their answers.
    - Contact information for the parish office for further inquiries.

The component uses local state to manage the currently selected sacrament. The detailed information for each sacrament is currently hardcoded within the component.

#### 3.4.7. Calendar Page (`src/pages/Calendar.tsx`)

This page displays a parish calendar with events and activities.

- **View Toggle**: Allows users to switch between a "Monthly View" and an "Upcoming Events" view.
- **Monthly View**:
    - A traditional calendar grid showing the days of the month.
    - Days with events are marked with colored dots corresponding to event categories.
    - Navigation to move to the previous/next month and a button to jump to the current day.
    - A legend for the event categories.
- **Upcoming Events View**:
    - A list of the next 10 upcoming events.
    - Each event is displayed as a card with details like category, date, title, description, time, and location.
- **Quick Add Event**: A button for admin users to navigate to the admin dashboard to add a new event.

The component uses the `useAdmin` hook to get the list of published events. The event data is currently managed within the `AdminContext`.

#### 3.4.8. Contact Page (`src/pages/Contact.tsx`)

This page provides contact information for the parish, a map, and a form to apply to become a church reporter.

- **Parish Information**: Displays the parish's address, phone numbers, and email address.
- **Office Hours**: Shows the office hours and lists the parish staff.
- **Church Location Map**: An interactive map using `react-leaflet` that shows the church's location with a marker and a popup with more information.
- **Become a Church Reporter Form**: A form for parishioners to apply to join the church's communications team. The form submission is currently a simulation.

The component uses `react-leaflet` for the interactive map and manages the form state with `useState`.

#### 3.4.9. Giving Page (`src/pages/Giving.tsx`)

This page provides information on the different ways to donate to the church.

- **Giving Options**: The page outlines several methods for donations:
    - **Offertory Collection**: Information about the traditional offering during Mass.
    - **Bank Transfers**: Bank account details for direct deposits.
    - **Mobile Money**: Information on how to donate using mobile money services like EcoCash and OneMoney.
    - **Special Projects**: A list of specific parish projects that require funding.
- **Stewardship Message**: A message about the importance of giving, which includes a relevant bible verse.

The component uses the `useLanguage` hook for translations.

#### 3.4.10. News Page (`src/pages/News.tsx`)

This page serves as a news hub, providing news from the parish and the wider Catholic Church.

- **News Tabs**: Users can switch between different news sources:
    - **Parish News**: News from the local parish.
    - **Diocese News**: News from the Archdiocese of Bulawayo.
    - **Vatican News**: News from the Vatican.
    - **Zimbabwe Catholic**: News from the Zimbabwe Catholic Bishops Conference.
    - **News Archive**: Archived news from the parish.
- **News Content**: Displays a grid of news cards for the selected source. Each card includes an image, date, author/source, title, and a summary.
- **Article Modal**: A "Read More" button on parish news articles opens a modal to display the full content. For external news, it opens the article in a new tab.
- **Archive Filter**: A dropdown allows users to filter archived news by year.

The component uses the `useAdmin` hook to get parish news, archived news, and to fetch external news. It uses local state to manage the active tab, selected article, and modal visibility.

### 3.5. Admin Dashboard

#### 3.5.1. Admin Dashboard Page (`src/pages/admin/AdminDashboard.tsx`)

This is the central hub for managing all the content of the website. It is a large and complex component that provides a comprehensive admin panel.

- **Sidebar**: A navigation sidebar with links to all the different management sections of the dashboard, including Overview, Announcements, Events, Gallery, News, and more.
- **Main Content Area**: The main area where the content for the selected section is displayed.
- **Overview Section**: The default section, which shows a dashboard with:
    - Quick statistics cards (e.g., Active Announcements, Published Events).
    - Quick action buttons for common tasks (e.g., New Announcement, Add Event).
    - A recent activity feed.
    - An overview of active parish members.
    - A preview of the current active announcement.
- **Management Sections**: The component conditionally renders different management components based on the selected section. These components are a mix of placeholder components defined within the file and more complex components imported from the `src/components/admin` directory.

The data for the dashboard is a mix of hardcoded mock data and data from the `useAdmin` hook.

#### 3.5.2. Announcement Manager (`src/components/admin/AnnouncementManager.tsx`)

This component provides a user interface for managing parish announcements.

- **Announcement Form**: A form, displayed in a modal, for creating and editing announcements. The form includes fields for title, message, type (info, urgent, event), an optional expiration date, and a toggle to set the announcement as active or inactive.
- **Announcements List**: A list of all announcements, with each announcement displayed as a card.
- **Announcement Card**: Each card shows the announcement's title, message, type, and status (active/inactive). It also provides action buttons to:
    - Toggle the active status.
    - Edit the announcement.
    - Delete the announcement.

The component uses the `useAdmin` hook to interact with the announcements data (get, add, update, delete).

---































