using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FilmsAPI.Models;

[Table("Films")]
public class Film
{
    [Key]
    public int FilmID { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? OriginalTitle { get; set; }

    public short ReleaseYear { get; set; }

    [Column(TypeName = "decimal(3,1)")]
    public decimal Rating { get; set; }

    public short DurationMinutes { get; set; }

    public int GenreID { get; set; }

    public int CountryID { get; set; }

    [MaxLength(300)]
    public string? PosterPath { get; set; }

    [MaxLength(300)]
    public string? PageURL { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [ForeignKey("GenreID")]
    public Genre? Genre { get; set; }

    [ForeignKey("CountryID")]
    public Country? Country { get; set; }
}
