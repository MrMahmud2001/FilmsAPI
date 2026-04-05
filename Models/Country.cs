using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FilmsAPI.Models;

[Table("Countries")]
public class Country
{
    [Key]
    public int CountryID { get; set; }

    [Required]
    [MaxLength(5)]
    public string CountryCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string CountryName { get; set; } = string.Empty;
}
