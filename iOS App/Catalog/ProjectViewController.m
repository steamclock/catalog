//
//  ProjectViewController.m
//  Catalog
//

#import "ProjectViewController.h"

@interface ProjectViewController ()

@property (strong, nonatomic) IBOutlet UIScrollView* scrollView;
@property (strong, nonatomic) IBOutlet UIPageControl* pageControl;

@end

@implementation ProjectViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.scrollView.contentSize = CGSizeMake(1024 * 3, 748);
    
    UIView* view1 = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 1024, 748)];
    view1.backgroundColor = [UIColor redColor];
    [self.scrollView addSubview:view1];
    
    UIView* view2 = [[UIView alloc] initWithFrame:CGRectMake(1024, 0, 1024, 748)];
    view2.backgroundColor = [UIColor greenColor];
    [self.scrollView addSubview:view2];
    
    UIView* view3 = [[UIView alloc] initWithFrame:CGRectMake(2048, 0, 1024, 748)];
    view3.backgroundColor = [UIColor blueColor];
    [self.scrollView addSubview:view3];
    
    self.pageControl.numberOfPages = 3;
    
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
