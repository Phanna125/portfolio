# Flamer Chef: Comprehensive Project & Technical Report

**Flamer Chef** is a state-of-the-art web application designed to help users search, organize, and prepare authentic Cambodian dishes using ingredients they already have in their kitchen. By prioritizing food waste reduction and local-first accessibility, it bridges the gap between home-cooking convenience and professional recipe management.

---

## 1. Executive Summary & Brand Identity

* **Name**: Flamer Chef (ហ្វ្លេមមឺ ឆេហ្វ)
* **Core Value**: "Cook Like a Chef with What You Have" (ចម្អិនអាហារដូចមេចុងភៅដោយប្រើគ្រឿងផ្សំដែលអ្នកមាន)
* **Goal**: Provide a bilingual (English/Khmer) interactive platform for culinary discovery, centering on traditional Cambodian cuisine (Amok, Lok Lak, Kuy Teav, Samlor Kari).
* **Brand Aesthetic**: Warm, premium, and culinary-focused. It uses a modern dark theme accentuating fire-orange and bright mustard-yellow elements, representing heat, stir-fry ("Flamer"), and appetite.

---

## 2. Key Features & Capabilities

### 🔍 Smart Fridge Bilingual Match Engine
A search algorithm designed to map raw user queries (comma-separated lists of ingredients or dish names) to recipes. It expands terms using synonyms (e.g., matching "សាច់គោ" to "beef" and vice versa) and scores them based on relevance.

### ⏱️ Interactive Step-by-Step Cooking Assistant
A specialized "Cooking Mode" that breaks down selected recipes into individual stages. It features:
* Interactive count-down timers (with system notifications and alarms).
* Tip callouts and chef advice for complex culinary techniques.
* Step completion indicators to track cooking progress.

### 🖨️ Multi-Format Recipe Export
Leverages `html2canvas` and `jsPDF` to compile styled recipes, ingredients lists, and instructions into a high-quality PDF. This allows users to download and print recipes for offline kitchen use.

### 🔐 Secure Admin CRUD Panel
Provides recipe creators and system administrators with a private dashboard to:
* Add and update recipe profiles, ingredients, instructions, and durations.
* Securely upload food dish cover images using an Express storage service.
* Authenticate through a JWT token-based mechanism with password hashing (`bcryptjs`).

---

## 3. Technical Architecture & Tech Stack

```mermaid
graph TD
    User([User's Browser]) -->|React SPA| FE[Frontend: React 19 + Vite]
    FE -->|API requests & JWT Bearer| BE[Backend: Express Server]
    BE -->|Prisma Client ORM| DB[(PostgreSQL Database)]
    BE -->|Disk Storage| FS[Local Uploads File System]
```

### Frontend Stack
* **Vite & React 19**: Lightning-fast hot reloading and modular component rendering.
* **React Router v7**: Declarative routing between Home, Search, Recipe Details, Cooking Mode, and Admin Panel.
* **Lucide React**: High-quality SVG icons.
* **jsPDF & html2canvas**: Client-side document assembly and PDF rendering.
* **Canvas Confetti**: Visual celebration for completing a recipe cooking session.

### Backend Stack
* **Node.js & Express**: High-performance RESTful API endpoints.
* **JWT & BcryptJS**: Stateless authorization and credentials protection.
* **Prisma ORM**: Modern database access and schema migrations.
* **Multer**: Multi-part form-data parser for recipe image uploads.

---

## 4. System Workflows & Algorithmic Design

