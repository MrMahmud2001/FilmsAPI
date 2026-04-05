using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FilmsAPI.Data;
using FilmsAPI.Models;

namespace FilmsAPI.Controllers;

[ApiController]
[Route("api/films")]
public class FilmsController : ControllerBase
{
    private readonly FilmsContext _db;

    public FilmsController(FilmsContext db)
    {
        _db = db;
    }

    // GET /api/films
    // Параметры: genre, yearFrom, yearTo, minRating, countryCode,
    //            durationCat, search, sortBy, page, pageSize
    [HttpGet]
    public async Task<IActionResult> GetFilms(
        [FromQuery] string? genre,
        [FromQuery] int? yearFrom,
        [FromQuery] int? yearTo,
        [FromQuery] decimal? minRating,
        [FromQuery] string? countryCode,
        [FromQuery] string? durationCat,
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 8)
    {
        var query = _db.FilmsFull.AsQueryable();

        if (!string.IsNullOrWhiteSpace(genre))
            query = query.Where(f => f.GenreName == genre);

        if (yearFrom.HasValue)
            query = query.Where(f => f.ReleaseYear >= yearFrom.Value);

        if (yearTo.HasValue)
            query = query.Where(f => f.ReleaseYear <= yearTo.Value);

        if (minRating.HasValue && minRating.Value > 0)
            query = query.Where(f => f.Rating >= minRating.Value);

        if (!string.IsNullOrWhiteSpace(countryCode))
            query = query.Where(f => f.CountryCode == countryCode);

        if (!string.IsNullOrWhiteSpace(durationCat))
            query = query.Where(f => f.DurationCategory == durationCat);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(f =>
                f.Title.Contains(search) ||
                (f.OriginalTitle != null && f.OriginalTitle.Contains(search)));

        query = sortBy switch
        {
            "year_desc"  => query.OrderByDescending(f => f.ReleaseYear),
            "year_asc"   => query.OrderBy(f => f.ReleaseYear),
            "title_asc"  => query.OrderBy(f => f.Title),
            _            => query.OrderByDescending(f => f.Rating)
        };

        var total = await query.CountAsync();
        var films = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, films });
    }

    // GET /api/films/suggest?q=текст
    // Автодополнение строки поиска
    [HttpGet("suggest")]
    public async Task<IActionResult> Suggest([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { suggestions = Array.Empty<object>() });

        var results = await _db.FilmsFull
            .Where(f => f.Title.Contains(q) ||
                        (f.OriginalTitle != null && f.OriginalTitle.Contains(q)))
            .OrderByDescending(f => f.Rating)
            .Take(10)
            .Select(f => new { id = f.FilmID, title = f.Title })
            .ToListAsync();

        return Ok(new { suggestions = results });
    }

    // GET /api/films/genres
    // Список всех жанров для фильтра
    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
    {
        var genres = await _db.Genres
            .OrderBy(g => g.GenreName)
            .Select(g => g.GenreName)
            .ToListAsync();

        return Ok(genres);
    }

    // GET /api/films/countries
    // Список всех стран для фильтра
    [HttpGet("countries")]
    public async Task<IActionResult> GetCountries()
    {
        var countries = await _db.Countries
            .OrderBy(c => c.CountryName)
            .Select(c => new { c.CountryCode, c.CountryName })
            .ToListAsync();

        return Ok(countries);
    }

    // POST /api/films/favorites
    // Добавить фильм в избранное
    [HttpPost("favorites")]
    public IActionResult AddToFavorites([FromBody] FavoriteRequest req)
    {
        if (req == null || string.IsNullOrWhiteSpace(req.FilmTitle))
            return BadRequest(new { success = false, message = "Неверные данные" });

        return Ok(new { success = true, message = $"Фильм «{req.FilmTitle}» добавлен в избранное" });
    }
}
