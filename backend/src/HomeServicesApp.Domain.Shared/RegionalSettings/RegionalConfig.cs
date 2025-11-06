using System.Collections.Generic;

namespace HomeServicesApp.RegionalSettings
{
    /// <summary>
    /// Regional configuration for countries
    /// Contains tax rates, currency, and locale information
    /// </summary>
    public class RegionalConfig
    {
        public Country Country { get; set; }
        public Currency Currency { get; set; }
        public decimal TaxRate { get; set; }
        public string CountryCode { get; set; }
        public string CurrencySymbol { get; set; }
        public string DefaultLocale { get; set; }
        public List<string> SupportedLocales { get; set; }

        /// <summary>
        /// Get regional configuration for a specific country
        /// </summary>
        public static RegionalConfig GetConfig(Country country)
        {
            return country switch
            {
                Country.SaudiArabia => new RegionalConfig
                {
                    Country = Country.SaudiArabia,
                    Currency = Currency.SAR,
                    TaxRate = 0.15m, // 15% VAT
                    CountryCode = "SA",
                    CurrencySymbol = "ر.س",
                    DefaultLocale = "ar-SA",
                    SupportedLocales = new List<string> { "ar-SA", "en-US" }
                },
                Country.Egypt => new RegionalConfig
                {
                    Country = Country.Egypt,
                    Currency = Currency.EGP,
                    TaxRate = 0.14m, // 14% VAT
                    CountryCode = "EG",
                    CurrencySymbol = "ج.م",
                    DefaultLocale = "ar-EG",
                    SupportedLocales = new List<string> { "ar-EG", "en-US", "fr-FR" }
                },
                Country.UAE => new RegionalConfig
                {
                    Country = Country.UAE,
                    Currency = Currency.USD,
                    TaxRate = 0.05m, // 5% VAT
                    CountryCode = "AE",
                    CurrencySymbol = "د.إ",
                    DefaultLocale = "ar-AE",
                    SupportedLocales = new List<string> { "ar-AE", "en-US" }
                },
                _ => new RegionalConfig
                {
                    Country = Country.SaudiArabia,
                    Currency = Currency.SAR,
                    TaxRate = 0.15m,
                    CountryCode = "SA",
                    CurrencySymbol = "ر.س",
                    DefaultLocale = "ar-SA",
                    SupportedLocales = new List<string> { "ar-SA", "en-US" }
                }
            };
        }

        /// <summary>
        /// Get regional configuration by country code
        /// </summary>
        public static RegionalConfig GetConfigByCode(string countryCode)
        {
            var country = countryCode?.ToUpper() switch
            {
                "SA" => Country.SaudiArabia,
                "EG" => Country.Egypt,
                "AE" => Country.UAE,
                "KW" => Country.Kuwait,
                _ => Country.SaudiArabia
            };

            return GetConfig(country);
        }
    }
}
