DROP DATABASE IF EXISTS FilmsDB;
CREATE DATABASE FilmsDB
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE FilmsDB;

CREATE TABLE Countries (
    CountryID   INT           AUTO_INCREMENT PRIMARY KEY,
    CountryCode VARCHAR(5)    NOT NULL UNIQUE,
    CountryName VARCHAR(100)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Countries (CountryCode, CountryName) VALUES
('usa', 'США'),
('ru',  'Россия'),
('uk',  'Великобритания'),
('fr',  'Франция'),
('kr',  'Южная Корея'),
('jp',  'Япония'),
('it',  'Италия');

CREATE TABLE Genres (
    GenreID   INT          AUTO_INCREMENT PRIMARY KEY,
    GenreName VARCHAR(50)  NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Genres (GenreName) VALUES
('Комедия'),
('Драма'),
('Хоррор'),
('Боевик'),
('Романтика'),
('Фантастика'),
('Аниме'),
('Криминал'),
('Биография'),
('Вестерн');

CREATE TABLE Films (
    FilmID          INT             AUTO_INCREMENT PRIMARY KEY,
    Title           VARCHAR(200)    NOT NULL,
    OriginalTitle   VARCHAR(200)    DEFAULT NULL,
    ReleaseYear     SMALLINT        NOT NULL,
    Rating          DECIMAL(3,1)    NOT NULL,
    DurationMinutes SMALLINT        NOT NULL,
    GenreID         INT             NOT NULL,
    CountryID       INT             NOT NULL,
    PosterPath      VARCHAR(300)    DEFAULT NULL,
    PageURL         VARCHAR(300)    DEFAULT NULL,
    Description     TEXT            DEFAULT NULL,
    IsActive        TINYINT(1)      NOT NULL DEFAULT 1,
    CreatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_year    CHECK (ReleaseYear BETWEEN 1900 AND 2030),
    CONSTRAINT chk_rating  CHECK (Rating BETWEEN 0.0 AND 10.0),
    CONSTRAINT chk_dur     CHECK (DurationMinutes > 0),
    FOREIGN KEY (GenreID)   REFERENCES Genres(GenreID),
    FOREIGN KEY (CountryID) REFERENCES Countries(CountryID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Films (Title, OriginalTitle, ReleaseYear, Rating, DurationMinutes, GenreID, CountryID, PosterPath, PageURL, Description)
VALUES
('Один дома', 'Home Alone', 1990, 7.9, 103,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Комедия'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'usa'),
    'img/one_home.jpg', 'film_One_Home.html',
    'Восьмилетний Кевин остаётся дома один и защищает дом от двух незадачливых воров.'),

('1+1', 'Intouchables', 2011, 8.5, 112,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Драма'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'fr'),
    'img/one_plus.jpg', '#',
    'Богатый аристократ-инвалид нанимает помощника из бедного квартала — история невероятной дружбы.'),

('Зелёный слоник', 'Zeleny Slonik', 1990, 6.2, 97,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Драма'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'ru'),
    'img/green.jpg', '#',
    'Два офицера советской армии оказываются в одной камере на гауптвахте.'),

('Мегамозг', 'Megamind', 2010, 7.3, 95,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Комедия'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'usa'),
    'img/mega.jpg', '#',
    'Суперзлодей случайно побеждает героя и не знает, чем теперь заняться.'),

('Охотник на оленей', 'The Deer Hunter', 1978, 8.1, 183,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Драма'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'usa'),
    'img/hanter.jpg', '#',
    'Трое друзей уходят на войну во Вьетнам — история о дружбе, потере и возвращении.'),

('Танцующий с волками', 'Dances with Wolves', 1990, 8.0, 181,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Драма'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'usa'),
    'img/dance.jpg', '#',
    'Офицер армии США живёт среди индейцев племени сиу и переосмысляет понятие родины.'),

('Москва слезам не верит', 'Moscow Does Not Believe in Tears', 1980, 8.2, 150,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Драма'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'ru'),
    'img/Moscow.jpg', '#',
    'История трёх провинциальных девушек, приехавших покорять Москву.'),

('Крёстный отец', 'The Godfather', 1972, 9.2, 175,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Криминал'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'usa'),
    'img/godfather.jpg', '#',
    'Эпос о клане мафиози Корлеоне: власть, семья, предательство.'),

('Оппенгеймер', 'Oppenheimer', 2023, 8.4, 180,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Биография'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'usa'),
    'img/Oppenheimer.jpg', '#',
    'Биография создателя ядерной бомбы — триумф науки и груз моральной ответственности.'),

('Форма голоса', 'A Silent Voice', 2016, 8.1, 130,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Аниме'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'jp'),
    'img/sing.jpg', '#',
    'Школьник, травивший глухонемую одноклассницу, ищет прощения спустя годы.'),

('Красота по-американски', 'American Beauty', 1999, 8.4, 122,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Драма'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'usa'),
    'img/Beauty.jpg', '#',
    'Кризис среднего возраста и поиск смысла жизни через глаза офисного клерка из пригорода.'),

('С собой не унесёшь', 'You Can\'t Take It with You', 1938, 8.2, 238,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Драма'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'usa'),
    'img/myself.jpg', '#',
    'Классика Фрэнка Капры: эксцентричная семья учит богатых ценить простые радости жизни.'),

('Тихое место', 'A Quiet Place', 2018, 7.1, 87,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Хоррор'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'uk'),
    'img/quiet_place.jpg', '#',
    'Семья выживает среди слепых монстров с острым слухом — ни единого звука.'),

('Начало', 'Inception', 2010, 8.8, 169,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Фантастика'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'uk'),
    'img/inception.jpg', '#',
    'Опытный вор похищает идеи из чужих снов. На этот раз задача — внедрить мысль.'),

('Ты первый', 'My First First Love', 2020, 7.4, 89,
    (SELECT GenreID FROM Genres WHERE GenreName = 'Романтика'),
    (SELECT CountryID FROM Countries WHERE CountryCode = 'kr'),
    'img/first_love.jpg', '#',
    'Молодые люди съезжаются и открывают новый смысл слов «дом» и «любовь».');

CREATE OR REPLACE VIEW vw_FilmsFull AS
SELECT
    f.FilmID,
    f.Title,
    f.OriginalTitle,
    f.ReleaseYear,
    f.Rating,
    f.DurationMinutes,
    g.GenreName,
    c.CountryCode,
    c.CountryName,
    f.PosterPath,
    f.PageURL,
    f.Description,
    CASE
        WHEN f.DurationMinutes < 90               THEN 'short'
        WHEN f.DurationMinutes BETWEEN 90 AND 120 THEN 'medium'
        ELSE                                           'long'
    END AS DurationCategory
FROM Films      f
JOIN Genres     g ON g.GenreID   = f.GenreID
JOIN Countries  c ON c.CountryID = f.CountryID
WHERE f.IsActive = 1;

DROP PROCEDURE IF EXISTS sp_GetFilms;

DELIMITER $$

CREATE PROCEDURE sp_GetFilms(
    IN p_Genre        VARCHAR(50),
    IN p_YearFrom     SMALLINT,
    IN p_YearTo       SMALLINT,
    IN p_MinRating    DECIMAL(3,1),
    IN p_CountryCode  VARCHAR(5),
    IN p_DurationCat  VARCHAR(10),
    IN p_SearchQuery  VARCHAR(200),
    IN p_SortBy       VARCHAR(20),
    IN p_PageNumber   INT,
    IN p_PageSize     INT
)
BEGIN
    SET p_MinRating  = IFNULL(p_MinRating, 0);
    SET p_SortBy     = IFNULL(p_SortBy, 'rating_desc');
    SET p_PageNumber = IFNULL(p_PageNumber, 1);
    SET p_PageSize   = IFNULL(p_PageSize, 8);

    SET @offset = (p_PageNumber - 1) * p_PageSize;
    SET @lim    = p_PageSize;

    SET @sql = CONCAT(
        'SELECT FilmID, Title, OriginalTitle, ReleaseYear, Rating, ',
        '       DurationMinutes, GenreName, CountryCode, CountryName, ',
        '       PosterPath, PageURL, Description, DurationCategory ',
        'FROM vw_FilmsFull ',
        'WHERE Rating >= ', p_MinRating,
        IF(p_Genre       IS NOT NULL, CONCAT(' AND GenreName = ''',       REPLACE(p_Genre,       '''', ''''''), ''''), ''),
        IF(p_CountryCode IS NOT NULL, CONCAT(' AND CountryCode = ''',     REPLACE(p_CountryCode, '''', ''''''), ''''), ''),
        IF(p_DurationCat IS NOT NULL, CONCAT(' AND DurationCategory = ''',REPLACE(p_DurationCat, '''', ''''''), ''''), ''),
        IF(p_YearFrom    IS NOT NULL, CONCAT(' AND ReleaseYear >= ', p_YearFrom), ''),
        IF(p_YearTo      IS NOT NULL, CONCAT(' AND ReleaseYear <= ', p_YearTo),   ''),
        IF(p_SearchQuery IS NOT NULL,
            CONCAT(' AND (Title LIKE ''%', REPLACE(p_SearchQuery, '''', ''''''),
                   '%'' OR OriginalTitle LIKE ''%', REPLACE(p_SearchQuery, '''', ''''''), '%'')'), ''),
        ' ORDER BY ',
        CASE p_SortBy
            WHEN 'year_desc'  THEN 'ReleaseYear DESC'
            WHEN 'year_asc'   THEN 'ReleaseYear ASC'
            WHEN 'title_asc'  THEN 'Title ASC'
            ELSE                   'Rating DESC'
        END,
        ', FilmID ASC',
        ' LIMIT ', @lim, ' OFFSET ', @offset
    );

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_SearchSuggest$$

CREATE PROCEDURE sp_SearchSuggest(
    IN p_Query VARCHAR(200)
)
BEGIN
    SELECT
        FilmID  AS id,
        Title   AS title
    FROM vw_FilmsFull
    WHERE Title LIKE CONCAT('%', p_Query, '%')
       OR OriginalTitle LIKE CONCAT('%', p_Query, '%')
    ORDER BY Rating DESC
    LIMIT 10;
END$$

DELIMITER ;