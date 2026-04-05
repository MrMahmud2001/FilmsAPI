using System.Globalization;
using FilmsAPI.Data;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Railway задаёт PORT; Kestrel должен слушать 0.0.0.0
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Строка из плагина MySQL (MYSQLHOST, MYSQLUSER, …) перекрывает appsettings
var railwayMysql = BuildRailwayMysqlConnectionString();
if (railwayMysql != null)
    builder.Configuration["ConnectionStrings:FilmsDB"] = railwayMysql;

var filmsConnectionString = builder.Configuration.GetConnectionString("FilmsDB");
if (string.IsNullOrWhiteSpace(filmsConnectionString))
    throw new InvalidOperationException(
        "Не задана строка подключения FilmsDB. Локально — appsettings.json; на Railway — подключите MySQL к сервису или задайте ConnectionStrings__FilmsDB.");

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddDbContext<FilmsContext>(options =>
    options.UseMySql(
        filmsConnectionString,
        ServerVersion.AutoDetect(filmsConnectionString)
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

app.UseForwardedHeaders();

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
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

// Переменные MYSQL* задаёт Railway при подключении плагина MySQL к сервису.
static string? BuildRailwayMysqlConnectionString()
{
    var host = Environment.GetEnvironmentVariable("MYSQLHOST");
    if (string.IsNullOrEmpty(host))
        return null;

    var user = Environment.GetEnvironmentVariable("MYSQLUSER") ?? "root";
    var password = Environment.GetEnvironmentVariable("MYSQLPASSWORD") ?? "";
    var database = Environment.GetEnvironmentVariable("MYSQLDATABASE") ?? "railway";
    var prt = Environment.GetEnvironmentVariable("MYSQLPORT") ?? "3306";

    // На Railway к публичному MySQL обычно нужен TLS
    var ssl = Environment.GetEnvironmentVariable("MYSQL_SSL") == "0"
        ? "SslMode=None;"
        : "SslMode=Required;TrustServerCertificate=True;";

    return $"Server={host};Port={prt};Database={database};User={user};Password={password};{ssl}";
}
