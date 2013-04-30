//
//  CachedImageLoader.h
//  Catalog
//

#import <Foundation/Foundation.h>

@interface CachedImageLoader : NSObject

// Force the UIImage to actuall load and decompress the data on the background thread, smoother,
// but may use more memory due to dummy render context
@property BOOL forceBackgroundDecompress;

-(void)loadImage:(NSURL*)url onLoad:(void (^)(UIImage* image, BOOL wasCached))callback;
-(void)precacheImage:(NSURL*)url;
-(void)flush;
-(UIImage*)cachedImageForURL:(NSURL*)url;

@end
