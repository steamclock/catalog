//
//  UIApplication+NetworkActivityIndicator.h
//  Catalog
//

#import <Foundation/Foundation.h>

// Functions for turning on and off the network activity indicator that will correctly stack

@interface UIApplication (NetworkActivityIndicator)

- (void)showNetworkActivityIndicator;
- (void)hideNetworkActivityIndicator;

@end
