-- Initial database schema for Home Services Platform
-- Converted from Entity Framework migrations for PostgreSQL compatibility

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Identity users)
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserName" VARCHAR(256) NOT NULL,
    "NormalizedUserName" VARCHAR(256),
    "Email" VARCHAR(256),
    "NormalizedEmail" VARCHAR(256),
    "EmailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "PasswordHash" TEXT,
    "SecurityStamp" TEXT,
    "ConcurrencyStamp" TEXT,
    "PhoneNumber" TEXT,
    "PhoneNumberConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "TwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "LockoutEnd" TIMESTAMP WITH TIME ZONE,
    "LockoutEnabled" BOOLEAN NOT NULL DEFAULT false,
    "AccessFailedCount" INTEGER NOT NULL DEFAULT 0,
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "LastModificationTime" TIMESTAMP WITH TIME ZONE,
    "LastModifierId" UUID,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "DeleterId" UUID,
    "DeletionTime" TIMESTAMP WITH TIME ZONE,
    "TenantId" UUID,
    "FirstName" VARCHAR(100),
    "LastName" VARCHAR(100),
    "ProfilePictureUrl" TEXT
);

-- Service Categories
CREATE TABLE IF NOT EXISTS "ServiceCategories" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "Name" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "IconUrl" TEXT,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "LastModificationTime" TIMESTAMP WITH TIME ZONE,
    "LastModifierId" UUID,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "DeleterId" UUID,
    "DeletionTime" TIMESTAMP WITH TIME ZONE,
    "TenantId" UUID
);

-- Service Providers
CREATE TABLE IF NOT EXISTS "ServiceProviders" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserId" UUID NOT NULL,
    "CompanyName" VARCHAR(200),
    "Description" TEXT,
    "Website" VARCHAR(500),
    "PhoneNumber" VARCHAR(20),
    "Address" TEXT,
    "City" VARCHAR(100),
    "State" VARCHAR(100),
    "ZipCode" VARCHAR(20),
    "Country" VARCHAR(100),
    "IsVerified" BOOLEAN NOT NULL DEFAULT false,
    "Rating" DECIMAL(3,2) DEFAULT 0,
    "TotalReviews" INTEGER DEFAULT 0,
    "BusinessLicenseNumber" VARCHAR(100),
    "InsuranceProvider" VARCHAR(200),
    "YearsOfExperience" INTEGER,
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "LastModificationTime" TIMESTAMP WITH TIME ZONE,
    "LastModifierId" UUID,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "DeleterId" UUID,
    "DeletionTime" TIMESTAMP WITH TIME ZONE,
    "TenantId" UUID,
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

-- Services
CREATE TABLE IF NOT EXISTS "Services" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "Name" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "CategoryId" UUID NOT NULL,
    "ProviderId" UUID NOT NULL,
    "BasePrice" DECIMAL(10,2) NOT NULL,
    "PriceType" INTEGER NOT NULL DEFAULT 0, -- 0: Fixed, 1: Hourly, 2: Quote
    "Duration" INTEGER, -- in minutes
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "ServiceArea" TEXT,
    "Requirements" TEXT,
    "Tags" TEXT,
    "ImageUrls" TEXT,
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "LastModificationTime" TIMESTAMP WITH TIME ZONE,
    "LastModifierId" UUID,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "DeleterId" UUID,
    "DeletionTime" TIMESTAMP WITH TIME ZONE,
    "TenantId" UUID,
    FOREIGN KEY ("CategoryId") REFERENCES "ServiceCategories"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("ProviderId") REFERENCES "ServiceProviders"("Id") ON DELETE CASCADE
);

-- Service Bookings/Orders
CREATE TABLE IF NOT EXISTS "ServiceBookings" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ServiceId" UUID NOT NULL,
    "CustomerId" UUID NOT NULL,
    "ProviderId" UUID NOT NULL,
    "BookingDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ScheduledDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "Status" INTEGER NOT NULL DEFAULT 0, -- 0: Pending, 1: Confirmed, 2: InProgress, 3: Completed, 4: Cancelled
    "TotalAmount" DECIMAL(10,2) NOT NULL,
    "Notes" TEXT,
    "CustomerAddress" TEXT,
    "CustomerPhone" VARCHAR(20),
    "PaymentStatus" INTEGER NOT NULL DEFAULT 0, -- 0: Pending, 1: Paid, 2: Refunded
    "PaymentMethod" VARCHAR(50),
    "PaymentReference" VARCHAR(100),
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "LastModificationTime" TIMESTAMP WITH TIME ZONE,
    "LastModifierId" UUID,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "DeleterId" UUID,
    "DeletionTime" TIMESTAMP WITH TIME ZONE,
    "TenantId" UUID,
    FOREIGN KEY ("ServiceId") REFERENCES "Services"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("CustomerId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("ProviderId") REFERENCES "ServiceProviders"("Id") ON DELETE CASCADE
);

