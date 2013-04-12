//
//  CachedImageLoader.m
//  Catalog
//

#import "CachedImageLoader.h"

@interface CachedImageLoader ()
@property (strong, nonatomic) NSMutableDictionary* cached; // map URLs -> UIImage
@property (strong, nonatomic) NSMutableDictionary* loading; // map URLS -> NSMutableArray of load callback blocks 
@end

@implementation CachedImageLoader

- (id)init {
    self = [super init];
    if (self) {
        self.cached = [NSMutableDictionary new];
        self.loading = [NSMutableDictionary new];
    }
    return self;
}

-(void)loadImage:(NSURL*)url onLoad:(void (^)(UIImage*))callback {
    UIImage* image = self.cached[url];
    if(image) {
        // have cached image, callback immediatly
        callback(image);
    }
    else {
        // Check if we already have a load for this URL
        NSMutableArray* alreadyLoading = self.loading[url];
        
        if(alreadyLoading) {
            // Already have one, just add this callback to the list
            [alreadyLoading addObject:callback];
        }
        else {
            // No existing load, add the callback to the list
            self.loading[url] = [NSMutableArray arrayWithObject:callback];
        
            __weak CachedImageLoader* weakSelf = self;
            
            // Now do the actual load
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                UIImage* image = [UIImage imageWithData:[NSData dataWithContentsOfURL:url]];
                
                dispatch_async(dispatch_get_main_queue(), ^{
                    weakSelf.cached[url] = image;

                    [weakSelf.loading[url] enumerateObjectsUsingBlock:^(void (^callback)(UIImage*), NSUInteger idx, BOOL *stop) {
                        callback(image);
                    }];
                    
                    // Clean up the load handlers
                    [weakSelf.loading removeObjectForKey:url];
                });
            });
        }
    }
}

-(void)precacheImage:(NSURL*)url {
    // Just start a load with an empty callback block to precache
    [self loadImage:url onLoad:^(UIImage* image) { /* empty */ }];
}

-(void)flush {
    [self.cached removeAllObjects];
}

@end
