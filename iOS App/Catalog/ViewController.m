//
//  ViewController.m
//  Catalog
//

#import "ViewController.h"

#define REUSE_IDENTIFIER @"ThumbnailCell"

@interface ViewController ()
@property (strong, nonatomic) IBOutlet UICollectionView* collectionView;
@property (strong, nonatomic) IBOutlet UITabBar* tabBar;
@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    self.collectionView.dataSource = self;
    [self.collectionView registerClass:[UICollectionViewCell class] forCellWithReuseIdentifier:REUSE_IDENTIFIER];
    
    [self.tabBar setSelectedItem:self.tabBar.items[0]];
}

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return 1;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return 20;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    UICollectionViewCell* cell = [collectionView dequeueReusableCellWithReuseIdentifier:REUSE_IDENTIFIER forIndexPath:indexPath];
    cell.backgroundColor = [UIColor redColor];
    UILabel* label = (UILabel*)[cell viewWithTag:100];
    
    if(!label) {
        label = [[UILabel alloc] initWithFrame:CGRectMake(10, 10, 236, 150)];
        label.tag = 100;
        label.textColor = [UIColor blackColor];
        label.text = [NSString stringWithFormat:@"%D", indexPath.row];
        [cell.contentView addSubview:label];
    }
    return cell;
}


@end
