#!/bin/bash
origpath='public/images/projects/'
thumbpath='public/images/projects/thumbnails'

if [ ! -d $thumbpath ]; then mkdir $thumbpath; fi;

echo "Copying images."

cp $origpath*.jpg $thumbpath;
cp $origpath*.jpeg $thumbpath;
cp $origpath*.JPG $thumbpath;
cp $origpath*.JPEG $thumbpath;

cd $thumbpath;

mogrify -strip -thumbnail '600x600>' *.jpg;

echo "Images converted."

