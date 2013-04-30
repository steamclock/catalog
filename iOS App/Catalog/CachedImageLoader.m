//
//  CachedImageLoader.m
//  Catalog
//

#import "CachedImageLoader.h"
#import "UIApplication+NetworkActivityIndicator.h"

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

+ (UIImage*)loadedImageWithImage: (UIImage*)image {
    CGImageRef imgRef = image.CGImage;
    
    UIGraphicsBeginImageContext(image.size);
    
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextScaleCTM(context, 1, -1);
    CGContextTranslateCTM(context, 0, -image.size.height);
    CGContextDrawImage(context, CGRectMake(0, 0, image.size.width, image.size.height), imgRef);

    UIImage* rendered =  UIGraphicsGetImageFromCurrentImageContext();

    UIGraphicsEndImageContext();
    
    return rendered;
}

-(void)loadImage:(NSURL*)url onLoad:(void (^)(UIImage*, BOOL))callback {
    if(url == nil) {
        return;
    }
    
    UIImage* image = self.cached[url];
    if(image) {
        // have cached image, callback immediatly
        callback(image, YES);
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
            [[UIApplication sharedApplication] showNetworkActivityIndicator];
            
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                UIImage* image = [UIImage imageWithData:[NSData dataWithContentsOfURL:url]];
                
                if(weakSelf.forceBackgroundDecompress) {
                    image = [CachedImageLoader loadedImageWithImage:image];
                }
                
                dispatch_async(dispatch_get_main_queue(), ^{
                    [[UIApplication sharedApplication] hideNetworkActivityIndicator];

                    if(image) {
                        weakSelf.cached[url] = image;

                        [weakSelf.loading[url] enumerateObjectsUsingBlock:^(void (^callback)(UIImage*, BOOL), NSUInteger idx, BOOL *stop) {
                            callback(image, NO);
                        }];
                    }
                    
                    // Clean up the load handlers
                    [weakSelf.loading removeObjectForKey:url];
                });
            });
        }
    }
}

-(void)precacheImage:(NSURL*)url {
    if(url == nil) {
        return;
    }
    
    // Just start a load with an empty callback block to precache
    [self loadImage:url onLoad:^(UIImage* image, BOOL cached) { /* empty */ }];
}

-(UIImage*)cachedImageForURL:(NSURL*)url {
    return self.cached[url];
}

-(void)flush {
    [self.cached removeAllObjects];
}

@end
