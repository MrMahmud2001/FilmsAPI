namespace FilmsAPI.Models;

// Валидация только в FilmFormController — атрибуты здесь давали 400 ProblemDetails до экшена (например при durationMinutes=0).
public class AddFilmRequest
{
    public string Title { get; set; } = string.Empty;
    public string? OriginalTitle { get; set; }
    public string Genre { get; set; } = string.Empty;
    public int ReleaseYear { get; set; }
    public string CountryCode { get; set; } = string.Empty;
    public string Director { get; set; } = string.Empty;
    public decimal? Rating { get; set; }
    public int? DurationMinutes { get; set; }
    public string Description { get; set; } = string.Empty;
}
