CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255) -- password in chiaro per test SQLi
);

INSERT INTO users (username, password) VALUES
('admin', 'admin'),
('user', 'pass123'),
('test', '123456'),
('hacker', 'sqlinjectme');
