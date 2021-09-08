import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
  useState,
  useEffect,
} from 'react';

export type ProjectData = {
  name: string;
  images: ImageData[];
  imageRefs: ImageRef[];
  components: ComponentData[];
};

export type ImageData = {
  id: number;
  name: string;
  data: string;
  width: number;
  height: number;
};

export type PropData = {
  type: 'number' | 'string' | 'boolean' | 'children' | 'componentId';
  isOptional?: boolean;
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

export type ActionAddComponent = {
  type: 'addComponent';
  data: ComponentData;
};

export type ActionCreateComponent = {
  type: 'createComponent';
  imageData: ImageData;
  parentComponentId?: number;
};

export type ActionCreateImageRef = {
  type: 'createImageRef';
  imageData: ImageData;
  componentId: number | null;
  parentComponentId: number | null;
};

export type ActionUpdateImageRef = {
  type: 'updateImageRef';
  imageRef: ImageRef;
};

export type ActionBuildComponents = {
  type: 'buildComponents';
};

export type Action =
  | ActionAddImage
  | ActionAddComponent
  | ActionCreateComponent
  | ActionCreateImageRef
  | ActionUpdateImageRef
  | ActionBuildComponents;

const reducer = (state: ProjectData, action: Action): ProjectData => {
  if (action.type === 'addImage') {
    // remove if already in array
    // TODO: use map instead for updating?
    const images = state.images.filter((image) => image.id !== action.data.id);
    return { ...state, images: [...images, action.data] };
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
          x: 0.1,
          y: 0.1,
          width: 0.3,
          height: 0.1,
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
            (component = {
              id: components.length,
              name: imageRef.componentName,
              props: {},
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
  return state;
};

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialValue.state);

  const uid = (type: 'image' | 'component' | 'imageRef') => {
    if (type === 'image') {
      return state.images.length;
    } else if (type === 'component') {
      return state.components.length;
    } else if (type === 'imageRef') {
      return state.imageRefs.length;
    }
    return 0;
  };

  useEffect(() => {
    console.log(state);
  }, [state]);

  return (
    <ProjectContext.Provider value={{ state, dispatch, uid }}>{children}</ProjectContext.Provider>
  );
};
