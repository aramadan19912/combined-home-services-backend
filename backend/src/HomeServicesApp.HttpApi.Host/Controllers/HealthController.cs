using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace HomeServicesApp.Controllers;

[ApiController]
[AllowAnonymous]
[Route("health")]
public class HealthController : AbpControllerBase
{
    [HttpGet]
    public IActionResult GetHealth()
    {
        return Ok(new { status = "Healthy" });
    }
}
