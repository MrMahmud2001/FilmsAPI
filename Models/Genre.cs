using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FilmsAPI.Models;

[Table("Genres")]
public class Genre
{
    [Key]
    public int GenreID { get; set; }

    [Required]
    [MaxLength(50)]
    public string GenreName { get; set; } = string.Empty;
}
