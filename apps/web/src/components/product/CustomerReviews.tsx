'use client'

import React from 'react'
import type { Review } from '@/payload-types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { StarRating } from '@/components/StarRating'

export const CustomerReviews: React.FC<{
  reviews: Review[]
  averageRating: number
  reviewCount: number
}> = ({ reviews, averageRating, reviewCount }) => {
  
  // Calculate distribution for 5, 4, 3, 2, 1 stars
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(review => {
     const rounded = Math.round(review.rating)
     if (rounded >= 1 && rounded <= 5) {
        distribution[rounded as keyof typeof distribution]++
     }
  })

  return (
    <div className="mt-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-heading font-medium tracking-tight mb-2">Customer Reviews</h2>
          <p className="text-muted-foreground">Based on {reviewCount} reviews</p>
        </div>
        <Button size="lg" className="w-full md:w-auto">Write a Review</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Summary Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="flex items-center gap-6">
              <div className="text-6xl font-heading font-medium tracking-tighter">
                 {averageRating.toFixed(1)}
              </div>
              <div className="flex flex-col gap-1">
                 <StarRating rating={averageRating} maxStars={5} className="gap-1" iconClassName="size-5" />
                 <span className="text-sm text-muted-foreground">{reviewCount} Ratings</span>
              </div>
           </div>

           <div className="flex flex-col gap-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                 const count = distribution[stars as keyof typeof distribution]
                 const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0
                 return (
                    <div key={stars} className="flex items-center gap-3 text-sm">
                       <span className="w-2 font-medium">{stars}</span>
                       <StarRating rating={1} maxStars={1} className="gap-0" iconClassName="size-3 text-muted-foreground" />
                       <Progress value={percentage} className="h-2 flex-1" />
                       <span className="w-8 text-right text-muted-foreground tabular-nums">{count}</span>
                    </div>
                 )
              })}
           </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {reviews.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
               No reviews yet. Be the first to review this product!
            </div>
          ) : (
            reviews.map((review, i) => (
              <React.Fragment key={review.id}>
                {i > 0 && <Separator />}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
                  <div className="flex items-center sm:items-start gap-4 w-full sm:w-48 shrink-0">
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback className="bg-muted">
                         {typeof review.user === 'object' && review.user?.name
                           ? review.user.name.substring(0, 1).toUpperCase()
                           : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                       <span className="font-medium text-sm">
                          {typeof review.user === 'object' ? review.user?.name : 'Anonymous User'}
                       </span>
                       <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                       </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 flex-1">
                     <StarRating rating={review.rating} maxStars={5} className="gap-0.5" />
                     {review.title && <h4 className="font-medium">{review.title}</h4>}
                     <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.description}
                     </p>
                  </div>
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