-- Reviews and Ratings
CREATE TABLE IF NOT EXISTS "ServiceReviews" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ServiceId" UUID NOT NULL,
    "BookingId" UUID,
    "CustomerId" UUID NOT NULL,
    "ProviderId" UUID NOT NULL,
    "Rating" INTEGER NOT NULL CHECK ("Rating" >= 1 AND "Rating" <= 5),
    "Title" VARCHAR(200),
    "Comment" TEXT,
    "IsVerified" BOOLEAN NOT NULL DEFAULT false,
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "LastModificationTime" TIMESTAMP WITH TIME ZONE,
    "LastModifierId" UUID,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,
    "DeleterId" UUID,
    "DeletionTime" TIMESTAMP WITH TIME ZONE,
    "TenantId" UUID,
    FOREIGN KEY ("ServiceId") REFERENCES "Services"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("BookingId") REFERENCES "ServiceBookings"("Id") ON DELETE SET NULL,
    FOREIGN KEY ("CustomerId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("ProviderId") REFERENCES "ServiceProviders"("Id") ON DELETE CASCADE
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS "PaymentTransactions" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "BookingId" UUID NOT NULL,
    "Amount" DECIMAL(10,2) NOT NULL,
    "Currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "PaymentMethod" VARCHAR(50),
    "PaymentProvider" VARCHAR(50),
    "TransactionId" VARCHAR(200),
    "Status" INTEGER NOT NULL DEFAULT 0, -- 0: Pending, 1: Success, 2: Failed, 3: Refunded
    "ProcessedAt" TIMESTAMP WITH TIME ZONE,
    "RefundedAt" TIMESTAMP WITH TIME ZONE,
    "RefundAmount" DECIMAL(10,2),
    "RefundReason" TEXT,
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "LastModificationTime" TIMESTAMP WITH TIME ZONE,
    "LastModifierId" UUID,
    "TenantId" UUID,
    FOREIGN KEY ("BookingId") REFERENCES "ServiceBookings"("Id") ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS "Notifications" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "UserId" UUID NOT NULL,
    "Title" VARCHAR(200) NOT NULL,
    "Message" TEXT NOT NULL,
    "Type" INTEGER NOT NULL DEFAULT 0, -- 0: Info, 1: Warning, 2: Error, 3: Success
    "IsRead" BOOLEAN NOT NULL DEFAULT false,
    "ReadAt" TIMESTAMP WITH TIME ZONE,
    "RelatedEntityType" VARCHAR(100),
    "RelatedEntityId" UUID,
    "ActionUrl" TEXT,
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "TenantId" UUID,
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

-- File Attachments
CREATE TABLE IF NOT EXISTS "FileAttachments" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "FileName" VARCHAR(500) NOT NULL,
    "FileUrl" TEXT NOT NULL,
    "FileSize" BIGINT,
    "ContentType" VARCHAR(200),
    "EntityType" VARCHAR(100),
    "EntityId" UUID,
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatorId" UUID,
    "TenantId" UUID
);