### A. Smart Search & Ranking Workflow
The core of Flamer Chef is the search ranking engine (`src/lib/searchRanking.js`). When a user inputs ingredients like `"beef, ginger"`, the system processes it as follows:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Page as SearchResults Page
    participant SearchEngine as searchRanking.js
    
    User->>Page: Type "beef, ginger"
    Page->>SearchEngine: rankRecipesByQuery(recipes, "beef, ginger")
    Note over SearchEngine: Split and clean: ["beef", "ginger"]
    Note over SearchEngine: Alias expansion:<br/>"beef" -> ["beef", "សាច់គោ", "គោ"]<br/>"ginger" -> ["ginger", "ខ្ញី"]
    
    loop For each recipe
        SearchEngine->>SearchEngine: Calculate Relevance Score
        Note over SearchEngine: Score Weights:<br/>- Title Exact Match: +260 pts<br/>- Ingredient Match: +220 pts<br/>- Category Match: +120 pts<br/>- Cooking Step Mention: +70 pts
    end
    
    SearchEngine->>Page: Return sorted list of recipes
    Page->>User: Display ranked Recipe Cards with Match %
```

### B. Interactive Cooking Mode & Timer Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant CM as CookingMode Page
    participant Timer as Local Timer Thread
    participant Audio as Web Audio API
    
    User->>CM: Click "Start Cooking"
    CM->>User: Show Step 1 instruction
    User->>CM: Navigate to Step with Timer (e.g. 15 mins)
    User->>CM: Click "Start Timer"
    
    loop Every Second
        Timer->>CM: Decrement seconds left
        CM->>User: Update UI progress circle
    end
    
    Timer->>Audio: Play alarm ringtone (Timer reaches 0)
    CM->>User: Flash alarm dialog
    User->>CM: Click "Stop Sound"
    User->>CM: Click "Complete Step"
    CM->>User: Show Congratulations (Confetti) if last step
```

---

## 5. Database Schema & Data Design

The database schema (`schema.prisma`) represents a normalized structure mapping users, recipes, ingredients, steps, and user logs.

```mermaid
erDiagram
    users {
        String id PK
        String email UK
        String password
        String role
        DateTime created_at
    }
    recipes {
        String id PK
        String name_en
        String name_km
        String image
        String category
        String difficulty
        Int prep_time
        Int cook_time
        Int servings
        Decimal rating
        String_array dietary
        DateTime created_at
    }
    recipe_ingredients {
        Int id PK
        String recipe_id FK
        String name
        String amount
        Boolean essential
        Int sort_order
    }
    recipe_steps {
        Int id PK
        String recipe_id FK
        String instruction
        Int timer
        String tip
        Int sort_order
    }
    user_favorites {
        Int id PK
        String user_id FK
        String recipe_id FK
        DateTime created_at
    }
    cooking_progress {
        Int id PK
        String user_id FK
        String recipe_id FK
        Int current_step
        Boolean completed
        DateTime last_cooked_at
    }

    users ||--o{ user_favorites : "saves"
    users ||--o{ cooking_progress : "tracks"
    recipes ||--o{ recipe_ingredients : "contains"
    recipes ||--o{ recipe_steps : "details"
    recipes ||--o{ user_favorites : "favorited_by"
    recipes ||--o{ cooking_progress : "cooked_in"
```

---

## 6. Marketing Campaign & Advertising Assets

A modern marketing campaign has been proposed to highlight the app's ease of use and focus on delicious Cambodian food. 

### Design Goals of the Advertising Creative:
1. **Showcase Authenticity**: Present signature dishes like *Fish Amok* (steamed in traditional banana leaves) and *Beef Lok Lak* to resonate immediately with the target demographic.
2. **Promote the "Fridge to Table" Concept**: Emphasize how the smart search feature helps users find cooking guides using leftover ingredients.
3. **Bridge Kitchen & Technology**: Place a mobile mockup directly in a rich kitchen atmosphere to show how clean and user-friendly the step-by-step assistant is.

### Promotional Campaign Banner:
Below is the generated high-end advertising graphic for the campaign:

![Flamer Chef Campaign Banner](file:///C:/Users/CP/.gemini/antigravity/brain/6354853e-86c6-4abc-8f39-8e7825bd6d2b/flamer_chef_ad_banner_1784281222708.png)
