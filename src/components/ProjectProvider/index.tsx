import { createContext, Dispatch, ReactNode, useContext, useReducer, useEffect } from 'react';

export type ProjectData = {
  name: string;
  images: ImageData[];
  imageRefs: ImageRef[];
  components: ComponentData[];
  colors?: Color[];
  _imageCache?: ImageCache[];
};

export type ImageCache = {
  imageRefId: number;
  imageId: number;
  data: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImageData = {
  id: number;
  name: string;
  data: string;
  width: number;
  height: number;
};

export type PropData = {
  type: string;
  isOptional: boolean;
};

export type PropsData = {
  [key: string]: PropData;
};

export type ImageRef = {
  id: number;
  imageId: number;
  componentId: number | null;
  componentName: string | null;
  parentComponentId: number | null;
  parentImageRefId: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
  variant?: string;
};

export type ComponentData = {
  id: number;
  name: string;
  category?: string;
  props: PropsData;
};

export type Color = {
  hex: string;
};

export type ProjectContextData = {
  state: ProjectData;
  dispatch: Dispatch<Action>;
  uid: (type: 'image' | 'component' | 'imageRef', componentId?: number) => number;
};

const initialValue: ProjectContextData = {
  state: {
    name: '',
    images: [],
    imageRefs: [],
    components: [],
  },
  dispatch: () => {},
  uid: () => 0,
};

export const ProjectContext = createContext<ProjectContextData>(initialValue);

export const useProjectContext = () => {
  return useContext(ProjectContext);
};

export type ActionAddImage = {
  type: 'addImage';
  data: ImageData;
};

export type ActionRemoveImage = {
  type: 'removeImage';
  data: ImageData;
};

export type ActionAddComponent = {
  type: 'addComponent';
  data: ComponentData;
};

export type ActionCreateComponent = {
  type: 'createComponent';
  imageData: ImageData;
  parentComponentId?: number;
};

export type ActionUpdateComponent = {
  type: 'updateComponent';
  component: ComponentData;
};

export type ActionCreateImageRef = {
  type: 'createImageRef';
  imageData: ImageData;
  componentId: number | null;
  parentComponentId: number | null;
  parentImageRefId: number | null;
};

export type ActionUpdateImageRef = {
  type: 'updateImageRef';
  imageRef: ImageRef;
};

export type ActionBuildComponents = {
  type: 'buildComponents';
};

export type ActionImportProject = {
  type: 'importProject';
  data: ProjectData;
};

export type ActionReset = {
  type: 'reset';
};

export type ActionSaveToImageCache = {
  type: 'saveToImageCache';
  imageRef: ImageRef;
  data: string;
};

export type ActionClearImageCache = {
  type: 'clearImageCache';
};

export type ActionRemoveImageRef = {
  type: 'removeImageRef';
  imageRef: ImageRef;
};

export type ActionAddColor = {
  type: 'addColor';
  color: Color;
};

export type ActionRemoveColor = {
  type: 'removeColor';
  color: Color;
};

export type Action =
  | ActionAddImage
  | ActionRemoveImage
  | ActionAddComponent
  | ActionCreateComponent
  | ActionCreateImageRef
  | ActionUpdateImageRef
  | ActionBuildComponents
  | ActionImportProject
  | ActionReset
  | ActionSaveToImageCache
  | ActionClearImageCache
  | ActionRemoveImageRef
  | ActionUpdateComponent
  | ActionAddColor
  | ActionRemoveColor;

const reducer = (state: ProjectData, action: Action): ProjectData => {
  if (action.type === 'addImage') {
    // remove if already in array
    // TODO: use map instead for updating?
    const images = state.images.filter((image) => image.id !== action.data.id);
    return { ...state, images: [...images, action.data] };
  }
  if (action.type === 'removeImage') {
    const images = state.images.filter((image) => image.id !== action.data.id);
    // TODO: remove all components that use this image?
    return { ...state, images };
  }
  if (action.type === 'addComponent') {
    return { ...state, components: [...state.components, action.data] };
  }
  if (action.type === 'createComponent') {
    return {
      ...state,
      components: [
        ...state.components,
        {
          id: state.components.length,
          name: '',
          props: {},
        },
      ],
    };
  }
  if (action.type === 'updateComponent') {
    const mapped = state.components.map((component) => {
      if (component.id === action.component.id) {
        return action.component;
      }
      return component;
    });
    return { ...state, components: mapped };
  }
  if (action.type === 'createImageRef') {
    return {
      ...state,
      imageRefs: [
        ...state.imageRefs,
        {
          id: state.imageRefs.length,
          imageId: action.imageData.id,
          componentId: action.componentId,
          componentName: null,
          parentComponentId: action.parentComponentId,
          parentImageRefId: action.parentImageRefId,
          x: action.parentImageRefId ? state.imageRefs[action.parentImageRefId].x + 0 : 0,
          y: action.parentImageRefId ? state.imageRefs[action.parentImageRefId].y + 0 : 0,
          // TODO: read image size and calculate percentage for e.g. 50x50px
          width: 0.2,
          height: 0.2,
        },
      ],
    };
  }
  if (action.type === 'updateImageRef') {
    const mapped = state.imageRefs.map((imageRef) => {
      if (imageRef.id === action.imageRef.id) {
        return action.imageRef;
      }
      return imageRef;
    });
    return { ...state, imageRefs: mapped };
  }
  if (action.type === 'buildComponents') {
    const components = state.imageRefs.reduce<{
      components: ComponentData[];
      imageRefs: ImageRef[];
    }>(
      (acc, imageRef) => {
        let components: ComponentData[] = acc.components;
        let component: ComponentData | null = null;
        let imageRefs: ImageRef[] = acc.imageRefs;
        if (imageRef.componentName) {
          // component exists?
          component =
            acc.components.find((component) => component.name === imageRef.componentName) ?? null;

          if (!component) {
            const componentFromState =
              state.components.find((component) => component.name === imageRef.componentName) ??
              null;

            (component = {
              id: components.length,
              name: imageRef.componentName,
              props: componentFromState?.props ?? {},
              category: componentFromState?.category ?? undefined,
            }),
              (components = [...components, component]);
          }
        }

        imageRef.componentId = component?.id ?? null;

        return { components, imageRefs };
      },
      { components: [], imageRefs: [] }
    );

    return { ...state, components: components.components };
  }
  if (action.type === 'importProject') {
    return { ...action.data };
  }
  if (action.type === 'reset') {
    return {
      ...initialValue.state,
    };
  }
  if (action.type === 'saveToImageCache') {
    const exists = state._imageCache?.find((cache) => cache.imageRefId === action.imageRef.id);

    if (exists) {
      const mapped = (state._imageCache ?? []).map((imageCache) => {
        if (imageCache.imageRefId === action.imageRef.id) {
          return {
            imageRefId: action.imageRef.id,
            imageId: action.imageRef.imageId,
            x: action.imageRef.x,
            y: action.imageRef.y,
            width: action.imageRef.width,
            height: action.imageRef.height,
            data: action.data,
          };
        }
        return imageCache;
      });

      return { ...state, _imageCache: mapped };
    }

    return {
      ...state,
      _imageCache: [
        ...(state._imageCache ?? []),
        {
          imageRefId: action.imageRef.id,
          imageId: action.imageRef.imageId,
          x: action.imageRef.x,
          y: action.imageRef.y,
          width: action.imageRef.width,
          height: action.imageRef.height,
          data: action.data,
        },
      ],
    };
  }
  if (action.type === 'clearImageCache') {
    return {
      ...state,
      _imageCache: undefined,
    };
  }
  if (action.type === 'removeImageRef') {
    const imageRefs = state.imageRefs.filter((imageRef) => imageRef.id !== action.imageRef.id);

    return {
      ...state,
      imageRefs,
    };
  }
  if (action.type === 'addColor') {
    const exists = (state.colors ?? []).find((color) => color.hex === action.color.hex);
    if (exists) {
      return state;
    }
    return {
      ...state,
      colors: [...(state.colors ?? []), action.color],
    };
  }
  if (action.type === 'removeColor') {
    const colors = (state.colors ?? []).filter((color) => color.hex !== action.color.hex);
    return {
      ...state,
      colors,
    };
  }

  return state;
};

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialValue.state);

  const uid = (type: 'image' | 'component' | 'imageRef') => {
    if (type === 'image') {
      return state.images.length === 0 ? 0 : Math.max(...state.images.map((data) => data.id)) + 1;
    } else if (type === 'component') {
      return state.components.length === 0
        ? 0
        : Math.max(...state.components.map((data) => data.id)) + 1;
    } else if (type === 'imageRef') {
      return state.imageRefs.length === 0
        ? 0
        : Math.max(...state.imageRefs.map((data) => data.id)) + 1;
    }
    return 0;
  };

  // useEffect(() => {
  //   console.log(state);
  // }, [state]);

  return (
    <ProjectContext.Provider value={{ state, dispatch, uid }}>{children}</ProjectContext.Provider>
  );
};