-- Provider Service Areas
CREATE TABLE IF NOT EXISTS "ProviderServiceAreas" (
    "Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ProviderId" UUID NOT NULL,
    "City" VARCHAR(100) NOT NULL,
    "State" VARCHAR(100) NOT NULL,
    "ZipCode" VARCHAR(20),
    "ServiceRadius" INTEGER, -- in miles
    "CreationTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "TenantId" UUID,
    FOREIGN KEY ("ProviderId") REFERENCES "ServiceProviders"("Id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users" ("Email");
CREATE INDEX IF NOT EXISTS "IX_Users_UserName" ON "Users" ("UserName");
CREATE INDEX IF NOT EXISTS "IX_Services_CategoryId" ON "Services" ("CategoryId");
CREATE INDEX IF NOT EXISTS "IX_Services_ProviderId" ON "Services" ("ProviderId");
CREATE INDEX IF NOT EXISTS "IX_ServiceBookings_CustomerId" ON "ServiceBookings" ("CustomerId");
CREATE INDEX IF NOT EXISTS "IX_ServiceBookings_ProviderId" ON "ServiceBookings" ("ProviderId");
CREATE INDEX IF NOT EXISTS "IX_ServiceBookings_ServiceId" ON "ServiceBookings" ("ServiceId");
CREATE INDEX IF NOT EXISTS "IX_ServiceBookings_ScheduledDate" ON "ServiceBookings" ("ScheduledDate");
CREATE INDEX IF NOT EXISTS "IX_ServiceReviews_ServiceId" ON "ServiceReviews" ("ServiceId");
CREATE INDEX IF NOT EXISTS "IX_ServiceReviews_ProviderId" ON "ServiceReviews" ("ProviderId");
CREATE INDEX IF NOT EXISTS "IX_Notifications_UserId" ON "Notifications" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_Notifications_IsRead" ON "Notifications" ("IsRead");

-- Insert default service categories
INSERT INTO "ServiceCategories" ("Id", "Name", "Description", "IconUrl", "CreationTime") VALUES
(uuid_generate_v4(), 'Cleaning', 'Professional cleaning services for homes and offices', 'https://example.com/icons/cleaning.svg', NOW()),
(uuid_generate_v4(), 'Plumbing', 'Plumbing repairs, installations, and maintenance', 'https://example.com/icons/plumbing.svg', NOW()),
(uuid_generate_v4(), 'Electrical', 'Electrical installations, repairs, and inspections', 'https://example.com/icons/electrical.svg', NOW()),
(uuid_generate_v4(), 'HVAC', 'Heating, ventilation, and air conditioning services', 'https://example.com/icons/hvac.svg', NOW()),
(uuid_generate_v4(), 'Landscaping', 'Garden maintenance, lawn care, and outdoor design', 'https://example.com/icons/landscaping.svg', NOW()),
(uuid_generate_v4(), 'Painting', 'Interior and exterior painting services', 'https://example.com/icons/painting.svg', NOW()),
(uuid_generate_v4(), 'Carpentry', 'Custom carpentry and woodworking services', 'https://example.com/icons/carpentry.svg', NOW()),
(uuid_generate_v4(), 'Moving', 'Professional moving and relocation services', 'https://example.com/icons/moving.svg', NOW());

-- Enable Row Level Security (RLS) for security
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceProviders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceBookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceReviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - adjust based on your security requirements)
CREATE POLICY "Users can view own profile" ON "Users"
    FOR SELECT USING (auth.uid()::text = "Id"::text);

CREATE POLICY "Users can update own profile" ON "Users"
    FOR UPDATE USING (auth.uid()::text = "Id"::text);

CREATE POLICY "Service providers can manage own services" ON "Services"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "ServiceProviders" sp 
            WHERE sp."Id" = "ProviderId" 
            AND sp."UserId"::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can view all services" ON "Services"
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own bookings" ON "ServiceBookings"
    FOR ALL USING (auth.uid()::text = "CustomerId"::text);

CREATE POLICY "Providers can view their bookings" ON "ServiceBookings"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "ServiceProviders" sp 
            WHERE sp."Id" = "ProviderId" 
            AND sp."UserId"::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can view own notifications" ON "Notifications"
    FOR SELECT USING (auth.uid()::text = "UserId"::text);

-- Create function to update provider ratings when reviews are added/updated
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "ServiceProviders" 
    SET 
        "Rating" = (
            SELECT ROUND(AVG("Rating")::numeric, 2) 
            FROM "ServiceReviews" 
            WHERE "ProviderId" = NEW."ProviderId" 
            AND "IsDeleted" = false
        ),
        "TotalReviews" = (
            SELECT COUNT(*) 
            FROM "ServiceReviews" 
            WHERE "ProviderId" = NEW."ProviderId" 
            AND "IsDeleted" = false
        )
    WHERE "Id" = NEW."ProviderId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update provider ratings
CREATE TRIGGER trigger_update_provider_rating
    AFTER INSERT OR UPDATE ON "ServiceReviews"
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_rating();