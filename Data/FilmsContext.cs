using Microsoft.EntityFrameworkCore;
using FilmsAPI.Models;

namespace FilmsAPI.Data;

public class FilmsContext : DbContext
{
    public FilmsContext(DbContextOptions<FilmsContext> options) : base(options) { }

    public DbSet<Film> Films { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<Country> Countries { get; set; }
    public DbSet<FilmView> FilmsFull { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FilmView>()
            .ToView("vw_FilmsFull")
            .HasKey(f => f.FilmID);
    }
}
