//
//  ProjectListViewController.m
//  Catalog
//

#import "ProjectListViewController.h"
#import "ProjectViewController.h"
#import "CachedImageLoader.h"
#import "MBProgressHUD.h"

#define REUSE_IDENTIFIER @"ThumbnailCell"

static NSUInteger random_below(NSUInteger n) {
    NSUInteger m = 1;
	
    do {
        m <<= 1;
    } while(m < n);
	
    NSUInteger ret;
	
    do {
        ret = random() % m;
    } while(ret >= n);
	
    return ret;
}

@interface ProjectListViewController () <UIActionSheetDelegate>
@property (strong, nonatomic) IBOutlet UICollectionView* collectionView;
@property (strong, nonatomic) IBOutlet UIButton* home;
@property (strong, nonatomic) IBOutlet UIButton* design;
@property (strong, nonatomic) IBOutlet UIButton* visualArts;
@property (strong, nonatomic) IBOutlet UIButton* mediaArts;
@property (strong, nonatomic) IBOutlet UIButton* MAA;
@property (strong, nonatomic) IBOutlet UIButton* mdes;
@property (strong, nonatomic) IBOutlet UIButton* search;
@property (strong, nonatomic) IBOutlet UIButton* about;
@property (strong, nonatomic) IBOutlet UISearchBar* searchBar;

@property (strong, nonatomic) IBOutlet UIView* statusBarBackground;
@property (strong, nonatomic) IBOutlet NSLayoutConstraint *searchBarTopSpaceConstraint;

@property (strong, nonatomic) IBOutlet UIWebView* aboutWebView;

@property (strong, nonatomic) NSArray* currentProjects;

@property (strong, nonatomic) NSArray* allProjectsSorted;
@property (strong, nonatomic) NSArray* allProjectsRandomized;

@property (strong, nonatomic) NSArray* designProjects;
@property (strong, nonatomic) NSArray* visualArtsProjects;
@property (strong, nonatomic) NSArray* mediaArtsProjects;
@property (strong, nonatomic) NSArray* maaProjects;
@property (strong, nonatomic) NSArray* mdesProjects;

@property (strong, nonatomic) MBProgressHUD* loadProgress;

@property (strong, nonatomic) CachedImageLoader* thumbnailLoader;

@property (strong, nonatomic) NSArray *availableShowYears;
@property (strong, nonatomic) NSString *selectedYear;

@end

@implementation ProjectListViewController

#pragma mark Lifecycle

