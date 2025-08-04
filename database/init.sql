-- Virtual Vacation Database Initialization
-- This script sets up the database with initial data

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Countries table with initial data
INSERT INTO countries (code, name, capital, region, population, area, flag_url) VALUES
('US', 'United States', 'Washington, D.C.', 'Americas', 331900000, 9833517, 'https://flagcdn.com/w320/us.png'),
('GB', 'United Kingdom', 'London', 'Europe', 67886000, 243610, 'https://flagcdn.com/w320/gb.png'),
('FR', 'France', 'Paris', 'Europe', 65274000, 643801, 'https://flagcdn.com/w320/fr.png'),
('DE', 'Germany', 'Berlin', 'Europe', 83784000, 357114, 'https://flagcdn.com/w320/de.png'),
('IT', 'Italy', 'Rome', 'Europe', 60461000, 301340, 'https://flagcdn.com/w320/it.png'),
('ES', 'Spain', 'Madrid', 'Europe', 46755000, 505992, 'https://flagcdn.com/w320/es.png'),
('JP', 'Japan', 'Tokyo', 'Asia', 125800000, 377930, 'https://flagcdn.com/w320/jp.png'),
('CN', 'China', 'Beijing', 'Asia', 1439324000, 9596961, 'https://flagcdn.com/w320/cn.png'),
('IN', 'India', 'New Delhi', 'Asia', 1380004000, 3287263, 'https://flagcdn.com/w320/in.png'),
('BR', 'Brazil', 'Brasília', 'Americas', 212559000, 8514877, 'https://flagcdn.com/w320/br.png'),
('AU', 'Australia', 'Canberra', 'Oceania', 25499884, 7692024, 'https://flagcdn.com/w320/au.png'),
('CA', 'Canada', 'Ottawa', 'Americas', 37742154, 9984670, 'https://flagcdn.com/w320/ca.png'),
('MX', 'Mexico', 'Mexico City', 'Americas', 128932753, 1964375, 'https://flagcdn.com/w320/mx.png'),
('RU', 'Russia', 'Moscow', 'Europe', 145934462, 17098242, 'https://flagcdn.com/w320/ru.png'),
('ZA', 'South Africa', 'Cape Town', 'Africa', 59308690, 1221037, 'https://flagcdn.com/w320/za.png'),
('EG', 'Egypt', 'Cairo', 'Africa', 102334404, 1001449, 'https://flagcdn.com/w320/eg.png'),
('TR', 'Turkey', 'Ankara', 'Europe', 84339067, 783562, 'https://flagcdn.com/w320/tr.png'),
('TH', 'Thailand', 'Bangkok', 'Asia', 69799978, 513120, 'https://flagcdn.com/w320/th.png'),
('SG', 'Singapore', 'Singapore', 'Asia', 5850342, 719, 'https://flagcdn.com/w320/sg.png'),
('NL', 'Netherlands', 'Amsterdam', 'Europe', 17134872, 41850, 'https://flagcdn.com/w320/nl.png')
ON CONFLICT (code) DO NOTHING;

-- Popular cities with street view data
INSERT INTO cities (name, country_code, latitude, longitude, population, timezone, elevation, description, street_view_available, popularity_score) VALUES
-- United States
('New York', 'US', 40.7128, -74.0060, 8336817, 'America/New_York', 10, 'The city that never sleeps, famous for Times Square, Central Park, and the Statue of Liberty.', true, 100),
('Los Angeles', 'US', 34.0522, -118.2437, 3898747, 'America/Los_Angeles', 87, 'City of Angels, home to Hollywood and beautiful beaches.', true, 95),
('San Francisco', 'US', 37.7749, -122.4194, 873965, 'America/Los_Angeles', 52, 'Known for the Golden Gate Bridge, cable cars, and tech innovation.', true, 90),
('Las Vegas', 'US', 36.1699, -115.1398, 651319, 'America/Los_Angeles', 610, 'Entertainment capital of the world with casinos and shows.', true, 85),
('Miami', 'US', 25.7617, -80.1918, 467963, 'America/New_York', 2, 'Vibrant city known for beaches, nightlife, and Art Deco architecture.', true, 80),

-- United Kingdom
('London', 'GB', 51.5074, -0.1278, 9648110, 'Europe/London', 11, 'Historic capital with Big Ben, Tower Bridge, and world-class museums.', true, 98),
('Edinburgh', 'GB', 55.9533, -3.1883, 518500, 'Europe/London', 47, 'Scottish capital famous for its castle and annual festivals.', true, 75),
('Bath', 'GB', 51.3758, -2.3599, 101557, 'Europe/London', 25, 'UNESCO World Heritage city known for Roman baths and Georgian architecture.', true, 70),

