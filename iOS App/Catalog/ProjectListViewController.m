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
@end

@implementation ProjectListViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.collectionView.dataSource = self;
    self.collectionView.delegate = self;
    
    [self.collectionView registerNib:[UINib nibWithNibName:@"ProjectCell" bundle:[NSBundle mainBundle]] forCellWithReuseIdentifier:REUSE_IDENTIFIER];
    
    [self.tabBar setSelectedItem:self.tabBar.items[0]];
    
    self.cachedImages = [NSMutableDictionary new];
}

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return 1;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return 100;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    UICollectionViewCell* cell = [collectionView dequeueReusableCellWithReuseIdentifier:REUSE_IDENTIFIER forIndexPath:indexPath];
    
    NSString* imageURL = @"http://www.steamclock.com/img/home/peer1-mapoftheinternet2.png";
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
    
    UILabel* label = (UILabel*)[cell viewWithTag:101];
    label.text = [NSString stringWithFormat:@"%d", indexPath.row];
    return cell;
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath {
    ProjectViewController* project = [[ProjectViewController alloc] init];
    [self presentViewController:project animated:YES completion:^{
        
    }];
}

@end
