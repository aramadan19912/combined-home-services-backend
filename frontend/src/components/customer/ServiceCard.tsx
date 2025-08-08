import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin } from "lucide-react";

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    provider: string;
    image: string;
    price: number;
    rating: number;
    reviewCount: number;
    duration: string;
    location: string;
    category: string;
    description?: string;
  };
  onBook?: () => void;
}

export const ServiceCard = ({ service, onBook }: ServiceCardProps) => {
  const roundedRating = Math.round(service.rating);

  return (
    <Card
      className="service-card group"
      role="article"
      itemScope
      itemType="https://schema.org/Service"
    >
      <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
        <img
          src={service.image}
          alt={`${service.title} by ${service.provider}`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          itemProp="image"
        />
        <Badge
          variant="secondary"
          className="absolute top-3 left-3"
          aria-label={`${service.category} category`}
          itemProp="category"
        >
          {service.category}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <h3
            className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors"
            itemProp="name"
          >
            {service.title}
          </h3>
          {service.description && (
            <p className="text-sm text-muted-foreground truncate" itemProp="description">
              {service.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            by <span itemProp="provider">{service.provider}</span>
          </p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1" aria-label={`Rated ${service.rating.toFixed(1)} out of 5`}>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={i < roundedRating ? "h-4 w-4 fill-warning text-warning" : "h-4 w-4 text-muted-foreground"}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="font-medium">{service.rating.toFixed(1)}</span>
            <span>({service.reviewCount})</span>
          </div>

          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{service.duration}</span>
          </div>

          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{service.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <span className="text-2xl font-bold text-foreground" itemProp="price">
              ${service.price}
            </span>
            <meta itemProp="priceCurrency" content="USD" />
            <span className="text-sm text-muted-foreground ml-1">starting</span>
          </div>

          <Button
            onClick={onBook}
            className="btn-hero transition-transform duration-200 hover:scale-[1.03] focus:scale-[1.02]"
            aria-label={`Book ${service.title} now`}
          >
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  );
};
