namespace FilmsAPI.Models;

public class FavoriteRequest
{
    public int FilmId { get; set; }
    public string FilmTitle { get; set; } = string.Empty;
}
