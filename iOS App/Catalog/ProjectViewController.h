//
//  ProjectViewController.h
//  Catalog
//

#import <UIKit/UIKit.h>

@interface ProjectViewController : UIViewController <UIScrollViewDelegate, UIWebViewDelegate>

-(id)initWithProject:(NSDictionary*)project;

@end