-- France
('Paris', 'FR', 48.8566, 2.3522, 2161000, 'Europe/Paris', 35, 'City of Light, home to the Eiffel Tower, Louvre, and Notre-Dame.', true, 97),
('Nice', 'FR', 43.7102, 7.2620, 342522, 'Europe/Paris', 6, 'French Riviera gem with beautiful Mediterranean coastline.', true, 78),
('Lyon', 'FR', 45.7640, 4.8357, 515695, 'Europe/Paris', 162, 'Historic city known for Renaissance architecture and gastronomy.', true, 72),

-- Germany
('Berlin', 'DE', 52.5200, 13.4050, 3669491, 'Europe/Berlin', 34, 'Historic capital with Brandenburg Gate and vibrant cultural scene.', true, 88),
('Munich', 'DE', 48.1351, 11.5820, 1471508, 'Europe/Berlin', 520, 'Bavarian capital famous for Oktoberfest and Alpine culture.', true, 82),
('Hamburg', 'DE', 53.5488, 9.9872, 1899160, 'Europe/Berlin', 6, 'Port city known for its maritime heritage and nightlife.', true, 74),

-- Italy
('Rome', 'IT', 41.9028, 12.4964, 2873000, 'Europe/Rome', 21, 'Eternal City with Colosseum, Vatican, and ancient Roman ruins.', true, 96),
('Venice', 'IT', 45.4408, 12.3155, 261905, 'Europe/Rome', 1, 'Floating city of canals, gondolas, and romantic bridges.', true, 92),
('Florence', 'IT', 43.7696, 11.2558, 382258, 'Europe/Rome', 50, 'Renaissance capital with Duomo, Uffizi Gallery, and art treasures.', true, 87),
('Milan', 'IT', 45.4642, 9.1900, 1396059, 'Europe/Rome', 122, 'Fashion and design capital with La Scala opera house.', true, 83),

-- Spain
('Madrid', 'ES', 40.4168, -3.7038, 3223334, 'Europe/Madrid', 650, 'Spanish capital with Prado Museum and vibrant nightlife.', true, 86),
('Barcelona', 'ES', 41.3851, 2.1734, 1620343, 'Europe/Madrid', 12, 'Catalonian capital famous for Gaudí architecture and beaches.', true, 93),
('Seville', 'ES', 37.3891, -5.9845, 688711, 'Europe/Madrid', 7, 'Andalusian city known for flamenco, tapas, and Moorish architecture.', true, 79),

-- Japan
('Tokyo', 'JP', 35.6762, 139.6503, 37435191, 'Asia/Tokyo', 40, 'Modern metropolis blending tradition with cutting-edge technology.', true, 94),
('Kyoto', 'JP', 35.0116, 135.7681, 1475183, 'Asia/Tokyo', 56, 'Former imperial capital with temples, gardens, and geishas.', true, 89),
('Osaka', 'JP', 34.6937, 135.5023, 2691185, 'Asia/Tokyo', 5, 'Kitchen of Japan known for incredible street food and cuisine.', true, 81),

-- China
('Beijing', 'CN', 39.9042, 116.4074, 21542000, 'Asia/Shanghai', 44, 'Capital city with Forbidden City, Great Wall, and modern skyline.', true, 91),
('Shanghai', 'CN', 31.2304, 121.4737, 28516904, 'Asia/Shanghai', 4, 'Financial hub with futuristic skyline and historic Bund.', true, 88),

-- India
('New Delhi', 'IN', 28.6139, 77.2090, 32941308, 'Asia/Kolkata', 216, 'Capital city rich in history with Red Fort and India Gate.', true, 84),
('Mumbai', 'IN', 19.0760, 72.8777, 20411274, 'Asia/Kolkata', 8, 'Bollywood capital and financial center on the Arabian Sea.', true, 82),

-- Brazil
('Rio de Janeiro', 'BR', -22.9068, -43.1729, 6748000, 'America/Sao_Paulo', 2, 'Marvelous city with Christ the Redeemer, Copacabana, and Carnival.', true, 90),
('São Paulo', 'BR', -23.5558, -46.6396, 12325232, 'America/Sao_Paulo', 760, 'Largest city in South America, cultural and economic powerhouse.', true, 77),

