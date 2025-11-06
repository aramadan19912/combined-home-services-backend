using AutoMapper;

namespace HomeServicesApp;

public class HomeServicesAppApplicationAutoMapperProfile : Profile
{
    public HomeServicesAppApplicationAutoMapperProfile()
    {
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */

        // Invoice mappings
        CreateMap<Invoice, Invoices.InvoiceDto>();
        CreateMap<Invoices.CreateUpdateInvoiceDto, Invoice>();

        // ChatMessage mappings
        CreateMap<ChatMessage, ChatMessages.ChatMessageDto>();
        CreateMap<ChatMessages.CreateChatMessageDto, ChatMessage>();

        // ProviderLocation mappings
        CreateMap<ProviderLocation, ProviderLocations.ProviderLocationDto>();
        CreateMap<ProviderLocations.UpdateProviderLocationDto, ProviderLocation>();

        // ServiceCategory mappings
        CreateMap<ServiceCategory, ServiceCategories.ServiceCategoryDto>();
        CreateMap<ServiceCategories.CreateUpdateServiceCategoryDto, ServiceCategory>();

        // ServiceImage mappings
        CreateMap<ServiceImage, ServiceImages.ServiceImageDto>();
        CreateMap<ServiceImages.CreateUpdateServiceImageDto, ServiceImage>();
    }
}
