//
//  UIApplication+NetworkActivityIndicator.m
//  Catalog
//

#import "UIApplication+NetworkActivityIndicator.h"

@implementation UIApplication (NetworkActivityIndicator)

static int sNetworkActivityCount = 0;

- (void)showNetworkActivityIndicator 
{
    if (sNetworkActivityCount == 0) {
        [UIApplication sharedApplication].networkActivityIndicatorVisible = YES;    
    }
    
    sNetworkActivityCount++;
}

- (void)hideNetworkActivityIndicator
{
    sNetworkActivityCount = MAX(sNetworkActivityCount - 1, 0);
    
    if (sNetworkActivityCount == 0) {
        [UIApplication sharedApplication].networkActivityIndicatorVisible = NO;
    }
}


@end