-- Australia
('Sydney', 'AU', -33.8688, 151.2093, 5312163, 'Australia/Sydney', 1, 'Harbor city with Opera House, Harbour Bridge, and beautiful beaches.', true, 92),
('Melbourne', 'AU', -37.8136, 144.9631, 5078193, 'Australia/Melbourne', 31, 'Cultural capital known for coffee, food, and street art.', true, 85),

-- Canada
('Toronto', 'CA', 43.6532, -79.3832, 2931000, 'America/Toronto', 76, 'Diverse metropolis with CN Tower and multicultural neighborhoods.', true, 83),
('Vancouver', 'CA', 49.2827, -123.1207, 675218, 'America/Vancouver', 70, 'Pacific coast city surrounded by mountains and ocean.', true, 80),

-- Other notable cities
('Dubai', 'AE', 25.2048, 55.2708, 3400000, 'Asia/Dubai', 5, 'Futuristic city in the desert with towering skyscrapers and luxury.', true, 87),
('Singapore', 'SG', 1.3521, 103.8198, 5850342, 'Asia/Singapore', 15, 'Garden city-state blending cultures, cuisine, and modern architecture.', true, 86),
('Amsterdam', 'NL', 52.3676, 4.9041, 872680, 'Europe/Amsterdam', -2, 'Canal city famous for museums, cycling, and liberal culture.', true, 84),
('Prague', 'CZ', 50.0755, 14.4378, 1318000, 'Europe/Prague', 399, 'Fairy-tale city with medieval architecture and castle views.', true, 81),
('Istanbul', 'TR', 41.0082, 28.9784, 15519267, 'Europe/Istanbul', 39, 'Bridge between Europe and Asia with rich Byzantine and Ottoman history.', true, 85),
('Bangkok', 'TH', 13.7563, 100.5018, 10539415, 'Asia/Bangkok', 2, 'Vibrant capital known for temples, street food, and floating markets.', true, 83),
('Cairo', 'EG', 30.0444, 31.2357, 20901000, 'Africa/Cairo', 74, 'Ancient city home to the Pyramids of Giza and Sphinx.', true, 79),
('Cape Town', 'ZA', -33.9249, 18.4241, 4618000, 'Africa/Johannesburg', 1, 'Mother City with Table Mountain, wine regions, and stunning coastline.', true, 78),
('Moscow', 'RU', 55.7558, 37.6176, 12506468, 'Europe/Moscow', 156, 'Russian capital with Red Square, Kremlin, and onion-domed churches.', true, 80)
ON CONFLICT (name, country_code) DO NOTHING;

-- Radio stations data
INSERT INTO radio_stations (name, country_code, stream_url, genre, language, website) VALUES
-- US Radio Stations
('KCRW Santa Monica', 'US', 'https://kcrw.streamguys1.com/kcrw_192k_mp3_on_air', 'Alternative', 'English', 'https://kcrw.com'),
('WNYC New York', 'US', 'https://fm939.wnyc.org/wnycfm', 'News/Talk', 'English', 'https://wnyc.org'),
('KQED San Francisco', 'US', 'https://streams.kqed.org/kqedradio', 'News/Talk', 'English', 'https://kqed.org'),

