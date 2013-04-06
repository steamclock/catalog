//
//  ProjectViewController.m
//  Catalog
//

#import "ProjectViewController.h"

@interface ProjectViewController ()

@property (strong, nonatomic) IBOutlet UIScrollView* scrollView;
@property (strong, nonatomic) IBOutlet UIButton* backButton;
@property (strong, nonatomic) IBOutlet UIPageControl* pageControl;
@property (strong, nonatomic) IBOutlet UIView* detailContainer;

@property (strong, nonatomic) NSDictionary* project;

@property BOOL showingDetails;
@property CGRect showDetailsFrame;
@property CGRect hideDetailsFrame;
@property CGRect showDetailsBackFrame;
@property CGRect hideDetailsBackFrame;

@property (strong, nonatomic) IBOutlet UILabel* name;
@property (strong, nonatomic) IBOutlet UILabel* author;
@property (strong, nonatomic) IBOutlet UILabel* medium;
@property (strong, nonatomic) IBOutlet UILabel* measurements;
@property (strong, nonatomic) IBOutlet UILabel* website;

@end

@implementation ProjectViewController

-(id)initWithProject:(NSDictionary *)project {
    
    self = [super init];
    if (self) {
        self.project = project;
    }
    return self;
    
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
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
        webView.allowsInlineMediaPlayback = NO;
        [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:self.project[@"video"]]]];
        webView.delegate = self;
        [self.scrollView addSubview:webView];
    }
    
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

    self.name.text = self.project[@"title"];
    self.author.text = self.project[@"author"];
    self.medium.text = self.project[@"medium"];
    self.measurements.text = self.project[@"measurements"];
    self.website.text = self.project[@"website"];
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
}

-(BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    if(navigationType == UIWebViewNavigationTypeOther) {
        // Initial load lett it go
        return YES;
    }
    else
    {
        // Anything else, send it to Safari
        [[UIApplication sharedApplication] openURL:request.URL];
    }
    return NO;
}

-(IBAction)detailButtonPressed:(id)sender {
    // Figure out if we are showing or hiding
    CGRect destDetails = self.showingDetails ? self.hideDetailsFrame : self.showDetailsFrame;
    CGRect destBack = self.showingDetails ? self.hideDetailsBackFrame : self.showDetailsBackFrame;
    float destAlpha = self.showingDetails ? 0.0f : 1.0f;
    
    self.showingDetails = !self.showingDetails;

    // Run show/hide animation
    [UIView animateWithDuration:0.5 animations:^{
        self.backButton.frame = destBack;
        self.detailContainer.frame = destDetails;
        self.detailContainer.alpha = destAlpha;
    }];
}

-(IBAction)websiteClicked:(id)sender {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:self.project[@"website"]]];
}

@end
