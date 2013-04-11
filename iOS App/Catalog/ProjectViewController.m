//
//  ProjectViewController.m
//  Catalog
//

#import "ProjectViewController.h"

typedef enum {
    TransitionStateNone,
    TransitionStatePrepPrev,
    TransitionStatePrepNext,
    TransitionStateDoingPrev,
    TransitionStateDoingNext,
    TransitionStateResetting
} TransitionState;

@interface ProjectViewController ()

@property (strong, nonatomic) IBOutlet UIScrollView* scrollView;
@property (strong, nonatomic) IBOutlet UIButton* backButton;
@property (strong, nonatomic) IBOutlet UIPageControl* pageControl;
@property (strong, nonatomic) IBOutlet UIView* detailContainer;

@property (strong, nonatomic) IBOutlet UIView* curtain;
@property (nonatomic) TransitionState transitionState;

@property (strong, nonatomic) NSArray* projects;
@property (strong, nonatomic) NSDictionary* project;
@property (nonatomic) int currentIndex;

@property (nonatomic) BOOL showingDetails;
@property (nonatomic) CGRect showDetailsFrame;
@property (nonatomic) CGRect hideDetailsFrame;
@property (nonatomic) CGRect showDetailsBackFrame;
@property (nonatomic) CGRect hideDetailsBackFrame;

@property (strong, nonatomic) IBOutlet UILabel* name;
@property (strong, nonatomic) IBOutlet UILabel* author;
@property (strong, nonatomic) IBOutlet UILabel* medium;
@property (strong, nonatomic) IBOutlet UILabel* measurements;
@property (strong, nonatomic) IBOutlet UILabel* website;

@end

@implementation ProjectViewController

-(id)initWithProjects:(NSArray*)projects startIndex:(int)index {
    self = [super init];
    if (self) {
        self.projects = projects;
        self.currentIndex = index;
        self.project = projects[index];
    }
    return self;
    
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.scrollView.delegate = self;
    
    // Figure out the two possible frames for the detail view and the back button (for animated show/hide of the details)
    self.showDetailsFrame = self.detailContainer.frame;
    self.showDetailsBackFrame = self.backButton.frame;
    
    CGRect hide = self.showDetailsFrame;
    hide.origin.y = -self.showDetailsFrame.size.height;
    self.hideDetailsFrame = hide;
    
    hide = self.showDetailsBackFrame;
    hide.origin.y = hide.origin.y - self.showDetailsFrame.size.height;
    self.hideDetailsBackFrame = hide;
    
    self.showingDetails = NO;

    [self setupCurrentProject];
}

-(void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    
    // reset to the hidden position after laying out view
    self.detailContainer.alpha = 0.0f;
    self.detailContainer.frame = self.hideDetailsFrame;
    self.backButton.frame = self.hideDetailsBackFrame;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
}

-(void)setupCurrentProject {
    BOOL hasVideo = self.project[@"video"] && [self.project[@"video"] length];
    int numPages = [self.project[@"images"] count] + (hasVideo ? 1 : 0);
    
    self.scrollView.contentSize = CGSizeMake(1024 * numPages, 748);
    self.pageControl.numberOfPages = numPages;
    
    int page = 0;
    
    for(NSString* imageURL in self.project[@"images"]) {
        UIImageView* imageView = [[UIImageView alloc] initWithFrame:CGRectMake(1024 * page, 0, 1024, 748)];
        imageView.contentMode = UIViewContentModeScaleAspectFit;
        
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            UIImage* image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:imageURL]]];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                imageView.image = image;
            });
        });
        
        [self.scrollView addSubview:imageView];
        page++;
    }
    
    if (hasVideo) {
        static int inset = 60;
        UIWebView* webView = [[UIWebView alloc] initWithFrame:CGRectMake((1024 * page) + inset, inset, 1024 - (inset * 2), 768 - (inset * 2))];
        webView.scrollView.scrollEnabled = NO;
        [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:self.project[@"video"]]]];
        webView.delegate = self;
        [self.scrollView addSubview:webView];
    }
        
    self.name.text = self.project[@"title"];
    self.author.text = self.project[@"author"];
    self.medium.text = self.project[@"medium"];
    self.measurements.text = self.project[@"measurements"];
    self.website.text = self.project[@"website"];
    
    self.transitionState = TransitionStateNone;
}

-(IBAction)dismiss:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
}

