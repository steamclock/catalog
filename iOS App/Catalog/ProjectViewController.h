//
//  ProjectViewController.h
//  Catalog
//

#import <UIKit/UIKit.h>

#define SERVER_ADDRESS @"http://localhost:3000"

@interface ProjectViewController : UIViewController <UIScrollViewDelegate, UIWebViewDelegate, UIGestureRecognizerDelegate>

-(id)initWithProjects:(NSArray*)project startIndex:(int)index;

@end
