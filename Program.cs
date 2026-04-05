using System.Globalization;
using FilmsAPI.Data;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<FilmsContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("FilmsDB"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("FilmsDB"))
    )
);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Encoder =
            System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
    });

var app = builder.Build();

// Дробные числа в multipart/form-data (рейтинг 5.6) — с ru-RU модель не парсится; для API нужна инвариантная культура.
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture(CultureInfo.InvariantCulture),
    SupportedCultures     = new List<CultureInfo> { CultureInfo.InvariantCulture },
    SupportedUICultures   = new List<CultureInfo> { CultureInfo.InvariantCulture }
});

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();

app.Run();