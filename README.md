# Hire Stream

**Hire Stream** is a comprehensive campus recruitment platform designed as a monorepo, consisting of:  

1. **Admin Portal** – A React-based frontend for colleges and recruiters to manage job postings and student applications.  
2. **Student Portal** – A React-based frontend for students to browse job listings and apply for opportunities.  
3. **Backend** – A Node.js and Express backend with PostgreSQL, supporting both portals with API endpoints.  
4. **Root Project (Runner)** – An external Node.js project utilizing `concurrently` to install dependencies and run all applications with a single command.

## Project Structure

```
hire_stream/
│── admin_portal/      # React frontend for admin users  
│── student_portal/    # React frontend for students  
│── backend/           # Node.js backend with PostgreSQL  
│── package.json       # Root project scripts for managing all applications  
```

## Getting Started  

### 1. Clone the repository  

```bash
git clone https://github.com/bm9avan/hire_stream.git
cd hire_stream
```

### 2. Install dependencies  

```bash
npm run in
```

### 3. Start the project  

- **Production Mode**:  
  ```bash
  npm start
  ```

- **Development Mode**:  
  ```bash
  npm run dev
  ```

This will run the **Student Portal, Admin Portal, and Backend** concurrently.  

## Technologies Used  

- **Frontend**: React, React Router, Tailwind CSS  
- **Backend**: Node.js, Express, PostgreSQL, Drizzle ORM  
- **Package Manager**: npm  
- **Process Management**: `concurrently`  

## Contributing  

Contributions are welcome! Fork the repository and submit a pull request.  

## Contact  

- **PAVAN**  
- **Email**: mggpavan@gmail.com  
- **GitHub**: [bm9avan](https://github.com/bm9avan)  
