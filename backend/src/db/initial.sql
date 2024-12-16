INSERT INTO branches (branch_id, name, description) VALUES
('ise', 'Information Science and Engineering', 'ISE Department'),
('cse', 'Computer Science and Engineering', 'CSE Department'),
('ec', 'Electronics and Communication', 'EC Department'),
('eee', 'Electrical and Electronics Engineering', 'EEE Department')
('placement', 'Placement Department', 'Placement Department');;

INSERT INTO colleges (college_id, name, description, logo_url) VALUES
('bit', 'Bangalore Institute of Technology', 'A leading technical institute.', 'https://upload.wikimedia.org/wikipedia/en/d/d7/Bangalore_Institute_of_Technology_logo.png');

INSERT INTO users (uid, name, email, password, dob, phone_no, college_id, branch_id, role, verified, batch, cgpa, resume_link, description, profile_image_url) VALUES
('1BI21IS023', 'B M Pavan', 'bmp143code@gmail.com', '$2a$10$37G93Yov3znJKcU4noMvmuh9ChRklSVvejAH7XphQcN.FxmrWoka.', '2002-05-22', 7892353133, 'bit', 'ise', 'student', true, NULL, NULL, NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/9512/9512683.png'),
('USER1', 'Admin', 'tpo@bit.com', '$2a$10$7qNI9wnfVY95rmt1hKWxku6SFswBOtqxoKy7P9YL1BjF6dlplR6Ye', '1980-01-01', 9876543210, 'bit', 'placement', 'admin', true, NULL, NULL, NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/9512/9512683.png'),
('USER2', 'Vani', 'vani@bit.com', '$2a$10$TDKrCekx.GOG0x/dlaUh0.wnxRM9hWehbzIVTwPNJ2mPjyT7Oc0pK', '1985-05-15', 9876543211, 'bit', 'ise', 'department-staff', true, NULL, NULL, NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/9512/9512683.png'),
('USER3', 'Revi', 'revi@bit.com', '$2a$10$TDKrCekx.GOG0x/dlaUh0.wnxRM9hWehbzIVTwPNJ2mPjyT7Oc0pK', '1985-06-01', 9876543212, 'bit', 'placement', 'placement-staff', true, NULL, NULL, NULL, NULL, 'https://cdn-icons-png.flaticon.com/512/9512/9512683.png');

INSERT INTO companies (id, company_id, name, description, logo_url) VALUES
(1, 'COMM4F570TH', 'Tejas Networks', 'Tejas Networks specializes in telecommunications equipment.', 'https://www.tejasnetworks.com/wp-content/uploads/2023/12/tejas-header.png'),
(2, 'COMM4FB34X4', 'Boeing', 'Boeing is an aerospace leader.', 'https://www.boeing.com/content/experience-fragments/theboeingcompany/us/en/site/header/master/_jcr_content/root/image.coreimg.85.1600.png/1702094008961/logo.png'),
(3, 'COMM4XY1234', 'Infosys', 'Infosys provides IT services and consulting.', 'https://www.unifiedmentor.com/img/industry/company-1.jpg'),
(4, 'COMM4XY5678', 'Google', 'Google is a technology leader in search and advertising.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png');

INSERT INTO jobs (id, job_id, college_id, company_id, role, deadline, skills, description, jd_pdf_link, batch, job_type, status, status_date, branches, created_at) VALUES
(1, 'JOB1', 'bit', 'COMM4F570TH', 'Network Engineer', '2024-12-31', 'Networking, Protocols, Python', 'Responsible for network infrastructure development.', NULL, NULL, 'full-time', 'OPEN', NULL, NULL, '2024-12-09'),
(2, 'JOB2', 'bit', 'COMM4FB34X4', 'Aerospace Engineer', '2024-12-25', 'Mechanical Design, CAD', 'Work on aerospace design and development.', NULL, NULL, 'internship', 'OPEN', NULL, NULL, '2024-12-09'),
(3, 'JOB3', 'bit', 'COMM4XY1234', 'Software Developer', '2024-12-20', 'Java, Spring Boot, Microservices', 'Develop enterprise-level software.', NULL, NULL, 'both', 'OPEN', NULL, NULL, '2024-12-09'),
(4, 'JOB4', 'bit', 'COMM4XY5678', 'Data Scientist', '2024-12-15', 'Python, Machine Learning, Big Data', 'Analyze and process large datasets.', NULL, NULL, 'both', 'OPEN', NULL, NULL, '2024-12-09'),
(5, 'JOB9YXIJW5R', 'bit', 'COMM4F570TH', 'Devops', '2024-12-31', 'AWS, CICD, Git, GitOps', 'DevOps is the combination of cultural philosophies, practices, and tools that increases an organizations ability to deliver applications and services at high velocity.', 'https://vtu.ac.in/pdf/bba/Samkruthika.pdf', NULL, 'full-time', 'OPEN', '2024-12-31', NULL, '2024-12-09'),
(6, 'JOBH00346U8', 'bit', 'COMM4XY1234', 'Backend developer', '2025-12-06', 'Java, Nodejs, php, RestAPI', 'Knowledge of Web Server Programming Languages and Their Frameworks...', NULL, NULL, 'full-time', 'OPEN', '2025-12-06', NULL, '2024-12-09');

INSERT INTO reviews (college_id, company_id, uid, review, created_at) VALUES
('bit', 'COMM4F570TH', 'USER2', 'Tejas Networks provides excellent learning opportunities.', NOW()),
('bit', 'COMM4FB34X4', 'USER2', 'Boeing offers exciting projects in aerospace.', NOW()),
('bit', 'COMM4XY1234', 'USER2', 'Infosys has a great work environment.', NOW()),
('bit', 'COMM4XY5678', 'USER2', 'Google fosters innovation and creativity.', NOW());