-(id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil {
    if((self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil])) {
        [self fetchAvailableShowYearsWithCompletion:^(NSArray *availableYears) {
            self.availableShowYears = availableYears;
            [self loadProjectListsForYear:[self.availableShowYears lastObject]];
        }];
        self.thumbnailLoader = [CachedImageLoader new];
        self.thumbnailLoader.forceBackgroundDecompress = YES;
        self.thumbnailLoader.cacheToDirectory = @"thumbnails";
    }
    
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.collectionView.dataSource = self;
    self.collectionView.delegate = self;
    
    [self.collectionView registerNib:[UINib nibWithNibName:@"ProjectCell" bundle:[NSBundle mainBundle]] forCellWithReuseIdentifier:REUSE_IDENTIFIER];
    
    [self showHome:nil];
    
    self.home.selected = YES;

    
    NSString *filePath = [[NSBundle mainBundle] pathForResource:@"about" ofType:@"html"];
    NSData *htmlData = [NSData dataWithContentsOfFile:filePath];
    NSURL *baseURL = [NSURL fileURLWithPath:[[NSBundle mainBundle] bundlePath]];
    [self.aboutWebView loadData:htmlData MIMEType:@"text/html" textEncodingName:@"UTF-8" baseURL:baseURL];
    
    self.aboutWebView.hidden = YES;
    self.aboutWebView.delegate = self;
    
    [self.home setBackgroundImage:[UIImage imageNamed:@"youarehere-highlighted.png"] forState:UIControlStateSelected | UIControlStateHighlighted];
    [self.design setBackgroundImage:[UIImage imageNamed:@"design-highlighted.png"] forState:UIControlStateSelected | UIControlStateHighlighted];
    [self.visualArts setBackgroundImage:[UIImage imageNamed:@"visualarts-highlighted.png"] forState:UIControlStateSelected | UIControlStateHighlighted];
    [self.mediaArts setBackgroundImage:[UIImage imageNamed:@"mediaarts-highlighted.png"] forState:UIControlStateSelected | UIControlStateHighlighted];
    [self.MAA setBackgroundImage:[UIImage imageNamed:@"maa-highlighted.png"] forState:UIControlStateSelected | UIControlStateHighlighted];
    [self.search setBackgroundImage:[UIImage imageNamed:@"search-highlighted.png"] forState:UIControlStateSelected | UIControlStateHighlighted];
    [self.about setBackgroundImage:[UIImage imageNamed:@"about-highlighted.png"] forState:UIControlStateSelected | UIControlStateHighlighted];

    self.searchBar.delegate = self;
    
    // Remove when support for iOS 6 is not required
    if (SYSTEM_VERSION_LESS_THAN(@"7.0")) {
        self.statusBarBackground.hidden = YES;
        UICollectionViewFlowLayout *flowLayout = (UICollectionViewFlowLayout *)self.collectionView.collectionViewLayout;
        flowLayout.sectionInset = UIEdgeInsetsZero;
        self.searchBarTopSpaceConstraint.constant = 0;
        self.searchBar.hidden = YES;
    }
}

-(UIStatusBarStyle)preferredStatusBarStyle {
    return UIStatusBarStyleLightContent;
}

-(void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    [self.thumbnailLoader flush];
}

#pragma mark Loading and Setup

// Strip NSNulls out of the project list, and add an index field with a pre-built search representation
-(NSMutableArray*)sanitizeAndIndexProjects:(NSArray*)projects {
    NSMutableArray* newArray = [NSMutableArray new];
    
    [projects enumerateObjectsUsingBlock:^(NSDictionary* obj, NSUInteger idx, BOOL *stop) {
        NSMutableDictionary* newProject = [NSMutableDictionary new];
        
        [obj enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
            if(![obj isKindOfClass:[NSNull class]]) {
                newProject[key] = obj;
            }
        }];
        
        // Add a conactenation of title and author, with known case, to the object to ease searching
        NSString* title = newProject[@"title"];
        NSString* author = newProject[@"author"];
        
        NSString* index = [NSString stringWithFormat:@"%@ %@", title ? [title lowercaseString] : @"", author ? [author lowercaseString] : @""];
        newProject[@"searchIndex"] = index;

        BOOL valid = ((NSArray*)newProject[@"assets"]).count != 0;
        
        if (valid) {
            [newArray addObject:newProject];
        }
        else {
            NSLog(@"Invalid project: %@", newProject[@"title"]);
        }
    }];
    
    return newArray;
}


-(NSArray*)filteredProjectsForDegree:(NSString*)degree {
    NSMutableArray* filtered = [NSMutableArray new];
    [self.allProjectsSorted enumerateObjectsUsingBlock:^(NSDictionary* obj, NSUInteger idx, BOOL *stop) {
        if (obj[@"degree"] && [obj[@"degree"] caseInsensitiveCompare:degree] == NSOrderedSame) {
            [filtered addObject:obj];
        }
    }];
    return filtered;
}

-(void)finishLoading {
    
    [self reloadSelectedProjectList];
    [self.loadProgress hide:YES];
    self.loadProgress = nil;
}

