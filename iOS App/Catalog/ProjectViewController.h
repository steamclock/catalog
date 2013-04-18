//
//  ProjectViewController.h
//  Catalog
//

#import <UIKit/UIKit.h>

#define SERVER_ADDRESS @"http://10.0.1.53:3000"

@interface ProjectViewController : UIViewController <UIScrollViewDelegate, UIWebViewDelegate, UIGestureRecognizerDelegate>

-(id)initWithProjects:(NSArray*)project startIndex:(int)index;

@end