-- UK Radio Stations
('BBC Radio 1', 'GB', 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', 'Pop', 'English', 'https://bbc.co.uk/radio1'),
('BBC Radio 6 Music', 'GB', 'https://stream.live.vc.bbcmedia.co.uk/bbc_6music', 'Alternative', 'English', 'https://bbc.co.uk/6music'),
('Capital FM London', 'GB', 'https://media-ssl.musicradio.com/CapitalMP3', 'Pop', 'English', 'https://capitalfm.com'),

-- French Radio Stations
('Radio France Inter', 'FR', 'https://direct.franceinter.fr/live/franceinter-midfi.mp3', 'News/Talk', 'French', 'https://franceinter.fr'),
('NRJ France', 'FR', 'https://cdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3', 'Pop', 'French', 'https://nrj.fr'),
('Nostalgie France', 'FR', 'https://cdn.nrjaudio.fm/audio1/fr/30601/mp3_128.mp3', 'Oldies', 'French', 'https://nostalgie.fr'),

-- German Radio Stations
('Bayern 3', 'DE', 'https://br-br3-live.cast.addradio.de/br/br3/live/mp3/128/stream.mp3', 'Pop', 'German', 'https://bayern3.de'),
('WDR 2', 'DE', 'https://wdr-wdr2-westfalen.icecastssl.wdr.de/wdr/wdr2/westfalen/mp3/128/stream.mp3', 'Pop', 'German', 'https://wdr2.de'),
('Radio Hamburg', 'DE', 'https://stream.radiohamburg.de/rhh-live/mp3-192/', 'Pop', 'German', 'https://radiohamburg.de'),

-- Italian Radio Stations
('Radio Deejay', 'IT', 'https://radiodeejay-lh.akamaihd.net/i/RadioDeejay_Live_1@189857/master.m3u8', 'Pop', 'Italian', 'https://deejay.it'),
('RTL 102.5', 'IT', 'https://radiortl-lh.akamaihd.net/i/RadioRTL_1@357906/master.m3u8', 'Pop', 'Italian', 'https://rtl.it'),
('Radio Capital', 'IT', 'https://radiocapital-lh.akamaihd.net/i/RadioCapital_Live_1@196312/master.m3u8', 'Rock', 'Italian', 'https://capital.it'),

-- Japanese Radio Stations
('J-Wave Tokyo', 'JP', 'https://radiko.jp/#!/ts/FMJ', 'J-Pop', 'Japanese', 'https://j-wave.co.jp'),
('NHK Radio 1', 'JP', 'https://radio-stream.nhk.jp/hls/live/2023229/nhkradiruakr1/master.m3u8', 'News/Talk', 'Japanese', 'https://nhk.or.jp');

-- Ambient sounds data
INSERT INTO ambient_sounds (name, category, file_url, duration, volume_level, loop_enabled) VALUES
('City Traffic', 'city', '/sounds/city-traffic.mp3', 300, 0.4, true),
('Busy Street', 'city', '/sounds/busy-street.mp3', 240, 0.5, true),
('Market Square', 'city', '/sounds/market-square.mp3', 360, 0.6, true),
('Subway Station', 'transport', '/sounds/subway-station.mp3', 180, 0.5, true),
('Airport Terminal', 'transport', '/sounds/airport-terminal.mp3', 420, 0.4, true),
('Train Journey', 'transport', '/sounds/train-journey.mp3', 600, 0.3, true),
('Ocean Waves', 'nature', '/sounds/ocean-waves.mp3', 480, 0.7, true),
('Forest Birds', 'nature', '/sounds/forest-birds.mp3', 360, 0.6, true),
('Rain Sounds', 'nature', '/sounds/rain-sounds.mp3', 300, 0.5, true),
('Mountain Wind', 'nature', '/sounds/mountain-wind.mp3', 240, 0.4, true),
('Café Ambience', 'indoor', '/sounds/cafe-ambience.mp3', 300, 0.5, true),
('Restaurant Chatter', 'indoor', '/sounds/restaurant-chatter.mp3', 360, 0.4, true),
('Library Quiet', 'indoor', '/sounds/library-quiet.mp3', 240, 0.2, true),
('Shopping Mall', 'indoor', '/sounds/shopping-mall.mp3', 420, 0.3, true),
('Beach Waves', 'coastal', '/sounds/beach-waves.mp3', 480, 0.6, true),
('Seagulls Calling', 'coastal', '/sounds/seagulls-calling.mp3', 180, 0.5, true),
('Harbor Sounds', 'coastal', '/sounds/harbor-sounds.mp3', 300, 0.4, true),
('Cricket Symphony', 'night', '/sounds/cricket-symphony.mp3', 600, 0.5, true),
('City Night', 'night', '/sounds/city-night.mp3', 480, 0.3, true),
('Owl Hooting', 'night', '/sounds/owl-hooting.mp3', 120, 0.4, true);

-- Update popularity scores based on typical tourism data
UPDATE cities SET popularity_score = 100 WHERE name = 'Paris';
UPDATE cities SET popularity_score = 98 WHERE name = 'London';
UPDATE cities SET popularity_score = 96 WHERE name = 'Rome';
UPDATE cities SET popularity_score = 94 WHERE name = 'Tokyo';
UPDATE cities SET popularity_score = 93 WHERE name = 'Barcelona';
UPDATE cities SET popularity_score = 92 WHERE name IN ('Venice', 'Sydney');
UPDATE cities SET popularity_score = 91 WHERE name = 'Beijing';
UPDATE cities SET popularity_score = 90 WHERE name IN ('San Francisco', 'Rio de Janeiro');

-- Create some sample user data (for testing)
-- INSERT INTO user_favorites (user_id, city_id) VALUES
-- ('test-user-1', (SELECT id FROM cities WHERE name = 'Paris' LIMIT 1)),
-- ('test-user-1', (SELECT id FROM cities WHERE name = 'Tokyo' LIMIT 1)),
-- ('test-user-1', (SELECT id FROM cities WHERE name = 'New York' LIMIT 1));

COMMIT;