-(void)cacheThumbnailsFromIndex:(int)num {
    __weak ProjectListViewController* weakSelf = self;
    
    if (num >= [self.allProjectsRandomized count]) {
        // There is no project here
        [self finishLoading];
        return;
    }

    NSURL* thumbnail = [self thumbnailForProject:self.allProjectsRandomized[num]];

    [weakSelf.thumbnailLoader loadImage:thumbnail onLoad:^(UIImage *image, BOOL wasCached) {
        NSLog(@"cached: %d", num);

        if(num == 16) {
            [self finishLoading];
        }
        
        if(num == (weakSelf.allProjectsRandomized.count - 1)) {
            if(num < 16) {
                [self finishLoading];
            }
        }
        else {
            [weakSelf cacheThumbnailsFromIndex:num+1];
        }
    }];
}

-(void)loadProjectListsForYear:(NSString *)year {
    
    if(!self.loadProgress) {
        self.loadProgress = [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    }
    
    self.loadProgress.mode = MBProgressHUDModeIndeterminate;
    self.loadProgress.labelText = @"Loading project list";
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSString *path = year ? [NSString stringWithFormat:@"%@/json/years/%@", SERVER_ADDRESS, year] : [NSString stringWithFormat:@"%@/json", SERVER_ADDRESS];
        NSData* data = [NSData dataWithContentsOfURL:[NSURL URLWithString:path]];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            if(!data) {
                self.loadProgress.mode = MBProgressHUDModeText;
                self.loadProgress.labelText = @"Could not contact server, please try again later";
                
                double delayInSeconds = 15.0;
                dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
                dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
                    [self loadProjectListsForYear:year];
                });
                
                return;
            }
            
            NSMutableArray* orig = [self sanitizeAndIndexProjects:[NSJSONSerialization JSONObjectWithData:data options:0 error:nil]];
            
            srandom((int)[NSDate timeIntervalSinceReferenceDate]);
            
            NSMutableArray* randomized = orig;
            NSMutableArray* sorted = [orig mutableCopy];
            
            
            for(NSUInteger i = [randomized count]; i > 1; i--) {
                NSUInteger j = random_below(i);
                [randomized exchangeObjectAtIndex:i-1 withObjectAtIndex:j];
            }
            
            self.allProjectsRandomized = randomized;
            
            [sorted sortUsingComparator:^NSComparisonResult(NSDictionary* obj1, NSDictionary* obj2) {
                return [obj1[@"author"] compare:obj2[@"author"] options:0];
            }];
            
            self.allProjectsSorted = sorted;
            
            self.designProjects = [self filteredProjectsForDegree:@"Design"];
            self.visualArtsProjects = [self filteredProjectsForDegree:@"Visual Arts"];
            self.mediaArtsProjects = [self filteredProjectsForDegree:@"Media Arts"];
            self.maaProjects = [self filteredProjectsForDegree:@"MAA"];
            self.mdesProjects = [self filteredProjectsForDegree:@"MDes"];
            
            [self cacheThumbnailsFromIndex:0];
        });
    });
}

#pragma mark UICollectionViewDelegate

