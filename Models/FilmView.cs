namespace FilmsAPI.Models;

public class FilmView
{
    public int FilmID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? OriginalTitle { get; set; }
    public short ReleaseYear { get; set; }
    public decimal Rating { get; set; }
    public short DurationMinutes { get; set; }
    public string GenreName { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public string CountryName { get; set; } = string.Empty;
    public string? PosterPath { get; set; }
    public string? PageURL { get; set; }
    public string? Description { get; set; }
    public string DurationCategory { get; set; } = string.Empty;
}
