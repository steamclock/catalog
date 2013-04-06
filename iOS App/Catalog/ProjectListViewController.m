//
//  ProjectListViewController.m
//  Catalog
//

#import "ProjectListViewController.h"
#import "ProjectViewController.h"

#define REUSE_IDENTIFIER @"ThumbnailCell"

@interface ProjectListViewController ()
@property (strong, nonatomic) IBOutlet UICollectionView* collectionView;
@property (strong, nonatomic) IBOutlet UITabBar* tabBar;
@property (strong, nonatomic) NSMutableDictionary* cachedImages;
@property (strong, nonatomic) NSArray* projects;
@end

@implementation ProjectListViewController

-(NSArray*)sanitizeProjects:(NSArray*)projects {
    // Strip NSNulls out of the project list
    NSMutableArray* newArray = [NSMutableArray new];
    
    [projects enumerateObjectsUsingBlock:^(NSDictionary* obj, NSUInteger idx, BOOL *stop) {
        NSMutableDictionary* newProject = [NSMutableDictionary new];
        [obj enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
            if(![obj isKindOfClass:[NSNull class]]) {
                newProject[key] = obj;
            }
        }];
        
        [newArray addObject:newProject];
    }];
    
    return newArray;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.collectionView.dataSource = self;
    self.collectionView.delegate = self;
    
    [self.collectionView registerNib:[UINib nibWithNibName:@"ProjectCell" bundle:[NSBundle mainBundle]] forCellWithReuseIdentifier:REUSE_IDENTIFIER];
    
    [self.tabBar setSelectedItem:self.tabBar.items[0]];
    
    self.cachedImages = [NSMutableDictionary new];
    
    self.projects = [self sanitizeProjects:[NSJSONSerialization JSONObjectWithData:[NSData dataWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"sample" ofType:@"json"]] options:0 error:nil]];
}

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return 1;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return self.projects.count;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    UICollectionViewCell* cell = [collectionView dequeueReusableCellWithReuseIdentifier:REUSE_IDENTIFIER forIndexPath:indexPath];
    
    NSString* imageURL = self.projects[indexPath.row][@"thumbnail"];
    UIImage* cachedimage = self.cachedImages[imageURL];
    
    if(cachedimage) {
        UIImageView* background = (UIImageView*)[cell viewWithTag:100];
        background.image = cachedimage;
    }
    else {
        __weak UICollectionView* weakCollectionView = collectionView;
        __weak ProjectListViewController* weakSelf = self;
        
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            UIImage* image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:imageURL]]];
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if([[weakCollectionView indexPathsForVisibleItems] containsObject:indexPath]) {
                    UIImageView* background = (UIImageView*)[cell viewWithTag:100];
                    background.image = image;
                    weakSelf.cachedImages[imageURL] = image;
                }
            });
        });
    }
    
    UILabel* title = (UILabel*)[cell viewWithTag:101];
    title.text = self.projects[indexPath.row][@"title"];

    UILabel* author = (UILabel*)[cell viewWithTag:102];
    author.text = self.projects[indexPath.row][@"author"];
    
    return cell;
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath {
    ProjectViewController* project = [[ProjectViewController alloc] initWithProject:self.projects[indexPath.row]];
    [self presentViewController:project animated:YES completion:^{
        
    }];
}

-(void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    [self.cachedImages removeAllObjects];
}

@end
