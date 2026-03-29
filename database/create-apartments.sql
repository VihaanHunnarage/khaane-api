-- Create Apartments table for storing apartment data
CREATE TABLE IF NOT EXISTS Apartments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  address VARCHAR(500),
  city VARCHAR(100) DEFAULT 'Mumbai',
  state VARCHAR(100) DEFAULT 'Maharashtra',
  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample apartments (add more as needed)
INSERT INTO Apartments (name, address, city) VALUES
('Prestige Heights', 'Andheri West, Mumbai', 'Mumbai'),
('Sunshine Apartments', 'Bandra East, Mumbai', 'Mumbai'),
('Galaxy Heights', 'Juhu, Mumbai', 'Mumbai'),
('Oberoi Towers', 'Worli, Mumbai', 'Mumbai'),
('Raheja Residency', 'Powai, Mumbai', 'Mumbai'),
('Hiranandani Gardens', 'Powai, Mumbai', 'Mumbai'),
('Lokhandwala Complex', 'Andheri West, Mumbai', 'Mumbai'),
('Pali Hill Residency', 'Bandra West, Mumbai', 'Mumbai'),
('Imperial Heights', 'Malad West, Mumbai', 'Mumbai'),
('Runwal Greens', 'Mulund West, Mumbai', 'Mumbai'),
('Kalpataru Harmony', 'Borivali East, Mumbai', 'Mumbai'),
('Rustomjee Seasons', 'Bandra East, Mumbai', 'Mumbai'),
('Rizvi Oak', 'Versova, Mumbai', 'Mumbai'),
('Nirmal Lifestyle', 'Mulund West, Mumbai', 'Mumbai'),
('Acme Ozone', 'Thane West, Mumbai', 'Mumbai'),
('Ashar Metro Towers', 'Thane West, Mumbai', 'Mumbai'),
('Piramal Revanta', 'Mulund West, Mumbai', 'Mumbai'),
('Wadhwa Atmosphere', 'Mulund West, Mumbai', 'Mumbai'),
('Godrej The Trees', 'Vikhroli East, Mumbai', 'Mumbai'),
('Marathon Nexzone', 'Panvel, Navi Mumbai', 'Navi Mumbai');
