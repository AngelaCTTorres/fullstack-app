using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Cargar archivo .env
Env.Load();

// 🔹 Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 Controladores
builder.Services.AddControllers();

// 🔹 CORS — solo dominios confiables
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://app-fullstack-frontend.azurewebsites.net", // 👈 Tu frontend en producción
            "http://localhost:5173",                             // Para desarrollo (Vite)
            "http://localhost:3000"                              // Para desarrollo (CRA)
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
        // .AllowCredentials(); // 🔐 Solo si manejas sesiones/cookies cruzadas
    });
});

// 🔹 Entity Framework con cadena desde .env
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// 🔹 Middleware y pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend"); // 👈 Aplica CORS antes de las rutas
app.UseAuthorization();

// 🔹 Asegurar la creación de la base de datos
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
}

// 🔹 Endpoints de la API
app.MapGet("/api/tasks", async (AppDbContext db) =>
{
    var tasks = await db.Tasks.OrderByDescending(t => t.CreatedAt).ToListAsync();
    return Results.Ok(tasks);
});

app.MapGet("/api/tasks/stats", async (AppDbContext db) =>
{
    var total = await db.Tasks.CountAsync();
    var completed = await db.Tasks.CountAsync(t => t.IsCompleted);
    var pending = total - completed;
    return Results.Ok(new { total, completed, pending });
});

app.MapGet("/api/tasks/{id}", async (int id, AppDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    return task is not null ? Results.Ok(task) : Results.NotFound();
});

app.MapPost("/api/tasks", async (TaskItem task, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(task.Title))
        return Results.BadRequest("Title is required");

    task.CreatedAt = DateTime.UtcNow;
    task.IsCompleted = false;
    db.Tasks.Add(task);
    await db.SaveChangesAsync();
    return Results.Created($"/api/tasks/{task.Id}", task);
});

app.MapPut("/api/tasks/{id}", async (int id, TaskItem inputTask, AppDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();

    if (string.IsNullOrWhiteSpace(inputTask.Title))
        return Results.BadRequest("Title is required");

    task.Title = inputTask.Title;
    task.Description = inputTask.Description;
    task.IsCompleted = inputTask.IsCompleted;

    await db.SaveChangesAsync();
    return Results.Ok(task);
});

app.MapDelete("/api/tasks/{id}", async (int id, AppDbContext db) =>
{
    var task = await db.Tasks.FindAsync(id);
    if (task is null) return Results.NotFound();

    db.Tasks.Remove(task);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}));

app.MapControllers();
app.Run();