-(void)scrollViewDidScroll:(UIScrollView *)scrollView {
    // Check if current page has changed, to update page control, and hide details view if needed
    int newPage = floor((float)(scrollView.contentOffset.x + 512) / 1024.0f);
    if (newPage != self.pageControl.currentPage) {
        self.pageControl.currentPage = newPage;
        if(self.showingDetails) {
            [self detailButtonPressed:nil];
        }
    }
    
    if((self.transitionState != TransitionStateDoingNext) && (self.transitionState != TransitionStateDoingPrev) && (self.transitionState != TransitionStateResetting)) {
        self.transitionState = TransitionStateNone;
        
        if(!self.curtain) {
            CGRect curtainFrame = self.scrollView.frame;
            curtainFrame.origin.x = 1024;
            self.curtain = [[UIView alloc] initWithFrame:curtainFrame];
            self.curtain.backgroundColor = [UIColor blueColor];
            [self.view addSubview:self.curtain];
        }
        
        static const int TRANSITION_PULL_START = 150.0f;
        static const int TRANSITION_PULL_DIST = 150.0f;
        
        if(((scrollView.contentOffset.x + scrollView.frame.size.width) > scrollView.contentSize.width) && (self.currentIndex < (self.projects.count - 1))) {
            float t = ((scrollView.contentOffset.x + scrollView.frame.size.width) - (scrollView.contentSize.width + TRANSITION_PULL_START)) / (TRANSITION_PULL_DIST);
            t = MIN(MAX(t, 0.0f), 1.0f);
            CGRect frame = self.curtain.frame;
            frame.origin.x = 1024.0f - (t  * 1024.0f);
            
            self.curtain.frame = frame;
            self.transitionState = TransitionStatePrepNext;
        }
        else if((scrollView.contentOffset.x < 0) && (self.currentIndex > 0)) {
            float t = ((-scrollView.contentOffset.x - TRANSITION_PULL_START)) / (TRANSITION_PULL_DIST);
            t = MIN(MAX(t, 0.0f), 1.0f);
            CGRect frame = self.curtain.frame;
            frame.origin.x = -1024.0f + (t * 1024.0f);
            
            self.curtain.frame = frame;
            self.transitionState = TransitionStatePrepPrev;
        }
    }

}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    if((self.transitionState == TransitionStatePrepNext) || (self.transitionState == TransitionStatePrepPrev)) {
        CGRect frame = self.curtain.frame;

        if(self.transitionState == TransitionStatePrepNext) {
            if(frame.origin.x < 512) {
                self.transitionState = TransitionStateDoingNext;
                frame.origin.x = 0;
            }
            else {
                self.transitionState = TransitionStateResetting;
                frame.origin.x = 1024;
            }
        }
        if(self.transitionState == TransitionStatePrepPrev) {
            if(frame.origin.x > -512) {
                self.transitionState = TransitionStateDoingPrev;
                frame.origin.x = 0;
            }
            else {
                self.transitionState = TransitionStateResetting;
                frame.origin.x = -1024;
            }
        }
    
        [UIView animateWithDuration:0.3 animations:^{
            self.curtain.frame = frame;
        } completion:^(BOOL finished) {
            if(self.transitionState != TransitionStateResetting) {
                if (self.transitionState == TransitionStateDoingNext) {
                    self.currentIndex++;
                }
                else {
                    self.currentIndex--;
                }
                
                self.project = self.projects[self.currentIndex];
                
                for(UIView* view in self.scrollView.subviews) {
                    [view removeFromSuperview];
                }
                
                self.scrollView.contentOffset = CGPointMake(0.0f, 0.0f);

                [self setupCurrentProject];
                [self detailButtonPressed:nil];
                
                self.curtain.frame = CGRectMake(1024, 0, 1024, 748);
            }
            
            self.transitionState = TransitionStateNone;
        }];
    }
}

-(BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    if(navigationType == UIWebViewNavigationTypeOther) {
        // Initial load, let it go
        return YES;
    }
    else
    {
        // Anything else, send it to Safari
        [[UIApplication sharedApplication] openURL:request.URL];
    }
    return NO;
}

-(void)showDetails:(BOOL)show {
    if(show == self.showingDetails) {
        return;
    }
    
    // Figure out if we are showing or hiding
    CGRect destDetails = show ? self.showDetailsFrame : self.hideDetailsFrame;
    CGRect destBack = show ? self.showDetailsBackFrame : self.hideDetailsBackFrame;
    float destAlpha = show ? 1.0f : 0.0f;
    
    self.showingDetails = show;
    
    // Run show/hide animation
    [UIView animateWithDuration:0.5 animations:^{
        self.backButton.frame = destBack;
        self.detailContainer.frame = destDetails;
        self.detailContainer.alpha = destAlpha;
    }];

}
-(IBAction)detailButtonPressed:(id)sender {
    [self showDetails:!self.showingDetails];
}

-(IBAction)websiteClicked:(id)sender {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:self.project[@"website"]]];
}

@end
