INSERT INTO Users (username, email, password_hash, role) VALUES

('alice123', 'alice@example.com', 'hashed123', 'owner'),

('bobwalker', 'bob@example.com', 'hashed456', 'walker'),

('carol123', 'carol@example.com', 'hashed789', 'owner'),

('david456', 'david@example.com', 'hashed101', 'owner'),

('emmawalker', 'emma@example.com', 'hashed202', 'walker');



INSERT INTO Dogs (owner_id, name, size) VALUES

((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),

((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),

((SELECT user_id FROM Users WHERE username = 'alice123'), 'Charlie', 'large'),

((SELECT user_id FROM Users WHERE username = 'david456'), 'Luna', 'small'),

((SELECT user_id FROM Users WHERE username = 'david456'), 'Rocky', 'medium');



INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES

((SELECT dog_id FROM Dogs WHERE name = 'Max' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')),

'2025-06-10 08:00:00', 30, 'Parklands', 'open'),

((SELECT dog_id FROM Dogs WHERE name = 'Bella' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')),

'2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),

((SELECT dog_id FROM Dogs WHERE name = 'Charlie' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')),

'2025-06-11 10:00:00', 60, 'Adelaide Himeji Garden', 'open'),

((SELECT dog_id FROM Dogs WHERE name = 'Luna' AND owner_id = (SELECT user_id FROM Users WHERE username = 'david456')),

'2025-06-11 14:00:00', 30, 'Bonython Park', 'completed'),

((SELECT dog_id FROM Dogs WHERE name = 'Rocky' AND owner_id = (SELECT user_id FROM Users WHERE username = 'david456')),

'2025-06-12 07:30:00', 45, 'North Adelaide Dog Park', 'cancelled');