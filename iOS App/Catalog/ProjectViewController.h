//
//  ProjectViewController.h
//  Catalog
//

#import <UIKit/UIKit.h>

#define SERVER_ADDRESS @"http://theshow2013.ecuad.ca"

@interface ProjectViewController : UIViewController <UIScrollViewDelegate, UIWebViewDelegate, UIGestureRecognizerDelegate>

-(id)initWithProjects:(NSArray*)project startIndex:(int)index;

@end
