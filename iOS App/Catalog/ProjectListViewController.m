//
//  ProjectListViewController.m
//  Catalog
//

#import "ProjectListViewController.h"
#import "ProjectViewController.h"
#import "CachedImageLoader.h"

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

@interface ProjectListViewController ()
@property (strong, nonatomic) IBOutlet UICollectionView* collectionView;
@property (strong, nonatomic) IBOutlet UIButton* home;
@property (strong, nonatomic) IBOutlet UIButton* design;
@property (strong, nonatomic) IBOutlet UIButton* visualArts;
@property (strong, nonatomic) IBOutlet UIButton* mediaArts;
@property (strong, nonatomic) IBOutlet UIButton* MAA;
@property (strong, nonatomic) IBOutlet UIButton* search;
@property (strong, nonatomic) IBOutlet UIButton* about;
@property (strong, nonatomic) IBOutlet UISearchBar* searchBar;

@property (strong, nonatomic) UIWebView* aboutWebView;

@property (strong, nonatomic) NSArray* currentProjects;

@property (strong, nonatomic) NSArray* allProjectsSorted;
@property (strong, nonatomic) NSArray* allProjectsRandomized;

@property (strong, nonatomic) NSArray* designProjects;
@property (strong, nonatomic) NSArray* visualArtsProjects;
@property (strong, nonatomic) NSArray* mediaArtsProjects;
@property (strong, nonatomic) NSArray* maaProjects;

@property (strong, nonatomic) CachedImageLoader* thumbnailLoader;
@end

@implementation ProjectListViewController

#pragma mark Lifecycle

-(id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil {
    if((self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil])) {
        [self loadProjectLists];
        self.thumbnailLoader = [CachedImageLoader new];
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
        
    self.aboutWebView = [[UIWebView alloc] initWithFrame:self.collectionView.frame];
    self.aboutWebView.hidden = YES;
    NSString *filePath = [[NSBundle mainBundle] pathForResource:@"about" ofType:@"html"];
    NSData *htmlData = [NSData dataWithContentsOfFile:filePath];
    [self.aboutWebView loadData:htmlData MIMEType:@"text/html" textEncodingName:@"UTF-8" baseURL:nil];
    [self.view addSubview:self.aboutWebView];
    
    self.searchBar.delegate = self;
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
        
        [newArray addObject:newProject];
        
        
    }];
    
    return newArray;
}


-(NSArray*)filteredProjectsForDegree:(NSString*)degree {
    NSMutableArray* filtered = [NSMutableArray new];
    [self.allProjectsSorted enumerateObjectsUsingBlock:^(NSDictionary* obj, NSUInteger idx, BOOL *stop) {
        if ([degree isEqualToString:obj[@"degree"]]) {
            [filtered addObject:obj];
        }
    }];
    return filtered;
}

-(void)loadProjectLists {
    NSData* data = [NSData dataWithContentsOfURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@/json", SERVER_ADDRESS]]];
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
    
    self.designProjects = [self filteredProjectsForDegree:@"design"];
    self.visualArtsProjects = [self filteredProjectsForDegree:@"visual-arts"];
    self.mediaArtsProjects = [self filteredProjectsForDegree:@"media-arts"];
    self.maaProjects = [self filteredProjectsForDegree:@"masters-of-applied-arts"];
}

#pragma mark UICollectionViewDelegate

-(NSURL*)thumbnailForProject:(NSDictionary*)project {
//    return nil;
//    return [NSString stringWithFormat:@"%@%@", SERVER_ADDRESS, project[@"thumbnail"]];
    for(NSDictionary* asset in project[@"assets"]) {
        if([asset[@"type"] isEqualToString:@"image"]) {
            NSString* imageURL = [NSString stringWithFormat:@"%@%@", SERVER_ADDRESS, asset[@"url"]];
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
    [self presentViewController:project animated:YES completion:^{
        
    }];
}

#pragma mark Search delegate

-(NSArray*)filteredProjectsForSearch:(NSString*)string {
    
    if (string.length == 0) {
        return self.allProjectsSorted;
    }
    
    string = [string lowercaseString];
    
    NSMutableArray* filtered = [NSMutableArray new];
    
    [self.allProjectsSorted enumerateObjectsUsingBlock:^(NSDictionary* obj, NSUInteger idx, BOOL *stop) {
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
    searchBar.text = @"";
    [self searchBar:searchBar textDidChange:@""];
    [searchBar resignFirstResponder];
}

#pragma mark Navigation bar implimentation

-(void)unselectAll {
    self.home.selected = NO;
    self.design.selected = NO;
    self.visualArts.selected = NO;
    self.mediaArts.selected = NO;
    self.MAA.selected = NO;
    self.search.selected = NO;
    self.about.selected = NO;
    self.aboutWebView.hidden = YES;
    self.searchBar.hidden = YES;
}

-(void)showProjectList:(NSArray*)projects forButton:(UIButton*)button {
    if(button.selected) {
        return;
    }
    
    [self unselectAll];
    
    button.selected = YES;
    
    self.currentProjects = projects;;
    [self.collectionView reloadData];
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

-(IBAction)showSearch:(id)sender {
    [self showProjectList:self.allProjectsSorted forButton:self.search];
    self.searchBar.hidden = NO;
    [self.searchBar becomeFirstResponder];
}

-(IBAction)showAbout:(id)sender {
    [self showProjectList:nil forButton:self.about];
    self.aboutWebView.hidden = NO;
}


@end
