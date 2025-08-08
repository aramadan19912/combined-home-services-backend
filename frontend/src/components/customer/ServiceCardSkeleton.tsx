import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ServiceCardSkeleton = () => {
  return (
    <Card className="service-card">
      <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />

        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </Card>
  );
};
