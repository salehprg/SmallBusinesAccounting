using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using New_Back.Authorization;
using New_Back.Data;
using New_Back.DataAccess;
using New_Back.Middlewares;
using New_Back.Models.Enums;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddCors(o => o.AddPolicy(
    "AllowOrigin", builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    }
));

var databaseURL = builder.Configuration.GetConnectionString("ConStr");

builder.Services.AddDbContext<DatabaseContext>(options => options.UseNpgsql(databaseURL));

var token = builder.Configuration["JWT:Token"];
var ValidAudience = builder.Configuration["JWT:ValidAudience"];
var ValidIssuer = builder.Configuration["JWT:ValidIssuer"];
var key = Encoding.UTF8.GetBytes(token);

// Create security key with fixed ID
var securityKey = new SymmetricSecurityKey(key)
{
    KeyId = "fixed-key-id"
};

builder.Services.AddAuthentication(x =>
    {
        x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(x =>
    {
        x.RequireHttpsMetadata = false;
        x.SaveToken = true;
        x.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = securityKey,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidAudience = ValidAudience,
            ValidIssuer = ValidIssuer
        };

        x.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                Console.WriteLine("Token validated successfully");
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

// Add authorization policies for permissions
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddAuthorization(options =>
{
    // Get all permission values from the PermissionType enum
    var permissionNames = Enum.GetValues(typeof(PermissionType))
        .Cast<PermissionType>()
        .Select(p => p.ToString())
        .ToList();
    
    // Register a policy for each permission
    foreach (var permission in permissionNames)
    {
        options.AddPolicy($"Permission:{permission}", policy =>
            policy.Requirements.Add(new PermissionRequirement(permission)));
    }
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Small Business Accounting API", Version = "v1" });
    c.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Description = "Please enter into field the word 'Bearer' following by space and JWT",
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey
        });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement{
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type=ReferenceType.SecurityScheme,
                            Id="Bearer"
                        }
                    },
                    new string[]{}
                }
    });
});


builder.Services.AddControllers();

builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Register Application Services
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Register Business Services
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IPersonService, PersonService>();
builder.Services.AddScoped<ICostTypeService, CostTypeService>();
builder.Services.AddScoped<IReportService, ReportService>();

// Register Auth Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();


builder.Services.AddSignalR();

var app = builder.Build();

// Seed database with default data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
    db.Database.Migrate();
    
    // Seed default data
    await SeedData.SeedDefaultData(app.Services);

    var transactionService = scope.ServiceProvider.GetRequiredService<ITransactionService>();
    await transactionService.FixTransactionDateTime();
}

app.UseMiddleware<ErrorHandlerMiddleware>();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
});

app.UseCors("AllowOrigin");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseRouting();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Small Business Accounting API v1");
});

app.MapControllers();

app.Run();