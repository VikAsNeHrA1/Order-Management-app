# Order-Management-app
**This app provides a streamlined order management solution tailored for warehouse environments. Recognizing that small business owners often lack efficient order management tools and resort to platforms like WhatsApp for team and distributor communication, our app offers a user-friendly alternative.**

## [Walkthrough Video ](https://drive.google.com/file/d/1IdeC132IrJuJXD5-VC3ov4GpsNETLk5C/view?usp=drive_link)

### User Story
* **As a** store manager
* **I want** a streamlined ordering process for products
* **So that** there will be better communication between clients and employees
---
* The app features a basic user-friendly interface. 
* A simple "Add Order" button allows users to input order details such as quantity and notes, initiating a seamless transfer to the warehouse database.
* Warehouse managers receive timely orders, enabling them to efficiently review and process incoming orders.
* The app facilitates clear communication between store and warehouse managers, ensuring a smooth flow of information.
* As orders are fulfilled in real-time, the app contributes to a more organized and error-free stock management system.
* The overall result is a more efficient workflow for stock ordering and management for the retail stores.

### Team Name
**Team _Clumsy_**

## Team Members
* Aman Nawaria [REPO](https://github.com/amannawaria12?tab=repositories)
* Vikas Nehra [REPO](https://github.com/VikAsNeHrA1?tab=repositories)
* Will Wiggins [REPO](https://github.com/mithrandiryeet?tab=repositories)

### Background
During a recent summer vacation, one of our team members collaborated with a warehouse owner and gained insight into the business operations. He observed that their primary method for tracking warehouse stock was through a WhatsApp group chat. Recognizing the inefficiency, he believed there's potential for a more streamlined system to manage orders and monitor inventory levels.

### Application
This application is an Express-based web server connected to a MongoDB database, specifically designed for managing orders within a warehouse setting. The application offers CRUD (Create, Read, Update, Delete) operations for orders in the database.

### Project Scope
This project aims to develop a tailored application for warehouses and stores, enhancing the efficiency of order placement and inventory management. Recognizing that many warehouses currently rely on conventional messaging platforms like WhatsApp or iMessages for order processing, our program seeks to replace these makeshift methods with a more cohesive and targeted system.

_Examples of Current Order Management_
---
![Image 1](https://github.com/mithrandiryeet/oscar-pics/blob/main/IMG_7509.jpg) ![Image 2](https://github.com/mithrandiryeet/oscar-pics/blob/main/IMG_7510.jpg)
 ---
 
 #### Two User Pages
  Warehouse Page: 
   * Accessible to warehouse staff. 
   * Interface for receiving and processing incoming stock orders. 
     
  Store Owner Page: 
   * Accessible to store owners. 
   * Allows store owners to input stock requirements. 
   * Options for selecting and placing orders.

  #### Order Integration
   * Seamless integration of the warehouse and store owner pages.
   * Shop owners have the ability to add products, set quantities, and place orders.
   * Details about ordered stock are automatically sent to the warehouse page for processing.

  #### User-Friendly Interfaces
   * Intuitive design for both warehouse and store owner pages.
   * Simple stock input mechanisms for store owners.
   * Efficient order processing for warehouse staff.

 ## Features
List the key features of our application:
- User authentication (login/signup/logout)
- CRUD operations on orders
- Role-based access control for different user types (store, warehouse)
- Session management
- Responsive web pages with EJS templates

## Technologies
This project is built using:
- Node.js
- Express.js
- MongoDB
- [bcrypt for password hashing](https://github.com/VikAsNeHrA1/Order-Management-app/blob/ebbc22f43282cf317b0ca14f5007fc77f7911309/app.js#L151)
- EJS for templating
- dotenv for managing environment variables
## How Login system is working 
When a new user signs up, their password is hashed using bcrypt (with a salt round of 10) and stored in MongoDB, not as plain text.The hashed password is then stored in MongoDB with the username and user type. During login, the application checks the entered username and password. It retrieves the hashed password from the database and uses bcrypt.compare to match the entered password with the stored hash. If they match, the user is authenticated, session variables are set, and the user is redirected based on their user type.

## Installation
Follow these steps to set up the project locally:
1. Clone the repository: `https://github.com/VikAsNeHrA1/Order-Management-app.git`
2. Navigate to the project directory: `cd Order-Management-app`
3. Install dependencies: `npm install`
4. Create a `.env` file and set up the required environment variables (`PORT`, `MONGO_URI`)
5. Start the server: `npm start`

## API Endpoints
- `GET /`: Home page
- `POST /login`: User login
- `POST /signup`: User registration
- `GET /orders`: View all orders (restricted to 'warehouse' user type)
- `POST /orders/add`: Add a new order

  
