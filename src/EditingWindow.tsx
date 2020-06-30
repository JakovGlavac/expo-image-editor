import * as React from 'react';
import { Image, StyleSheet, LayoutRectangle, View } from 'react-native';
import { ImageCropOverlay } from './ImageCropOverlay';

interface EditingWindowProps {
  imageData: {
    uri: string | undefined;
    width: number;
    height: number;
  };
  fixedCropAspectRatio: number;
  lockAspectRatio: boolean;
  imageBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  minimumCropDimensions: {
    width: number;
    height: number;
  };
  onUpdateImageBounds: (bounds: any) => void;
  accumulatedPan: {
    x: number;
    y: number;
  };
  onUpdateAccumulatedPan: (accumulatedPan: any) => void;
  cropSize: {
    width: number;
    height: number;
  };
  onUpdateCropSize: (size: any) => void;
  onUpdatePanAndSize: ({size, accumulatedPan}: { size: any, accumulatedPan: any}) => void;
  isCropping: boolean;
}

function EditingWindow(props: EditingWindowProps) {

  const [state, setState] = React.useState({
    initialisedImageBounds: false,
    imageScaleFactor: null,
    imageLayout: {
      height: null,
      width: null
    }
  });

  const { imageData } = props;

  const getImageFrame = (layout: {width: number, height: number, [key: string]: any}) => {
    onUpdateCropLayout(layout);
  }

  const onUpdateCropLayout = (layout) => {
    console.log('layout: ', layout)
    // Find the start point of the photo on the screen and its
    // width / height from there
    const editingWindowAspectRatio = layout.height / layout.width;
    // 
    const imageAspectRatio = imageData.height / imageData.width;
    let bounds = { x: 0, y: 0, width: 0, height: 0 };
    let imageScaleFactor = 1;
    // Check which is larger 
    if (imageAspectRatio > editingWindowAspectRatio) {
      // Then x is non-zero, y is zero; calculate x...
      bounds.x = (((imageAspectRatio - editingWindowAspectRatio) / (imageAspectRatio)) * layout.width) / 2;
      bounds.width = layout.height / imageAspectRatio;
      bounds.height = layout.height;
      imageScaleFactor = imageData.height / layout.height;
    }
    else {
      // Then y is non-zero, x is zero; calculate y...
      bounds.y = ((1/imageAspectRatio - 1/editingWindowAspectRatio) / (1/imageAspectRatio)) * layout.height / 2;
      bounds.width = layout.width;
      bounds.height = layout.width * imageAspectRatio;
      imageScaleFactor = imageData.width / layout.width;
    }
    props.onUpdateImageBounds({
      imageBounds: bounds,
      imageScaleFactor
    });
    setState({
      ...state, 
      initialisedImageBounds: true, 
      imageScaleFactor,
      imageLayout: {
        height: layout.height,
        width: layout.width
      }
    });
  }

  React.useEffect(() => {
    onUpdateCropLayout(state.imageLayout)
  }, [props.imageData]);

  return(
    <View style={styles.container}>
      <Image style={styles.image}
             source={{ uri: imageData.uri }}
             onLayout={({nativeEvent}) => getImageFrame(nativeEvent.layout)} />
      {
        state.initialisedImageBounds && props.isCropping ?
          <ImageCropOverlay imageBounds={props.imageBounds}
                            fixedAspectRatio={props.fixedCropAspectRatio}
                            lockAspectRatio={props.lockAspectRatio}
                            accumulatedPan={props.accumulatedPan}
                            minimumCropDimensions={props.minimumCropDimensions}
                            onUpdateAccumulatedPan={accumulatedPan => props.onUpdateAccumulatedPan(accumulatedPan)}
                            cropSize={props.cropSize}
                            onUpdateCropSize={size => props.onUpdateCropSize(size)}
                            onUpdatePanAndSize={panAndSize => props.onUpdatePanAndSize(panAndSize)} />
        :
          null
      }
    </View>
  );

}

export { EditingWindow };

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  image: {
    flex: 1,
    resizeMode: 'contain'
  }
})