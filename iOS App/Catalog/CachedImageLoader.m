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

- (NSString*)pathInCacheDirectory:(NSString*)imageFilename {
    if(!self.cacheToDirectory) {
        return nil;
    }
    
	NSArray* paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
	NSString* cacheDirectory = [paths objectAtIndex:0];
	NSString* cachePath = [cacheDirectory stringByAppendingPathComponent:self.cacheToDirectory];
    
    
    NSString* filePath;
    
    if(imageFilename) {
        filePath = [cachePath stringByAppendingPathComponent:imageFilename];
    }
    else {
        filePath = cachePath;
    }
    
	return filePath;
}

-(void)loadImage:(NSURL*)url onLoad:(void (^)(UIImage*, BOOL))callback {
    if(url == nil) {
        callback(nil, NO);
        return;
    }
    
    UIImage* image = self.cached[url];
    
    // Return early if we have the image.
    if(image) {
        // have cached image, callback on next run loop
        dispatch_async(dispatch_get_main_queue(), ^{
            callback(image, YES);
        });
        return;
    }
    
    NSString* cacheDir = [self pathInCacheDirectory:nil];
    NSString* cacheFile = [self pathInCacheDirectory:[[url absoluteString] lastPathComponent]];
    NSFileManager* fileManager = [NSFileManager defaultManager];
    
    if(cacheDir) {
        if(![fileManager fileExistsAtPath:cacheDir]) {
            [fileManager createDirectoryAtPath:cacheDir withIntermediateDirectories:YES attributes:nil error:NULL];
        }
    }
    
    if (cacheFile && [fileManager fileExistsAtPath:cacheFile]) {
        __weak CachedImageLoader* weakSelf = self;
        
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            NSData* data = [NSData dataWithContentsOfFile:cacheFile];
            UIImage* image = [UIImage imageWithData:data];
            
            if (image == nil) {
                [fileManager removeItemAtPath:cacheFile error:NULL];
                NSLog(@"image cache load failed: %@", url);
            }
            
            if(weakSelf.forceBackgroundDecompress) {
                image = [CachedImageLoader loadedImageWithImage:image];
            }
            
            dispatch_async(dispatch_get_main_queue(), ^{
                if(image) {
                    weakSelf.cached[url] = image;
                }
                
                callback(image, NO); // load from disk cache doesn't count as 'cached' becasue it was still asynchronous
                
                // Clean up the load handlers
                [weakSelf.loading removeObjectForKey:url];
            });
        });
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
                NSData* data = [NSData dataWithContentsOfURL:url];
                UIImage* image = [UIImage imageWithData:data];
                
                if (image == nil) {
                    NSLog(@"image load failed: %@", url);
                } else {
                    if(cacheFile) {
                        [data writeToFile:cacheFile atomically:YES];
                    }
                }
                
                if(weakSelf.forceBackgroundDecompress) {
                    image = [CachedImageLoader loadedImageWithImage:image];
                }
                
                dispatch_async(dispatch_get_main_queue(), ^{
                    [[UIApplication sharedApplication] hideNetworkActivityIndicator];

                    if(image) {
                        weakSelf.cached[url] = image;
                    }
                    
                    [weakSelf.loading[url] enumerateObjectsUsingBlock:^(void (^callback)(UIImage*, BOOL), NSUInteger idx, BOOL *stop) {
                        callback(image, NO);
                    }];
                    
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
