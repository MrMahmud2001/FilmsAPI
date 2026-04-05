using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FilmsAPI.Data;
using FilmsAPI.Models;
using System.Text.RegularExpressions;

namespace FilmsAPI.Controllers;

[ApiController]
[Route("api/films")]
public class FilmFormController : ControllerBase
{
    private readonly FilmsContext _db;
    private readonly IWebHostEnvironment _env;

    // Допустимые жанры — те же, что в БД
    private static readonly HashSet<string> AllowedGenres = new(StringComparer.OrdinalIgnoreCase)
    {
        "Комедия", "Драма", "Хоррор", "Боевик", "Романтика",
        "Фантастика", "Аниме", "Криминал", "Биография", "Вестерн"
    };

    // Допустимые коды стран — те же, что в таблице Countries
    private static readonly HashSet<string> AllowedCountryCodes = new(StringComparer.OrdinalIgnoreCase)
    {
        "usa", "ru", "uk", "fr", "kr", "jp", "it"
    };

    private static readonly string[] AllowedImageTypes = { "image/jpeg", "image/jpg", "image/png" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public FilmFormController(FilmsContext db, IWebHostEnvironment env)
    {
        _db  = db;
        _env = env;
    }

    // POST /api/films/add
    // Принимает multipart/form-data (поля + файл постера)
    [HttpPost("add")]
    public async Task<IActionResult> AddFilm([FromForm] AddFilmRequest request, IFormFile? poster)
    {
        var errors = new Dictionary<string, string>();

        // ── СЕРВЕРНАЯ ВАЛИДАЦИЯ ─────────────────────────────────────────

        // 1. Название
        if (string.IsNullOrWhiteSpace(request.Title))
            errors["movieTitle"] = "Название обязательно для заполнения";
        else if (request.Title.Trim().Length < 2 || request.Title.Trim().Length > 200)
            errors["movieTitle"] = "Название должно содержать от 2 до 200 символов";

        // 2. Оригинальное название (необязательное)
        if (!string.IsNullOrWhiteSpace(request.OriginalTitle) && request.OriginalTitle.Length > 200)
            errors["movieOriginalTitle"] = "Оригинальное название не должно превышать 200 символов";

        // 3. Жанр — проверка каждого жанра по белому списку из БД
        if (string.IsNullOrWhiteSpace(request.Genre))
        {
            errors["movieGenre"] = "Жанр обязателен для заполнения";
        }
        else
        {
            var genreNames = request.Genre.Split(',').Select(g => g.Trim()).Where(g => g.Length > 0).ToList();
            if (genreNames.Count == 0)
            {
                errors["movieGenre"] = "Укажите хотя бы один жанр";
            }
            else
            {
                var invalidGenres = genreNames.Where(g => !AllowedGenres.Contains(g)).ToList();
                if (invalidGenres.Any())
                    errors["movieGenre"] = $"Недопустимые жанры: {string.Join(", ", invalidGenres)}";
            }
        }

        // 4. Год
        if (request.ReleaseYear < 1900 || request.ReleaseYear > 2099)
            errors["movieYear"] = "Год должен быть в диапазоне 1900–2099";

        // 5. Страна — проверяем код по БД (серверная проверка, клиент не может этого гарантировать)
        if (string.IsNullOrWhiteSpace(request.CountryCode))
        {
            errors["movieCountry"] = "Выберите страну производства";
        }
        else if (!AllowedCountryCodes.Contains(request.CountryCode))
        {
            errors["movieCountry"] = "Выбрана недопустимая страна";
        }
        else
        {
            // Дополнительно проверяем наличие страны в БД
            var countryExists = await _db.Countries
                .AnyAsync(c => c.CountryCode == request.CountryCode.ToLower());
            if (!countryExists)
                errors["movieCountry"] = "Указанная страна не найдена в базе данных";
        }

        // 6. Режиссёр — проверка только серверная: whitelist символов + дубликатов нет смысла
        if (string.IsNullOrWhiteSpace(request.Director))
        {
            errors["movieDirector"] = "Имя режиссёра обязательно";
        }
        else if (!Regex.IsMatch(request.Director.Trim(), @"^[a-zA-Zа-яА-ЯёЁ\s\-\.]+$"))
        {
            errors["movieDirector"] = "Имя режиссёра содержит недопустимые символы";
        }

        // 7. Рейтинг (необязательный)
        if (request.Rating.HasValue && (request.Rating < 0 || request.Rating > 10))
            errors["movieRating"] = "Рейтинг должен быть от 0.0 до 10.0";

        // 8. Длительность — в БД действует chk_dur (нельзя 0); поле обязательно
        if (!request.DurationMinutes.HasValue || request.DurationMinutes <= 0 || request.DurationMinutes > 900)
            errors["movieDuration"] = "Укажите длительность от 1 до 900 минут";

        // 9. Описание
        if (string.IsNullOrWhiteSpace(request.Description))
            errors["movieDescription"] = "Описание обязательно для заполнения";
        else if (request.Description.Trim().Length < 20)
            errors["movieDescription"] = $"Описание слишком короткое ({request.Description.Trim().Length}/20 символов минимум)";
        else if (request.Description.Trim().Length > 1000)
            errors["movieDescription"] = "Описание не должно превышать 1000 символов";

        // 10. Постер — тип и размер файла проверяются ТОЛЬКО на сервере
        string? posterPath = null;
        if (poster == null || poster.Length == 0)
        {
            errors["moviePosterFile"] = "Загрузите постер фильма";
        }
        else
        {
            if (!AllowedImageTypes.Contains(poster.ContentType.ToLower()))
                errors["moviePosterFile"] = "Допустимые форматы изображения: JPG, PNG";
            else if (poster.Length > MaxFileSize)
                errors["moviePosterFile"] = $"Файл слишком большой ({poster.Length / 1024 / 1024.0:F1} МБ). Максимум 5 МБ";
            else
            {
                // Сохраняем файл в wwwroot/img/posters/
                var uploadsDir = Path.Combine(_env.WebRootPath, "img", "posters");
                Directory.CreateDirectory(uploadsDir);

                var ext      = Path.GetExtension(poster.FileName).ToLowerInvariant();
                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using var stream = System.IO.File.Create(filePath);
                await poster.CopyToAsync(stream);

                posterPath = $"img/posters/{fileName}";
            }
        }

        // 11. Проверка дубликата по названию + году (только сервер может проверить БД)
        if (!errors.ContainsKey("movieTitle") && !errors.ContainsKey("movieYear"))
        {
            var duplicate = await _db.Films.AnyAsync(f =>
                f.Title == request.Title.Trim() && f.ReleaseYear == request.ReleaseYear);
            if (duplicate)
                errors["movieTitle"] = $"Фильм «{request.Title.Trim()}» ({request.ReleaseYear}) уже существует в базе";
        }

        // ── ЕСЛИ ЕСТЬ ОШИБКИ — возвращаем без записи в БД ────────────
        if (errors.Any())
        {
            // Удаляем уже сохранённый постер, если запись не прошла
            if (posterPath != null)
            {
                var fullPath = Path.Combine(_env.WebRootPath, posterPath);
                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);
            }

            return BadRequest(new
            {
                success = false,
                message = "Форма содержит ошибки. Исправьте их и попробуйте снова.",
                errors
            });
        }

        // ── ЗАПИСЬ В БД ───────────────────────────────────────────────

        // Берём GenreID первого жанра из списка
        var firstGenreName = request.Genre.Split(',').First().Trim();
        var genre = await _db.Genres.FirstOrDefaultAsync(g => g.GenreName == firstGenreName);
        if (genre == null)
            return BadRequest(new { success = false, message = "Жанр не найден в базе данных" });

        var country = await _db.Countries
            .FirstOrDefaultAsync(c => c.CountryCode == request.CountryCode.ToLower());
        if (country == null)
            return BadRequest(new { success = false, message = "Страна не найдена в базе данных" });

        var film = new Film
        {
            Title           = request.Title.Trim(),
            OriginalTitle   = string.IsNullOrWhiteSpace(request.OriginalTitle) ? null : request.OriginalTitle.Trim(),
            ReleaseYear     = (short)request.ReleaseYear,
            Rating          = request.Rating ?? 0,
            DurationMinutes = (short)(request.DurationMinutes ?? 0),
            GenreID         = genre.GenreID,
            CountryID       = country.CountryID,
            PosterPath      = posterPath,
            PageURL         = "#",
            Description     = request.Description.Trim(),
            IsActive        = true,
            CreatedAt       = DateTime.Now
        };

        _db.Films.Add(film);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            if (posterPath != null)
            {
                var savedPoster = Path.Combine(_env.WebRootPath, posterPath);
                if (System.IO.File.Exists(savedPoster))
                    System.IO.File.Delete(savedPoster);
            }

            var baseMsg = ex.GetBaseException().Message;
            if (baseMsg.Contains("Duplicate", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new
                {
                    success = false,
                    message = "Фильм с таким названием и годом уже есть в базе (или сработало другое уникальное ограничение).",
                    errors = new Dictionary<string, string>
                    {
                        ["movieTitle"] = "Измените название или год выпуска."
                    }
                });
            }

            if (baseMsg.Contains("chk_dur", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Длительность должна быть от 1 до 900 минут.",
                    errors = new Dictionary<string, string> { ["movieDuration"] = "Недопустимое значение." }
                });
            }

            return StatusCode(500, new
            {
                success = false,
                message = "Ошибка базы данных при сохранении. Убедитесь, что MySQL запущен и схема БД совпадает с проектом."
            });
        }

        return Ok(new
        {
            success = true,
            message = $"Фильм «{film.Title}» успешно добавлен!",
            filmId  = film.FilmID
        });
    }
}
