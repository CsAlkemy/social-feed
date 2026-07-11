import * as React from "react";

import { cn } from "../lib/cn";
import { Card } from "../schadcn/card";
import { Skeleton } from "../schadcn/skeleton";

export function PostSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/6" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <Skeleton className="mt-4 h-64 w-full" />
      <div className="mt-4 flex gap-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </Card>
  );
}

export function FeedSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}

export function CommentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Skeleton className="size-8 rounded-full" />
      <div className="flex-1 space-y-2 rounded-md bg-muted/50 p-3">
        <Skeleton className="h-3 w-1/5" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}
