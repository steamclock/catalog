//
//  ProjectViewController.h
//  Catalog
//

#import <UIKit/UIKit.h>

@interface ProjectViewController : UIViewController <UIScrollViewDelegate, UIWebViewDelegate>

-(id)initWithProjects:(NSArray*)project startIndex:(int)index;

@end