-(NSURL*)thumbnailForProject:(NSDictionary*)project {
    for(NSDictionary* asset in project[@"assets"]) {
        if([asset[@"type"] isEqualToString:@"image"]) {
            NSString* thumbnailUrl = asset[@"thumbnailurl"];
            NSString* imageURL = [NSString stringWithFormat:@"%@%@", SERVER_ADDRESS, thumbnailUrl];
            imageURL = [imageURL stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            return [NSURL URLWithString:imageURL];
        }
    }
    
    return nil;
}

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return 1;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return self.currentProjects.count;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    UICollectionViewCell* cell = [collectionView dequeueReusableCellWithReuseIdentifier:REUSE_IDENTIFIER forIndexPath:indexPath];
    
    cell.backgroundColor = [UIColor colorWithWhite:0.5 alpha:1.0];
    
    NSURL* imageURL = [self thumbnailForProject:self.currentProjects[indexPath.row]];
    
    UIImageView* background = (UIImageView*)[cell viewWithTag:100];
    background.image = nil;
    
    __weak UICollectionView* weakCollectionView = collectionView;
    
    [self.thumbnailLoader loadImage:imageURL onLoad:^(UIImage* image, BOOL wasCached) {
        // Check urls and index path match, could be a stale load
        UICollectionViewCell* loadCell = nil;
        
        if(wasCached) {
            loadCell = cell;
        }
        else {
            if([[weakCollectionView indexPathsForVisibleItems] containsObject:indexPath] && [imageURL isEqual:[self thumbnailForProject:self.currentProjects[indexPath.row]]]) {
                loadCell = [collectionView cellForItemAtIndexPath:indexPath];
            }
        }
        
        if(loadCell) {
            UIImageView* background = (UIImageView*)[loadCell viewWithTag:100];
            background.image = image;
        }
    }];
    
    UILabel* title = (UILabel*)[cell viewWithTag:101];
    title.text = self.currentProjects[indexPath.row][@"title"];

    UILabel* author = (UILabel*)[cell viewWithTag:102];
    author.text = self.currentProjects[indexPath.row][@"author"];
    
    return cell;
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath {
    ProjectViewController* project = [[ProjectViewController alloc] initWithProjects:self.currentProjects startIndex:indexPath.row];
    project.wantsFullScreenLayout = YES;
    [self presentViewController:project animated:YES completion:^{
        
    }];
}

#pragma mark Search delegate

-(NSArray*)filteredProjectsForSearch:(NSString*)string {
    
    if (string.length == 0) {
        return self.allProjectsRandomized;
    }
    
    string = [string lowercaseString];
    
    NSMutableArray* filtered = [NSMutableArray new];
    
    [self.allProjectsRandomized enumerateObjectsUsingBlock:^(NSDictionary* obj, NSUInteger idx, BOOL *stop) {
        NSRange found = [((NSString*)(obj[@"searchIndex"])) rangeOfString:string];
        
        if( found.location != NSNotFound ) {
            [filtered addObject:obj];
        }
    }];
    
    return filtered;
}

-(void)searchBar:(UISearchBar *)searchBar textDidChange:(NSString *)searchText {
    self.currentProjects = [self filteredProjectsForSearch:searchText];
    [self.collectionView reloadData];
}

-(void)searchBarSearchButtonClicked:(UISearchBar *)searchBar {
    [searchBar resignFirstResponder];
}

-(void)searchBarCancelButtonClicked:(UISearchBar *)searchBar {
    [searchBar resignFirstResponder];
    [self showHome:nil];
}

#pragma mark Navigation bar implimentation

-(void)unselectAll {
    self.home.selected = NO;
    self.design.selected = NO;
    self.visualArts.selected = NO;
    self.mediaArts.selected = NO;
    self.MAA.selected = NO;
    self.mdes.selected = NO;
    self.search.selected = NO;
    self.about.selected = NO;
    self.aboutWebView.hidden = YES;

    if(!self.searchBar.hidden) {
        [UIView animateWithDuration:0.3 animations:^{
            self.searchBar.alpha = 0.0;
        } completion:^(BOOL finished) {
            self.searchBar.hidden = YES;
            self.searchBar.text = @"";
        }];
    }
    
    [self.collectionView scrollRectToVisible:CGRectMake(0, 0, 10, 10) animated:NO];
}

-(void)showProjectList:(NSArray*)projects forButton:(UIButton*)button {
    if(button.selected) {
        return;
    }
    
    [self unselectAll];
    
    button.highlighted = NO;
    button.selected = YES;
    
    self.currentProjects = projects;;
    [self.collectionView reloadData];
}

-(void)forceShowHome {
    self.home.selected = NO;
    [self showHome:nil];
}

-(IBAction)showHome:(id)sender {
    [self showProjectList:self.allProjectsRandomized forButton:self.home];
}

-(IBAction)showDesign:(id)sender {
    [self showProjectList:self.designProjects forButton:self.design];
}

-(IBAction)showVisualArts:(id)sender {
    [self showProjectList:self.visualArtsProjects forButton:self.visualArts];
}

-(IBAction)showMediaArts:(id)sender {
    [self showProjectList:self.mediaArtsProjects forButton:self.mediaArts];
}

-(IBAction)showMAA:(id)sender {
    [self showProjectList:self.maaProjects forButton:self.MAA];
}

-(IBAction)showMDes:(id)sender {
    [self showProjectList:self.mdesProjects forButton:self.mdes];
}

-(IBAction)showYearSelection:(UIButton *)sender {
    UIActionSheet * actionSheet = [[UIActionSheet alloc] initWithTitle:@"Select to view submissions from previous years."
                                                              delegate:self
                                                     cancelButtonTitle:nil
                                                destructiveButtonTitle:nil
                                                     otherButtonTitles:nil];
    for (NSString *availableYear in self.availableShowYears) {
        //NSString *title = [availableYear isEqualToString:self.selectedYear] ? [NSString stringWithFormat:@"%@", availableYear] : availableYear;
        NSString *title = availableYear;
        [actionSheet addButtonWithTitle:title];
    }
    [actionSheet showFromRect:sender.bounds inView:sender animated:YES];
}

-(IBAction)showSearch:(id)sender {
    [self showProjectList:self.allProjectsRandomized forButton:self.search];
    
    if(self.searchBar.hidden) {
        self.searchBar.hidden = NO;
        self.searchBar.alpha = 0.0;
        [UIView animateWithDuration:0.3 animations:^{
            self.searchBar.alpha = 1.0;
        }];
    }
    
    [self.searchBar becomeFirstResponder];
}

-(IBAction)showAbout:(id)sender {
    [self showProjectList:nil forButton:self.about];
    self.aboutWebView.hidden = NO;
}

-(void)reloadSelectedProjectList {
    if (self.design.selected) {
        self.design.selected = NO;
        [self showDesign:nil];
    } else if (self.mediaArts.selected) {
        self.mediaArts.selected = NO;
        [self showMediaArts:nil];
    } else if (self.visualArts.selected) {
        self.visualArts.selected = NO;
        [self showVisualArts:nil];
    } else if (self.MAA.selected){
        self.MAA.selected = NO;
        [self showMAA:nil];
    } else if (self.mdes.selected){
        self.mdes.selected = NO;
        [self showMDes:nil];
    } else {
        self.home.selected = NO;
        [self showHome:nil];
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

- (void)fetchAvailableShowYearsWithCompletion:(void (^)(NSArray* availableYears))completion {
    static NSArray *availableShowYears;
    if (availableShowYears && completion) return completion(availableShowYears);
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSString *path = [NSString stringWithFormat:@"%@/json/available-years", SERVER_ADDRESS];
        NSData* data = [NSData dataWithContentsOfURL:[NSURL URLWithString:path]];
        dispatch_async(dispatch_get_main_queue(), ^{
            
            if (!data && completion) {
                return completion(@[]);
            }
            
            NSError *error;
            id jsonObject = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
            
            if (error) {
                NSLog(@"%@", error);
            }
            
            if ([jsonObject isKindOfClass:[NSArray class]]) {
                availableShowYears = jsonObject;
                if (completion) return completion(availableShowYears);
            } else {
                if (completion) return completion(@[]);
            }
        });
    });
}

#pragma mark - UIActionSheetDelegate methods

- (void)actionSheet:(UIActionSheet *)actionSheet clickedButtonAtIndex:(NSInteger)buttonIndex {
    
    if (buttonIndex < 0) {
        // The user has closed the popover
        return;
    }
    
    NSArray *availableShowYears = self.availableShowYears;
    if (buttonIndex < [availableShowYears count]) {
        self.selectedYear = availableShowYears[buttonIndex];
    }
    
    [self loadProjectListsForYear:self.selectedYear];
}

@end
