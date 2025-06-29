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

// 🔹 CORS (tomado desde el .env con claves AllowedOrigins__0, __1, etc.)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                             ?? new[] {"https://app-fullstack-frontend.azurewebsites.net", "http://localhost:3000", "http://localhost:5173" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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
app.UseCors("AllowFrontend");
app.UseAuthorization();


// 🔹 Asegurar la creación de base de datos
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
}

// 🔹 Endpoints de la API
app.MapGet("/api/tasks", async (AppDbContext db) =>
{
    try
    {
        var tasks = await db.Tasks.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Results.Ok(tasks);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error retrieving tasks: {ex.Message}");
    }
});

app.MapGet("/api/tasks/stats", async (AppDbContext db) =>
{
    try
    {
        var total = await db.Tasks.CountAsync();
        var completed = await db.Tasks.CountAsync(t => t.IsCompleted);
        var pending = total - completed;
        return Results.Ok(new { total, completed, pending });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error retrieving stats: {ex.Message}");
    }
});

app.MapGet("/api/tasks/{id}", async (int id, AppDbContext db) =>
{
    try
    {
        var task = await db.Tasks.FindAsync(id);
        return task is not null ? Results.Ok(task) : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error retrieving task: {ex.Message}");
    }
});

app.MapPost("/api/tasks", async (TaskItem task, AppDbContext db) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(task.Title))
            return Results.BadRequest("Title is required");

        task.CreatedAt = DateTime.UtcNow;
        task.IsCompleted = false;
        db.Tasks.Add(task);
        await db.SaveChangesAsync();
        return Results.Created($"/api/tasks/{task.Id}", task);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error creating task: {ex.Message}");
    }
});

app.MapPut("/api/tasks/{id}", async (int id, TaskItem inputTask, AppDbContext db) =>
{
    try
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
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error updating task: {ex.Message}");
    }
});

app.MapDelete("/api/tasks/{id}", async (int id, AppDbContext db) =>
{
    try
    {
        var task = await db.Tasks.FindAsync(id);
        if (task is null) return Results.NotFound();

        db.Tasks.Remove(task);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    catch (Exception ex)
    {
        return Results.Problem($"Error deleting task: {ex.Message}");
    }
});

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}));

app.MapControllers();
app.Run();
