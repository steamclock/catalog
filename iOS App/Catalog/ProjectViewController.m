//
//  ProjectViewController.m
//  Catalog
//

#import "ProjectViewController.h"

@interface ProjectViewController ()

@property (strong, nonatomic) IBOutlet UIScrollView* scrollView;
@property (strong, nonatomic) IBOutlet UIPageControl* pageControl;

@property (strong, nonatomic) NSDictionary* project;

@end

@implementation ProjectViewController

-(id)initWithProject:(NSDictionary *)project {
    
    self = [super init];
    if (self) {
        self.project = project;
    }
    return self;
    
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    int numPages = [self.project[@"images"] count];
    
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
    
    self.scrollView.delegate = self;
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

-(IBAction)dismiss:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
}

-(void)scrollViewDidScroll:(UIScrollView *)scrollView {
    self.pageControl.currentPage = floor((float)(scrollView.contentOffset.x + 512) / 1024.0f);
}
@end
